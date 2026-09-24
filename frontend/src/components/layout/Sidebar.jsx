import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Layers,
  BookOpen,
  Users,
  Building2,
  Clock,
  Sliders,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  PlayCircle
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  stats,
  conflictsCount = 0,
  onLoadScenario,
  onReset
}) {
  const masterDataItems = [
    { id: 'divisions', label: 'Divisions', icon: Layers, count: stats?.divisions_count },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, count: stats?.subjects_count },
    { id: 'faculty', label: 'Faculty', icon: Users, count: stats?.faculty_count },
    { id: 'classrooms', label: 'Classrooms', icon: Building2, count: stats?.rooms_count },
    { id: 'timeslots', label: 'Time Slots', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen select-none border-r border-slate-800">
      {/* Brand / Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-base tracking-tight leading-tight">
              IntelliSched
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Timetable Engine</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          CP-SAT
        </span>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Overview
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-white" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Timetable Grid</span>
              </div>
              {stats?.total_slots > 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {stats.total_slots}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('generate')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Timetable</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                Solver
              </span>
            </button>
          </div>
        </div>

        {/* Master Data */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Master Data
          </div>
          <div className="space-y-1">
            {masterDataItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Constraints */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Rules & Integrity
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('constraints')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'constraints'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Scheduling Rules</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('conflicts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'conflicts'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`w-4 h-4 ${conflictsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Conflict Center</span>
              </div>
              {conflictsCount > 0 && (
                <span className="text-[11px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {conflictsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Demo Scenarios Quick Launcher */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Evaluator Demo Presets
            </span>
            <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="space-y-1.5 px-1">
            <button
              onClick={() => onLoadScenario('normal')}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors flex items-center justify-between border border-slate-800"
            >
              <span>1. Feasible Schedule</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            <button
              onClick={() => onLoadScenario('conflict')}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors flex items-center justify-between border border-slate-800"
            >
              <span>2. Faculty Conflict</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </button>

            <button
              onClick={() => onLoadScenario('impossible')}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-rose-400 transition-colors flex items-center justify-between border border-slate-800"
            >
              <span>3. Impossible Setup</span>
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Reset state */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Academic Year <span className="font-semibold text-slate-200">2026-27</span>
        </div>
        <button
          onClick={onReset}
          title="Reset database to default seed data"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </aside>
  );
}
