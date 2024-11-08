// circuitData.ts

export interface WireSpec {
  maxContinuous: number;
  maxShortTerm: number;
  thermalTimeConstant: number;
  description: string;
}

export const WIRE_SIZES: { [key: string]: WireSpec } = {
  '1.5': {
    maxContinuous: 16,
    maxShortTerm: 20,
    thermalTimeConstant: 15,
    description: 'Suitable for lighting circuits and small appliances'
  },
  '2.5': {
    maxContinuous: 20,
    maxShortTerm: 25,
    thermalTimeConstant: 20,
    description: 'Common size for power circuits'
  },
  '4.0': {
    maxContinuous: 27,
    maxShortTerm: 34,
    thermalTimeConstant: 25,
    description: 'Suitable for higher power appliances'
  },
  '6.0': {
    maxContinuous: 34,
    maxShortTerm: 43,
    thermalTimeConstant: 30,
    description: 'Used for heavy duty circuits'
  },
  '10.0': {
    maxContinuous: 46,
    maxShortTerm: 58,
    thermalTimeConstant: 35,
    description: 'High current applications'
  },
  '16.0': {
    maxContinuous: 62,
    maxShortTerm: 78,
    thermalTimeConstant: 40,
    description: 'Industrial applications'
  }
};

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

export const CIRCUIT_BREAKERS: { [key: string]: BreakerSpec } = {
  'Type B': {
    type: 'B',
    tripCurve: {
      instantaneous: 3,
      thermal: 1.13,
      thermalTime: 3600,
      inrushTolerance: {
        maxMultiple: 3,
        allowedDuration: 100
      }
    },
    characteristics: {
      thermalMemory: true,
      harmonicSensitive: true,
      selectivity: 'Low'
    },
    description: 'Suitable for resistive loads and lighting circuits'
  },
  'Type C': {
    type: 'C',
    tripCurve: {
      instantaneous: 5,
      thermal: 1.13,
      thermalTime: 3600,
      inrushTolerance: {
        maxMultiple: 5,
        allowedDuration: 200
      }
    },
    characteristics: {
      thermalMemory: true,
      harmonicSensitive: false,
      selectivity: 'Medium'
    },
    description: 'Suitable for slightly inductive loads and small motors'
  },
  'Type D': {
    type: 'D',
    tripCurve: {
      instantaneous: 10,
      thermal: 1.13,
      thermalTime: 3600,
      inrushTolerance: {
        maxMultiple: 10,
        allowedDuration: 400
      }
    },
    characteristics: {
      thermalMemory: true,
      harmonicSensitive: false,
      selectivity: 'High'
    },
    description: 'Suitable for highly inductive loads and motors'
  }
};
