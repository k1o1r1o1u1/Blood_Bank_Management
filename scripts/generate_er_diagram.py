import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_er_diagram():
    # Large high-res canvas with pure white background
    fig, ax = plt.subplots(figsize=(19, 18.5), dpi=300)
    ax.set_xlim(30, 1970)
    ax.set_ylim(320, 2180)
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')

    # Top title matching Elmasri & Navathe textbook style
    ax.text(80, 2120, "Entity-Relationship (ER) Schema Diagram for the BLOOD_BANK Database",
            fontsize=16, fontfamily='DejaVu Sans', fontweight='normal', color='#111111')
    ax.text(80, 2085, "(Using Elmasri & Navathe (min, max) structural constraint notation)",
            fontsize=12.5, fontfamily='DejaVu Sans', fontstyle='italic', color='#555555')

    # Entities definitions
    entities = {
        "DONOR": {"x": 320, "y": 1820, "w": 160, "h": 50},
        "BLOOD_GROUP": {"x": 1000, "y": 1820, "w": 190, "h": 50},
        "HOSPITAL": {"x": 1680, "y": 1820, "w": 170, "h": 50},
        "DONATION": {"x": 320, "y": 1320, "w": 170, "h": 50},
        "BLOOD_UNIT": {"x": 1000, "y": 1320, "w": 180, "h": 50},
        "BLOOD_REQUEST": {"x": 1680, "y": 1320, "w": 200, "h": 50},
        "ISSUE": {"x": 1000, "y": 780, "w": 150, "h": 50},
        "STAFF": {"x": 1680, "y": 780, "w": 150, "h": 50}
    }

    # Render entities
    for name, d in entities.items():
        rect = patches.Rectangle((d["x"] - d["w"]/2.0, d["y"] - d["h"]/2.0), d["w"], d["h"],
                                 linewidth=1.4, edgecolor='#1a1a1a', facecolor='#e8ecef', zorder=3)
        ax.add_patch(rect)
        ax.text(d["x"], d["y"], name, fontsize=12, fontfamily='DejaVu Sans', fontweight='bold',
                ha='center', va='center', color='#111111', zorder=4)

    # Helper: draw Relationship diamond
    def draw_diamond(cx, cy, w, h, name):
        pts = [
            (cx, cy + h/2.0),
            (cx + w/2.0, cy),
            (cx, cy - h/2.0),
            (cx - w/2.0, cy)
        ]
        poly = patches.Polygon(pts, closed=True, linewidth=1.3, edgecolor='#1a1a1a', facecolor='#ffffff', zorder=3)
        ax.add_patch(poly)
        ax.text(cx, cy, name, fontsize=10.5, fontfamily='DejaVu Sans', fontweight='bold',
                ha='center', va='center', color='#111111', zorder=4)
        return {"cx": cx, "cy": cy, "w": w, "h": h}

    diamonds = {
        "CLASSIFIES": draw_diamond(660, 1820, 150, 60, "CLASSIFIES"),
        "GIVES": draw_diamond(320, 1570, 130, 55, "GIVES"),
        "TYPED_AS": draw_diamond(660, 1570, 140, 55, "TYPED_AS"),
        "YIELDS": draw_diamond(660, 1320, 130, 55, "YIELDS"),
        "HAS_GROUP": draw_diamond(1000, 1570, 150, 55, "HAS_GROUP"),
        "SUBMITS": draw_diamond(1680, 1570, 140, 55, "SUBMITS"),
        "REQUIRES": draw_diamond(1340, 1570, 140, 55, "REQUIRES"),
        "DISPENSES": draw_diamond(1000, 1050, 150, 55, "DISPENSES"),
        "FULFILLS": draw_diamond(1340, 1050, 140, 55, "FULFILLS"),
        "AUTHORIZES": draw_diamond(1340, 780, 160, 55, "AUTHORIZES")
    }

    # Helper: draw relationship link with (min, max) label
    def link_entity_rel(ent_name, rel_name, card_str, ent_anchor_offset=(0,0), rel_anchor_offset=(0,0), label_pos=0.35, label_offset=(0, 15)):
        e = entities[ent_name]
        r = diamonds[rel_name]
        
        ex = e["x"] + ent_anchor_offset[0]
        ey = e["y"] + ent_anchor_offset[1]
        rx = r["cx"] + rel_anchor_offset[0]
        ry = r["cy"] + rel_anchor_offset[1]
        
        ax.plot([ex, rx], [ey, ry], color='#111111', linewidth=1.2, zorder=2)
        
        # Position (min, max) label
        lx = ex + (rx - ex) * label_pos + label_offset[0]
        ly = ey + (ry - ey) * label_pos + label_offset[1]
        
        ax.text(lx, ly, card_str, fontsize=10.5, fontfamily='DejaVu Sans', fontweight='normal',
                ha='center', va='center', color='#111111', zorder=5,
                bbox=dict(boxstyle='square,pad=0.15', facecolor='white', edgecolor='none'))

    # Connect relationships and annotate (min, max) constraints
    # 1. CLASSIFIES: DONOR (1,1) <-> (0,N) BLOOD_GROUP
    link_entity_rel("DONOR", "CLASSIFIES", "(1,1)", ent_anchor_offset=(80, 0), label_pos=0.45, label_offset=(0, 14))
    link_entity_rel("BLOOD_GROUP", "CLASSIFIES", "(0,N)", ent_anchor_offset=(-95, 0), label_pos=0.45, label_offset=(0, 14))

    # 2. GIVES: DONOR (0,N) <-> (1,1) DONATION
    link_entity_rel("DONOR", "GIVES", "(0,N)", ent_anchor_offset=(0, -25), label_pos=0.45, label_offset=(24, 0))
    link_entity_rel("DONATION", "GIVES", "(1,1)", ent_anchor_offset=(0, 25), label_pos=0.45, label_offset=(24, 0))

    # 3. TYPED_AS: DONATION (1,1) <-> (0,N) BLOOD_GROUP
    link_entity_rel("DONATION", "TYPED_AS", "(1,1)", ent_anchor_offset=(85, 10), label_pos=0.4, label_offset=(0, 14))
    link_entity_rel("BLOOD_GROUP", "TYPED_AS", "(0,N)", ent_anchor_offset=(-60, -25), label_pos=0.4, label_offset=(-18, -10))

    # 4. YIELDS: DONATION (0,N) <-> (0,1) BLOOD_UNIT
    link_entity_rel("DONATION", "YIELDS", "(0,N)", ent_anchor_offset=(85, 0), label_pos=0.45, label_offset=(0, 14))
    link_entity_rel("BLOOD_UNIT", "YIELDS", "(0,1)", ent_anchor_offset=(-90, 0), label_pos=0.45, label_offset=(0, 14))

    # 5. HAS_GROUP: BLOOD_UNIT (1,1) <-> (0,N) BLOOD_GROUP
    link_entity_rel("BLOOD_UNIT", "HAS_GROUP", "(1,1)", ent_anchor_offset=(0, 25), label_pos=0.45, label_offset=(24, 0))
    link_entity_rel("BLOOD_GROUP", "HAS_GROUP", "(0,N)", ent_anchor_offset=(0, -25), label_pos=0.45, label_offset=(24, 0))

    # 6. SUBMITS: HOSPITAL (0,N) <-> (1,1) BLOOD_REQUEST
    link_entity_rel("HOSPITAL", "SUBMITS", "(0,N)", ent_anchor_offset=(0, -25), label_pos=0.45, label_offset=(24, 0))
    link_entity_rel("BLOOD_REQUEST", "SUBMITS", "(1,1)", ent_anchor_offset=(0, 25), label_pos=0.45, label_offset=(24, 0))

    # 7. REQUIRES: BLOOD_REQUEST (1,1) <-> (0,N) BLOOD_GROUP
    link_entity_rel("BLOOD_REQUEST", "REQUIRES", "(1,1)", ent_anchor_offset=(-100, 10), label_pos=0.4, label_offset=(0, 14))
    link_entity_rel("BLOOD_GROUP", "REQUIRES", "(0,N)", ent_anchor_offset=(60, -25), label_pos=0.4, label_offset=(18, -10))

    # 8. DISPENSES: BLOOD_UNIT (0,1) <-> (1,1) ISSUE
    link_entity_rel("BLOOD_UNIT", "DISPENSES", "(0,1)", ent_anchor_offset=(0, -25), label_pos=0.45, label_offset=(24, 0))
    link_entity_rel("ISSUE", "DISPENSES", "(1,1)", ent_anchor_offset=(0, 25), label_pos=0.45, label_offset=(24, 0))

    # 9. FULFILLS: BLOOD_REQUEST (0,N) <-> (1,1) ISSUE
    link_entity_rel("BLOOD_REQUEST", "FULFILLS", "(0,N)", ent_anchor_offset=(-60, -25), label_pos=0.4, label_offset=(-16, -14))
    link_entity_rel("ISSUE", "FULFILLS", "(1,1)", ent_anchor_offset=(60, 25), label_pos=0.4, label_offset=(16, 14))

    # 10. AUTHORIZES: STAFF (0,N) <-> (0,1) ISSUE
    link_entity_rel("STAFF", "AUTHORIZES", "(0,N)", ent_anchor_offset=(-75, 0), label_pos=0.45, label_offset=(0, 14))
    link_entity_rel("ISSUE", "AUTHORIZES", "(0,1)", ent_anchor_offset=(75, 0), label_pos=0.45, label_offset=(0, 14))

    # Helper: draw attribute ovals
    def draw_attribute(ent_name, attr_name, is_pk, ox, oy, ow=110, oh=34, ent_offset=(0,0)):
        e = entities[ent_name]
        ex = e["x"] + ent_offset[0]
        ey = e["y"] + ent_offset[1]
        
        # Link line from entity to oval
        ax.plot([ex, ox], [ey, oy], color='#222222', linewidth=1.0, zorder=1)
        
        # Oval patch
        ellipse = patches.Ellipse((ox, oy), ow, oh, linewidth=1.2, edgecolor='#1a1a1a', facecolor='#ffffff', zorder=3)
        ax.add_patch(ellipse)
        
        # Text
        ax.text(ox, oy, attr_name, fontsize=9.5, fontfamily='DejaVu Sans',
                ha='center', va='center', color='#111111', zorder=4)
        
        # Underline if Primary Key
        if is_pk:
            ulen = min(ow - 20, len(attr_name) * 7.5)
            ax.plot([ox - ulen/2.0, ox + ulen/2.0], [oy - 7, oy - 7], color='#111111', linewidth=1.3, zorder=5)

    # --- Attributes for DONOR ---
    draw_attribute("DONOR", "donor_id", True, 130, 1960, ow=105, oh=32)
    draw_attribute("DONOR", "name", False, 260, 1980, ow=95, oh=32)
    draw_attribute("DONOR", "age", False, 380, 1980, ow=80, oh=32)
    draw_attribute("DONOR", "gender", False, 490, 1960, ow=95, oh=32)
    draw_attribute("DONOR", "phone", False, 110, 1860, ow=95, oh=32)
    draw_attribute("DONOR", "address", False, 110, 1780, ow=100, oh=32)
    draw_attribute("DONOR", "last_donation_date", False, 160, 1700, ow=150, oh=32)

    # --- Attributes for BLOOD_GROUP ---
    draw_attribute("BLOOD_GROUP", "blood_group_id", True, 900, 1980, ow=140, oh=34)
    draw_attribute("BLOOD_GROUP", "group_name", False, 1100, 1980, ow=120, oh=34)

    # --- Attributes for HOSPITAL ---
    draw_attribute("HOSPITAL", "hospital_id", True, 1510, 1960, ow=120, oh=34)
    draw_attribute("HOSPITAL", "name", False, 1650, 1980, ow=95, oh=32)
    draw_attribute("HOSPITAL", "contact", False, 1770, 1980, ow=95, oh=32)
    draw_attribute("HOSPITAL", "email", False, 1890, 1960, ow=95, oh=32)
    draw_attribute("HOSPITAL", "address", False, 1890, 1880, ow=100, oh=32)

    # --- Attributes for DONATION ---
    draw_attribute("DONATION", "donation_id", True, 120, 1420, ow=120, oh=34)
    draw_attribute("DONATION", "donation_date", False, 110, 1340, ow=130, oh=32)
    draw_attribute("DONATION", "quantity", False, 120, 1260, ow=100, oh=32)
    draw_attribute("DONATION", "screening_status", False, 200, 1180, ow=150, oh=32)

    # --- Attributes for BLOOD_UNIT (placed cleanly to avoid central vertical line) ---
    draw_attribute("BLOOD_UNIT", "unit_id", True, 860, 1240, ow=95, oh=32, ent_offset=(-60, -20))
    draw_attribute("BLOOD_UNIT", "collection_date", False, 860, 1380, ow=135, oh=32, ent_offset=(-60, 20))
    draw_attribute("BLOOD_UNIT", "expiry_date", False, 1140, 1240, ow=115, oh=32, ent_offset=(60, -20))
    draw_attribute("BLOOD_UNIT", "status", False, 1220, 1340, ow=90, oh=32, ent_offset=(80, 0))

    # --- Attributes for BLOOD_REQUEST ---
    draw_attribute("BLOOD_REQUEST", "request_id", True, 1880, 1420, ow=110, oh=32)
    draw_attribute("BLOOD_REQUEST", "quantity_required", False, 1900, 1340, ow=155, oh=32)
    draw_attribute("BLOOD_REQUEST", "request_date", False, 1880, 1260, ow=125, oh=32)
    draw_attribute("BLOOD_REQUEST", "urgency", False, 1790, 1180, ow=95, oh=32)
    draw_attribute("BLOOD_REQUEST", "status", False, 1660, 1180, ow=90, oh=32)

    # --- Attributes for ISSUE ---
    draw_attribute("ISSUE", "issue_id", True, 860, 680, ow=95, oh=32)
    draw_attribute("ISSUE", "issue_date", False, 1000, 660, ow=110, oh=32)

    # --- Attributes for STAFF ---
    draw_attribute("STAFF", "staff_id", True, 1550, 680, ow=95, oh=32)
    draw_attribute("STAFF", "name", False, 1670, 660, ow=90, oh=32)
    draw_attribute("STAFF", "role", False, 1780, 660, ow=85, oh=32)
    draw_attribute("STAFF", "phone", False, 1880, 690, ow=95, oh=32)
    draw_attribute("STAFF", "email", False, 1890, 770, ow=95, oh=32)
    draw_attribute("STAFF", "password", False, 1890, 840, ow=110, oh=32)

    # Legend / Key box at the bottom
    leg_y = 480
    leg_rect = patches.Rectangle((80, leg_y - 115), 1800, 120,
                                 linewidth=1, edgecolor='#888888', facecolor='#f8f9fa', linestyle='--')
    ax.add_patch(leg_rect)
    
    ax.text(100, leg_y - 20, "ER DIAGRAM NOTATION KEY (Elmasri & Navathe (min, max) Structural Constraint Convention):",
            fontsize=12, fontweight='bold', fontfamily='DejaVu Sans', color='#222222')
    ax.text(100, leg_y - 48, "• Rectangles: Entity Types.  |  Diamonds: Relationship Types.  |  Ovals: Entity Attributes.",
            fontsize=11, fontfamily='DejaVu Sans', color='#333333')
    ax.text(100, leg_y - 74, "• Underlined attribute name: Primary Key (Identifier attribute) enforcing entity integrity.",
            fontsize=11, fontfamily='DejaVu Sans', color='#333333')
    ax.text(100, leg_y - 100, "• (min, max) on link (E, R): Specifies that each entity e in E must participate in at least min and at most max relationship instances in R.",
            fontsize=11, fontfamily='DejaVu Sans', color='#333333')

    plt.tight_layout()
    
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    png_path = os.path.join(docs_dir, "blood_bank_er_diagram.png")
    svg_path = os.path.join(docs_dir, "blood_bank_er_diagram.svg")
    
    plt.savefig(png_path, bbox_inches='tight', dpi=300)
    plt.savefig(svg_path, bbox_inches='tight')
    plt.close()
    
    print(f"Updated ER PNG: {png_path}")
    print(f"Updated ER SVG: {svg_path}")

if __name__ == '__main__':
    draw_er_diagram()
