import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import DivisionsView from './components/master/DivisionsView';
import SubjectsView from './components/master/SubjectsView';
import FacultyView from './components/master/FacultyView';
import ClassroomsView from './components/master/ClassroomsView';
import TimeSlotsView from './components/master/TimeSlotsView';
import ConstraintsView from './components/constraints/ConstraintsView';
import GeneratorView from './components/generator/GeneratorView';
import ConflictCenterView from './components/conflicts/ConflictCenterView';
import TimetableReviewView from './components/timetable/TimetableReviewView';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('admin');
  const [loading, setLoading] = useState(true);

  // Core state
  const [dashboardData, setDashboardData] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [constraints, setConstraints] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [timetableStatus, setTimetableStatus] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all initial data
  const loadAllData = async () => {
    try {
      const [dash, divs, subs, facs, rooms, constr, tt, confs] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getDivisions().catch(() => []),
        api.getSubjects().catch(() => []),
        api.getFaculty().catch(() => []),
        api.getClassrooms().catch(() => []),
        api.getConstraints().catch(() => null),
        api.getTimetable().catch(() => ({ entries: [], status: null })),
        api.getConflicts().catch(() => [])
      ]);

      if (dash) setDashboardData(dash);
      if (divs) setDivisions(divs);
      if (subs) setSubjects(subs);
      if (facs) setFaculty(facs);
      if (rooms) setClassrooms(rooms);
      if (constr) setConstraints(constr);
      if (tt?.entries) setTimetableEntries(tt.entries);
      if (tt?.status) setTimetableStatus(tt.status);
      if (confs) setConflicts(confs);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync role switching
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role === 'faculty' || role === 'student') {
      setActiveTab('timetable');
    }
  };

  // Scenario presets
  const handleLoadScenario = async (scenario) => {
    try {
      const res = await api.loadScenario(scenario);
      await loadAllData();
      showToast(res.scenario || `Loaded preset ${scenario}`, 'success');
      if (scenario === 'conflict') {
        setActiveTab('conflicts');
      } else if (scenario === 'impossible') {
        setActiveTab('generate');
      } else {
        setActiveTab('timetable');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset all master data and schedules back to factory college defaults?")) {
      await api.resetAll();
      await loadAllData();
      showToast("Database restored to defaults", 'info');
      setActiveTab('dashboard');
    }
  };

  // Master Data handlers
  const handleAddDivision = async (data) => {
    try {
      await api.createDivision(data);
      await loadAllData();
      showToast(`Division ${data.name} added successfully`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateDivision = async (id, data) => {
    try {
      await api.updateDivision(id, data);
      await loadAllData();
      showToast(`Division ${data.name} updated`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteDivision = async (id) => {
    if (window.confirm("Delete this division?")) {
      try {
        await api.deleteDivision(id);
        await loadAllData();
        showToast("Division deleted", 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddSubject = async (data) => {
    try {
      await api.createSubject(data);
      await loadAllData();
      showToast(`Subject ${data.name} added`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateSubject = async (id, data) => {
    try {
      await api.updateSubject(id, data);
      await loadAllData();
      showToast(`Subject updated`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm("Delete this subject?")) {
      try {
        await api.deleteSubject(id);
        await loadAllData();
        showToast("Subject removed", 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddFaculty = async (data) => {
    try {
      await api.createFaculty(data);
      await loadAllData();
      showToast(`Faculty ${data.name} registered`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateFaculty = async (id, data) => {
    try {
      await api.updateFaculty(id, data);
      await loadAllData();
      showToast(`Faculty profile & availability updated`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm("Delete this faculty member?")) {
      try {
        await api.deleteFaculty(id);
        await loadAllData();
        showToast("Faculty removed", 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddClassroom = async (data) => {
    try {
      await api.createClassroom(data);
      await loadAllData();
      showToast(`Room ${data.name} registered`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateClassroom = async (id, data) => {
    try {
      await api.updateClassroom(id, data);
      await loadAllData();
      showToast(`Classroom updated`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (window.confirm("Delete this classroom?")) {
      try {
        await api.deleteClassroom(id);
        await loadAllData();
        showToast("Classroom removed", 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSaveConstraints = async (newConstraints) => {
    try {
      const res = await api.updateConstraints(newConstraints);
      setConstraints(res);
      await loadAllData();
      showToast("Scheduling constraints updated");
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRunValidate = async (data) => {
    return await api.validateSetup(data);
  };

  const handleRunGenerate = async (data) => {
    const res = await api.generateTimetable(data);
    await loadAllData();
    if (res.success) {
      showToast(`Successfully generated ${res.entries_count} classes!`);
    } else {
      showToast("Constraint solver flagged infeasibility", 'error');
    }
    return res;
  };

  const handleSaveEntry = async (updatedEntry) => {
    try {
      const res = await api.updateEntry(updatedEntry.id, updatedEntry);
      await loadAllData();
      if (res.has_conflict) {
        showToast("Slot moved, but schedule collision warning flagged", 'warning');
      } else {
        showToast("Schedule slot updated successfully");
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAutoResolveConflict = async (id) => {
    const res = await api.autoResolveConflict(id);
    await loadAllData();
    return res;
  };

  const handlePublishTimetable = async () => {
    try {
      const res = await api.publishTimetable();
      await loadAllData();
      showToast("Timetable published to students and faculty!");
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'timetable': return 'Timetable Grid & Review';
      case 'generate': return 'Generate Timetable';
      case 'divisions': return 'Divisions & Cohorts';
      case 'subjects': return 'Subject Curriculum';
      case 'faculty': return 'Faculty Directory';
      case 'classrooms': return 'Classrooms & Labs';
      case 'timeslots': return 'Time Slots & Periods';
      case 'constraints': return 'Scheduling Rules';
      case 'conflicts': return 'Conflict Center';
      default: return 'Intelligent Timetable Generator';
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'error' ? 'bg-rose-600' :
          toast.type === 'warning' ? 'bg-amber-600' :
          toast.type === 'info' ? 'bg-slate-800' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
           toast.type === 'info' ? <Info className="w-4 h-4" /> :
           <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={dashboardData?.stats}
        conflictsCount={conflicts?.length || 0}
        onLoadScenario={handleLoadScenario}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          timetableStatus={timetableStatus || dashboardData?.stats}
          activeTabTitle={getActiveTabTitle()}
          onPublishClick={() => {
            setActiveTab('timetable');
          }}
          onQuickGenerate={() => setActiveTab('generate')}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              dashboardData={dashboardData}
              setActiveTab={setActiveTab}
              onQuickGenerate={() => setActiveTab('generate')}
              onLoadScenario={handleLoadScenario}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableReviewView
              timetableEntries={timetableEntries}
              divisions={divisions}
              faculty={faculty}
              classrooms={classrooms}
              subjects={subjects}
              status={timetableStatus}
              conflicts={conflicts}
              currentRole={currentRole}
              onSaveEntry={handleSaveEntry}
              onFindSuggestions={api.getSuggestions}
              onPublishTimetable={handlePublishTimetable}
              onQuickGenerate={() => setActiveTab('generate')}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'generate' && (
            <GeneratorView
              divisions={divisions}
              constraints={constraints}
              onRunGenerate={handleRunGenerate}
              onRunValidate={handleRunValidate}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'divisions' && (
            <DivisionsView
              divisions={divisions}
              onAddDivision={handleAddDivision}
              onUpdateDivision={handleUpdateDivision}
              onDeleteDivision={handleDeleteDivision}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              faculty={faculty}
              divisions={divisions}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'faculty' && (
            <FacultyView
              faculty={faculty}
              subjects={subjects}
              onAddFaculty={handleAddFaculty}
              onUpdateFaculty={handleUpdateFaculty}
              onDeleteFaculty={handleDeleteFaculty}
            />
          )}

          {activeTab === 'classrooms' && (
            <ClassroomsView
              classrooms={classrooms}
              onAddClassroom={handleAddClassroom}
              onUpdateClassroom={handleUpdateClassroom}
              onDeleteClassroom={handleDeleteClassroom}
            />
          )}

          {activeTab === 'timeslots' && (
            <TimeSlotsView />
          )}

          {activeTab === 'constraints' && (
            <ConstraintsView
              constraints={constraints}
              onSaveConstraints={handleSaveConstraints}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictCenterView
              conflicts={conflicts}
              timetableEntries={timetableEntries}
              onAutoResolve={handleAutoResolveConflict}
              onMoveSlot={handleSaveEntry}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}
