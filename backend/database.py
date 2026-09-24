import os
import json
import copy
from typing import Dict, List, Optional
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text
from sqlalchemy.orm import declarative_base, sessionmaker

from models import (
    Division, Subject, Faculty, Classroom, TimeSlotDef, 
    ConstraintSettings, TimetableEntry, ConflictItem, TimetableStatus
)

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./timetable.db")

# Setup SQLAlchemy Engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy ORM Table for Persistent Storage
class AppEntity(Base):
    __tablename__ = "app_entities"
    key = Column(String(100), primary_key=True, index=True)
    entity_type = Column(String(50), index=True)
    payload = Column(Text, nullable=False)

Base.metadata.create_all(bind=engine)

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

PERIOD_HOURS = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:15 - 12:15",
    4: "12:15 - 13:15",
    5: "14:00 - 15:00",
    6: "15:00 - 16:00"
}

DEFAULT_TIME_SLOTS = [
    TimeSlotDef(id="P1", period_number=1, name="Period 1", start_time="09:00", end_time="10:00", is_break=False),
    TimeSlotDef(id="P2", period_number=2, name="Period 2", start_time="10:00", end_time="11:00", is_break=False),
    TimeSlotDef(id="B1", period_number=0, name="Morning Break", start_time="11:00", end_time="11:15", is_break=True),
    TimeSlotDef(id="P3", period_number=3, name="Period 3", start_time="11:15", end_time="12:15", is_break=False),
    TimeSlotDef(id="P4", period_number=4, name="Period 4", start_time="12:15", end_time="13:15", is_break=False),
    TimeSlotDef(id="L1", period_number=0, name="Lunch Break", start_time="13:15", end_time="14:00", is_break=True),
    TimeSlotDef(id="P5", period_number=5, name="Period 5", start_time="14:00", end_time="15:00", is_break=False),
    TimeSlotDef(id="P6", period_number=6, name="Period 6", start_time="15:00", end_time="16:00", is_break=False),
]

TEACHING_PERIOD_COUNT = 6

def generate_default_availability(unavailable_slots: Optional[List[tuple]] = None) -> Dict[str, List[bool]]:
    avail = {day: [True] * TEACHING_PERIOD_COUNT for day in DAYS_OF_WEEK}
    if unavailable_slots:
        for day, p_num in unavailable_slots:
            if day in avail and 1 <= p_num <= TEACHING_PERIOD_COUNT:
                avail[day][p_num - 1] = False
    return avail

class Database:
    def __init__(self):
        self.divisions: Dict[str, Division] = {}
        self.faculty: Dict[str, Faculty] = {}
        self.classrooms: Dict[str, Classroom] = {}
        self.subjects: Dict[str, Subject] = {}
        self.constraints = ConstraintSettings()
        self.time_slots = copy.deepcopy(DEFAULT_TIME_SLOTS)
        self.days = list(DAYS_OF_WEEK)
        self.timetable_entries: List[TimetableEntry] = []
        self.conflicts: List[ConflictItem] = []
        self.status = TimetableStatus()
        self.recent_activities = []

        # Load from SQL database or seed
        if not self.load_from_sql():
            self.reset_to_defaults()

    def persist_to_sql(self):
        """Saves current state into SQLite/Postgres database."""
        session = SessionLocal()
        try:
            session.query(AppEntity).delete()

            data_map = {
                "divisions": {k: v.dict() for k, v in self.divisions.items()},
                "faculty": {k: v.dict() for k, v in self.faculty.items()},
                "classrooms": {k: v.dict() for k, v in self.classrooms.items()},
                "subjects": {k: v.dict() for k, v in self.subjects.items()},
                "constraints": self.constraints.dict(),
                "entries": [e.dict() for e in self.timetable_entries],
                "conflicts": [c.dict() for c in self.conflicts],
                "status": self.status.dict(),
                "recent_activities": self.recent_activities
            }

            for key, val in data_map.items():
                record = AppEntity(key=key, entity_type=key, payload=json.dumps(val))
                session.add(record)

            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Error persisting to SQL database: {e}")
        finally:
            session.close()

    def load_from_sql(self) -> bool:
        """Loads state from SQLite/Postgres database."""
        session = SessionLocal()
        try:
            records = session.query(AppEntity).all()
            if not records:
                return False

            data = {r.key: json.loads(r.payload) for r in records}

            if "divisions" in data:
                self.divisions = {k: Division(**v) for k, v in data["divisions"].items()}
            if "faculty" in data:
                self.faculty = {k: Faculty(**v) for k, v in data["faculty"].items()}
            if "classrooms" in data:
                self.classrooms = {k: Classroom(**v) for k, v in data["classrooms"].items()}
            if "subjects" in data:
                self.subjects = {k: Subject(**v) for k, v in data["subjects"].items()}
            if "constraints" in data:
                self.constraints = ConstraintSettings(**data["constraints"])
            if "entries" in data:
                self.timetable_entries = [TimetableEntry(**e) for e in data["entries"]]
            if "conflicts" in data:
                self.conflicts = [ConflictItem(**c) for c in data["conflicts"]]
            if "status" in data:
                self.status = TimetableStatus(**data["status"])
            if "recent_activities" in data:
                self.recent_activities = data["recent_activities"]

            return len(self.divisions) > 0
        except Exception as e:
            print(f"Error loading from SQL database: {e}")
            return False
        finally:
            session.close()

    def reset_to_defaults(self):
        """Initializes with rich default college seed data."""
        self.divisions = {
            "DIV_CSE_A": Division(
                id="DIV_CSE_A", name="CSE-A", department="Computer Science", 
                year="3rd Year", semester=5, students=60, academic_year="2026-27"
            ),
            "DIV_CSE_B": Division(
                id="DIV_CSE_B", name="CSE-B", department="Computer Science", 
                year="3rd Year", semester=5, students=58, academic_year="2026-27"
            ),
            "DIV_ISE_A": Division(
                id="DIV_ISE_A", name="ISE-A", department="Information Science", 
                year="3rd Year", semester=5, students=55, academic_year="2026-27"
            ),
        }

        self.faculty = {
            "FAC_RAVI": Faculty(
                id="FAC_RAVI", name="Dr. Ravi Kumar", department="Computer Science",
                title="Professor & HoD", subjects=["CS501", "CS503", "CS502L"],
                max_classes_per_day=4, max_classes_per_week=18,
                availability=generate_default_availability([("Wednesday", 1), ("Wednesday", 2)]),
                preferred_slots=["Morning"], status="Available"
            ),
            "FAC_ANITHA": Faculty(
                id="FAC_ANITHA", name="Prof. Anitha M", department="Computer Science",
                title="Associate Professor", subjects=["CS504", "CS505L"],
                max_classes_per_day=4, max_classes_per_week=16,
                availability=generate_default_availability([("Tuesday", 3)]),
                preferred_slots=["Morning"], status="Available"
            ),
            "FAC_KUMAR": Faculty(
                id="FAC_KUMAR", name="Dr. Kumar Swamy", department="Information Science",
                title="Professor", subjects=["CS506"],
                max_classes_per_day=4, max_classes_per_week=16,
                availability=generate_default_availability([("Thursday", 5), ("Thursday", 6)]),
                preferred_slots=["Morning", "Afternoon"], status="Limited"
            ),
            "FAC_SNEHA": Faculty(
                id="FAC_SNEHA", name="Prof. Sneha Rao", department="Computer Science",
                title="Assistant Professor", subjects=["CS507", "IS502"],
                max_classes_per_day=4, max_classes_per_week=16,
                availability=generate_default_availability(),
                preferred_slots=["Afternoon"], status="Available"
            ),
            "FAC_VIKRAM": Faculty(
                id="FAC_VIKRAM", name="Prof. Vikram Sen", department="Information Science",
                title="Assistant Professor", subjects=["IS501", "IS503L"],
                max_classes_per_day=4, max_classes_per_week=16,
                availability=generate_default_availability([("Monday", 5), ("Monday", 6)]),
                preferred_slots=["Morning"], status="Available"
            ),
            "FAC_MEENAKSHI": Faculty(
                id="FAC_MEENAKSHI", name="Dr. Meenakshi S", department="Basic Science",
                title="Professor", subjects=["CS508"],
                max_classes_per_day=3, max_classes_per_week=12,
                availability=generate_default_availability(),
                preferred_slots=["Morning"], status="Available"
            )
        }

        self.classrooms = {
            "ROOM_A101": Classroom(
                id="ROOM_A101", name="A-101", building="Academic Block A",
                type="Classroom", capacity=70,
                features=["Projector", "AC", "Smart Board"], status="Active"
            ),
            "ROOM_A102": Classroom(
                id="ROOM_A102", name="A-102", building="Academic Block A",
                type="Classroom", capacity=65,
                features=["Projector", "Smart Board"], status="Active"
            ),
            "ROOM_A103": Classroom(
                id="ROOM_A103", name="A-103", building="Academic Block A",
                type="Classroom", capacity=60,
                features=["Projector"], status="Active"
            ),
            "ROOM_B201": Classroom(
                id="ROOM_B201", name="B-201", building="Academic Block B",
                type="Classroom", capacity=65,
                features=["Projector", "AC"], status="Active"
            ),
            "ROOM_LAB01": Classroom(
                id="ROOM_LAB01", name="Lab-01 (CS Lab)", building="Tech Park",
                type="Computer Lab", capacity=65,
                features=["Computers", "Projector", "High-speed LAN"], status="Active"
            ),
            "ROOM_LAB02": Classroom(
                id="ROOM_LAB02", name="Lab-02 (Adv Lab)", building="Tech Park",
                type="Computer Lab", capacity=60,
                features=["Computers", "Projector"], status="Active"
            ),
            "ROOM_LAB_PHY": Classroom(
                id="ROOM_LAB_PHY", name="Physics Lab", building="Science Wing",
                type="Physics Lab", capacity=35,
                features=["Physics Equipment", "Optical Benches"], status="Active"
            ),
        }

        self.subjects = {
            "SUB_CS501": Subject(
                id="SUB_CS501", name="Database Management Systems", code="CS501",
                department="Computer Science", type="Theory", sessions_per_week=4,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=2,
                assigned_faculty_id="FAC_RAVI", division_ids=["DIV_CSE_A", "DIV_CSE_B"],
                difficulty="Hard"
            ),
            "SUB_CS502L": Subject(
                id="SUB_CS502L", name="DBMS & SQL Laboratory", code="CS502L",
                department="Computer Science", type="Lab", sessions_per_week=2,
                duration_periods=2, required_room_type="Computer Lab",
                preferred_consecutive=True, max_sessions_per_day=2,
                assigned_faculty_id="FAC_RAVI", division_ids=["DIV_CSE_A", "DIV_CSE_B"],
                difficulty="Medium"
            ),
            "SUB_CS503": Subject(
                id="SUB_CS503", name="Artificial Intelligence", code="CS503",
                department="Computer Science", type="Theory", sessions_per_week=3,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=1,
                assigned_faculty_id="FAC_RAVI", division_ids=["DIV_CSE_A"],
                difficulty="Hard"
            ),
            "SUB_CS504": Subject(
                id="SUB_CS504", name="Operating Systems", code="CS504",
                department="Computer Science", type="Theory", sessions_per_week=4,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=2,
                assigned_faculty_id="FAC_ANITHA", division_ids=["DIV_CSE_A", "DIV_CSE_B"],
                difficulty="Hard"
            ),
            "SUB_CS505L": Subject(
                id="SUB_CS505L", name="Operating Systems Lab", code="CS505L",
                department="Computer Science", type="Lab", sessions_per_week=2,
                duration_periods=2, required_room_type="Computer Lab",
                preferred_consecutive=True, max_sessions_per_day=2,
                assigned_faculty_id="FAC_ANITHA", division_ids=["DIV_CSE_A", "DIV_CSE_B"],
                difficulty="Medium"
            ),
            "SUB_CS506": Subject(
                id="SUB_CS506", name="Computer Networks", code="CS506",
                department="Computer Science", type="Theory", sessions_per_week=4,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=2,
                assigned_faculty_id="FAC_KUMAR", division_ids=["DIV_CSE_A", "DIV_CSE_B", "DIV_ISE_A"],
                difficulty="Medium"
            ),
            "SUB_CS507": Subject(
                id="SUB_CS507", name="Software Engineering", code="CS507",
                department="Computer Science", type="Theory", sessions_per_week=3,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=1,
                assigned_faculty_id="FAC_SNEHA", division_ids=["DIV_CSE_A", "DIV_CSE_B"],
                difficulty="Easy"
            ),
            "SUB_IS501": Subject(
                id="SUB_IS501", name="Web Technologies & Frameworks", code="IS501",
                department="Information Science", type="Theory", sessions_per_week=4,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=2,
                assigned_faculty_id="FAC_VIKRAM", division_ids=["DIV_ISE_A"],
                difficulty="Medium"
            ),
            "SUB_IS502": Subject(
                id="SUB_IS502", name="Cloud Computing Architecture", code="IS502",
                department="Information Science", type="Theory", sessions_per_week=3,
                duration_periods=1, required_room_type="Classroom",
                preferred_consecutive=False, max_sessions_per_day=1,
                assigned_faculty_id="FAC_SNEHA", division_ids=["DIV_ISE_A"],
                difficulty="Medium"
            ),
            "SUB_IS503L": Subject(
                id="SUB_IS503L", name="Full-Stack Web & Data Lab", code="IS503L",
                department="Information Science", type="Lab", sessions_per_week=2,
                duration_periods=2, required_room_type="Computer Lab",
                preferred_consecutive=True, max_sessions_per_day=2,
                assigned_faculty_id="FAC_VIKRAM", division_ids=["DIV_ISE_A"],
                difficulty="Medium"
            ),
        }

        self.constraints = ConstraintSettings()
        self.time_slots = copy.deepcopy(DEFAULT_TIME_SLOTS)
        self.days = list(DAYS_OF_WEEK)
        self.timetable_entries = []
        self.conflicts = []
        self.status = TimetableStatus(
            status="DRAFT",
            generated_at=None,
            published_at=None,
            total_classes=0,
            assigned_classes=0,
            unassigned_classes=0,
            critical_conflicts=0,
            warnings=0,
            soft_score=96,
            quality_label="Ready to Generate"
        )
        self.recent_activities = [
            {"time": "Just now", "message": "SQL Database connected with Master Data tables"},
            {"time": "10 min ago", "message": "Loaded 3 Divisions, 10 Subjects, 6 Faculty, and 7 Rooms"},
            {"time": "25 min ago", "message": "Updated Faculty Availability Matrix for Dr. Ravi & Dr. Kumar"},
        ]
        self.persist_to_sql()

db = Database()
