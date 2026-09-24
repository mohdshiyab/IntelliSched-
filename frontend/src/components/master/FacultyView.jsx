import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CalendarCheck, Check, X, Clock, Sun, Moon } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
  { id: 1, label: "09:00 - 10:00" },
  { id: 2, label: "10:00 - 11:00" },
  { id: 3, label: "11:15 - 12:15" },
  { id: 4, label: "12:15 - 13:15" },
  { id: 5, label: "14:00 - 15:00" },
  { id: 6, label: "15:00 - 16:00" },
];

export default function FacultyView({ faculty, subjects, onAddFaculty, onUpdateFaculty, onDeleteFaculty }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Computer Science',
    title: 'Assistant Professor',
    max_classes_per_day: 4,
    max_classes_per_week: 18,
    preferred_slots: ['Morning'],
    status: 'Available',
    availability: DAYS.reduce((acc, d) => ({ ...acc, [d]: [true, true, true, true, true, true] }), {})
  });

  const filtered = (faculty || []).filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      department: 'Computer Science',
      title: 'Assistant Professor',
      max_classes_per_day: 4,
      max_classes_per_week: 18,
      preferred_slots: ['Morning'],
      status: 'Available',
      availability: DAYS.reduce((acc, d) => ({ ...acc, [d]: [true, true, true, true, true, true] }), {})
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingItem(fac);
    setFormData({
      name: fac.name,
      department: fac.department,
      title: fac.title || 'Assistant Professor',
      max_classes_per_day: fac.max_classes_per_day || 4,
      max_classes_per_week: fac.max_classes_per_week || 18,
      preferred_slots: fac.preferred_slots || ['Morning'],
      status: fac.status || 'Available',
      availability: fac.availability || DAYS.reduce((acc, d) => ({ ...acc, [d]: [true, true, true, true, true, true] }), {})
    });
    setIsModalOpen(true);
  };

  const toggleSlot = (day, periodIdx) => {
    setFormData(prev => {
      const currentDay = [...(prev.availability[day] || [true, true, true, true, true, true])];
      currentDay[periodIdx] = !currentDay[periodIdx];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: currentDay
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateFaculty(editingItem.id, { ...formData, id: editingItem.id });
    } else {
      onAddFaculty({ ...formData, id: `FAC_${formData.name.replace(/\s+/g, '_').replace(/\./g, '').toUpperCase()}` });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Directory & Workload</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage professors, daily limits, and their day-by-day availability constraint matrices.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Faculty Member</th>
              <th className="py-3.5 px-6">Department</th>
              <th className="py-3.5 px-6">Max Daily Load</th>
              <th className="py-3.5 px-6">Availability Windows</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No faculty members found.
                </td>
              </tr>
            ) : (
              filtered.map((fac) => {
                // Calculate available slot count
                let availableSlots = 0;
                DAYS.forEach(d => {
                  const arr = fac.availability?.[d] || [true, true, true, true, true, true];
                  availableSlots += arr.filter(Boolean).length;
                });

                return (
                  <tr key={fac.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div>{fac.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">{fac.title}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {fac.department}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <span className="font-semibold text-slate-800">{fac.max_classes_per_day}</span> classes/day
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold text-indigo-700">{availableSlots}/30</span>
                        <span className="text-slate-400 text-[10px]">slots open</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        fac.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {fac.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Faculty & Availability Matrix"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFaculty(fac.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal with Availability Matrix Grid */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  {editingItem ? 'Edit Faculty & Availability Matrix' : 'Add Faculty'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The solver strictly enforces marked unavailable (✕) periods as a hard constraint.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Faculty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ravi Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Science">Information Science</option>
                    <option value="Basic Science">Basic Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Maximum Classes / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.max_classes_per_day}
                    onChange={(e) => setFormData({ ...formData, max_classes_per_day: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* AVAILABILITY MATRIX GRID */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Weekly Availability Matrix (Constraint Input)
                  </span>
                  <span className="text-[11px] text-slate-400">Click any box to toggle (✓ Available / ✕ Off)</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-3 text-left">Period</th>
                        {DAYS.map(day => (
                          <th key={day} className="py-2 px-2">{day.slice(0, 3)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {PERIODS.map((period, pIdx) => (
                        <tr key={period.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-left font-medium text-slate-700 bg-slate-50/60 font-mono text-[11px]">
                            {period.label}
                          </td>
                          {DAYS.map(day => {
                            const isAvail = formData.availability?.[day]?.[pIdx] ?? true;
                            return (
                              <td key={day} className="py-2 px-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSlot(day, pIdx)}
                                  className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all ${
                                    isAvail
                                      ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                                      : 'bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-300'
                                  }`}
                                  title={`${day} ${period.label}: ${isAvail ? 'Available' : 'Unavailable'}`}
                                >
                                  {isAvail ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  {editingItem ? 'Save Faculty Constraints' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
