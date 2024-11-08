// thermalConstants.ts

export const THERMAL_CONSTANTS = {
  ambient: {
    temperature: 25,    // °C
    maxAllowed: 40     // °C
  },
  wire: {
    // Values for common PVC insulated copper wire
    thermalResistance: {
      '1.5': 3.8,
      '2.5': 3.2,
      '4.0': 2.8,
      '6.0': 2.4,
      '10.0': 2.0,
      '16.0': 1.8
    },
    thermalCapacity: {
      '1.5': 385,
      '2.5': 640,
      '4.0': 1024,
      '6.0': 1536,
      '10.0': 2560,
      '16.0': 4096
    },
    maxTemperature: 70,     // °C - PVC insulation limit
    ratedTemperature: 50    // °C - Normal operating temperature
  },
  breaker: {
    thermalResistance: 2.5,     // °C/W
    thermalCapacity: 850,       // J/°C
    tripTemperature: 60,        // °C
    warningTemperature: 45      // °C
  }
};

export function calculateWireTemperature(
  current: number,
  time: number,
  wireSize: string,
  ambientTemp: number
): number {
  const constants = THERMAL_CONSTANTS.wire;
  const resistance = constants.thermalResistance[wireSize] || constants.thermalResistance['2.5'];
  const capacity = constants.thermalCapacity[wireSize] || constants.thermalCapacity['2.5'];
  
  // Power loss (heating) in the wire
  const powerLoss = Math.pow(current, 2) * resistance;
  
  // Temperature rise calculation using thermal time constant
  const maxTempRise = powerLoss * resistance;
  const thermalTimeConstant = capacity * resistance;
  const tempRise = maxTempRise * (1 - Math.exp(-time / thermalTimeConstant));
  
  return ambientTemp + tempRise;
}

export function calculateBreakerTemperature(
  current: number,
  ratedCurrent: number,
  time: number,
  ambientTemp: number
): number {
  const constants = THERMAL_CONSTANTS.breaker;
  
  // Power loss in the breaker (approximate)
  const powerLoss = Math.pow(current / ratedCurrent, 2) * constants.thermalResistance;
  
  // Temperature rise calculation
  const maxTempRise = powerLoss * constants.thermalResistance;
  const thermalTimeConstant = constants.thermalCapacity * constants.thermalResistance;
  const tempRise = maxTempRise * (1 - Math.exp(-time / thermalTimeConstant));
  
  return ambientTemp + tempRise;
}

export function calculateTripProbability(
  breakerTemp: number,
  current: number,
  ratedCurrent: number
): number {
  const constants = THERMAL_CONSTANTS.breaker;
  
  // Temperature-based probability
  const tempFactor = Math.max(0, (breakerTemp - constants.warningTemperature) /
    (constants.tripTemperature - constants.warningTemperature));
  
  // Current-based probability
  const currentFactor = Math.max(0, (current - ratedCurrent * 0.8) / (ratedCurrent * 0.4));
  
  // Combined probability (weighted average)
  return Math.min(1, (tempFactor * 0.7) + (currentFactor * 0.3));
}

export function getTimeToTrip(
  current: number,
  ratedCurrent: number,
  breakerTemp: number
): number | undefined {
  const constants = THERMAL_CONSTANTS.breaker;
  
  if (breakerTemp >= constants.tripTemperature || current >= ratedCurrent * 1.5) {
    return 0;
  }
  
  if (current <= ratedCurrent) {
    return undefined;
  }
  
  // Simplified calculation based on I²t characteristic
  const thermalCapacity = Math.pow(ratedCurrent, 2) * 3600; // 1-hour at rated current
  const currentHeatGeneration = Math.pow(current, 2);
  const remainingCapacity = thermalCapacity * (1 - (breakerTemp / constants.tripTemperature));
  
  return remainingCapacity / currentHeatGeneration;
}
