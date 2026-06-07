/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VitalReading } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Activity, Heart, Thermometer, Wind, Eye } from 'lucide-react';

interface VitalChartsProps {
  vitals: VitalReading[];
}

export function VitalCharts({ vitals }: VitalChartsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bp' | 'hr' | 'spo2' | 'temp' | 'rr'>('all');

  if (!vitals || vitals.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-500 text-xs">
        No historical vital readings cataloged to chart. Record bedside vitals to trigger trend graphs.
      </div>
    );
  }

  // Format timestamp for display in chart
  const chartData = [...vitals]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(v => {
      const date = new Date(v.timestamp);
      return {
        ...v,
        formattedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formattedDate: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        dateLabel: `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
    });

  const tooltipFormatter = (value: any, name: string) => {
    switch (name) {
      case 'heartRate': return [`${value} bpm`, 'Heart Rate'];
      case 'systolicBp': return [`${value} mmHg`, 'Systolic BP'];
      case 'diastolicBp': return [`${value} mmHg`, 'Diastolic BP'];
      case 'temperature': return [`${value} °C`, 'Temperature'];
      case 'spo2': return [`${value} %`, 'SpO2 Oxygen'];
      case 'respiratoryRate': return [`${value} breaths/min`, 'Respiratory Rate'];
      default: return [value, name];
    }
  };

  const renderBPChart = (embedMode = false) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 ${embedMode ? 'h-52' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
          Blood Pressure Trend (mmHg)
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Ref: 90/60 - 140/90</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis domain={['dataMin - 15', 'dataMax + 15']} stroke="#94a3b8" fontSize={9} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ fontSize: '10px' }} verticalAlign="top" height={24} />
          <ReferenceLine y={140} label={{ value: 'SYS High (140)', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} stroke="#fca5a5" strokeDasharray="3 3" />
          <ReferenceLine y={90} label={{ value: 'SYS Low (90)', fill: '#3b82f6', fontSize: 8, position: 'insideRight' }} stroke="#93c5fd" strokeDasharray="3 3" />
          <Line name="systolicBp" type="monotone" dataKey="systolicBp" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 6 }} />
          <Line name="diastolicBp" type="monotone" dataKey="diastolicBp" stroke="#60a5fa" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderHRChart = (embedMode = false) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 ${embedMode ? 'h-52' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-100" />
          Heart Rate Trend (bpm)
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Ref: 60 - 100</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#94a3b8" fontSize={9} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} formatter={tooltipFormatter} />
          <ReferenceLine y={100} label={{ value: 'Tachycardia (100)', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} stroke="#fca5a5" strokeDasharray="3 3" />
          <ReferenceLine y={60} label={{ value: 'Bradycardia (60)', fill: '#3b82f6', fontSize: 8, position: 'insideRight' }} stroke="#93c5fd" strokeDasharray="3 3" />
          <Line name="heartRate" type="monotone" dataKey="heartRate" stroke="#ede" strokeWidth={0} activeDot={false} />
          <Line name="heartRate" type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSpO2Chart = (embedMode = false) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 ${embedMode ? 'h-52' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-teal-600" />
          SpO2 Oxygen Saturation (%)
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Ref: &ge;95%</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis domain={[80, 100]} ticks={[80, 85, 90, 95, 100]} stroke="#94a3b8" fontSize={9} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} formatter={tooltipFormatter} />
          <ReferenceLine y={95} label={{ value: 'Hypoxia (<95%)', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} stroke="#fca5a5" strokeDasharray="3 3" />
          <Line name="spo2" type="monotone" dataKey="spo2" stroke="#0d9488" strokeWidth={2.5} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTempChart = (embedMode = false) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 ${embedMode ? 'h-52' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Thermometer className="h-3.5 w-3.5 text-amber-600" />
          Core Temperature (°C)
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Ref: 36.0 - 37.8</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis domain={[35, 41]} stroke="#94a3b8" fontSize={9} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} formatter={tooltipFormatter} />
          <ReferenceLine y={37.8} label={{ value: 'Fever (37.8)', fill: '#ea580c', fontSize: 8, position: 'insideRight' }} stroke="#fed7aa" strokeDasharray="3 3" />
          <ReferenceLine y={36.0} label={{ value: 'Hypothermia (36.0)', fill: '#2563eb', fontSize: 8, position: 'insideRight' }} stroke="#bfdbfe" strokeDasharray="3 3" />
          <Line name="temperature" type="monotone" dataKey="temperature" stroke="#d97706" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderRRChart = (embedMode = false) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 ${embedMode ? 'h-52' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-violet-600" />
          Respiratory Rate (bpm)
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Ref: 12 - 20</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#94a3b8" fontSize={9} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} formatter={tooltipFormatter} />
          <ReferenceLine y={20} label={{ value: 'Tachypnea (20)', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} stroke="#fca5a5" strokeDasharray="3 3" />
          <ReferenceLine y={12} label={{ value: 'Bradypnea (12)', fill: '#3b82f6', fontSize: 8, position: 'insideRight' }} stroke="#93c5fd" strokeDasharray="3 3" />
          <Line name="respiratoryRate" type="monotone" dataKey="respiratoryRate" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* TABS FOR TREND SELECTION */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          id="tab-chart-all"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Multi-Bento Grid
        </button>
        <button
          id="tab-chart-bp"
          onClick={() => setActiveTab('bp')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${activeTab === 'bp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Blood Pressure
        </button>
        <button
          id="tab-chart-hr"
          onClick={() => setActiveTab('hr')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${activeTab === 'hr' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Heart Rate
        </button>
        <button
          id="tab-chart-spo2"
          onClick={() => setActiveTab('spo2')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${activeTab === 'spo2' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Oxygen (SpO2)
        </button>
        <button
          id="tab-chart-temp"
          onClick={() => setActiveTab('temp')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${activeTab === 'temp' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Temperature
        </button>
        <button
          id="tab-chart-rr"
          onClick={() => setActiveTab('rr')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${activeTab === 'rr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Respirations
        </button>
      </div>

      {/* RENDER ACTIVE GRAPH */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderBPChart(true)}
          {renderHRChart(true)}
          {renderSpO2Chart(true)}
          {renderTempChart(true)}
        </div>
      )}

      {activeTab === 'bp' && renderBPChart()}
      {activeTab === 'hr' && renderHRChart()}
      {activeTab === 'spo2' && renderSpO2Chart()}
      {activeTab === 'temp' && renderTempChart()}
      {activeTab === 'rr' && renderRRChart()}
    </div>
  );
}
