/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Heart, AlertTriangle, AlertCircle, Plus, ClipboardList, Info, Loader2 } from 'lucide-react';
import { VitalReading, PressureCheck, MorseFallRisk, Patient } from '../types';
import { calculateMorseFallRisk } from '../initialData';

// --- ADMIT NEW PATIENT FORM ---
interface AdmitPatientFormProps {
  onAdmit: (patientData: Omit<Patient, 'id' | 'vitals' | 'pressureChecks' | 'fallRisk'>) => void;
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
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-emerald-600" />
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
        <div id="admit-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-rose-50 border border-rose-100 text-rose-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
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
            <span className="text-slate-600 font-medium">I confirm I have physically assessed this patient, verified their identity, and measured their baseline vitals and demographics prior to admission.</span>
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
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
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
              Admit Patient
            </>
          )}
        </button>
      </div>
    </form>
  );
}


// --- LOG VITAL SIGNS FORM ---
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
  const [nurseInitials, setNurseInitials] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

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

    const hrVal = parseInt(heartRate);
    const sysVal = parseInt(systolicBp);
    const diaVal = parseInt(diastolicBp);
    const tempVal = parseFloat(temperature);
    const rrVal = parseInt(respiratoryRate);
    const spo2Val = parseInt(spo2);

    if (isNaN(hrVal) || hrVal <= 20 || hrVal > 300) {
      setError('Please enter a physiologically sound Heart Rate (20 - 300 bpm).');
      return;
    }
    if (isNaN(sysVal) || sysVal <= 40 || sysVal > 300) {
      setError('Please enter a valid Systolic Blood Pressure.');
      return;
    }
    if (isNaN(diaVal) || diaVal <= 20 || diaVal > 200) {
      setError('Please enter a valid Diastolic Blood Pressure.');
      return;
    }
    if (isNaN(tempVal) || tempVal < 25 || tempVal > 46) {
      setError('Please enter a valid Temperature (25°C - 46°C).');
      return;
    }
    if (isNaN(rrVal) || rrVal < 4 || rrVal > 80) {
      setError('Please enter a valid Respiratory Rate (4 - 80).');
      return;
    }
    if (isNaN(spo2Val) || spo2Val < 50 || spo2Val > 100) {
      setError('Oxygen Saturation (SpO2) must be between 50% and 100%.');
      return;
    }

    onLog({
      heartRate: hrVal,
      systolicBp: sysVal,
      diastolicBp: diaVal,
      temperature: tempVal,
      respiratoryRate: rrVal,
      spo2: spo2Val,
      nurseInitials: nurseInitials.trim().toUpperCase()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
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

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Resp Rate *</label>
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

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Assessed Clinician Key Initials *</label>
        <input
          id="vitals-nurse"
          type="text"
          maxLength={4}
          className="w-24 text-sm border border-slate-300 rounded px-3 py-2 bg-white select-all text-center uppercase font-mono font-bold"
          placeholder="MK"
          value={nurseInitials}
          onChange={(e) => setNurseInitials(e.target.value)}
          required
        />
      </div>

      {error && (
        <div id="vitals-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-rose-50 border border-rose-100 text-rose-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
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
            <span className="text-slate-600 font-medium">I confirm I have physically assessed the patient, measured these vitals bedside, and validated the device alarms.</span>
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
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
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


// --- LOG PRESSURE AREA CARE FORM ---
interface LogPressureFormProps {
  onLog: (pressureData: Omit<PressureCheck, 'id' | 'timestamp'>) => void;
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

    onLog({
      skinIntact,
      rednessPresence,
      repositioned,
      notes: notes.trim(),
      nurseInitials: nurseInitials.trim().toUpperCase()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 animate-fadeIn">
      <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs flex gap-2 text-sky-800">
        <Info className="h-4 w-4 shrink-0 text-sky-600" />
        <span>Standard practice requires full head-to-toe inspection of skin, particularly heels, sacrum, occiput, and scapulae, followed by turn logs.</span>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="pressure-skin-intact"
            type="checkbox"
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded cursor-pointer"
            checked={skinIntact}
            onChange={(e) => setSkinIntact(e.target.checked)}
          />
          <div className="text-xs">
            <span className="font-bold block text-slate-700">Skin Intact & Clear</span>
            <span className="text-slate-500">No blisters, breaks, cracking, or open wounds on key pressure nodes.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="pressure-redness"
            type="checkbox"
            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded cursor-pointer"
            checked={rednessPresence}
            onChange={(e) => setRednessPresence(e.target.checked)}
          />
          <div className="text-xs">
            <span className="font-bold block text-slate-700 text-rose-700">Redness/Erythema Present (Non-blanching)</span>
            <span className="text-slate-500">Persistent hyperpigmentation or redness that does not blanch on compression.</span>
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
          <div className="text-xs">
            <span className="font-bold block text-slate-700">Patient Repositioned/Turned</span>
            <span className="text-slate-500">Repositioned (e.g. Left Lateral, Right Lateral, Semi-Fowlers, high-Fowlers or offloaded).</span>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Skin Check Bedside Notes</label>
        <textarea
          id="pressure-notes"
          rows={2}
          className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white"
          placeholder="Describe bone protection measures, barrier creams, or clinical signs observed..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Assessed Clinician Key Initials *</label>
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
        <div id="pressure-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-rose-50 border border-rose-100 text-rose-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
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
            <span className="text-slate-600 font-medium">I confirm I have physically assessed the patient’s skin, confirmed appropriate offloading, and performed the pressure care audit at bedside.</span>
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
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
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
              Log Pressure Care Check
            </>
          )}
        </button>
      </div>
    </form>
  );
}


// --- MORSE FALL RISK CALCULATOR ---
interface MorseFallCalculatorProps {
  initialRisk: MorseFallRisk;
  onSave: (riskAssessment: MorseFallRisk) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function MorseFallCalculator({ initialRisk, onSave, onCancel, isProcessing = false }: MorseFallCalculatorProps) {
  const [historyOfFalls, setHistoryOfFalls] = useState(initialRisk.historyOfFalls);
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState(initialRisk.secondaryDiagnosis);
  const [ambulatoryAid, setAmbulatoryAid] = useState<'none' | 'cane_walker' | 'furniture_clinging'>(initialRisk.ambulatoryAid);
  const [ivTherapy, setIvTherapy] = useState(initialRisk.ivTherapy);
  const [gait, setGait] = useState<'normal' | 'weak' | 'impaired'>(initialRisk.gait);
  const [mentalStatus, setMentalStatus] = useState<'oriented' | 'overestimates'>(initialRisk.mentalStatus);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Tally live score calculation
  const liveMorse = calculateMorseFallRisk(
    historyOfFalls,
    secondaryDiagnosis,
    ambulatoryAid,
    ivTherapy,
    gait,
    mentalStatus
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('You must confirm physical assessment of patient mobility and balance to save fall risk records.');
      return;
    }

    onSave({
      ...liveMorse,
      updatedAt: new Date().toISOString()
    });
  };

  const scoreClass = (score: number) => {
    if (score >= 45) return 'bg-rose-50 border-rose-300 text-rose-900';
    if (score >= 25) return 'bg-amber-50 border-amber-300 text-amber-900';
    return 'bg-emerald-50 border-emerald-300 text-emerald-950';
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-slate-800 text-xs">
      <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 flex gap-2">
        <ClipboardList className="h-4 w-4 shrink-0 text-slate-600" />
        <span className="text-[11px] leading-tight text-slate-600">
          The Morse Fall Scale is an evidence-based clinical assessment tool. Scores: <b>0-24</b> Low Risk, <b>25-44</b> Medium Risk, <b>&ge;45</b> High Risk. Tailor patient mobilizations and safety equipment accordingly.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">1. History of Falling *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="morse-fall-history-no"
                type="button"
                onClick={() => setHistoryOfFalls(false)}
                className={`p-2 rounded border text-center font-medium transition ${!historyOfFalls ? 'bg-sky-100 border-sky-400 text-sky-950' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                No (0 pts)
              </button>
              <button
                id="morse-fall-history-yes"
                type="button"
                onClick={() => setHistoryOfFalls(true)}
                className={`p-2 rounded border text-center font-medium transition ${historyOfFalls ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Yes, within 3 mos (25 pts)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">2. Secondary Medical Diagnosis *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="morse-secondary-no"
                type="button"
                onClick={() => setSecondaryDiagnosis(false)}
                className={`p-2 rounded border text-center font-medium transition ${!secondaryDiagnosis ? 'bg-sky-100 border-sky-400 text-sky-950' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                No (0 pts)
              </button>
              <button
                id="morse-secondary-yes"
                type="button"
                onClick={() => setSecondaryDiagnosis(true)}
                className={`p-2 rounded border text-center font-medium transition ${secondaryDiagnosis ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Yes, &ge; 2 diagnoses (15)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">3. Intravenous (IV) Therapy / Lock *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="morse-iv-no"
                type="button"
                onClick={() => setIvTherapy(false)}
                className={`p-2 rounded border text-center font-medium transition ${!ivTherapy ? 'bg-sky-100 border-sky-400 text-sky-950' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                No (0 pts)
              </button>
              <button
                id="morse-iv-yes"
                type="button"
                onClick={() => setIvTherapy(true)}
                className={`p-2 rounded border text-center font-medium transition ${ivTherapy ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Yes (20 pts)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">4. Ambulatory Assistive Aids *</label>
            <div className="space-y-1.5 text-xs">
              <button
                id="morse-aid-none"
                type="button"
                onClick={() => setAmbulatoryAid('none')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${ambulatoryAid === 'none' ? 'bg-sky-100 border-sky-400 text-sky-950 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>None / Full Bedrest / Nurse Assisted</span>
                <span>0 pts</span>
              </button>
              <button
                id="morse-aid-crutches"
                type="button"
                onClick={() => setAmbulatoryAid('cane_walker')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${ambulatoryAid === 'cane_walker' ? 'bg-amber-100 border-amber-400 text-amber-950 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>Cane / Walker / Crutches</span>
                <span>15 pts</span>
              </button>
              <button
                id="morse-aid-furniture"
                type="button"
                onClick={() => setAmbulatoryAid('furniture_clinging')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${ambulatoryAid === 'furniture_clinging' ? 'bg-rose-100 border-rose-500 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>Clings to furniture for balance</span>
                <span>30 pts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">5. Gait Status & Transition *</label>
            <div className="space-y-1.5 text-xs">
              <button
                id="morse-gait-normal"
                type="button"
                onClick={() => setGait('normal')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${gait === 'normal' ? 'bg-sky-100 border-sky-400 text-sky-950 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>Normal gait / bedrest / wheelchair</span>
                <span>0 pts</span>
              </button>
              <button
                id="morse-gait-weak"
                type="button"
                onClick={() => setGait('weak')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${gait === 'weak' ? 'bg-amber-100 border-amber-400 text-amber-950 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>Weak (stooped, slow transfer, mild drag)</span>
                <span>10 pts</span>
              </button>
              <button
                id="morse-gait-impaired"
                type="button"
                onClick={() => setGait('impaired')}
                className={`w-full p-2 rounded border text-left flex justify-between items-center transition ${gait === 'impaired' ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span>Impaired (requires support, struggles to lift limbs)</span>
                <span>20 pts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">6. Mental / Cognitive Status *</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                id="morse-mental-oriented"
                type="button"
                onClick={() => setMentalStatus('oriented')}
                className={`p-2 rounded border text-center font-medium transition ${mentalStatus === 'oriented' ? 'bg-sky-100 border-sky-400 text-sky-950' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Oriented to own limits (0)
              </button>
              <button
                id="morse-mental-overestimates"
                type="button"
                onClick={() => setMentalStatus('overestimates')}
                className={`p-2 rounded border text-center font-medium transition ${mentalStatus === 'overestimates' ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Overestimates / forgets limits (15)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULATED VALUE HEADER */}
      <div className={`p-4 rounded-lg border text-center ${scoreClass(liveMorse.score)}`}>
        <div className="text-xs uppercase font-semibold text-slate-600">Calculated Morse Tally</div>
        <div className="text-3xl font-extrabold tracking-tight my-1">{liveMorse.score} Points</div>
        <div className="text-sm font-black flex items-center justify-center gap-1">
          {liveMorse.riskLevel === 'High' && <AlertTriangle className="h-4 w-4 animate-bounce text-rose-600" />}
          Morse Fall Level: {liveMorse.riskLevel} Risk
        </div>
      </div>

      {error && (
        <div id="morse-error-alert" className="flex items-center gap-1.5 p-2.5 rounded bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
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
          <div className="text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">Clinical Safety Mandate</span>
            <span className="text-slate-600 font-medium">I confirm I have physically assessed this patient’s balance, active lines, mental posture, and gait at bedside.</span>
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
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
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
              Save Fall Assessment
            </>
          )}
        </button>
      </div>
    </form>
  );
}
