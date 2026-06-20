#!/usr/bin/env python3
"""
Generate sitemap.xml from the articles in the database.
Writes to /opt/aigc-geo-overseas/visitor-site/public/sitemap.xml

Usage:
    python3 scripts/update_sitemap.py
    
Connection defaults: host=localhost, db=aigc_geo_overseas
Can be overridden via env vars: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
"""

import os
import sys
from datetime import datetime, timezone
from xml.etree.ElementTree import Element, tostring
from xml.dom import minidom

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

BASE_URL = "https://www.TopcentralGEO.com"
OUTPUT = "/opt/aigc-geo-overseas/visitor-site/public/sitemap.xml"


def prettify(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = tostring(elem, encoding="unicode", method="xml")
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")


def generate():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Fetch all published articles
    cur.execute("""
        SELECT slug, updated_at, published_at
        FROM articles
        WHERE status = 'published'
        ORDER BY published_at DESC NULLS LAST
    """)
    articles = cur.fetchall()
    cur.close()
    conn.close()
    
    urlset = Element("urlset")
    urlset.set("xmlns", "https://www.sitemaps.org/schemas/sitemap/0.9")
    
    # Static pages
    static_pages = [
        {"loc": "/", "changefreq": "weekly", "priority": "1.0"},
        {"loc": "/articles", "changefreq": "daily", "priority": "0.9"},
        {"loc": "/products", "changefreq": "weekly", "priority": "0.8"},
        {"loc": "/about", "changefreq": "monthly", "priority": "0.7"},
        {"loc": "/contact", "changefreq": "monthly", "priority": "0.6"},
        {"loc": "/privacy", "changefreq": "monthly", "priority": "0.4"},
        {"loc": "/terms", "changefreq": "monthly", "priority": "0.4"},
    ]
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    for page in static_pages:
        u = Element("url")
        
        loc = Element("loc")
        loc.text = f"{BASE_URL}{page['loc']}"
        u.append(loc)
        
        lastmod = Element("lastmod")
        lastmod.text = today
        u.append(lastmod)
        
        changefreq = Element("changefreq")
        changefreq.text = page["changefreq"]
        u.append(changefreq)
        
        priority = Element("priority")
        priority.text = page["priority"]
        u.append(priority)
        
        urlset.append(u)
    
    # Article pages
    for slug, updated_at, published_at in articles:
        u = Element("url")
        
        loc = Element("loc")
        loc.text = f"{BASE_URL}/articles/{slug}"
        u.append(loc)
        
        lastmod = Element("lastmod")
        if updated_at:
            lastmod.text = updated_at.strftime("%Y-%m-%d")
        elif published_at:
            lastmod.text = published_at.strftime("%Y-%m-%d")
        else:
            lastmod.text = today
        u.append(lastmod)
        
        changefreq = Element("changefreq")
        changefreq.text = "weekly"
        u.append(changefreq)
        
        priority = Element("priority")
        priority.text = "0.8"
        u.append(priority)
        
        urlset.append(u)
    
    xml_str = prettify(urlset)
    
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(xml_str)
    
    print(f"✅ Sitemap generated with {len(static_pages) + len(articles)} URLs")
    print(f"   → {OUTPUT}")
    return len(static_pages) + len(articles)


if __name__ == "__main__":
    print("=" * 60)
    print("AIGC GEO Overseas - Sitemap Generator")
    print(f"Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}")
    print("=" * 60)
    generate()
    print("Done!")
