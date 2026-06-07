/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  AlertCircle, 
  ClipboardList, 
  Info, 
  Loader2, 
  Check, 
  Sliders, 
  CheckSquare, 
  Activity, 
  Lock
} from 'lucide-react';
import { VitalReading, PressureCheck, BradenAssessment, FRATAssessment, Patient } from '../types';
import { calculateNZEWS, calculateBradenRisk, calculateFRATRisk } from '../initialData';

// --- ADMIT NEW PATIENT FORM ---
interface AdmitPatientFormProps {
  onAdmit: (patientData: Omit<Patient, 'id' | 'vitals' | 'pressureChecks' | 'bradenAssessment' | 'fratAssessment'>) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function AdmitPatientForm({ onAdmit, onCancel, isProcessing = false }: AdmitPatientFormProps) {
  const [bed, setBed] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bed || !name || !age || !height || !weight) {
      setError('Please complete all demographic fields.');
      return;
    }

    if (!confirmed) {
      setError('You must physically assess the patient to confirm admission.');
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
      setError('Please select a valid clinical age.');
      return;
    }

    if (isNaN(heightNum) || heightNum < 30 || heightNum > 250) {
      setError('Please input a valid height.');
      return;
    }

    if (isNaN(weightNum) || weightNum < 2 || weightNum > 400) {
      setError('Please input a valid weight.');
      return;
    }

    onAdmit({
      bed,
      name,
      age: ageNum,
      gender,
      height: heightNum,
      weight: weightNum,
      admittedAt: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
      <div className="bg-blue-50 border border-blue-200 text-[#1D529E] rounded-lg p-3 text-xs flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-[#1D529E]" />
        <span>Admitting a patient establishes their digital clinical record on this ward. Ensure physical baseline measurements are accurate.</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Bed Assignment *</label>
          <input
            id="admit-bed"
            type="text"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 304-A"
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Full Name *</label>
          <input
            id="admit-name"
            type="text"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. Robert Miller"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Age *</label>
          <input
            id="admit-age"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
          <select
            id="admit-gender"
            className="w-full text-sm border border-slate-300 rounded px-3 py-[9px] bg-white text-slate-800"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (kg) *</label>
          <input
            id="admit-weight"
            type="number"
            step="0.1"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Height (cm) *</label>
        <input
          id="admit-height"
          type="number"
          className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          required
        />
      </div>

      {error && (
        <div id="admit-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-red-50 border border-red-100 text-red-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* MANDATORY CHECKBOX */}
      <div className={`p-4 rounded-lg border transition ${confirmed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/30 border-amber-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="admit-confirm-checkbox"
            type="checkbox"
            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">Clinical Safety Mandate</span>
            <span className="text-slate-600 font-medium font-sans">I confirm I have physically assessed this patient, verified their identity, and measured their baseline vitals and demographics prior to admission.</span>
          </div>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          id="admit-cancel-btn"
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          id="admit-submit-btn"
          type="submit"
          disabled={!confirmed || isProcessing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition shadow ${
            confirmed && !isProcessing
              ? 'bg-[#1D529E] text-white hover:bg-[#144283] cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-100" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Admit Bed Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}


// --- LOG VITAL SIGNS FORM (NZEWS GRADED) ---
interface LogVitalsFormProps {
  onLog: (vitals: Omit<VitalReading, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function LogVitalsForm({ onLog, onCancel, isProcessing = false }: LogVitalsFormProps) {
  const [heartRate, setHeartRate] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [temperature, setTemperature] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [supplementalO2, setSupplementalO2] = useState(false);
  const [levelOfConsciousness, setLevelOfConsciousness] = useState<'A' | 'V' | 'P' | 'U'>('A');
  const [nurseInitials, setNurseInitials] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const hrNum = parseInt(heartRate) || 0;
  const sysNum = parseInt(systolicBp) || 0;
  const tempNum = parseFloat(temperature) || 0;
  const rrNum = parseInt(respiratoryRate) || 0;
  const spo2Num = parseInt(spo2) || 0;

  // Real-time EWS Score & Zone calculation
  const liveEWS = calculateNZEWS({
    heartRate: hrNum,
    systolicBp: sysNum,
    temperature: tempNum,
    respiratoryRate: rrNum,
    spo2: spo2Num,
    supplementalO2,
    levelOfConsciousness
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!heartRate || !systolicBp || !diastolicBp || !temperature || !respiratoryRate || !spo2 || !nurseInitials) {
      setError('Please log all core clinical vital signs.');
      return;
    }

    if (!confirmed) {
      setError('You must confirm physical assessment of the patient to save vital entries.');
      return;
    }

    if (hrNum <= 20 || hrNum > 300) {
      setError('Please enter a physiologically sound Heart Rate (20 - 300 bpm).');
      return;
    }
    if (sysNum <= 40 || sysNum > 300) {
      setError('Please enter a valid Systolic Blood Pressure.');
      return;
    }
    const diaNum = parseInt(diastolicBp);
    if (isNaN(diaNum) || diaNum <= 20 || diaNum > 200) {
      setError('Please enter a valid Diastolic Blood Pressure.');
      return;
    }
    if (tempNum < 25 || tempNum > 46) {
      setError('Please enter a valid Temperature (25°C - 46°C).');
      return;
    }
    if (rrNum < 4 || rrNum > 80) {
      setError('Please enter a valid Respiratory Rate (4 - 80).');
      return;
    }
    if (spo2Num < 50 || spo2Num > 100) {
      setError('Oxygen Saturation (SpO2) must be between 50% and 100%.');
      return;
    }

    onLog({
      heartRate: hrNum,
      systolicBp: sysNum,
      diastolicBp: diaNum,
      temperature: tempNum,
      respiratoryRate: rrNum,
      spo2: spo2Num,
      supplementalO2,
      levelOfConsciousness,
      nzewsScore: liveEWS.score,
      nzewsZone: liveEWS.zone,
      nurseInitials: nurseInitials.trim().toUpperCase()
    });
  };

  // Get Styling for Zones
  const getZoneStylesArr = (zone: string) => {
    switch(zone) {
      case 'BLUE':
        return {
          bg: 'bg-blue-50 border-blue-400 text-blue-950',
          titleColor: 'text-blue-900',
          badge: 'bg-blue-600 text-white animate-pulse',
          guideline: 'Immediate Senior RMO and ICU outreach review. Stay with patient. continuous/q15-30m observations. Consider Clinical Emergency Activation!'
        };
      case 'RED':
        return {
          bg: 'bg-red-50 border-red-300 text-red-950',
          titleColor: 'text-red-900',
          badge: 'bg-red-650 text-white animate-pulse',
          guideline: 'Senior RMO bedside review to occur within 20 mins! Inform NIC and CTC, q30m observations. Nurse to stay with patient for initial assessment.'
        };
      case 'ORANGE':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          titleColor: 'text-amber-900',
          badge: 'bg-amber-600 text-white',
          guideline: 'Escalate to NIC, discuss, and escalate to CTC or house surgeon. Increase observations to q30-60 mins until physician review.'
        };
      case 'YELLOW':
        return {
          bg: 'bg-yellow-50 border-yellow-300 text-yellow-950',
          titleColor: 'text-yellow-850',
          badge: 'bg-yellow-500 text-slate-950',
          guideline: 'Manage pain, fever, distress. Observe trends. Escalate to NIC if concerned or rapid change of NZEWS occur. Consider increasing obs frequency.'
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          titleColor: 'text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          guideline: 'Patient remains stable within normal references. Continue scheduled ward observations as planned.'
        };
    }
  };

  const zoneStyle = getZoneStylesArr(liveEWS.zone);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex gap-2">
        <Activity className="h-4 w-4 shrink-0 text-[#1D529E]" />
        <span className="text-[11px] leading-tight text-slate-600">
          <b>NZ Early Warning Score (NZEWS) Protocol:</b> Real-time parameters are graded according to Canterbury DHB clinical guidelines to support rapid recognition of deteroriating adult patients.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Heart Rate (bpm) *</label>
          <input
            id="vitals-hr"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 72"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">SpO2 Oxygen Saturation (%) *</label>
          <input
            id="vitals-spo2"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 98"
            max="100"
            min="50"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Systolic Blood Pressure (mmHg) *</label>
          <input
            id="vitals-systolic"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 120"
            value={systolicBp}
            onChange={(e) => setSystolicBp(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Diastolic Blood Pressure (mmHg) *</label>
          <input
            id="vitals-diastolic"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 80"
            value={diastolicBp}
            onChange={(e) => setDiastolicBp(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Temperature (°C) *</label>
          <input
            id="vitals-temp"
            type="number"
            step="0.1"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 36.8"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Respiratory Rate (breaths/min) *</label>
          <input
            id="vitals-rr"
            type="number"
            className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
            placeholder="e.g. 16"
            value={respiratoryRate}
            onChange={(e) => setRespiratoryRate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* NEW NZEWS PARAMETERS */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-150 rounded-lg">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Oxygen Therapy *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSupplementalO2(false)}
              className={`p-2 rounded border text-center font-medium text-xs transition ${!supplementalO2 ? 'bg-[#EEF2F6] border-blue-400 text-blue-950 font-semibold' : 'bg-white border-slate-200'}`}
            >
              Room Air (0)
            </button>
            <button
              type="button"
              onClick={() => setSupplementalO2(true)}
              className={`p-2 rounded border text-center font-medium text-xs transition ${supplementalO2 ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold' : 'bg-white border-slate-200'}`}
            >
              Supplemental O₂ (2)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">AVPU Consciousness Level *</label>
          <select
            value={levelOfConsciousness}
            onChange={(e) => setLevelOfConsciousness(e.target.value as any)}
            className="w-full text-xs border border-slate-300 rounded p-[9px] bg-white text-slate-800"
          >
            <option value="A">Alert (A) - [0 pts]</option>
            <option value="V">Voice response (V) - [3 pts]</option>
            <option value="P">Pain response (P) - [3 pts]</option>
            <option value="U">Unresponsive or fitting (U) - [10 pts]</option>
          </select>
        </div>
      </div>

      {/* LIVE GRADED SCORE PREVIEW & RECOMMENDATION BLOCK */}
      {(hrNum > 0 || sysNum > 0 || tempNum > 0 || rrNum > 0 || spo2Num > 0) && (
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition ${zoneStyle.bg}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Live Canterbury DHB NZEWS Grader</span>
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${zoneStyle.badge}`}>
              {liveEWS.zone} Zone (EWS {liveEWS.score})
            </span>
          </div>

          <div className="text-sm font-black mt-1 leading-snug flex items-start gap-1.5 font-sans">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-slate-700" />
            <div>
              <span className={`block font-extrabold ${zoneStyle.titleColor}`}>Guideline Mandatory Action:</span>
              <p className="font-medium text-xs text-slate-800 mt-1 leading-relaxed">
                {zoneStyle.guideline}
              </p>
            </div>
          </div>

          {/* Points breakdown summary for education */}
          <div className="mt-2 pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-600 font-mono grid grid-cols-4 gap-x-3 gap-y-1">
            <span>RR: <b>{liveEWS.breakdown.rr}p</b></span>
            <span>SpO2: <b>{liveEWS.breakdown.spo2}p</b></span>
            <span>Aux-O₂: <b>{liveEWS.breakdown.oxygen}p</b></span>
            <span>Temp: <b>{liveEWS.breakdown.temp}p</b></span>
            <span>SBP: <b>{liveEWS.breakdown.sbp}p</b></span>
            <span>HR: <b>{liveEWS.breakdown.hr}p</b></span>
            <span>AVPU: <b>{liveEWS.breakdown.loc}p</b></span>
            <span className="col-span-1 text-right text-slate-700">Total: <strong className="font-bold">{liveEWS.score}</strong></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Clinician Signing Initials *</label>
          <input
            id="vitals-nurse"
            type="text"
            maxLength={4}
            className="w-24 text-sm border border-slate-300 rounded px-3 py-2 bg-white text-center uppercase font-mono font-bold"
            placeholder="MK"
            value={nurseInitials}
            onChange={(e) => setNurseInitials(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div id="vitals-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-red-50 border border-red-100 text-red-850 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* MANDATORY CHECKBOX */}
      <div className={`p-4 rounded-lg border transition ${confirmed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/30 border-amber-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="vitals-confirm-checkbox"
            type="checkbox"
            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">Clinical Safety Mandate</span>
            <span className="text-slate-600 font-medium font-sans">I confirm I have physically assessed the patient, measured these vitals bedside, and validated appropriate Canterbury DHB escalation rules.</span>
          </div>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          id="vitals-cancel-btn"
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          id="vitals-submit-btn"
          type="submit"
          disabled={!confirmed || isProcessing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition shadow ${
            confirmed && !isProcessing
              ? 'bg-[#1D529E] text-white hover:bg-[#144283] cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-100" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Record Readings
            </>
          )}
        </button>
      </div>
    </form>
  );
}


// --- LOG PRESSURE AREA CARE FORM (WITH REAL-TIME BRADEN RISK ASSESSMENT BOARD) ---
interface LogPressureFormProps {
  onLog: (pressureData: Omit<PressureCheck, 'id' | 'timestamp'> & { bradenObj?: BradenAssessment }) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function LogPressureForm({ onLog, onCancel, isProcessing = false }: LogPressureFormProps) {
  const [skinIntact, setSkinIntact] = useState(true);
  const [rednessPresence, setRednessPresence] = useState(false);
  const [repositioned, setRepositioned] = useState(true);
  const [notes, setNotes] = useState('');
  const [nurseInitials, setNurseInitials] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Braden scale sub-states
  const [sensory, setSensory] = useState(4);
  const [moist, setMoist] = useState(4);
  const [activity, setActivity] = useState(4);
  const [mobility, setMobility] = useState(4);
  const [nutrition, setNutrition] = useState(4);
  const [frictionShear, setFrictionShear] = useState(3);
  const [includeBraden, setIncludeBraden] = useState(false);

  const bradenCalc = calculateBradenRisk({
    sensory,
    moist: moist,
    activity,
    mobility,
    nutrition,
    frictionShear
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nurseInitials) {
      setError('Please provide nurse signing initials.');
      return;
    }

    if (!confirmed) {
      setError('You must confirm physical assessment of the patient’s skin.');
      return;
    }

    const bradenObj: BradenAssessment | undefined = includeBraden ? {
      sensory,
      moist: moist,
      activity,
      mobility,
      nutrition,
      frictionShear,
      score: bradenCalc.score,
      riskLevel: bradenCalc.riskLevel,
      updatedAt: new Date().toISOString()
    } : undefined;

    onLog({
      skinIntact,
      rednessPresence,
      repositioned,
      notes: notes.trim(),
      nurseInitials: nurseInitials.trim().toUpperCase(),
      bradenObj
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 text-xs">
      <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs flex gap-2 text-sky-850 font-sans">
        <Info className="h-4 w-4 shrink-0 text-sky-600" />
        <span><b>Bony Prominence Skin Standard:</b> In accordance with Braden guidelines, inspect heels, sacrum, and occiput. Log skin status and perform Braden risk scoring audit below.</span>
      </div>

      <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-150 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="pressure-skin-intact"
            type="checkbox"
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded cursor-pointer"
            checked={skinIntact}
            onChange={(e) => setSkinIntact(e.target.checked)}
          />
          <div className="text-xs font-sans">
            <span className="font-bold block text-slate-700">Skin Intact & Clear</span>
            <span className="text-slate-500">No blisters, friction breaks, or cracking on heels, sacrum or shoulder blades.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="pressure-redness"
            type="checkbox"
            className="h-4 w-4 text-rose-650 focus:ring-rose-500 border-slate-300 rounded cursor-pointer"
            checked={rednessPresence}
            onChange={(e) => setRednessPresence(e.target.checked)}
          />
          <div className="text-xs font-sans">
            <span className="font-bold block text-rose-700">Redness/Erythema Present (Non-blanching)</span>
            <span className="text-slate-500">Persistent hyperpigmentation or redness that does not blanch on compression check.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="pressure-repositioned"
            type="checkbox"
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded cursor-pointer"
            checked={repositioned}
            onChange={(e) => setRepositioned(e.target.checked)}
          />
          <div className="text-xs font-sans">
            <span className="font-bold block text-slate-700">Patient Repositioned / Turned</span>
            <span className="text-slate-500">Heel protectors checked, repositioned (Left Side, Right Side, Fowlers position).</span>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Skin Assessment Bedside Notes</label>
        <textarea
          id="pressure-notes"
          rows={2}
          className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white"
          placeholder="Describe bone protection measures, barrier creams, or erythema observed..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* INTERACTIVE BRADEN RISK SCALE SECTION */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIncludeBraden(!includeBraden)}
          className={`w-full flex justify-between items-center px-4 py-3 text-xs font-bold transition border-b ${
            includeBraden ? 'bg-[#EEF2F6] text-[#1D529E] border-slate-200' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>Perform Full Braden Risk Assessment Audit</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-blue-500">
            {includeBraden ? '[ Active Panel ]' : '[ Click to Expand ]'}
          </span>
         </button>

         {includeBraden && (
           <div className="p-4 bg-white space-y-4 animate-fadeIn text-xs">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
               {/* Sensory Perception */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Sensory Perception</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Completely Limited (Unresponsive to pain stimuli)' },
                     { value: 2, label: '2: Very Limited (Responds only to painful stimuli)' },
                     { value: 3, label: '3: Slightly Limited (Responds to verbal commands but can\'t always communicate)' },
                     { value: 4, label: '4: No Impairment (Responds to verbal commands normally)' },
                   ].map(opt => {
                     const isSelected = sensory === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setSensory(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Moisture */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Moisture exposure</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Constantly Moist (Perspiration, urine, drainage... always wet)' },
                     { value: 2, label: '2: Very Moist (Linen changes needed every 8h)' },
                     { value: 3, label: '3: Occasionally Moist (Linen changes needed every 12h)' },
                     { value: 4, label: '4: Rarely Moist (Linen changed every 24h)' },
                   ].map(opt => {
                     const isSelected = moist === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setMoist(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Activity */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Degree of Physical Activity</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Bedfast (Confined to bed completely)' },
                     { value: 2, label: '2: Chairfast (Severely limited walking, needs chair help)' },
                     { value: 3, label: '3: Walks Occasionally (Very short distance, spends most time in chair/bed)' },
                     { value: 4, label: '4: Walks Frequently (Walks outside room 2x during waking hours)' },
                   ].map(opt => {
                     const isSelected = activity === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setActivity(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Mobility */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Ability to Change / Maintain Position</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Completely Immobile (No changes made without help)' },
                     { value: 2, label: '2: Very Limited (Occasional slight changes but unable to turn self)' },
                     { value: 3, label: '3: Slightly Limited (Frequent slight changes independently)' },
                     { value: 4, label: '4: No Limitations (Major regular position changes alone)' },
                   ].map(opt => {
                     const isSelected = mobility === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setMobility(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Nutrition */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Nutritional Intake Pattern</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Very Poor (NPO or clear fluids > 5 days; never eats complete meal)' },
                     { value: 2, label: '2: Inadequate (Receives tube feeds/TPN with low values, eats < half meal)' },
                     { value: 3, label: '3: Adequate (Eats half of most meals, gets 4 protein servings/day)' },
                     { value: 4, label: '4: Excellent (Eats most of every normal meal, refuses nothing)' },
                   ].map(opt => {
                     const isSelected = nutrition === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setNutrition(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Friction & Shear */}
               <div className="space-y-1.5">
                 <label className="block text-[11px] font-bold text-slate-700">Friction & Shear Risk</label>
                 <div className="space-y-1">
                   {[
                     { value: 1, label: '1: Problem (Mild-to-Max assistance for moving, constant rubbing)' },
                     { value: 2, label: '2: Potential Problem (Moves feebly, min assistance, sliding some)' },
                     { value: 3, label: '3: No Apparent Problem (Moves independently, strength to lift self)' },
                   ].map(opt => {
                     const isSelected = frictionShear === opt.value;
                     return (
                       <button
                         key={opt.value}
                         type="button"
                         onClick={() => setFrictionShear(opt.value)}
                         className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition select-none ${
                           isSelected 
                             ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                             : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                           isSelected 
                             ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                             : 'border-slate-300 bg-white'
                         }`}>
                           {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                         </div>
                         <span className="text-[10px] leading-tight">{opt.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

             </div>

             {/* Dynamic calculation results */}
             <div className={`p-4 rounded-xl border flex flex-col gap-2 transition ${
               bradenCalc.score <= 12 ? 'bg-red-50 border-red-300' : 'bg-[#EEF2F6] border-slate-200'
             }`}>
               <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-500">
                 <span>Braden Risk Tool Tally</span>
                 <span className={`px-2.5 py-0.5 rounded-full ${
                   bradenCalc.score <= 12 ? 'bg-red-650 text-white animate-pulse' : 'bg-slate-300 text-slate-800'
                 }`}>
                   {bradenCalc.riskLevel} Risk (Score {bradenCalc.score}/23)
                 </span>
               </div>

               <div className="mt-1 flex gap-2">
                 <AlertTriangle className={`h-4 w-4 shrink-0 transition ${bradenCalc.score <= 12 ? 'text-[#D11C42]' : 'text-slate-400'}`} />
                 <div className="text-[11px]">
                   {bradenCalc.score <= 12 ? (
                     <p className="text-red-950 font-extrabold">
                       CRITICAL ACTION REQUIRED: Patient score ({bradenCalc.score}) is 12 or below. IN ACCORDANCE WITH BRADEN GUIDELINES, IMMEDIATELY IMPLEMENT A DYNAMIC AIR MATTRESS PROTOCOL AND SACRAL CHECK SYSTEM.
                     </p>
                   ) : (
                     <p className="text-slate-700 font-medium font-sans">
                       Score indicates stable-to-mild threat. Maintain the standard Q2H regular turning monitor and offloading standards.
                     </p>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Assessed Nurse Initials *</label>
          <input
            id="pressure-nurse"
            type="text"
            maxLength={4}
            className="w-24 text-sm border border-slate-300 rounded px-3 py-2 bg-white text-center uppercase font-mono font-bold"
            placeholder="SR"
            value={nurseInitials}
            onChange={(e) => setNurseInitials(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div id="pressure-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-red-50 border border-red-100 text-red-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* MANDATORY CHECKBOX */}
      <div className={`p-4 rounded-lg border transition ${confirmed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/30 border-amber-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="pressure-confirm-checkbox"
            type="checkbox"
            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">Clinical Safety Mandate</span>
            <span className="text-slate-600 font-medium font-sans">I confirm I have physically assessed the patient’s skin, confirmed appropriate offloading, and performed the pressure care audit at bedside.</span>
          </div>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          id="pressure-cancel-btn"
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          id="pressure-submit-btn"
          type="submit"
          disabled={!confirmed || isProcessing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition shadow ${
            confirmed && !isProcessing
              ? 'bg-[#1D529E] text-white hover:bg-[#144283] cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-100" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Log Bedside pressure assessment
            </>
          )}
        </button>
      </div>
    </form>
  );
}


// --- PENINSULA HEALTH FALLS RISK ASSESSMENT TOOL (FRAT) CALCULATOR ---
interface MorseFallCalculatorProps {
  initialRisk: any; // Keep prop parameter to avoid breaking App.tsx layout
  onSave: (assessment: FRATAssessment) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function MorseFallCalculator({ initialRisk, onSave, onCancel, isProcessing = false }: MorseFallCalculatorProps) {
  // Map old Morse parameters optionally to standard initial state
  const [recentFalls, setRecentFalls] = useState<number>(2); // 2 | 4 | 6 | 8
  const [medications, setMedications] = useState<number>(1); // 1 | 2 | 3 | 4
  const [psychological, setPsychological] = useState<number>(1); // 1 | 2 | 3 | 4
  const [cognitiveStatus, setCognitiveStatus] = useState<number>(1); // 1 | 2 | 3 | 4
  
  // Automatics
  const [recentChangeMobility, setRecentChangeMobility] = useState(false);
  const [dizzinessPosturalHypotension, setDizzinessPosturalHypotension] = useState(false);

  // Checklist risk factors
  const [checklistVision, setChecklistVision] = useState(false);
  const [checklistMobility, setChecklistMobility] = useState(false);
  const [checklistTransfers, setChecklistTransfers] = useState(false);
  const [checklistBehaviours, setChecklistBehaviours] = useState(false);
  const [checklistADLs, setChecklistADLs] = useState(false);
  const [checklistEnvironment, setChecklistEnvironment] = useState(false);
  const [checklistNutrition, setChecklistNutrition] = useState(false);
  const [checklistContinence, setChecklistContinence] = useState(false);
  const [checklistOther, setChecklistOther] = useState(false);

  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Tally live score calculation
  const liveFRAT = calculateFRATRisk({
    recentFalls,
    medications,
    psychological,
    cognitiveStatus,
    recentChangeMobility,
    dizzinessPosturalHypotension
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('You must confirm physical assessment of patient mobility and balance to save fall risk records.');
      return;
    }

    onSave({
      recentFalls,
      medications,
      psychological,
      cognitiveStatus,
      recentChangeMobility,
      dizzinessPosturalHypotension,
      checklistVision,
      checklistMobility,
      checklistTransfers,
      checklistBehaviours,
      checklistADLs,
      checklistEnvironment,
      checklistNutrition,
      checklistContinence,
      checklistOther,
      score: liveFRAT.score,
      riskLevel: liveFRAT.riskLevel,
      updatedAt: new Date().toISOString()
    });
  };

  const scoreClass = (score: number, level: string) => {
    if (level === 'High') return 'bg-red-50 border-red-300 text-red-950';
    if (level === 'Medium') return 'bg-amber-50 border-amber-300 text-amber-950';
    return 'bg-emerald-50 border-emerald-300 text-emerald-950';
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-slate-800 text-xs">
      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 flex gap-2">
        <ClipboardList className="h-4 w-4 shrink-0 text-[#1D529E]" />
        <span className="text-[11px] leading-tight text-slate-600">
          <b>Falls Risk Assessment Tool (FRAT) Guidelines:</b> Abbreviated Peninsula Health clinical standard to calculate patient threat brackets. Scores: <b>5-11</b> Low Risk, <b>12-15</b> Medium Risk, <b>16-20</b> High Risk. Note that dizziness or functional change forces an automatic HIGH Risk alert.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PART 1 - CORE COGNITIVE STATUS SCORING */}
        <div className="space-y-4 p-3 bg-slate-50 border border-slate-150 rounded-lg">
          <h4 className="text-xs font-black uppercase text-[#1D529E] tracking-wider mb-1">Part 1: Fall Risk Parameters</h4>
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">1. History of Recent Falls</label>
            <div className="space-y-1">
              {[
                { value: 2, label: 'None in last 12 months [2 pts]' },
                { value: 4, label: 'One or more between 3 and 12 months ago [4 pts]' },
                { value: 6, label: 'One or more in last 3 months [6 pts]' },
                { value: 8, label: 'One or more in last 3 months whilst inpatient / resident [8 pts]' },
              ].map(opt => {
                const isSelected = recentFalls === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecentFalls(opt.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition select-none ${
                      isSelected 
                        ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected 
                        ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-[10.5px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">2. Medications (Sedatives, Diuretics, Antidepressants, etc.)</label>
            <div className="space-y-1">
              {[
                { value: 1, label: 'Not taking any of these listed drugs [1 pt]' },
                { value: 2, label: 'Taking exactly one listed compound [2 pts]' },
                { value: 3, label: 'Taking two listed compounds [3 pts]' },
                { value: 4, label: 'Taking more than two listed compounds [4 pts]' },
              ].map(opt => {
                const isSelected = medications === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMedications(opt.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition select-none ${
                      isSelected 
                        ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected 
                        ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-[10.5px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">3. Psychological Status</label>
            <div className="space-y-1">
              {[
                { value: 1, label: 'Does not appear to have anxiety, depression, or lack insight [1 pt]' },
                { value: 2, label: 'Appears mildly affected [2 pts]' },
                { value: 3, label: 'Appears moderately affected / reduced judgment [3 pts]' },
                { value: 4, label: 'Appears severely affected [4 pts]' },
              ].map(opt => {
                const isSelected = psychological === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPsychological(opt.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition select-none ${
                      isSelected 
                        ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected 
                        ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-[10.5px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700">4. Cognitive Status (Hodkinson AMTS Index)</label>
            <div className="space-y-1">
              {[
                { value: 1, label: 'AMTS 9-10 / 10 OR intact mental parameters [1 pt]' },
                { value: 2, label: 'AMTS 7-8: mildly impaired [2 pts]' },
                { value: 3, label: 'AMTS 5-6: moderately impaired [3 pts]' },
                { value: 4, label: 'AMTS 4 or less: severely impaired [4 pts]' },
              ].map(opt => {
                const isSelected = cognitiveStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCognitiveStatus(opt.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition select-none ${
                      isSelected 
                        ? 'bg-blue-50/70 border-[#1D529E] text-[#1D529E] font-bold shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected 
                        ? 'border-[#1D529E] bg-[#1D529E] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-[10.5px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automatics */}
          <div className="pt-2 border-t border-slate-250">
            <span className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Automatic High Risk Screeners</span>
            <div className="space-y-1.5 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 text-red-650 border-slate-300 rounded cursor-pointer"
                  checked={recentChangeMobility}
                  onChange={(e) => setRecentChangeMobility(e.target.checked)}
                />
                <span className="text-slate-700 font-medium">Recent change in mobility / functional status affecting safe walks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 text-red-650 border-slate-300 rounded cursor-pointer"
                  checked={dizzinessPosturalHypotension}
                  onChange={(e) => setDizzinessPosturalHypotension(e.target.checked)}
                />
                <span className="text-slate-700 font-medium">Unexplained dizziness / postural hypotension balance issues</span>
              </label>
            </div>
          </div>
        </div>

        {/* PART 2 - CLINICAL SYMPTOM CHECKLIST (Y/N Checklist) */}
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-150 rounded-lg flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-[#1D529E] tracking-wider mb-2">Part 2: FRAT Risk Factor Checklist</h4>
            <span className="block text-[10px] text-slate-500 mb-2 leading-tight">Identify any observable clinical risk markers currently presenting:</span>
            
            <div className="grid grid-cols-1 gap-1.5 text-[11px] font-sans pr-1 max-h-[220px] overflow-y-auto">
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistVision}
                  onChange={(e) => setChecklistVision(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Vision:</b> Observed difficulties finding way or seeing markings</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistMobility}
                  onChange={(e) => setChecklistMobility(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Mobility:</b> Status unsafe / impulsive / forgets walking aid</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistTransfers}
                  onChange={(e) => setChecklistTransfers(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Transfers:</b> Transfer status unsafe / over-reaches</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistBehaviours}
                  onChange={(e) => setChecklistBehaviours(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Behaviours:</b> Agitation / non-compliant with recommendations</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistADLs}
                  onChange={(e) => setChecklistADLs(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>ADLs:</b> Unsafe equipment use, inappropriate clothes/shoes</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistEnvironment}
                  onChange={(e) => setChecklistEnvironment(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Environment:</b> Bed-to-bathroom orientation problem</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistNutrition}
                  onChange={(e) => setChecklistNutrition(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Nutrition:</b> Underweight / low appetite / malnutrition indicators</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistContinence}
                  onChange={(e) => setChecklistContinence(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Continence:</b> Urgency / nocturia / frequent elimination trips</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer p-1 rounded hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={checklistOther}
                  onChange={(e) => setChecklistOther(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#1D529E] rounded border-slate-300"
                />
                <span><b>Other</b> environmental or clinical risk blockers</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULATED VALUE HEADER */}
      <div className={`p-4 rounded-lg border text-center transition ${scoreClass(liveFRAT.score, liveFRAT.riskLevel)}`}>
        <div className="text-xs uppercase font-semibold text-slate-500">Calculated FRAT Score Index</div>
        <div className="text-3xl font-black tracking-tight my-1">
          {liveFRAT.score} Points
        </div>
        <div className="text-xs font-black flex items-center justify-center gap-1.5">
          {liveFRAT.riskLevel === 'High' && (
            <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded animate-pulse">HIGH FALL ALERT</span>
          )}
          FRAT Clinical Categorization: {liveFRAT.riskLevel} Risk 
          {(recentChangeMobility || dizzinessPosturalHypotension) && ' (Triggered via Autonomic Screener)'}
        </div>

        {/* GUIDELINE RECS DISPLAY based ONLY on FRAT PDF */}
        <div className="mt-2 text-[11px] leading-relaxed border-t border-slate-200/50 pt-2 text-slate-800 font-sans text-left">
          {liveFRAT.riskLevel === 'High' ? (
            <p>
              <b>MANDATORY HIGH-RISK ACTIONS:</b> Immediately place <b>YELLOW fall socks</b>, lower bed to lowest locking position, activate <b>bed escape sensor pad alert</b>, and construct a targeted transfers protection action plan.
            </p>
          ) : liveFRAT.riskLevel === 'Medium' ? (
            <p>
              <b>MEDIUM RISK STANDARDS:</b> Verify ambulatory walker or cane is safely at bedside within hand reach, validate call-bell accessibility, and supervise bathroom trips.
            </p>
          ) : (
            <p>
              <b>LOW RISK PROTOCOLS:</b> Maintain standard room tidiness, confirm non-slip shoes, and preserve standard clinical pathway updates.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div id="morse-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-red-50 border border-red-100 text-red-850 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* MANDATORY CHECKBOX */}
      <div className={`p-4 rounded-lg border transition ${confirmed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/30 border-amber-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="morse-confirm-checkbox"
            type="checkbox"
            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <div className="text-xs font-sans">
            <span className="font-bold text-slate-800 block mb-0.5">Clinical Safety Mandate</span>
            <span className="text-slate-600 font-medium">I confirm I have physically assessed this patient’s cognitive impairment status, active drug medications, and physical balance boundaries at bedside.</span>
          </div>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          id="morse-cancel-btn"
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          id="morse-submit-btn"
          type="submit"
          disabled={!confirmed || isProcessing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition shadow ${
            confirmed && !isProcessing
              ? 'bg-[#1D529E] text-white hover:bg-[#144283] cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-100" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Record FRAT Assessment
            </>
          )}
        </button>
      </div>
    </form>
  );
}
