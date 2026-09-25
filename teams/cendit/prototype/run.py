#!/usr/bin/env python3
"""Run the cendit prototype locally: rebuild the data if needed, serve it, open a browser.

    python teams/cendit/prototype/run.py                  # http://localhost:8766/
    python teams/cendit/prototype/run.py --port 8800
    python teams/cendit/prototype/run.py --rebuild        # force a rebuild of data/twin.json
    python teams/cendit/prototype/run.py --no-browser

Standard library only. Works from any directory.
"""

import argparse
import errno
import sys
import threading
import webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
TWIN = HERE / "data" / "twin.json"
INPUTS = [HERE / "build_data.py", *(ROOT / "data").glob("*.csv"), *(ROOT / "data").glob("*.xlsx"),
          ROOT / "water-system-3d" / "storage-history.json", ROOT / "water-system-3d" / "snotel-history.json"]

sys.path.insert(0, str(HERE))
import build_data  # noqa: E402
import server  # noqa: E402


def stale():
    if not TWIN.exists():
        return "data/twin.json is missing"
    built = TWIN.stat().st_mtime
    newer = [p.name for p in INPUTS if p.exists() and p.stat().st_mtime > built]
    return f"newer inputs: {', '.join(newer)}" if newer else None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--port", type=int, default=server.PORT)
    parser.add_argument("--rebuild", action="store_true", help="rebuild data/twin.json even if it looks current")
    parser.add_argument("--no-browser", action="store_true", help="don't open a browser tab")
    args = parser.parse_args()

    if sys.version_info < (3, 9):
        sys.exit(f"Python 3.9 or newer is needed; this is {sys.version.split()[0]}.")

    reason = "--rebuild" if args.rebuild else stale()
    if reason:
        print(f"Building data ({reason})...")
        build_data.main()
    else:
        print("Data is current; skipping the build (use --rebuild to force it).")

    def ready(port):
        if not args.no_browser:
            threading.Timer(0.5, webbrowser.open, [f"http://localhost:{port}/"]).start()

    try:
        server.serve(args.port, on_ready=ready)
    except OSError as error:
        if error.errno in (errno.EADDRINUSE, 10048):  # 10048 = WSAEADDRINUSE on Windows
            sys.exit(f"Port {args.port} is already in use. Is the prototype already running? "
                     f"Try --port {args.port + 1}.")
        raise


if __name__ == "__main__":
    main()
