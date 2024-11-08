'use client'

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Info, Thermometer, Clock } from 'lucide-react';

const APPLIANCES = {
  'Washing Machine': { current: 10, duty: 60, startupMultiplier: 3, cycleTime: 120 },
  'Dishwasher': { current: 10, duty: 50, startupMultiplier: 2, cycleTime: 90 },
  'Refrigerator': { current: 2, duty: 30, startupMultiplier: 3, cycleTime: 20 },
  'Microwave': { current: 8, duty: 100, startupMultiplier: 1.5, cycleTime: 5 },
  'Electric Oven': { current: 16, duty: 70, startupMultiplier: 1, cycleTime: 60 },
  'Coffee Maker': { current: 6, duty: 100, startupMultiplier: 1, cycleTime: 5 },
  'Toaster': { current: 8, duty: 100, startupMultiplier: 1, cycleTime: 3 },
  'Electric Kettle': { current: 13, duty: 100, startupMultiplier: 1, cycleTime: 3 },
  'Air Conditioner': { current: 12, duty: 80, startupMultiplier: 4, cycleTime: 30 },
  'Hair Dryer': { current: 10, duty: 100, startupMultiplier: 1, cycleTime: 10 },
  'Iron': { current: 10, duty: 50, startupMultiplier: 1, cycleTime: 30 },
  'TV': { current: 1, duty: 100, startupMultiplier: 1, cycleTime: 240 },
  'Computer': { current: 2, duty: 100, startupMultiplier: 1, cycleTime: 240 },
};

const CircuitCalculator = () => {
  const [circuitBreaker, setCircuitBreaker] = useState('16');
  const [wireSize, setWireSize] = useState('2.5');
  const [consumers, setConsumers] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [timespan, setTimespan] = useState('60'); // minutes to simulate

  // Wire current ratings with thermal characteristics
  const wireSizeRatings = {
    '1.5': { maxContinuous: 16, maxShortTerm: 20, thermalTimeConstant: 15 },
    '2.5': { maxContinuous: 20, maxShortTerm: 25, thermalTimeConstant: 20 },
    '4': { maxContinuous: 27, maxShortTerm: 34, thermalTimeConstant: 25 },
    '6': { maxContinuous: 34, maxShortTerm: 43, thermalTimeConstant: 30 },
    '10': { maxContinuous: 46, maxShortTerm: 58, thermalTimeConstant: 35 },
    '16': { maxContinuous: 62, maxShortTerm: 78, thermalTimeConstant: 40 },
  };

  const addAppliance = () => {
    if (selectedAppliance) {
      const appliance = APPLIANCES[selectedAppliance];
      setConsumers([...consumers, {
        name: selectedAppliance,
        current: appliance.current,
        duty: appliance.duty,
        startupMultiplier: appliance.startupMultiplier,
        cycleTime: appliance.cycleTime
      }]);
      setSelectedAppliance('');
    }
  };

  // Calculate thermal events timeline
  const thermalAnalysis = useMemo(() => {
    const timePoints = Array.from({length: Number(timespan)}, (_, i) => i);
    const wireRating = wireSizeRatings[wireSize];
    
    return timePoints.map(t => {
      let totalCurrent = 0;
      let startupCurrent = 0;
      let events = [];

      consumers.forEach(consumer => {
        // Calculate duty cycle current
        const cyclePosition = t % consumer.cycleTime;
        const isOn = cyclePosition < (consumer.cycleTime * consumer.duty / 100);
        
        if (isOn) {
          totalCurrent += Number(consumer.current);
          // Add startup current spike if at start of cycle
          if (cyclePosition === 0) {
            startupCurrent += Number(consumer.current) * (consumer.startupMultiplier - 1);
            events.push(`${consumer.name} startup`);
          }
        }
      });

      // Calculate thermal load with time constant
      const thermalLoad = totalCurrent * (1 - Math.exp(-t/wireRating.thermalTimeConstant));
      const instantCurrent = totalCurrent + startupCurrent;

      // Determine risk level
      let riskLevel = 'safe';
      if (instantCurrent > Number(circuitBreaker)) {
        riskLevel = 'critical';
      } else if (thermalLoad > wireRating.maxContinuous) {
        riskLevel = 'warning';
      }

      return {
        time: t,
        current: thermalLoad,
        instantCurrent,
        maxBreaker: Number(circuitBreaker),
        maxWireContinuous: wireRating.maxContinuous,
        maxWireShortTerm: wireRating.maxShortTerm,
        events,
        riskLevel
      };
    });
  }, [circuitBreaker, wireSize, consumers, timespan]);

  // Safety assessment with thermal consideration
  const assessment = useMemo(() => {
    const issues = [];
    const wireRating = wireSizeRatings[wireSize];
    
    const maxInstantCurrent = Math.max(...thermalAnalysis.map(d => d.instantCurrent));
    const maxThermalLoad = Math.max(...thermalAnalysis.map(d => d.current));
    
    if (maxInstantCurrent > Number(circuitBreaker)) {
      issues.push('Circuit breaker will trip on startup currents');
    }
    if (maxThermalLoad > wireRating.maxContinuous) {
      issues.push('Wire thermal capacity exceeded for continuous operation');
    }
    if (maxThermalLoad > wireRating.maxShortTerm) {
      issues.push('Wire thermal capacity exceeded for short-term operation');
    }

    return { safe: issues.length === 0, issues };
  }, [thermalAnalysis]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Circuit Safety Calculator</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Circuit Breaker (A)</label>
          <select 
            value={circuitBreaker}
            onChange={(e) => setCircuitBreaker(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="10">10A</option>
            <option value="16">16A</option>
            <option value="20">20A</option>
            <option value="25">25A</option>
            <option value="32">32A</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Wire Size (mm²)</label>
          <select 
            value={wireSize}
            onChange={(e) => setWireSize(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            {Object.keys(wireSizeRatings).map(size => (
              <option key={size} value={size}>{size}mm²</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Add Appliances</h3>
        
        <div className="flex space-x-2">
          <select
            value={selectedAppliance}
            onChange={(e) => setSelectedAppliance(e.target.value)}
            className="flex-1 p-2 border rounded-md"
          >
            <option value="">Select Appliance</option>
            {Object.keys(APPLIANCES).map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
          <button
            onClick={addAppliance}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {consumers.map((consumer, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
              <span className="flex-1">{consumer.name}</span>
              <span>{consumer.current}A</span>
              <span>{consumer.duty}% duty</span>
              <span>{consumer.startupMultiplier}x startup</span>
              <button
                onClick={() => setConsumers(consumers.filter((_, i) => i !== index))}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-md border space-y-2">
        <div className="flex items-center space-x-2">
          {assessment.safe ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <AlertTriangle className="text-red-500" />
          )}
          <h3 className="text-lg font-medium">
            Circuit Status: {assessment.safe ? 'Safe' : 'Warning'}
          </h3>
        </div>
        
        {assessment.issues.map((issue, index) => (
          <div key={index} className="flex items-center space-x-2 text-red-500">
            <Info size={16} />
            <span>{issue}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Thermometer className="text-blue-500" />
          <span>Thermal Analysis</span>
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={thermalAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time (minutes)', position: 'bottom' }} 
              />
              <YAxis 
                label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={({ payload, label }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p>Time: {label} minutes</p>
                      <p>Current: {data.current.toFixed(1)}A</p>
                      <p>Instant Current: {data.instantCurrent.toFixed(1)}A</p>
                      {data.events.length > 0 && (
                        <p className="text-orange-500">Events: {data.events.join(', ')}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }} />
              <Line type="monotone" dataKey="current" stroke="#2563eb" name="Thermal Load" />
              <Line type="monotone" dataKey="instantCurrent" stroke="#ea580c" name="Instant Current" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="maxBreaker" stroke="#dc2626" name="Breaker Limit" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="maxWireContinuous" stroke="#059669" name="Wire Continuous Limit" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Time-based Events</h4>
          {thermalAnalysis.filter(d => d.events.length > 0).map((event, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Clock size={16} className="text-blue-500" />
              <span>Minute {event.time}: {event.events.join(', ')}</span>
              <span className={`px-2 rounded ${
                event.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                event.riskLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {event.riskLevel.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CircuitCalculator;
