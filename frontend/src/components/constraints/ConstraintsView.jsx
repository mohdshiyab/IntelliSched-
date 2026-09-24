import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Sparkles, Check, Save, Info, AlertTriangle } from 'lucide-react';

export default function ConstraintsView({ constraints, onSaveConstraints }) {
  const [formData, setFormData] = useState(constraints || {
    faculty_no_overlap: true,
    division_no_overlap: true,
    room_no_overlap: true,
    room_capacity_sufficient: true,
    room_type_matches: true,
    faculty_availability_respected: true,
    max_classes_per_day_respected: true,
    avoid_consecutive_same_subject: true,
    avoid_difficult_subject_clusters: true,
    prefer_faculty_morning_slots: true,
    distribute_evenly_across_week: true,
    minimize_student_idle_gaps: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (constraints) {
      setFormData(constraints);
    }
  }, [constraints]);

  const toggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSaveConstraints(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scheduling Rules & Constraints</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hard mathematical rules strictly enforced by Google OR-Tools CP-SAT and soft optimization objectives.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Rules Saved!' : 'Save Rules'}</span>
        </button>
      </div>

      {/* HARD CONSTRAINTS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Hard Constraints
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase font-bold">
                Zero Tolerance
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              These constraints must NEVER be violated in any valid generated schedule.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div 
            onClick={() => toggle('faculty_no_overlap')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.faculty_no_overlap ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Faculty Clash Prevention</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Faculty cannot teach two classes simultaneously across different divisions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.faculty_no_overlap}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('division_no_overlap')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.division_no_overlap ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Division Clash Prevention</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                A division/cohort cannot have two lectures scheduled at the same period.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.division_no_overlap}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('room_no_overlap')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.room_no_overlap ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Room Double-Booking Prevention</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                A classroom or laboratory cannot host two classes simultaneously.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.room_no_overlap}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('room_capacity_sufficient')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.room_capacity_sufficient ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Room Capacity Verification</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Room seating capacity must be greater than or equal to division enrollment count.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.room_capacity_sufficient}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('room_type_matches')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.room_type_matches ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Lab Room Type Requirements</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Lab subjects strictly require matching facility types (e.g. Computer Lab for CS Labs).
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.room_type_matches}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('faculty_availability_respected')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.faculty_availability_respected ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Faculty Availability Matrix</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Faculty cannot be scheduled during periods marked as unavailable in their matrix.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.faculty_availability_respected}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* SOFT CONSTRAINTS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Soft Constraints & Pedagogical Optimization
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase font-bold">
                Quality Metric
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Can be relaxed if mathematically necessary, but the solver optimizes to maximize this score (target: &gt;90%).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div 
            onClick={() => toggle('avoid_consecutive_same_subject')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.avoid_consecutive_same_subject ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Avoid Back-to-Back Same Subject</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Prevent scheduling two consecutive periods of the same theory lecture.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.avoid_consecutive_same_subject}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('prefer_faculty_morning_slots')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.prefer_faculty_morning_slots ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Faculty Time Slot Preferences</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Prioritize morning slots (Periods 1-3) for professors preferring morning teaching.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.prefer_faculty_morning_slots}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('distribute_evenly_across_week')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.distribute_evenly_across_week ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Even Weekly Distribution</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Distribute a subject's sessions across different days rather than bunching on consecutive days.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.distribute_evenly_across_week}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          <div 
            onClick={() => toggle('minimize_student_idle_gaps')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
              formData.minimize_student_idle_gaps ? 'border-indigo-500/40 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}
          >
            <div>
              <h4 className="font-semibold text-slate-900 text-xs">Minimize Student Idle Gaps</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Cluster student periods contiguously to avoid empty waiting hours during the day.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.minimize_student_idle_gaps}
              onChange={() => {}}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
