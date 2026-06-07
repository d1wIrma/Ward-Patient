/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, MorseFallRisk, VitalReading, PressureCheck } from './types';

// Anchor current base date: 2026-06-07T06:54:00Z
const BASE_TIME = new Date('2026-06-07T06:54:00Z').getTime();

// Helper to get relative ISO string relative to BASE_TIME (minutes ago)
export function getRelativeTime(minusMinutes: number): string {
  return new Date(BASE_TIME - minusMinutes * 60 * 1000).toISOString();
}

// Morse fall risk utility calculator
export function calculateMorseFallRisk(
  historyOfFalls: boolean,
  secondaryDiagnosis: boolean,
  ambulatoryAid: 'none' | 'cane_walker' | 'furniture_clinging',
  ivTherapy: boolean,
  gait: 'normal' | 'weak' | 'impaired',
  mentalStatus: 'oriented' | 'overestimates'
): Omit<MorseFallRisk, 'updatedAt'> {
  let score = 0;
  
  if (historyOfFalls) score += 25;
  if (secondaryDiagnosis) score += 15;
  
  if (ambulatoryAid === 'cane_walker') score += 15;
  else if (ambulatoryAid === 'furniture_clinging') score += 30;
  
  if (ivTherapy) score += 20;
  
  if (gait === 'weak') score += 10;
  else if (gait === 'impaired') score += 20;
  
  if (mentalStatus === 'overestimates') score += 15;
  
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (score >= 45) {
    riskLevel = 'High';
  } else if (score >= 25) {
    riskLevel = 'Medium';
  }
  
  return {
    historyOfFalls,
    secondaryDiagnosis,
    ambulatoryAid,
    ivTherapy,
    gait,
    mentalStatus,
    score,
    riskLevel
  };
}

// Standard range checkers for clinical abnormal triggers
export function checkVitalsAbnormal(reading: VitalReading) {
  const alerts: string[] = [];
  
  if (reading.heartRate < 60) alerts.push('Bradycardia (HR < 60)');
  else if (reading.heartRate > 100) alerts.push('Tachycardia (HR > 100)');
  
  if (reading.systolicBp < 90) alerts.push('Hypotension (Sys BP < 90)');
  else if (reading.systolicBp > 140) alerts.push('Hypertension (Sys BP > 140)');
  
  if (reading.temperature < 36.0) alerts.push('Hypothermia (Temp < 36.0°C)');
  else if (reading.temperature > 37.8) alerts.push('Hyperthermia/Pyrexia (Temp > 37.8°C)');
  
  if (reading.spo2 < 95) alerts.push('Hypoxia (SpO2 < 95%)');
  
  if (reading.respiratoryRate < 12) alerts.push('Bradypnea (RR < 12)');
  else if (reading.respiratoryRate > 20) alerts.push('Tachypnea (RR > 20)');
  
  return {
    isAbnormal: alerts.length > 0,
    alerts
  };
}

export const initialPatients: Patient[] = [
  {
    id: 'P-101',
    bed: '301-A',
    name: 'Eleanor Fitzgerald',
    age: 85,
    gender: 'Female',
    height: 158,
    weight: 54,
    admittedAt: getRelativeTime(4320), // 3 days ago
    vitals: [
      {
        id: 'v1',
        timestamp: getRelativeTime(1440), // 24hr ago
        heartRate: 88,
        systolicBp: 135,
        diastolicBp: 80,
        temperature: 37.1,
        respiratoryRate: 18,
        spo2: 96,
        nurseInitials: 'SR'
      },
      {
        id: 'v2',
        timestamp: getRelativeTime(720), // 12hr ago
        heartRate: 92,
        systolicBp: 142,
        diastolicBp: 84,
        temperature: 37.3,
        respiratoryRate: 19,
        spo2: 95,
        nurseInitials: 'SR'
      },
      {
        id: 'v3',
        timestamp: getRelativeTime(240), // 4hr ago
        heartRate: 95,
        systolicBp: 148,
        diastolicBp: 88,
        temperature: 37.6,
        respiratoryRate: 21,
        spo2: 94,
        nurseInitials: 'TB'
      },
      {
        id: 'v4',
        timestamp: getRelativeTime(60), // 1hr ago
        heartRate: 99,
        systolicBp: 152,
        diastolicBp: 92,
        temperature: 37.8,
        respiratoryRate: 22,
        spo2: 94,
        nurseInitials: 'TB'
      }
    ],
    pressureChecks: [
      {
        id: 'p1',
        timestamp: getRelativeTime(360), // 6hr ago
        skinIntact: true,
        rednessPresence: false,
        repositioned: true,
        notes: 'Skin intact across all bony prominences. Side-lying left.',
        nurseInitials: 'SR'
      },
      {
        id: 'p2',
        timestamp: getRelativeTime(150), // 2 hours 30 mins ago -> Overdue by 30 mins!
        skinIntact: true,
        rednessPresence: true,
        repositioned: true,
        notes: 'Mild localized redness over sacrum. Repositioned to right lateral. Highly vulnerable.',
        nurseInitials: 'TB'
      }
    ],
    fallRisk: {
      historyOfFalls: true,
      secondaryDiagnosis: true,
      ambulatoryAid: 'cane_walker',
      ivTherapy: true,
      gait: 'weak',
      mentalStatus: 'overestimates',
      score: 85, // 25 + 15 + 15 + 20 + 10 + 15 (high fall risk)
      riskLevel: 'High',
      updatedAt: getRelativeTime(150)
    }
  },
  {
    id: 'P-102',
    bed: '301-B',
    name: 'Marcus Vance',
    age: 72,
    gender: 'Male',
    height: 178,
    weight: 82,
    admittedAt: getRelativeTime(2880), // 2 days ago
    vitals: [
      {
        id: 'v5',
        timestamp: getRelativeTime(1440),
        heartRate: 72,
        systolicBp: 120,
        diastolicBp: 78,
        temperature: 38.4,
        respiratoryRate: 16,
        spo2: 97,
        nurseInitials: 'AL'
      },
      {
        id: 'v6',
        timestamp: getRelativeTime(720),
        heartRate: 74,
        systolicBp: 122,
        diastolicBp: 80,
        temperature: 37.9,
        respiratoryRate: 16,
        spo2: 98,
        nurseInitials: 'AL'
      },
      {
        id: 'v7',
        timestamp: getRelativeTime(360),
        heartRate: 70,
        systolicBp: 118,
        diastolicBp: 76,
        temperature: 37.2,
        respiratoryRate: 15,
        spo2: 99,
        nurseInitials: 'SR'
      },
      {
        id: 'v8',
        timestamp: getRelativeTime(80), // 1hr 20m ago (Next check due in 40m)
        heartRate: 68,
        systolicBp: 115,
        diastolicBp: 75,
        temperature: 36.7,
        respiratoryRate: 15,
        spo2: 99,
        nurseInitials: 'SR'
      }
    ],
    pressureChecks: [
      {
        id: 'p3',
        timestamp: getRelativeTime(260),
        skinIntact: true,
        rednessPresence: false,
        repositioned: true,
        notes: 'Patient semi-fowlers. Heel pads in place.',
        nurseInitials: 'AL'
      },
      {
        id: 'p4',
        timestamp: getRelativeTime(80), // 80 minutes ago (Green/safe, due in 40 mins)
        skinIntact: true,
        rednessPresence: false,
        repositioned: false,
        notes: 'Skin inspected, clear. Patient declined left lateral, requested fowlers. Repositioning not completed.',
        nurseInitials: 'SR'
      }
    ],
    fallRisk: {
      historyOfFalls: false,
      secondaryDiagnosis: true,
      ambulatoryAid: 'none',
      ivTherapy: true,
      gait: 'normal',
      mentalStatus: 'oriented',
      score: 35, // 0 + 15 + 0 + 20 + 0 + 0 (medium risk)
      riskLevel: 'Medium',
      updatedAt: getRelativeTime(80)
    }
  },
  {
    id: 'P-103',
    bed: '302-A',
    name: 'Amara Okoye',
    age: 45,
    gender: 'Other',
    height: 165,
    weight: 68,
    admittedAt: getRelativeTime(1440), // 1 day ago
    vitals: [
      {
        id: 'v9',
        timestamp: getRelativeTime(720),
        heartRate: 85,
        systolicBp: 110,
        diastolicBp: 70,
        temperature: 36.6,
        respiratoryRate: 14,
        spo2: 99,
        nurseInitials: 'MK'
      },
      {
        id: 'v10',
        timestamp: getRelativeTime(360),
        heartRate: 82,
        systolicBp: 112,
        diastolicBp: 72,
        temperature: 36.8,
        respiratoryRate: 14,
        spo2: 100,
        nurseInitials: 'MK'
      },
      {
        id: 'v11',
        timestamp: getRelativeTime(20), // 20 minutes ago (Recent, super green!)
        heartRate: 80,
        systolicBp: 115,
        diastolicBp: 75,
        temperature: 36.5,
        respiratoryRate: 14,
        spo2: 100,
        nurseInitials: 'TB'
      }
    ],
    pressureChecks: [
      {
        id: 'p5',
        timestamp: getRelativeTime(20), // Checked 20 min ago. Next in 100 minutes.
        skinIntact: true,
        rednessPresence: false,
        repositioned: true,
        notes: 'Atypical redness noted on back of heels alleviated by elevating heels off mattress.',
        nurseInitials: 'TB'
      }
    ],
    fallRisk: {
      historyOfFalls: false,
      secondaryDiagnosis: false,
      ambulatoryAid: 'none',
      ivTherapy: false,
      gait: 'normal',
      mentalStatus: 'oriented',
      score: 0, // 0 total (low risk)
      riskLevel: 'Low',
      updatedAt: getRelativeTime(20)
    }
  }
];
