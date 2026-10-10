# 🩸 Blood Bank Management System - Database Documentation

**Database Name:** `blood_bank`  
**Engine:** MySQL 8.0+ (InnoDB)  
**Encoding:** `utf8mb4` | `utf8mb4_unicode_ci`

---

## 🏛 1. Database Architecture & Overview

The `blood_bank` database provides the normalized, relational data foundation for the Blood Bank Management System. It tracks donors, donations, laboratory screening, blood inventory units, hospital requests, and unit issuances with strict referential integrity, constraints, triggers, and stored procedures.

```
+------------------+         +--------------------+         +---------------------+
|   blood_groups   |<---1:N--|       donors       |<---1:N--|      donations      |
+------------------+         +--------------------+         +---------------------+
         ^                                                             |
         | 1:N                                                         | 1:N
         |                   +--------------------+                    v
         +-------------------|    blood_units     |<-------------------+
         |                   +--------------------+
         | 1:N                         ^
         |                             | 1:1
+------------------+         +--------------------+         +---------------------+
|    hospitals     |<---1:N--|   blood_requests   |<---1:N--|       issues        |
+------------------+         +--------------------+         +---------------------+
                                                                       ^
                                                                       | N:1
                                                            +---------------------+
                                                            |        staff        |
                                                            +---------------------+
```

---

## 📁 2. Directory Structure

```
database/
├── schema.sql              # Table definitions, PKs, FKs, CHECK, and UNIQUE constraints
├── seed.sql                # Initial seed data (>= 5 realistic tuples per table)
├── indexes.sql             # Performance optimization indexes for high-frequency queries
├── views.sql               # Database views (inventory, requests, donations, audit)
├── procedures.sql          # Stored procedures (availability, requests, donor history)
├── triggers.sql            # Triggers enforcing issuance rules, status sync, and audits
├── blood_bank_complete.sql # All-in-one consolidated master script
└── README.md               # Complete setup, reference, and usage documentation
```

---

## 🚀 3. How to Execute & Setup the Database

### Option A: Modular Step-by-Step Execution (Recommended for DBMS assignments)

Run the scripts in the following order:

```bash
# 1. Create database and tables
mysql -u root -p < database/schema.sql

# 2. Add performance indexes
mysql -u root -p blood_bank < database/indexes.sql

# 3. Create views
mysql -u root -p blood_bank < database/views.sql

# 4. Create stored procedures
mysql -u root -p blood_bank < database/procedures.sql

# 5. Populate sample seed data
mysql -u root -p blood_bank < database/seed.sql

# 6. Apply business rule triggers
mysql -u root -p blood_bank < database/triggers.sql
```
*(If your local MySQL root user has no password, omit the `-p` flag).*

---

### Option B: All-in-One Execution (Single Command)

Import the entire database in one go using the consolidated master script:

```bash
mysql -u root -p < database/blood_bank_complete.sql
```

---

### Option C: Using MySQL Workbench or phpMyAdmin

1. Open **MySQL Workbench** or **phpMyAdmin**.
2. Open `database/blood_bank_complete.sql` (or run each `.sql` file sequentially).
3. Execute the script.

---

## 📊 4. Database Schema & Tables

### 1. `blood_groups`
Master lookup table storing standard ABO and Rh blood groups.
- `blood_group_id` (`INT`, PK, Auto-increment)
- `group_name` (`VARCHAR(5)`, NOT NULL, UNIQUE) — `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### 2. `staff`
Staff members and administrators managing the blood bank system.
- `staff_id` (`INT`, PK, Auto-increment)
- `name` (`VARCHAR(100)`, NOT NULL)
- `role` (`VARCHAR(20)`, NOT NULL, DEFAULT `'Staff'`, CHECK `role IN ('Admin', 'Staff')`)
- `phone` (`VARCHAR(20)`)
- `email` (`VARCHAR(100)`, NOT NULL, UNIQUE)
- `password` (`VARCHAR(255)`, NOT NULL) — Supports plaintext or bcrypt hash

### 3. `hospitals`
Registered healthcare providers requesting blood supplies.
- `hospital_id` (`INT`, PK, Auto-increment)
- `name` (`VARCHAR(150)`, NOT NULL)
- `address` (`VARCHAR(255)`)
- `contact` (`VARCHAR(50)`, NOT NULL)
- `email` (`VARCHAR(100)`, UNIQUE)

### 4. `donors`
Registered volunteer blood donors.
- `donor_id` (`INT`, PK, Auto-increment)
- `name` (`VARCHAR(100)`, NOT NULL)
- `age` (`INT`, NOT NULL, CHECK `age >= 18 AND age <= 65`)
- `gender` (`VARCHAR(10)`, CHECK `gender IN ('Male', 'Female', 'Other')`)
- `phone` (`VARCHAR(20)`, NOT NULL, UNIQUE)
- `address` (`VARCHAR(255)`)
- `blood_group_id` (`INT`, NOT NULL, FK -> `blood_groups.blood_group_id`)
- `last_donation_date` (`DATE`, DEFAULT NULL)

### 5. `donations`
Donation events and laboratory screening results.
- `donation_id` (`INT`, PK, Auto-increment)
- `donor_id` (`INT`, NOT NULL, FK -> `donors.donor_id`)
- `blood_group_id` (`INT`, NOT NULL, FK -> `blood_groups.blood_group_id`)
- `donation_date` (`DATE`, NOT NULL)
- `quantity` (`INT`, NOT NULL, DEFAULT 1, CHECK `quantity > 0`)
- `screening_status` (`VARCHAR(20)`, NOT NULL, DEFAULT `'Pending'`, CHECK `screening_status IN ('Pending', 'Approved', 'Rejected')`)

### 6. `blood_units`
Individual blood units stored in cold inventory (whole blood standard shelf life: 42 days).
- `unit_id` (`INT`, PK, Auto-increment)
- `donation_id` (`INT`, NULL, FK -> `donations.donation_id`)
- `blood_group_id` (`INT`, NOT NULL, FK -> `blood_groups.blood_group_id`)
- `collection_date` (`DATE`, NOT NULL)
- `expiry_date` (`DATE`, NOT NULL, CHECK `expiry_date >= collection_date`)
- `status` (`VARCHAR(20)`, NOT NULL, DEFAULT `'Available'`, CHECK `status IN ('Available', 'Reserved', 'Issued', 'Expired')`)

### 7. `blood_requests`
Blood supply requisitions raised by hospitals.
- `request_id` (`INT`, PK, Auto-increment)
- `hospital_id` (`INT`, NOT NULL, FK -> `hospitals.hospital_id`)
- `blood_group_id` (`INT`, NOT NULL, FK -> `blood_groups.blood_group_id`)
- `quantity_required` (`INT`, NOT NULL, CHECK `quantity_required > 0`)
- `request_date` (`DATE`, NOT NULL)
- `urgency` (`VARCHAR(20)`, NOT NULL, DEFAULT `'Normal'`, CHECK `urgency IN ('Normal', 'Urgent', 'Critical')`)
- `status` (`VARCHAR(20)`, NOT NULL, DEFAULT `'Pending'`, CHECK `status IN ('Pending', 'Approved', 'Rejected', 'Completed')`)

### 8. `issues`
Atomic log of blood units dispensed to fulfill hospital requests.
- `issue_id` (`INT`, PK, Auto-increment)
- `request_id` (`INT`, NOT NULL, FK -> `blood_requests.request_id`)
- `unit_id` (`INT`, NOT NULL, UNIQUE, FK -> `blood_units.unit_id`)
- `issue_date` (`DATE`, NOT NULL)
- `issued_by` (`INT`, NULL, FK -> `staff.staff_id`)

---

## ⚡ 5. Triggers (`triggers.sql`)

1. **`trg_validate_unit_before_issue` (`BEFORE INSERT ON issues`):**
   - Validates that the unit exists and is currently `'Available'`.
   - Prevents issuing units that are already `'Issued'`, `'Reserved'`, or `'Expired'`.
   - Checks that unit expiry date has not passed relative to the issue date (`expiry_date >= NEW.issue_date`).
   - Ensures that the unit's blood group strictly matches the requested blood group.
   - Throws clear SQLSTATE `'45000'` error if any validation fails.

2. **`trg_update_unit_status_after_issue` (`AFTER INSERT ON issues`):**
   - Automatically synchronizes `blood_units.status = 'Issued'` when an issue row is created.

3. **`trg_update_donor_last_donation_date` (`AFTER INSERT ON donations`):**
   - Automatically updates `donors.last_donation_date = NEW.donation_date` when a donation is registered.

4. **`trg_check_unit_expiry_before_update` (`BEFORE UPDATE ON blood_units`):**
   - Rejects updating an expired unit's status to `'Issued'`.
   - Automatically marks `'Available'` units that have passed their expiry date as `'Expired'`.

---

## 🔍 6. Database Views (`views.sql`)

### 1. `available_blood_inventory`
Summary of all blood groups and their count of available, unexpired units:
```sql
SELECT * FROM available_blood_inventory;
```

### 2. `pending_requests`
Queue of hospital requests awaiting fulfillment, prioritized by urgency (`Critical` > `Urgent` > `Normal`):
```sql
SELECT * FROM pending_requests;
```

### 3. `recent_donations`
Latest donations log including donor name, blood group, date, quantity, and laboratory screening status:
```sql
SELECT * FROM recent_donations;
```

### 4. `comprehensive_blood_inventory`
Granular breakdown showing available, reserved, issued, expired, and total counts for every blood group:
```sql
SELECT * FROM comprehensive_blood_inventory;
```

### 5. `blood_issues_summary`
Audit trail of blood unit dispatches with hospital, unit, blood group, issue date, and issuing staff name:
```sql
SELECT * FROM blood_issues_summary;
```

---

## ⚙️ 7. Stored Procedures (`procedures.sql`)

### 1. `get_available_blood()`
Fetches available, reserved, issued, and expired stock counts across all blood groups.
```sql
CALL get_available_blood();
```

### 2. `get_hospital_requests(p_hospital_id)`
Fetches request history for a specific hospital (or all hospitals if `NULL` is provided).
```sql
-- Specific hospital requests:
CALL get_hospital_requests(1);

-- All hospital requests:
CALL get_hospital_requests(NULL);
```

### 3. `get_donor_history(p_donor_id)`
Returns donor profile metrics (total donations, units donated, last date) and the full donation breakdown.
```sql
CALL get_donor_history(1);
```

### 4. `issue_blood_unit(p_request_id, p_unit_id, p_issued_by)`
Performs an atomic issuance transaction: records the issue, triggers unit status change to `'Issued'`, and marks the blood request as `'Completed'` once required quantity is met.
```sql
CALL issue_blood_unit(1, 10, 1);
```

### 5. `mark_expired_units()`
Maintenance utility to flag past-due inventory units as `'Expired'`.
```sql
CALL mark_expired_units();
```

---

## 🧪 8. Verification & Quick Test Queries

After importing, test the installation with the following queries:

```sql
USE blood_bank;

-- Verify table row counts (all >= 5)
SELECT 'blood_groups' AS tbl, COUNT(*) AS total_rows FROM blood_groups
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'donors', COUNT(*) FROM donors
UNION ALL
SELECT 'donations', COUNT(*) FROM donations
UNION ALL
SELECT 'blood_units', COUNT(*) FROM blood_units
UNION ALL
SELECT 'blood_requests', COUNT(*) FROM blood_requests
UNION ALL
SELECT 'issues', COUNT(*) FROM issues;

-- Test View
SELECT * FROM available_blood_inventory;

-- Test Procedure
CALL get_available_blood();

-- Test Donor History Procedure
CALL get_donor_history(1);
```

---

## 🤝 9. Backend Integration Compatibility

All table names, column names, casing, and types match the Express REST API backend controllers:
- `blood_groups` (`blood_group_id`, `group_name`)
- `donors` (`donor_id`, `name`, `age`, `gender`, `phone`, `address`, `blood_group_id`, `last_donation_date`)
- `donations` (`donation_id`, `donor_id`, `blood_group_id`, `donation_date`, `quantity`, `screening_status`)
- `blood_units` (`unit_id`, `donation_id`, `blood_group_id`, `collection_date`, `expiry_date`, `status`)
- `hospitals` (`hospital_id`, `name`, `address`, `contact`, `email`)
- `blood_requests` (`request_id`, `hospital_id`, `blood_group_id`, `quantity_required`, `request_date`, `urgency`, `status`)
- `issues` (`issue_id`, `request_id`, `unit_id`, `issue_date`, `issued_by`)
- `staff` (`staff_id`, `name`, `role`, `phone`, `email`, `password`)
