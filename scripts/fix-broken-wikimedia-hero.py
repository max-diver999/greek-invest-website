#!/usr/bin/env python3
"""Fix broken Wikimedia heroImage URLs on greek-invest.com and migrate to Cloudinary.

Discovery (2026-07-03 GEO/SEO audit): almost all 88 unique Wikimedia thumb URLs
used as heroImage across src/content are HTTP 404 in production right now
(files renamed/deleted on Commons since they were first linked). This means
nearly every guide/compare hero <img> and og:image is broken on the live site.

This script, for every broken heroImage URL:
1. Derives a search query from the original Wikimedia filename.
2. Queries the Commons Search API for a live, topically-similar replacement image.
3. Verifies the replacement resolves with HTTP 200.
4. Downloads it and uploads it to the niche Cloudinary account (dlrrtf6bq) under
   more-group/greece/wikimedia-hero/{slug}.
5. Rewrites every MDX file's heroImage to the Cloudinary delivery URL
   (w_1200,q_85,f_webp), removing the Wikimedia dependency entirely.

Usage:
  python3 scripts/fix-broken-wikimedia-hero.py --dry-run
  python3 scripts/fix-broken-wikimedia-hero.py
  python3 scripts/fix-broken-wikimedia-hero.py --resume   # skip URLs already in manifest
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context

SCRIPTS = Path(__file__).resolve().parent
ROOT = SCRIPTS.parent
MORE_GROUP = ROOT.parent
CONTENT = ROOT / "src" / "content"

sys.path.insert(0, str(MORE_GROUP / "scripts" / "lib"))
from cloudinary_routing import load_cloudinary_credentials  # noqa: E402

HERO_TRANSFORM = "w_1200,q_85,f_webp"
FOLDER = "more-group/greece/wikimedia-hero"
MANIFEST = SCRIPTS / "greek-invest-wikimedia-fix-manifest.json"
UA = "Mozilla/5.0 (MORE Group Greek Invest research; +https://greek-invest.com)"

HERO_RE = re.compile(r'heroImage:\s*"(https://upload\.wikimedia\.org/[^"]+)"')

STOPWORDS = {"jpg", "jpeg", "png", "the", "in", "at", "of", "a", "an", "on", "by"}
NUMERIC_JUNK_RE = re.compile(r"^\d+$")


def http_get_json(url: str) -> dict | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"    api error: {e}")
        return None


def check_200(url: str) -> bool:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status == 200
    except Exception:
        return False


def search_terms_from_filename(url: str) -> list[str]:
    name = url.rstrip("/").split("/")[-1]
    name = urllib.parse.unquote(name)
    name = re.sub(r"^\d+px-", "", name)
    name = re.sub(r"\.(jpg|jpeg|png|gif)$", "", name, flags=re.I)
    name = re.sub(r"panoramio|_-_panoramio|\(unsplash\)", "", name, flags=re.I)
    words = re.split(r"[\s_,%.\-]+", name)
    words = [w for w in words if w and w.lower() not in STOPWORDS and not NUMERIC_JUNK_RE.match(w)]
    # Try full phrase first, then a shorter 2-3 word fallback.
    full = " ".join(words)
    short = " ".join(words[:3]) if len(words) > 3 else full
    return [q for q in [full, short] if q.strip()]


def commons_search(query: str) -> list[dict]:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": 6,
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "iiurlwidth": 1280,
            "format": "json",
        }
    )
    data = http_get_json(f"https://commons.wikimedia.org/w/api.php?{params}")
    if not data:
        return []
    pages = data.get("query", {}).get("pages", {})
    results = []
    for p in pages.values():
        infos = p.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        mime = info.get("mime", "")
        if not mime.startswith("image/"):
            continue
        if info.get("width", 0) < 800:
            continue
        results.append(
            {
                "title": p.get("title", ""),
                "index": p.get("index", 999),
                "thumburl": info.get("thumburl") or info.get("url"),
            }
        )
    results.sort(key=lambda r: r["index"])
    return results


def find_replacement(url: str) -> tuple[str, str] | None:
    """Returns (replacement_thumb_url, matched_title) or None."""
    for query in search_terms_from_filename(url):
        results = commons_search(query)
        for r in results:
            if check_200(r["thumburl"]):
                return r["thumburl"], r["title"]
        time.sleep(0.3)
    return None


def download_bytes(url: str) -> bytes | None:
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except Exception as e:
            if attempt == 2:
                print(f"    download failed: {e}")
                return None
            time.sleep(1.0)
    return None


def cloudinary_upload(image_bytes: bytes, public_id: str, cloud: str, api_key: str, api_secret: str) -> str | None:
    timestamp = str(int(time.time()))
    sig_str = f"overwrite=true&public_id={public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.sha1(sig_str.encode()).hexdigest()
    boundary = "----MGGreeceWikimediaFixBoundary"

    def field(name: str, value: str) -> bytes:
        return (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'
            f"{value}\r\n"
        ).encode()

    body = b""
    body += field("api_key", api_key)
    body += field("timestamp", timestamp)
    body += field("signature", signature)
    body += field("public_id", public_id)
    body += field("overwrite", "true")
    body += (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="image.jpg"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode()
    body += image_bytes
    body += f"\r\n--{boundary}--\r\n".encode()

    upload_url = f"https://api.cloudinary.com/v1_1/{cloud}/image/upload"
    req = urllib.request.Request(
        upload_url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read()).get("secure_url")
    except urllib.error.HTTPError as e:
        print(f"    Cloudinary HTTP {e.code}: {e.read().decode(errors='replace')[:200]}")
        return None
    except Exception as e:
        print(f"    Cloudinary error: {e}")
        return None


def slug_from_url(url: str) -> str:
    name = url.rstrip("/").split("/")[-1]
    name = urllib.parse.unquote(name)
    name = re.sub(r"^\d+px-", "", name)
    name = re.sub(r"\.(jpg|jpeg|png|gif)$", "", name, flags=re.I)
    name = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    suffix = hashlib.sha1(url.encode()).hexdigest()[:8]
    return f"{(name or 'hero')[:60]}-{suffix}"


def find_mdx_files() -> list[Path]:
    return sorted(CONTENT.rglob("*.mdx"))


def fix_single(url: str, query_override: str | None, dry_run: bool) -> None:
    files = find_mdx_files()
    matches = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        if f'heroImage: "{url}"' in text:
            matches.append(f)
    print(f"{len(matches)} file(s) reference this URL.")

    results = commons_search(query_override) if query_override else []
    if not results:
        for q in search_terms_from_filename(url):
            results = commons_search(q)
            if results:
                break
    replacement_url, matched_title = None, None
    for r in results:
        if check_200(r["thumburl"]):
            replacement_url, matched_title = r["thumburl"], r["title"]
            break
    if not replacement_url:
        print("No replacement found.")
        return
    print(f"Replacement: {matched_title}\n  {replacement_url}")
    if dry_run:
        return

    cloud, key, secret = load_cloudinary_credentials(ROOT)
    img = download_bytes(replacement_url)
    if not img:
        print("Download failed.")
        return
    slug = slug_from_url(url)
    public_id = f"{FOLDER}/{slug}"
    uploaded = cloudinary_upload(img, public_id, cloud, key, secret)
    if not uploaded:
        print("Upload failed.")
        return
    delivery_url = f"https://res.cloudinary.com/{cloud}/image/upload/{HERO_TRANSFORM}/{public_id}"
    for p in matches:
        text = p.read_text(encoding="utf-8")
        new_text = text.replace(f'heroImage: "{url}"', f'heroImage: "{delivery_url}"')
        if new_text != text:
            p.write_text(new_text, encoding="utf-8")
            print(f"  updated {p.relative_to(ROOT)}")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest[url] = {
        "ok": True,
        "matched_title": matched_title,
        "replacement_url": replacement_url,
        "public_id": public_id,
        "cloudinary_url": delivery_url,
        "manual_override": True,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Done: {delivery_url}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--url", help="Fix a single specific broken heroImage URL")
    parser.add_argument("--query", help="Override the Commons search query for --url")
    args = parser.parse_args()

    if args.url:
        return fix_single(args.url, args.query, args.dry_run)

    files = find_mdx_files()
    url_to_files: dict[str, list[Path]] = {}
    for f in files:
        text = f.read_text(encoding="utf-8")
        m = HERO_RE.search(text)
        if m:
            url_to_files.setdefault(m.group(1), []).append(f)

    print(f"Found {sum(len(v) for v in url_to_files.values())} hero refs across {len(url_to_files)} unique Wikimedia URLs.\n")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    cloud, key, secret = load_cloudinary_credentials(ROOT)

    items = sorted(url_to_files.items())
    if args.limit:
        items = items[: args.limit]

    ok, failed, no_match = 0, 0, 0
    for i, (url, paths) in enumerate(items, 1):
        print(f"[{i}/{len(items)}] {url.split('/')[-1][:60]} ({len(paths)} file(s))")

        cached = manifest.get(url)
        if cached and cached.get("ok") and cached.get("cloudinary_url"):
            print("    cached, applying")
            delivery_url = cached["cloudinary_url"]
        else:
            match = find_replacement(url)
            if not match:
                print("    no live replacement found on Commons")
                no_match += 1
                manifest[url] = {"ok": False, "error": "no_replacement"}
                MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
                continue
            replacement_url, matched_title = match
            print(f"    replacement: {matched_title}")

            if args.dry_run:
                continue

            img = download_bytes(replacement_url)
            if not img:
                failed += 1
                manifest[url] = {"ok": False, "error": "download_failed", "replacement_url": replacement_url}
                MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
                continue

            slug = slug_from_url(url)
            public_id = f"{FOLDER}/{slug}"
            uploaded = cloudinary_upload(img, public_id, cloud, key, secret)
            time.sleep(0.2)
            if not uploaded:
                failed += 1
                manifest[url] = {"ok": False, "error": "upload_failed", "replacement_url": replacement_url}
                MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
                continue

            delivery_url = f"https://res.cloudinary.com/{cloud}/image/upload/{HERO_TRANSFORM}/{public_id}"
            manifest[url] = {
                "ok": True,
                "matched_title": matched_title,
                "replacement_url": replacement_url,
                "public_id": public_id,
                "cloudinary_url": delivery_url,
            }
            MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

        if args.dry_run:
            continue

        for p in paths:
            text = p.read_text(encoding="utf-8")
            new_text = text.replace(f'heroImage: "{url}"', f'heroImage: "{delivery_url}"')
            if new_text != text:
                p.write_text(new_text, encoding="utf-8")
        ok += 1

    print(f"\nDone. ok={ok} failed={failed} no_match={no_match} dry_run={args.dry_run}")


if __name__ == "__main__":
    main()
