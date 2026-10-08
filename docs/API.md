# Blood Bank Management System - REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Staff

### `POST /api/auth/login`
- **Description:** Authenticates staff/admin user and returns a JWT token.
- **Request Body:**
  ```json
  {
    "email": "admin@bloodbank.org",
    "password": "adminpassword"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "staff_id": 1,
        "name": "Dr. Sarah Jenkins",
        "role": "Admin",
        "email": "admin@bloodbank.org"
      }
    }
  }
  ```

### `GET /api/auth/staff`
- **Description:** Returns all staff members.

---

## 2. Blood Groups

### `GET /api/blood-groups`
- **Description:** Returns all 8 blood groups (useful for frontend dropdowns).
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      { "blood_group_id": 1, "group_name": "A+" },
      { "blood_group_id": 2, "group_name": "A-" },
      { "blood_group_id": 7, "group_name": "O+" }
    ]
  }
  ```

---

## 3. Donors

### `GET /api/donors`
- **Description:** Retrieve all donors with their blood group name.

### `GET /api/donors/:id`
- **Description:** Retrieve donor by ID.

### `POST /api/donors`
- **Description:** Create a new donor.
- **Request Body:**
  ```json
  {
    "name": "Rahul Sharma",
    "age": 23,
    "gender": "Male",
    "phone": "9876543210",
    "address": "Mysuru",
    "blood_group_id": 7
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Donor created successfully",
    "data": {
      "donor_id": 1,
      "name": "Rahul Sharma",
      "age": 23,
      "gender": "Male",
      "phone": "9876543210",
      "address": "Mysuru",
      "blood_group_id": 7
    }
  }
  ```

### `PUT /api/donors/:id`
- **Description:** Update donor information.

### `DELETE /api/donors/:id`
- **Description:** Delete a donor.

---

## 4. Donations & Screening

### `GET /api/donations`
- **Description:** List all donation records.

### `POST /api/donations`
- **Description:** Record a blood donation.
- **Request Body:**
  ```json
  {
    "donor_id": 1,
    "blood_group_id": 7,
    "donation_date": "2026-10-08",
    "quantity": 1,
    "screening_status": "Pending"
  }
  ```

### `PUT /api/donations/:id/screening`
- **Description:** Update screening status (`Approved`, `Rejected`, or `Pending`). When `Approved`, blood units are automatically generated with 42 days expiry.
- **Request Body:**
  ```json
  {
    "screening_status": "Approved"
  }
  ```

---

## 5. Blood Inventory

### `GET /api/inventory`
- **Description:** Summary of all blood groups with available, reserved, issued, and expired counts.
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "blood_group_id": 7,
        "blood_group": "O+",
        "available_units": 55,
        "reserved_units": 0,
        "issued_units": 10,
        "expired_units": 2,
        "total_units": 67
      }
    ]
  }
  ```

### `GET /api/inventory/:bloodGroup`
- **Description:** Available stock for a specific group (e.g. `/api/inventory/O+`).

### `GET /api/inventory/units/available?blood_group_id=7`
- **Description:** List individual available blood unit IDs for selection when issuing blood.

---

## 6. Hospitals

### `GET /api/hospitals`
- **Description:** List registered hospitals.

### `POST /api/hospitals`
- **Request Body:**
  ```json
  {
    "name": "Apollo Hospital",
    "address": "Bannerghatta Rd, Bengaluru",
    "contact": "080-26304050",
    "email": "emergency@apollohospitals.com"
  }
  ```

### `GET /api/hospitals/:id`
- **Description:** Hospital profile and its blood request history.

---

## 7. Blood Requests

### `GET /api/requests`
- **Optional Query Filters:** `?status=Pending&urgency=Critical&hospital_id=1`

### `POST /api/requests`
- **Request Body:**
  ```json
  {
    "hospital_id": 1,
    "blood_group_id": 7,
    "quantity_required": 2,
    "urgency": "Critical",
    "request_date": "2026-10-08"
  }
  ```

### `PUT /api/requests/:id`
- **Description:** Update request status (`Pending`, `Approved`, `Rejected`, `Completed`).

---

## 8. Blood Issue (Atomic Transaction)

### `GET /api/issues`
- **Description:** List all blood unit issuance events.

### `POST /api/issues`
- **Description:** Issues blood units under an ACID transaction.
- **Request Body:**
  ```json
  {
    "request_id": 1,
    "unit_ids": [501, 502],
    "issued_by": 1
  }
  ```
- **Transaction Steps executed atomically:**
  1. Validates request existence and status.
  2. Locks rows (`FOR UPDATE`) for concurrency control.
  3. Validates units belong to requested blood group, are `Available`, and not expired.
  4. Inserts records into `issues`.
  5. Updates `blood_units.status` to `'Issued'`.
  6. Updates `blood_requests.status` to `'Completed'`.
  7. Commits or rolls back entirely on error.

---

## 9. Dashboard Analytics

### `GET /api/dashboard/stats`
- **Description:** Provides summary counters and recent transactions for the frontend dashboard.
