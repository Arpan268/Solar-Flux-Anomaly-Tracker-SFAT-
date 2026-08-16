# ☀️ Solar Flux Anomaly Tracker (SFAT)

[![Live Demo](https://img.shields.io/badge/Live_Demo-SFAT_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://solar-flux-anomaly-tracker-sfat.vercel.app/)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Backend Status](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**Solar Flux Anomaly Tracker (SFAT)** is a full-stack, multi-tenant **B2B space-weather intelligence platform** designed to monitor real-time solar telemetry, detect solar anomalies and flare events, estimate near-term flare risk, and translate space-weather signals into organization-specific operational workflows.

SFAT combines a **MERN** application with a dedicated **Python/FastAPI ML microservice**, providing isolated tenant workspaces, hierarchical RBAC, real-time telemetry streaming, event-driven emergency handling, automated notifications, AI-assisted sector-specific reporting, and predictive flare-risk forecasting.

**Live Application:** https://solar-flux-anomaly-tracker-sfat.vercel.app/

---

## ✨ Key Features

### 🏢 Multi-Tenant B2B Architecture

- Secure organization-specific workspaces within a shared database architecture.
- Tenant-scoped data access enforced through backend `companyId` validation.
- Compound indexing supports efficient tenant-aware queries.
- Company registration and organization-specific user management.
- Company Admins manage their organization's users and operational workflows.
- Designed to prevent cross-tenant data access and maintain strict organization boundaries.

### 📡 Real-Time Space-Weather Monitoring

- Continuously ingests live solar telemetry from external space-weather data sources.
- Server-Sent Events (SSE) stream telemetry and anomaly signals to connected dashboards.
- Real-time dashboards provide operational visibility without client-side polling.
- Historical telemetry and anomaly data are retained for analysis.

### 🤖 Machine Learning Predictive Engine

- Integrates a custom **XGBoost** model through a Python/FastAPI microservice.
- Forecasts relative probabilities of **C-Class, M-Class, and X-Class solar flares** over a 24-hour window.
- Processes telemetry-derived features through a dedicated prediction service.
- Prediction results are incorporated into the operational advisory workflow.

### 🚨 Event-Driven Emergency Handling

- Standard anomalies follow the normal supervisory workflow.
- **X-Class events trigger an emergency bypass path.**
- Critical events generate immediate real-time dashboard notifications.
- Emergency email notifications are routed directly to designated operational roles.
- Event-driven processing reduces latency between detection and organizational response.

### 📋 Operational Advisory Workflow

- Analysts evaluate telemetry and ML prediction results.
- Analysts can generate formal threat advisories.
- Supervisors review and act on prediction-based advisories.
- Company Admins receive organization-level anomaly advisories.
- Advisories support acknowledgement and traceable operational communication.

### 🧠 Sector-Specific AI Anomaly Analysis

- Integrates the **Google Gemini API** for automated anomaly-report generation.
- Reports are dynamically tailored to the registered organization's industry.
- Supports sector-specific analysis for domains such as:
  - Aviation
  - Telecommunications
  - Energy
  - Other space-weather-sensitive industries

### ⏱️ Operational Shift Enforcement

- Automated 8-hour operator shift enforcement.
- Deterministic session invalidation after shift completion.
- Forced logout handling.
- Real-time frontend countdown timers.
- Dynamic shift assignment and operational tracking.

### 🔐 Hierarchical Role-Based Access Control

#### SFAT Platform Admin

- Manages platform-level security.
- Approves new B2B company registrations.
- Oversees global platform operations.

#### Company Admin

- Manages organization-specific users and rosters.
- Approves team-member registrations.
- Oversees company-level operational activity.
- Receives organization-specific anomaly advisories.

#### Supervisor

- Monitors live telemetry.
- Manages operator shift allocations.
- Reviews standard and moderate solar anomalies.
- Reviews prediction-based advisories.
- Coordinates operational responses.

#### Analyst

- Examines historical telemetry.
- Evaluates space-weather trends.
- Runs ML flare-risk predictions.
- Generates AI-assisted anomaly reports.
- Analyzes detected solar events.

#### Operator

- Records ground observations.
- Registers solar-flare thresholds.
- Handles real-time telemetry inputs.
- Operates within enforced shift windows.

### 📧 Event-Driven Email Notification System

Built with SendGrid API integration and hierarchical notification routing.

- New company registrations → SFAT Platform Admins
- New user/operator registrations → respective Company Admins
- Standard anomaly alerts → active Supervisors
- Emergency X-Class events → designated emergency recipients
- Dynamic HTML email templates for operational notifications

### ✉️ Email Verification & OTP

- OTP-based email verification during registration.
- Account activation only after successful verification.
- Supports controlled user onboarding across platform and company tenants.

### ☁️ Cloud Deployment & Cold-Start Handling

- React frontend deployed on Vercel.
- Node.js/Express backend deployed on Render.
- Python/FastAPI ML service deployed independently.
- MongoDB Atlas used for persistent storage.
- Custom `/api/health` health-check mechanism handles backend cold starts and provides appropriate frontend boot-state feedback.

---

## 🏗️ System Architecture

SFAT follows a decoupled client-server architecture with isolated services for the frontend, backend API, database, notifications, AI analysis, and machine-learning inference.

```text
                         ┌─────────────────────────────┐
                         │        CLIENT LAYER         │
                         │           Vercel            │
                         │                             │
                         │  React + TypeScript + Vite  │
                         │ Tailwind CSS + React Router │
                         │  EventSource / SSE Client   │
                         └──────────────┬──────────────┘
                                        │
                              HTTPS / REST / SSE
                                        │
                         ┌──────────────▼─────────────────────┐
                         │        BACKEND API LAYER           │
                         │        Node.js + Express           │
                         │                                    │
                         │      Auth / RBAC / Tenants         │
                         │    User & Company Management       │
                         │       Anomaly Processing           │
                         │        SSE Event Manager           │
                         └──────┬──┬──────────────┬────────┬──┘
                                │  │              │        │
                ┌───────────────┘  │              │        └────────────────┐
                │                  │              │                         │
       ┌────────▼────────┐         │     ┌────────▼────────┐       ┌────────▼────────┐
       │  MongoDB Atlas  │         │     │   SendGrid API  │       │   Gemini API    │
       │                 │         │     │                 │       │                 │
       │ Users & Roles   │         │     │ Email Alerts    │       │ AI Reports      │
       │ Companies       │         │     │ Notifications   │       │ Sector Analysis │
       │ Telemetry       │         │     └─────────────────┘       └─────────────────┘
       │ Advisories      │         │
       │ Operational Logs│         │
       └─────────────────┘         │
                                   │
                                   │ HTTP
                                   │
                            ┌──────▼────────────────┐
                            │   ML MICROSERVICE     │
                            │    Python + FastAPI   │
                            │                       │
                            │  Feature Processing   │
                            │  XGBoost Prediction   │
                            │  24h Flare Risk       │
                            └───────────────────────┘
```

### Architecture Breakdown

#### 1. Frontend Layer — Vercel

Built with React, TypeScript/Vite, and Tailwind CSS.

- Role-specific operational dashboards.
- React Router-based navigation.
- SSE listeners for real-time telemetry and alerts.
- Vercel SPA rewrite configuration for deep-route handling.
- Cold-start status handling through backend health checks.

#### 2. Backend API Layer — Node.js / Express

The backend provides the primary application and orchestration layer.

- RESTful API endpoints.
- Authentication and authorization.
- RBAC enforcement.
- Multi-tenant data isolation.
- Company and user management.
- Advisory processing.
- SSE event management.
- Operational shift management.
- Integration with SendGrid, Gemini, and the ML service.

#### 3. Database Layer — MongoDB Atlas

MongoDB stores:

- Users and roles
- Company/tenant information
- Solar telemetry
- Historical anomalies
- Advisories
- Operational logs
- Shift information

Tenant-aware queries are enforced using `companyId` scoping at the backend layer.

#### 4. Notification Engine — SendGrid

Provides event-driven operational email delivery.

- Registration notifications
- Anomaly alerts
- Emergency flare alerts
- Role-specific routing
- Dynamic HTML email generation

#### 5. AI Analysis Layer — Google Gemini

Gemini is used for AI-assisted anomaly reporting.

The backend supplies relevant telemetry, anomaly information, and organization context to generate reports tailored to the registered company's operational sector.

#### 6. Machine Learning Layer — Python / FastAPI

The ML service runs independently from the Node.js application.

- Python/FastAPI prediction API
- Telemetry feature preprocessing
- XGBoost inference
- 24-hour flare-risk prediction
- Serialized model artifact for deployment

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript/JavaScript, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, REST APIs, JWT, Cookie-Parser, CORS |
| **Database** | MongoDB, Mongoose ODM |
| **Real-Time Communication** | Server-Sent Events (SSE) |
| **Notifications** | SendGrid API |
| **AI Analysis** | Google Gemini API |
| **Machine Learning** | Python, FastAPI, XGBoost, Pandas, NumPy, Joblib |
| **Hosting & DevOps** | Vercel, Render, MongoDB Atlas, GitHub |

---

## 📁 Repository Structure

```text
Solar-Flux-Anomaly-Tracker-SFAT/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── vercel.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utility/
│   └── server.js
│
├── mlmodel/
│   ├── server.py
│   ├── train.py
│   ├── model.pkl
│   └── requirements.txt
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Backend health check and cold-start status |
| `GET` | `/ML_URL/health` | Public | ML microservice health check |
| `POST` | `/api/auth/register-company` | Public | Registers a new B2B tenant |
| `POST` | `/api/auth/register-user` | Public | Registers a new user |
| `POST` | `/api/auth/login` | Public | Authenticates users and issues access/refresh tokens |
| `GET` | `/api/user/shared/supervisor/analyze` | Supervisor / Admin | Fetches telemetry analysis summaries |
| `GET` | `/api/user/shared/notifications/stream` | Analyst / Supervisor | Establishes an SSE notification stream |
| `POST` | `/api/user/operator/alert` | Operator | Logs an anomaly and triggers relevant alerts |
| `POST` | `/api/user/analyst/generate-report` | Analyst | Generates a sector-specific AI anomaly report |
| `POST` | `/ML_URL/predict` | Analyst | Predicts 24-hour flare-risk probabilities |

---

## 🔒 Security & Data Isolation

SFAT implements multiple application-level security mechanisms:

- **JWT authentication** with short-lived access tokens.
- **Refresh-token workflow** for session continuation.
- **HTTP-only cookies** for secure token storage.
- Strict **CORS origin validation**.
- Protected frontend routes based on authentication claims.
- Backend authorization for privileged operations.
- Environment-based secret management.
- Backend-enforced tenant scoping through `companyId`.
- Company-specific user and advisory access boundaries.
- OTP-based email verification.

### Tenant Isolation

All company-scoped operations are validated against the authenticated user's `companyId`.

This ensures that requests for one organization cannot access operational records belonging to another organization through client-side manipulation alone.

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
PORT=5000

MONGO_URI=your_mongodb_cluster_connection_string

ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key

SENDGRID_API_KEY=your_sendgrid_api_key
GEMINI_API_KEY=your_gemini_api_key

DATA_SOURCE=live

FRONTEND_URL=https://solar-flux-anomaly-tracker-sfat.vercel.app
ML_SERVER_URL=https://solar-flux-anomaly-tracker-sfat-1.onrender.com
```

### Render Environment Variables

Configure the following variables in the Render service:

```text
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
MONGO_URI
SENDGRID_API_KEY
GEMINI_API_KEY
DATA_SOURCE
FRONTEND_URL
ML_SERVER_URL
```

---

## 💻 Local Development

### Prerequisites

- Node.js v18+
- Python 3
- Git
- MongoDB Community Server or MongoDB Atlas
- SendGrid API key
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Arpan268/Solar-Flux-Anomaly-Tracker-SFAT-.git

cd Solar-Flux-Anomaly-Tracker-SFAT-
```

### 2. Start the Backend

```bash
cd backend

npm install

cp .env.example .env

# Add your environment variables

npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Start the ML Microservice

Open a new terminal:

```bash
cd mlmodel

pip install -r requirements.txt

uvicorn server:app --reload --port 8000
```

ML service:

```text
http://localhost:8000
```

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 Operational Workflow

```text
    LIVE TELEMETRY
          │
          ▼
       MONITOR
          │
          ▼
       DETECT
          │
          ▼
       ANALYZE
          │
          ▼
  ┌───────────────┐
  │ ML FORECAST   │
  │ 24h FLARE RISK│
  └───────┬───────┘
          │
          ▼
       DECIDE
          │
          ▼
         ACT
```

### Standard Event Flow

```text
Telemetry
   ↓
Anomaly Detection
   ↓
Analyst / Supervisor Review
   ↓
Advisory
   ↓
Company / Operational Response
```

### X-Class Emergency Flow

```text
X-Class Detection
       ↓
Emergency Event
       ↓
Event-Driven Bypass
       ↓
SSE Dashboard Alert
       +
Email Notification
       ↓
Immediate Operational Response
```

---

## 🎯 Project Goals

SFAT is designed around a central operational problem:

> **Space-weather data is valuable only when it can be translated into timely, organization-specific decisions.**

The platform therefore connects:

**Real-Time Observation → Detection → Analysis → Prediction → Decision → Action**

rather than treating telemetry monitoring, machine learning, reporting, and operational response as isolated systems.

---

## 🚀 Future Scope

Potential future extensions include:

- Organization-specific risk models and operational thresholds.
- Deeper integration with aviation, GNSS, telecommunications, and energy-sector systems.
- Sector-specific impact models for different types of space-weather events.
- Additional space-weather data sources.
- More advanced forecasting models and longer prediction horizons.
- External organization APIs for automated operational integration.
- Expanded analytics and historical event research capabilities.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

<p align="center">
  Developed with ❤️ by <strong>Arpan Halder</strong>
  <br />
  <i>Solar Flux Anomaly Tracker (SFAT) — Monitoring Space Weather for a Safer Tomorrow.</i>
</p>