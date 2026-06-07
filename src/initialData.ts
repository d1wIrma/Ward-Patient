/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, VitalReading, PressureCheck, BradenAssessment, FRATAssessment } from './types';

// Anchor current base date: 2026-06-07T06:54:00Z
const BASE_TIME = new Date('2026-06-07T06:54:00Z').getTime();

// Helper to get relative ISO string relative to BASE_TIME (minutes ago)
export function getRelativeTime(minusMinutes: number): string {
  return new Date(BASE_TIME - minusMinutes * 60 * 1000).toISOString();
}

// Canterbury DHB NZEWS Calculations
export function calculateNZEWS(vitals: {
  heartRate: number;
  systolicBp: number;
  temperature: number;
  respiratoryRate: number;
  spo2: number;
  supplementalO2: boolean;
  levelOfConsciousness: 'A' | 'V' | 'P' | 'U';
}) {
  let score = 0;
  let singleRedTrigger = false;
  let singleBlueTrigger = false;

  // --- Respiratory Rate ---
  let rrPoints = 0;
  if (vitals.respiratoryRate <= 4) {
    rrPoints = 10;
  } else if (vitals.respiratoryRate >= 5 && vitals.respiratoryRate <= 8) {
    rrPoints = 3;
  } else if (vitals.respiratoryRate >= 9 && vitals.respiratoryRate <= 11) {
    rrPoints = 1;
  } else if (vitals.respiratoryRate >= 12 && vitals.respiratoryRate <= 20) {
    rrPoints = 0;
  } else if (vitals.respiratoryRate >= 21 && vitals.respiratoryRate <= 24) {
    rrPoints = 2;
  } else if (vitals.respiratoryRate >= 25 && vitals.respiratoryRate <= 35) {
    rrPoints = 3;
  } else if (vitals.respiratoryRate >= 36) {
    rrPoints = 10;
  }
  score += rrPoints;
  if (rrPoints === 3) singleRedTrigger = true;
  if (rrPoints >= 10) singleBlueTrigger = true;

  // --- SpO2 ---
  let spo2Points = 0;
  if (vitals.spo2 <= 91) {
    spo2Points = 3;
  } else if (vitals.spo2 >= 92 && vitals.spo2 <= 93) {
    spo2Points = 2;
  } else if (vitals.spo2 >= 94 && vitals.spo2 <= 95) {
    spo2Points = 1;
  } else if (vitals.spo2 >= 96) {
    spo2Points = 0;
  }
  score += spo2Points;
  if (spo2Points === 3) singleRedTrigger = true;

  // --- Supplemental O2 ---
  let suppPoints = vitals.supplementalO2 ? 2 : 0;
  score += suppPoints;

  // --- Temperature ---
  let tempPoints = 0;
  if (vitals.temperature <= 34.9) {
    tempPoints = 2;
  } else if (vitals.temperature >= 35.0 && vitals.temperature <= 35.9) {
    tempPoints = 1;
  } else if (vitals.temperature >= 36.0 && vitals.temperature <= 37.9) {
    tempPoints = 0;
  } else if (vitals.temperature >= 38.0 && vitals.temperature <= 38.9) {
    tempPoints = 1;
  } else if (vitals.temperature >= 39.0) {
    tempPoints = 2;
  }
  score += tempPoints;

  // --- Systolic BP ---
  let sbpPoints = 0;
  if (vitals.systolicBp <= 69) {
    sbpPoints = 10;
  } else if (vitals.systolicBp >= 70 && vitals.systolicBp <= 89) {
    sbpPoints = 3;
  } else if (vitals.systolicBp >= 90 && vitals.systolicBp <= 99) {
    sbpPoints = 2;
  } else if (vitals.systolicBp >= 100 && vitals.systolicBp <= 109) {
    sbpPoints = 1;
  } else if (vitals.systolicBp >= 110 && vitals.systolicBp <= 219) {
    sbpPoints = 0;
  } else if (vitals.systolicBp >= 220) {
    sbpPoints = 3;
  }
  score += sbpPoints;
  if (sbpPoints === 3) singleRedTrigger = true;
  if (sbpPoints >= 10) singleBlueTrigger = true;

  // --- Heart Rate ---
  let hrPoints = 0;
  if (vitals.heartRate <= 39) {
    hrPoints = 10;
  } else if (vitals.heartRate >= 40 && vitals.heartRate <= 49) {
    hrPoints = 2;
  } else if (vitals.heartRate >= 50 && vitals.heartRate <= 89) {
    hrPoints = 0;
  } else if (vitals.heartRate >= 90 && vitals.heartRate <= 110) {
    hrPoints = 1;
  } else if (vitals.heartRate >= 111 && vitals.heartRate <= 129) {
    hrPoints = 2;
  } else if (vitals.heartRate >= 130 && vitals.heartRate <= 139) {
    hrPoints = 3;
  } else if (vitals.heartRate >= 140) {
    hrPoints = 10;
  }
  score += hrPoints;
  if (hrPoints === 3) singleRedTrigger = true;
  if (hrPoints >= 10) singleBlueTrigger = true;

  // --- Level of Consciousness ---
  let locPoints = 0;
  if (vitals.levelOfConsciousness === 'A') {
    locPoints = 0;
  } else if (vitals.levelOfConsciousness === 'V' || vitals.levelOfConsciousness === 'P') {
    locPoints = 3;
  } else if (vitals.levelOfConsciousness === 'U') {
    locPoints = 10;
  }
  score += locPoints;
  if (locPoints === 3) singleRedTrigger = true;
  if (locPoints >= 10) singleBlueTrigger = true;

  // Decide zone
  let zone: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLUE' = 'GREEN';
  if (score >= 10 || singleBlueTrigger) {
    zone = 'BLUE';
  } else if (score >= 8 && score <= 9) {
    zone = 'RED';
  } else if ((score >= 6 && score <= 7) || singleRedTrigger) {
    zone = 'ORANGE';
  } else if (score >= 1 && score <= 5) {
    zone = 'YELLOW';
  }

  return {
    score,
    zone,
    breakdown: {
      rr: rrPoints,
      spo2: spo2Points,
      oxygen: suppPoints,
      temp: tempPoints,
      sbp: sbpPoints,
      hr: hrPoints,
      loc: locPoints
    }
  };
}

// Braden Risk Assessment Tool
export function calculateBradenRisk(vals: {
  sensory: number;
  moist: number;
  activity: number;
  mobility: number;
  nutrition: number;
  frictionShear: number;
}): { score: number; riskLevel: 'No Risk' | 'Mild' | 'Moderate' | 'High' | 'Severe' } {
  const score = vals.sensory + vals.moist + vals.activity + vals.mobility + vals.nutrition + vals.frictionShear;
  let riskLevel: 'No Risk' | 'Mild' | 'Moderate' | 'High' | 'Severe' = 'No Risk';
  if (score <= 9) {
    riskLevel = 'Severe';
  } else if (score >= 10 && score <= 12) {
    riskLevel = 'High';
  } else if (score >= 13 && score <= 14) {
    riskLevel = 'Moderate';
  } else if (score >= 15 && score <= 18) {
    riskLevel = 'Mild';
  }
  return { score, riskLevel };
}

// FRAT Fall Risk Calculator
export function calculateFRATRisk(vals: {
  recentFalls: number; // 2 | 4 | 6 | 8
  medications: number; // 1 | 2 | 3 | 4
  psychological: number; // 1 | 2 | 3 | 4
  cognitiveStatus: number; // 1 | 2 | 3 | 4
  recentChangeMobility: boolean;
  dizzinessPosturalHypotension: boolean;
}): { score: number; riskLevel: 'Low' | 'Medium' | 'High' } {
  const score = vals.recentFalls + vals.medications + vals.psychological + vals.cognitiveStatus;
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (score >= 16) {
    riskLevel = 'High';
  } else if (score >= 12 && score <= 15) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  // Automatic High Risk conditions
  if (vals.recentChangeMobility || vals.dizzinessPosturalHypotension) {
    riskLevel = 'High';
  }

  return { score, riskLevel };
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 2, // HR 1 + SpO2 1
        nzewsZone: 'YELLOW',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 4, // HR 1 + RR 2 + SpO2 1
        nzewsZone: 'YELLOW',
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
        supplementalO2: true, // Requires oxygen therapy!
        levelOfConsciousness: 'A',
        nzewsScore: 6, // HR 1 + RR 2 + SpO2 1 + SuppO2 2
        nzewsZone: 'ORANGE',
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
    bradenAssessment: {
      sensory: 3,
      moist: 2,
      activity: 2,
      mobility: 2,
      nutrition: 2,
      frictionShear: 1,
      score: 12, // High risk, should consider dynamic air mattress!
      riskLevel: 'High',
      updatedAt: getRelativeTime(360)
    },
    fallRisk: null,
    fratAssessment: {
      recentFalls: 6, // one or more in last 3 months
      medications: 3, // taking two
      psychological: 3, // moderatly affected
      cognitiveStatus: 3, // moderately impaired
      recentChangeMobility: true,
      dizzinessPosturalHypotension: false,
      checklistVision: true,
      checklistMobility: true,
      checklistTransfers: false,
      checklistBehaviours: false,
      checklistADLs: true,
      checklistEnvironment: false,
      checklistNutrition: false,
      checklistContinence: true,
      checklistOther: false,
      score: 15,
      riskLevel: 'High', // due to recentChangeMobility = true
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 1, // temp 1
        nzewsZone: 'YELLOW',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
    bradenAssessment: {
      sensory: 4,
      moist: 4,
      activity: 3,
      mobility: 4,
      nutrition: 3,
      frictionShear: 3,
      score: 21,
      riskLevel: 'No Risk',
      updatedAt: getRelativeTime(260)
    },
    fallRisk: null,
    fratAssessment: {
      recentFalls: 2, // none
      medications: 3, // taking two
      psychological: 1, // none
      cognitiveStatus: 1, // intact
      recentChangeMobility: false,
      dizzinessPosturalHypotension: false,
      checklistVision: false,
      checklistMobility: false,
      checklistTransfers: false,
      checklistBehaviours: false,
      checklistADLs: false,
      checklistEnvironment: false,
      checklistNutrition: false,
      checklistContinence: false,
      checklistOther: false,
      score: 7,
      riskLevel: 'Low',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
        supplementalO2: false,
        levelOfConsciousness: 'A',
        nzewsScore: 0,
        nzewsZone: 'GREEN',
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
    bradenAssessment: {
      sensory: 4,
      moist: 4,
      activity: 4,
      mobility: 4,
      nutrition: 4,
      frictionShear: 3,
      score: 23,
      riskLevel: 'No Risk',
      updatedAt: getRelativeTime(20)
    },
    fallRisk: null,
    fratAssessment: {
      recentFalls: 2,
      medications: 1,
      psychological: 1,
      cognitiveStatus: 1,
      recentChangeMobility: false,
      dizzinessPosturalHypotension: false,
      checklistVision: false,
      checklistMobility: false,
      checklistTransfers: false,
      checklistBehaviours: false,
      checklistADLs: false,
      checklistEnvironment: false,
      checklistNutrition: false,
      checklistContinence: false,
      checklistOther: false,
      score: 5,
      riskLevel: 'Low',
      updatedAt: getRelativeTime(20)
    }
  }
];

export function checkVitalsAbnormal(reading: VitalReading) {
  const ews = calculateNZEWS(reading);
  const alerts: string[] = [];
  if (ews.score > 0) {
    alerts.push(`EWS Graded Score of ${ews.score} (${ews.zone} Zone)`);
  }
  
  if (reading.heartRate < 50 || reading.heartRate > 110) alerts.push('Abnormal Heart Rate');
  if (reading.systolicBp < 100 || reading.systolicBp > 220) alerts.push('Abnormal Systolic BP');
  if (reading.temperature < 36.0 || reading.temperature >= 38.0) alerts.push('Abnormal Temperature');
  if (reading.respiratoryRate < 12 || reading.respiratoryRate >= 21) alerts.push('Abnormal Respiratory Rate');
  if (reading.spo2 < 96) alerts.push('Hypoxia (SpO2 < 96%)');
  if (reading.supplementalO2) alerts.push('Supplemental Oxygen Active');
  if (reading.levelOfConsciousness !== 'A') alerts.push('Altered Mental Status (AVPU)');

  return {
    isAbnormal: ews.score >= 1,
    alerts
  };
}
