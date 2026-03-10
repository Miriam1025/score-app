// Default recipe values from RECIPE.md

export const RECIPE_DEFAULTS = {
  stage1: {
    starter: 50,
    water: 50,
    flour: 50,
  },
  stage2: {
    water: 350,
    starter: 50,
    flour: 500,
    salt: 15,
  },
}

export const STAGES = [
  {
    id: 'stage1',
    number: 1,
    name: 'Starter Build',
    duration: 'Overnight',
    instructions: [
      { action: 'ADD', text: 'starter, water, and flour to a clean jar' },
      { action: 'STIR', text: 'water until no clumps' },
      { action: 'STIR', text: 'flour until no dry spots' },
      { action: 'COVER', text: 'top loosely' },
      { action: 'LEAVE', text: 'somewhere warm overnight' },
    ],
    measurements: ['starter', 'water', 'flour'],
    hasWaterTemp: true,
    target: '2-3x rise by morning',
    timerLabel: null,
  },
  {
    id: 'stage2',
    number: 2,
    name: 'Mix Dough',
    duration: '5-8+ hrs',
    instructions: [
      { action: 'ADD', text: 'water to bowl' },
      { action: 'ADD', text: 'starter' },
      { action: 'WHISK', text: 'until foamy & no clumps' },
      { action: 'ADD', text: 'flour' },
      { action: 'MIX', text: 'until no dry clumps' },
      { action: 'ADD', text: 'salt' },
      { action: 'MIX', text: 'again' },
      { action: 'COVER', text: '& let rest', time: '30 min' },
    ],
    measurements: ['water', 'starter', 'flour', 'salt'],
    hasWaterTemp: true,
    stretchFold: {
      interval: 30, // minutes
      duration: '2-3 hours',
    },
    bulkFermentation: {
      duration: '2-5+ hours',
    },
    finalSteps: [
      { action: 'SHAPE', text: 'the dough' },
      { action: 'PUT', text: 'in a banneton bowl' },
      { action: 'COVER', text: 'with plastic wrap' },
    ],
    target: 'Dough approximately doubled',
    timerLabel: 'Stretch & Fold reminders',
  },
  {
    id: 'stage3',
    number: 3,
    name: 'Cold Proof',
    duration: '6-48 hrs',
    instructions: [
      { action: 'PUT', text: 'in the fridge' },
    ],
    measurements: [],
    hasWaterTemp: false,
    target: 'Longer cold proof = more sour flavor',
    timerLabel: 'Cold proof reminder',
  },
  {
    id: 'stage4',
    number: 4,
    name: 'Bake',
    duration: '~2 hrs',
    sections: [
      {
        name: 'Preheat',
        instructions: [
          { action: 'PREHEAT', text: 'Dutch oven to 450°F', time: '1 hour' },
        ],
      },
      {
        name: 'Covered Bake',
        instructions: [
          { action: 'PUT', text: 'dough on parchment paper' },
          { action: 'SCORE', text: 'the top' },
          { action: 'BAKE', text: 'at 450°F', time: '35 min' },
        ],
      },
      {
        name: 'Uncovered Bake',
        instructions: [
          { action: 'TAKE', text: 'the lid off' },
          { action: 'TURN', text: 'oven down to 400°F' },
          { action: 'BAKE', text: 'until golden', time: '15 min' },
        ],
      },
    ],
    measurements: [],
    hasWaterTemp: false,
    timerLabel: 'Bake timers',
  },
  {
    id: 'stage5',
    number: 5,
    name: 'Rest & Record',
    duration: '~2 hrs',
    instructions: [
      { action: 'WAIT', text: 'to cut (best practice)', time: '~2 hours' },
    ],
    measurements: [],
    hasWaterTemp: false,
    target: 'Cutting too early releases steam and affects texture',
    timerLabel: null,
    hasOutcome: true,
  },
]

export const OUTCOME_OPTIONS = {
  ovenSpring: ['poor', 'moderate', 'good', 'excellent'],
  crustColor: ['pale', 'golden', 'dark'],
  crumbStructure: ['tight', 'moderate', 'open'],
}

export const VOLUME_ASSESSMENTS = [
  { value: 'not_ready', label: 'Not ready' },
  { value: 'almost', label: 'Almost there' },
  { value: 'target', label: 'Doubled (target)' },
  { value: 'past_peak', label: 'Past peak' },
]
