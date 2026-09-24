import React from 'react';
import { 
  UserCheck, 
  GraduationCap, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  timetableStatus, 
  activeTabTitle,
  onPublishClick,
  onQuickGenerate
}) {
  const getStatusBadge = () => {
    const status = timetableStatus?.status || "DRAFT";
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            PUBLISHED (Official)
          </span>
        );
      case "GENERATED":
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            GENERATED (In Review)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            DRAFT (Unpublished)
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Title & Status */}
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
            {activeTabTitle}
          </h2>
        </div>
        <div className="hidden sm:block">
          {getStatusBadge()}
        </div>
      </div>

      {/* Right Controls: Role Switcher & Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Quick Action buttons */}
        {timetableStatus?.status !== "PUBLISHED" && timetableStatus?.total_classes > 0 && (
          <button
            onClick={onPublishClick}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publish Timetable
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setCurrentRole('faculty')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentRole === 'faculty'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Faculty View</span>
          </button>

          <button
            onClick={() => setCurrentRole('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentRole === 'student'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student View</span>
          </button>
        </div>
      </div>
    </header>
  );
}
