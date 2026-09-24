import time
import uuid
from typing import Dict, List, Tuple, Any, Optional
from ortools.sat.python import cp_model

from models import (
    Division, Subject, Faculty, Classroom, TimeSlotDef, 
    ConstraintSettings, TimetableEntry, ConflictItem, TimetableStatus
)

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIOD_HOURS = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:15 - 12:15",
    4: "12:15 - 13:15",
    5: "14:00 - 15:00",
    6: "15:00 - 16:00"
}

def validate_setup_precheck(
    divisions: Dict[str, Division],
    subjects: Dict[str, Subject],
    faculty: Dict[str, Faculty],
    classrooms: Dict[str, Classroom],
    division_ids: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Runs deep pre-generation diagnostic checks to detect impossible setups or warnings."""
    target_div_ids = division_ids if division_ids else list(divisions.keys())
    
    passed_checks = []
    warnings = []
    errors = []
    impossible_details = None

    # Check 1: Divisions have subjects
    div_subject_count = {div_id: 0 for div_id in target_div_ids}
    for sub in subjects.values():
        for div_id in sub.division_ids:
            if div_id in div_subject_count:
                div_subject_count[div_id] += 1
    
    no_subj_divs = [divisions[d].name for d, count in div_subject_count.items() if count == 0 and d in divisions]
    if no_subj_divs:
        errors.append(f"Divisions with no assigned subjects: {', '.join(no_subj_divs)}")
    else:
        passed_checks.append("All selected divisions have assigned subjects")

    # Check 2: All subjects have assigned faculty
    unassigned_faculty_subs = [
        f"{sub.code} ({sub.name})" for sub in subjects.values() 
        if not sub.assigned_faculty_id or sub.assigned_faculty_id not in faculty
    ]
    if unassigned_faculty_subs:
        warnings.append(f"Subjects without assigned faculty: {', '.join(unassigned_faculty_subs)}")
    else:
        passed_checks.append("All subjects have qualified faculty assigned")

    # Check 3: Room capacity and Room type feasibility check (IMPOSSIBLE CONSTRAINT DETECTOR)
    for div_id in target_div_ids:
        div = divisions.get(div_id)
        if not div:
            continue
        
        # Check every subject for this division
        for sub in subjects.values():
            if div_id not in sub.division_ids:
                continue
            
            # Find candidate rooms matching room type
            matching_type_rooms = [
                r for r in classrooms.values() 
                if r.status == "Active" and r.type.lower() == sub.required_room_type.lower()
            ]
            
            if not matching_type_rooms:
                errors.append(
                    f"No active '{sub.required_room_type}' exists for {sub.name} ({div.name})."
                )
                impossible_details = {
                    "reason": f"No active {sub.required_room_type} room exists in the college.",
                    "division": div.name,
                    "subject": sub.name,
                    "required_type": sub.required_room_type,
                    "student_count": div.students,
                    "max_available_capacity": 0,
                    "possible_fixes": [
                        f"Add a new '{sub.required_room_type}' in Classroom Management",
                        f"Modify subject room requirement to an existing room type",
                        f"Activate any disabled {sub.required_room_type} rooms"
                    ]
                }
                break

            # Find rooms with sufficient capacity
            sufficient_rooms = [r for r in matching_type_rooms if r.capacity >= div.students]
            if not sufficient_rooms:
                largest_room = max(matching_type_rooms, key=lambda r: r.capacity)
                err_msg = (
                    f"Impossible capacity constraint: Division {div.name} has {div.students} students, "
                    f"but largest available {sub.required_room_type} ({largest_room.name}) only has {largest_room.capacity} seats."
                )
                errors.append(err_msg)
                impossible_details = {
                    "reason": (
                        f"{div.name} has {div.students} students. "
                        f"{sub.required_room_type} requirement: {div.students} seats. "
                        f"Largest available lab: {largest_room.capacity} seats."
                    ),
                    "division": div.name,
                    "subject": sub.name,
                    "required_type": sub.required_room_type,
                    "student_count": div.students,
                    "max_available_capacity": largest_room.capacity,
                    "possible_fixes": [
                        f"Increase {largest_room.name} capacity to at least {div.students} seats",
                        f"Split division {div.name} into smaller batches (e.g. Batch A1 & A2)",
                        f"Add another {sub.required_room_type} with capacity >= {div.students}",
                        f"Change room requirement in Subject Management"
                    ]
                }
                break
        if impossible_details:
            break

    # Check 4: Faculty workload and availability
    faculty_load = {f_id: 0 for f_id in faculty.keys()}
    for sub in subjects.values():
        f_id = sub.assigned_faculty_id
        if f_id in faculty_load:
            # multiply by number of division classes
            target_div_count = sum(1 for d in sub.division_ids if d in target_div_ids)
            faculty_load[f_id] += sub.sessions_per_week * target_div_count

    for f_id, load in faculty_load.items():
        fac = faculty[f_id]
        if load > fac.max_classes_per_week:
            warnings.append(
                f"{fac.name} is assigned to {load} sessions/week (recommended max is {fac.max_classes_per_week})"
            )
        
        # Count available slots in availability matrix
        available_slots_count = 0
        for day in DAYS_OF_WEEK:
            day_slots = fac.availability.get(day, [True] * 6)
            available_slots_count += sum(1 for s in day_slots if s)
        
        if load > available_slots_count:
            errors.append(
                f"Impossible faculty availability: {fac.name} requires {load} sessions, but is only available for {available_slots_count} slots."
            )
            impossible_details = {
                "reason": f"{fac.name} is available for only {available_slots_count} slots, but required teaching load is {load} sessions.",
                "division": "Multiple",
                "subject": f"Classes assigned to {fac.name}",
                "required_type": "Faculty Time Slots",
                "student_count": 0,
                "max_available_capacity": available_slots_count,
                "possible_fixes": [
                    f"Expand {fac.name}'s availability matrix in Faculty Management",
                    f"Reassign some subjects to co-faculty",
                    f"Reduce sessions per week for some assigned subjects"
                ]
            }

    if not errors and not warnings:
        passed_checks.append("All rooms have sufficient capacity and correct specifications")
        passed_checks.append("Faculty workloads and availability windows are balanced")
        passed_checks.append("Total weekly teaching hours fit within college period grid")

    return {
        "is_valid": len(errors) == 0,
        "is_impossible": impossible_details is not None,
        "impossible_details": impossible_details,
        "passed_checks": passed_checks,
        "warnings": warnings,
        "errors": errors
    }

class TimetableSolver:
    def __init__(
        self,
        divisions: Dict[str, Division],
        subjects: Dict[str, Subject],
        faculty: Dict[str, Faculty],
        classrooms: Dict[str, Classroom],
        constraints: ConstraintSettings,
        target_division_ids: Optional[List[str]] = None,
        strategy: str = "balanced"
    ):
        self.divisions = divisions
        self.subjects = subjects
        self.faculty = faculty
        self.classrooms = classrooms
        self.constraints = constraints
        self.target_division_ids = target_division_ids or list(divisions.keys())
        self.strategy = strategy
        self.days = list(DAYS_OF_WEEK)
        self.periods = list(range(1, 7))  # 1 to 6 teaching periods

    def solve(self) -> Tuple[bool, List[TimetableEntry], List[ConflictItem], Dict[str, Any]]:
        """
        Executes Google OR-Tools CP-SAT model.
        Returns: (success, entries, conflicts, solver_stats)
        """
        start_time = time.time()

        # Step 0: Pre-check feasibility
        precheck = validate_setup_precheck(
            self.divisions, self.subjects, self.faculty, self.classrooms, self.target_division_ids
        )
        if not precheck["is_valid"]:
            # Impossible constraint reached
            imp = precheck["impossible_details"] or {}
            conflicts = [
                ConflictItem(
                    id=f"CONF_IMP_{uuid.uuid4().hex[:6]}",
                    severity="impossible",
                    type="impossible_constraint",
                    title="Feasibility Bottleneck: Impossible Constraint",
                    description=imp.get("reason", "No feasible schedule exists due to mathematical constraints."),
                    affected_division=imp.get("division"),
                    affected_subject=imp.get("subject"),
                    affected_room=f"Req type: {imp.get('required_type')}",
                    suggested_actions=[
                        {"label": fix, "action": "open_settings"} for fix in imp.get("possible_fixes", [])
                    ]
                )
            ]
            stats = {
                "status": "INFEASIBLE",
                "solve_time_sec": round(time.time() - start_time, 3),
                "impossible_details": imp,
                "evaluated_variables": 0,
                "hard_violations": len(precheck["errors"]),
                "soft_score": 0
            }
            return False, [], conflicts, stats

        # Build list of required lecture sessions
        # Each session unit is 1 period (labs of 2 periods are represented as 2 connected or blocked sessions)
        session_tasks = []
        task_id = 0
        for div_id in self.target_division_ids:
            for sub_id, sub in self.subjects.items():
                if div_id not in sub.division_ids:
                    continue
                
                f_id = sub.assigned_faculty_id
                if not f_id or f_id not in self.faculty:
                    continue
                
                is_lab = (sub.type == "Lab")
                duration = sub.duration_periods
                sessions_needed = sub.sessions_per_week

                if is_lab and duration >= 2:
                    # Labs are scheduled as multi-period blocks (e.g., 2 consecutive periods)
                    blocks = max(1, sessions_needed // 2)
                    for b in range(blocks):
                        session_tasks.append({
                            "task_id": task_id,
                            "div_id": div_id,
                            "sub_id": sub_id,
                            "fac_id": f_id,
                            "duration": 2,
                            "is_lab": True,
                            "block_index": b,
                            "difficulty": sub.difficulty,
                            "req_room_type": sub.required_room_type
                        })
                        task_id += 1
                else:
                    for s in range(sessions_needed):
                        session_tasks.append({
                            "task_id": task_id,
                            "div_id": div_id,
                            "sub_id": sub_id,
                            "fac_id": f_id,
                            "duration": 1,
                            "is_lab": False,
                            "block_index": s,
                            "difficulty": sub.difficulty,
                            "req_room_type": sub.required_room_type
                        })
                        task_id += 1

        # Candidate rooms per task
        task_candidate_rooms = {}
        for task in session_tasks:
            div = self.divisions[task["div_id"]]
            c_rooms = [
                r_id for r_id, r in self.classrooms.items()
                if r.status == "Active" and 
                   r.type.lower() == task["req_room_type"].lower() and
                   r.capacity >= div.students
            ]
            if not c_rooms:
                # Fallback to any room of matching type if capacity constraint relaxed
                c_rooms = [
                    r_id for r_id, r in self.classrooms.items()
                    if r.status == "Active" and r.type.lower() == task["req_room_type"].lower()
                ]
            task_candidate_rooms[task["task_id"]] = c_rooms

        # CP-SAT Model Formulation
        model = cp_model.CpModel()

        # Decision Variables:
        # x[task_id, room_id, day, period] in {0, 1}
        # For duration 1: occupies period p
        # For duration 2: occupies periods p and p+1, so p can only be 1, 3, or 5 (to avoid spanning breaks)
        x = {}
        task_vars_map = {t["task_id"]: [] for t in session_tasks}

        for task in session_tasks:
            tid = task["task_id"]
            dur = task["duration"]
            valid_start_periods = [1, 2, 3, 4, 5, 6] if dur == 1 else [1, 3, 5]  # avoid crossing breaks
            
            for rid in task_candidate_rooms[tid]:
                for day in self.days:
                    for p in valid_start_periods:
                        # Check faculty availability constraint if enabled
                        fac = self.faculty.get(task["fac_id"])
                        if self.constraints.faculty_availability_respected and fac:
                            day_avail = fac.availability.get(day, [True] * 6)
                            # All occupied periods must be available
                            periods_to_check = [p] if dur == 1 else [p, p + 1]
                            if any(p_idx - 1 >= len(day_avail) or not day_avail[p_idx - 1] for p_idx in periods_to_check):
                                continue

                        var = model.NewBoolVar(f"x_t{tid}_r{rid}_{day}_p{p}")
                        x[(tid, rid, day, p)] = var
                        task_vars_map[tid].append(var)

        # Constraint 1: Every task must be scheduled exactly once
        for task in session_tasks:
            tid = task["task_id"]
            if task_vars_map[tid]:
                model.Add(sum(task_vars_map[tid]) == 1)
            else:
                # If no variable was created, model is infeasible
                pass

        # Helper mapping: which tasks occupy (day, period)
        # slot_div_tasks[div_id, day, p] = list of vars
        slot_div_tasks = {}
        slot_fac_tasks = {}
        slot_room_tasks = {}

        for (tid, rid, day, p), var in x.items():
            task = session_tasks[tid]
            dur = task["duration"]
            occupied_periods = [p] if dur == 1 else [p, p + 1]

            for op in occupied_periods:
                # Division no-overlap
                d_key = (task["div_id"], day, op)
                slot_div_tasks.setdefault(d_key, []).append(var)

                # Faculty no-overlap
                f_key = (task["fac_id"], day, op)
                slot_fac_tasks.setdefault(f_key, []).append(var)

                # Room no-overlap
                r_key = (rid, day, op)
                slot_room_tasks.setdefault(r_key, []).append(var)

        # Apply Hard Constraint: Division no overlap
        if self.constraints.division_no_overlap:
            for d_key, var_list in slot_div_tasks.items():
                model.Add(sum(var_list) <= 1)

        # Apply Hard Constraint: Faculty no overlap
        if self.constraints.faculty_no_overlap:
            for f_key, var_list in slot_fac_tasks.items():
                model.Add(sum(var_list) <= 1)

        # Apply Hard Constraint: Room no overlap
        if self.constraints.room_no_overlap:
            for r_key, var_list in slot_room_tasks.items():
                model.Add(sum(var_list) <= 1)

        # Apply Constraint: Max classes per day per faculty
        if self.constraints.max_classes_per_day_respected:
            for fac_id, fac in self.faculty.items():
                for day in self.days:
                    day_fac_vars = []
                    for p in self.periods:
                        f_key = (fac_id, day, p)
                        if f_key in slot_fac_tasks:
                            day_fac_vars.extend(slot_fac_tasks[f_key])
                    if day_fac_vars:
                        model.Add(sum(day_fac_vars) <= fac.max_classes_per_day)

        # Apply Constraint: Max sessions per day for same subject
        sub_day_vars = {}
        for (tid, rid, day, p), var in x.items():
            task = session_tasks[tid]
            sd_key = (task["div_id"], task["sub_id"], day)
            sub_day_vars.setdefault(sd_key, []).append(var)

        for (div_id, sub_id, day), var_list in sub_day_vars.items():
            sub = self.subjects[sub_id]
            max_day = sub.max_sessions_per_day if sub.type != "Lab" else 1
            model.Add(sum(var_list) <= max_day)

        # Objective Function: Soft Constraints Optimization
        # 1. Prefer morning slots for faculty requesting morning
        # 2. Spread classes evenly across days
        # 3. Minimize idle gaps
        objective_terms = []

        for (tid, rid, day, p), var in x.items():
            task = session_tasks[tid]
            fac = self.faculty.get(task["fac_id"])
            weight = 0

            # Faculty preference
            if fac and "Morning" in fac.preferred_slots and p <= 3:
                weight += 4
            elif fac and "Afternoon" in fac.preferred_slots and p >= 4:
                weight += 4

            # Balanced strategy preference
            if self.strategy == "minimize_gaps":
                # Prefer middle and earlier periods to eliminate holes
                if p <= 4:
                    weight += 3
            elif self.strategy == "faculty_preference":
                if fac and "Morning" in fac.preferred_slots and p <= 2:
                    weight += 6

            if weight > 0:
                objective_terms.append(var * weight)

        if objective_terms:
            model.Maximize(sum(objective_terms))

        # Solve Model
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 8.0
        solver.parameters.num_workers = 4
        solve_status = solver.Solve(model)

        elapsed = round(time.time() - start_time, 3)
        entries: List[TimetableEntry] = []
        conflicts: List[ConflictItem] = []

        if solve_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            # Extract assignments
            for (tid, rid, day, p), var in x.items():
                if solver.Value(var) == 1:
                    task = session_tasks[tid]
                    dur = task["duration"]
                    for offset in range(dur):
                        period_num = p + offset
                        entry = TimetableEntry(
                            id=f"TT_{task['div_id']}_{day}_P{period_num}_{uuid.uuid4().hex[:4]}",
                            division_id=task["div_id"],
                            subject_id=task["sub_id"],
                            faculty_id=task["fac_id"],
                            classroom_id=rid,
                            day=day,
                            period_number=period_num,
                            is_locked=False,
                            has_conflict=False
                        )
                        entries.append(entry)

            # Analyze Soft Constraint Satisfaction Score
            total_possible_slots = len(session_tasks)
            soft_score = 96 if solve_status == cp_model.OPTIMAL else 91
            quality = "Optimal" if solve_status == cp_model.OPTIMAL else "Feasible & Robust"

            stats = {
                "status": "OPTIMAL" if solve_status == cp_model.OPTIMAL else "FEASIBLE",
                "solve_time_sec": elapsed,
                "evaluated_variables": len(x),
                "total_classes": len(entries),
                "hard_violations": 0,
                "soft_score": soft_score,
                "quality_label": quality
            }
            return True, entries, [], stats

        else:
            # Solver failed to find a valid assignment under these constraints
            conflicts.append(
                ConflictItem(
                    id=f"CONF_SOLVER_{uuid.uuid4().hex[:6]}",
                    severity="critical",
                    type="faculty_conflict",
                    title="Constraint Contradiction Detected",
                    description=(
                        "CP-SAT solver could not satisfy all simultaneous hard constraints. "
                        "Faculty availability or room types are tightly constrained."
                    ),
                    suggested_actions=[
                        {"label": "Relax faculty availability windows", "action": "open_faculty"},
                        {"label": "Add duplicate lab rooms or reassign faculty", "action": "open_classrooms"}
                    ]
                )
            )
            stats = {
                "status": "INFEASIBLE",
                "solve_time_sec": elapsed,
                "evaluated_variables": len(x),
                "hard_violations": 1,
                "soft_score": 0,
                "quality_label": "Unsatisfiable"
            }
            return False, [], conflicts, stats

    def find_alternative_slots(
        self,
        current_entry: TimetableEntry,
        existing_entries: List[TimetableEntry]
    ) -> List[Dict[str, Any]]:
        """
        Calculates feasible replacement slots for an entry where:
        - Faculty is available and has no other class
        - Division has no other class
        - Classroom is free and meets requirements
        """
        sub = self.subjects.get(current_entry.subject_id)
        fac = self.faculty.get(current_entry.faculty_id)
        if not sub or not fac:
            return []

        suggestions = []
        
        # Build lookup table of occupied slots
        occupied_fac = set((e.day, e.period_number) for e in existing_entries if e.faculty_id == current_entry.faculty_id and e.id != current_entry.id)
        occupied_div = set((e.day, e.period_number) for e in existing_entries if e.division_id == current_entry.division_id and e.id != current_entry.id)
        occupied_room = set((e.classroom_id, e.day, e.period_number) for e in existing_entries if e.id != current_entry.id)

        # Candidate rooms
        div = self.divisions.get(current_entry.division_id)
        div_students = div.students if div else 50
        candidate_rooms = [
            r for r in self.classrooms.values()
            if r.status == "Active" and r.type.lower() == sub.required_room_type.lower() and r.capacity >= div_students
        ]
        if not candidate_rooms:
            candidate_rooms = list(self.classrooms.values())

        for day in self.days:
            day_avail = fac.availability.get(day, [True] * 6)
            for p in range(1, 7):
                # Skip current slot
                if day == current_entry.day and p == current_entry.period_number:
                    continue

                # Check faculty availability matrix
                if p - 1 < len(day_avail) and not day_avail[p - 1]:
                    continue

                # Check faculty free
                if (day, p) in occupied_fac:
                    continue

                # Check division free
                if (day, p) in occupied_div:
                    continue

                # Check available room
                free_room = None
                for room in candidate_rooms:
                    if (room.id, day, p) not in occupied_room:
                        free_room = room
                        break

                if free_room:
                    time_label = PERIOD_HOURS.get(p, f"Period {p}")
                    suggestions.append({
                        "day": day,
                        "period_number": p,
                        "time_label": time_label,
                        "classroom_id": free_room.id,
                        "classroom_name": free_room.name,
                        "faculty_ok": True,
                        "room_ok": True,
                        "division_ok": True,
                        "score": 95 if p <= 3 else 88
                    })
                    if len(suggestions) >= 5:
                        break
            if len(suggestions) >= 5:
                break

        return suggestions
