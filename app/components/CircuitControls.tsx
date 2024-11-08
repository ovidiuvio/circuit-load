// CircuitControls.tsx
import React from 'react';
import { Settings, Shield, Cable } from 'lucide-react';
import { CIRCUIT_BREAKERS, WIRE_SIZES } from './circuitData';
import type { BreakerSpec, WireSpec } from './types';

interface CircuitControlsProps {
  circuitBreaker: string;
  breakerType: string;
  wireSize: string;
  onCircuitBreakerChange: (value: string) => void;
  onBreakerTypeChange: (value: string) => void;
  onWireSizeChange: (value: string) => void;
}

const CircuitControls: React.FC<CircuitControlsProps> = ({
  circuitBreaker,
  breakerType,
  wireSize,
  onCircuitBreakerChange,
  onBreakerTypeChange,
  onWireSizeChange
}) => {
  // Get current specifications
  const currentBreaker: BreakerSpec = CIRCUIT_BREAKERS[breakerType];
  const currentWire: WireSpec = WIRE_SIZES[wireSize];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center space-x-2">
        <Settings className="text-blue-500" />
        <span>Circuit Configuration</span>
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Circuit Breaker Rating */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Circuit Breaker Rating
          </label>
          <select 
            value={circuitBreaker}
            onChange={(e) => onCircuitBreakerChange(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[6, 10, 16, 20, 25, 32, 40, 50, 63].map(amp => (
              <option key={amp} value={amp}>{amp}A</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Maximum continuous current rating
          </p>
        </div>
        
        {/* Breaker Type Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Breaker Type
          </label>
          <select 
            value={breakerType}
            onChange={(e) => onBreakerTypeChange(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(CIRCUIT_BREAKERS).map(([type, spec]) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {currentBreaker?.description || 'Select breaker type'}
          </p>
        </div>
        
        {/* Wire Size Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium flex items-center gap-1">
            <Cable className="h-4 w-4" />
            Wire Size
          </label>
          <select 
            value={wireSize}
            onChange={(e) => onWireSizeChange(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(WIRE_SIZES).map(([size, spec]) => (
              <option key={size} value={size}>{size}mm²</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {currentWire?.description || 'Select wire size'}
          </p>
        </div>
      </div>

      {/* Specifications Panel */}
      {currentBreaker && (
        <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Breaker Specifications */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Breaker Characteristics</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-600">Instant Trip:</span>
              <span>{currentBreaker.tripCurve.instantaneous}x rated current</span>
              <span className="text-gray-600">Thermal Trip:</span>
              <span>{currentBreaker.tripCurve.thermal}x rated current</span>
              <span className="text-gray-600">Trip Time:</span>
              <span>{currentBreaker.tripCurve.thermalTime / 60} minutes</span>
              <span className="text-gray-600">Harmonic Sensitive:</span>
              <span>{currentBreaker.characteristics.harmonicSensitive ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Wire Specifications */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Wire Specifications</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-600">Continuous Rating:</span>
              <span>{currentWire.maxContinuous}A</span>
              <span className="text-gray-600">Short Term Rating:</span>
              <span>{currentWire.maxShortTerm}A</span>
              <span className="text-gray-600">Thermal Time Constant:</span>
              <span>{currentWire.thermalTimeConstant} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Compatibility Warning */}
      {currentBreaker && currentWire && currentWire.maxContinuous < Number(circuitBreaker) && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Warning: Wire size may be insufficient for the selected circuit breaker rating
          </p>
        </div>
      )}
    </div>
  );
};

export default CircuitControls;