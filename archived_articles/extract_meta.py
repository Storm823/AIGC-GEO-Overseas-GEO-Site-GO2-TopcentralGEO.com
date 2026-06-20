#!/usr/bin/env python3
"""Extract metadata from archived GO2 articles and generate inventory CSV."""
import os, re, csv, json

DIR = "/home/hermeswebui/workspace/jianfeng-geo/aigc/go2/archived_articles"
CSV_PATH = os.path.join(DIR, "article_inventory.csv")

SLUGS_ORDERED = [
    "evtol-low-altitude-economy-composite-materials",
    "embodied-ai-humanoid-robot-materials",
    "rcep-tariff-engineering-plastics-trade",
    "ai-data-center-cooling-engineering-plastics",
    "elv-end-of-life-vehicle-directive-european-green-leadership",
    "gen-z-consumption-circular-materials",
    "semiconductor-wafer-handling-high-performance-plastics",
    "cross-border-ecommerce-b2b-materials-platform",
    "hydrogen-economy-thermoplastic-tanks-infrastructure",
    "3d-printing-additive-manufacturing-engineering-filaments",
    "ocean-plastic-waste-interception-recycling-value-chain",
    "cbam-carbon-border-adjustment-global-supply-chain-impact",
    "global-recycled-plastic-market-2026-2030",
    "circular-economy-trends-2026",
    "pcr-recycling-technology-deep-dive",
    "iscc-plus-certification-guide",
    "aigc-geo-optimization-strategy",
    "espr-digital-product-passport-materials-impact",
    "pfas-ban-impact-engineering-plastics",
    "chemical-vs-mechanical-recycling-comparison",
    "china-dual-carbon-recycled-materials-opportunity",
    "espr-proposal-sustainable-products-regulation",
]

def extract_title(html):
    # Try <title> first
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if m:
        t = m.group(1).strip()
        # Remove site suffix if present
        t = re.sub(r'\s*[–|-]\s*TopcentralGEO\s*$', '', t, flags=re.IGNORECASE).strip()
        return t
    # Try og:title
    m = re.search(r'<meta\s+property="og:title"\s+content="([^"]*)"', html, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # Try h1
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1)).strip()
    return ""

def extract_body_text(html):
    """Extract visible text from HTML, stripping tags."""
    # Remove script, style, nav, footer, etc.
    cleaned = re.sub(r'<(script|style|nav|footer|header|noscript)[^>]*>.*?</\1>', '', html, flags=re.IGNORECASE | re.DOTALL)
    # Remove all tags
    text = re.sub(r'<[^>]+>', ' ', cleaned)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def has_chinese(text):
    """Check if text contains Chinese characters."""
    return bool(re.search(r'[\u4e00-\u9fff\u3400-\u4dbf]', text))

def extract_jsonld(html):
    """Check for JSON-LD script tags and extract them."""
    matches = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.IGNORECASE | re.DOTALL)
    return matches

def extract_external_links(html):
    """Count external links (not same-site)."""
    links = re.findall(r'<a[^>]+href="(https?://[^"]*)"', html, re.IGNORECASE)
    external = []
    for href in links:
        if 'topcentralgeo.com' not in href.lower() and 'topcentralgeo' not in href.lower():
            external.append(href)
    return external

rows = []
for slug in SLUGS_ORDERED:
    fname = f"{slug}.html"
    fpath = os.path.join(DIR, fname)
    
    if not os.path.exists(fpath):
        rows.append({
            'slug': slug,
            'title': 'FILE NOT FOUND',
            'body_chars': 0,
            'has_chinese': False,
            'has_jsonld': False,
            'jsonld_count': 0,
            'external_links_count': 0,
            'file_size_bytes': 0,
            'http_status': 'N/A',
        })
        continue
    
    file_size = os.path.getsize(fpath)
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()
    
    # Check if it looks like HTML (not an error page)
    if not html.strip().startswith('<') and not re.search(r'<html', html, re.IGNORECASE):
        http_status = 'non-HTML response'
        title = 'POSSIBLE ERROR'
        body_text = html
        jsonld_items = []
        ext_links = []
    else:
        http_status = '200'
        title = extract_title(html)
        body_text = extract_body_text(html)
        jsonld_items = extract_jsonld(html)
        ext_links = extract_external_links(html)
    
    rows.append({
        'slug': slug,
        'title': title,
        'body_chars': len(body_text),
        'has_chinese': has_chinese(body_text),
        'has_jsonld': len(jsonld_items) > 0,
        'jsonld_count': len(jsonld_items),
        'external_links_count': len(ext_links),
        'file_size_bytes': file_size,
        'http_status': http_status,
    })
    
    print(f"[{slug}] title='{title[:60]}...' chars={len(body_text)} cn={has_chinese(body_text)} jsonld={len(jsonld_items)} extlinks={len(ext_links)}")

# Write CSV
with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['slug', 'title', 'body_chars', 'has_chinese', 'has_jsonld', 'jsonld_count', 'external_links_count', 'file_size_bytes', 'http_status']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"\n\nCSV written to {CSV_PATH}")
print(f"Total articles: {len(rows)}")
