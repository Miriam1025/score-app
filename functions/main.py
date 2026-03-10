"""
Score - Cloud Functions (Python)

Three functions triggered by Firebase events:
1. extract_metadata - Reads EXIF data from uploaded photos
2. fetch_weather - Gets weather data from Open-Meteo API
3. analyze_volume - Uses Cloud Vision API to estimate fill level
"""

import io
import json
import datetime
import requests as http_requests

from firebase_functions import storage_fn, firestore_fn, options
from firebase_admin import initialize_app, firestore, storage
from google.cloud import vision

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

# Initialize Firebase Admin
initialize_app()


# ─── Helper: Extract GPS coordinates from EXIF ───
def _get_exif_data(image_bytes):
    """Extract EXIF data from image bytes, return dict of useful fields."""
    result = {
        "takenAt": None,
        "latitude": None,
        "longitude": None,
        "deviceModel": None,
    }

    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif()
        if not exif_data:
            return result

        # Build readable EXIF dict
        exif = {}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            exif[tag] = value

        # Device model
        result["deviceModel"] = exif.get("Model") or exif.get("Make")

        # Date/time
        date_str = exif.get("DateTimeOriginal") or exif.get("DateTime")
        if date_str:
            try:
                dt = datetime.datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
                result["takenAt"] = dt.isoformat()
            except ValueError:
                pass

        # GPS coordinates
        gps_info = exif.get("GPSInfo")
        if gps_info:
            gps_data = {}
            for key, val in gps_info.items():
                decoded = GPSTAGS.get(key, key)
                gps_data[decoded] = val

            def _convert_to_degrees(value):
                """Convert GPS coordinate tuple to decimal degrees."""
                d = float(value[0])
                m = float(value[1])
                s = float(value[2])
                return d + (m / 60.0) + (s / 3600.0)

            if "GPSLatitude" in gps_data and "GPSLatitudeRef" in gps_data:
                lat = _convert_to_degrees(gps_data["GPSLatitude"])
                if gps_data["GPSLatitudeRef"] == "S":
                    lat = -lat
                result["latitude"] = round(lat, 6)

            if "GPSLongitude" in gps_data and "GPSLongitudeRef" in gps_data:
                lng = _convert_to_degrees(gps_data["GPSLongitude"])
                if gps_data["GPSLongitudeRef"] == "W":
                    lng = -lng
                result["longitude"] = round(lng, 6)

    except Exception as e:
        print(f"EXIF extraction error: {e}")

    return result


# ─── Function 1: Extract Metadata ───
@storage_fn.on_object_finalized()
def extract_metadata(event: storage_fn.CloudEvent):
    """
    Triggered when a file is uploaded to Firebase Storage.
    Reads EXIF data (timestamp, GPS) and updates the Firestore photo document.
    """
    file_path = event.data.name  # e.g., users/{uid}/bakes/{bakeId}/photos/{photoId}.jpg
    bucket_name = event.data.bucket

    # Only process photos
    if not file_path or "/photos/" not in file_path:
        print(f"Skipping non-photo file: {file_path}")
        return

    # Parse path: users/{userId}/bakes/{bakeId}/photos/{photoId}.jpg
    parts = file_path.split("/")
    if len(parts) < 6:
        print(f"Unexpected path format: {file_path}")
        return

    user_id = parts[1]
    bake_id = parts[3]
    photo_filename = parts[5]
    photo_id = photo_filename.rsplit(".", 1)[0]  # Remove extension

    print(f"Processing photo: user={user_id}, bake={bake_id}, photo={photo_id}")

    try:
        # Download image from Storage
        bucket = storage.bucket(bucket_name)
        blob = bucket.blob(file_path)
        image_bytes = blob.download_as_bytes()

        # Extract EXIF
        exif_data = _get_exif_data(image_bytes)
        print(f"EXIF data: {json.dumps(exif_data)}")

        # Update Firestore photo document
        db = firestore.client()
        photo_ref = (
            db.collection("users")
            .document(user_id)
            .collection("bakes")
            .document(bake_id)
            .collection("photos")
            .document(photo_id)
        )

        update_data = {
            "metadata.takenAt": exif_data["takenAt"],
            "metadata.latitude": exif_data["latitude"],
            "metadata.longitude": exif_data["longitude"],
            "metadata.deviceModel": exif_data["deviceModel"],
        }

        photo_ref.update(update_data)
        print(f"Updated photo document with metadata")

        # If we have GPS coordinates, the fetch_weather function will be
        # triggered by the Firestore update

    except Exception as e:
        print(f"Error processing {file_path}: {e}")


# ─── Function 2: Fetch Weather ───
@firestore_fn.on_document_updated(
    document="users/{userId}/bakes/{bakeId}/photos/{photoId}"
)
def fetch_weather(event: firestore_fn.Event):
    """
    Triggered when a photo document is updated in Firestore.
    If metadata has lat/lng and no weather data yet, fetches weather from Open-Meteo.
    """
    # Get the updated document data
    after = event.data.after.to_dict() if event.data.after else None
    before = event.data.before.to_dict() if event.data.before else None

    if not after:
        return

    metadata = after.get("metadata", {})
    lat = metadata.get("latitude")
    lng = metadata.get("longitude")
    taken_at = metadata.get("takenAt")

    # Skip if no GPS data or weather already fetched
    if not lat or not lng:
        print("No GPS coordinates, skipping weather fetch")
        return

    if after.get("weather") is not None:
        print("Weather already fetched, skipping")
        return

    # Check that metadata was actually updated (not just any field change)
    before_meta = (before or {}).get("metadata", {})
    if before_meta.get("latitude") == lat and before_meta.get("longitude") == lng:
        # Metadata didn't change, might be a different update — check if weather exists
        if before and before.get("weather") is not None:
            print("Weather exists and metadata unchanged, skipping")
            return

    print(f"Fetching weather for lat={lat}, lng={lng}, time={taken_at}")

    try:
        # Determine the date for the weather query
        if taken_at:
            try:
                dt = datetime.datetime.fromisoformat(taken_at)
                date_str = dt.strftime("%Y-%m-%d")
                hour = dt.hour
            except ValueError:
                date_str = datetime.date.today().isoformat()
                hour = 12
        else:
            date_str = datetime.date.today().isoformat()
            hour = 12

        # Call Open-Meteo API (free, no key needed)
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lng}"
            f"&hourly=temperature_2m,relative_humidity_2m,surface_pressure,weather_code"
            f"&temperature_unit=fahrenheit"
            f"&start_date={date_str}&end_date={date_str}"
            f"&timezone=auto"
        )

        response = http_requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        hourly = data.get("hourly", {})
        temps = hourly.get("temperature_2m", [])
        humidity = hourly.get("relative_humidity_2m", [])
        pressure = hourly.get("surface_pressure", [])
        weather_codes = hourly.get("weather_code", [])

        # Get values for the closest hour
        idx = min(hour, len(temps) - 1) if temps else 0

        # Map weather code to conditions
        weather_code = weather_codes[idx] if idx < len(weather_codes) else 0
        conditions_map = {
            0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
            45: "foggy", 48: "foggy", 51: "light drizzle", 53: "drizzle",
            55: "heavy drizzle", 61: "light rain", 63: "rain", 65: "heavy rain",
            71: "light snow", 73: "snow", 75: "heavy snow", 80: "rain showers",
            95: "thunderstorm",
        }

        weather_data = {
            "temperature": round(temps[idx], 1) if idx < len(temps) else None,
            "humidity": round(humidity[idx], 1) if idx < len(humidity) else None,
            "pressure": round(pressure[idx], 1) if idx < len(pressure) else None,
            "conditions": conditions_map.get(weather_code, "unknown"),
            "fetchedAt": firestore.SERVER_TIMESTAMP,
        }

        print(f"Weather data: temp={weather_data['temperature']}°F, "
              f"humidity={weather_data['humidity']}%, "
              f"conditions={weather_data['conditions']}")

        # Get path params from event
        params = event.params
        user_id = params["userId"]
        bake_id = params["bakeId"]
        photo_id = params["photoId"]

        # Update photo document with weather
        db = firestore.client()
        photo_ref = (
            db.collection("users")
            .document(user_id)
            .collection("bakes")
            .document(bake_id)
            .collection("photos")
            .document(photo_id)
        )
        photo_ref.update({"weather": weather_data})

        # Also update the stage's environment data
        stage_id = after.get("stageId")
        if stage_id:
            stage_ref = (
                db.collection("users")
                .document(user_id)
                .collection("bakes")
                .document(bake_id)
                .collection("stages")
                .document(stage_id)
            )
            stage_ref.update({
                "environment.outdoorTemp": weather_data["temperature"],
                "environment.humidity": weather_data["humidity"],
                "environment.pressure": weather_data["pressure"],
                "environment.location": {
                    "lat": lat,
                    "lng": lng,
                    "city": None,
                    "region": None,
                },
            })

        print("Weather data saved successfully")

    except Exception as e:
        print(f"Error fetching weather: {e}")


# ─── Function 3: Analyze Volume ───
@storage_fn.on_object_finalized()
def analyze_volume(event: storage_fn.CloudEvent):
    """
    Triggered when a file is uploaded to Firebase Storage.
    Uses Cloud Vision API to analyze the image for fill level estimation.
    """
    file_path = event.data.name
    bucket_name = event.data.bucket

    # Only process photos
    if not file_path or "/photos/" not in file_path:
        return

    # Parse path
    parts = file_path.split("/")
    if len(parts) < 6:
        return

    user_id = parts[1]
    bake_id = parts[3]
    photo_filename = parts[5]
    photo_id = photo_filename.rsplit(".", 1)[0]

    print(f"Analyzing volume for photo: {photo_id}")

    try:
        # Create Vision API client
        client = vision.ImageAnnotatorClient()

        # Reference the image in GCS
        gcs_uri = f"gs://{bucket_name}/{file_path}"
        image = vision.Image(source=vision.ImageSource(gcs_image_uri=gcs_uri))

        # Run object detection
        response = client.object_localization(image=image)
        objects = response.localized_object_annotations

        # Run label detection for more context
        label_response = client.label_detection(image=image)
        labels = label_response.label_annotations

        # Analyze results
        label_descriptions = [l.description.lower() for l in labels]
        object_names = [o.name.lower() for o in objects]

        print(f"Labels: {label_descriptions[:10]}")
        print(f"Objects: {object_names}")

        # Estimate fill level and bubble activity based on labels
        fill_level = None
        bubble_activity = "low"
        confidence = 0.5

        # Look for relevant labels
        dough_related = ["dough", "bread", "sourdough", "batter", "flour", "food"]
        container_related = ["jar", "bowl", "container", "glass", "cup"]
        bubble_related = ["bubble", "foam", "frothy", "aerated"]

        has_dough = any(d in label_descriptions for d in dough_related)
        has_container = any(c in label_descriptions for c in container_related)
        has_bubbles = any(b in label_descriptions for b in bubble_related)

        if has_dough and has_container:
            # Basic fill level estimation based on object detection
            # (This is a rough estimate — custom model would be better)
            fill_level = 50  # Default mid-level
            confidence = 0.4

            if has_bubbles:
                bubble_activity = "high"
                fill_level = 70
                confidence = 0.5
        elif has_dough:
            fill_level = 60
            confidence = 0.3
            bubble_activity = "moderate"

        analysis_data = {
            "fillLevel": fill_level,
            "bubbleActivity": bubble_activity,
            "confidence": round(confidence, 2),
            "labels": label_descriptions[:10],
            "objects": object_names[:5],
            "analyzedAt": firestore.SERVER_TIMESTAMP,
        }

        print(f"Analysis: fill={fill_level}%, bubbles={bubble_activity}, "
              f"confidence={confidence}")

        # Update Firestore
        db = firestore.client()
        photo_ref = (
            db.collection("users")
            .document(user_id)
            .collection("bakes")
            .document(bake_id)
            .collection("photos")
            .document(photo_id)
        )
        photo_ref.update({"analysis": analysis_data})
        print("Volume analysis saved")

    except Exception as e:
        print(f"Error analyzing volume: {e}")
