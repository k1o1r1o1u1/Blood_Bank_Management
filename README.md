# 🩸 Blood Bank Management System (BloodCare)

A comprehensive, full-stack Blood Bank Management System built with **React**, **Node.js / Express**, and **MySQL**. Designed for blood banks and hospital networks to manage donors, donations, screening, stock inventory, hospital blood requests, and atomic issuance transactions.

---

## 🏛 System Architecture

```
┌─────────────────────────────────┐
│     React 19 Frontend (SPA)     │  Port 5173 / 5174
│  Tailwind CSS • Lucide • Vite   │
└───────────────┬─────────────────┘
                │  HTTP / JSON (REST API)
                ▼
┌─────────────────────────────────┐
│     Node.js + Express Server    │  Port 5000
│   Validation • JWT • Services   │
└───────────────┬─────────────────┘
                │  SQL (mysql2 pool & transactions)
                ▼
┌─────────────────────────────────┐
│        MySQL 8.0+ Database      │  Port 3306
│ Tables • Triggers • Views • SPs │
└─────────────────────────────────┘
```

---

## 🚀 Quick Setup & Run Guide

### 1. Prerequisites
- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **MySQL Server** (MySQL 8.0+, MySQL Workbench, or XAMPP) - running on port `3306`
- **Git**

---

### 2. Clone the Repository
```bash
git clone https://github.com/k1o1r1o1u1/Blood_Bank_Management.git
cd Blood_Bank_Management
```

---

### 3. Database Setup (MySQL)

1. Open your MySQL client (Command Line, MySQL Workbench, or phpMyAdmin) and create the database:
   ```sql
   CREATE DATABASE blood_bank;
   ```

2. Import the SQL scripts from the `database/` folder (in this order):
   ```bash
   # From the project root:
   mysql -u root -p blood_bank < database/schema.sql
   mysql -u root -p blood_bank < database/indexes.sql
   mysql -u root -p blood_bank < database/views.sql
   mysql -u root -p blood_bank < database/procedures.sql
   mysql -u root -p blood_bank < database/seed.sql
   mysql -u root -p blood_bank < database/triggers.sql
   ```
   *Or import everything in one command:*
   ```bash
   mysql -u root -p < database/blood_bank_complete.sql
   ```
   *(If your MySQL user has no password, omit `-p`)*

---

### 4. Backend Setup & Start

Open **Terminal 1**:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (Express, mysql2, cors, bcryptjs, jwt, etc.)
npm install

# Copy environment template to .env
cp .env.example .env
```

Edit `backend/.env` with your MySQL credentials:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=blood_bank
DB_PORT=3306

JWT_SECRET=blood_bank_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=1d
```

Start the backend server:
```bash
# Development mode with hot-reload (nodemon)
npm run dev

# Or standard production mode
npm start
```
The backend will run at **`http://localhost:5000`**.  
Check health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 5. Frontend Setup & Start

Open **Terminal 2**:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (React, Vite, Tailwind, Axios, Lucide, Recharts)
npm install

# Verify or create the .env file
cp .env.example .env
```

Ensure `frontend/.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run at **`http://localhost:5173`** (or the port Vite prints in terminal).  
Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Directory Structure

```
Blood_Bank_Management/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database connection pool (mysql2)
│   │   ├── controllers/      # Donors, donations, inventory, requests, issues, auth
│   │   ├── middleware/       # JWT auth, error handlers
│   │   ├── routes/           # Express router endpoints
│   │   ├── app.js            # Express app configuration & middleware
│   │   └── server.js         # Server entrypoint
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/                 # React 19 + Vite single-page application
│   ├── src/
│   │   ├── components/       # UI widgets, layout shells, modals, tables
│   │   ├── hooks/            # Data hooks (useDashboardData)
│   │   ├── pages/            # Dashboard, Donors, Donations, Inventory, Hospitals, Requests, Issues, Reports
│   │   ├── services/         # Axios API clients
│   │   ├── App.jsx           # Routing configuration
│   │   └── main.jsx          # React DOM entrypoint
│   ├── .env.example
│   └── package.json
│
├── database/                 # MySQL database scripts
│   ├── schema.sql            # Table definitions & constraints
│   ├── seed.sql              # Initial demo data (tuples)
│   ├── views.sql             # SQL views (available stock, pending requests)
│   ├── procedures.sql        # Stored procedures
│   └── triggers.sql          # Triggers for stock updates & status
│
├── docs/
│   └── API.md                # Complete REST API specification
├── .gitignore
└── README.md
```

---

## ⚡ Core Features & Complete Workflow

1. **Staff Login & Security**: Secure authentication with JWT tokens and password hashing (`bcryptjs`).
2. **Donor Management**: Register donors with age verification (18–65), phone uniqueness, and medical eligibility.
3. **Donation Intake & Screening**:
   - Record blood collection session.
   - Run screening tests (HIV, Hepatitis B/C, Syphilis, Malaria).
   - If **Approved**, blood units are automatically generated and stamped with a 42-day expiration date.
4. **Real-time Inventory Matrix**: Real-time breakdown of all 8 blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) categorized into *Available*, *Reserved*, *Issued*, and *Expired*.
5. **Hospital Management & Blood Requests**:
   - Hospital directory with contact details.
   - Hospital blood requests prioritized by urgency (`Critical`, `Urgent`, `Normal`).
6. **Blood Issue (Atomic Database Transaction)**:
   - When issuing blood to an approved hospital request, an **ACID transaction** (`BEGIN ... COMMIT / ROLLBACK`) is executed.
   - Locks rows with `FOR UPDATE` to prevent race conditions.
   - Verifies unit validity, non-expiry, and quantity match.
   - Transitions blood unit status to `Issued` and request to `Completed`.
7. **Analytics Dashboard**: Real-time KPI cards, stock levels, recent donation feeds, and hospital demand profiles.

---

## 📚 API Reference

A detailed API endpoint reference is available in [docs/API.md](docs/API.md).

| Base Resource | Method | Description |
|---|---|---|
| `/api/auth/login` | `POST` | Staff login & JWT generation |
| `/api/donors` | `GET`, `POST` | List and create donors |
| `/api/donors/:id` | `GET`, `PUT`, `DELETE` | Donor profile operations |
| `/api/donations` | `GET`, `POST` | Collection history & record donation |
| `/api/donations/:id/screening` | `PUT` | Update screening (`Approved` / `Rejected`) |
| `/api/inventory` | `GET` | Stock summary for all 8 blood groups |
| `/api/inventory/units/available` | `GET` | Filter available unexpired units |
| `/api/hospitals` | `GET`, `POST` | Hospital registry |
| `/api/requests` | `GET`, `POST` | Manage hospital requests |
| `/api/requests/:id` | `PUT` | Update status (`Approved`, `Rejected`) |
| `/api/issues` | `POST` | **Atomic ACID transaction** to issue blood units |
| `/api/dashboard/stats` | `GET` | Metrics for real-time overview dashboard |

---

## 🛠 Team Collaboration Workflow

- **Backend Development**: Changes go inside `backend/`.
- **Frontend Development**: Changes go inside `frontend/`.
- **Database Scripts**: Changes go inside `database/`.

Always pull before starting work:
```bash
git pull origin main
```
Pushing updates:
```bash
git add .
git commit -m "feat: description of work"
git push origin main
```
