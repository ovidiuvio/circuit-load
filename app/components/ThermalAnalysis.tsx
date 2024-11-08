// ThermalAnalysis.tsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Thermometer, Clock, Activity, ZapOff, Zap, BarChart } from 'lucide-react';
import { ThermalAnalysisPoint } from './types';

interface ThermalAnalysisProps {
  data: ThermalAnalysisPoint[];
  timespan: string;
  onTimespanChange: (value: string) => void;
  showInrush: boolean;
}

const ThermalAnalysis: React.FC<ThermalAnalysisProps> = ({
  data,
  timespan,
  onTimespanChange,
  showInrush
}) => {
  const [viewMode, setViewMode] = useState<'thermal' | 'inrush' | 'combined'>('combined');
  const [zoomLevel, setZoomLevel] = useState<'all' | 'inrush' | '1min' | '5min'>('all');
  const [autoScale, setAutoScale] = useState(true);

  // Custom tooltip formatter
  const formatTime = (time: number): string => {
    if (zoomLevel === 'inrush') return `${time * 1000}ms`;
    const minutes = Math.floor(time);
    const seconds = Math.round((time - minutes) * 60);
    return `${minutes}m ${seconds}s`;
  };

  // Calculate zoom window data
  const getZoomedData = () => {
    switch (zoomLevel) {
      case 'inrush':
        return data.filter(d => d.time <= 0.1); // First 100ms
      case '1min':
        return data.filter(d => d.time <= 1);
      case '5min':
        return data.filter(d => d.time <= 5);
      default:
        return data;
    }
  };

  const zoomedData = getZoomedData();

  // Calculate Y-axis domain
  const getYAxisDomain = () => {
    if (!autoScale) return [0, 'auto'];
    const maxValue = Math.max(
      ...zoomedData.map(d => Math.max(d.instantCurrent, d.current, d.instantBreaker))
    );
    return [0, Math.ceil(maxValue * 1.1)];
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
        <div className="flex items-center space-x-4">
          {/* View Mode Selection */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">View:</span>
            <button
              onClick={() => setViewMode('thermal')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'thermal' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Thermal
            </button>
            <button
              onClick={() => setViewMode('inrush')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'inrush' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inrush
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'combined' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Combined
            </button>
          </div>

          {/* Auto Scale Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoScale}
                onChange={(e) => setAutoScale(e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Auto Scale</span>
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Zoom Control */}
          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.value as any)}
            className="p-2 border rounded-md text-sm"
          >
            <option value="all">Full Timeline</option>
            <option value="inrush">Inrush Period</option>
            <option value="1min">1 Minute</option>
            <option value="5min">5 Minutes</option>
          </select>

          {/* Timespan Selection */}
          <select
            value={timespan}
            onChange={(e) => onTimespanChange(e.target.value)}
            className="p-2 border rounded-md text-sm"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
          </select>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zoomedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                label={{ 
                  value: zoomLevel === 'inrush' ? 'Time (ms)' : 'Time (minutes)', 
                  position: 'bottom' 
                }}
                tickFormatter={formatTime}
              />
              <YAxis 
                domain={getYAxisDomain()}
                label={{ 
                  value: 'Current (A)', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ThermalAnalysisPoint;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg space-y-2">
                        <p className="font-medium text-gray-900">
                          Time: {formatTime(data.time)}
                        </p>
                        <div className="space-y-1">
                          {(viewMode === 'thermal' || viewMode === 'combined') && (
                            <p className="text-blue-600">
                              Thermal Load: {data.current.toFixed(1)}A
                            </p>
                          )}
                          {(viewMode === 'inrush' || viewMode === 'combined') && (
                            <p className="text-amber-600">
                              Instant Current: {data.instantCurrent.toFixed(1)}A
                            </p>
                          )}
                          <p className="text-purple-600">
                            Trip Threshold: {data.thermalBreaker.toFixed(1)}A
                          </p>
                          {data.events.length > 0 && (
                            <div className="border-t pt-1 mt-1">
                              <p className="text-gray-700 font-medium">Events:</p>
                              {data.events.map((event, i) => (
                                <p key={i} className="text-sm text-gray-600">{event}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Main Current Lines */}
              {(viewMode === 'thermal' || viewMode === 'combined') && (
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#2563eb" 
                  name="Thermal Load"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              
              {(viewMode === 'inrush' || viewMode === 'combined') && (
                <Line 
                  type="monotone" 
                  dataKey="instantCurrent" 
                  stroke="#ea580c" 
                  name="Instant Current"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* Reference Lines */}
              <ReferenceLine 
                y={data[0]?.instantBreaker} 
                stroke="#dc2626" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Instant Trip',
                  position: 'right',
                  fill: '#dc2626'
                }}
              />
              
              <ReferenceLine 
                y={data[0]?.thermalBreaker} 
                stroke="#9333ea" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Thermal Trip',
                  position: 'right',
                  fill: '#9333ea'
                }}
              />
              
              <ReferenceLine 
                y={data[0]?.maxWireContinuous} 
                stroke="#059669" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Wire Limit',
                  position: 'right',
                  fill: '#059669'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white rounded-lg border">
        <div className="p-3 border-b">
          <h4 className="font-medium flex items-center space-x-2">
            <Activity className="text-blue-500 h-5 w-5" />
            <span>Significant Events</span>
          </h4>
        </div>
        
        <div className="p-3 max-h-48 overflow-y-auto">
          {data.filter(d => d.events.length > 0 || d.riskLevel !== 'safe').map((event, i) => (
            <div 
              key={i} 
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              {event.riskLevel === 'critical' ? (
                <Zap className="text-red-500 h-5 w-5" />
              ) : event.riskLevel === 'warning' ? (
                <Thermometer className="text-amber-500 h-5 w-5" />
              ) : (
                <Activity className="text-blue-500 h-5 w-5" />
              )}
              
              <span className="text-gray-500 w-24">
                {formatTime(event.time)}
              </span>
              
              <div className="flex-1">
                {event.events.map((e, j) => (
                  <p key={j} className="text-sm">{e}</p>
                ))}
                {event.instantCurrent > event.instantBreaker && (
                  <p className="text-sm text-red-600">Instant trip threshold exceeded</p>
                )}
                {event.current > event.thermalBreaker && (
                  <p className="text-sm text-amber-600">Thermal trip threshold exceeded</p>
                )}
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                event.riskLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {event.riskLevel.toUpperCase()}
              </span>
            </div>
          ))}
          
          {!data.some(d => d.events.length > 0 || d.riskLevel !== 'safe') && (
            <p className="text-gray-500 italic text-center py-4">
              No significant events detected
            </p>
          )}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
        {(viewMode === 'thermal' || viewMode === 'combined') && (
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-blue-600"></span>
            <span>Thermal Load</span>
          </div>
        )}
        {(viewMode === 'inrush' || viewMode === 'combined') && (
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-orange-600"></span>
            <span>Instant Current</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-red-600 border-dashed"></span>
          <span>Instant Trip</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-purple-600 border-dashed"></span>
          <span>Thermal Trip</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-green-600 border-dashed"></span>
          <span>Wire Limit</span>
        </div>
      </div>
    </div>
  );
};

export default ThermalAnalysis;