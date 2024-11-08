// utils.ts

import { WireSpec, BreakerSpec, Consumer, ApplianceSpec } from './types';

export function calculateThermalLoad(
  current: number,
  time: number,
  thermalTimeConstant: number
): number {
  return current * (1 - Math.exp(-time / thermalTimeConstant));
}

export function checkBreakerTrip(
  current: number,
  duration: number,
  breaker: BreakerSpec,
  ratedCurrent: number
): { 
  willTrip: boolean;
  reason?: 'instantaneous' | 'thermal' | 'inrush';
  timeToTrip?: number;
} {
  if (current > ratedCurrent * breaker.tripCurve.instantaneous) {
    return { willTrip: true, reason: 'instantaneous', timeToTrip: 0 };
  }

  if (duration <= breaker.tripCurve.inrushTolerance.allowedDuration) {
    if (current > ratedCurrent * breaker.tripCurve.inrushTolerance.maxMultiple) {
      return { willTrip: true, reason: 'inrush', timeToTrip: duration };
    }
  }

  if (current > ratedCurrent * breaker.tripCurve.thermal) {
    const timeToTrip = calculateThermalTripTime(current, ratedCurrent, breaker);
    return { willTrip: true, reason: 'thermal', timeToTrip };
  }

  return { willTrip: false };
}

export function calculateThermalTripTime(
  current: number,
  ratedCurrent: number,
  breaker: BreakerSpec
): number {
  const thermalEnergy = Math.pow(current / ratedCurrent, 2);
  return breaker.tripCurve.thermalTime / thermalEnergy;
}

export function validateWireSize(
  wireSize: string,
  wireSizes: Record<string, WireSpec>
): string {
  return wireSizes[wireSize] ? wireSize : '2.5';
}

export function calculateConsumerLoad(
  consumer: Consumer,
  timeMinutes: number
): {
  current: number;
  inrushCurrent: number;
  events: string[];
} {
  const cyclePosition = timeMinutes % consumer.cycleTime;
  const isOn = cyclePosition < (consumer.cycleTime * consumer.duty / 100);
  const isStartup = cyclePosition === 0;

  if (!isOn) {
    return { current: 0, inrushCurrent: 0, events: [] };
  }

  const current = consumer.current;
  const inrushCurrent = isStartup ? current * (consumer.startupMultiplier - 1) : 0;
  const events = isStartup ? [`${consumer.name} startup (${consumer.powerLevel})`] : [];

  return { current, inrushCurrent, events };
}