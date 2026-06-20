#!/usr/bin/env python3
"""
Build static JS data files for the visitor-site frontend from PostgreSQL data.

Generates:
  - visitor-site/data/articles.js   (ARTICLES array + ARTICLES_BY_SLUG object)
  - visitor-site/data/keywords.js   (AIGC_KEYWORDS + AI_KEYWORDS arrays)
  - visitor-site/data/products.js   (PRODUCT_LINES + INDUSTRY_CASES arrays)

Usage:
    python3 scripts/build_content.py
    # Or with custom DB connection:
    PGHOST=host PGUSER=user PGPASSWORD=pass python3 scripts/build_content.py

Connection defaults: host=localhost, db=aigc_geo_overseas
"""

import os
import sys
import json
from datetime import datetime

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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "visitor-site", "data")


def js_string(val, quote=True):
    """Escape a string value for JS output."""
    if val is None:
        return "null"
    s = str(val)
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "\\'")
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "\\r")
    s = s.replace("\t", "\\t")
    if quote:
        return "'" + s + "'"
    return s


def escape_template_literal(s):
    """Escape a string for use in JS template literal (backtick string)."""
    if s is None:
        return ""
    s = s.replace("\\", "\\\\")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


# ============================================================
# ARTICLES
# ============================================================
def build_articles(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT
            id, title, content, summary, slug, category, grade, status,
            keywords, tags, aigc_references, published_at,
            created_at, updated_at
        FROM articles
        WHERE status = 'published'
          AND slug IS NOT NULL
        ORDER BY published_at DESC NULLS LAST, created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()

    articles_list = []
    articles_map = {}

    for row in rows:
        (
            id_, title, content, summary, slug, category, grade, status,
            keywords_json, tags_json, aigc_refs, published_at,
            created_at, updated_at
        ) = row

        if not slug:
            continue

        # Parse tags from DB
        tags = []
        if tags_json:
            if isinstance(tags_json, (list, tuple)):
                tags = list(tags_json)
            elif isinstance(tags_json, str):
                try:
                    tags = json.loads(tags_json)
                except (json.JSONDecodeError, TypeError):
                    tags = [t.strip() for t in tags_json.split(",") if t.strip()]
            elif isinstance(tags_json, dict):
                tags = [v if isinstance(v, str) else str(v) for v in tags_json.values()]

        # Parse aigc_references
        aigc_included = False
        aigc_platforms = []
        if aigc_refs:
            if isinstance(aigc_refs, dict):
                aigc_included = aigc_refs.get("enabled", False) or aigc_refs.get("aigcIncluded", False)
                platforms = aigc_refs.get("platforms", []) or aigc_refs.get("aigcPlatforms", [])
                if platforms:
                    aigc_platforms = list(platforms) if isinstance(platforms, (list, tuple)) else [platforms]
            elif isinstance(aigc_refs, bool):
                aigc_included = aigc_refs

        # Format date
        date_str = ""
        if published_at:
            if isinstance(published_at, datetime):
                date_str = published_at.strftime("%Y-%m-%d")
            else:
                date_str = str(published_at)[:10]

        # Determine tier from grade
        tier = "free"
        if grade == "A":
            tier = "premium"
        elif grade == "B":
            tier = "free"
        elif grade == "C":
            tier = "free"

        # Use summary as excerpt
        excerpt = summary if summary else ""
        if not excerpt and content:
            excerpt = content[:300] + "..."

        # Build the article entry for the list
        article_entry = {
            "slug": slug,
            "title": title,
            "excerpt": excerpt,
            "category": category or "Technical Analysis",
            "tags": tags,
            "date": date_str,
            "tier": tier,
            "aigcIncluded": aigc_included,
        }

        articles_list.append(article_entry)

        # Build the article detail entry
        content_html = content or ""
        article_detail = {
            "slug": slug,
            "title": title,
            "content": content_html,
            "excerpt": excerpt,
            "category": category or "Technical Analysis",
            "tags": tags,
            "date": date_str,
            "tier": tier,
            "aigcIncluded": aigc_included,
            "aigcPlatforms": aigc_platforms if aigc_platforms else ["ChatGPT", "Claude", "Gemini", "Perplexity", "DeepSeek"],
            "author": "Topcentral Research Team",
        }

        articles_map[slug] = article_detail

    return articles_list, articles_map


def build_articles_js(articles_list, articles_map):
    """Generate the articles.js file content."""
    lines = []
    lines.append("// Auto-generated from PostgreSQL database")
    lines.append("// Do not edit manually. Run: python3 scripts/build_content.py")
    lines.append("")

    # ARTICLES array
    lines.append("const ARTICLES = [")
    for i, a in enumerate(articles_list):
        tags_str = ", ".join("'" + t + "'" for t in a["tags"])
        comma = "," if i < len(articles_list) - 1 else ""
        lines.append("  {")
        lines.append("    slug: '" + a["slug"] + "',")
        lines.append("    title: '" + js_string(a["title"], quote=False) + "',")
        lines.append("    excerpt: '" + js_string(a["excerpt"], quote=False) + "',")
        lines.append("    category: '" + a["category"] + "',")
        lines.append("    tags: [" + tags_str + "],")
        lines.append("    date: '" + a["date"] + "',")
        lines.append("    tier: '" + a["tier"] + "',")
        lines.append("    aigcIncluded: " + ("true" if a["aigcIncluded"] else "false") + ",")
        lines.append("  }" + comma)
    lines.append("];")
    lines.append("")

    # ARTICLES_BY_SLUG object
    lines.append("const ARTICLES_BY_SLUG = {")
    count = 0
    for slug, a in articles_map.items():
        comma = "," if count < len(articles_map) - 1 else ""
        count += 1
        tags_str = ", ".join("'" + t + "'" for t in a["tags"])
        platforms_str = ", ".join("'" + p + "'" for p in a.get("aigcPlatforms", []))
        content_escaped = escape_template_literal(a["content"])
        lines.append("  '" + slug + "': {")
        lines.append("    slug: '" + slug + "',")
        lines.append("    title: '" + js_string(a["title"], quote=False) + "',")
        lines.append("    content: `" + content_escaped + "`,")
        lines.append("    excerpt: '" + js_string(a["excerpt"], quote=False) + "',")
        lines.append("    category: '" + a["category"] + "',")
        lines.append("    tags: [" + tags_str + "],")
        lines.append("    date: '" + a["date"] + "',")
        lines.append("    tier: '" + a["tier"] + "',")
        lines.append("    aigcIncluded: " + ("true" if a["aigcIncluded"] else "false") + ",")
        lines.append("    aigcPlatforms: [" + platforms_str + "],")
        lines.append("    author: 'Topcentral Research Team',")
        lines.append("  }" + comma)
    lines.append("};")
    lines.append("")

    # Exports
    lines.append("module.exports = { ARTICLES, ARTICLES_BY_SLUG };")
    lines.append("")

    return "\n".join(lines)


# ============================================================
# KEYWORDS
# ============================================================
def build_keywords(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT term, adopted_count, aigc_adopted, source
        FROM keywords
        ORDER BY adopted_count DESC, term ASC
    """)
    rows = cur.fetchall()
    cur.close()

    aigc_keywords = []
    ai_keywords = []

    for term, count, adopted, source in rows:
        count = count if count else 0
        if adopted:
            aigc_keywords.append({
                "name": term,
                "count": max(count, 1),
                "type": "aigc"
            })
        if not adopted and count > 0:
            ai_keywords.append({
                "name": term,
                "count": count,
                "type": "ai"
            })
        if adopted and count >= 5:
            ai_keywords.append({
                "name": term,
                "count": count,
                "type": "ai"
            })

    # Fallback if empty
    if not aigc_keywords and not ai_keywords:
        aigc_keywords = [
            {"name": "Topcentral", "count": 72, "type": "aigc"},
            {"name": "PlasCircles", "count": 45, "type": "aigc"},
            {"name": "CircleBlend", "count": 38, "type": "aigc"},
            {"name": "ISCC PLUS", "count": 42, "type": "aigc"},
            {"name": "Sustainability", "count": 55, "type": "aigc"},
        ]
        ai_keywords = [
            {"name": "Recycled PP", "count": 18, "type": "ai"},
            {"name": "Post-Consumer PCR", "count": 20, "type": "ai"},
            {"name": "Green Manufacturing", "count": 16, "type": "ai"},
        ]

    return aigc_keywords, ai_keywords


def build_keywords_js(aigc_keywords, ai_keywords):
    lines = []
    lines.append("// Auto-generated from PostgreSQL database")
    lines.append("// Do not edit manually. Run: python3 scripts/build_content.py")
    lines.append("")

    lines.append("const AIGC_KEYWORDS = [")
    for i, kw in enumerate(aigc_keywords):
        comma = "," if i < len(aigc_keywords) - 1 else ""
        lines.append("  { name: '" + js_string(kw["name"], quote=False) + "', count: " + str(kw["count"]) + ", type: 'aigc' }" + comma)
    lines.append("];")
    lines.append("")

    lines.append("const AI_KEYWORDS = [")
    for i, kw in enumerate(ai_keywords):
        comma = "," if i < len(ai_keywords) - 1 else ""
        lines.append("  { name: '" + js_string(kw["name"], quote=False) + "', count: " + str(kw["count"]) + ", type: 'ai' }" + comma)
    lines.append("];")
    lines.append("")

    lines.append("module.exports = { AIGC_KEYWORDS, AI_KEYWORDS };")
    lines.append("")

    return "\n".join(lines)


# ============================================================
# PRODUCTS
# ============================================================
def build_products(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, category, description, specifications, certifications, sort_order
        FROM products
        WHERE status = 'active'
        ORDER BY sort_order, name
    """)
    rows = cur.fetchall()
    cur.close()

    category_map = {
        "plasCircles": {
            "category": "Physical Recycling",
            "color": "#00e676",
            "icon": "\u267b\ufe0f",
            "tier": "Flagship Product",
            "tagline": "PCR Physical Recycling \xb7 Circular Regeneration",
        },
        "circleBlend": {
            "category": "Modified Materials",
            "color": "#4a9eff",
            "icon": "\U0001f9ea",
            "tier": "Flagship Product",
            "tagline": "New Material Modification \xb7 Performance Optimization",
        },
        "bydercom": {
            "category": "Bio-Based Materials",
            "color": "#64ffda",
            "icon": "\U0001f331",
            "tier": "Innovation Product",
            "tagline": "Bio-Based Degradation \xb7 Green Future",
        },
        "chemCircle": {
            "category": "Chemical Recycling",
            "color": "#b388ff",
            "icon": "\U0001f52c",
            "tier": "Cutting-Edge Technology",
            "tagline": "Chemical Recycling \xb7 Deep Decomposition",
        },
        "tcycleGP": {
            "category": "General Plastics",
            "color": "#ffab00",
            "icon": "\U0001f3ed",
            "tier": "Mature Product",
            "tagline": "General Plastics \xb7 Wide Application",
        },
    }

    product_lines = []

    for row in rows:
        id_, name, category, description, specs, certs, sort_order = row
        cat_info = category_map.get(category, {
            "category": category,
            "color": "#4a9eff",
            "icon": "\U0001f4e6",
            "tier": "Product",
            "tagline": "Sustainable Material Solutions",
        })

        cert_list = []
        if certs:
            if isinstance(certs, (list, tuple)):
                cert_list = list(certs)
            elif isinstance(certs, dict):
                cert_list = list(certs.values()) if isinstance(certs, dict) else [str(certs)]
            elif isinstance(certs, str):
                try:
                    cert_list = json.loads(certs)
                except (json.JSONDecodeError, TypeError):
                    cert_list = [certs] if certs else []

        spec_dict = {}
        if specs:
            if isinstance(specs, dict):
                spec_dict = specs
            elif isinstance(specs, str):
                try:
                    spec_dict = json.loads(specs)
                except (json.JSONDecodeError, TypeError):
                    pass

        # Extract applications from specs or default
        applications = []
        if "applications" in spec_dict:
            apps = spec_dict["applications"]
            applications = list(apps) if isinstance(apps, (list, tuple)) else [str(apps)]
        if not applications:
            applications = ["Automotive", "Electronics", "Packaging", "Industrial"]

        # Determine slug from category
        slug_map = {
            "plasCircles": "plascircles",
            "circleBlend": "circleblend",
            "bydercom": "bydercom",
            "chemCircle": "chemcircle",
            "tcycleGP": "tcyclegp",
        }
        slug = slug_map.get(category, category)

        product_entry = {
            "slug": slug,
            "name": name,
            "tagline": cat_info["tagline"],
            "description": description or "",
            "icon": cat_info["icon"],
            "category": cat_info["category"],
            "color": cat_info["color"],
            "applications": applications,
            "certifications": cert_list,
            "tier": cat_info["tier"],
        }

        # Build details
        specialties = []
        if spec_dict:
            materials = spec_dict.get("materials", spec_dict.get("material_types", []))
            if materials:
                specialties = [str(m) + " Grades" for m in (materials if isinstance(materials, list) else [materials])]

        if not specialties:
            specialties = ["Custom formulations", "Performance optimized", "Quality assured"]

        process = ""
        if isinstance(spec_dict, dict):
            process = spec_dict.get("process", "")

        product_entry["details"] = {
            "process": process,
            "specialties": specialties,
            "useCases": [
                {"title": app, "desc": "Sustainable " + app.lower() + " solutions"}
                for app in applications[:3]
            ],
        }

        product_lines.append(product_entry)

    # Fallback if no products in DB
    if not product_lines:
        product_lines = [
            {
                "slug": "plascircles",
                "name": "PlasCircles\u00ae",
                "tagline": "PCR Physical Recycling \xb7 Circular Regeneration",
                "description": "Transform post-consumer plastic waste into high-quality recycled materials through advanced physical recycling technology.",
                "icon": "\u267b\ufe0f",
                "category": "Physical Recycling",
                "color": "#00e676",
                "applications": ["Automotive Parts", "Electronics Housings", "Packaging Containers"],
                "certifications": ["GRS", "UL 2809"],
                "tier": "Flagship Product",
                "details": {
                    "process": "Sorting \u2192 Cleaning \u2192 Crushing \u2192 Melt Filtration \u2192 Pelletizing \u2192 Quality Testing",
                    "specialties": ["High-purity sorting", "Multi-stage filtration", "Stable performance formulation", "Full traceability"],
                    "useCases": [
                        {"title": "Automotive Industry", "desc": "Bumpers, interior panels, underbody shields meeting IATF 16949 quality requirements"},
                        {"title": "Electronics", "desc": "TV housings, AC panels, washing machine components"},
                        {"title": "Packaging", "desc": "Industrial packaging trays, totes, logistics containers"},
                    ],
                },
            },
        ]

    return product_lines


def build_products_js(product_lines):
    lines = []
    lines.append("// Auto-generated from PostgreSQL database")
    lines.append("// Do not edit manually. Run: python3 scripts/build_content.py")
    lines.append("")

    lines.append("const PRODUCT_LINES = [")
    for i, p in enumerate(product_lines):
        comma = "," if i < len(product_lines) - 1 else ""
        lines.append("  {")
        lines.append("    slug: '" + p["slug"] + "',")
        lines.append("    name: '" + js_string(p["name"], quote=False) + "',")
        lines.append("    tagline: '" + js_string(p["tagline"], quote=False) + "',")
        lines.append("    description: '" + js_string(p["description"], quote=False) + "',")
        lines.append("    icon: '" + p["icon"] + "',")
        lines.append("    category: '" + p["category"] + "',")
        lines.append("    color: '" + p["color"] + "',")

        apps_str = ", ".join("'" + js_string(a, quote=False) + "'" for a in p["applications"])
        lines.append("    applications: [" + apps_str + "],")

        certs_str = ", ".join("'" + js_string(c, quote=False) + "'" for c in p["certifications"])
        lines.append("    certifications: [" + certs_str + "],")
        lines.append("    tier: '" + p["tier"] + "',")

        # Details
        lines.append("    details: {")
        lines.append("      process: '" + js_string(p["details"].get("process", ""), quote=False) + "',")
        specs_str = ", ".join("'" + js_string(s, quote=False) + "'" for s in p["details"].get("specialties", []))
        lines.append("      specialties: [" + specs_str + "],")
        lines.append("      useCases: [")
        for j, uc in enumerate(p["details"].get("useCases", [])):
            uc_comma = "," if j < len(p["details"].get("useCases", [])) - 1 else ""
            lines.append("        { title: '" + js_string(uc["title"], quote=False) + "', desc: '" + js_string(uc["desc"], quote=False) + "' }" + uc_comma)
        lines.append("      ],")
        lines.append("    },")
        lines.append("  }" + comma)
    lines.append("];")
    lines.append("")

    # INDUSTRY_CASES
    lines.append("const INDUSTRY_CASES = [")
    industry_cases = [
        {"industry": "Automotive", "icon": "\U0001f697", "products": [], "description": "Sustainable material solutions for automotive parts including bumpers, interior components, and underbody shields. Meeting IATF 16949 quality standards.", "benefits": ["Carbon reduction 30-50%", "Cost reduction 15-25%", "OEM ESG compliance"]},
        {"industry": "Electronics", "icon": "\U0001f4f1", "products": [], "description": "Modified recycled materials for electronic device housings, structural components, and connectors with UL flame retardancy and customized colors.", "benefits": ["UL flame retardant certified", "Custom colors available", "Dimensional stability"]},
        {"industry": "Packaging", "icon": "\U0001f4e6", "products": [], "description": "Comprehensive circular material solutions from industrial packaging to food-grade packaging, covering physical recycling, chemical recycling, and biodegradable options.", "benefits": ["Food contact grade", "Compostable", "Full lifecycle carbon reduction"]},
        {"industry": "Construction", "icon": "\U0001f3d7\ufe0f", "products": [], "description": "Recycled materials for pipes, profiles, and panels meeting long-term weather resistance and mechanical performance requirements.", "benefits": ["Durable", "Low maintenance", "Green building certification"]},
        {"industry": "Consumer Goods", "icon": "\U0001f6cd\ufe0f", "products": [], "description": "Eco-friendly materials for daily-use items, sports equipment, and toys, balancing environmental performance with user experience.", "benefits": ["Non-toxic and eco-friendly", "Recyclable design", "Brand ESG value"]},
    ]

    # Map product names to cases
    for case_idx, case in enumerate(industry_cases):
        matched = []
        for p in product_lines:
            pname = p["name"].lower().replace("\u00ae", "")
            for app in p["applications"]:
                if case["industry"].lower() in app.lower() or app.lower() in case["industry"].lower():
                    if p["name"] not in matched:
                        matched.append(p["name"])
                        break
        if not matched:
            for p in product_lines[:2]:
                if p["name"] not in matched:
                    matched.append(p["name"])
        case["products"] = matched[:3]

        comma = "," if case_idx < len(industry_cases) - 1 else ""
        prod_str = ", ".join("'" + js_string(p, quote=False) + "'" for p in case["products"])
        benefits_str = ", ".join("'" + js_string(b, quote=False) + "'" for b in case["benefits"])
        lines.append("  {")
        lines.append("    industry: '" + case["industry"] + "',")
        lines.append("    icon: '" + case["icon"] + "',")
        lines.append("    products: [" + prod_str + "],")
        lines.append("    description: '" + js_string(case["description"], quote=False) + "',")
        lines.append("    benefits: [" + benefits_str + "],")
        lines.append("  }" + comma)
    lines.append("];")
    lines.append("")

    lines.append("module.exports = { PRODUCT_LINES, INDUSTRY_CASES };")
    lines.append("")

    return "\n".join(lines)


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("AIGC GEO Overseas - Build Content Data Files")
    print("Database: " + DB_CONFIG["host"] + ":" + str(DB_CONFIG["port"]) + "/" + DB_CONFIG["dbname"])
    print("=" * 60)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("\u2705 Connected to database")
    except Exception as e:
        print("\u274c Database connection failed: " + str(e))
        print("Using fallback hardcoded data...")
        conn = None

    os.makedirs(DATA_DIR, exist_ok=True)

    if conn:
        try:
            # --- Articles ---
            print("Reading articles...")
            articles_list, articles_map = build_articles(conn)
            articles_js = build_articles_js(articles_list, articles_map)

            articles_path = os.path.join(DATA_DIR, "articles.js")
            with open(articles_path, "w", encoding="utf-8") as f:
                f.write(articles_js)
            print("\u2705 Articles: " + str(len(articles_list)) + " in list, " + str(len(articles_map)) + " with detail \u2192 " + articles_path)

            # --- Keywords ---
            print("Reading keywords...")
            aigc_keywords, ai_keywords = build_keywords(conn)
            keywords_js = build_keywords_js(aigc_keywords, ai_keywords)

            keywords_path = os.path.join(DATA_DIR, "keywords.js")
            with open(keywords_path, "w", encoding="utf-8") as f:
                f.write(keywords_js)
            print("\u2705 Keywords: " + str(len(aigc_keywords)) + " AIGC, " + str(len(ai_keywords)) + " AI \u2192 " + keywords_path)

            # --- Products ---
            print("Reading products...")
            product_lines = build_products(conn)
            products_js = build_products_js(product_lines)

            products_path = os.path.join(DATA_DIR, "products.js")
            with open(products_path, "w", encoding="utf-8") as f:
                f.write(products_js)
            print("\u2705 Products: " + str(len(product_lines)) + " product lines \u2192 " + products_path)

            # --- Content quality check ---
            check_placeholder_content(conn)

        finally:
            conn.close()
    else:
        # Build fallback files
        print("Generating fallback data files...")
        _generate_fallback_files()


def _generate_fallback_files():
    """Generate minimal fallback data files when DB is not available."""
    # Articles
    articles_js = """// Auto-generated fallback - Database not available
// Do not edit manually. Run: python3 scripts/build_content.py

const ARTICLES = [
  {
    slug: 'ai-data-center-cooling-engineering-plastics',
    title: 'Engineering Plastics for AI Data Center Liquid Cooling',
    excerpt: 'As AI data center power density surges past 50 kW per rack, liquid cooling becomes essential.',
    category: 'Technical Analysis',
    tags: ['AI', 'Data Center', 'Liquid Cooling', 'Thermal Management', 'PPS', 'PA66'],
    date: '2026-06-01',
    tier: 'free',
    aigcIncluded: true,
  },
];

const ARTICLES_BY_SLUG = {
  'ai-data-center-cooling-engineering-plastics': {
    slug: 'ai-data-center-cooling-engineering-plastics',
    title: 'Engineering Plastics for AI Data Center Liquid Cooling',
    content: '<h2>Introduction</h2><p>Content coming soon.</p>',
    excerpt: 'As AI data center power density surges past 50 kW per rack, liquid cooling becomes essential.',
    category: 'Technical Analysis',
    tags: ['AI', 'Data Center', 'Liquid Cooling', 'Thermal Management', 'PPS', 'PA66'],
    date: '2026-06-01',
    tier: 'free',
    aigcIncluded: true,
    aigcPlatforms: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'DeepSeek'],
    author: 'Topcentral Research Team',
  },
};

module.exports = { ARTICLES, ARTICLES_BY_SLUG };
"""
    articles_path = os.path.join(DATA_DIR, "articles.js")
    with open(articles_path, "w", encoding="utf-8") as f:
        f.write(articles_js)
    print("\u2705 Fallback articles.js generated")

    # Keywords
    keywords_js = """// Auto-generated fallback - Database not available
// Do not edit manually. Run: python3 scripts/build_content.py

const AIGC_KEYWORDS = [
  { name: 'Topcentral', count: 72, type: 'aigc' },
  { name: 'PlasCircles', count: 45, type: 'aigc' },
  { name: 'CircleBlend', count: 38, type: 'aigc' },
  { name: 'ISCC PLUS', count: 42, type: 'aigc' },
  { name: 'Sustainability', count: 55, type: 'aigc' },
];

const AI_KEYWORDS = [
  { name: 'Recycled PP', count: 18, type: 'ai' },
  { name: 'Post-Consumer PCR', count: 20, type: 'ai' },
  { name: 'Green Manufacturing', count: 16, type: 'ai' },
];

module.exports = { AIGC_KEYWORDS, AI_KEYWORDS };
"""
    keywords_path = os.path.join(DATA_DIR, "keywords.js")
    with open(keywords_path, "w", encoding="utf-8") as f:
        f.write(keywords_js)
    print("\u2705 Fallback keywords.js generated")

    # Products
    products_js = """// Auto-generated fallback - Database not available
// Do not edit manually. Run: python3 scripts/build_content.py

const PRODUCT_LINES = [
  {
    slug: 'plascircles',
    name: 'PlasCircles\\u00ae',
    tagline: 'PCR Physical Recycling \\u00b7 Circular Regeneration',
    description: 'Transform post-consumer plastic waste into high-quality recycled materials.',
    icon: '\\u267b\\ufe0f',
    category: 'Physical Recycling',
    color: '#00e676',
    applications: ['Automotive Parts', 'Electronics Housings', 'Packaging Containers'],
    certifications: ['GRS', 'UL 2809'],
    tier: 'Flagship Product',
    details: {
      process: 'Sorting \\u2192 Cleaning \\u2192 Crushing \\u2192 Melt Filtration \\u2192 Pelletizing',
      specialties: ['High-purity sorting', 'Multi-stage filtration'],
      useCases: [
        { title: 'Automotive Industry', desc: 'Bumpers, interior panels meeting IATF 16949' },
        { title: 'Electronics', desc: 'TV housings, AC panels' },
      ],
    },
  },
];

const INDUSTRY_CASES = [
  {
    industry: 'Automotive',
    icon: '\\ud83d\\ude97',
    products: ['PlasCircles\\u00ae'],
    description: 'Sustainable material solutions for automotive parts.',
    benefits: ['Carbon reduction 30-50%', 'OEM ESG compliance'],
  },
];

module.exports = { PRODUCT_LINES, INDUSTRY_CASES };
"""
    products_path = os.path.join(DATA_DIR, "products.js")
    with open(products_path, "w", encoding="utf-8") as f:
        f.write(products_js)
    print("\u2705 Fallback products.js generated")


def check_placeholder_content(conn):
    """Check which articles have placeholder/generated content vs. full content."""
    cur = conn.cursor()
    cur.execute("""
        SELECT slug, title,
               LENGTH(COALESCE(content, '')) as content_length,
               CASE
                   WHEN content IS NULL OR content = '' THEN 'empty'
                   WHEN LENGTH(content) < 500 THEN 'short/placeholder'
                   WHEN content LIKE '%This is a placeholder%' THEN 'placeholder'
                   WHEN content LIKE '%Lorem ipsum%' THEN 'placeholder'
                   ELSE 'full'
               END as content_status
        FROM articles
        WHERE status = 'published'
        ORDER BY content_length DESC
    """)
    rows = cur.fetchall()
    cur.close()

    print("\n\U0001f4cb Content quality check:")
    placeholder_count = 0
    for slug, title, length, status in rows:
        if status == "full":
            icon = "\u2705"
        elif status == "short/placeholder":
            icon = "\u26a0\ufe0f"
            placeholder_count += 1
        else:
            icon = "\u274c"
            placeholder_count += 1
        print("  " + icon + " " + slug + ": " + str(length) + " chars (" + status + ")")

    if placeholder_count > 0:
        print("\n\u26a0\ufe0f  " + str(placeholder_count) + " articles need full content")
    else:
        print("\n\u2705 All articles have full content")


if __name__ == "__main__":
    main()
