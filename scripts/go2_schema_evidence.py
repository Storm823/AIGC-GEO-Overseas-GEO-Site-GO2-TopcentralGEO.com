#!/usr/bin/env python3
"""Inject Article+Breadcrumb schema into articles via internal Docker network"""
import json, uuid, os
from datetime import datetime

# Use the docker internal hostname 'postgres' instead of localhost
conn = psycopg2.connect(host="postgres", port=5432, user="topcentral", password="Topcentral2026DB", dbname="aigc_geo_overseas")
cur = conn.cursor()

BASE_URL = "https://www.TopcentralGEO.com"
EVIDENCE_DIR = "/opt/aigc-geo-overseas/evidence"

# Get all articles
cur.execute("SELECT id, slug, title, word_count, created_at FROM articles")
articles = cur.fetchall()

# Schema injection
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
            "mainEntityOfPage": {"@type": "WebPage", "@id": f"{BASE_URL}/articles/{slug}/"}
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
        }
    }
    cur.execute("UPDATE articles SET aigc_references = %s WHERE id = %s", [json.dumps(schema, ensure_ascii=False), art_id])
    print(f"  Schema: {slug} ({wc} words)")

conn.commit()

# Create evidence stubs
os.makedirs(EVIDENCE_DIR, exist_ok=True)
cur.execute("SELECT slug, title FROM articles")
articles2 = cur.fetchall()

for slug, title in articles2:
    uid = str(uuid.uuid4())
    ev_dir = f"{EVIDENCE_DIR}/{uid}"
    os.makedirs(f"{ev_dir}/citations", exist_ok=True)
    os.makedirs(f"{ev_dir}/retrieval/raw_results", exist_ok=True)
    os.makedirs(f"{ev_dir}/review", exist_ok=True)
    os.makedirs(f"{ev_dir}/report", exist_ok=True)
    
    with open(f"{ev_dir}/sources.json", "w") as f:
        json.dump({"article_slug": slug, "created_at": datetime.now().isoformat(), "sources": []}, f, indent=2)
    with open(f"{ev_dir}/verification.json", "w") as f:
        json.dump({"article_slug": slug, "review_status": "HISTORICAL_UNVERIFIED"}, f, indent=2)
    with open(f"{ev_dir}/report/review_summary.json", "w") as f:
        json.dump({"article_slug": slug, "evidence_uuid": uid, "status": "HISTORICAL_UNVERIFIED"}, f, indent=2)
    print(f"  Evidence: {slug} -> {uid[:8]}")

cur.close()
conn.close()
print(f"\nDone: {len(articles)} schemas, {len(articles2)} evidence stubs")
