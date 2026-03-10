#!/bin/bash

# Sourdough Tracker - Frontend Setup Script
# Run this from the frontend/ directory

echo "Installing dependencies..."
npm install

echo "Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo "Installing PWA plugin..."
npm install -D vite-plugin-pwa

echo "Setup complete! Run 'npm run dev' to start the development server."
