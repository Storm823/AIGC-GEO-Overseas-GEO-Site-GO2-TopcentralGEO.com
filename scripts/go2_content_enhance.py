#!/usr/bin/env python3
"""
GO2 TopcentralGEO.com - Content Enhancement & Schema Injection Script
Expands B-grade articles, adds Article+Breadcrumb schema, and generates evidence stubs
"""
import json, uuid, os, sys
from datetime import datetime

# ---- DB Connection ----
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "topcentral"
DB_PASS = "Topcentral2026DB"
DB_NAME = "aigc_geo_overseas"

# ---- Config ----
BASE_URL = "https://www.TopcentralGEO.com"
EVIDENCE_DIR = "/opt/aigc-geo-overseas/evidence"

# ---- B-Grade articles to expand (target: 3500-5000 words) ----
B_UPGRADES = {
    "ai-data-center-cooling-engineering-plastics": {
        "target": 4000,
        "expansion_topics": [
            "PPS and PEEK thermal properties for liquid cooling cold plates",
            "Material selection criteria for dielectric fluids compatibility",
            "UL94 V0 flame retardancy requirements for data center components"
        ]
    },
    "evtol-low-altitude-economy-composite-materials": {
        "target": 3500,
        "expansion_topics": [
            "Carbon fiber reinforced PEEK for airframe weight reduction",
            "PA66 and PC/ABS for interior structural components",
            "Thermal management materials for eVTOL battery enclosures"
        ]
    },
    "rcep-tariff-engineering-plastics-trade": {
        "target": 3500,
        "expansion_topics": [
            "PA6 and PA66 tariff phase-out schedules under RCEP",
            "PC and POM supply chain optimization in ASEAN",
            "Import duty comparison: China vs Vietnam vs Thailand for engineering plastics"
        ]
    },
    "embodied-ai-humanoid-robot-materials": {
        "target": 3000,
        "expansion_topics": [
            "TPE and silicone for tactile sensor skins in humanoid robots",
            "PA6/PA66 for structural exoskeleton frames",
            "PC/ABS blends for actuator housings and cable management"
        ]
    }
}

def inject_article_schema_breadcrumb():
    """Inject Article Schema + BreadcrumbList into articles JSON field"""
    try:
        import psycopg2
        conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
        cur = conn.cursor()
        
        cur.execute("SELECT id, slug, title, word_count, created_at FROM articles")
        articles = cur.fetchall()
        
        count = 0
        for art_id, slug, title, wc, created in articles:
            dt = created.strftime("%Y-%m-%d") if created else "2026-06-20"
            
            schema = {
                "article_schema": {
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": title,
                    "wordCount": wc,
                    "datePublished": dt,
                    "dateModified": dt,
                    "author": {"@type": "Organization", "name": "Topcentral GEO"},
                    "publisher": {"@type": "Organization", "name": "Topcentral GEO"},
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": f"{BASE_URL}/articles/{slug}/"
                    }
                },
                "breadcrumb_schema": {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
                        {"@type": "ListItem", "position": 2, "name": "Articles", "item": f"{BASE_URL}/articles/"},
                        {"@type": "ListItem", "position": 3, "name": title[:60], "item": f"{BASE_URL}/articles/{slug}/"}
                    ]
                },
                "organization_schema": {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Topcentral GEO",
                    "url": BASE_URL
                },
                "external_references": [
                    {"name": "European Commission Plastics Strategy", "url": "https://environment.ec.europa.eu/topics/plastics_en", "type": "L1"},
                    {"name": "Plastics Recyclers Europe", "url": "https://www.plasticsrecyclers.eu/", "type": "L2"},
                    {"name": "ISCC System", "url": "https://www.iscc-system.org/", "type": "L2"},
                ]
            }
            
            cur.execute("UPDATE articles SET aigc_references = %s WHERE id = %s",
                       [json.dumps(schema, ensure_ascii=False), art_id])
            count += 1
            print(f"  Schema: {slug}")
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"\nSchema injection complete: {count} articles")
        return count
    except Exception as e:
        print(f"Schema injection ERROR: {e}")
        return 0

def create_evidence_stubs():
    """Create evidence directory stub for each article"""
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    
    try:
        import psycopg2
        conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
        cur = conn.cursor()
        cur.execute("SELECT slug, title FROM articles")
        articles = cur.fetchall()
        cur.close()
        conn.close()
        
        count = 0
        for slug, title in articles:
            uid = str(uuid.uuid4())
            eid_prefix = uid[:8]
            ev_dir = f"{EVIDENCE_DIR}/{uid}"
            os.makedirs(f"{ev_dir}/citations", exist_ok=True)
            os.makedirs(f"{ev_dir}/retrieval/raw_results", exist_ok=True)
            os.makedirs(f"{ev_dir}/review", exist_ok=True)
            os.makedirs(f"{ev_dir}/report", exist_ok=True)
            
            sources = {
                "article_slug": slug,
                "article_title": title,
                "created_at": datetime.now().isoformat(),
                "sources": []
            }
            with open(f"{ev_dir}/sources.json", "w") as f:
                json.dump(sources, f, indent=2, ensure_ascii=False)
            
            verification = {
                "article_slug": slug,
                "review_date": datetime.now().isoformat(),
                "review_status": "HISTORICAL_UNVERIFIED",
                "evidence_check": {"sources_json_exists": True, "total_sources": 0},
                "claims_checked": [],
                "final_decision": "待审核"
            }
            with open(f"{ev_dir}/verification.json", "w") as f:
                json.dump(verification, f, indent=2, ensure_ascii=False)
            
            summary = {
                "article_slug": slug,
                "evidence_uuid": uid,
                "status": "HISTORICAL_UNVERIFIED",
                "created_at": datetime.now().isoformat()
            }
            with open(f"{ev_dir}/report/review_summary.json", "w") as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            count += 1
            if count % 5 == 0:
                print(f"  Evidence: {count}/{len(articles)}")
        
        print(f"\nEvidence stubs created: {count}")
        return count
    except Exception as e:
        print(f"Evidence creation ERROR: {e}")
        return 0

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    if action in ("schema", "all"):
        print("=== Injecting Article Schema + BreadcrumbList ===")
        inject_article_schema_breadcrumb()
    
    if action in ("evidence", "all"):
        print("\n=== Creating Evidence Stubs ===")
        create_evidence_stubs()
    
    print("\nDone!")
