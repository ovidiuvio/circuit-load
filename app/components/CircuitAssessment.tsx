// CircuitAssessment.tsx
import React from 'react';
import { CheckCircle, AlertTriangle, Info, Zap, Activity, Thermometer, Shield, ArrowRight } from 'lucide-react';
import { BreakerSpec } from './types';

interface CircuitAssessmentProps {
  assessment: {
    safe: boolean;
    issues: string[];
    maxInstantCurrent: number;
    maxThermalLoad: number;
  };
  breakerType: string;
  circuitBreaker: string;
  showDetails: boolean;
  onToggleDetails: () => void;
  breaker: BreakerSpec;
}

const CircuitAssessment: React.FC<CircuitAssessmentProps> = ({
  assessment,
  breakerType,
  circuitBreaker,
  showDetails,
  onToggleDetails,
  breaker
}) => {
  const getLoadBarColor = (ratio: number): string => {
    if (ratio >= 1) return 'bg-red-500';
    if (ratio >= 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLoadTextColor = (ratio: number): string => {
    if (ratio >= 1) return 'text-red-700';
    if (ratio >= 0.8) return 'text-yellow-700';
    return 'text-green-700';
  };

  const formatCurrent = (value: number): string => value.toFixed(1) + 'A';

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-3">
          {assessment.safe ? (
            <CheckCircle className="text-green-500 h-8 w-8" />
          ) : (
            <AlertTriangle className="text-red-500 h-8 w-8" />
          )}
          <div>
            <h3 className="text-lg font-medium">
              Circuit Status: {assessment.safe ? 'Safe' : 'Warning'}
            </h3>
            <p className="text-sm text-gray-500">
              {assessment.safe 
                ? 'All parameters within safe operating limits'
                : 'Circuit parameters exceed recommended limits'}
            </p>
          </div>
        </div>
        <button 
          onClick={onToggleDetails}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Critical Issues */}
      {assessment.issues.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-2">
          <h4 className="font-medium text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Circuit Protection Issues
          </h4>
          {assessment.issues.map((issue, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-700 text-sm">
              <Info size={16} />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {showDetails && (
        <div className="space-y-4">
          {/* Current Analysis Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Instantaneous Current Analysis */}
            <div className="p-4 bg-white rounded-lg border space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="text-amber-500" />
                Instantaneous Current Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Peak Current Draw</span>
                    <span className={getLoadTextColor(assessment.maxInstantCurrent / Number(circuitBreaker))}>
                      {formatCurrent(assessment.maxInstantCurrent)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getLoadBarColor(assessment.maxInstantCurrent / Number(circuitBreaker))}`}
                      style={{ width: `${Math.min((assessment.maxInstantCurrent / Number(circuitBreaker)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0A</span>
                    <span>{formatCurrent(Number(circuitBreaker))}</span>
                  </div>
                </div>

                {/* Inrush Protection */}
                <div className="bg-gray-50 p-3 rounded-md space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-600">Inrush Protection Level: </span>
                    <span className="font-medium">
                      {formatCurrent(breaker.tripCurve.inrushTolerance.maxMultiple * Number(circuitBreaker))}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Max Duration: {breaker.tripCurve.inrushTolerance.allowedDuration}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Thermal Load Analysis */}
            <div className="p-4 bg-white rounded-lg border space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Thermometer className="text-red-500" />
                Thermal Load Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Maximum Thermal Load</span>
                    <span className={getLoadTextColor(assessment.maxThermalLoad / Number(circuitBreaker))}>
                      {formatCurrent(assessment.maxThermalLoad)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getLoadBarColor(assessment.maxThermalLoad / Number(circuitBreaker))}`}
                      style={{ width: `${Math.min((assessment.maxThermalLoad / Number(circuitBreaker)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0A</span>
                    <span>{formatCurrent(Number(circuitBreaker))}</span>
                  </div>
                </div>

                {/* Thermal Trip Settings */}
                <div className="bg-gray-50 p-3 rounded-md space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-600">Thermal Trip Level: </span>
                    <span className="font-medium">
                      {formatCurrent(breaker.tripCurve.thermal * Number(circuitBreaker))}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Trip Time: {(breaker.tripCurve.thermalTime / 60).toFixed(1)} minutes at limit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Circuit Breaker Characteristics */}
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Shield className="text-blue-500" />
              Circuit Breaker Characteristics ({breakerType})
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {/* Trip Curve */}
              <div>
                <h5 className="text-sm font-medium mb-2">Trip Characteristics</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rated Current:</span>
                    <span>{formatCurrent(Number(circuitBreaker))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instant Trip:</span>
                    <span>{breaker.tripCurve.instantaneous}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thermal Trip:</span>
                    <span>{breaker.tripCurve.thermal}x</span>
                  </div>
                </div>
              </div>

              {/* Protection Features */}
              <div>
                <h5 className="text-sm font-medium mb-2">Protection Features</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Thermal Memory:</span>
                    <span>{breaker.characteristics.thermalMemory ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Harmonic Sensitive:</span>
                    <span>{breaker.characteristics.harmonicSensitive ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Selectivity:</span>
                    <span>{breaker.characteristics.selectivity}</span>
                  </div>
                </div>
              </div>

              {/* Inrush Settings */}
              <div>
                <h5 className="text-sm font-medium mb-2">Inrush Handling</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Multiple:</span>
                    <span>{breaker.tripCurve.inrushTolerance.maxMultiple}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tolerance Time:</span>
                    <span>{breaker.tripCurve.inrushTolerance.allowedDuration}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {!assessment.safe && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                <Info className="h-5 w-5" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {assessment.maxInstantCurrent > Number(circuitBreaker) * breaker.tripCurve.instantaneous && (
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Consider upgrading to a higher rated circuit breaker or stagger device startup times</span>
                  </div>
                )}
                {assessment.maxThermalLoad > Number(circuitBreaker) * breaker.tripCurve.thermal && (
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Reduce the continuous load or upgrade the circuit capacity</span>
                  </div>
                )}
                {assessment.maxInstantCurrent > Number(circuitBreaker) * breaker.tripCurve.inrushTolerance.maxMultiple && (
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Consider using a Type D breaker for better inrush current handling</span>
                  </div>
                )}
                {breaker.characteristics.harmonicSensitive && assessment.maxThermalLoad > Number(circuitBreaker) * 0.8 && (
                  <div className="flex items-start gap-2 text-blue-700 text-sm">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Consider derating the circuit due to harmonic-sensitive loads</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircuitAssessment;