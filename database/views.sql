-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - DATABASE VIEWS
-- File: views.sql
-- Database: blood_bank
-- Description: Standard reporting and operational views
-- =====================================================================

USE blood_bank;

-- =====================================================================
-- 1. available_blood_inventory
-- Required View:
-- Shows: Blood Group, Available Units (unexpired and available)
-- =====================================================================
CREATE OR REPLACE VIEW available_blood_inventory AS
SELECT 
    bg.blood_group_id,
    bg.group_name AS blood_group,
    COUNT(CASE 
        WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 
    END) AS available_units
FROM blood_groups bg
LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
GROUP BY bg.blood_group_id, bg.group_name
ORDER BY bg.blood_group_id ASC;

-- =====================================================================
-- 2. pending_requests
-- Required View:
-- Shows: Hospital, Blood Group, Quantity, Urgency, Request Date, Status
-- =====================================================================
CREATE OR REPLACE VIEW pending_requests AS
SELECT 
    br.request_id,
    h.name AS hospital_name,
    h.contact AS hospital_contact,
    bg.group_name AS blood_group,
    br.quantity_required,
    br.urgency,
    br.request_date,
    br.status
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
WHERE br.status = 'Pending'
ORDER BY 
    FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'),
    br.request_date ASC;

-- =====================================================================
-- 3. recent_donations
-- Required View:
-- Shows: Donor, Blood Group, Donation Date, Quantity, Screening Status
-- =====================================================================
CREATE OR REPLACE VIEW recent_donations AS
SELECT 
    d.donation_id,
    dn.name AS donor_name,
    dn.phone AS donor_phone,
    bg.group_name AS blood_group,
    d.donation_date,
    d.quantity,
    d.screening_status
FROM donations d
JOIN donors dn ON d.donor_id = dn.donor_id
JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
ORDER BY d.donation_date DESC, d.donation_id DESC;

-- =====================================================================
-- 4. comprehensive_blood_inventory
-- Extended View:
-- Complete breakdown of Available, Reserved, Issued, Expired, and Total
-- units per blood group.
-- =====================================================================
CREATE OR REPLACE VIEW comprehensive_blood_inventory AS
SELECT 
    bg.blood_group_id,
    bg.group_name AS blood_group,
    COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units,
    COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
    COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
    COUNT(CASE WHEN bu.status = 'Expired' OR (bu.status = 'Available' AND bu.expiry_date < CURDATE()) THEN 1 END) AS expired_units,
    COUNT(bu.unit_id) AS total_units
FROM blood_groups bg
LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
GROUP BY bg.blood_group_id, bg.group_name
ORDER BY bg.blood_group_id ASC;

-- =====================================================================
-- 5. blood_issues_summary
-- Extended View:
-- Comprehensive audit record of all units issued to hospitals.
-- =====================================================================
CREATE OR REPLACE VIEW blood_issues_summary AS
SELECT 
    i.issue_id,
    i.request_id,
    h.name AS hospital_name,
    h.contact AS hospital_contact,
    bg.group_name AS blood_group,
    i.unit_id,
    bu.collection_date,
    bu.expiry_date,
    i.issue_date,
    i.issued_by,
    COALESCE(s.name, 'System') AS issued_by_name
FROM issues i
JOIN blood_requests br ON i.request_id = br.request_id
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN blood_units bu ON i.unit_id = bu.unit_id
JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
LEFT JOIN staff s ON i.issued_by = s.staff_id
ORDER BY i.issue_date DESC, i.issue_id DESC;
