import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_schema():
    # Figure setup - optimized bounds for tight, clean presentation
    fig, ax = plt.subplots(figsize=(15.5, 17), dpi=300)
    ax.set_xlim(0, 1550)
    ax.set_ylim(200, 1950)
    ax.axis('off')
    
    # Pure white background
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')

    # Top title matching Elmasri & Navathe textbook style
    ax.text(90, 1900, "Referential integrity constraints displayed on the BLOOD_BANK relational database schema.",
            fontsize=14.5, fontfamily='DejaVu Sans', fontweight='normal', color='#111111')

    # Table specifications
    tables_data = [
        {
            "name": "BLOOD_GROUPS",
            "y": 1780,
            "x": 90,
            "attrs": [
                ("blood_group_id", True, False, 155),
                ("group_name", False, False, 135)
            ]
        },
        {
            "name": "STAFF",
            "y": 1620,
            "x": 90,
            "attrs": [
                ("staff_id", True, False, 110),
                ("name", False, False, 150),
                ("role", False, False, 95),
                ("phone", False, False, 125),
                ("email", False, False, 165),
                ("password", False, False, 125)
            ]
        },
        {
            "name": "HOSPITALS",
            "y": 1460,
            "x": 90,
            "attrs": [
                ("hospital_id", True, False, 125),
                ("name", False, False, 175),
                ("address", False, False, 175),
                ("contact", False, False, 125),
                ("email", False, False, 175)
            ]
        },
        {
            "name": "DONORS",
            "y": 1300,
            "x": 90,
            "attrs": [
                ("donor_id", True, False, 105),
                ("name", False, False, 145),
                ("age", False, False, 65),
                ("gender", False, False, 85),
                ("phone", False, False, 125),
                ("address", False, False, 155),
                ("blood_group_id", False, True, 155),
                ("last_donation_date", False, False, 175)
            ]
        },
        {
            "name": "DONATIONS",
            "y": 1130,
            "x": 90,
            "attrs": [
                ("donation_id", True, False, 125),
                ("donor_id", False, True, 115),
                ("blood_group_id", False, True, 155),
                ("donation_date", False, False, 145),
                ("quantity", False, False, 95),
                ("screening_status", False, False, 165)
            ]
        },
        {
            "name": "BLOOD_UNITS",
            "y": 960,
            "x": 90,
            "attrs": [
                ("unit_id", True, False, 105),
                ("donation_id", False, True, 125),
                ("blood_group_id", False, True, 155),
                ("collection_date", False, False, 155),
                ("expiry_date", False, False, 125),
                ("status", False, False, 105)
            ]
        },
        {
            "name": "BLOOD_REQUESTS",
            "y": 780,
            "x": 90,
            "attrs": [
                ("request_id", True, False, 115),
                ("hospital_id", False, True, 125),
                ("blood_group_id", False, True, 155),
                ("quantity_required", False, False, 175),
                ("request_date", False, False, 135),
                ("urgency", False, False, 105),
                ("status", False, False, 105)
            ]
        },
        {
            "name": "ISSUES",
            "y": 600,
            "x": 90,
            "attrs": [
                ("issue_id", True, False, 105),
                ("request_id", False, True, 115),
                ("unit_id", False, True, 105),
                ("issue_date", False, False, 115),
                ("issued_by", False, True, 115)
            ]
        }
    ]

    cell_coords = {}
    box_height = 40

    for tbl in tables_data:
        tx = tbl["x"]
        ty = tbl["y"]
        # Table Name header (Bold uppercase)
        ax.text(tx, ty + 10, tbl["name"], fontsize=12.5, fontfamily='DejaVu Sans', fontweight='bold', color='#111111')
        
        cur_x = tx
        for attr_name, is_pk, is_fk, width in tbl["attrs"]:
            # Draw cell box with light gray background
            rect = patches.Rectangle((cur_x, ty - box_height), width, box_height,
                                     linewidth=1.2, edgecolor='#1a1a1a', facecolor='#e8ecef')
            ax.add_patch(rect)
            
            # Center of text
            text_x = cur_x + width / 2.0
            text_y = ty - box_height / 2.0
            
            # Attribute text
            ax.text(text_x, text_y, attr_name, fontsize=10.5, fontfamily='DejaVu Sans',
                    ha='center', va='center', color='#111111')
            
            # Underline for Primary Key attributes
            if is_pk:
                underline_len = min(width - 14, len(attr_name) * 8.2)
                ax.plot([text_x - underline_len / 2.0, text_x + underline_len / 2.0],
                        [text_y - 8.5, text_y - 8.5],
                        color='#111111', linewidth=1.4)
            
            cell_coords[(tbl["name"], attr_name)] = {
                "x_left": cur_x,
                "x_right": cur_x + width,
                "x_center": cur_x + width / 2.0,
                "y_top": ty,
                "y_bottom": ty - box_height,
                "y_center": text_y
            }
            cur_x += width

    def draw_orthogonal_arrow(fk_table, fk_attr, pk_table, pk_attr, drop_down_y, arrival_y, target_x_offset=0, channel_x=None):
        src = cell_coords[(fk_table, fk_attr)]
        dst = cell_coords[(pk_table, pk_attr)]
        
        start_x = src["x_center"]
        start_y = src["y_bottom"]
        
        target_x = dst["x_center"] + target_x_offset
        target_y = dst["y_bottom"]
        
        points = []
        points.append((start_x, start_y))
        points.append((start_x, drop_down_y))
        
        if channel_x is not None:
            points.append((channel_x, drop_down_y))
            points.append((channel_x, arrival_y))
            points.append((target_x, arrival_y))
            points.append((target_x, target_y))
        else:
            points.append((target_x, drop_down_y))
            points.append((target_x, target_y))
            
        xs, ys = zip(*points)
        ax.plot(xs, ys, color='#111111', linewidth=1.1, solid_capstyle='round')
        
        # Crisp solid arrowhead pointing UP at target PK bottom edge
        arrow = patches.FancyArrow(target_x, target_y - 10, 0, 8.5,
                                   width=1.3, head_width=8, head_length=8.5,
                                   length_includes_head=True, color='#111111')
        ax.add_patch(arrow)

    # 1. DONORS.blood_group_id -> BLOOD_GROUPS.blood_group_id
    draw_orthogonal_arrow("DONORS", "blood_group_id", "BLOOD_GROUPS", "blood_group_id",
                          drop_down_y=1235, arrival_y=1710, target_x_offset=-40, channel_x=1200)

    # 2. DONATIONS.blood_group_id -> BLOOD_GROUPS.blood_group_id
    draw_orthogonal_arrow("DONATIONS", "blood_group_id", "BLOOD_GROUPS", "blood_group_id",
                          drop_down_y=1065, arrival_y=1695, target_x_offset=-15, channel_x=1240)

    # 3. DONATIONS.donor_id -> DONORS.donor_id
    draw_orthogonal_arrow("DONATIONS", "donor_id", "DONORS", "donor_id",
                          drop_down_y=1075, arrival_y=1240, target_x_offset=0, channel_x=55)

    # 4. BLOOD_UNITS.donation_id -> DONATIONS.donation_id
    draw_orthogonal_arrow("BLOOD_UNITS", "donation_id", "DONATIONS", "donation_id",
                          drop_down_y=895, arrival_y=1070, target_x_offset=0, channel_x=65)

    # 5. BLOOD_UNITS.blood_group_id -> BLOOD_GROUPS.blood_group_id
    draw_orthogonal_arrow("BLOOD_UNITS", "blood_group_id", "BLOOD_GROUPS", "blood_group_id",
                          drop_down_y=890, arrival_y=1680, target_x_offset=15, channel_x=1280)

    # 6. BLOOD_REQUESTS.hospital_id -> HOSPITALS.hospital_id
    draw_orthogonal_arrow("BLOOD_REQUESTS", "hospital_id", "HOSPITALS", "hospital_id",
                          drop_down_y=715, arrival_y=1400, target_x_offset=0, channel_x=50)

    # 7. BLOOD_REQUESTS.blood_group_id -> BLOOD_GROUPS.blood_group_id
    draw_orthogonal_arrow("BLOOD_REQUESTS", "blood_group_id", "BLOOD_GROUPS", "blood_group_id",
                          drop_down_y=705, arrival_y=1665, target_x_offset=40, channel_x=1320)

    # 8. ISSUES.request_id -> BLOOD_REQUESTS.request_id
    draw_orthogonal_arrow("ISSUES", "request_id", "BLOOD_REQUESTS", "request_id",
                          drop_down_y=535, arrival_y=725, target_x_offset=0, channel_x=65)

    # 9. ISSUES.unit_id -> BLOOD_UNITS.unit_id
    draw_orthogonal_arrow("ISSUES", "unit_id", "BLOOD_UNITS", "unit_id",
                          drop_down_y=520, arrival_y=905, target_x_offset=0, channel_x=45)

    # 10. ISSUES.issued_by -> STAFF.staff_id
    draw_orthogonal_arrow("ISSUES", "issued_by", "STAFF", "staff_id",
                          drop_down_y=505, arrival_y=1555, target_x_offset=0, channel_x=1360)

    # Legend / Note block at bottom
    leg_y = 410
    leg_rect = patches.Rectangle((90, leg_y - 125), 1150, 130,
                                 linewidth=1, edgecolor='#888888', facecolor='#f8f9fa', linestyle='--')
    ax.add_patch(leg_rect)
    
    ax.text(110, leg_y - 22, "RELATIONAL SCHEMA NOTATION & INTEGRITY CONSTRAINTS KEY:",
            fontsize=11.5, fontweight='bold', fontfamily='DejaVu Sans', color='#222222')
    ax.text(110, leg_y - 50, "1. Underlined attribute names specify the PRIMARY KEY (Entity Integrity Constraint).",
            fontsize=10.5, fontfamily='DejaVu Sans', color='#333333')
    ax.text(110, leg_y - 75, "2. Directed arrows originate from FOREIGN KEY attributes and point to referenced PRIMARY KEY attributes.",
            fontsize=10.5, fontfamily='DejaVu Sans', color='#333333')
    ax.text(110, leg_y - 100, "3. Formally specifies Referential Integrity Constraints in 3NF (Elmasri & Navathe textbook convention).",
            fontsize=10.5, fontfamily='DejaVu Sans', color='#333333')

    plt.tight_layout()
    
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    png_path = os.path.join(docs_dir, "blood_bank_schema_diagram.png")
    svg_path = os.path.join(docs_dir, "blood_bank_schema_diagram.svg")
    
    plt.savefig(png_path, bbox_inches='tight', dpi=300)
    plt.savefig(svg_path, bbox_inches='tight')
    plt.close()
    
    print(f"Updated PNG: {png_path}")
    print(f"Updated SVG: {svg_path}")

if __name__ == '__main__':
    draw_schema()
