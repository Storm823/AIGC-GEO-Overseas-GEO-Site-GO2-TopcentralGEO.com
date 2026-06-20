#!/usr/bin/env python3
"""
HISTORICAL_UNVERIFIED Tag Script — GO2 TopcentralGEO.com

For each article published before 2026-06-20, generates an HTML comment
block marking it as HISTORICAL_UNVERIFIED, indicating data citations
have not been independently verified.

Outputs:
  1. A report file: mark_historical_unverified_report.txt
  2. Optionally injects markers into each archived_articles/*.html file

Usage:
    python3 scripts/mark_historical_unverified.py              # dry-run (report only)
    python3 scripts/mark_historical_unverified.py --apply       # inject markers into HTML files
    python3 scripts/mark_historical_unverified.py --help        # show help
"""

import os
import sys
import re
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVED_DIR = os.path.join(BASE_DIR, "archived_articles")
REPORT_FILE = os.path.join(BASE_DIR, "scripts", "mark_historical_unverified_report.txt")

# The cut-off date: all articles published before this date get the marker
CUTOFF_DATE = "2026-06-20"

MARKER_COMMENT = "<!-- HISTORICAL_UNVERIFIED: This article was published before {cutoff}. Data citations have not been independently verified. -->"

ALL_SLUGS = [
    "3d-printing-additive-manufacturing-engineering-filaments",
    "ai-data-center-cooling-engineering-plastics",
    "aigc-geo-optimization-strategy",
    "cbam-carbon-border-adjustment-global-supply-chain-impact",
    "chemical-vs-mechanical-recycling-comparison",
    "china-dual-carbon-recycled-materials-opportunity",
    "circular-economy-trends-2026",
    "cross-border-ecommerce-b2b-materials-platform",
    "elv-end-of-life-vehicle-directive-european-green-leadership",
    "embodied-ai-humanoid-robot-materials",
    "espr-digital-product-passport-materials-impact",
    "espr-proposal-sustainable-products-regulation",
    "evtol-low-altitude-economy-composite-materials",
    "gen-z-consumption-circular-materials",
    "global-recycled-plastic-market-2026-2030",
    "hydrogen-economy-thermoplastic-tanks-infrastructure",
    "iscc-plus-certification-guide",
    "ocean-plastic-waste-interception-recycling-value-chain",
    "pcr-recycling-technology-deep-dive",
    "pfas-ban-impact-engineering-plastics",
    "rcep-tariff-engineering-plastics-trade",
    "semiconductor-wafer-handling-high-performance-plastics",
]

# Articles that are published (status=published in seed_db) vs draft
# From seed_db.py:
# Published (B-grade): 4 articles
# Draft (C-grade): 10 articles (but we now have 22 archived HTML files)
# ALL 22 archived articles were created before the cutoff, so all get the marker
PUBLISHED_SLUGS = {
    "ai-data-center-cooling-engineering-plastics",
    "evtol-low-altitude-economy-composite-materials",
    "embodied-ai-humanoid-robot-materials",
    "rcep-tariff-engineering-plastics-trade",
}

DRAFT_SLUGS = set(ALL_SLUGS) - PUBLISHED_SLUGS


def get_title_from_html(filepath):
    """Extract <title> from an HTML file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read(4096)  # Read first 4KB for head
        m = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
        if m:
            return m.group(1).strip()
    except Exception:
        pass
    return None


def slug_to_filename(slug):
    return os.path.join(ARCHIVED_DIR, f"{slug}.html")


def generate_report():
    """Generate the report file with marker details for all 22 articles."""
    lines = []
    lines.append("=" * 72)
    lines.append("HISTORICAL_UNVERIFIED MARKING REPORT")
    lines.append(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")
    lines.append(f"Cut-off date: {CUTOFF_DATE}")
    lines.append(f"Total articles: {len(ALL_SLUGS)}")
    lines.append("=" * 72)
    lines.append("")

    for slug in ALL_SLUGS:
        marker = MARKER_COMMENT.format(cutoff=CUTOFF_DATE)
        filepath = slug_to_filename(slug)
        title = get_title_from_html(filepath)
        file_exists = os.path.isfile(filepath)

        lines.append(f"--- Article: {slug} ---")
        lines.append(f"  Title:       {title or 'N/A'}")
        lines.append(f"  HTML File:   {filepath}")
        lines.append(f"  File exists: {'YES' if file_exists else 'NO'}")
        if slug in PUBLISHED_SLUGS:
            lines.append(f"  Status:      PUBLISHED (B-grade)")
        else:
            lines.append(f"  Status:      DRAFT (C-grade)")
        lines.append(f"  Marker:")
        lines.append(f"    {marker}")
        lines.append("")

    lines.append("=" * 72)
    lines.append(f"SUMMARY")
    lines.append(f"  Published articles: {len(PUBLISHED_SLUGS)}")
    lines.append(f"  Draft articles:     {len(DRAFT_SLUGS)}")
    lines.append(f"  Total:              {len(ALL_SLUGS)}")
    lines.append(f"  All marked as HISTORICAL_UNVERIFIED (pre-{CUTOFF_DATE})")
    lines.append("=" * 72)

    return "\n".join(lines)


def inject_marker_into_html(slug, dry_run=False):
    """
    Inject the HISTORICAL_UNVERIFIED comment into the HTML <head> section,
    right after <title> or at the start of <head>.
    """
    filepath = slug_to_filename(slug)
    if not os.path.isfile(filepath):
        return False, "File not found"

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    marker = MARKER_COMMENT.format(cutoff=CUTOFF_DATE)

    # Check if already marked
    if f"HISTORICAL_UNVERIFIED" in content:
        return False, "Already marked"

    # Inject after <title>...</title> if found
    m = re.search(r"(</title>\s*)", content, re.IGNORECASE)
    if m:
        insert_pos = m.end()
        new_content = content[:insert_pos] + "\n" + marker + "\n" + content[insert_pos:]
    else:
        # Inject after <head>
        m = re.search(r"(<head[^>]*>\s*)", content, re.IGNORECASE)
        if m:
            insert_pos = m.end()
            new_content = content[:insert_pos] + "\n" + marker + "\n" + content[insert_pos:]
        else:
            # Prepend at the very beginning
            new_content = marker + "\n" + content

    if not dry_run:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True, "Marker injected"
    else:
        return True, "Would inject (dry-run)"


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Mark GO2 articles as HISTORICAL_UNVERIFIED (pre-2026-06-20)",
    )
    parser.add_argument("--apply", action="store_true",
                        help="Apply markers by injecting into archived HTML files")
    parser.add_argument("--dry-run", action="store_true", default=True,
                        help="Show what would be done without making changes (default)")
    args = parser.parse_args()

    # If --apply is specified, dry_run is False
    dry_run = not args.apply

    print("=" * 72)
    print("GO2 TopcentralGEO.com — HISTORICAL_UNVERIFIED Marker")
    print(f"Cut-off date: {CUTOFF_DATE}")
    print(f"Mode: {'DRY-RUN (report only)' if dry_run else 'APPLY (inject markers)'}")
    print("=" * 72)

    if dry_run:
        # Generate report only
        report = generate_report()
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"\nReport written to: {REPORT_FILE}")
        print("\n" + report)
    else:
        # Generate report first
        report = generate_report()
        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            f.write(report)

        # Inject markers
        injected = 0
        already_marked = 0
        not_found = 0
        errors = []

        for slug in ALL_SLUGS:
            success, msg = inject_marker_into_html(slug, dry_run=False)
            if success:
                injected += 1
                print(f"  ✅ {slug}: {msg}")
            elif msg == "Already marked":
                already_marked += 1
                print(f"  ⏩ {slug}: Already marked (skipped)")
            elif msg == "File not found":
                not_found += 1
                errors.append(slug)
                print(f"  ❌ {slug}: HTML file not found")

        print(f"\n{'=' * 72}")
        print(f"INJECTION SUMMARY")
        print(f"  Injected:      {injected}")
        print(f"  Already marked: {already_marked}")
        print(f"  Not found:     {not_found}")
        if errors:
            print(f"  Missing files: {', '.join(errors)}")
        print(f"{'=' * 72}")
        print(f"Report: {REPORT_FILE}")

    print("\nDone!")


if __name__ == "__main__":
    main()
