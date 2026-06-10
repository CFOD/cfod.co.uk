#!/usr/bin/env python3
"""
Global Stratum - Article Publisher
===================================
Converts a Word document (.docx) to a branded PDF and publishes it to
newsletter.cfod.co.uk via Firebase Storage + Firestore.

Requirements
------------
    pip install python-docx firebase-admin
    pandoc       https://pandoc.org/installing.html
    pdflatex     https://miktex.org  (Windows) or texlive

Firebase Setup
--------------
    1. Firebase Console > Project Settings > Service Accounts
    2. Click "Generate new private key" > save as tools/serviceAccount.json

Usage
-----
    python post_article.py article.docx
    python post_article.py article.docx --category Geopolitics --draft
    python post_article.py article.docx --no-upload   # PDF only, no Firebase
"""

import argparse
import subprocess
import sys
import re
import shutil
from pathlib import Path
from datetime import datetime

# Dependency checks
try:
    from docx import Document
except ImportError:
    sys.exit("Missing dependency: pip install python-docx")

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
except ImportError:
    sys.exit("Missing dependency: pip install firebase-admin")

# Config
TOOLS_DIR      = Path(__file__).parent.resolve()
TEMPLATE       = TOOLS_DIR / "globalstratum.tex"
SERVICE_ACCT   = TOOLS_DIR / "serviceAccount.json"
STORAGE_BUCKET = "global-stratum.firebasestorage.app"
SITE_URL       = "https://newsletter.cfod.co.uk"
CATEGORIES     = ["Geopolitics", "Policy", "Analysis", "Conflict", "Economics", "Intelligence"]


# ── HELPERS ───────────────────────────────────────────────────────────────────

def slugify(text):
    s = text.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return re.sub(r"-+", "-", s)

def reading_time(text):
    return max(1, round(len(text.split()) / 200))

def format_date():
    d = datetime.now()
    return f"{d.day} {d.strftime('%B %Y')}"

def hr():
    print("  " + chr(8212) * 44)

def prompt(label, default=""):
    disp = f" [{default}]" if default else ""
    val = input(f"  {label}{disp}: ").strip()
    return val if val else default

def pick(label, options, default=0):
    print(f"\n  {label}")
    for i, opt in enumerate(options):
        marker = "  <--" if i == default else ""
        print(f"    {i + 1}. {opt}{marker}")
    while True:
        raw = input(f"  Choice [1-{len(options)}] ({default + 1}): ").strip()
        if not raw:
            return options[default]
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]

def confirm(msg, default=True):
    suffix = " [Y/n] " if default else " [y/N] "
    raw = input(msg + suffix).strip().lower()
    return default if not raw else raw.startswith("y")


# ── DOCX PARSING ──────────────────────────────────────────────────────────────

def parse_docx(path):
    """Extract title and lede from Word document structure."""
    doc = Document(path)
    title = ""
    lede  = ""
    body_parts = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        is_heading = para.style.name.lower().startswith("heading")
        if not title:
            if is_heading or len(text) <= 120:
                title = text
            else:
                body_parts.append(text)
        elif not lede and not is_heading:
            lede = text
            body_parts.append(text)
        else:
            body_parts.append(text)

    return {"title": title, "lede": lede, "body": " ".join(body_parts)}


# ── PDF GENERATION ────────────────────────────────────────────────────────────

def generate_pdf(docx_path, output_path, meta):
    if not shutil.which("pandoc"):
        sys.exit(
            "\n  pandoc not found.\n"
            "  Install from: https://pandoc.org/installing.html\n"
            "  Then restart your terminal."
        )
    if not TEMPLATE.exists():
        sys.exit(f"\n  LaTeX template not found: {TEMPLATE}")

    cmd = [
        "pandoc", str(docx_path),
        "--template",   str(TEMPLATE),
        "--pdf-engine", "pdflatex",
        "-V", f"title={meta['title']}",
        "-V", f"lede={meta['lede']}",
        "-V", f"category={meta['category']}",
        "-V", f"date={format_date()}",
        "-V", f"readtime={reading_time(meta['body'])}",
        "--output", str(output_path),
    ]

    print("\n  Generating PDF...", end="", flush=True)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"\n\n  Error:\n{result.stderr}")
        sys.exit(1)
    print(f" done  ->  {output_path.name}")


# ── FIREBASE ──────────────────────────────────────────────────────────────────

def init_firebase():
    if not SERVICE_ACCT.exists():
        print(f"""
  Firebase service account key not found.

  To fix:
    1. Go to Firebase Console > Project Settings > Service Accounts
    2. Click "Generate new private key"
    3. Save the file as: {SERVICE_ACCT}
""")
        sys.exit(1)
    cred = credentials.Certificate(str(SERVICE_ACCT))
    firebase_admin.initialize_app(cred, {"storageBucket": STORAGE_BUCKET})


def upload_pdf(pdf_path, slug):
    bucket = storage.bucket()
    blob   = bucket.blob(f"articles/{slug}.pdf")
    print("  Uploading PDF...", end="", flush=True)
    blob.upload_from_filename(str(pdf_path), content_type="application/pdf")
    blob.make_public()
    print(" done")
    return blob.public_url


def publish_article(meta, pdf_url, draft):
    db  = firestore.client()
    col = db.collection("articles")
    now = int(datetime.now().timestamp() * 1000)

    data = {
        "title":     meta["title"],
        "slug":      meta["slug"],
        "category":  meta["category"],
        "lede":      meta["lede"],
        "summary":   meta["lede"],
        "imageUrl":  meta.get("imageUrl", ""),
        "pdfUrl":    pdf_url,
        "body":      "",
        "status":    "draft" if draft else "published",
        "updatedAt": now,
    }

    print("  Writing to Firestore...", end="", flush=True)
    existing = list(col.where("slug", "==", meta["slug"]).limit(1).stream())
    if existing:
        doc_ref = col.document(existing[0].id)
        data["createdAt"] = existing[0].to_dict().get("createdAt", now)
        doc_ref.update(data)
        print(f" done (updated {existing[0].id})")
        return existing[0].id
    else:
        data["createdAt"] = now
        _, doc_ref = col.add(data)
        print(f" done (created {doc_ref.id})")
        return doc_ref.id


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Publish a Word doc as a Global Stratum article."
    )
    parser.add_argument("docx",        help="Path to .docx file")
    parser.add_argument("--category",  "-c", choices=CATEGORIES)
    parser.add_argument("--draft",     "-d", action="store_true",
                        help="Publish as draft (not publicly visible)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Generate PDF only, skip Firebase")
    args = parser.parse_args()

    docx_path = Path(args.docx).resolve()
    if not docx_path.exists():
        sys.exit(f"File not found: {docx_path}")
    if docx_path.suffix.lower() != ".docx":
        sys.exit("File must be a .docx Word document")

    print(f"\n  Global Stratum - Article Publisher")
    hr()

    # Parse Word doc
    meta = parse_docx(docx_path)
    print(f"\n  Detected:")
    print(f"    Title  ->  {meta['title'] or '(none)'}")
    lede_preview = meta['lede'][:72] + "..." if len(meta['lede']) > 72 else meta['lede']
    print(f"    Lede   ->  {lede_preview or '(none)'}")

    # Metadata prompts
    print()
    meta["title"]    = prompt("Headline", meta["title"])
    meta["slug"]     = prompt("Slug", slugify(meta["title"]))
    meta["category"] = args.category or pick("Category:", CATEGORIES)

    print(f"\n  Lede (shown large at the top of the article):")
    print(f"  Current: {meta['lede'] or '(empty)'}")
    new_lede = input("  Edit (Enter to keep): ").strip()
    if new_lede:
        meta["lede"] = new_lede

    meta["imageUrl"] = prompt("Cover image URL (optional)", "")

    # Summary
    print()
    hr()
    print(f"  Title     {meta['title']}")
    print(f"  Slug      {meta['slug']}")
    print(f"  Category  {meta['category']}")
    print(f"  Status    {'DRAFT' if args.draft else 'PUBLISHED'}")
    if meta["imageUrl"]:
        print(f"  Image     {meta['imageUrl']}")
    hr()

    if not confirm("\n  Proceed?"):
        sys.exit("  Cancelled.")

    # Generate PDF
    output_pdf = docx_path.parent / f"{meta['slug']}.pdf"
    generate_pdf(docx_path, output_pdf, meta)

    if args.no_upload:
        print(f"\n  PDF saved: {output_pdf}\n")
        return

    # Firebase
    print()
    init_firebase()
    pdf_url = upload_pdf(output_pdf, meta["slug"])
    publish_article(meta, pdf_url, args.draft)

    article_url = f"{SITE_URL}/article/{meta['slug']}"
    print()
    hr()
    print(f"  Article   {article_url}")
    print(f"  PDF       {pdf_url}")
    hr()
    msg = "Published as draft -- log in to make it live." if args.draft else "Article is live."
    print(f"  {msg}\n")


if __name__ == "__main__":
    main()
