# ☀️ Solar Flux Anomaly Tracker (SFAT)

[![Live Demo](https://img.shields.io/badge/Live_Demo-SFAT_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://solar-flux-anomaly-tracker-sfat.vercel.app/)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Backend Status](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

A full-stack, enterprise-grade space weather monitoring application designed for real-time detection, tracking, and incident handling of solar flux anomalies and solar flare events. 

Built on the **MERN** stack (MongoDB, Express, React, Node.js), SFAT provides secure, role-based command centers, live data streams, automated email notification pipelines, and robust cloud deployment configurations.

🌐 **Live Application:** [https://solar-flux-anomaly-tracker-sfat.vercel.app/](https://solar-flux-anomaly-tracker-sfat.vercel.app/)

---

## 🚀 Key Features

* **Real-Time Data Streaming:** Leverages Server-Sent Events (SSE) to push live telemetry data and anomaly signals to connected supervisor dashboards without polling overhead.
* **Role-Based Access Control (RBAC):**
  * **Admin:** Manages platform security, reviews pending user registrations, and grants operational access.
  * **Supervisor:** Monitors telemetry streams, analyzes solar trends, tracks active anomaly alerts, and oversees operator shifts.
  * **Operator:** Logs ground observations, registers critical solar flare thresholds, and manages real-time telemetry inputs.
* **Automated Email Alert System:** Built-in Nodemailer integration sends instant notifications for:
  * Admin authorization requests upon new user registrations.
  * Critical solar flare triggers exceeding safety thresholds (W/m²).
* **Cold-Start Resilient UX:** Custom health-check ping mechanisms (`/api/health`) seamlessly display backend boot states while free-tier cloud instances wake up.
* **Production-Grade Security:**
  * JWT (JSON Web Tokens) with short-lived access tokens and refresh token workflows.
  * HTTP-only cookie support for secure token storage.
  * Strict Cross-Origin Resource Sharing (CORS) white-listing.

---

## 🏗️ System Architecture

SFAT is engineered using a decoupled client-server architecture designed for high availability, low-latency telemetry updates, and secure cloud distribution.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel CDN)                             │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               React Single Page Application (SPA)              │   │
│   │    - Tailwind CSS Dashboard Interfaces                         │   │
│   │    - React Router DOM Navigation                               │   │
│   │    - EventSource SSE Live Data Listeners                       │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTPS / REST / SSE
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Render Node.js)                        │
│                                                                        │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│   │ Auth Controller  │  │ User Controller  │  │ Anomaly Streamer │   │
│   │ (JWT / Cookies)  │  │ (RBAC Management)│  │ (SSE Event Loop) │   │
│   └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │
└────────────┼─────────────────────┼─────────────────────┼───────────────┘
             │                     │                     │
             ▼                     ▼                     ▼
┌──────────────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│ MongoDB Atlas        │  │ Nodemailer SMTP  │  │ Dynamic Web Links      │
│ - Users & Roles      │  │ - Admin Alerts   │  │ - process.env          │
│ - Anomaly Logs       │  │ - Flare Warnings │  │   FRONTEND_URL         │
└──────────────────────┘  └──────────────────┘  └────────────────────────┘
```

### Architecture Breakdown

1. **Frontend Layer (Vercel):** Built with React, TypeScript/Vite, and Tailwind CSS. Static assets are served globally via Vercel’s Edge Network. Single-page app routing is managed by `vercel.json` rewrite rules to prevent `404` errors on deep route refreshes.
2. **Backend API Layer (Render):** Express.js app running on Node.js hosting secure RESTful endpoints and real-time SSE stream outputs.
3. **Database Layer (MongoDB Atlas):** Document storage for users, operational logs, and solar flare telemetry history.
4. **Notification Engine:** SMTP transporter integration pushing dynamic HTML email alerts directly to admins and operators on shift.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript/JavaScript, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Cookie-Parser, Cors, Dotenv |
| **Database** | MongoDB, Mongoose ODM |
| **Notifications** | Nodemailer (SMTP Transporter with dynamic HTML templating) |
| **Hosting & DevOps** | Vercel (Frontend), Render (Backend), GitHub |

---

## 📁 Repository Structure

```text
Solar-Flux-Anomaly-Tracker-SFAT/
├── frontend/                     # React / Vite Client Application
│   ├── src/
│   │   ├── assets/               # Images, logos, static assets
│   │   ├── components/           # Reusable UI components & loaders
│   │   ├── context/              # Authentication & global state
│   │   ├── pages/                # Admin, Supervisor, Operator dashboards
│   │   └── App.tsx               # Main routing & cold-start health check
│   ├── index.html                # Application entry HTML
│   ├── vite.config.ts            # Vite configuration
│   ├── package.json
│   └── vercel.json               # Vercel SPA routing & API proxy rules
│
├── backend/                      # Express.js API Server
│   ├── config/                   # Database connection scripts (`db.js`)
│   ├── controllers/              # Route handling logic (`userController.js`)
│   ├── models/                   # Mongoose schemas (`User.js`, `Anomaly.js`)
│   ├── routes/                   # API endpoint routers
│   ├── utility/                  # Alert utilities (`createAlert.js`)
│   ├── server.js                 # Express server bootstrap & middleware
│   └── package.json
│
└── README.md                     # Project documentation
```

---

## ⚙️ Environment Variables

To run this project locally or deploy it to cloud environments, set the following environment variables:

### Backend Configuration (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_cluster_connection_string
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
PASS=your_email_app_password
DATA_SOURCE=live
FRONTEND_URL=[https://solar-flux-anomaly-tracker-sfat.vercel.app](https://solar-flux-anomaly-tracker-sfat.vercel.app)
```

### Render Dashboard Environment Variables
Ensure the following variables are configured under your Render service **Environment** tab:
* `ACCESS_TOKEN_SECRET`
* `REFRESH_TOKEN_SECRET`
* `MONGO_URI`
* `PASS`
* `DATA_SOURCE`
* `FRONTEND_URL` = `https://solar-flux-anomaly-tracker-sfat.vercel.app` *(no trailing slash)*

---

## 🚦 Local Development Setup

Follow these steps to run the complete SFAT system locally on your machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Git](https://git-scm.com/)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster account.

### 1. Clone the Repository
```bash
git clone [https://github.com/Arpan268/Solar-Flux-Anomaly-Tracker-SFAT-.git](https://github.com/Arpan268/Solar-Flux-Anomaly-Tracker-SFAT-.git)
cd Solar-Flux-Anomaly-Tracker-SFAT-
```

### 2. Setup Backend
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create local environment file
cp .env.example .env  # Add your environment variables inside .env

# Start local backend server
npm run dev
```
The backend server will launch at `http://localhost:5000`.

### 3. Setup Frontend
Open a new terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start local frontend development server
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 🛰️ API Endpoints Summary

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status ping for cold-start UI handling |
| `POST` | `/api/auth/register` | Public | Registers new user; triggers email alert to admins |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; issues access/refresh tokens |
| `GET` | `/api/user/shared/supervisor/analyze` | Supervisor / Admin | Fetches telemetry analysis summaries |
| `GET` | `/api/user/supervisor/live-data` | Supervisor | Establishes SSE pipeline for real-time solar data |
| `POST` | `/api/user/operator/alert` | Operator | Logs an anomaly and fires urgent shift alerts |

---

## 🔒 Security Best Practices Implemented

* **Dynamic Origin Matching:** CORS policy dynamically targets `process.env.FRONTEND_URL` while allowing local fallback (`http://localhost:5173`) during development.
* **Separation of Secrets:** API keys, database credentials, and SMTP authentication passwords are fully isolated inside environment configurations.
* **Protected Routes:** Frontend routes verify JWT access token claims before mounting privileged admin or operator dashboard interfaces.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<p align="center">
  Developed with ❤️ by <strong>Arpan Halder</strong>
  <br />
  <i>Solar Flux Anomaly Tracker (SFAT) — Monitoring Space Weather for a Safer Tomorrow.</i>
</p>