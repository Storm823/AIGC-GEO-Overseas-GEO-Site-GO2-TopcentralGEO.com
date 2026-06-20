#!/usr/bin/env python3
"""
Generate sitemap.xml locally (no DB dependency) from archived HTML files.
Writes directly to visitor-site/public/sitemap.xml with trailing slashes.

Usage:
    python3 scripts/update_sitemap_local.py
"""

import os
from datetime import datetime, timezone
from xml.etree.ElementTree import Element, tostring
from xml.dom import minidom

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://www.TopcentralGEO.com"
ARCHIVED_DIR = os.path.join(BASE_DIR, "archived_articles")
OUTPUT = os.path.join(BASE_DIR, "visitor-site", "public", "sitemap.xml")


def prettify(elem):
    rough_string = tostring(elem, encoding="unicode", method="xml")
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")


def get_article_slugs():
    """Extract slugs from archived HTML filenames."""
    slugs = []
    if os.path.isdir(ARCHIVED_DIR):
        for fname in sorted(os.listdir(ARCHIVED_DIR)):
            if fname.endswith(".html"):
                slug = fname.replace(".html", "")
                slugs.append(slug)
    return slugs


def generate():
    article_slugs = get_article_slugs()

    urlset = Element("urlset")
    urlset.set("xmlns", "https://www.sitemaps.org/schemas/sitemap/0.9")

    # Static pages with trailing slashes
    static_pages = [
        {"loc": "/", "changefreq": "weekly", "priority": "1.0"},
        {"loc": "/articles/", "changefreq": "daily", "priority": "0.9"},
        {"loc": "/products/", "changefreq": "weekly", "priority": "0.8"},
        {"loc": "/about/", "changefreq": "monthly", "priority": "0.7"},
        {"loc": "/contact/", "changefreq": "monthly", "priority": "0.6"},
        {"loc": "/privacy/", "changefreq": "monthly", "priority": "0.4"},
        {"loc": "/terms/", "changefreq": "monthly", "priority": "0.4"},
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

    # Article pages — all with trailing slash
    for slug in article_slugs:
        u = Element("url")
        loc = Element("loc")
        loc.text = f"{BASE_URL}/articles/{slug}/"
        u.append(loc)
        lastmod = Element("lastmod")
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

    print(f"✅ Local sitemap generated with {len(static_pages) + len(article_slugs)} URLs")
    print(f"   → {OUTPUT}")
    if article_slugs:
        print(f"   Articles ({len(article_slugs)}):")
        for s in article_slugs:
            print(f"     - /articles/{s}/")
    return len(static_pages) + len(article_slugs)


if __name__ == "__main__":
    print("=" * 60)
    print("AIGC GEO Overseas - Local Sitemap Generator")
    print(f"Archived articles dir: {ARCHIVED_DIR}")
    print("=" * 60)
    generate()
    print("Done!")
