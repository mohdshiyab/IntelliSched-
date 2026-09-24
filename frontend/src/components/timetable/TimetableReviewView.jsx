import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  Sparkles, 
  Printer, 
  Send, 
  Edit3, 
  AlertTriangle, 
  FlaskConical, 
  Coffee, 
  Utensils, 
  RefreshCw,
  Layers,
  GraduationCap
} from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import PublishModal from './PublishModal';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIMETABLE_PERIOD_ROWS = [
  { type: "period", num: 1, time: "09:00 - 10:00" },
  { type: "period", num: 2, time: "10:00 - 11:00" },
  { type: "break", name: "Tea & Morning Break", time: "11:00 - 11:15" },
  { type: "period", num: 3, time: "11:15 - 12:15" },
  { type: "period", num: 4, time: "12:15 - 13:15" },
  { type: "lunch", name: "Lunch Recess", time: "13:15 - 14:00" },
  { type: "period", num: 5, time: "14:00 - 15:00" },
  { type: "period", num: 6, time: "15:00 - 16:00" },
];

export default function TimetableReviewView({
  timetableEntries,
  divisions,
  faculty,
  classrooms,
  subjects,
  status,
  conflicts,
  currentRole,
  onSaveEntry,
  onFindSuggestions,
  onPublishTimetable,
  onQuickGenerate,
  setActiveTab
}) {
  const [selectedDivisionId, setSelectedDivisionId] = useState(divisions?.[0]?.id || "DIV_CSE_A");
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculty?.[0]?.id || "FAC_RAVI");
  const [viewFilter, setViewFilter] = useState(currentRole === 'faculty' ? 'faculty' : 'division');

  // Modals
  const [editingEntry, setEditingEntry] = useState(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  // Sync role changes
  React.useEffect(() => {
    if (currentRole === 'faculty') {
      setViewFilter('faculty');
    } else {
      setViewFilter('division');
    }
  }, [currentRole]);

  // Build grid entries mapping: (day, period_number) -> entry
  const gridMap = {};
  const currentEntries = timetableEntries.filter(e => {
    if (viewFilter === 'faculty') {
      return e.faculty_id === selectedFacultyId;
    }
    return e.division_id === selectedDivisionId;
  });

  currentEntries.forEach(e => {
    const key = `${e.day}_P${e.period_number}`;
    gridMap[key] = e;
  });

  const selectedDivision = divisions.find(d => d.id === selectedDivisionId);
  const selectedFaculty = faculty.find(f => f.id === selectedFacultyId);

  const handlePrint = () => {
    window.print();
  };

  // If no timetable generated yet: Show wireframe empty state
  if (!timetableEntries || timetableEntries.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 text-center bg-white rounded-2xl border border-slate-200/80 p-12 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <Calendar className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">No Timetable Generated Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add your divisions, subjects, faculty availability, and classrooms, then run the constraint solver to produce a conflict-free schedule.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('generate')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Timetable</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {viewFilter === 'faculty' ? `${selectedFaculty?.name || 'Faculty'} Schedule` : `${selectedDivision?.name || 'Division'} Timetable`}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
              Semester 5 • 2026-27
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any lecture cell to view details or adjust time slot with live clash checking.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setViewFilter('division')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewFilter === 'division' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Division View
            </button>
            <button
              onClick={() => setViewFilter('faculty')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewFilter === 'faculty' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty View
            </button>
          </div>

          {/* Selector Dropdown based on active view */}
          {viewFilter === 'division' ? (
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.students} Students)</option>
              ))}
            </select>
          ) : (
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
              ))}
            </select>
          )}

          {/* Action buttons */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
            title="Print Schedule Grid"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={() => setIsPublishOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Color Coding Legend Bar */}
      <div className="bg-white px-5 py-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between text-xs gap-3">
        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
          Schedule Legend:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
            <span className="text-slate-600">Theory Lecture (Neutral)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300" />
            <span className="text-slate-600">Laboratory Practical (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300" />
            <span className="text-slate-600">Constraint Conflict (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-200" />
            <span className="text-slate-600">Break / Recess (Amber)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200" />
            <span className="text-slate-400">Free / Unassigned Slot</span>
          </div>
        </div>
      </div>

      {/* TIMETABLE GRID TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-xs">
                <th className="py-3 px-4 w-32 border-r border-slate-800 font-semibold tracking-wide">
                  Time / Period
                </th>
                {DAYS.map(day => (
                  <th key={day} className="py-3 px-4 font-semibold text-center border-r border-slate-800 last:border-r-0">
                    {day.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {TIMETABLE_PERIOD_ROWS.map((row, rowIdx) => {
                if (row.type === 'break' || row.type === 'lunch') {
                  return (
                    <tr key={rowIdx} className="bg-amber-50/70 border-y border-amber-100/80">
                      <td className="py-2.5 px-4 font-mono font-medium text-amber-800 text-[11px] border-r border-amber-200/60">
                        {row.time}
                      </td>
                      <td colSpan={5} className="py-2.5 px-4 text-center font-bold text-amber-800 tracking-wider text-[11px] uppercase">
                        <div className="inline-flex items-center gap-2">
                          {row.type === 'lunch' ? <Utensils className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                          <span>{row.name}</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Regular Teaching Period row
                return (
                  <tr key={rowIdx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 bg-slate-50/60 border-r border-slate-200/80 align-top">
                      <div className="font-bold text-slate-900 text-xs">Period {row.num}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{row.time}</div>
                    </td>

                    {DAYS.map(day => {
                      const key = `${day}_P${row.num}`;
                      const entry = gridMap[key];

                      if (!entry) {
                        return (
                          <td 
                            key={day} 
                            className="p-2 border-r border-slate-100 last:border-r-0 align-top bg-slate-50/30 text-center"
                          >
                            <div className="h-full min-h-[68px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[11px]">
                              Free
                            </div>
                          </td>
                        );
                      }

                      const isLab = entry.subject_type === 'Lab' || entry.subject_name?.includes('Lab');
                      const isConflict = entry.has_conflict;

                      return (
                        <td 
                          key={day} 
                          className="p-1.5 border-r border-slate-100 last:border-r-0 align-top"
                        >
                          <div
                            onClick={() => setEditingEntry(entry)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] flex flex-col justify-between min-h-[72px] ${
                              isConflict
                                ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-sm ring-1 ring-rose-200'
                                : isLab
                                ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                                : 'bg-white border-slate-200/90 text-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-xs leading-tight line-clamp-1">
                                {entry.subject_name}
                              </span>
                              {isLab ? (
                                <FlaskConical className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              ) : isConflict ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              ) : null}
                            </div>

                            <div className="mt-2 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {entry.classroom_name}
                              </span>
                              <span className="truncate max-w-[90px] font-medium text-slate-600">
                                {viewFilter === 'faculty' ? entry.division_name : entry.faculty_name?.split(' ')?.[0] || entry.faculty_name}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <ScheduleModal
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
          allEntries={timetableEntries}
          faculty={faculty}
          classrooms={classrooms}
          divisions={divisions}
          subjects={subjects}
          onSaveEntry={onSaveEntry}
          onFindSuggestions={onFindSuggestions}
        />
      )}

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        divisions={divisions}
        timetableEntries={timetableEntries}
        conflicts={conflicts}
        onConfirmPublish={onPublishTimetable}
      />
    </div>
  );
}
