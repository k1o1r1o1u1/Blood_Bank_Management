# Blood Bank Management System - Backend API

Express.js REST API server for the Blood Bank Management System with MySQL database connectivity and transaction handling.

---

## 🛠 Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database Driver:** `mysql2` (Connection Pool & Promises)
- **Security:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT auth), `cors`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
```

Default variables in `.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=blood_bank
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

### 3. Start the Server
- **Development (with hot-reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 📡 API Endpoints Overview

Base URL: `http://localhost:5000/api`

### Health Check
- `GET /api/health` - Service health status

### Authentication & Staff
- `POST /api/auth/login` - Staff/Admin login with JWT
- `GET /api/auth/me` - Authenticated user details
- `GET /api/auth/staff` - Staff member directory

### Blood Groups
- `GET /api/blood-groups` - List of blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)

### Donors
- `GET /api/donors` - List all donors
- `GET /api/donors/:id` - Single donor profile
- `POST /api/donors` - Register new donor
- `PUT /api/donors/:id` - Update donor details
- `DELETE /api/donors/:id` - Delete donor

### Donations & Screening
- `GET /api/donations` - All donations history
- `GET /api/donations/:id` - Single donation details
- `POST /api/donations` - Record new donation
- `PUT /api/donations/:id/screening` - Update screening status (`Approved` / `Rejected`) and auto-generate blood units

### Blood Inventory
- `GET /api/inventory` - Stock count for all 8 blood groups
- `GET /api/inventory/:bloodGroup` - Specific blood group stock
- `GET /api/inventory/units/available` - Unassigned available blood units

### Hospitals
- `GET /api/hospitals` - All registered hospitals
- `GET /api/hospitals/:id` - Single hospital details & requests
- `POST /api/hospitals` - Register hospital
- `PUT /api/hospitals/:id` - Update hospital details
- `DELETE /api/hospitals/:id` - Delete hospital

### Blood Requests
- `GET /api/requests` - Hospital requests (`status`, `urgency`, `hospital_id` filters)
- `GET /api/requests/:id` - Request details
- `POST /api/requests` - Submit new blood request
- `PUT /api/requests/:id` - Update request status (`Pending`, `Approved`, `Rejected`, `Completed`)

### Blood Issue (Database Transaction)
- `GET /api/issues` - All blood issuance records
- `GET /api/issues/:id` - Single issue record
- `POST /api/issues` - **ACID Transaction** to issue units, lock rows, update unit status to `Issued`, and complete the request

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Total donors, units, pending requests, recent donations, and issues
