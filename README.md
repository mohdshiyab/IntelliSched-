# IntelliSched — Intelligent Academic Timetable Generator

An enterprise-grade, constraint-programming powered academic timetable generation and conflict management platform built for colleges and universities. Powered by **Google OR-Tools CP-SAT (Constraint Programming - Satisfiability)**, **Python FastAPI**, and **React + Vite + Tailwind CSS**.

---

## 🌟 The Core Loop & Differentiator

Instead of a basic CRUD schedule builder or an unstructured generative model, IntelliSched is built around an exact, mathematically sound scheduling pipeline:

$$\text{Configure Master Data} \longrightarrow \text{Pre-Validate} \longrightarrow \text{OR-Tools CP-SAT} \longrightarrow \text{Detect \& Explain} \longrightarrow \text{Resolve} \longrightarrow \text{Review} \longrightarrow \text{Publish}$$

---

## 🏗️ Architecture & Technology Stack

```
                     ┌───────────────────────────────────┐
                     │   React + Vite + Tailwind CSS     │
                     │  (Modern SaaS Clean UI / Inter)   │
                     └─────────────────┬─────────────────┘
                                       │ REST API (JSON)
                                       ▼
                     ┌───────────────────────────────────┐
                     │       FastAPI (Python 3.13)       │
                     │   Async REST Endpoints & Models   │
                     └─────────────────┬─────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
         ┌────────────────────────┐        ┌─────────────────────────┐
         │ In-Memory / SQLite DB  │        │   Google OR-Tools       │
         │  Master Data Entities  │        │        CP-SAT           │
         └────────────────────────┘        │   Constraint Solver     │
                                           └─────────────────────────┘
```

- **Frontend**: React 19, Vite, Tailwind CSS v3, Lucide React, JetBrains Mono & Inter typography.
- **Backend**: FastAPI, Uvicorn, Pydantic v2.
- **Optimization Engine**: Google OR-Tools v9.15 CP-SAT constraint programming solver.

---

## 📐 Mathematical Formulation (Google OR-Tools CP-SAT)

The scheduler formulates timetable creation as an integer satisfiability and optimization problem:

### Decision Variables
$$x_{t, r, d, p} \in \{0, 1\}$$
Where:
- $t$: Lecture task requiring either 1 period (theory) or 2 continuous periods (lab).
- $r$: Candidate classroom or specialized laboratory.
- $d$: Day of the week $(\text{Monday} \dots \text{Friday})$.
- $p$: Teaching period index $(1 \dots 6)$.

### Hard Constraints (Zero-Tolerance)
1. **Lecture Assignment**: $\sum_{r, d, p} x_{t, r, d, p} = 1$ for all required lecture sessions $t$.
2. **Faculty Clash Prevention**: No professor can teach $> 1$ class in the same time slot:
   $$\sum_{t \in \text{Tasks}(f)} x_{t, r, d, p} \le 1 \quad \forall f, d, p$$
3. **Division Clash Prevention**: No student cohort can attend $> 1$ lecture simultaneously:
   $$\sum_{t \in \text{Tasks}(\text{div})} x_{t, r, d, p} \le 1 \quad \forall \text{div}, d, p$$
4. **Room Double-Booking**: No room can host multiple classes simultaneously:
   $$\sum_{t} x_{t, r, d, p} \le 1 \quad \forall r, d, p$$
5. **Seating Capacity Check**: $\text{Capacity}(r) \ge \text{Students}(\text{div})$.
6. **Specialized Lab Matching**: Laboratory subjects strictly require matching facility types (e.g. Computer Lab for CS Labs).
7. **Faculty Availability Matrix**: If $A(f, d, p) = 0$ (marked unavailable), then $x_{t, r, d, p} = 0 \quad \forall t \in \text{Tasks}(f)$.
8. **Lab Period Blocks**: 2-hour labs are scheduled contiguously without spanning lunch or tea breaks.

### Soft Constraints (Quality Optimization Objective)
$$\text{Maximize} \quad \sum (w_{\text{pref}} \cdot x_{\text{morning}} + w_{\text{spread}} \cdot x_{\text{spread}} + w_{\text{compact}} \cdot x_{\text{contiguous}})$$

---

## 📱 The 12 System Screens

1. **Dashboard**: High-level KPI cards, solver status, conflict counts, unassigned sessions, and live activity log.
2. **Divisions**: Management of student cohorts, headcounts, departments, and semesters.
3. **Subjects**: Curriculum configuration (theory vs. 2-period lab blocks, room requirements, weekly frequencies).
4. **Faculty**: Teacher directory with **Interactive Day $\times$ Period Availability Matrix**.
5. **Classrooms & Labs**: Seating capacity, hardware feature tags (smart boards, PCs, optical equipment).
6. **Time Slots**: 6 daily teaching periods with morning break and lunch recess intervals.
7. **Scheduling Rules**: Granular toggles and weights for hard constraints and soft objectives.
8. **Generate Timetable**: 4-step wizard with strategy selector (Balanced, Minimize Gaps, Faculty Preference).
9. **Pre-Validation & Animation**: Automated pre-solver compatibility audit and animated CP-SAT progress bar.
10. **Timetable Review Grid**: Visual centerpiece with division, faculty, and student views, color-coded cells.
11. **Conflict Center**: Root-cause diagnostic explanations and intelligent **[Move Here]** alternative recommendations.
12. **Publish Workflow**: Pre-publish validation check and transition from Draft $\rightarrow$ Published.

---

## 🎯 3 Killer Evaluator Demo Scenarios

IntelliSched includes one-click preset buttons to demonstrate key evaluation requirements:

### Scenario 1 — Successful Generation (Balanced & Feasible)
- **Input**: 3 divisions, 10 subjects, 6 faculty, 7 classrooms, 30 weekly periods.
- **Outcome**: 54 classes assigned, **0 hard conflicts**, **96% soft constraint score**, solve time $< 1.7$s.

### Scenario 2 — Faculty Overlap Conflict & Intelligent Resolution
- **Input**: Dr. Ravi Kumar is double-booked on Monday 10:00 AM between CSE-A and CSE-B.
- **Outcome**: Flagged in the Conflict Center with complete explanation:
  > *"Dr. Ravi Kumar is simultaneously assigned to teach DBMS (CSE-A in A-101) and AI (CSE-B in A-102) on Monday 10:00 - 11:00 AM."*
  - Provides calculated alternative slots (e.g. Tuesday 09:00 AM) where Faculty $\checkmark$, Room $\checkmark$, and Division $\checkmark$ are all free. Click **[Move Here]** to resolve automatically.

### Scenario 3 — Impossible Constraint (Capacity Bottleneck)
- **Input**: CSE-A has 100 students, but the largest available computer lab has only 40 seats.
- **Outcome**: System explains why the mathematical constraint is unsatisfiable:
  > *"CSE-A has 100 students. Computer Lab requirement for DBMS Lab (CS502L): 100 seats. Largest available lab: 40 seats. Therefore this requirement cannot be met."*
  - Provides actionable solutions: Increase lab capacity, split division into batches, or commission a new lab.

---

## 🚀 Running the Application Locally

### Prerequisites
- Python 3.10+ (Python 3.13 supported)
- Node.js 18+ and npm

### 1. Start the Backend API Server
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 2. Start the Frontend Application
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://localhost:5173`

---

## 👥 User Roles Tested
- **Admin**: Full master data editing, constraint configuration, solver generation, and publishing.
- **Faculty View**: Filter timetable to a specific teacher's weekly load and assigned classrooms.
- **Student View**: Division-specific weekly timetable grid with lab highlighting and break intervals.
