from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import datetime
import uuid

from models import (
    Division, Subject, Faculty, Classroom, TimeSlotDef,
    ConstraintSettings, TimetableEntry, ConflictItem,
    GenerationRequest, TimetableStatus
)
from database import db, DAYS_OF_WEEK, PERIOD_HOURS
from solver import TimetableSolver, validate_setup_precheck

app = FastAPI(
    title="Intelligent Timetable Generator API",
    description="Backend API powered by Google OR-Tools CP-SAT Constraint Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- DASHBOARD & STATS -----------------
@app.get("/api/dashboard")
def get_dashboard_summary():
    return {
        "stats": {
            "divisions_count": len(db.divisions),
            "subjects_count": len(db.subjects),
            "faculty_count": len(db.faculty),
            "rooms_count": len(db.classrooms),
            "total_slots": len(db.timetable_entries),
            "conflicts_count": len(db.conflicts),
            "critical_conflicts": sum(1 for c in db.conflicts if c.severity == "critical" or c.severity == "impossible"),
            "warnings_count": sum(1 for c in db.conflicts if c.severity == "warning"),
            "unassigned_classes": db.status.unassigned_classes,
            "status": db.status.status,
            "quality_label": db.status.quality_label,
            "soft_score": db.status.soft_score,
            "generated_at": db.status.generated_at,
            "published_at": db.status.published_at,
        },
        "recent_activities": db.recent_activities,
        "divisions": list(db.divisions.values()),
        "status_detail": db.status
    }

# ----------------- MASTER DATA: DIVISIONS -----------------
@app.get("/api/divisions", response_model=List[Division])
def list_divisions():
    return list(db.divisions.values())

@app.post("/api/divisions", response_model=Division)
def create_division(item: Division):
    if not item.id:
        item.id = f"DIV_{item.name.replace(' ', '_').replace('-', '_').upper()}_{uuid.uuid4().hex[:4]}"
    db.divisions[item.id] = item
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": f"Added Division {item.name} ({item.department})"
    })
    db.persist_to_sql()
    return item

@app.put("/api/divisions/{id}", response_model=Division)
def update_division(id: str, item: Division):
    if id not in db.divisions:
        raise HTTPException(status_code=404, detail="Division not found")
    item.id = id
    db.divisions[id] = item
    db.persist_to_sql()
    return item

@app.delete("/api/divisions/{id}")
def delete_division(id: str):
    if id not in db.divisions:
        raise HTTPException(status_code=404, detail="Division not found")
    del db.divisions[id]
    db.persist_to_sql()
    return {"success": True, "message": f"Division {id} deleted"}

# ----------------- MASTER DATA: SUBJECTS -----------------
@app.get("/api/subjects", response_model=List[Subject])
def list_subjects():
    return list(db.subjects.values())

@app.post("/api/subjects", response_model=Subject)
def create_subject(item: Subject):
    if not item.id:
        item.id = f"SUB_{item.code.replace(' ', '_').upper()}_{uuid.uuid4().hex[:4]}"
    db.subjects[item.id] = item
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": f"Added Subject {item.code}: {item.name}"
    })
    db.persist_to_sql()
    return item

@app.put("/api/subjects/{id}", response_model=Subject)
def update_subject(id: str, item: Subject):
    if id not in db.subjects:
        raise HTTPException(status_code=404, detail="Subject not found")
    item.id = id
    db.subjects[id] = item
    db.persist_to_sql()
    return item

@app.delete("/api/subjects/{id}")
def delete_subject(id: str):
    if id not in db.subjects:
        raise HTTPException(status_code=404, detail="Subject not found")
    del db.subjects[id]
    db.persist_to_sql()
    return {"success": True, "message": f"Subject {id} deleted"}

# ----------------- MASTER DATA: FACULTY -----------------
@app.get("/api/faculty", response_model=List[Faculty])
def list_faculty():
    return list(db.faculty.values())

@app.post("/api/faculty", response_model=Faculty)
def create_faculty(item: Faculty):
    if not item.id:
        item.id = f"FAC_{item.name.replace(' ', '_').replace('.', '').upper()}_{uuid.uuid4().hex[:4]}"
    db.faculty[item.id] = item
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": f"Added Faculty member {item.name}"
    })
    db.persist_to_sql()
    return item

@app.put("/api/faculty/{id}", response_model=Faculty)
def update_faculty(id: str, item: Faculty):
    if id not in db.faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    item.id = id
    db.faculty[id] = item
    db.persist_to_sql()
    return item

@app.delete("/api/faculty/{id}")
def delete_faculty(id: str):
    if id not in db.faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    del db.faculty[id]
    db.persist_to_sql()
    return {"success": True, "message": f"Faculty {id} deleted"}

# ----------------- MASTER DATA: CLASSROOMS -----------------
@app.get("/api/classrooms", response_model=List[Classroom])
def list_classrooms():
    return list(db.classrooms.values())

@app.post("/api/classrooms", response_model=Classroom)
def create_classroom(item: Classroom):
    if not item.id:
        item.id = f"ROOM_{item.name.replace(' ', '_').replace('-', '_').upper()}_{uuid.uuid4().hex[:4]}"
    db.classrooms[item.id] = item
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": f"Added Classroom {item.name} ({item.type}, cap: {item.capacity})"
    })
    db.persist_to_sql()
    return item

@app.put("/api/classrooms/{id}", response_model=Classroom)
def update_classroom(id: str, item: Classroom):
    if id not in db.classrooms:
        raise HTTPException(status_code=404, detail="Classroom not found")
    item.id = id
    db.classrooms[id] = item
    db.persist_to_sql()
    return item

@app.delete("/api/classrooms/{id}")
def delete_classroom(id: str):
    if id not in db.classrooms:
        raise HTTPException(status_code=404, detail="Classroom not found")
    del db.classrooms[id]
    db.persist_to_sql()
    return {"success": True, "message": f"Classroom {id} deleted"}

# ----------------- MASTER DATA: TIME SLOTS -----------------
@app.get("/api/timeslots")
def get_timeslots():
    return {
        "days": db.days,
        "slots": db.time_slots,
        "period_hours": PERIOD_HOURS
    }

# ----------------- CONSTRAINTS -----------------
@app.get("/api/constraints", response_model=ConstraintSettings)
def get_constraints():
    return db.constraints

@app.put("/api/constraints", response_model=ConstraintSettings)
def update_constraints(settings: ConstraintSettings):
    db.constraints = settings
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": "Updated Scheduling Constraints and Optimization weights"
    })
    db.persist_to_sql()
    return db.constraints

# ----------------- PRE-GENERATION VALIDATION -----------------
@app.post("/api/timetable/validate")
def validate_timetable(req: Optional[GenerationRequest] = None):
    division_ids = req.division_ids if req and req.division_ids else list(db.divisions.keys())
    result = validate_setup_precheck(
        db.divisions, db.subjects, db.faculty, db.classrooms, division_ids
    )
    return result

# ----------------- TIMETABLE GENERATOR (OR-TOOLS) -----------------
@app.post("/api/timetable/generate")
def generate_timetable(req: GenerationRequest):
    # Check scenario preset if explicitly requested
    if req.scenario_preset:
        load_scenario(req.scenario_preset)

    target_divs = req.division_ids if req.division_ids else list(db.divisions.keys())
    active_constraints = req.constraints if req.constraints else db.constraints

    solver = TimetableSolver(
        divisions=db.divisions,
        subjects=db.subjects,
        faculty=db.faculty,
        classrooms=db.classrooms,
        constraints=active_constraints,
        target_division_ids=target_divs,
        strategy=req.strategy
    )

    success, entries, conflicts, stats = solver.solve()

    if success:
        db.timetable_entries = entries
        db.conflicts = conflicts
        db.status.status = "GENERATED"
        db.status.generated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        db.status.total_classes = len(entries)
        db.status.assigned_classes = len(entries)
        db.status.unassigned_classes = 0
        db.status.critical_conflicts = 0
        db.status.warnings = 0
        db.status.soft_score = stats.get("soft_score", 95)
        db.status.quality_label = stats.get("quality_label", "Optimal")
        db.status.solver_stats = stats

        db.recent_activities.insert(0, {
            "time": "Just now",
            "message": f"Successfully generated timetable ({len(entries)} classes assigned, 0 conflicts)"
        })
        db.persist_to_sql()

        return {
            "success": True,
            "message": "Timetable generated successfully!",
            "entries_count": len(entries),
            "stats": stats,
            "conflicts": [],
            "status": db.status
        }
    else:
        # Generation failed / infeasible
        db.timetable_entries = []
        db.conflicts = conflicts
        db.status.status = "DRAFT"
        db.status.critical_conflicts = len(conflicts)
        db.status.soft_score = 0
        db.status.quality_label = "Unfeasible"
        db.status.solver_stats = stats

        db.recent_activities.insert(0, {
            "time": "Just now",
            "message": "Timetable generation flagged impossible/conflicting constraints"
        })
        db.persist_to_sql()

        return {
            "success": False,
            "message": "Unable to generate feasible timetable.",
            "stats": stats,
            "conflicts": conflicts,
            "impossible_details": stats.get("impossible_details"),
            "status": db.status
        }

# ----------------- TIMETABLE RETRIEVAL & REVIEW -----------------
@app.get("/api/timetable")
def get_timetable(division_id: Optional[str] = None, faculty_id: Optional[str] = None):
    filtered_entries = db.timetable_entries
    if division_id:
        filtered_entries = [e for e in filtered_entries if e.division_id == division_id]
    if faculty_id:
        filtered_entries = [e for e in filtered_entries if e.faculty_id == faculty_id]

    # Populate entity metadata for convenient client display
    enriched = []
    for e in filtered_entries:
        div = db.divisions.get(e.division_id)
        sub = db.subjects.get(e.subject_id)
        fac = db.faculty.get(e.faculty_id)
        room = db.classrooms.get(e.classroom_id)
        enriched.append({
            **e.dict(),
            "division_name": div.name if div else e.division_id,
            "subject_name": sub.name if sub else e.subject_id,
            "subject_code": sub.code if sub else "",
            "subject_type": sub.type if sub else "Theory",
            "faculty_name": fac.name if fac else e.faculty_id,
            "classroom_name": room.name if room else e.classroom_id,
            "classroom_type": room.type if room else "",
            "time_label": PERIOD_HOURS.get(e.period_number, f"Period {e.period_number}")
        })

    return {
        "entries": enriched,
        "status": db.status,
        "divisions": list(db.divisions.values()),
        "faculty": list(db.faculty.values()),
        "classrooms": list(db.classrooms.values()),
        "subjects": list(db.subjects.values()),
        "days": db.days,
        "period_hours": PERIOD_HOURS
    }

# ----------------- MANUAL EDITING & CONFLICT VERIFICATION -----------------
@app.put("/api/timetable/entry/{id}")
def update_timetable_entry(id: str, updated: TimetableEntry):
    # Find existing entry
    idx = None
    for i, e in enumerate(db.timetable_entries):
        if e.id == id:
            idx = i
            break
    if idx is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    # Conflict check for new slot:
    # 1. Faculty conflict
    fac_conflict = any(
        e.id != id and e.faculty_id == updated.faculty_id and e.day == updated.day and e.period_number == updated.period_number
        for e in db.timetable_entries
    )
    # 2. Division conflict
    div_conflict = any(
        e.id != id and e.division_id == updated.division_id and e.day == updated.day and e.period_number == updated.period_number
        for e in db.timetable_entries
    )
    # 3. Room conflict
    room_conflict = any(
        e.id != id and e.classroom_id == updated.classroom_id and e.day == updated.day and e.period_number == updated.period_number
        for e in db.timetable_entries
    )

    conflict_reasons = []
    fac = db.faculty.get(updated.faculty_id)
    div = db.divisions.get(updated.division_id)
    room = db.classrooms.get(updated.classroom_id)

    if fac_conflict:
        # Find which class
        other = next(e for e in db.timetable_entries if e.id != id and e.faculty_id == updated.faculty_id and e.day == updated.day and e.period_number == updated.period_number)
        other_sub = db.subjects.get(other.subject_id)
        other_div = db.divisions.get(other.division_id)
        conflict_reasons.append(
            f"{fac.name if fac else 'Faculty'} is already teaching {other_sub.name if other_sub else 'another subject'} to {other_div.name if other_div else 'another division'} on {updated.day} {PERIOD_HOURS.get(updated.period_number, '')}."
        )

    if div_conflict:
        conflict_reasons.append(
            f"{div.name if div else 'Division'} already has a scheduled lecture at this time."
        )

    if room_conflict:
        conflict_reasons.append(
            f"Classroom {room.name if room else updated.classroom_id} is already occupied during this period."
        )

    has_conflict = len(conflict_reasons) > 0
    updated.has_conflict = has_conflict
    updated.conflict_notes = " | ".join(conflict_reasons) if has_conflict else None

    db.timetable_entries[idx] = updated

    # Recalculate status conflicts
    db.conflicts = []
    if has_conflict:
        db.conflicts.append(
            ConflictItem(
                id=f"CONF_MANUAL_{uuid.uuid4().hex[:6]}",
                severity="critical",
                type="faculty_conflict" if fac_conflict else "room_conflict",
                title="Manual Schedule Collision Detected",
                description=" | ".join(conflict_reasons),
                affected_division=div.name if div else None,
                affected_faculty=fac.name if fac else None,
                affected_room=room.name if room else None,
                day=updated.day,
                period_number=updated.period_number,
                time_label=PERIOD_HOURS.get(updated.period_number)
            )
        )
        db.status.critical_conflicts = len(db.conflicts)

    db.persist_to_sql()

    return {
        "success": True,
        "entry": updated,
        "has_conflict": has_conflict,
        "conflict_reasons": conflict_reasons
    }

# ----------------- INTELLIGENT ALTERNATIVES SUGGESTER -----------------
@app.post("/api/conflicts/suggestions")
def get_slot_suggestions(entry: TimetableEntry):
    solver = TimetableSolver(
        divisions=db.divisions,
        subjects=db.subjects,
        faculty=db.faculty,
        classrooms=db.classrooms,
        constraints=db.constraints
    )
    alternatives = solver.find_alternative_slots(entry, db.timetable_entries)
    return {"suggestions": alternatives}

# ----------------- CONFLICT CENTER -----------------
@app.get("/api/conflicts", response_model=List[ConflictItem])
def get_conflicts():
    return db.conflicts

@app.post("/api/conflicts/{id}/auto-resolve")
def resolve_conflict(id: str):
    # Find matching conflict
    target_conf = next((c for c in db.conflicts if c.id == id), None)
    if not target_conf:
        # Check if any conflict exists to resolve
        if db.conflicts:
            target_conf = db.conflicts[0]
        else:
            return {"success": True, "message": "No active conflicts."}

    # If it is impossible constraint, return recommendations
    if target_conf.severity == "impossible":
        return {
            "success": False,
            "message": "Impossible constraint requires master data adjustment.",
            "recommendation": target_conf.description
        }

    # Find affected entry and move to alternative
    for entry in db.timetable_entries:
        if entry.day == target_conf.day and entry.period_number == target_conf.period_number:
            solver = TimetableSolver(db.divisions, db.subjects, db.faculty, db.classrooms, db.constraints)
            alts = solver.find_alternative_slots(entry, db.timetable_entries)
            if alts:
                alt = alts[0]
                entry.day = alt["day"]
                entry.period_number = alt["period_number"]
                entry.classroom_id = alt["classroom_id"]
                entry.has_conflict = False
                entry.conflict_notes = None
                db.conflicts = [c for c in db.conflicts if c.id != id]
                db.status.critical_conflicts = len(db.conflicts)
                db.persist_to_sql()
                return {
                    "success": True,
                    "message": f"Automatically moved to {alt['day']} {alt['time_label']} ({alt['classroom_name']})",
                    "new_slot": alt
                }

    db.conflicts = [c for c in db.conflicts if c.id != id]
    db.status.critical_conflicts = len(db.conflicts)
    db.persist_to_sql()
    return {"success": True, "message": "Conflict dismissed"}

# ----------------- PUBLISH TIMETABLE WORKFLOW -----------------
@app.post("/api/timetable/publish")
def publish_timetable():
    if not db.timetable_entries:
        raise HTTPException(status_code=400, detail="Cannot publish empty timetable. Please generate first.")
    
    # Check if critical conflicts remain
    critical_count = sum(1 for c in db.conflicts if c.severity in ("critical", "impossible"))
    if critical_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot publish with {critical_count} critical conflicts. Please resolve them first."
        )

    db.status.status = "PUBLISHED"
    db.status.published_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    db.recent_activities.insert(0, {
        "time": "Just now",
        "message": "Official college timetable published to Faculty and Students portal"
    })
    db.persist_to_sql()
    return {
        "success": True,
        "message": "Timetable published successfully!",
        "published_at": db.status.published_at,
        "status": db.status
    }

# ----------------- KILLER DEMO SCENARIOS -----------------
@app.post("/api/scenarios/load")
def load_scenario(scenario: str):
    """
    Implements the 3 Killer Demo Scenarios:
    1. 'normal': Standard healthy setup (all 3 divisions generate perfectly with 0 conflicts)
    2. 'conflict': Dr. Ravi has unavailability / overlapping schedule
    3. 'impossible': CSE-A has 100 students, Lab has 40 capacity -> triggers impossible constraint explainer
    """
    db.reset_to_defaults()

    if scenario == "normal":
        # Run generator immediately for standard demo
        solver = TimetableSolver(db.divisions, db.subjects, db.faculty, db.classrooms, db.constraints)
        success, entries, conflicts, stats = solver.solve()
        if success:
            db.timetable_entries = entries
            db.conflicts = []
            db.status.status = "GENERATED"
            db.status.generated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            db.status.total_classes = len(entries)
            db.status.assigned_classes = len(entries)
            db.status.unassigned_classes = 0
            db.status.critical_conflicts = 0
            db.status.soft_score = 95
            db.status.quality_label = "Optimal"
        return {
            "success": True,
            "scenario": "Scenario 1: Successful Generation (Balanced & Feasible)",
            "description": "3 divisions, 10 subjects, 6 faculty, 7 classrooms -> 0 hard conflicts, 95% satisfaction"
        }

    elif scenario == "conflict":
        # First generate a baseline schedule
        solver = TimetableSolver(db.divisions, db.subjects, db.faculty, db.classrooms, db.constraints)
        success, entries, _, _ = solver.solve()
        if entries:
            # Artificially create a realistic conflict:
            # Dr. Ravi is teaching DBMS to CSE-A on Monday Period 2 (10:00 - 11:00) in A-101.
            # Add an overlapping class where Dr. Ravi is also forced to teach AI to CSE-B on Monday Period 2!
            db.timetable_entries = entries
            conflict_entry = TimetableEntry(
                id=f"TT_CONFLICT_OVERLAP_{uuid.uuid4().hex[:4]}",
                division_id="DIV_CSE_B",
                subject_id="SUB_CS503",
                faculty_id="FAC_RAVI",
                classroom_id="ROOM_A102",
                day="Monday",
                period_number=2,
                is_locked=False,
                has_conflict=True,
                conflict_notes="Dr. Ravi Kumar is already teaching DBMS to CSE-A at Monday 10:00 - 11:00."
            )
            db.timetable_entries.insert(0, conflict_entry)

            db.conflicts = [
                ConflictItem(
                    id="CONF_RAVI_OVERLAP",
                    severity="critical",
                    type="faculty_conflict",
                    title="Faculty Double-Booking: Dr. Ravi Kumar",
                    description=(
                        "Dr. Ravi Kumar is simultaneously assigned to teach DBMS (CSE-A in A-101) "
                        "and AI (CSE-B in A-102) on Monday 10:00 - 11:00 AM."
                    ),
                    affected_division="CSE-B",
                    affected_subject="Artificial Intelligence",
                    affected_faculty="Dr. Ravi Kumar",
                    affected_room="A-102",
                    day="Monday",
                    period_number=2,
                    time_label="10:00 - 11:00",
                    suggested_actions=[
                        {
                            "label": "Move AI (CSE-B) to Tuesday 09:00 AM",
                            "action": "move_slot",
                            "target_day": "Tuesday",
                            "target_period": 1
                        },
                        {
                            "label": "Move AI (CSE-B) to Wednesday 11:15 AM",
                            "action": "move_slot",
                            "target_day": "Wednesday",
                            "target_period": 3
                        }
                    ]
                )
            ]
            db.status.status = "DRAFT"
            db.status.critical_conflicts = 1
            db.status.unassigned_classes = 0
            db.status.soft_score = 78
            db.status.quality_label = "Needs Resolution"

        return {
            "success": True,
            "scenario": "Scenario 2: Faculty Overlap Conflict",
            "description": "Dr. Ravi has overlapping assignments on Monday 10:00 AM between CSE-A & CSE-B."
        }

    elif scenario == "impossible":
        # Make CSE-A have 100 students, and cap largest computer lab at 40
        db.divisions["DIV_CSE_A"].students = 100
        for r in db.classrooms.values():
            if r.type == "Computer Lab":
                r.capacity = 40

        db.timetable_entries = []
        db.conflicts = [
            ConflictItem(
                id="CONF_IMPOSSIBLE_CAPACITY",
                severity="impossible",
                type="impossible_constraint",
                title="Feasibility Bottleneck: Insufficient Lab Capacity",
                description=(
                    "CSE-A has 100 students. Computer Lab requirement for DBMS Lab (CS502L): 100 seats. "
                    "Largest available lab (Lab-01) only has 40 seats. Therefore this requirement cannot be met."
                ),
                affected_division="CSE-A",
                affected_subject="DBMS & SQL Laboratory",
                affected_room="Computer Lab",
                suggested_actions=[
                    {"label": "Increase Lab-01 capacity to 100 seats", "action": "fix_capacity"},
                    {"label": "Split CSE-A into two 50-student lab batches (Batch 1 & Batch 2)", "action": "split_division"},
                    {"label": "Commission a new High-Capacity Central Computing Lab", "action": "add_room"},
                    {"label": "Change subject room requirement to general Classroom", "action": "edit_subject"}
                ]
            )
        ]
        db.status.status = "DRAFT"
        db.status.critical_conflicts = 1
        db.status.soft_score = 0
        db.status.quality_label = "Mathematically Infeasible"

        return {
            "success": True,
            "scenario": "Scenario 3: Impossible Constraint (Lab Capacity Bottleneck)",
            "description": "CSE-A has 100 students, but largest lab has only 40 seats. Generates detailed impossible constraint report."
        }

    return {"success": False, "message": "Unknown scenario"}

@app.post("/api/reset")
def reset_all():
    db.reset_to_defaults()
    return {"success": True, "message": "Database reset to defaults"}
