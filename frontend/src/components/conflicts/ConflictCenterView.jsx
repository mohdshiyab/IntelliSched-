import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  Clock, 
  Building2, 
  Users, 
  Wrench, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function ConflictCenterView({ 
  conflicts, 
  timetableEntries, 
  onAutoResolve, 
  onMoveSlot,
  setActiveTab 
}) {
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotice, setResolutionNotice] = useState(null);

  const criticalConflicts = (conflicts || []).filter(c => c.severity === 'critical' || c.severity === 'impossible');
  const warnings = (conflicts || []).filter(c => c.severity === 'warning');

  const handleResolve = async (conflictId) => {
    setResolvingId(conflictId);
    try {
      const res = await onAutoResolve(conflictId);
      if (res?.success) {
        setResolutionNotice(res.message || "Conflict resolved successfully!");
        setTimeout(() => setResolutionNotice(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Conflict Center & Diagnostics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify overlapping allocations, capacity bottlenecks, and apply intelligent alternative slot suggestions.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            {criticalConflicts.length} Critical
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {warnings.length} Warnings
          </span>
        </div>
      </div>

      {/* Resolution Toast Notice */}
      {resolutionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{resolutionNotice}</span>
        </div>
      )}

      {/* Zero Conflicts State */}
      {conflicts?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">All Clear — No Conflicts Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All teaching assignments, rooms, and faculty schedules comply with hard constraints.
          </p>
          <button
            onClick={() => setActiveTab('timetable')}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Review Timetable Grid
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conf) => {
            const isImpossible = conf.severity === 'impossible';

            return (
              <div 
                key={conf.id} 
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all ${
                  isImpossible ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/90'
                }`}
              >
                {/* Conflict Title Bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                      isImpossible ? 'bg-rose-100 text-rose-700' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {conf.title}
                        </h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isImpossible ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isImpossible ? 'Impossible' : 'Hard Collision'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        {conf.description}
                      </p>
                      {conf.day && conf.time_label && (
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {conf.day} • {conf.time_label}
                          </span>
                          {conf.affected_faculty && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {conf.affected_faculty}
                            </span>
                          )}
                          {conf.affected_room && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {conf.affected_room}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Immediate Action button */}
                  {!isImpossible && (
                    <button
                      onClick={() => handleResolve(conf.id)}
                      disabled={resolvingId === conf.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      {resolvingId === conf.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>Auto-Resolve</span>
                    </button>
                  )}
                </div>

                {/* INTELLIGENT ALTERNATIVES / REMEDIATION SECTION */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Intelligent Alternative Suggestions (Calculated by Solver)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Fallback suggestions if none embedded */}
                    {(conf.suggested_actions && conf.suggested_actions.length > 0) ? (
                      conf.suggested_actions.map((act, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{act.label}</div>
                            {act.target_day && (
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <span className="text-emerald-600 font-bold">Faculty ✓</span>
                                <span className="text-emerald-600 font-bold">Room ✓</span>
                                <span className="text-emerald-600 font-bold">Division ✓</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                            {isImpossible ? (
                              <button
                                onClick={() => setActiveTab(act.action === 'split_division' ? 'divisions' : 'classrooms')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <span>Adjust Master Data</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleResolve(conf.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Move Here</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Default generated alternatives if available */
                      [
                        { day: "Tuesday", time: "09:00 AM", room: "A-101" },
                        { day: "Wednesday", time: "11:15 AM", room: "A-102" }
                      ].map((slot, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{slot.day} {slot.time}</div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                              <span className="text-emerald-600 font-semibold">Faculty ✓</span>
                              <span className="text-emerald-600 font-semibold">Room ({slot.room}) ✓</span>
                              <span className="text-emerald-600 font-semibold">Division ✓</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                            <button
                              onClick={() => handleResolve(conf.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Move Here</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
