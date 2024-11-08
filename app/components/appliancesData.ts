// appliancesData.ts

export interface ApplianceSpec {
  current: { 
    min: number;
    max: number;
    typical: number;    // Typical continuous usage current
    inrush: number;     // Peak inrush current multiple of rated current
    inrushDuration: number; // Duration of inrush in milliseconds
  };
  duty: {
    cycle: number;      // Base duty cycle percentage
    typical: number;    // Typical usage duty cycle
    peak: number;       // Peak usage duty cycle
  };
  startupMultiplier: number;
  cycleTime: number;    // Minutes
  powerLevels: string[];
  operatingModes: {
    name: string;
    currentMultiplier: number;
    dutyMultiplier: number;
  }[];
  description?: string;
}

export interface AppliancesDatabase {
  [key: string]: ApplianceSpec;
}

export const APPLIANCES: AppliancesDatabase = {
  // High-power cooking appliances
  'Induction Hob': {
    current: {
      min: 5,
      max: 32,
      typical: 16,
      inrush: 1.2,     // Low inrush due to soft start
      inrushDuration: 100
    },
    duty: {
      cycle: 70,
      typical: 50,     // Average cooking usage
      peak: 90         // High-power cooking
    },
    startupMultiplier: 1.2,
    cycleTime: 30,
    powerLevels: ['Low (5A)', 'Medium (16A)', 'High (32A)'],
    operatingModes: [
      { name: 'Keep Warm', currentMultiplier: 0.2, dutyMultiplier: 0.3 },
      { name: 'Simmer', currentMultiplier: 0.4, dutyMultiplier: 0.6 },
      { name: 'Normal Cooking', currentMultiplier: 0.7, dutyMultiplier: 1.0 },
      { name: 'High Power', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'Modern electric cooktop using magnetic induction'
  },

  'Electric Oven': {
    current: {
      min: 8,
      max: 16,
      typical: 12,
      inrush: 1.5,
      inrushDuration: 200
    },
    duty: {
      cycle: 70,
      typical: 60,
      peak: 100
    },
    startupMultiplier: 1.5,
    cycleTime: 60,
    powerLevels: ['Low (8A)', 'Medium (12A)', 'High (16A)'],
    operatingModes: [
      { name: 'Light Baking', currentMultiplier: 0.5, dutyMultiplier: 0.5 },
      { name: 'Normal Baking', currentMultiplier: 0.75, dutyMultiplier: 0.7 },
      { name: 'High Temperature', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'Standard electric oven'
  },

  // Motor-driven appliances (high inrush)
  'Washing Machine': {
    current: {
      min: 6,
      max: 10,
      typical: 8,
      inrush: 6.0,      // High inrush due to motor startup
      inrushDuration: 300
    },
    duty: {
      cycle: 60,
      typical: 40,
      peak: 80
    },
    startupMultiplier: 3.0,
    cycleTime: 120,
    powerLevels: ['Eco (6A)', 'Normal (8A)', 'Intensive (10A)'],
    operatingModes: [
      { name: 'Eco Wash', currentMultiplier: 0.6, dutyMultiplier: 0.5 },
      { name: 'Quick Wash', currentMultiplier: 0.8, dutyMultiplier: 0.8 },
      { name: 'Heavy Duty', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'Standard washing machine'
  },

  'Air Conditioner': {
    current: {
      min: 6,
      max: 12,
      typical: 9,
      inrush: 8.0,      // Very high inrush due to compressor
      inrushDuration: 500
    },
    duty: {
      cycle: 80,
      typical: 60,
      peak: 100
    },
    startupMultiplier: 4.0,
    cycleTime: 30,
    powerLevels: ['Low Cool (6A)', 'Medium Cool (9A)', 'High Cool (12A)'],
    operatingModes: [
      { name: 'Energy Saver', currentMultiplier: 0.5, dutyMultiplier: 0.4 },
      { name: 'Normal Cooling', currentMultiplier: 0.75, dutyMultiplier: 0.6 },
      { name: 'Maximum Cooling', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'Split system air conditioner'
  },

  'Heat Pump Dryer': {
    current: {
      min: 2,
      max: 8,
      typical: 4,
      inrush: 4.0,      // Lower inrush than traditional dryers due to inverter technology
      inrushDuration: 200
    },
    duty: {
      cycle: 90,        // High duty cycle as compressor runs continuously
      typical: 85,      // Typically runs for most of the cycle
      peak: 100        // Full power during initial heating
    },
    startupMultiplier: 2.0,
    cycleTime: 180,    // 3-hour typical cycle
    powerLevels: [
      'Eco (2A)',
      'Normal (4A)',
      'Express (6A)',
      'Heavy Duty (8A)'
    ],
    operatingModes: [
      {
        name: 'Eco Mode',
        currentMultiplier: 0.5,  // 50% of rated power
        dutyMultiplier: 1.2      // Longer cycle time
      },
      {
        name: 'Normal',
        currentMultiplier: 1.0,
        dutyMultiplier: 1.0
      },
      {
        name: 'Express',
        currentMultiplier: 1.5,   // Higher power for faster drying
        dutyMultiplier: 0.7       // Shorter cycle time
      },
      {
        name: 'Heavy Duty',
        currentMultiplier: 2.0,    // Maximum power
        dutyMultiplier: 1.1        // Slightly longer for thorough drying
      },
      {
        name: 'Air Refresh',
        currentMultiplier: 0.3,    // Minimal power use
        dutyMultiplier: 0.5        // Short cycle
      },
      {
        name: 'Low Heat Delicate',
        currentMultiplier: 0.6,
        dutyMultiplier: 0.9
      }
    ],
    description: 'Energy-efficient heat pump clothes dryer with inverter-driven compressor',
    
    // Additional heat pump specific characteristics
    components: {
      compressor: {
        power: 0.8,     // Fraction of total power
        startDelay: 30, // Seconds delay after fan start
        minRuntime: 600 // Minimum runtime in seconds
      },
      fan: {
        power: 0.1,     // Fraction of total power
        startupSequence: 'immediate'
      },
      controls: {
        power: 0.1      // Fraction of total power
      }
    },
    
    operatingPhases: [
      {
        name: 'Initial Heating',
        duration: 15,   // minutes
        powerUsage: 1.0 // fraction of rated power
      },
      {
        name: 'Main Drying',
        duration: 120,  // minutes
        powerUsage: 0.8 // fraction of rated power
      },
      {
        name: 'Cool Down',
        duration: 15,   // minutes
        powerUsage: 0.3 // fraction of rated power
      }
    ],
    
    powerManagement: {
      softStart: true,
      variableFrequency: true,
      powerFactorCorrection: true,
      standbyPower: 0.5, // Watts
      energyEfficiencyRating: 'A+++',
      annualConsumption: {
        kwh: 176,
        cycles: 160
      }
    },
    
    loadCharacteristics: {
      maxLoad: 8,       // kg
      loadSensing: true,
      adaptiveCycle: true,
      moistureSensing: true
    }
  },

  // Heating elements (high continuous current)
  'Electric Kettle': {
    current: {
      min: 8,
      max: 13,
      typical: 10,
      inrush: 1.1,      // Low inrush (resistive load)
      inrushDuration: 50
    },
    duty: {
      cycle: 100,
      typical: 100,
      peak: 100
    },
    startupMultiplier: 1.1,
    cycleTime: 3,
    powerLevels: ['Low (8A)', 'Medium (10A)', 'High (13A)'],
    operatingModes: [
      { name: 'Keep Warm', currentMultiplier: 0.3, dutyMultiplier: 0.2 },
      { name: 'Normal Boil', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'Electric water kettle'
  },

  // Electronic devices (sensitive to power quality)
  'Gaming PC': {
    current: {
      min: 2,
      max: 6,
      typical: 3.5,
      inrush: 2.0,
      inrushDuration: 100
    },
    duty: {
      cycle: 80,
      typical: 60,
      peak: 100
    },
    startupMultiplier: 1.5,
    cycleTime: 240,
    powerLevels: ['Idle (2A)', 'Gaming (4A)', 'Full Load (6A)'],
    operatingModes: [
      { name: 'Sleep', currentMultiplier: 0.1, dutyMultiplier: 0.1 },
      { name: 'Office Work', currentMultiplier: 0.4, dutyMultiplier: 0.6 },
      { name: 'Gaming', currentMultiplier: 0.8, dutyMultiplier: 1.0 },
      { name: 'Heavy Rendering', currentMultiplier: 1.0, dutyMultiplier: 1.0 }
    ],
    description: 'High-performance gaming computer'
  },

  'Refrigerator': {
    current: {
      min: 1,
      max: 3,
      typical: 1.5,
      inrush: 5.0,      // High inrush due to compressor
      inrushDuration: 400
    },
    duty: {
      cycle: 30,
      typical: 25,
      peak: 40
    },
    startupMultiplier: 3.0,
    cycleTime: 20,
    powerLevels: ['Eco (1A)', 'Normal (1.5A)', 'Max Cool (3A)'],
    operatingModes: [
      { name: 'Night Mode', currentMultiplier: 0.6, dutyMultiplier: 0.4 },
      { name: 'Normal', currentMultiplier: 1.0, dutyMultiplier: 1.0 },
      { name: 'Quick Cool', currentMultiplier: 1.0, dutyMultiplier: 1.5 }
    ],
    description: 'Modern refrigerator with inverter compressor'
  }
};