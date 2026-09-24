from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class TimeSlotDef(BaseModel):
    id: str
    period_number: int
    name: str
    start_time: str
    end_time: str
    is_break: bool = False

class DaySchedule(BaseModel):
    day: str
    slots: List[TimeSlotDef]

class Division(BaseModel):
    id: str
    name: str
    department: str
    year: str
    semester: int
    students: int
    academic_year: str = "2026-27"

class Subject(BaseModel):
    id: str
    name: str
    code: str
    department: str
    type: str  # "Theory" or "Lab"
    sessions_per_week: int
    duration_periods: int = 1  # 1 for theory, 2 for lab
    required_room_type: str  # "Classroom", "Computer Lab", "Physics Lab", etc.
    preferred_consecutive: bool = False
    max_sessions_per_day: int = 2
    assigned_faculty_id: Optional[str] = None
    division_ids: List[str] = []
    difficulty: str = "Medium"  # "Hard", "Medium", "Easy"

class Faculty(BaseModel):
    id: str
    name: str
    department: str
    title: str = "Assistant Professor"
    subjects: List[str] = []  # Subject codes or IDs
    max_classes_per_day: int = 4
    max_classes_per_week: int = 20
    # Day name -> list of booleans matching teaching period indices
    availability: Dict[str, List[bool]] = {}
    preferred_slots: List[str] = ["Morning"]  # "Morning", "Afternoon"
    status: str = "Available"  # "Available", "Limited", "On Leave"

class Classroom(BaseModel):
    id: str
    name: str
    building: str = "Main Block"
    type: str  # "Classroom", "Computer Lab", "Physics Lab", "Seminar Hall"
    capacity: int
    features: List[str] = []
    status: str = "Active"  # "Active", "Maintenance"

class ConstraintSettings(BaseModel):
    # Hard constraints toggles
    faculty_no_overlap: bool = True
    division_no_overlap: bool = True
    room_no_overlap: bool = True
    room_capacity_sufficient: bool = True
    room_type_matches: bool = True
    faculty_availability_respected: bool = True
    max_classes_per_day_respected: bool = True
    
    # Soft constraints toggles & weights
    avoid_consecutive_same_subject: bool = True
    avoid_difficult_subject_clusters: bool = True
    prefer_faculty_morning_slots: bool = True
    distribute_evenly_across_week: bool = True
    minimize_student_idle_gaps: bool = True

class TimetableEntry(BaseModel):
    id: str
    division_id: str
    subject_id: str
    faculty_id: str
    classroom_id: str
    day: str
    period_number: int  # 1-indexed teaching period
    is_locked: bool = False
    has_conflict: bool = False
    conflict_notes: Optional[str] = None

class ConflictItem(BaseModel):
    id: str
    severity: str  # "critical", "warning", "impossible"
    type: str      # "faculty_conflict", "room_conflict", "division_conflict", "capacity_conflict", "room_type_mismatch", "availability_conflict", "impossible_constraint"
    title: str
    description: str
    affected_division: Optional[str] = None
    affected_subject: Optional[str] = None
    affected_faculty: Optional[str] = None
    affected_room: Optional[str] = None
    day: Optional[str] = None
    period_number: Optional[int] = None
    time_label: Optional[str] = None
    suggested_actions: List[Dict[str, Any]] = []

class GenerationRequest(BaseModel):
    academic_year: str = "2026-27"
    semester: int = 5
    division_ids: List[str] = []
    strategy: str = "balanced"  # "balanced", "minimize_gaps", "faculty_preference"
    constraints: Optional[ConstraintSettings] = None
    scenario_preset: Optional[str] = None  # None, "normal", "conflict", "impossible"

class TimetableStatus(BaseModel):
    status: str = "DRAFT"  # "DRAFT", "GENERATING", "GENERATED", "VALIDATED", "REVIEWED", "PUBLISHED"
    generated_at: Optional[str] = None
    published_at: Optional[str] = None
    total_classes: int = 0
    assigned_classes: int = 0
    unassigned_classes: int = 0
    critical_conflicts: int = 0
    warnings: int = 0
    soft_score: int = 94
    quality_label: str = "Excellent"
    solver_stats: Dict[str, Any] = {}
