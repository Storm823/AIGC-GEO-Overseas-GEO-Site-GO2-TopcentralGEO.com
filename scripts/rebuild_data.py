#!/usr/bin/env python3
"""
Regenerate visitor-site/data/articles.js from PostgreSQL.
Pulls all published articles with correct field mapping.
"""
import subprocess
import json
import os

DB_PASSWORD = os.environ.get("PGPASSWORD", "topcentral123")

def pg(sql):
    r = subprocess.run(
        ["docker", "exec", "-e", f"PGPASSWORD={DB_PASSWORD}",
         "aigc-geo-overseas-postgres", "psql", "-h", "localhost", "-U", "topcentral",
         "-d", "aigc_geo_overseas", "-t", "-A", "-F|||", "-c", sql],
        capture_output=True, text=True, timeout=30
    )
    return r.stdout.strip()


rows = pg("""
    SELECT 
        slug,
        title,
        COALESCE(summary, '') as excerpt,
        COALESCE(category, 'General') as cat,
        COALESCE(tags::text, '[]') as tags,
        grade,
        status,
        word_count,
        COALESCE(published_at::text, '') as pub_date
    FROM articles
    WHERE status = 'published'
    ORDER BY published_at DESC NULLS LAST, created_at DESC
""")

articles_list = []
for line in rows.split('\n'):
    if not line or '|||' not in line:
        continue
    parts = line.split('|||')
    if len(parts) < 8:
        continue

    slug = parts[0].strip()
    title = parts[1].strip()
    excerpt = parts[2].strip()
    cat = parts[3].strip() or 'General'
    tags_json = parts[4].strip()
    grade = parts[5].strip() if len(parts) > 5 else 'C'
    status = parts[6].strip() if len(parts) > 6 else 'draft'
    word_count = parts[7].strip() if len(parts) > 7 else '0'
    pub_date = parts[8].strip()[:10] if len(parts) > 8 and parts[8].strip() else '2026-06-01'

    if not slug:
        continue

    try:
        tags_list = json.loads(tags_json) if tags_json else []
        if not isinstance(tags_list, list):
            tags_list = []
    except Exception:
        tags_list = []

    tier = 'premium' if grade == 'A' else 'free'

    # Escape for JS
    title_js = title.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")
    excerpt_js = excerpt.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", "")[:300]

    tag_str = ', '.join(f"'{t.replace(chr(39), chr(92)+chr(39))}'" for t in tags_list[:8])

    entry = f"""  {{
    slug: '{slug}',
    title: '{title_js}',
    excerpt: '{excerpt_js}',
    category: '{cat}',
    tags: [{tag_str}],
    date: '{pub_date}',
    tier: '{tier}',
    aigcIncluded: true,
  }}"""
    articles_list.append(entry)
    print(f"  {slug}: Grade {grade}, {word_count} words, {cat}")

data = f"""// Auto-generated from PostgreSQL - {len(articles_list)} articles
export const ARTICLES = [
{',\n'.join(articles_list)}
];

export const ARTICLES_BY_SLUG = ARTICLES.reduce((acc, a) => {{
  if (a.slug) acc[a.slug] = a;
  return acc;
}}, {{}});
"""

out_path = '/opt/aigc-geo-overseas/visitor-site/data/articles.js'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(data)

print(f"\n✅ Written: {len(articles_list)} articles to {out_path}")
