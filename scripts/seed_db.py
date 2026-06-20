#!/usr/bin/env python3
"""
Seed script for AIGC GEO Overseas Platform
Populates articles, keywords, and AIGC platforms tables.

Usage:
    python3 scripts/seed_db.py          # run locally on aigc-geo-overseas-postgres host
    python3 seed_db.py                  # if CWD is scripts/
    
Connection defaults: host=localhost, db=aigc_geo_overseas
Can be overridden via env vars: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
"""

import os
import sys
import json
from datetime import datetime, timezone

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)


DB_CONFIG = {
    "host": os.environ.get("PGHOST", "localhost"),
    "port": int(os.environ.get("PGPORT", "5432")),
    "user": os.environ.get("PGUSER", "topcentral"),
    "password": os.environ.get("PGPASSWORD", "topcentral123"),
    "dbname": os.environ.get("PGDATABASE", "aigc_geo_overseas"),
}


# ============================================================
# Article definitions from frontend hardcoded data
# 4 completed (B-grade, published) + 10 excerpt-only (C-grade, draft)
# ============================================================

ARTICLES = [
    # --- 4 COMPLETED ARTICLES (B-grade, published) ---
    {
        "slug": "ai-data-center-cooling-engineering-plastics",
        "title": "Engineering Plastics for AI Data Center Liquid Cooling: Thermal Management Materials for the Next-Generation Computing Infrastructure",
        "category": "Technical Analysis",
        "tags": json.dumps(["AI", "Data Center", "Liquid Cooling", "Thermal Management", "PPS", "PA66"]),
        "status": "published",
        "grade": "B",
        "excerpt": "As AI data center power density surges past 50 kW per rack, liquid cooling becomes essential. This article examines the engineering plastics — PPS, PA66, LCP — enabling next-gen thermal management systems, covering material requirements, supply chain dynamics, and market growth projections through 2030.",
        "content": "[CONTENT IN [slug].js]",
        "word_count": 4800,
    },
    {
        "slug": "evtol-low-altitude-economy-composite-materials",
        "title": "eVTOL and the Low-Altitude Economy: Lightweight Engineering Plastics Enabling Urban Air Mobility",
        "category": "Industry Trends",
        "tags": json.dumps(["eVTOL", "Low-Altitude Economy", "Lightweight", "PEEK", "Carbon Fiber", "Aerospace"]),
        "status": "published",
        "grade": "B",
        "excerpt": "The global eVTOL market is projected to reach USD 30.8 billion by 2030. This article analyzes how PEEK, carbon-fiber-reinforced thermoplastics, and advanced composites are enabling lightweight airframes, battery enclosures, and structural components for the emerging urban air mobility sector.",
        "content": "[CONTENT IN [slug].js]",
        "word_count": 5200,
    },
    {
        "slug": "embodied-ai-humanoid-robot-materials",
        "title": "Embodied AI and Humanoid Robots: Material Requirements for Structural Components, Actuators, and Tactile Interfaces",
        "category": "Technical Analysis",
        "tags": json.dumps(["Embodied AI", "Humanoid Robot", "Structural Materials", "TPE", "PA", "PC/ABS"]),
        "status": "published",
        "grade": "B",
        "excerpt": "With the humanoid robot market expected to exceed USD 38 billion by 2035, material science is a critical enabler. This article explores the engineering polymer requirements — PA, TPE, PC/ABS — for robotic structural frames, actuator housings, sensor skins, and cable management systems.",
        "content": "[CONTENT IN [slug].js]",
        "word_count": 5500,
    },
    {
        "slug": "rcep-tariff-engineering-plastics-trade",
        "title": "RCEP Tariff Optimization for Engineering Plastics Trade: Strategic Sourcing and Market Access in Asia-Pacific",
        "category": "Industry Trends",
        "tags": json.dumps(["RCEP", "Tariff", "Trade", "Asia-Pacific", "Supply Chain"]),
        "status": "published",
        "grade": "B",
        "excerpt": "The RCEP agreement covers 30% of global GDP and has progressively reduced tariffs on engineering plastics across 15 Asia-Pacific nations. This analysis maps tariff phase-out schedules, identifies optimal sourcing corridors, and quantifies cost savings for PA, PC, POM, and ABS trade flows.",
        "content": "[CONTENT IN [slug].js]",
        "word_count": 5100,
    },
    # --- 10 EXCERPT-ONLY ARTICLES (C-grade, draft, need AI content) ---
    {
        "slug": "gen-z-consumption-circular-materials",
        "title": "Gen Z Consumption Patterns and the Circular Materials Premium: How Young Consumers Are Reshaping Polymer Markets",
        "category": "Industry Trends",
        "tags": json.dumps(["Gen Z", "Consumer Behavior", "Sustainability", "Market Research", "Brand Strategy"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "Gen Z consumers, representing USD 360 billion in disposable income globally, are driving a measurable \"circular premium\" of 12-25% for products made with recycled and sustainable materials. This article quantifies shifting consumer preferences and their impact on polymer procurement strategies.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "semiconductor-wafer-handling-high-performance-plastics",
        "title": "High-Performance Plastics in Semiconductor Manufacturing: Wafer Handling, CMP Rings, and Test Sockets — Material Requirements and Market Growth",
        "category": "Technical Analysis",
        "tags": json.dumps(["Semiconductor", "PEEK", "CMP", "Wafer Handling", "High-Performance"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "The semiconductor materials market is projected to reach USD 85 billion by 2027, with high-performance plastics as a critical subsegment. This deep dive covers PEEK, PAI, and PI applications in wafer carriers, CMP retaining rings, and burn-in test sockets, analyzing purity requirements and supply chain constraints.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "cross-border-ecommerce-b2b-materials-platform",
        "title": "Cross-Border B2B E-Commerce for Engineering Materials: Digital Platforms Reshaping Global Polymer Distribution",
        "category": "Industry Trends",
        "tags": json.dumps(["E-Commerce", "B2B", "Digital Platform", "Distribution", "Cross-Border"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "The B2B e-commerce market for chemicals and materials is projected to exceed USD 50 billion by 2028. This article examines how digital platforms are disrupting traditional distribution, enabling price transparency, reducing procurement cycles by 40-60%, and creating new cross-border trade corridors for engineering thermoplastics.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "hydrogen-economy-thermoplastic-tanks-infrastructure",
        "title": "Hydrogen Economy Infrastructure: Thermoplastic Composite Pressure Vessels and Distribution Systems — Material Innovation for the H2 Transition",
        "category": "Technical Analysis",
        "tags": json.dumps(["Hydrogen", "Pressure Vessel", "Composite", "PA", "HDPE", "Infrastructure"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "Global hydrogen investment is projected to reach USD 500 billion by 2030. This analysis focuses on Type IV composite pressure vessels using PA and HDPE liners, examining material specifications, permeation resistance, filament winding compatibility, and the emerging supply chain for hydrogen-compatible thermoplastics.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "3d-printing-additive-manufacturing-engineering-filaments",
        "title": "Additive Manufacturing with Engineering Thermoplastics: PEEK, PEI, and PA Filaments — State of the Art, Applications, and Economics",
        "category": "Technical Analysis",
        "tags": json.dumps(["3D Printing", "Additive Manufacturing", "PEEK", "PEI", "Filament", "Rapid Prototyping"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "The high-performance 3D printing filament market is growing at 25% CAGR, driven by aerospace, medical, and industrial applications. This article analyzes PEEK, PEI (ULTEM), and PA filament technologies, comparing mechanical properties, print parameters, cost-per-part economics, and emerging applications in tooling and end-use parts.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "ocean-plastic-waste-interception-recycling-value-chain",
        "title": "Ocean Plastic Waste Interception and Recycling: Value Chain Analysis, Technology Gaps, and Circular Business Models for Coastal Economies",
        "category": "Industry Trends",
        "tags": json.dumps(["Ocean Plastic", "Waste Interception", "Recycling", "Value Chain", "Circular Economy", "Southeast Asia"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "An estimated 11 million metric tons of plastic enter oceans annually, with 80% originating from Asian rivers. This article maps the interception-to-recycling value chain, evaluates technology readiness levels of collection and sorting systems, and identifies viable circular business models for Southeast Asian coastal economies.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "circular-economy-trends-2026",
        "title": "Circular Economy Material Trends 2026: Global Outlook",
        "category": "Industry Trends",
        "tags": json.dumps(["Circular Economy", "Sustainability", "Policy"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "As global emphasis on sustainable development grows, the circular economy materials industry welcomes new opportunities in 2026. This article analyzes policy directions, technological innovations, and market trends.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "pcr-recycling-technology-deep-dive",
        "title": "PCR Physical Recycling: From Waste to High-Performance Materials",
        "category": "Technical Analysis",
        "tags": json.dumps(["PCR", "Physical Recycling", "PlasCircles"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "PCR physical recycling is the most mature plastic recycling technology. This article details the process flow, quality control, and application prospects.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "iscc-plus-certification-guide",
        "title": "ISCC PLUS Certification Complete Guide",
        "category": "Certification",
        "tags": json.dumps(["ISCC PLUS", "Certification", "Sustainability"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "ISCC PLUS is an internationally recognized certification for sustainable materials. This guide covers benefits, process, and preparation.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
    {
        "slug": "aigc-geo-optimization-strategy",
        "title": "AIGC GEO Optimization: Brand Visibility in AI Search",
        "category": "Digital Marketing",
        "tags": json.dumps(["AIGC", "GEO", "AI Search"]),
        "status": "draft",
        "grade": "C",
        "excerpt": "AIGC GEO is the new frontier of digital marketing. Learn strategies for making brands visible in AI-powered platforms.",
        "content": "placeholder — need AI generation",
        "word_count": 0,
    },
]


# ============================================================
# 100 Keywords covering all product categories
# ============================================================

KEYWORDS_BY_CATEGORY = {
    "PC, ABS, PC/ABS": [
        "polycarbonate PC plastic", "ABS plastic material", "PC/ABS blend properties",
        "flame retardant PC", "glass fiber reinforced PC", "ABS injection molding grades",
        "PC sheet manufacturer", "PC/ABS for automotive interior", "transparent polycarbonate",
        "impact modified PC/ABS"
    ],
    "PP, PE, HDPE": [
        "polypropylene PP grades", "HDPE plastic material", "LDPE recycling solutions",
        "PP injection molding", "HDPE pipe grade", "impact copolymer PP",
        "PP compound manufacturer", "food grade HDPE", "PP TPO compound",
        "UHMWPE plastic sheet"
    ],
    "PA6, PA66": [
        "PA6 nylon 6", "PA66 nylon 66", "glass filled nylon 66",
        "PA6 injection molding", "toughened nylon 66", "heat stabilized PA66",
        "PA6 extrusion grade", "nylon 66 flame retardant", "PA6 PA66 difference",
        "recycled nylon 66"
    ],
    "PEEK, PEI, PPS": [
        "PEEK polymer price", "PEI ULTEM sheet", "PPS plastic material",
        "carbon fiber PEEK", "PEEK injection molding", "PPS compound supplier",
        "PEI 3D printing filament", "PEEK vs PEI comparison", "PPS GF40 properties",
        "high temperature thermoplastic"
    ],
    "PET, rPET": [
        "PET plastic material", "rPET recycled PET", "PET bottle grade",
        "PETG sheet manufacturer", "food contact rPET", "PET injection blow molding",
        "rPET pellet price", "PET amorphous grade", "PET crystallization",
        "post consumer recycled PET"
    ],
    "TPE, TPU": [
        "TPE thermoplastic elastomer", "TPU polyurethane", "TPE overmolding",
        "injection moldable TPU", "TPE SEBS based", "TPU film extrusion",
        "medical grade TPE", "TPU cable compound", "TPE automotive application",
        "transparent TPU sheet"
    ],
    "Circular Economy, Sustainability": [
        "circular economy plastics", "sustainable plastic material", "zero waste manufacturing",
        "plastic lifecycle assessment", "carbon footprint plastic", "mass balance approach",
        "bio based plastic", "sustainable packaging material", "closed loop recycling",
        "ESG plastic production"
    ],
    "GRS, ISCC PLUS, UL 2809": [
        "GRS certification plastic", "ISCC PLUS certification", "UL 2809 certification",
        "recycled content certification", "global recycled standard textile",
        "ISCC PLUS mass balance", "UL 2809 recycled content", "GRS certified manufacturer",
        "sustainability certification plastic", "chain of custody certification"
    ],
    "AIGC, GEO marketing": [
        "AIGC content generation", "GEO search optimization", "AI SEO strategy",
        "generative engine optimization", "AI brand visibility", "AIGC marketing platform",
        "LLM search ranking", "GEO vs SEO difference", "AI content marketing",
        "brand presence in AI"
    ],
    "Automotive, Electronics, Packaging": [
        "automotive plastic interior", "electronics plastic housing",
        "plastic packaging material", "EV battery enclosure plastic",
        "connector plastic PBT", "food packaging plastic film",
        "automotive under hood plastic", "consumer electronics case material",
        "medical device plastic", "industrial plastic components"
    ],
}


def connect():
    """Connect to PostgreSQL."""
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    return conn


def seed_articles(conn):
    """Insert 14 articles. Idempotent — skips existing slugs."""
    cur = conn.cursor()
    
    # Build set of existing slugs
    cur.execute("SELECT slug FROM articles WHERE slug IS NOT NULL")
    existing_slugs = {row[0] for row in cur.fetchall()}
    
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    inserted = 0
    skipped = 0
    
    for art in ARTICLES:
        if art["slug"] in existing_slugs:
            skipped += 1
            print(f"  SKIP (exists): {art['slug']}")
            continue
        
        # Determine published_at for published articles
        published_at = now if art["status"] == "published" else None
        
        cur.execute("""
            INSERT INTO articles 
                (id, title, content, summary, grade, status, tags, slug, category, word_count, created_at, published_at, updated_at)
            VALUES 
                (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            art["title"],
            art["content"],
            art["excerpt"],
            art["grade"],
            art["status"],
            art["tags"],
            art["slug"],
            art["category"],
            art["word_count"],
            now,
            published_at,
            now,
        ))
        inserted += 1
        print(f"  INSERTED: {art['slug']} ({art['status']}, grade {art['grade']})")
    
    conn.commit()
    cur.close()
    print(f"  Articles: {inserted} inserted, {skipped} skipped")
    return inserted


def seed_keywords(conn):
    """Insert 100+ keywords. Idempotent — checks existing keywords by text."""
    cur = conn.cursor()
    
    # Get existing keywords
    cur.execute("SELECT keyword FROM keywords")
    existing_keywords = {row[0].lower() for row in cur.fetchall()}
    
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    inserted = 0
    skipped = 0
    
    for category, keywords in KEYWORDS_BY_CATEGORY.items():
        for kw in keywords:
            if kw.lower() in existing_keywords:
                skipped += 1
                continue
            
            cur.execute("""
                INSERT INTO keywords (keyword, category, search_volume, difficulty, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                kw,
                category,
                0,  # search_volume — to be filled by data tool
                0,  # difficulty — to be filled by data tool
                now,
            ))
            inserted += 1
    
    conn.commit()
    cur.close()
    print(f"  Keywords: {inserted} inserted, {skipped} skipped")
    return inserted


def seed_platforms(conn):
    """Update AIGC platforms table.
    - Keep DeepSeek enabled
    - Set OpenAI GPT-4o and Claude Sonnet to disabled
    - Add Gemini, Perplexity, Grok, Kimi, MiniMax as disabled
    """
    cur = conn.cursor()
    
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    platforms_config = [
        # (code, name, api_endpoint, model_name, status, priority)
        # Keep existing ones
        ("deepseek", "DeepSeek AI", "https://api.deepseek.com/v1", "deepseek-chat", "enabled", 1),
        ("openai/gpt-4o", "OpenAI GPT-4o", "https://openrouter.ai/api/v1", "gpt-4o", "disabled", 2),
        ("anthropic/claude-sonnet-4", "Claude Sonnet", "https://openrouter.ai/api/v1", "claude-sonnet-4", "disabled", 3),
        # New disabled platforms
        ("google/gemini-2.0-flash", "Gemini", "", "gemini-2.0-flash", "disabled", 4),
        ("perplexity/sonar", "Perplexity", "", "sonar-pro", "disabled", 5),
        ("x-ai/grok-3", "Grok", "", "grok-3", "disabled", 6),
        ("kimi", "Kimi", "", "kimi", "disabled", 7),
        ("minimax", "MiniMax", "", "minimax", "disabled", 8),
    ]
    
    # Get existing platform codes
    cur.execute("SELECT code, status FROM aigc_platforms")
    existing = {row[0]: row[1] for row in cur.fetchall()}
    
    updated = 0
    inserted = 0
    
    for code, name, endpoint, model, status, priority in platforms_config:
        if code in existing:
            if existing[code] != status:
                # Update status
                cur.execute("""
                    UPDATE aigc_platforms 
                    SET status = %s
                    WHERE code = %s
                """, (status, code))
                print(f"  UPDATED: {code} → {status}")
                updated += 1
            else:
                print(f"  OK (unchanged): {code} = {status}")
        else:
            cur.execute("""
                INSERT INTO aigc_platforms 
                    (id, name, code, api_endpoint, model_name, status, priority, error_count, response_avg_ms, created_at)
                VALUES 
                    (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, 0, 0, %s)
            """, (name, code, endpoint, model, status, priority, now))
            print(f"  INSERTED: {code} ({name}, {status})")
            inserted += 1
    
    conn.commit()
    cur.close()
    print(f"  Platforms: {inserted} inserted, {updated} updated")


def main():
    print("=" * 60)
    print("AIGC GEO Overseas - Database Seeder")
    print(f"Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Database: {DB_CONFIG['dbname']}")
    print(f"User: {DB_CONFIG['user']}")
    print("=" * 60)
    
    conn = connect()
    print("\n✅ Connected to database\n")
    
    print("--- Seeding Articles (14) ---")
    seed_articles(conn)
    
    print("\n--- Seeding Keywords (100) ---")
    seed_keywords(conn)
    
    print("\n--- Seeding AIGC Platforms ---")
    seed_platforms(conn)
    
    conn.close()
    print("\n✅ Seeding complete!")


if __name__ == "__main__":
    main()
