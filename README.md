# IntelliSched — Intelligent Timetable Generator

A smart college timetable generator that automatically schedules classes, prevents teacher and classroom clashes, and explains conflicts in simple terms.

Built with **Python (FastAPI)**, **Google OR-Tools**, and **React (Tailwind CSS)**.

---

## 💡 What is IntelliSched?

Making a college schedule by hand is frustrating:
- Teachers get scheduled in two places at once.
- Two classes are put in the same room.
- A lab requiring 60 computers is booked into a room with only 30 computers.
- Some teachers are assigned classes during times they are unavailable.

**IntelliSched solves this automatically in under 2 seconds.** It takes your college data, checks all the rules, runs an intelligent scheduling solver, and gives you a clean, conflict-free weekly timetable.

---

## 🔄 How It Works (Step-by-Step)

```
1. Add Data ➔ 2. Set Rules ➔ 3. Pre-Check ➔ 4. Generate ➔ 5. Resolve Clashes ➔ 6. Review & Publish
```

1. **Add College Data**: Add divisions (like `CSE-A`), subjects (theory & labs), faculty members, and classrooms.
2. **Set Rules & Availability**: Use a simple weekly grid to mark when teachers are free or busy.
3. **Pre-Check (Validation)**: Before generating, the system audits your setup to catch impossible rules early.
4. **Generate**: The engine finds the best schedule using Google OR-Tools.
5. **Conflict Center**: If there is a clash, the system explains *why* in plain English and gives you a 1-click **"Move Here"** button to fix it.
6. **Review & Publish**: View schedules by Division, Teacher, or Student, make manual adjustments, and publish.

---

## 📋 The Rules It Follows

### 1. Strict Rules (Never Broken)
- **No Teacher Clashes**: A professor cannot teach two different classes at the same time.
- **No Room Clashes**: A classroom cannot hold two classes at the same time.
- **No Division Clashes**: A class cannot have two lectures at the same period.
- **Room Capacity**: A classroom must have enough desks for the number of students.
- **Correct Room Type**: Computer labs only get scheduled in Computer Labs, not regular classrooms.
- **Teacher Availability**: Teachers are never scheduled during periods they marked as unavailable.
- **Continuous Labs**: 2-hour lab sessions are scheduled consecutively without breaking across lunch.

### 2. Best-Effort Preferences (Quality Score)
- **Spread Subjects Evenly**: Don't put all 4 sessions of a subject on Monday and Tuesday; spread them across the week.
- **Teacher Preferences**: Give morning slots to teachers who prefer teaching in the morning.
- **Fewer Gaps**: Keep student schedules continuous to reduce idle waiting time between classes.

---

## 🎯 3 Demo Scenarios to Try

Inside the app, you will find 3 preset demo buttons on the left sidebar:

### 1. Clean Schedule (Feasible)
- Runs a complete schedule for 3 divisions, 10 subjects, 6 faculty, and 7 rooms.
- **Result**: All 54 classes assigned with **0 clashes** and a **96% quality score**.

### 2. Teacher Conflict (Clash Detection)
- Simulates Dr. Ravi being assigned two classes at the exact same hour on Monday at 10:00 AM.
- **Result**: The Conflict Center flags the issue:
  > *"Dr. Ravi Kumar is double-booked: teaching DBMS to CSE-A and AI to CSE-B at the same time."*
- Click **"Move Here"** on any suggested free time slot to resolve the clash instantly.

### 3. Impossible Constraint (Clear Diagnostic)
- Simulates CSE-A having 100 students, while the largest computer lab only has 40 seats.
- **Result**: Instead of a generic error, the system explains the problem and tells you how to fix it:
  > *"Timetable cannot be generated. CSE-A has 100 students, but the largest available lab only has 40 seats."*
  > **Suggested Fixes:** Split CSE-A into two 50-student lab batches, increase room capacity, or add a larger lab.

---

## 👥 Three Simple User Views

Switch between roles in the top-right header:

- **Admin View**: Full access to add/edit data, adjust rules, run the generator, fix conflicts, and publish.
- **Teacher View**: Shows a personalized timetable for individual faculty members (e.g., Dr. Ravi Kumar) with assigned rooms and free periods.
- **Student View**: Simple timetable view for students to select their division (e.g., `CSE-A`) and view their weekly schedule.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite (Fast and responsive modern interface).
- **Backend API**: Python 3.13, FastAPI, Uvicorn, Pydantic.
- **Constraint Solver**: Google OR-Tools CP-SAT (used by major logistics and scheduling companies).

---

## 🚀 How to Run Locally

### 1. Start the Backend
Open a terminal in the project folder:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API is live at: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

### 2. Start the Frontend
Open a second terminal:
```bash
cd frontend
npm run dev
```
- Open your browser to: **`http://localhost:5173`**
