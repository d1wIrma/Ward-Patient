/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Heart, ClipboardCheck, AlertTriangle, 
  Clock, Ruler, Weight, ShieldAlert, BadgeInfo, CheckCircle, 
  ChevronRight, Search, Activity, RotateCcw, Calendar, CheckSquare, ListPlus,
  RefreshCw, Info, Lock, Loader2
} from 'lucide-react';
import { Patient, VitalReading, PressureCheck, MorseFallRisk } from './types';
import { initialPatients, checkVitalsAbnormal, getRelativeTime, calculateMorseFallRisk } from './initialData';
import { LogVitalsForm, LogPressureForm, MorseFallCalculator, AdmitPatientForm } from './components/ClinicalForms';
import { VitalCharts } from './components/VitalCharts';

export default function App() {
  // Sync state with localStorage
  const [patients, setPatients] = useState<Patient[]>(() => {
    const cached = localStorage.getItem('clinical_ward_patients');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached patient data, loading defaults");
      }
    }
    return initialPatients;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return patients[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'critical_vitals' | 'overdue_skin' | 'high_fall_risk'>('all');
  
  // Real-time tick state for pressure care evaluation (recalculates every 5 seconds)
  const [currentTime, setCurrentTime] = useState(new Date('2026-06-07T06:54:35Z'));

  // Modals / forms visibility
  const [activeModal, setActiveModal] = useState<'none' | 'admit' | 'log_vitals' | 'log_pressure' | 'assess_fall' | 'success'>('none');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDischarging, setIsDischarging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('clinical_ward_patients', JSON.stringify(patients));
  }, [patients]);

  // Live timer tick representing the clinical bedside timeframe (can accelerate/synchronize with real time)
  useEffect(() => {
    const timer = setInterval(() => {
      // Advance by 1 minute every 10 real seconds to make simulated countdown realistic but dynamic for testing
      setCurrentTime(prev => new Date(prev.getTime() + 60 * 1000));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  // RESET DATABASE CONTROL
  const handleResetData = () => {
    if (window.confirm("Restore default historical trial patients? This will wipe recent logs.")) {
      setIsResetting(true);
      setIsProcessing(true);
      setTimeout(() => {
        setPatients(initialPatients);
        setActivePatientId(initialPatients[0].id);
        setIsResetting(false);
        setIsProcessing(false);
        showSuccessAlert("Ward databases re-seeded with demonstration clinical baselines.");
      }, 800);
    }
  };

  // SUCCESS ALERT POPUP TRIGGER
  const showSuccessAlert = (msg: string) => {
    setSuccessMessage(msg);
    setActiveModal('success');
    setTimeout(() => {
      setActiveModal('none');
    }, 3500);
  };

  // Helper: skin checking timers
  const getSkinCheckDetails = (patient: Patient) => {
    if (patient.pressureChecks.length === 0) {
      return {
        status: 'none',
        remainingMin: 0,
        label: 'NEVER LOGGED',
        color: 'text-rose-900 bg-rose-50 border-rose-200'
      };
    }
    const sorted = [...patient.pressureChecks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const lastCheck = new Date(sorted[0].timestamp);
    const nextCheckDue = new Date(lastCheck.getTime() + 120 * 60 * 1000); // 2 hours
    const diffMs = nextCheckDue.getTime() - currentTime.getTime();
    const diffMin = Math.round(diffMs / (60 * 1000));

    if (diffMin <= 0) {
      return {
        status: 'overdue',
        remainingMin: diffMin,
        label: `OVERDUE BY ${Math.abs(diffMin)}m`,
        color: 'text-rose-700 bg-rose-100 border-rose-300 animate-pulse font-bold'
      };
    } else if (diffMin <= 30) {
      return {
        status: 'warning',
        remainingMin: diffMin,
        label: `DUE IN ${diffMin}m`,
        color: 'text-amber-700 bg-amber-100 border-amber-300 font-bold'
      };
    } else {
      return {
        status: 'safe',
        remainingMin: diffMin,
        label: `${diffMin}m remaining`,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }
  };

  // CLINICAL CORE HANDLERS
  const handleAdmitPatient = (newDemographics: Omit<Patient, 'id' | 'vitals' | 'pressureChecks' | 'fallRisk'>) => {
    setIsProcessing(true);
    const placeholderVitals: VitalReading = {
      id: 'init-v-' + Date.now(),
      timestamp: new Date().toISOString(),
      heartRate: 80,
      systolicBp: 120,
      diastolicBp: 80,
      temperature: 36.8,
      respiratoryRate: 16,
      spo2: 99,
      nurseInitials: 'ADM'
    };

    const initialFallRisk: MorseFallRisk = {
      historyOfFalls: false,
      secondaryDiagnosis: false,
      ambulatoryAid: 'none',
      ivTherapy: false,
      gait: 'normal',
      mentalStatus: 'oriented',
      score: 0,
      riskLevel: 'Low',
      updatedAt: new Date().toISOString()
    };

    const firstSkinCheck: PressureCheck = {
      id: 'init-p-' + Date.now(),
      timestamp: new Date().toISOString(),
      skinIntact: true,
      rednessPresence: false,
      repositioned: true,
      notes: 'Initial admission baseline skin check. Bedside clinical inspection confirms skin intact.',
      nurseInitials: 'ADM'
    };

    const newPatientObj: Patient = {
      id: 'PAT-' + (patients.length + 100 + Date.now().toString().slice(-3)),
      ...newDemographics,
      vitals: [placeholderVitals],
      pressureChecks: [firstSkinCheck],
      fallRisk: initialFallRisk
    };

    setTimeout(() => {
      setPatients(prev => [newPatientObj, ...prev]);
      setActivePatientId(newPatientObj.id);
      setActiveModal('none');
      setIsProcessing(false);
      showSuccessAlert(`Patient ${newPatientObj.name} admitted successfully to Bed ${newPatientObj.bed}.`);
    }, 850);
  };

  const handleLogVitals = (vitalsForm: Omit<VitalReading, 'id' | 'timestamp'>) => {
    if (!activePatient) return;
    setIsProcessing(true);
    
    const newReading: VitalReading = {
      id: 'vit-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...vitalsForm
    };

    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            vitals: [newReading, ...p.vitals]
          };
        }
        return p;
      }));

      setActiveModal('none');
      setIsProcessing(false);
      showSuccessAlert(`Recorded fresh Vital readings at bedside for ${activePatient.name}.`);
    }, 850);
  };

  const handleLogPressure = (pressureCheckForm: Omit<PressureCheck, 'id' | 'timestamp'>) => {
    if (!activePatient) return;
    setIsProcessing(true);

    const newCheck: PressureCheck = {
      id: 'pr-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...pressureCheckForm
    };

    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            pressureChecks: [newCheck, ...p.pressureChecks]
          };
        }
        return p;
      }));

      setActiveModal('none');
      setIsProcessing(false);
      showSuccessAlert(`Pressure check turn log completed. Sacral protection countdown reset to 2 hours.`);
    }, 850);
  };

  const handleSaveFallRisk = (fallRiskObj: MorseFallRisk) => {
    if (!activePatient) return;
    setIsProcessing(true);

    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            fallRisk: fallRiskObj
          };
        }
        return p;
      }));

      setActiveModal('none');
      setIsProcessing(false);
      showSuccessAlert(`Morse Fall Risk index calculated at ${fallRiskObj.score} pts (${fallRiskObj.riskLevel} Risk).`);
    }, 850);
  };

  const handleDischargePatient = () => {
    if (!activePatient) return;
    if (window.confirm(`Are you absolutely sure you want to discharge ${activePatient.name} from Bed ${activePatient.bed}? This releases their bed and marks their clinical file inactive.`)) {
      setIsDischarging(true);
      setIsProcessing(true);
      setTimeout(() => {
        setPatients(prev => {
          const filtered = prev.filter(p => p.id !== activePatient.id);
          if (filtered.length > 0) {
            setActivePatientId(filtered[0].id);
          } else {
            setActivePatientId('');
          }
          return filtered;
        });
        setIsDischarging(false);
        setIsProcessing(false);
        showSuccessAlert("Patient discharged successfully. Bed clinical registry cleared.");
      }, 850);
    }
  };

  // CALCULATE CLINICAL STATS FOR HEADER
  const totalPatients = patients.length;
  
  const overdueSkinCount = patients.reduce((count, p) => {
    const stat = getSkinCheckDetails(p);
    return stat.status === 'overdue' ? count + 1 : count;
  }, 0);

  const highFallRiskCount = patients.reduce((count, p) => {
    return p.fallRisk.riskLevel === 'High' ? count + 1 : count;
  }, 0);

  const criticalVitalsCount = patients.reduce((count, p) => {
    if (p.vitals.length === 0) return count;
    const latest = p.vitals[0];
    const isAbnormal = checkVitalsAbnormal(latest).isAbnormal;
    return isAbnormal ? count + 1 : count;
  }, 0);

  // LIST PATIENT FILTERING
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.bed.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterMode === 'clinical_vitals') {
      if (p.vitals.length === 0) return false;
      return checkVitalsAbnormal(p.vitals[0]).isAbnormal;
    }
    if (filterMode === 'overdue_skin') {
      return getSkinCheckDetails(p).status === 'overdue';
    }
    if (filterMode === 'high_fall_risk') {
      return p.fallRisk.riskLevel === 'High';
    }
    return true;
  });

  const activeLatestVitals = activePatient?.vitals?.[0];
  const activeAbnormalDetails = activeLatestVitals ? checkVitalsAbnormal(activeLatestVitals) : { isAbnormal: false, alerts: [] };
  const currentSkinCareDetail = activePatient ? getSkinCheckDetails(activePatient) : null;

  // Calculate body indicators for demo
  const calculateBMI = (w: number, h: number) => {
    const metros = h / 100;
    const bmiVal = w / (metros * metros);
    let category = "Normal";
    if (bmiVal < 18.5) category = "Underweight";
    else if (bmiVal >= 30) category = "Obese";
    else if (bmiVal >= 25) category = "Overweight";
    
    return {
      bmi: bmiVal.toFixed(1),
      category
    };
  };

  const activeBMI = activePatient ? calculateBMI(activePatient.weight, activePatient.height) : null;

  return (
    <div id="ward-tracker-root" className="min-h-screen bg-slate-100/70 text-slate-850 flex flex-col font-sans selection:bg-[#1D529E] selection:text-white">
      
      {/* PROFESSIONAL SA HEALTH BRAND LAYER */}
      <div id="sa-health-brand-bar" className="bg-white border-b border-slate-200 px-6 py-2.5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* South Australia crest emblem simulation */}
            <div className="h-10 w-10 rounded-full border-2 border-[#1D529E] bg-slate-50 flex flex-col items-center justify-center shrink-0 relative overflow-hidden select-none">
              <span className="text-[6px] font-black text-[#1D529E] text-center leading-none tracking-tight">SA<br/>GOVT</span>
            </div>
            <div>
              <h1 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 leading-tight">Government of South Australia</h1>
              <span className="text-lg font-black text-[#1D529E] tracking-tight block leading-none">SA Health</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* CRISP COLOURED HELPLINE BUTTON */}
            <div className="bg-[#D11C42] hover:bg-[#b01334] text-white px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-sm">
              <span>Do you have an emergency?</span>
              <span className="bg-white/20 h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold font-sans">&gt;</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-bold">
              <span className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded cursor-pointer transition">Accessibility</span>
              <span className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded cursor-pointer transition">Language v</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY CLINICAL PORTAL SUB-HEADER BAR */}
      <header id="clinical-header" className="bg-[#1D529E] border-b border-[#144283] px-6 py-3 sticky top-[53px] z-45 shadow-md text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="app-title-main" className="text-sm font-black tracking-wider uppercase">Bedside Nursing Portal</h2>
                <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.5 rounded font-black border border-white/20">WARD 3 EAST</span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">EHR Observer &amp; Patient Care Dashboard &bull; Clinical Roster System</p>
            </div>
          </div>

          {/* DYNAMIC SYSTEM TIME CLOCK CARD */}
          <div className="flex items-center gap-4 bg-black/15 border border-white/10 px-3 py-1.5 rounded-lg text-xs shadow-inner">
            <div className="flex items-center gap-1.5 text-blue-50">
              <Clock className="h-4 w-4 text-emerald-300" />
              <div>
                <span className="block font-mono font-bold text-white tracking-widest text-[12px] leading-tight-1">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="block text-[8px] text-blue-200 uppercase tracking-widest leading-none mt-0.5">
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <button
              id="reseed-db-btn"
              onClick={handleResetData}
              disabled={isResetting}
              title="Reset Database to original demo data"
              className="p-1 px-2.5 border border-white/20 bg-white/5 rounded hover:bg-white/15 transition text-white flex items-center gap-1 text-[10px] disabled:opacity-50 disabled:cursor-not-allowed font-medium font-mono"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-300" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Reset Census
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK STATS DASHBOARD BAR */}
      <section id="global-stats-bar" className="bg-[#EEF2F6] border-b border-slate-200 py-3 px-6 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <Users className="h-5 w-5 text-[#1D529E]" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Total Admitted</span>
              <span className="text-base font-black text-slate-900">{totalPatients} Patients</span>
            </div>
          </div>

          <div className={`flex items-center gap-2.5 p-3 rounded-lg transition border shadow-sm ${overdueSkinCount > 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-700'}`}>
            <ShieldAlert className={`h-5 w-5 ${overdueSkinCount > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider font-extrabold">Skin Assess Overdue</span>
              <span className={`text-base font-black ${overdueSkinCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{overdueSkinCount} Overdue</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-[#D11C42]" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-extrabold">High Fall Risk</span>
              <span className="text-base font-black text-slate-950">{highFallRiskCount} Patients</span>
            </div>
          </div>

          <div className={`flex items-center gap-2.5 p-3 rounded-lg transition border shadow-sm ${criticalVitalsCount > 0 ? 'animate-box-red-flash border-red-500 text-red-950 font-bold' : 'bg-white border-slate-200'}`}>
            <Heart className={`h-5 w-5 ${criticalVitalsCount > 0 ? 'text-red-655 animate-pulse' : 'text-slate-450'}`} />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-extrabold">Abnormal Vitals</span>
              <span className={`text-base font-black ${criticalVitalsCount > 0 ? 'text-rose-750' : 'text-slate-900'}`}>{criticalVitalsCount} Alerting</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main id="tracker-workspace" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - PATIENT SEARCH, FILTER & WARD GRID (4 cols) */}
        <div id="ward-grid-section" className="lg:col-span-4 flex flex-col gap-4">
          
          {/* SEARCH, FILTER & ADMISSION BLOCK */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#1D529E]" />
                Ward Board & Census
              </h3>
              <button
                id="admit-trigger-btn"
                onClick={() => setActiveModal('admit')}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1D529E] hover:bg-[#15417c] text-white rounded text-[11px] font-bold transition shadow"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Admit Patient
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                id="patient-search-input"
                type="text"
                placeholder="Search bed, patient name..."
                className="w-full bg-slate-50 text-xs border border-slate-250 rounded pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D529E]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FILTERS */}
            <div className="space-y-1">
              <span className="text-[10px] block font-bold text-slate-450 uppercase tracking-wider">Quick Bed Filters</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  id="filter-btn-all"
                  onClick={() => setFilterMode('all')}
                  className={`py-1.5 px-2 rounded font-bold text-center border transition ${filterMode === 'all' ? 'bg-[#1D529E] border-[#1D529E] text-white shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-605'}`}
                >
                  All Census ({patients.length})
                </button>
                <button
                  id="filter-btn-skin"
                  onClick={() => setFilterMode('overdue_skin')}
                  className={`py-1.5 px-2 rounded font-bold text-center border transition flex justify-between items-center ${filterMode === 'overdue_skin' ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' : 'bg-slate-50 border-slate-205 hover:bg-slate-100 text-slate-605'}`}
                >
                  <span>Skin Overdue</span>
                  <span className={`h-1.5 w-1.5 rounded-full bg-amber-500 ${overdueSkinCount > 0 ? 'animate-ping' : ''}`}></span>
                </button>
                <button
                  id="filter-btn-fall"
                  onClick={() => setFilterMode('high_fall_risk')}
                  className={`py-1.5 px-2 rounded font-bold text-center border transition ${filterMode === 'high_fall_risk' ? 'bg-[#D11C42] border-[#D11C42] text-white shadow-sm' : 'bg-slate-50 border-slate-205 hover:bg-slate-100 text-slate-605'}`}
                >
                  High Fall Risk
                </button>
                <button
                  id="filter-btn-vitals"
                  onClick={() => setFilterMode('clinical_vitals')}
                  className={`py-1.5 px-2 rounded font-bold text-center border transition ${filterMode === 'clinical_vitals' ? 'bg-red-50 border-red-200 text-red-750 font-bold shadow-sm' : 'bg-slate-50 border-slate-205 hover:bg-slate-100 text-slate-655'}`}
                >
                  Abnormal Vitals
                </button>
              </div>
            </div>
          </div>

          {/* PATIENT LIST CARDS */}
          <div id="census-patient-cells" className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs shadow-sm">
                No active patients match the filter criteria.
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = p.id === activePatientId;
                const skinCare = getSkinCheckDetails(p);
                const latestV = p.vitals[0];
                const abnormalV = latestV ? checkVitalsAbnormal(latestV) : { isAbnormal: false };
                
                return (
                  <div
                    id={`patient-card-${p.id}`}
                    key={p.id}
                    onClick={() => setActivePatientId(p.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 relative ${
                      abnormalV.isAbnormal
                        ? 'animate-box-red-flash border-red-500 shadow-md'
                        : isSelected 
                          ? 'bg-[#EEF2F6] border-[#1D529E] shadow-sm' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          Bed {p.bed}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {p.id}
                        </span>
                      </div>
                      
                      {/* Bed Alerts Indicator */}
                      <div className="flex gap-1">
                        {abnormalV.isAbnormal && (
                          <span title="Bedside Abnormal Vital Alert!" className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse"></span>
                        )}
                        {skinCare.status === 'overdue' && (
                          <span title="Sacral protection check overdue!" className="h-2.5 w-2.5 bg-amber-500 rotate-45 border border-white"></span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        {p.name}
                        <ChevronRight className={`h-4 w-4 ml-auto text-slate-400 transition ${isSelected ? 'rotate-90 text-[#1D529E]' : ''}`} />
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {p.age} y/o &bull; {p.gender} &bull; {p.weight} kg Baselines
                      </p>
                    </div>

                    {/* Vitals Summary Line */}
                    {latestV && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-150 flex justify-between items-center text-[10px] font-mono text-slate-650 shadow-inner">
                        <div className="flex flex-col">
                          <span>BP: <strong className={latestV.systolicBp > 140 || latestV.systolicBp < 90 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>{latestV.systolicBp}/{latestV.diastolicBp}</strong></span>
                        </div>
                        <div className="flex flex-col">
                          <span>HR: <strong className={latestV.heartRate > 100 || latestV.heartRate < 60 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>{latestV.heartRate}</strong></span>
                        </div>
                        <div className="flex flex-col">
                          <span>O2: <strong className={latestV.spo2 < 95 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>{latestV.spo2}%</strong></span>
                        </div>
                        <div className="flex flex-col">
                          <span>Temp: <strong className={latestV.temperature > 37.8 || latestV.temperature < 36 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>{latestV.temperature}°</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Critical safety indicators on the card */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-150 mt-1">
                      {/* Fall Risk level badge */}
                      <div className="flex flex-col text-[9px]">
                        <span className="text-slate-500 uppercase tracking-widest leading-none font-bold">Fall Risk Level</span>
                        <span className={`font-extrabold mt-0.5 ${
                          p.fallRisk.riskLevel === 'High' ? 'text-[#D11C42]' : 
                          p.fallRisk.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {p.fallRisk.riskLevel} Risk ({p.fallRisk.score}p)
                        </span>
                      </div>

                      {/* Skin check timers badge */}
                      <div className="flex flex-col text-[9px] text-right">
                        <span className="text-slate-500 uppercase tracking-widest leading-none font-bold">2H Turn Monitor</span>
                        <span className={`font-semibold mt-0.5 inline-block ${
                          skinCare.status === 'overdue' ? 'text-rose-650 underline decoration-wavy font-bold' :
                          skinCare.status === 'warning' ? 'text-amber-600 font-bold' : 'text-emerald-600'
                        }`}>
                          {skinCare.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* RIGHT COLUMN - FOCUS PATIENT DOSSIER & WORKSPACE (8 cols) */}
        <div id="patient-dossier-section" className="lg:col-span-8 flex flex-col gap-6">
          {!activePatient ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 max-w-xl mx-auto flex flex-col items-center justify-center gap-3 shadow-sm">
              <Users className="h-12 w-12 text-[#1D529E]" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">No Patient Selected</h2>
              <p className="text-xs text-slate-600">Select a patient card or admit a new patient record into the ward census roster to view the trend telemetry and clinical safety monitors.</p>
              <button
                id="empty-state-admit-btn"
                onClick={() => setActiveModal('admit')}
                className="mt-2 px-5 py-2 bg-[#1D529E] hover:bg-[#144283] text-white rounded text-xs font-bold transition shadow-sm"
              >
                Admit Bed Profile
              </button>
            </div>
          ) : (
            <article id="patient-comprehensive-view" className="space-y-6">
              
              {/* DOSSIER HEADER CARD */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Backdrop design accent */}
                <div className="absolute right-0 top-0 h-40 w-40 bg-[#1D529E]/5 rounded-full blur-2xl pointer-events-none"></div>
 
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-black bg-[#EEF2F6] text-[#1D529E] border border-blue-200 px-3 py-1 rounded-lg">
                      BED {activePatient.bed}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Clinical ID: {activePatient.id}
                    </span>
                  </div>
                  <div>
                    <h2 id="patient-name-display" className="text-2xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                      {activePatient.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium font-mono">
                      ADMITTED: {new Date(activePatient.admittedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(activePatient.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Demographics details block */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-700">
                      <strong>Age:</strong> {activePatient.age} years
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <strong>Gender:</strong> {activePatient.gender}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Ruler className="h-3.5 w-3.5 text-slate-400" />
                      <strong>Height:</strong> {activePatient.height} cm
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Weight className="h-3.5 w-3.5 text-slate-400" />
                      <strong>Weight:</strong> {activePatient.weight} kg
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-205 px-2 py-0.5 rounded text-[11px]">
                      <strong>BMI:</strong> {activeBMI?.bmi} ({activeBMI?.category})
                    </span>
                  </div>
                </div>
 
                <div className="flex flex-col gap-2 shrink-0 z-10">
                  <button
                    id="discharge-trigger-btn"
                    onClick={handleDischargePatient}
                    disabled={isDischarging}
                    className="px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isDischarging ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Discharge Patient</span>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center font-mono">Requires physician confirmation release</p>
                </div>
              </div>
 
              {/* TWO HOUR PRESSURE AREA TURN TRACKER & MORSE RISK HUD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PRESSURE AREA TIMERS DIAL */}
                <div id="skin-care-tracker-hud" className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Pressure Area Skin Monitor</h3>
                      <span className="text-[10px] font-mono text-slate-400">2 hour check protocol</span>
                    </div>
 
                    <div className="flex items-center gap-4 py-2">
                      {/* Left Gauge Block */}
                      <div className={`h-16 w-16 rounded-full border-4 flex flex-col items-center justify-center text-center leading-none shadow-inner shrink-0 ${
                        currentSkinCareDetail?.status === 'overdue' ? 'border-[#D11C42] bg-red-50 text-[#D11C42] animate-pulse' :
                        currentSkinCareDetail?.status === 'warning' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                        'border-emerald-600 bg-emerald-50 text-emerald-755'
                      }`}>
                        <Clock className="h-5 w-5 mb-0.5" />
                        <span className="text-[10px] font-bold uppercase">Timer</span>
                      </div>
 
                      <div className="space-y-1">
                        <span className={`text-base font-extrabold block tracking-tight ${
                          currentSkinCareDetail?.status === 'overdue' ? 'text-red-700 font-extrabold' :
                          currentSkinCareDetail?.status === 'warning' ? 'text-amber-700 font-extrabold' :
                          'text-emerald-800'
                        }`}>
                          Skin Status: {currentSkinCareDetail?.label}
                        </span>
                        
                        {activePatient.pressureChecks.length > 0 ? (
                          <p className="text-[11px] text-slate-600 leading-none">
                            Last assess: <strong className="text-slate-800">{new Date(activePatient.pressureChecks[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({activePatient.pressureChecks[0].nurseInitials})
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500">No skin turn checks logged yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-3">
                    {/* Latest Skin Note Preview */}
                    {activePatient.pressureChecks.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          <span>Latest Skin Assessment Notes</span>
                          <span>{activePatient.pressureChecks[0].nurseInitials}</span>
                        </div>
                        <p className="text-slate-800 leading-snug italic font-serif">
                          "{activePatient.pressureChecks[0].notes || 'No assessment notes written'}"
                        </p>
                        <div className="flex gap-4 text-[10px] pt-1.5 border-t border-slate-200 text-slate-600 mt-1">
                          <span>Intact: <strong className="text-slate-800">{activePatient.pressureChecks[0].skinIntact ? 'Yes' : 'No'}</strong></span>
                          <span>Erythema: <strong className="text-slate-800">{activePatient.pressureChecks[0].rednessPresence ? 'YES' : 'No'}</strong></span>
                          <span>Repositioned: <strong className="text-slate-800">{activePatient.pressureChecks[0].repositioned ? 'Yes' : 'No'}</strong></span>
                        </div>
                      </div>
                    )}
 
                    <button
                      id="log-pressure-trigger"
                      onClick={() => setActiveModal('log_pressure')}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#1D529E] hover:bg-[#15417c] text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Log Skin Assessment / Turn Check
                    </button>
                  </div>
                </div>
 
                {/* MORSE FALL RISK SHIELD */}
                <div id="fall-risk-hud" className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Morse Fall Risk Assessment</h3>
                      <span className="text-[10px] font-mono text-slate-400">Clinical Mobility Standard</span>
                    </div>
 
                    <div className="flex items-center gap-4 py-2">
                      <div className={`h-16 w-16 rounded-full border-4 flex flex-col items-center justify-center text-center leading-none shrink-0 ${
                        activePatient.fallRisk.riskLevel === 'High' ? 'border-[#D11C42] bg-red-50 text-[#D11C42] animate-pulse' :
                        activePatient.fallRisk.riskLevel === 'Medium' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                        'border-emerald-600 bg-emerald-50 text-emerald-755'
                      }`}>
                        <span className="text-xl font-black">{activePatient.fallRisk.score}</span>
                        <span className="text-[8px] tracking-tight uppercase font-bold text-slate-500">Points</span>
                      </div>
 
                      <div className="space-y-1">
                        <span className={`text-base font-extrabold block tracking-tight ${
                          activePatient.fallRisk.riskLevel === 'High' ? 'text-red-755 font-black' :
                          activePatient.fallRisk.riskLevel === 'Medium' ? 'text-amber-755 font-bold' :
                          'text-emerald-800'
                        }`}>
                          Risk Category: {activePatient.fallRisk.riskLevel} Risk
                        </span>
                        <p className="text-[11px] text-slate-600 leading-none mb-0.5">
                          Calculated: <strong className="text-slate-800">{new Date(activePatient.fallRisk.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-3">
                    {/* Fall Risk Precautions Checklist */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                      <div className="text-[10px] text-slate-505 font-bold uppercase tracking-wider mb-1">Active Fall Precautions Protocol</div>
                      {activePatient.fallRisk.riskLevel === 'High' ? (
                        <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#D11C42] font-extrabold font-sans">
                          <li className="flex items-center gap-1">&bull; Bed low locked pos</li>
                          <li className="flex items-center gap-1">&bull; Yellow non-slip socks</li>
                          <li className="flex items-center gap-1">&bull; Bed alarm ARMED</li>
                          <li className="flex items-center gap-1">&bull; 2-person gait assist</li>
                        </ul>
                      ) : activePatient.fallRisk.riskLevel === 'Medium' ? (
                        <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-amber-805 font-bold font-sans">
                          <li className="flex items-center gap-1">&bull; Bed low locked pos</li>
                          <li className="flex items-center gap-1">&bull; Ambulatory cane near</li>
                          <li className="flex items-center gap-1">&bull; Call bell validated</li>
                          <li className="flex items-center gap-1">&bull; 1-person close stand</li>
                        </ul>
                      ) : (
                        <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-800 font-medium font-sans">
                          <li className="flex items-center gap-1">&bull; Call bell locked</li>
                          <li className="flex items-center gap-1">&bull; Siderails x2 raised</li>
                          <li className="flex items-center gap-1">&bull; Environment tidy</li>
                          <li className="flex items-center gap-1">&bull; Light toggle accessible</li>
                        </ul>
                      )}
                    </div>
 
                    <button
                      id="assess-fall-trigger"
                      onClick={() => setActiveModal('assess_fall')}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <ShieldAlert className="h-4 w-4 text-slate-500" />
                      Recalculate Morse Risk Index
                    </button>
                  </div>
                </div>
              </div>
 
              {/* VITAL RANGE DEVIATION WARNINGS HUD */}
              {activeAbnormalDetails.isAbnormal && (
                <div id="vitals-hazard-alert" className="animate-box-red-flash border border-red-500 bg-red-50 p-4 rounded-2xl flex gap-3 text-xs text-red-950 shadow-md">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-red-650 animate-bounce" />
                  <div>
                    <span className="font-extrabold block text-red-700 uppercase tracking-widest text-[11px] mb-1">
                      Bedside Warnings: Abnormal Vitals Alert Present!
                    </span>
                    <p className="mb-2 text-slate-800 font-medium">
                      One or more telemetry vitals cross the safety threshold guidelines of South Australian clinical ward reference ranges. Assure immediate physical skin checks and devices.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAbnormalDetails.alerts.map((alItem, idx) => (
                        <span key={idx} className="bg-red-200 border border-red-300 text-red-950 text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase">
                          {alItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
 
              {/* VITALS PLOTTING GRID & HISTORICAL READINGS COMPONENT */}
              <div id="vitals-trend-block" className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-250">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#1D529E]">Bedside Vital Telemetry Trends</h3>
                    <p className="text-[11px] text-slate-500">Review real-time plotting of patient vital signs over logged readings</p>
                  </div>
                  <button
                    id="log-vitals-trigger"
                    onClick={() => setActiveModal('log_vitals')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#D11C42] hover:bg-[#b01334] text-white rounded-lg text-xs font-bold transition shadow"
                  >
                    <Heart className="h-4 w-4" />
                    Record New Vitals
                  </button>
                </div>

                {/* LINE CHARTS */}
                <VitalCharts vitals={activePatient.vitals} />

                {/* HISTORICAL VITALS TABLE */}
                <div className="pt-2">
                  <span className="text-[11px] block font-extrabold uppercase tracking-widest text-slate-500 mb-2">Logged Readings Historical Log</span>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs bg-white text-slate-800">
                      <thead className="bg-[#EEF2F6] text-[10px] font-bold uppercase tracking-wider text-[#1D529E] border-b border-blue-105">
                        <tr>
                          <th className="p-2.5">Obs Date / Time</th>
                          <th className="p-2.5 text-center">BP (mmHg)</th>
                          <th className="p-2.5 text-center">HR (bpm)</th>
                          <th className="p-2.5 text-center">Temp (°C)</th>
                          <th className="p-2.5 text-center">RR (bpm)</th>
                          <th className="p-2.5 text-center">SpO2 (%)</th>
                          <th className="p-2.5 text-center">Initials</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {activePatient.vitals.map(v => {
                          const isReadingAbnormal = checkVitalsAbnormal(v);
                          return (
                            <tr key={v.id} className={`hover:bg-slate-50 font-mono text-[11px] transition ${isReadingAbnormal.isAbnormal ? 'bg-red-50/50 hover:bg-red-50 text-red-950 font-semibold' : 'text-slate-800'}`}>
                              <td className="p-2.5 font-sans font-medium text-slate-600">
                                {new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} &bull; {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-2.5 text-center font-bold">
                                <span className={v.systolicBp > 140 || v.systolicBp < 90 ? 'text-red-650 underline decoration-dotted' : 'text-slate-900'}>
                                  {v.systolicBp}/{v.diastolicBp}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={v.heartRate > 100 || v.heartRate < 60 ? 'text-red-650 font-black' : 'text-slate-850'}>
                                  {v.heartRate}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={v.temperature > 37.8 || v.temperature < 36.0 ? 'text-red-650 font-black' : 'text-slate-850'}>
                                  {v.temperature}°C
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={v.respiratoryRate > 20 || v.respiratoryRate < 12 ? 'text-red-750 font-black' : 'text-slate-850'}>
                                  {v.respiratoryRate}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={v.spo2 < 95 ? 'text-red-650 font-black underline' : 'text-[#1D529E]'}>
                                  {v.spo2}%
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-sans uppercase font-bold text-slate-500">
                                {v.nurseInitials}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-850 py-6 px-6 pb-20 mt-12 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Bedside Observation Suite. Clinical Decision Support System. Under Strict Patient Privacy Regulations.</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-650">
            <Lock className="h-3 w-3 text-slate-650" />
            <span>Secure Patient Demographics. Data cached locally in browser instance.</span>
          </div>
        </div>
      </footer>

      {/* CLINICAL DISCLAIMER BAR */}
      <div id="clinical-disclaimer-footer" className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-400 text-slate-950 py-3.5 px-6 font-extrabold text-[11px] md:text-xs text-center flex items-center justify-center gap-2 border-t border-yellow-500 shadow-lg select-none tracking-wider">
        <AlertTriangle className="h-4 w-4 shrink-0 text-slate-950 animate-pulse" />
        <span>AI GENERATED CONTENT. NOT A MEDICAL DEVICE. FOR EDUCATIONAL USE ONLY.</span>
      </div>

      {/* CLINICAL CORE INPUT MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="modal-container-card" className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* Modal Title Banner */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                  {activeModal === 'admit' && 'Admit New Patient'}
                  {activeModal === 'log_vitals' && `Log Bedside Vitals - ${activePatient?.name}`}
                  {activeModal === 'log_pressure' && `Skin Turn & Pressure Care - ${activePatient?.name}`}
                  {activeModal === 'assess_fall' && 'Morse Fall Risk Index'}
                  {activeModal === 'success' && 'Clinical Action Completed'}
                </h3>
                {activePatient && activeModal !== 'admit' && activeModal !== 'success' && (
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Bed {activePatient.bed} &bull; ID {activePatient.id}
                  </p>
                )}
              </div>
              
              {activeModal !== 'success' && (
                <button
                  id="modal-close-header"
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  &times; Close
                </button>
              )}
            </div>

            {/* Modal Form Contents */}
            <div className="p-6">
              {activeModal === 'admit' && (
                <AdmitPatientForm 
                  onAdmit={handleAdmitPatient} 
                  onCancel={() => setActiveModal('none')} 
                  isProcessing={isProcessing}
                />
              )}

              {activeModal === 'log_vitals' && (
                <LogVitalsForm 
                  onLog={handleLogVitals} 
                  onCancel={() => setActiveModal('none')} 
                  isProcessing={isProcessing}
                />
              )}

              {activeModal === 'log_pressure' && (
                <LogPressureForm 
                  onLog={handleLogPressure} 
                  onCancel={() => setActiveModal('none')} 
                  isProcessing={isProcessing}
                />
              )}

              {activeModal === 'assess_fall' && activePatient && (
                <MorseFallCalculator 
                  initialRisk={activePatient.fallRisk} 
                  onSave={handleSaveFallRisk} 
                  onCancel={() => setActiveModal('none')} 
                  isProcessing={isProcessing}
                />
              )}

              {activeModal === 'success' && (
                <div className="text-center py-6 text-slate-850 space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Bedside Registry Updated</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    {successMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL CENTERED PROCESSING OVERLAY */}
      {isProcessing && (
        <div id="global-processing-overlay" className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[100] flex flex-col items-center justify-center select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xs w-full flex flex-col items-center justify-center space-y-4 shadow-2xl">
            <div className="relative">
              {/* Outer decorative glow */}
              <div className="absolute inset-0 rounded-full bg-teal-500/15 blur-xl animate-pulse" />
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin relative z-10" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-100">Processing</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide">Syncing data safely...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
