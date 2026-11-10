# -*- coding: utf-8 -*-
import sys, json, os, subprocess
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

home = Path(r"C:\Users\jbseo")
for sub in ["Documents", "Downloads", "OneDrive", "source", "repos", "projects", ".ssh", ".codex"]:
    p = home / sub
    if p.exists():
        print(f"=== {sub} ===")
        try:
            for item in list(p.iterdir())[:30]:
                print(" ", item.name)
        except Exception as e:
            print("  err:", e)

for cmd in [
    ["gh", "auth", "status"],
    ["git", "ls-remote", "https://github.com/jbseo-commits/lost-dreams-novel.git", "HEAD"],
    ["git", "ls-remote", "git@github.com:jbseo-commits/lost-dreams-novel.git", "HEAD"],
]:
    print("CMD:", " ".join(cmd))
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=15)
        print("  rc=", r.returncode)
        if r.stdout.strip():
            print("  out=", r.stdout.strip()[:400])
        if r.stderr.strip():
            print("  err=", r.stderr.strip()[:400])
    except Exception as e:
        print("  exc=", e)
