import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Clock, User, Building2, BookOpen, Layers } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
  { id: 1, label: "09:00 - 10:00" },
  { id: 2, label: "10:00 - 11:00" },
  { id: 3, label: "11:15 - 12:15" },
  { id: 4, label: "12:15 - 13:15" },
  { id: 5, label: "14:00 - 15:00" },
  { id: 6, label: "15:00 - 16:00" },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  entry,
  allEntries,
  faculty,
  classrooms,
  divisions,
  subjects,
  onSaveEntry,
  onFindSuggestions
}) {
  if (!isOpen || !entry) return null;

  const [day, setDay] = useState(entry.day || "Monday");
  const [period, setPeriod] = useState(entry.period_number || 1);
  const [roomId, setRoomId] = useState(entry.classroom_id || "");
  const [facultyId, setFacultyId] = useState(entry.faculty_id || "");
  const [suggestions, setSuggestions] = useState([]);
  const [conflictMsg, setConflictMsg] = useState(null);

  const sub = subjects.find(s => s.id === entry.subject_id);
  const div = divisions.find(d => d.id === entry.division_id);

  // Real-time conflict validation when user changes slot/room/faculty
  useEffect(() => {
    let msg = null;

    // 1. Faculty collision check
    const facOverlap = allEntries.find(e => 
      e.id !== entry.id && 
      e.faculty_id === facultyId && 
      e.day === day && 
      e.period_number === period
    );
    if (facOverlap) {
      const facObj = faculty.find(f => f.id === facultyId);
      const otherDiv = divisions.find(d => d.id === facOverlap.division_id);
      const otherSub = subjects.find(s => s.id === facOverlap.subject_id);
      msg = `${facObj?.name || 'Faculty'} is already teaching ${otherSub?.name || 'another subject'} to ${otherDiv?.name || 'another division'} on ${day} ${PERIODS.find(p=>p.id===period)?.label}.`;
    }

    // 2. Division collision check
    const divOverlap = allEntries.find(e => 
      e.id !== entry.id && 
      e.division_id === entry.division_id && 
      e.day === day && 
      e.period_number === period
    );
    if (divOverlap && !msg) {
      msg = `Division ${div?.name} already has a scheduled class during this time period.`;
    }

    // 3. Room collision check
    const roomOverlap = allEntries.find(e => 
      e.id !== entry.id && 
      e.classroom_id === roomId && 
      e.day === day && 
      e.period_number === period
    );
    if (roomOverlap && !msg) {
      const roomObj = classrooms.find(r => r.id === roomId);
      msg = `Classroom ${roomObj?.name} is already occupied during ${day} period #${period}.`;
    }

    setConflictMsg(msg);
  }, [day, period, roomId, facultyId, allEntries, entry.id, entry.division_id]);

  // Load intelligent alternatives
  useEffect(() => {
    if (onFindSuggestions) {
      onFindSuggestions(entry).then(res => {
        if (res?.suggestions) setSuggestions(res.suggestions);
      }).catch(err => console.error(err));
    }
  }, [entry, onFindSuggestions]);

  const handleSave = () => {
    onSaveEntry({
      ...entry,
      day,
      period_number: period,
      classroom_id: roomId,
      faculty_id: facultyId
    });
    onClose();
  };

  const applySuggestion = (sug) => {
    setDay(sug.day);
    setPeriod(sug.period_number);
    setRoomId(sug.classroom_id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Edit Schedule Assignment</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Modify assigned slot, room, or professor with real-time clash verification.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Info Header */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 my-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 text-sm">{sub?.name}</span>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Code: {sub?.code} • {sub?.type}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            {div?.name}
          </span>
        </div>

        {/* Edit Form */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {PERIODS.map(p => (
                  <option key={p.id} value={p.id}>Period {p.id} ({p.label})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Classroom / Lab</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classrooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type}, {r.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Assigned Faculty</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Conflict Banner */}
          {conflictMsg ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Conflict Detected:</span>
                <p className="mt-0.5 text-rose-700">{conflictMsg}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Slot Available: Faculty ✓ Room ✓ Division ✓</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">Zero Collision</span>
            </div>
          )}

          {/* Calculated Suggested Alternatives */}
          {suggestions.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-slate-700 text-xs block mb-1.5">
                Suggested Clash-Free Slots:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.slice(0, 4).map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applySuggestion(sug)}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all"
                  >
                    <div className="font-bold text-slate-800">{sug.day}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sug.time_label}</div>
                    <div className="text-[10px] text-indigo-600 mt-1">{sug.classroom_name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm transition-colors ${
                conflictMsg ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {conflictMsg ? 'Save With Warning' : 'Save Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
