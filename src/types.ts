/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VitalReading {
  id: string;
  timestamp: string; // ISO string
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  spo2: number; // %
  supplementalO2: boolean; // Yes/No
  levelOfConsciousness: 'A' | 'V' | 'P' | 'U'; // AVPU (Alert, Voice, Pain, Unresponsive)
  nzewsScore?: number;
  nzewsZone?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLUE';
  nurseInitials: string;
}

export interface BradenAssessment {
  sensory: number; // 1-4
  moist: number; // 1-4
  activity: number; // 1-4
  mobility: number; // 1-4
  nutrition: number; // 1-4
  frictionShear: number; // 1-3
  score: number;
  riskLevel: 'No Risk' | 'Mild' | 'Moderate' | 'High' | 'Severe';
  updatedAt: string;
}

export interface PressureCheck {
  id: string;
  timestamp: string; // ISO string
  skinIntact: boolean;
  rednessPresence: boolean;
  repositioned: boolean;
  braedenScore?: number; // Keep for backward compatibility
  notes: string;
  nurseInitials: string;
}

export interface FRATAssessment {
  recentFalls: number; // 2, 4, 6, 8
  medications: number; // 1, 2, 3, 4
  psychological: number; // 1, 2, 3, 4
  cognitiveStatus: number; // 1, 2, 3, 4
  recentChangeMobility: boolean;
  dizzinessPosturalHypotension: boolean;
  checklistVision: boolean;
  checklistMobility: boolean;
  checklistTransfers: boolean;
  checklistBehaviours: boolean;
  checklistADLs: boolean;
  checklistEnvironment: boolean;
  checklistNutrition: boolean;
  checklistContinence: boolean;
  checklistOther: boolean;
  score: number; // Out of 20
  riskLevel: 'Low' | 'Medium' | 'High';
  updatedAt: string;
}

export interface Patient {
  id: string;
  bed: string;
  name: string;
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  admittedAt: string;
  vitals: VitalReading[];
  pressureChecks: PressureCheck[];
  bradenAssessment?: BradenAssessment;
  fallRisk?: any; // To preserve old Morse code structures if any
  fratAssessment?: FRATAssessment;
}
