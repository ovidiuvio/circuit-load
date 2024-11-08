// types.ts

export interface Consumer {
  name: string;
  current: number;
  duty: number;
  startupMultiplier: number;
  cycleTime: number;
  powerLevel: string;
  operatingMode: string;
}

export interface ThermalAnalysisPoint {
  time: number;
  current: number;
  instantCurrent: number;
  maxBreaker: number;
  instantBreaker: number;
  thermalBreaker: number;
  maxWireContinuous: number;
  maxWireShortTerm: number;
  temperature: {
    wire: number;
    ambient: number;
    breaker: number;
    maxWireTemp: number;
    maxBreakerTemp: number;
  };
  breakerStatus: {
    thermalLoad: number;      // Percentage of thermal capacity used
    magneticLoad: number;     // Percentage of magnetic trip threshold
    tripProbability: number;  // Probability of trip (0-1)
    timeToTrip?: number;      // Time until predicted trip in seconds
    status: 'normal' | 'warning' | 'critical';
  };
  events: Array<{
    type: 'inrush' | 'thermal' | 'breaker' | 'temperature' | 'info';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    details?: string;
  }>;
  riskLevel: 'safe' | 'warning' | 'critical';
}

export interface ThermalConstants {
  ambient: {
    temperature: number;
    maxAllowed: number;
  };
  wire: {
    thermalResistance: number;    // °C/W
    thermalCapacity: number;      // J/°C
    maxTemperature: number;       // °C
    ratedTemperature: number;     // °C
  };
  breaker: {
    thermalResistance: number;    // °C/W
    thermalCapacity: number;      // J/°C
    tripTemperature: number;      // °C
    warningTemperature: number;   // °C
  };
}

export interface Assessment {
  safe: boolean;
  issues: string[];
  maxInstantCurrent: number;
  maxThermalLoad: number;
}

export interface ApplianceSpec {
  current: { 
    min: number;
    max: number;
    typical: number;
    inrush: number;
    inrushDuration: number;
  };
  duty: {
    cycle: number;
    typical: number;
    peak: number;
  };
  startupMultiplier: number;
  cycleTime: number;
  powerLevels: string[];
  operatingModes: {
    name: string;
    currentMultiplier: number;
    dutyMultiplier: number;
  }[];
  description?: string;
}

export interface WireSpec {
  maxContinuous: number;
  maxShortTerm: number;
  thermalTimeConstant: number;
  description: string;
}

export interface BreakerSpec {
  type: string;
  tripCurve: {
    instantaneous: number;
    thermal: number;
    thermalTime: number;
    inrushTolerance: {
      maxMultiple: number;
      allowedDuration: number;
    };
  };
  characteristics: {
    thermalMemory: boolean;
    harmonicSensitive: boolean;
    selectivity: string;
  };
  description: string;
}