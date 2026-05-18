#!/usr/bin/env python3
"""Rename gallery images to {prefix}_{n}.{ext} per album, then update project references."""
from __future__ import annotations

import os
import re
import urllib.parse
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "assets", "images")
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

PHOTO_RE = re.compile(r"^(.+)_photo_(.+)$", re.IGNORECASE)
SCREENSHOT_RE = re.compile(r"^(.+)_Screenshot_(.+)$", re.IGNORECASE)
DT_PREFIX = re.compile(r"^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})")
NUM_ONLY = re.compile(r"^(\d+)$")


def sort_key_photo_rest(rest: str) -> tuple:
    m = DT_PREFIX.match(rest)
    if m:
        return (0, m.group(1), rest)
    m2 = NUM_ONLY.match(rest)
    if m2:
        return (1, int(m2.group(1)), rest)
    return (2, rest.lower(), rest)


def sort_key_screenshot_rest(rest: str) -> tuple:
    return (0, rest, rest)


def classify(name: str) -> tuple[tuple[str, str], str, tuple] | None:
    """Return ((album_prefix, 'photo'|'screenshot'), filename, sort_key) or None."""
    base, ext = os.path.splitext(name)
    if ext.lower() not in IMAGE_EXTS:
        return None
    m = PHOTO_RE.match(base)
    if m:
        prefix, rest = m.group(1), m.group(2)
        skp = sort_key_photo_rest(rest)
        return ((prefix, "photo"), name, skp)
    m = SCREENSHOT_RE.match(base)
    if m:
        prefix, rest = m.group(1), m.group(2)
        # Same album prefix as photos; numbered 1..N in parallel (.jpg vs .png).
        group = prefix
        sk = (2, *sort_key_screenshot_rest(rest))
        return ((group, "screenshot"), name, sk)
    return None


def build_mapping() -> dict[str, str]:
    by_group: dict[tuple[str, str], list[tuple[tuple, str]]] = defaultdict(list)
    for name in os.listdir(IMG_DIR):
        path = os.path.join(IMG_DIR, name)
        if not os.path.isfile(path):
            continue
        cl = classify(name)
        if not cl:
            continue
        group_key, name_key, sk = cl
        by_group[group_key].append((sk, name_key))

    old_to_new: dict[str, str] = {}
    for group_key in sorted(by_group.keys()):
        prefix, _kind = group_key
        entries = sorted(by_group[group_key], key=lambda x: (x[0], x[1]))
        for i, (_sk, old) in enumerate(entries, start=1):
            _b, ext = os.path.splitext(old)
            new = f"{prefix}_{i}{ext}"
            old_to_new[old] = new
    return old_to_new


def two_phase_rename(m: dict[str, str]) -> None:
    todo = [(o, n) for o, n in m.items() if o != n]
    if not todo:
        print("No renames needed.")
        return
    temps: dict[str, str] = {}
    for i, (old, _n) in enumerate(todo):
        ext = os.path.splitext(old)[1]
        temps[old] = f".__ren_stage1_{i:05d}{ext}"
    for old, tmp in temps.items():
        os.rename(os.path.join(IMG_DIR, old), os.path.join(IMG_DIR, tmp))
    tmp_to_old = {v: k for k, v in temps.items()}
    for tmp, old in tmp_to_old.items():
        new = m[old]
        os.rename(os.path.join(IMG_DIR, tmp), os.path.join(IMG_DIR, new))


def replace_in_project(m: dict[str, str]) -> None:
    exts = {".html", ".htm", ".css", ".js", ".json", ".md"}
    for dirpath, _dirnames, filenames in os.walk(ROOT):
        if "node_modules" in dirpath or ".git" in dirpath:
            continue
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() not in exts:
                continue
            path = os.path.join(dirpath, fn)
            try:
                text = open(path, "r", encoding="utf-8").read()
            except (UnicodeDecodeError, OSError):
                continue
            orig = text
            for old, new in m.items():
                if old == new:
                    continue
                needle = "assets/images/" + old
                text = text.replace(needle, "assets/images/" + new)
                enc = "assets/images/" + urllib.parse.quote(old)
                if enc != needle:
                    text = text.replace(enc, "assets/images/" + new)
            if text != orig:
                open(path, "w", encoding="utf-8").write(text)
                print("Updated", os.path.relpath(path, ROOT))


def main() -> None:
    m = build_mapping()
    print(f"Mapped {len(m)} images.")
    two_phase_rename(m)
    replace_in_project(m)
    print("Done.")


if __name__ == "__main__":
    main()
