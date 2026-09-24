import React from 'react';
import { 
  Layers, 
  BookOpen, 
  Users, 
  Building2, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function DashboardView({ 
  dashboardData, 
  setActiveTab, 
  onQuickGenerate,
  onLoadScenario
}) {
  const stats = dashboardData?.stats || {};
  const recentActivities = dashboardData?.recent_activities || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl shadow-slate-950/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              Semester 5 • Academic Year 2026-27
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
              OR-Tools Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, Administrator</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Intelligent Timetable Generation System is active. Configure master data, apply hard/soft constraints, run the CP-SAT solver, and resolve conflicts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('generate')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-300" />
            <span>View Grid</span>
          </button>
        </div>
      </div>

      {/* 4 Master Data Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('divisions')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisions</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.divisions_count || 3}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Active cohorts in CSE & ISE
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('subjects')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.subjects_count || 10}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Theory & Hands-on Labs
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('faculty')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.faculty_count || 6}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              With availability matrix
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('classrooms')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classrooms & Labs</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.rooms_count || 7}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Classrooms & Specialized Labs
            </p>
          </div>
        </div>
      </div>

      {/* Main Status & Conflicts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable Status Box */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Timetable Status Overview</h3>
                  <p className="text-xs text-slate-500">Live health of college scheduling engine</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Current Stage</span>
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  stats.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" :
                  stats.status === "GENERATED" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {stats.status || "DRAFT"}
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xs font-medium text-slate-500">Scheduled Sessions</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {stats.total_slots || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Across all divisions</div>
              </div>

              <div className={`p-4 rounded-xl border text-center transition-all ${
                (stats.critical_conflicts || 0) > 0 ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-100"
              }`}>
                <div className="text-xs font-medium text-slate-500">Hard Conflicts</div>
                <div className={`text-2xl font-bold mt-1 ${
                  (stats.critical_conflicts || 0) > 0 ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {stats.critical_conflicts || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {(stats.critical_conflicts || 0) > 0 ? "Requires resolution" : "Zero hard conflicts"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xs font-medium text-slate-500">Soft Constraint Score</div>
                <div className="text-2xl font-bold text-indigo-600 mt-1">
                  {stats.soft_score || 95}%
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  {stats.quality_label || "Optimal"}
                </div>
              </div>
            </div>

            {/* Notice if conflicts exist */}
            {(stats.critical_conflicts || 0) > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    <strong>{stats.critical_conflicts} conflict(s) detected:</strong> Schedule has overlapping or impossible allocations that must be resolved.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors"
                >
                  Resolve
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Last generated: <span className="font-medium text-slate-700">{stats.generated_at || "Not yet run"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('timetable')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Review Schedule
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Generate Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities & Quick Presets */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent System Activity
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((act, index) => (
                <div key={index} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-slate-700 font-medium">{act.message}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Demo Preset Trigger Card */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Assignment Scenarios
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onLoadScenario('normal')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">1. Feasible</div>
                <div className="text-[9px] text-slate-400 group-hover:text-emerald-600">0 Conflicts</div>
              </button>

              <button
                onClick={() => onLoadScenario('conflict')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-amber-700">2. Conflict</div>
                <div className="text-[9px] text-slate-400 group-hover:text-amber-600">Teacher overlap</div>
              </button>

              <button
                onClick={() => onLoadScenario('impossible')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-center transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-rose-700">3. Impossible</div>
                <div className="text-[9px] text-slate-400 group-hover:text-rose-600">Lab bottleneck</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
