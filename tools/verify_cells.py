#!/usr/bin/env python3
"""Regression test: extract every runnable code-cell from the topic pages and
execute it against the local PyTorch kernel. Run after any change that touches
cell code.

Usage (kernel must be running — see start.sh):
    python3 tools/verify_cells.py                    # all pages
    python3 tools/verify_cells.py attention.html …   # specific pages
"""
import re
import sys
import html
import json
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOPICS = os.path.join(ROOT, "topics")
KERNEL = "http://127.0.0.1:8177/run"

CELL = re.compile(
    r'data-id="([a-z0-9-]+)"[^>]*>.*?<textarea class="code-src"[^>]*>(.*?)</textarea>',
    re.DOTALL,
)


def run(code):
    req = urllib.request.Request(
        KERNEL,
        data=json.dumps({"code": code}).encode(),
        headers={"Content-Type": "application/json"},
    )
    return json.loads(urllib.request.urlopen(req, timeout=120).read())


def main():
    files = sys.argv[1:] or sorted(f for f in os.listdir(TOPICS) if f.endswith(".html"))
    total = fails = 0
    for fn in files:
        with open(os.path.join(TOPICS, fn)) as f:
            page = f.read()
        for cid, code in CELL.findall(page):
            total += 1
            res = run(html.unescape(code))
            if res.get("isError"):
                fails += 1
                print(f"  FAIL {fn}::{cid}")
                print("    " + res["text"].strip().splitlines()[-1][:110])
            else:
                print(f"  ok   {fn}::{cid}")
    print(f"\n{total - fails}/{total} passed, {fails} failed")
    return 1 if fails else 0


if __name__ == "__main__":
    try:
        urllib.request.urlopen("http://127.0.0.1:8177/health", timeout=3)
    except Exception:
        sys.exit("kernel not running — start it first:  ./start.sh  (or python3 kernel/server.py)")
    sys.exit(main())
