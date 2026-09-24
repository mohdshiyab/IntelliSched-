const API_BASE = "http://localhost:8000/api";

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson("/dashboard"),
  
  // Master data
  getDivisions: () => fetchJson("/divisions"),
  createDivision: (data) => fetchJson("/divisions", { method: "POST", body: JSON.stringify(data) }),
  updateDivision: (id, data) => fetchJson(`/divisions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDivision: (id) => fetchJson(`/divisions/${id}`, { method: "DELETE" }),

  getSubjects: () => fetchJson("/subjects"),
  createSubject: (data) => fetchJson("/subjects", { method: "POST", body: JSON.stringify(data) }),
  updateSubject: (id, data) => fetchJson(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSubject: (id) => fetchJson(`/subjects/${id}`, { method: "DELETE" }),

  getFaculty: () => fetchJson("/faculty"),
  createFaculty: (data) => fetchJson("/faculty", { method: "POST", body: JSON.stringify(data) }),
  updateFaculty: (id, data) => fetchJson(`/faculty/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFaculty: (id) => fetchJson(`/faculty/${id}`, { method: "DELETE" }),

  getClassrooms: () => fetchJson("/classrooms"),
  createClassroom: (data) => fetchJson("/classrooms", { method: "POST", body: JSON.stringify(data) }),
  updateClassroom: (id, data) => fetchJson(`/classrooms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClassroom: (id) => fetchJson(`/classrooms/${id}`, { method: "DELETE" }),

  getTimeSlots: () => fetchJson("/timeslots"),
  
  // Constraints
  getConstraints: () => fetchJson("/constraints"),
  updateConstraints: (data) => fetchJson("/constraints", { method: "PUT", body: JSON.stringify(data) }),

  // Timetable & Solver
  validateSetup: (data) => fetchJson("/timetable/validate", { method: "POST", body: JSON.stringify(data) }),
  generateTimetable: (data) => fetchJson("/timetable/generate", { method: "POST", body: JSON.stringify(data) }),
  getTimetable: (divisionId, facultyId) => {
    const params = new URLSearchParams();
    if (divisionId) params.append("division_id", divisionId);
    if (facultyId) params.append("faculty_id", facultyId);
    return fetchJson(`/timetable?${params.toString()}`);
  },
  updateEntry: (id, data) => fetchJson(`/timetable/entry/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  publishTimetable: () => fetchJson("/timetable/publish", { method: "POST" }),
  
  // Conflicts & Suggestions
  getConflicts: () => fetchJson("/conflicts"),
  getSuggestions: (entry) => fetchJson("/conflicts/suggestions", { method: "POST", body: JSON.stringify(entry) }),
  autoResolveConflict: (id) => fetchJson(`/conflicts/${id}/auto-resolve`, { method: "POST" }),

  // Scenarios & Reset
  loadScenario: (scenarioName) => fetchJson(`/scenarios/load?scenario=${scenarioName}`, { method: "POST" }),
  resetAll: () => fetchJson("/reset", { method: "POST" }),
};
