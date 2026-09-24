import React from 'react';
import { Clock, Coffee, Utensils, Calendar } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIMETABLE_SLOTS = [
  { period: 1, name: "Period 1", start: "09:00", end: "10:00", type: "lecture", duration: "60 mins" },
  { period: 2, name: "Period 2", start: "10:00", end: "11:00", type: "lecture", duration: "60 mins" },
  { period: 0, name: "Tea & Morning Break", start: "11:00", end: "11:15", type: "break", duration: "15 mins" },
  { period: 3, name: "Period 3", start: "11:15", end: "12:15", type: "lecture", duration: "60 mins" },
  { period: 4, name: "Period 4", start: "12:15", end: "13:15", type: "lecture", duration: "60 mins" },
  { period: 0, name: "Lunch Recess", start: "13:15", end: "14:00", type: "lunch", duration: "45 mins" },
  { period: 5, name: "Period 5", start: "14:00", end: "15:00", type: "lecture", duration: "60 mins" },
  { period: 6, name: "Period 6", start: "15:00", end: "16:00", type: "lecture", duration: "60 mins" },
];

export default function TimeSlotsView() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Time Slots & Period Grid</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configured 6 daily teaching periods and break intervals across the 5-day academic week.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-700">
            30 Teaching Slots / Division / Week
          </span>
        </div>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIMETABLE_SLOTS.map((slot, index) => {
          const isBreak = slot.type === 'break' || slot.type === 'lunch';
          return (
            <div
              key={index}
              className={`p-5 rounded-xl border transition-all ${
                isBreak
                  ? 'bg-amber-50/60 border-amber-200/80 shadow-none'
                  : 'bg-white border-slate-200/80 shadow-sm hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  slot.type === 'lunch'
                    ? 'bg-orange-100 text-orange-700'
                    : slot.type === 'break'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {isBreak ? (slot.type === 'lunch' ? 'Recess' : 'Break') : `Slot #${slot.period}`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{slot.duration}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  slot.type === 'lunch' ? 'bg-orange-100 text-orange-600' :
                  slot.type === 'break' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {slot.type === 'lunch' ? <Utensils className="w-4 h-4" /> :
                   slot.type === 'break' ? <Coffee className="w-4 h-4" /> :
                   <Clock className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{slot.name}</h4>
                  <div className="text-xs font-mono font-medium text-slate-500 mt-0.5">
                    {slot.start} – {slot.end}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week overview preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Weekly Operating Structure (Monday – Friday)
        </h3>
        <div className="grid grid-cols-5 gap-3 text-center">
          {DAYS.map(day => (
            <div key={day} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block">{day}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">6 Periods (09:00 - 16:00)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
