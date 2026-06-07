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
  nurseInitials: string;
}

export interface PressureCheck {
  id: string;
  timestamp: string; // ISO string
  skinIntact: boolean;
  rednessPresence: boolean;
  repositioned: boolean;
  braedenScore?: number; // Optional clinical score
  notes: string;
  nurseInitials: string;
}

export interface MorseFallRisk {
  historyOfFalls: boolean;     // Yes (25) | No (0)
  secondaryDiagnosis: boolean;  // Yes (15) | No (0)
  ambulatoryAid: 'none' | 'cane_walker' | 'furniture_clinging'; // None (0) | Cane/Walker (15) | Furniture (30)
  ivTherapy: boolean;          // Yes (20) | No (0)
  gait: 'normal' | 'weak' | 'impaired'; // Normal/Bedrest (0) | Weak (10) | Impaired (20)
  mentalStatus: 'oriented' | 'overestimates'; // Oriented to ability (0) | Forgets limitations (15)
  score: number;               // Automated total Morse score
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
  fallRisk: MorseFallRisk;
}
