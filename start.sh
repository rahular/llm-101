#!/usr/bin/env bash
# Start both servers for the LLM Internals site (page server + PyTorch kernel).
# Usage:  ./start.sh          start both in the background, logs in /tmp
#         ./start.sh stop     stop both
set -e
cd "$(dirname "$0")"

if [ "$1" = "stop" ]; then
  pkill -f "http.server 8137" 2>/dev/null && echo "stopped page server" || echo "page server not running"
  pkill -f "kernel/server.py" 2>/dev/null && echo "stopped kernel" || echo "kernel not running"
  exit 0
fi

# page server (idempotent: skip if already up)
if curl -s -o /dev/null http://localhost:8137/index.html 2>/dev/null; then
  echo "page server already running on :8137"
else
  nohup python3 -m http.server 8137 > /tmp/prep-server.log 2>&1 &
  echo "page server  -> http://localhost:8137   (log: /tmp/prep-server.log)"
fi

# PyTorch kernel
if curl -s -o /dev/null http://127.0.0.1:8177/health 2>/dev/null; then
  echo "kernel already running on :8177"
else
  nohup python3 kernel/server.py > /tmp/prep-kernel.log 2>&1 &
  sleep 2
  curl -s http://127.0.0.1:8177/health || echo "(kernel starting — check /tmp/prep-kernel.log if the pill stays grey)"
  echo ""
  echo "kernel       -> http://127.0.0.1:8177  (log: /tmp/prep-kernel.log)"
fi

echo "open: http://localhost:8137"
