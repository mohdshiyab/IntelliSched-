import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, BookOpen, FlaskConical, X } from 'lucide-react';

export default function SubjectsView({ 
  subjects, 
  faculty, 
  divisions, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject 
}) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Computer Science',
    type: 'Theory',
    sessions_per_week: 4,
    duration_periods: 1,
    required_room_type: 'Classroom',
    preferred_consecutive: false,
    max_sessions_per_day: 2,
    assigned_faculty_id: '',
    division_ids: [],
    difficulty: 'Medium'
  });

  const facultyMap = (faculty || []).reduce((acc, f) => {
    acc[f.id] = f.name;
    return acc;
  }, {});

  const filtered = (subjects || []).filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || 
                          sub.code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || sub.department === deptFilter;
    const matchesType = typeFilter === 'ALL' || sub.type === typeFilter;
    return matchesSearch && matchesDept && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      department: 'Computer Science',
      type: 'Theory',
      sessions_per_week: 4,
      duration_periods: 1,
      required_room_type: 'Classroom',
      preferred_consecutive: false,
      max_sessions_per_day: 2,
      assigned_faculty_id: faculty?.[0]?.id || '',
      division_ids: divisions?.map(d => d.id) || [],
      difficulty: 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingItem(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      department: sub.department,
      type: sub.type,
      sessions_per_week: sub.sessions_per_week,
      duration_periods: sub.duration_periods || 1,
      required_room_type: sub.required_room_type,
      preferred_consecutive: sub.preferred_consecutive || false,
      max_sessions_per_day: sub.max_sessions_per_day || 2,
      assigned_faculty_id: sub.assigned_faculty_id || '',
      division_ids: sub.division_ids || [],
      difficulty: sub.difficulty || 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateSubject(editingItem.id, { ...formData, id: editingItem.id });
    } else {
      onAddSubject({ ...formData, id: `SUB_${formData.code.replace(/\s+/g, '_').toUpperCase()}` });
    }
    setIsModalOpen(false);
  };

  const toggleDivision = (divId) => {
    setFormData(prev => {
      const exists = prev.division_ids.includes(divId);
      return {
        ...prev,
        division_ids: exists 
          ? prev.division_ids.filter(id => id !== divId)
          : [...prev.division_ids, divId]
      };
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subjects & Course Curriculum</h1>
          <p className="text-xs text-slate-500 mt-0.5">Define theory lectures, practical labs, period requirements, and room preferences.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Science">Information Science</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Types</option>
            <option value="Theory">Theory Only</option>
            <option value="Lab">Lab Practical Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Subject Name</th>
              <th className="py-3.5 px-6">Code</th>
              <th className="py-3.5 px-6">Type</th>
              <th className="py-3.5 px-6">Sessions / Wk</th>
              <th className="py-3.5 px-6">Required Room</th>
              <th className="py-3.5 px-6">Assigned Faculty</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No subjects found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {sub.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600 font-medium">
                    {sub.code}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      sub.type === 'Lab' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {sub.type === 'Lab' ? <FlaskConical className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                      {sub.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-semibold">
                    {sub.sessions_per_week}/week
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({sub.duration_periods || 1} period block)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {sub.required_room_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {facultyMap[sub.assigned_faculty_id] || (
                      <span className="text-amber-600 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingItem ? 'Edit Subject' : 'Add Subject'}
              </h3>
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
                  <label className="block font-medium text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Systems"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS501"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Type Radio */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      checked={formData.type === 'Theory'}
                      onChange={() => setFormData({ 
                        ...formData, 
                        type: 'Theory', 
                        duration_periods: 1, 
                        required_room_type: 'Classroom',
                        preferred_consecutive: false 
                      })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Theory Lecture</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      checked={formData.type === 'Lab'}
                      onChange={() => setFormData({ 
                        ...formData, 
                        type: 'Lab', 
                        duration_periods: 2, 
                        required_room_type: 'Computer Lab',
                        preferred_consecutive: true 
                      })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Lab Practical (2 Periods)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sessions Per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.sessions_per_week}
                    onChange={(e) => setFormData({ ...formData, sessions_per_week: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration (Periods)</label>
                  <select
                    value={formData.duration_periods}
                    onChange={(e) => setFormData({ ...formData, duration_periods: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>1 Period (1 hour)</option>
                    <option value={2}>2 Periods Continuous (2 hours)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Required Room Type</label>
                  <select
                    value={formData.required_room_type}
                    onChange={(e) => setFormData({ ...formData, required_room_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Physics Lab">Physics Lab</option>
                    <option value="Seminar Hall">Seminar Hall</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Faculty</label>
                  <select
                    value={formData.assigned_faculty_id}
                    onChange={(e) => setFormData({ ...formData, assigned_faculty_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Faculty --</option>
                    {(faculty || []).map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Divisions */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Divisions</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(divisions || []).map(div => {
                    const selected = formData.division_ids.includes(div.id);
                    return (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() => toggleDivision(div.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {div.name}
                      </button>
                    );
                  })}
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
                  {editingItem ? 'Save Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
