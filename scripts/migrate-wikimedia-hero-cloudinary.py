#!/usr/bin/env python3
"""Migrate Wikimedia-hotlinked heroImage URLs to Cloudinary (dlrrtf6bq).

Wikimedia hotlinking is unstable (rate limits, occasional 403s, no resizing) and
was flagged in the SEO/GEO audit (115 hero images across greek-invest.com content).
This script downloads each unique Wikimedia hero URL once, uploads it to the
niche Cloudinary account under more-group/greece/wikimedia-hero/{slug}, and
rewrites every MDX file referencing that URL to the Cloudinary delivery URL
with the standard hero transform (w_1200,q_85,f_webp).

Usage:
  python3 scripts/migrate-wikimedia-hero-cloudinary.py --dry-run
  python3 scripts/migrate-wikimedia-hero-cloudinary.py
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
MANIFEST = SCRIPTS / "greek-invest-wikimedia-cloudinary-manifest.json"

HERO_RE = re.compile(r'heroImage:\s*"(https://upload\.wikimedia\.org/[^"]+)"')


def slug_from_wikimedia_url(url: str) -> str:
    name = url.rstrip("/").split("/")[-1]
    name = urllib.parse.unquote(name)
    name = re.sub(r"^\d+px-", "", name)
    name = re.sub(r"\.(jpg|jpeg|png|gif|JPG|JPEG|PNG)$", "", name)
    name = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    if not name:
        name = "hero"
    # Different Wikimedia files often normalize to the same slug (case/comma
    # variants of near-identical filenames). Suffix with a short hash of the
    # full URL so distinct source images never collide on one Cloudinary asset.
    suffix = hashlib.sha1(url.encode()).hexdigest()[:8]
    return f"{name[:60]}-{suffix}"


def download_bytes(url: str) -> bytes | None:
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0 (MORE Group Greek Invest; +https://greek-invest.com)"}
            )
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
    boundary = "----MGGreeceWikimediaBoundary"

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


def find_mdx_files() -> list[Path]:
    return sorted(CONTENT.rglob("*.mdx"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

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

    ok, failed = 0, 0
    for i, (url, paths) in enumerate(sorted(url_to_files.items()), 1):
        slug = slug_from_wikimedia_url(url)
        public_id = f"{FOLDER}/{slug}"
        delivery_url = f"https://res.cloudinary.com/{cloud}/image/upload/{HERO_TRANSFORM}/{public_id}"

        print(f"[{i}/{len(url_to_files)}] {slug} ({len(paths)} file(s))")

        if args.dry_run:
            print(f"    would upload -> {delivery_url}")
            continue

        cached = manifest.get(url)
        if cached and cached.get("ok"):
            secure_url_base = cached["public_id"]
        else:
            img = download_bytes(url)
            if not img:
                failed += 1
                manifest[url] = {"ok": False, "error": "download_failed"}
                continue
            uploaded = cloudinary_upload(img, public_id, cloud, key, secret)
            time.sleep(0.2)
            if not uploaded:
                failed += 1
                manifest[url] = {"ok": False, "error": "upload_failed"}
                continue
            manifest[url] = {"ok": True, "public_id": public_id, "secure_url": uploaded}
            MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
            secure_url_base = public_id

        for p in paths:
            text = p.read_text(encoding="utf-8")
            new_text = text.replace(f'heroImage: "{url}"', f'heroImage: "{delivery_url}"')
            if new_text != text:
                p.write_text(new_text, encoding="utf-8")
        ok += 1

    print(f"\nDone. ok={ok} failed={failed} dry_run={args.dry_run}")


if __name__ == "__main__":
    main()
