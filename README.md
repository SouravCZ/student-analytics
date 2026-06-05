# 🎓 Student Performance & Attendance Analytics System

A full-stack, data-driven web application for department-level academic monitoring with role-based dashboards, attendance/marks analytics, and an ML engine that predicts at-risk students.

---

## 🖼️ Screenshots

### Login Page
<!-- Add screenshot here -->
<img width="858" height="601" alt="image" src="https://github.com/user-attachments/assets/498a43ba-e06c-45e2-b98c-57fb275c1a2a" />


### Admin Dashboard
<!-- Add screenshot here -->
<img width="706" height="477" alt="image" src="https://github.com/user-attachments/assets/f9fb78f2-bf53-4ab3-8d5e-67af8e49cd95" />

### ML Insights — Batch Analysis
<!-- Add screenshot here -->
<img width="705" height="477" alt="image" src="https://github.com/user-attachments/assets/a6c7ab30-fbe3-43a0-8e46-81481f44c7d2" />


### Student Dashboard
<!-- Add screenshot here -->
<img width="657" height="477" alt="image" src="https://github.com/user-attachments/assets/e7ac698b-cf6f-45bb-ab23-efda7437beff" />


> 📸 *Place your screenshots in a `/screenshots` folder in the project root.*

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | [Vercel](https://student-analytics.vercel.app) |
| Backend API | [student-analytics-10eb.onrender.com](https://student-analytics-10eb.onrender.com) |
| ML Engine | [student-analytics-ds.onrender.com](https://student-analytics-ds.onrender.com) |

> ⚠️ Render free tier has a **30–60s cold start** on first request — please wait a moment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express.js, JWT Auth, Mongoose |
| ML Engine | Python, Flask, scikit-learn (Random Forest), pandas |
| Database | MongoDB (local dev) / MongoDB Atlas (production) |

---

## 📁 Project Structure

```
Mini Project/
├── frontend/          # React + Vite app (port 5173)
├── backend/           # Node.js/Express API (port 5000)
├── ds-engine/         # Python/Flask ML engine (port 5001)
├── screenshots/       # App screenshots for README
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js & npm
- Python 3.x & pip
- MongoDB installed locally

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/SouravCZ/student-analytics.git
cd student-analytics

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Install ML engine dependencies
cd ds-engine && pip install -r requirements.txt && cd ..
```

### Running the App (4 terminals)

```bash
# Terminal 1 — MongoDB
mongod

# Terminal 2 — Backend API
cd backend && node index.js

# Terminal 3 — ML Engine
cd ds-engine && python app.py

# Terminal 4 — Frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin / HOD | admin@test.com | 123456 |

---

## ✨ Features

- **Role-based dashboards** — Admin/HOD and Student views
- **Attendance analytics** — Visual charts per student and batch
- **Marks analytics** — Subject-wise performance breakdown
- **ML Insights** — Random Forest model predicts at-risk students
- **Batch analysis** — Pie and bar charts for cohort-level insights
- **Single-student prediction** — Individual risk assessment

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (auto-deploy on push to `main`) |
| Backend | Render |
| ML Engine | Render |
| Database | MongoDB Atlas (`student-analytics.elhht3l.mongodb.net`) |

> `vercel.json` includes SPA rewrite rules to prevent 404s on page refresh.

### Deploy

```bash
git add . && git commit -m "your message" && git push origin main
```
Pushing to `main` triggers automatic redeployment on both Vercel and Render.

---

## 👨‍💻 Author

**Sourav Chakraborty** — [@SouravCZ](https://github.com/SouravCZ)
