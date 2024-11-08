'use client'

// CircuitCalculator.tsx
import React, { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { WIRE_SIZES, CIRCUIT_BREAKERS } from './circuitData';
import { APPLIANCES } from './appliancesData';
import { Consumer, Assessment, ThermalAnalysisPoint } from './types';
import { calculateThermalLoad, checkBreakerTrip, validateWireSize, calculateConsumerLoad } from './utils';
import CircuitControls from './CircuitControls';
import ApplianceSelector from './ApplianceSelector';
import CircuitAssessment from './CircuitAssessment';
import ThermalAnalysis from './ThermalAnalysis';

const CircuitCalculator: React.FC = () => {
  // State management
  const [circuitBreaker, setCircuitBreaker] = useState('16');
  const [breakerType, setBreakerType] = useState('Type C');
  const [wireSize, setWireSize] = useState('2.5');
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [selectedPowerLevel, setSelectedPowerLevel] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [timespan, setTimespan] = useState('60');
  const [showDetails, setShowDetails] = useState(false);

  // Validate wire size
  const validWireSize = useMemo(() => 
    validateWireSize(wireSize, WIRE_SIZES), [wireSize]
  );

  // Add appliance handler
  const handleAddAppliance = () => {
    if (selectedAppliance && selectedPowerLevel && selectedMode) {
      const appliance = APPLIANCES[selectedAppliance];
      const currentMatch = selectedPowerLevel.match(/\((\d+(?:\.\d+)?)A\)/);
      const current = currentMatch ? parseFloat(currentMatch[1]) : appliance.current.typical;
      
      setConsumers([...consumers, {
        name: selectedAppliance,
        current,
        duty: appliance.duty.typical,
        startupMultiplier: appliance.startupMultiplier,
        cycleTime: appliance.cycleTime,
        powerLevel: selectedPowerLevel,
        operatingMode: selectedMode
      }]);
      
      setSelectedAppliance('');
      setSelectedPowerLevel('');
      setSelectedMode('');
    }
  };

  // Calculate thermal analysis
  const thermalAnalysis = useMemo<ThermalAnalysisPoint[]>(() => {
    const timePoints = Array.from({length: Number(timespan)}, (_, i) => i);
    const wireRating = WIRE_SIZES[validWireSize];
    const breakerSpec = CIRCUIT_BREAKERS[breakerType];
    
    if (!wireRating || !breakerSpec) {
      return [];
    }

    return timePoints.map(t => {
      let totalCurrent = 0;
      let totalInrushCurrent = 0;
      let events: string[] = [];

      // Calculate load for each consumer
      consumers.forEach(consumer => {
        const { current, inrushCurrent, events: consumerEvents } = calculateConsumerLoad(consumer, t);
        totalCurrent += current;
        totalInrushCurrent += inrushCurrent;
        events.push(...consumerEvents);
      });

      const instantCurrent = totalCurrent + totalInrushCurrent;
      const thermalLoad = calculateThermalLoad(
        totalCurrent,
        t,
        wireRating.thermalTimeConstant
      );

      // Determine risk level
      const tripCheck = checkBreakerTrip(
        instantCurrent,
        t * 60 * 1000, // Convert to milliseconds
        breakerSpec,
        Number(circuitBreaker)
      );

      let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
      if (tripCheck.willTrip) {
        riskLevel = 'critical';
      } else if (thermalLoad > wireRating.maxContinuous) {
        riskLevel = 'warning';
      }

      return {
        time: t,
        current: thermalLoad,
        instantCurrent,
        maxBreaker: Number(circuitBreaker),
        instantBreaker: Number(circuitBreaker) * breakerSpec.tripCurve.instantaneous,
        thermalBreaker: Number(circuitBreaker) * breakerSpec.tripCurve.thermal,
        maxWireContinuous: wireRating.maxContinuous,
        maxWireShortTerm: wireRating.maxShortTerm,
        events,
        riskLevel
      };
    });
  }, [circuitBreaker, breakerType, validWireSize, consumers, timespan]);

  // Calculate safety assessment
  const assessment = useMemo<Assessment>(() => {
    const issues: string[] = [];
    const wireRating = WIRE_SIZES[validWireSize];
    const breakerSpec = CIRCUIT_BREAKERS[breakerType];
    
    const maxInstantCurrent = Math.max(...thermalAnalysis.map(d => d.instantCurrent));
    const maxThermalLoad = Math.max(...thermalAnalysis.map(d => d.current));
    
    if (maxInstantCurrent > Number(circuitBreaker) * breakerSpec.tripCurve.instantaneous) {
      issues.push(`Circuit breaker (${breakerType}) will trip on startup currents`);
    }
    if (maxThermalLoad > Number(circuitBreaker) * breakerSpec.tripCurve.thermal) {
      issues.push(`Circuit breaker thermal limit exceeded (${breakerType} characteristics)`);
    }
    if (maxThermalLoad > wireRating.maxContinuous) {
      issues.push(`Wire thermal capacity (${validWireSize}mm²) exceeded for continuous operation`);
    }
    if (maxThermalLoad > wireRating.maxShortTerm) {
      issues.push(`Wire thermal capacity (${validWireSize}mm²) exceeded for short-term operation`);
    }

    return {
      safe: issues.length === 0,
      issues,
      maxInstantCurrent,
      maxThermalLoad
    };
  }, [thermalAnalysis, breakerType, validWireSize]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="text-yellow-500" />
        Enhanced Circuit Safety Calculator
      </h2>
      
      <CircuitControls
        circuitBreaker={circuitBreaker}
        breakerType={breakerType}
        wireSize={validWireSize}
        onCircuitBreakerChange={setCircuitBreaker}
        onBreakerTypeChange={setBreakerType}
        onWireSizeChange={setWireSize}
      />

      <ApplianceSelector
        consumers={consumers}
        selectedAppliance={selectedAppliance}
        selectedPowerLevel={selectedPowerLevel}
        selectedMode={selectedMode}
        onApplianceChange={setSelectedAppliance}
        onPowerLevelChange={setSelectedPowerLevel}
        onModeChange={setSelectedMode}
        onAddAppliance={handleAddAppliance}
        onRemoveAppliance={(index) => {
          setConsumers(consumers.filter((_, i) => i !== index));
        }}
        appliances={APPLIANCES}
      />

      <CircuitAssessment
        assessment={assessment}
        breakerType={breakerType}
        circuitBreaker={circuitBreaker}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        breaker={CIRCUIT_BREAKERS[breakerType]}
      />

      <ThermalAnalysis
        data={thermalAnalysis}
        timespan={timespan}
        onTimespanChange={setTimespan}
        showInrush={true}
      />
    </div>
  );
};

export default CircuitCalculator;