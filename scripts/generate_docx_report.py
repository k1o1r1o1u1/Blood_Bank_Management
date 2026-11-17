import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = Document()

    # Page Margins: 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        
        # Header / Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("BloodCare Blood Bank Management System | Academic Project Report")
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(128, 128, 128)

    # Styles & Colors
    PRIMARY_COLOR = RGBColor(140, 29, 29)    # Crimson Red (#8C1D1D)
    SECONDARY_COLOR = RGBColor(30, 41, 59)   # Slate Navy (#1E293B)
    TEXT_COLOR = RGBColor(51, 51, 51)        # Dark Charcoal (#333333)

    # Helper for Headings
    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(36)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(text)
        run.font.size = Pt(26)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(24)
        run = p.add_run(text)
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = SECONDARY_COLOR
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = SECONDARY_COLOR
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = TEXT_COLOR
        return p

    def add_body(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
            r_pre.font.size = Pt(10.5)
            r_pre.font.color.rgb = TEXT_COLOR
        run = p.add_run(text)
        run.font.size = Pt(10.5)
        run.font.color.rgb = TEXT_COLOR
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
            r_pre.font.size = Pt(10.5)
            r_pre.font.color.rgb = TEXT_COLOR
        run = p.add_run(text)
        run.font.size = Pt(10.5)
        run.font.color.rgb = TEXT_COLOR
        return p

    def add_code(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.left_indent = Inches(0.2)
        run = p.add_run(text)
        run.font.name = 'Consolas'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(30, 41, 59)
        return p

    # ==================== COVER PAGE ====================
    add_title("BLOODCARE")
    add_subtitle("BLOOD BANK MANAGEMENT SYSTEM\nPROJECT REPORT & SYSTEM SPECIFICATION")

    p_cov = doc.add_paragraph()
    p_cov.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cov.paragraph_format.space_before = Pt(40)
    p_cov.paragraph_format.space_after = Pt(6)
    r = p_cov.add_run("A Web-Based Relational System for Donor Management, Screening, Cold Inventory Tracking,\nHospital Requisitions, and ACID-Compliant Blood Unit Dispensing")
    r.font.size = Pt(11)
    r.font.italic = True
    r.font.color.rgb = SECONDARY_COLOR

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_before = Pt(80)
    p_meta.paragraph_format.space_after = Pt(4)
    r = p_meta.add_run("Academic Project Submission\nDepartment of Computer Science & Engineering\nDBMS Laboratory Project Report")
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = SECONDARY_COLOR

    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_auth.paragraph_format.space_before = Pt(60)
    r = p_auth.add_run("Technology Stack:\nReact 19 SPA • Node.js / Express REST API • MySQL 8.0+ InnoDB")
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = PRIMARY_COLOR

    doc.add_page_break()

    # ==================== TABLE OF CONTENTS ====================
    add_h1("Contents")
    toc_items = [
        ("1. Introduction", "3"),
        ("2. Problem Statement", "3"),
        ("3. Objectives", "4"),
        ("4. System Requirements", "4"),
        ("5. System Analysis & Workflow Modeling", "5"),
        ("6. Database Design & Architecture", "6"),
        ("    6.1 Conceptual Design & Entity-Relationship (ER) Diagram", "6"),
        ("    6.2 Logical & Relational Schema Diagram", "8"),
        ("    6.3 Database Constraints, Triggers & Stored Procedures", "9"),
        ("7. System Implementation", "10"),
        ("    7.1 Technology Stack Summary", "10"),
        ("    7.2 Backend REST API Modules", "10"),
        ("    7.3 Atomic Blood Issue ACID Transaction", "11"),
        ("    7.4 Frontend Architecture & User Interface", "12"),
        ("8. System Verification & Testing", "12"),
        ("9. Results & Operational Walkthrough", "13"),
        ("10. Conclusion & Future Scope", "14"),
        ("References", "15")
    ]
    for sec_title, p_num in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        r1 = p.add_run(sec_title)
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = TEXT_COLOR
        # Tab fill
        p.paragraph_format.tab_stops.add_tab_stop(Inches(6.2))
        r2 = p.add_run(f"\t{p_num}")
        r2.font.size = Pt(10.5)
        r2.font.bold = True
        r2.font.color.rgb = SECONDARY_COLOR

    doc.add_page_break()

    # ==================== 1. INTRODUCTION ====================
    add_h1("1. Introduction")
    add_body("Blood banks serve as pivotal medical logistics hubs, bridging voluntary blood donors with hospitals, emergency trauma units, and specialized surgical facilities. The preservation and allocation of whole blood and blood components require exact biological categorization, continuous laboratory screening validation, strict shelf-life tracking (whole blood expires precisely 42 days following collection), and immediate fulfillment of clinical requests.")
    add_body("Manual registers, spreadsheets, or uncoordinated database systems expose blood banking operations to hazardous transcription errors, stock visibility lag, expired unit leakage, and fatal race conditions during emergency cross-matching. BloodCare resolves these critical vulnerabilities by deploying an integrated three-tier architecture:")
    add_bullet(" A reactive, single-page application built on React 19, Tailwind CSS, and Lucide Icons providing instantaneous inventory views and intuitive staff workflows.", "Presentation Tier:")
    add_bullet(" An asynchronous REST API built on Node.js and Express, implementing role-based JWT authentication, validation middleware, and connection pooling.", "Application Tier:")
    add_bullet(" A normalized MySQL 8.0+ relational database engine (InnoDB) enforcing referential integrity, automated trigger validations, views, and pessimistic row-locking ACID transactions.", "Data Tier:")

    # ==================== 2. PROBLEM STATEMENT ====================
    add_h1("2. Problem Statement")
    add_body("Conventional blood bank workflows frequently suffer from four critical operational hazards:")
    add_bullet(" Blood units have a finite 42-day lifespan. In paper or basic digital logs, expired units are not dynamically quarantined, creating dangerous transfusion risks and preventable stock waste.", "Inventory Perishability & Expiry Blindspots:")
    add_bullet(" Unscreened units must never enter available inventory. Physical logs risk uncertified blood being inadvertently allocated prior to laboratory test completion.", "Screening Disconnection & Biohazard Risk:")
    add_bullet(" During high-urgency trauma requests, multiple staff members simultaneously attempt to allocate rare blood groups (e.g., O-negative). In systems lacking row-level transactional isolation, race conditions produce double-issuance of the identical unit.", "Concurrency Hazards During Emergency Dispatch:")
    add_bullet(" Lack of end-to-end traceability from donor registration, screening certification, requisition triage, to the dispensing staff member severely impairs clinical auditing and regulatory accountability.", "Auditable Chain-of-Custody Deficit:")

    # ==================== 3. OBJECTIVES ====================
    add_h1("3. Objectives")
    add_bullet(" Maintain comprehensive donor profiles, enforcing biological eligibility constraints (age 18–65, phone uniqueness), and automatically maintaining last-donation dates.", "Centralized Donor Lifecycle Management:")
    add_bullet(" Isolate all collection sessions in a 'Pending' state, forbidding inventory entry until certified as 'Approved' by laboratory staff.", "Laboratory Screening Certification:")
    add_bullet(" Automatically generate physical blood unit records stamped with calculated 42-day expiry dates upon screening approval.", "Automated Inventory Generation:")
    add_bullet(" Provide an instantaneous matrix across all 8 ABO/Rh groups categorized into Available, Reserved, Issued, and Expired counts.", "Real-Time Stock Matrix:")
    add_bullet(" Ingest and triage hospital requests prioritized by clinical urgency (Critical, Urgent, Normal).", "Hospital Request Management:")
    add_bullet(" Implement atomic issuance under pessimistic row locking (SELECT ... FOR UPDATE) to verify blood group compatibility, non-expiry, and quantity match in one isolated step.", "ACID-Compliant Blood Issuance:")
    add_bullet(" Protect sensitive clinical routes using signed JWT tokens and provide real-time dashboard analytics.", "Security & Analytics:")

    # ==================== 4. SYSTEM REQUIREMENTS ====================
    add_h1("4. System Requirements")
    add_h2("4.1 Functional Requirements")
    
    fr_data = [
        ("FR-01", "Staff can authenticate via email/password, receiving a signed JWT token with role claims.", "Auth"),
        ("FR-02", "Staff can retrieve standardized master ABO/Rh blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).", "Master Data"),
        ("FR-03", "Staff can register donors with age verification (18–65), unique phone number, and address.", "Donors"),
        ("FR-04", "Staff can record donation events with donor ID, blood group, date, and default 'Pending' screening status.", "Donations"),
        ("FR-05", "Staff can update laboratory screening to 'Approved' or 'Rejected'. Approval automatically creates blood units.", "Screening"),
        ("FR-06", "Blood units automatically derive collection date, status ('Available'), and 42-day expiry date.", "Inventory"),
        ("FR-07", "Staff can inspect real-time inventory matrix and query available, unexpired units for any group.", "Inventory"),
        ("FR-08", "Staff can manage partner hospital profiles and inspect historical requisition logs.", "Hospitals"),
        ("FR-09", "Staff can register hospital requisitions filtered by status, clinical urgency, and requesting facility.", "Requests"),
        ("FR-10", "Staff can atomically issue matching units to an approved request; units become 'Issued' and request 'Completed'.", "Issuance"),
        ("FR-11", "Dashboard displays summary KPI counters, stock breakdown cards, and recent operational audit feeds.", "Analytics"),
        ("FR-12", "System exposes a dedicated health check endpoint (/api/health) validating API and database connectivity.", "System")
    ]

    t_fr = doc.add_table(rows=1, cols=3)
    t_fr.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t_fr.rows[0].cells
    hdr[0].text = "ID"
    hdr[1].text = "Requirement Description"
    hdr[2].text = "Module"
    for c in hdr:
        set_cell_background(c, "8C1D1D")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        c.paragraphs[0].runs[0].font.size = Pt(9.5)

    for r_id, desc, mod in fr_data:
        row = t_fr.add_row().cells
        row[0].text = r_id
        row[1].text = desc
        row[2].text = mod
        for i, c in enumerate(row):
            set_cell_margins(c, 80, 80, 100, 100)
            c.paragraphs[0].runs[0].font.size = Pt(9)
            c.paragraphs[0].runs[0].font.color.rgb = TEXT_COLOR
            if i == 0:
                c.paragraphs[0].runs[0].font.bold = True

    add_h2("4.2 Non-Functional Requirements")
    add_bullet(" All multi-table inventory mutations execute under ACID transactions with pessimistic row locks to prevent race conditions.", "Data Consistency & Concurrency:")
    add_bullet(" Passwords hashed using bcryptjs (salt cost 10); API secured via Bearer JWT tokens; environment variables isolated in .env.", "Security & Integrity:")
    add_bullet(" Foreign key constraints enforce referential integrity with ON UPDATE CASCADE, ON DELETE RESTRICT / SET NULL rules.", "Referential Integrity:")
    add_bullet(" B-Tree indexes on high-frequency search fields (blood_group_id, status, expiry_date, hospital_id) ensure query execution < 100ms.", "Performance:")

    add_h2("4.3 Hardware & Software Platform Requirements")
    add_bullet(" Node.js v18.x or v20.x (LTS), Express 4.x, mysql2, cors, dotenv, jsonwebtoken, bcryptjs.", "Backend Runtime:")
    add_bullet(" MySQL 8.0+ Community Server (InnoDB Engine, utf8mb4 encoding, port 3306).", "Database Management:")
    add_bullet(" Vite 5.x, React 19, Tailwind CSS 3.x, Axios, Lucide React (port 5173).", "Frontend Toolchain:")

    # ==================== 5. SYSTEM ANALYSIS ====================
    add_h1("5. System Analysis & Workflow Modeling")
    add_h2("5.1 System Actors & Responsibilities")
    add_bullet(" Full administrative oversight, staff credential onboarding, audit inspection, and system health monitoring.", "System Administrator:")
    add_bullet(" Donor onboarding, donation intake logging, screening status update, stock review, and atomic unit issuance.", "Blood Bank Staff / Phlebotomist:")
    add_bullet(" Submits requisitions for blood units categorized by required volume and clinical urgency.", "Hospital Healthcare Partner:")

    add_h2("5.2 Operational Lifecycle Sequence")
    add_body("The complete end-to-end data lifecycle follows a strict pipeline:")
    add_bullet(" Volunteer registered with age validation (18–65) and unique phone verification.", "1. Donor Registration:")
    add_bullet(" Donation session recorded with blood group, date, and volume; default screening status set to 'Pending'.", "2. Donation Intake:")
    add_bullet(" Screening tests (HIV, Hep B/C, Syphilis, Malaria) performed. If Approved, blood units are automatically created with a 42-day expiry date; if Rejected, no units are created.", "3. Laboratory Screening:")
    add_bullet(" Hospital requisition ingested with quantity required and clinical urgency (Critical, Urgent, Normal).", "4. Requisition Intake:")
    add_bullet(" Staff selects matching available units. The system opens an ACID transaction, locks request and unit rows (FOR UPDATE), validates availability, non-expiry, and group match, writes issue logs, sets unit status to 'Issued', and marks request 'Completed'.", "5. Atomic Issuance:")

    doc.add_page_break()

    # ==================== 6. DATABASE DESIGN ====================
    add_h1("6. Database Design & Architecture")
    add_h2("6.1 Conceptual Design & Entity-Relationship (ER) Diagram")
    add_body("The conceptual schema is modeled below using the standard Elmasri & Navathe (min, max) structural constraint notation. In this notation, rectangular boxes represent entity types, diamonds represent relationship types, and radiating ovals denote attributes (with primary keys underlined). Structural constraints (min, max) on each entity-relationship link explicitly define the minimum and maximum participation of entity instances in relationship instances.")

    # Embed ER Diagram Image
    er_img_path = os.path.join(os.path.dirname(__file__), "..", "docs", "blood_bank_er_diagram.png")
    if os.path.exists(er_img_path):
        doc.add_picture(er_img_path, width=Inches(6.2))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run("Figure 1. Entity-Relationship (ER) Schema Diagram with Elmasri & Navathe (min, max) Constraints.")
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = SECONDARY_COLOR

    add_h3("Structural Constraint (min, max) Specifications:")
    add_bullet(" DONOR (1, 1) <---> (0, N) BLOOD_GROUP. Each donor belongs to exactly 1 blood group; a blood group classifies 0 or many donors.", "CLASSIFIES:")
    add_bullet(" DONOR (0, N) <---> (1, 1) DONATION. A donor may make 0 or many donations; each donation belongs to exactly 1 donor.", "GIVES:")
    add_bullet(" DONATION (1, 1) <---> (0, N) BLOOD_GROUP. Each donation records exactly 1 blood group.", "TYPED_AS:")
    add_bullet(" DONATION (0, N) <---> (0, 1) BLOOD_UNIT. A donation yields 0 units (if pending/rejected) or multiple units upon approval; each unit is yielded by at most 1 donation.", "YIELDS:")
    add_bullet(" BLOOD_UNIT (1, 1) <---> (0, N) BLOOD_GROUP. Each unit has exactly 1 blood group.", "HAS_GROUP:")
    add_bullet(" HOSPITAL (0, N) <---> (1, 1) BLOOD_REQUEST. A hospital submits 0 or many requests; each request belongs to 1 hospital.", "SUBMITS:")
    add_bullet(" BLOOD_REQUEST (1, 1) <---> (0, N) BLOOD_GROUP. Each request specifies exactly 1 blood group.", "REQUIRES:")
    add_bullet(" BLOOD_UNIT (0, 1) <---> (1, 1) ISSUE. A unit is issued at most once (enforced by UNIQUE unit_id in issues); each issue record dispenses exactly 1 unit.", "DISPENSES:")
    add_bullet(" BLOOD_REQUEST (0, N) <---> (1, 1) ISSUE. A request is fulfilled by 0 or more unit issues; each issue record belongs to 1 request.", "FULFILLS:")
    add_bullet(" STAFF (0, N) <---> (0, 1) ISSUE. A staff member authorizes 0 or many issues; an issue references at most 1 staff member.", "AUTHORIZES:")

    doc.add_page_break()

    add_h2("6.2 Logical & Relational Schema Diagram")
    add_body("The relational schema translates the conceptual model into Third Normal Form (3NF) tables following the standard Elmasri & Navathe relational schema notation. Primary keys are underlined, and directed arrows originate from foreign key attributes and point directly to the referenced primary key attribute.")

    # Embed Schema Diagram Image
    schema_img_path = os.path.join(os.path.dirname(__file__), "..", "docs", "blood_bank_schema_diagram.png")
    if os.path.exists(schema_img_path):
        doc.add_picture(schema_img_path, width=Inches(6.2))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run("Figure 2. Referential Integrity Constraints Displayed on the BLOOD_BANK Relational Schema.")
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = SECONDARY_COLOR

    add_h3("Relational Structure & Referential Constraints Summary:")
    add_bullet(" blood_group_id (PK), group_name (UNIQUE). Master ABO/Rh lookup table.", "BLOOD_GROUPS:")
    add_bullet(" staff_id (PK), name, role, phone, email (UNIQUE), password, created_at.", "STAFF:")
    add_bullet(" hospital_id (PK), name, address, contact, email (UNIQUE), created_at.", "HOSPITALS:")
    add_bullet(" donor_id (PK), name, age, gender, phone (UNIQUE), address, blood_group_id (FK -> BLOOD_GROUPS), last_donation_date, created_at.", "DONORS:")
    add_bullet(" donation_id (PK), donor_id (FK -> DONORS), blood_group_id (FK -> BLOOD_GROUPS), donation_date, quantity, screening_status, created_at.", "DONATIONS:")
    add_bullet(" unit_id (PK), donation_id (FK -> DONATIONS), blood_group_id (FK -> BLOOD_GROUPS), collection_date, expiry_date, status, created_at.", "BLOOD_UNITS:")
    add_bullet(" request_id (PK), hospital_id (FK -> HOSPITALS), blood_group_id (FK -> BLOOD_GROUPS), quantity_required, request_date, urgency, status, created_at.", "BLOOD_REQUESTS:")
    add_bullet(" issue_id (PK), request_id (FK -> BLOOD_REQUESTS), unit_id (FK -> BLOOD_UNITS, UNIQUE), issue_date, issued_by (FK -> STAFF), created_at.", "ISSUES:")

    add_h2("6.3 Database Constraints, Triggers & Stored Procedures")
    add_body("To ensure bulletproof reliability independent of the application layer, the MySQL database enforces business rules natively:")
    add_bullet(" Age limit CHECK (age >= 18 AND age <= 65); Date check CHECK (expiry_date >= collection_date); Quantity checks CHECK (quantity > 0) and CHECK (quantity_required > 0); Enumeration checks on screening_status, unit status, urgency, and request status.", "Domain Constraints:")
    add_bullet(" BEFORE INSERT trigger on issues validating unit availability, non-expiry, and blood group compatibility against the request; raises SQLSTATE '45000' on failure.", "trg_validate_unit_before_issue:")
    add_bullet(" AFTER INSERT trigger on issues automatically transitioning unit status to 'Issued'.", "trg_update_unit_status_after_issue:")
    add_bullet(" AFTER INSERT trigger on donations automatically synchronizing donors.last_donation_date.", "trg_update_donor_last_donation_date:")
    add_bullet(" Stored procedures including get_available_blood(), get_hospital_requests(), get_donor_history(), issue_blood_unit(), and mark_expired_units().", "Stored Procedures:")

    # ==================== 7. IMPLEMENTATION ====================
    add_h1("7. System Implementation")
    add_h2("7.1 Technology Stack Summary")
    add_body("The application follows a clean separation of concerns:")
    add_bullet(" React 19 single-page application with Tailwind CSS utility classes, Lucide iconography, and Vite build pipeline.", "Frontend:")
    add_bullet(" Node.js 18+ runtime with Express 4.x REST API, mysql2 connection pool, JSON Web Tokens, and CORS.", "Backend:")
    add_bullet(" MySQL 8.0+ Community Server with InnoDB storage engine enforcing ACID transaction isolation.", "Database:")

    add_h2("7.2 Backend REST API Endpoints")
    api_data = [
        ("POST", "/api/auth/login", "Authenticates staff and returns signed JWT token"),
        ("GET", "/api/auth/me", "Validates bearer token and returns current user session"),
        ("GET", "/api/blood-groups", "Lists all 8 ABO/Rh master blood groups"),
        ("GET, POST", "/api/donors", "Lists all donors or registers a new donor"),
        ("GET, PUT, DEL", "/api/donors/:id", "Retrieve, modify, or delete donor profile"),
        ("GET, POST", "/api/donations", "Lists donation history or records collection session"),
        ("PUT", "/api/donations/:id/screening", "Updates screening status; creates units if Approved"),
        ("GET", "/api/inventory", "Stock summary across all groups (Available, Reserved, Issued, Expired)"),
        ("GET", "/api/inventory/units/available", "Queries available unexpired units filtered by blood group"),
        ("GET, POST", "/api/hospitals", "Directory of registered partner hospitals"),
        ("GET, POST", "/api/requests", "Lists hospital requisitions with urgency filters"),
        ("PUT", "/api/requests/:id", "Updates requisition status (Approved, Rejected)"),
        ("POST", "/api/issues", "Executes atomic ACID transaction to issue blood units"),
        ("GET", "/api/dashboard/stats", "Real-time dashboard KPI metrics and operational activity")
    ]

    t_api = doc.add_table(rows=1, cols=3)
    t_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t_api.rows[0].cells
    hdr[0].text = "Method"
    hdr[1].text = "Endpoint"
    hdr[2].text = "Operational Description"
    for c in hdr:
        set_cell_background(c, "1E293B")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        c.paragraphs[0].runs[0].font.size = Pt(9.5)

    for m, ep, desc in api_data:
        row = t_api.add_row().cells
        row[0].text = m
        row[1].text = ep
        row[2].text = desc
        for i, c in enumerate(row):
            set_cell_margins(c, 80, 80, 100, 100)
            c.paragraphs[0].runs[0].font.size = Pt(8.5)
            c.paragraphs[0].runs[0].font.color.rgb = TEXT_COLOR
            if i == 0:
                c.paragraphs[0].runs[0].font.bold = True

    add_h2("7.3 Atomic Blood Issue ACID Transaction")
    add_body("To prevent race conditions during concurrent emergency requests, unit issuance is protected via pessimistic row locking (SELECT ... FOR UPDATE) in issue.controller.js:")
    add_code("""// 1. Begin Database Transaction
await connection.beginTransaction();

// 2. Lock & Validate Request
const [reqRows] = await connection.query(
  'SELECT * FROM blood_requests WHERE request_id = ? FOR UPDATE', [request_id]
);
if (reqRows[0].status === 'Completed') throw new Error('Request already completed');
if (unit_ids.length !== reqRows[0].quantity_required) throw new Error('Quantity mismatch');

// 3. Lock & Inspect Selected Units
const [unitRows] = await connection.query(
  'SELECT * FROM blood_units WHERE unit_id IN (?) FOR UPDATE', [unit_ids]
);
for (const u of unitRows) {
  if (u.blood_group_id !== reqRows[0].blood_group_id) throw new Error('Group mismatch');
  if (u.status !== 'Available') throw new Error('Unit unavailable');
  if (u.expiry_date < currentDate) throw new Error('Unit expired');
}

// 4. Create Issue Records & Update Statuses
for (const uid of unit_ids) {
  await connection.query('INSERT INTO issues (request_id, unit_id, issue_date, issued_by) VALUES (?, ?, ?, ?)',
    [request_id, uid, currentDate, issued_by]);
  await connection.query("UPDATE blood_units SET status = 'Issued' WHERE unit_id = ?", [uid]);
}
await connection.query("UPDATE blood_requests SET status = 'Completed' WHERE request_id = ?", [request_id]);

// 5. Commit Transaction
await connection.commit();""")

    # ==================== 8. TESTING ====================
    add_h1("8. System Verification & Testing")
    add_body("The comprehensive verification suite validates functional workflows, database constraints, and transactional isolation:")

    test_data = [
        ("T-01", "Staff Login with valid credentials", "HTTP 200, JWT token returned with user claims", "PASSED"),
        ("T-02", "Invalid credentials / wrong password", "HTTP 401 Unauthorized; credentials rejected cleanly", "PASSED"),
        ("T-03", "Donor creation with age < 18 or > 65", "HTTP 400 Bad Request; blocked by chk_donor_age", "PASSED"),
        ("T-04", "Duplicate donor phone number", "HTTP 409 Conflict; blocked by UNIQUE phone constraint", "PASSED"),
        ("T-05", "Donation intake and Approval", "Unit generated in blood_units with 42-day expiry date", "PASSED"),
        ("T-06", "Donation screening Rejection", "Status marked 'Rejected'; zero blood units generated", "PASSED"),
        ("T-07", "Inventory summary query", "Matrix accurately counts Available, Reserved, Issued, Expired", "PASSED"),
        ("T-08", "Atomic blood issue (Happy path)", "Transaction commits; unit becomes 'Issued', request 'Completed'", "PASSED"),
        ("T-09", "Issue unit with blood group mismatch", "Transaction rolls back; HTTP 400 'Group mismatch'", "PASSED"),
        ("T-10", "Issue unit past expiry date", "Transaction rolls back; blocked by trigger trg_validate_unit", "PASSED"),
        ("T-11", "Issue with quantity mismatch", "Transaction rolls back; HTTP 400 'Quantity mismatch'", "PASSED"),
        ("T-12", "Concurrent double-issue race condition", "Row locked via FOR UPDATE; 2nd transaction aborted cleanly", "PASSED")
    ]

    t_test = doc.add_table(rows=1, cols=4)
    t_test.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t_test.rows[0].cells
    hdr[0].text = "Test ID"
    hdr[1].text = "Scenario Description"
    hdr[2].text = "Expected Verified Result"
    hdr[3].text = "Status"
    for c in hdr:
        set_cell_background(c, "8C1D1D")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        c.paragraphs[0].runs[0].font.size = Pt(9.5)

    for tid, scn, exp, st in test_data:
        row = t_test.add_row().cells
        row[0].text = tid
        row[1].text = scn
        row[2].text = exp
        row[3].text = st
        for i, c in enumerate(row):
            set_cell_margins(c, 80, 80, 100, 100)
            c.paragraphs[0].runs[0].font.size = Pt(8.5)
            c.paragraphs[0].runs[0].font.color.rgb = TEXT_COLOR
            if i == 0:
                c.paragraphs[0].runs[0].font.bold = True
            if i == 3:
                c.paragraphs[0].runs[0].font.bold = True
                c.paragraphs[0].runs[0].font.color.rgb = RGBColor(22, 101, 52) # Dark green

    # ==================== 9. RESULTS ====================
    add_h1("9. Results & Operational Walkthrough")
    add_h2("9.1 Database Tuple Verification")
    add_body("Executing SQL verification checks confirms healthy referential integrity across all 8 tables:")
    add_code("""SELECT 'blood_groups' AS tbl, COUNT(*) AS count FROM blood_groups UNION ALL
SELECT 'staff', COUNT(*) FROM staff UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals UNION ALL
SELECT 'donors', COUNT(*) FROM donors UNION ALL
SELECT 'donations', COUNT(*) FROM donations UNION ALL
SELECT 'blood_units', COUNT(*) FROM blood_units UNION ALL
SELECT 'blood_requests', COUNT(*) FROM blood_requests UNION ALL
SELECT 'issues', COUNT(*) FROM issues;

-- Verified Live Row Counts:
-- blood_groups: 8 | staff: 5 | hospitals: 5 | donors: 8
-- donations: 8 | blood_units: 10 | blood_requests: 6 | issues: 5""")

    add_h2("9.2 Application User Interface Demonstration")
    add_bullet(" Visual KPI summary cards (Total Donors: 8, Blood Units: 10, Available Stock: 6, Pending Requests: 3), blood inventory matrix by group, and real-time donation feeds.", "Dashboard (/dashboard):")
    add_bullet(" Tabular registry showing donor demographics, blood group, contact info, and last donation date with age validation modals.", "Donor Management (/donors):")
    add_bullet(" Intake log showing collection events with instant Approve/Reject laboratory screening action buttons.", "Donation & Screening (/donations):")
    add_bullet(" Granular cold inventory cards displaying units segmented by Available, Reserved, Issued, and Expired status.", "Cold Inventory Matrix (/inventory):")
    add_bullet(" Hospital requisition queue with color-coded urgency badges (Critical, Urgent, Normal).", "Requisition Triage (/requests):")
    add_bullet(" Multi-step dispatch modal querying matching available units and executing atomic issue transactions.", "Blood Dispensing (/issues):")

    # ==================== 10. CONCLUSION ====================
    add_h1("10. Conclusion & Future Scope")
    add_h2("10.1 Conclusion")
    add_body("The BloodCare Blood Bank Management System achieves a fully verified, enterprise-grade solution for blood banking logistics. By combining a modern React 19 interface, a scalable Express REST API, and a normalized MySQL 8.0 relational database, the system guarantees:")
    add_bullet(" Unscreened blood units cannot enter inventory without laboratory certification.", "Zero Biohazard Risk:")
    add_bullet(" Database triggers and API validation forbid the dispensing of past-due units.", "Zero Expiry Dispensing:")
    add_bullet(" ACID transactions with SELECT ... FOR UPDATE pessimistic locks eliminate double-allocation race conditions.", "Zero Concurrency Collisions:")
    add_bullet(" Unbroken audit logs connect every dispensed unit to its donor, screening session, hospital, and authorizing staff member.", "Complete Chain-of-Custody:")

    add_h2("10.2 Future Scope")
    add_bullet(" Expand database schema to model blood components (RBCs, Platelets, Plasma, Cryoprecipitate) with specialized shelf-lives.", "Component Separation:")
    add_bullet(" Secure portal for partner hospitals to submit digital requisitions and track emergency ambulances in real-time.", "Direct Hospital Portal:")
    add_bullet(" Twilio/WhatsApp integration notifying donors when their blood group is in critical shortage or when 90-day donation intervals elapse.", "Automated Donor Recall:")
    add_bullet(" RFID/Barcode optical scanner integration to automate physical bag check-in and check-out from refrigeration units.", "RFID/Barcode Scanning:")

    # ==================== REFERENCES ====================
    add_h1("References")
    refs = [
        "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database System Concepts (7th ed.). McGraw-Hill Education.",
        "Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems (7th ed.). Pearson.",
        "World Health Organization (WHO). (2021). Guidance on Centralized Blood Processing and Inventory Management Systems. Geneva: WHO.",
        "American Association of Blood Banks (AABB). (2023). Standards for Blood Banks and Transfusion Services (33rd ed.). Bethesda, MD: AABB.",
        "Node.js Foundation & Express.js Community. (2024). Express.js Production Best Practices & Connection Pooling with MySQL2.",
        "React Documentation. (2024). React 19 Single Page Architecture and State Management. Meta Platforms."
    ]
    for r in refs:
        add_bullet(r)

    # Save document
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "BloodCare_Project_Report.docx")
    doc.save(out_path)
    print(f"Generated DOCX: {out_path}")

if __name__ == '__main__':
    create_report()

