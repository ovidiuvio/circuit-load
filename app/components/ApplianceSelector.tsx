// ApplianceSelector.tsx
import React from 'react';
import { Settings, Power, Activity, AlertCircle, Clock, Zap, Info } from 'lucide-react';
import { AppliancesDatabase, ApplianceSpec, Consumer } from './types';

interface ApplianceSelectorProps {
  consumers: Consumer[];
  selectedAppliance: string;
  selectedPowerLevel: string;
  selectedMode: string;
  onApplianceChange: (value: string) => void;
  onPowerLevelChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onAddAppliance: () => void;
  onRemoveAppliance: (index: number) => void;
  appliances: AppliancesDatabase;
}

const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({
  consumers,
  selectedAppliance,
  selectedPowerLevel,
  selectedMode,
  onApplianceChange,
  onPowerLevelChange,
  onModeChange,
  onAddAppliance,
  onRemoveAppliance,
  appliances
}) => {
  const selectedApplianceData = selectedAppliance ? appliances[selectedAppliance] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Power className="text-blue-500" />
          <span>Appliance Configuration</span>
        </h3>
      </div>

      {/* Selection Controls */}
      <div className="grid grid-cols-3 gap-4">
        {/* Appliance Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Appliance Type</label>
          <select
            value={selectedAppliance}
            onChange={(e) => {
              onApplianceChange(e.target.value);
              onPowerLevelChange('');
              onModeChange('');
            }}
            className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Appliance</option>
            {Object.entries(appliances).map(([name, spec]) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Power Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Power Level</label>
          <select
            value={selectedPowerLevel}
            onChange={(e) => onPowerLevelChange(e.target.value)}
            className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedAppliance}
          >
            <option value="">Select Power Level</option>
            {selectedApplianceData?.powerLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Operating Mode */}
        <div>
          <label className="block text-sm font-medium mb-1">Operating Mode</label>
          <select
            value={selectedMode}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedAppliance}
          >
            <option value="">Select Mode</option>
            {selectedApplianceData?.operatingModes.map(mode => (
              <option key={mode.name} value={mode.name}>
                {mode.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appliance Details Panel */}
      {selectedApplianceData && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Current Characteristics */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="text-blue-500 h-4 w-4" />
                Current Characteristics
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-600">Typical Usage:</span>
                <span>{selectedApplianceData.current.typical}A</span>
                <span className="text-gray-600">Maximum Current:</span>
                <span>{selectedApplianceData.current.max}A</span>
                <span className="text-gray-600">Inrush Multiple:</span>
                <span>{selectedApplianceData.current.inrush}x</span>
                <span className="text-gray-600">Inrush Duration:</span>
                <span>{selectedApplianceData.current.inrushDuration}ms</span>
              </div>
            </div>

            {/* Operating Pattern */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="text-blue-500 h-4 w-4" />
                Operating Pattern
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-600">Duty Cycle:</span>
                <span>{selectedApplianceData.duty.cycle}%</span>
                <span className="text-gray-600">Typical Usage:</span>
                <span>{selectedApplianceData.duty.typical}%</span>
                <span className="text-gray-600">Peak Usage:</span>
                <span>{selectedApplianceData.duty.peak}%</span>
                <span className="text-gray-600">Cycle Time:</span>
                <span>{selectedApplianceData.cycleTime} minutes</span>
              </div>
            </div>
          </div>

          {/* Mode Details */}
          {selectedMode && (
            <div className="pt-2 border-t border-gray-200">
              <h4 className="font-medium text-sm mb-2">Selected Mode Characteristics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {selectedApplianceData.operatingModes
                  .filter(mode => mode.name === selectedMode)
                  .map(mode => (
                    <div key={mode.name} className="bg-white p-3 rounded-md shadow-sm">
                      <p className="font-medium text-blue-600">{mode.name}</p>
                      <p className="text-gray-600">Current: {(mode.currentMultiplier * 100).toFixed(0)}%</p>
                      <p className="text-gray-600">Duty: {(mode.dutyMultiplier * 100).toFixed(0)}%</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Add Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onAddAppliance}
              disabled={!selectedPowerLevel || !selectedMode}
              className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Add Appliance
            </button>
          </div>
        </div>
      )}

      {/* Active Appliances List */}
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Zap className="text-blue-500 h-4 w-4" />
          Active Appliances
        </h4>
        
        {consumers.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">
            No appliances added yet
          </p>
        ) : (
          <div className="space-y-2">
            {consumers.map((consumer, index) => (
              <div key={index} 
                className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:border-blue-200 transition-colors"
              >
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <span className="font-medium">{consumer.name}</span>
                  <span className="text-blue-600">{consumer.powerLevel}</span>
                  <span className="text-gray-600">{consumer.operatingMode}</span>
                  <div className="text-gray-500 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {consumer.duty}% duty
                  </div>
                </div>

                {/* Warnings */}
                {appliances[consumer.name]?.current.inrush > 3 && (
                  <div className="flex items-center text-amber-600" title="High inrush current">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    High Inrush
                  </div>
                )}

                {/* Info button */}
                <button
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Show details"
                >
                  <Info className="h-4 w-4" />
                </button>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveAppliance(index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Load Summary */}
      {consumers.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Circuit Load Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Appliances:</span>
              <span className="ml-2 font-medium">{consumers.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Max Combined Current:</span>
              <span className="ml-2 font-medium">
                {consumers.reduce((sum, consumer) => sum + consumer.current, 0).toFixed(1)}A
              </span>
            </div>
            <div>
              <span className="text-gray-600">Highest Inrush:</span>
              <span className="ml-2 font-medium">
                {Math.max(...consumers.map(c => c.current * (appliances[c.name]?.current.inrush || 1))).toFixed(1)}A
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplianceSelector;