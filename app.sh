#!/usr/bin/env bash
# Start/stop the Strine-o-matic dev server in the background.
#   ./app.sh start | stop | restart | status | logs
# PORT=5174 ./app.sh start   to run on another port.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-5173}"
RUN_DIR="$ROOT/.run"
PID_FILE="$RUN_DIR/vite-$PORT.pid"
LOG_FILE="$RUN_DIR/vite-$PORT.log"
URL="http://localhost:$PORT"

listener_pid() { lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1 || true; }

# Only treat a listener as ours if it's vite running from this project.
ours() {
  ps -o command= -p "$1" 2>/dev/null | grep -q vite &&
    lsof -a -p "$1" -d cwd -Fn 2>/dev/null | grep -qx "n$ROOT"
}

start() {
  local pid
  pid="$(listener_pid)"
  if [[ -n "$pid" ]]; then
    if ours "$pid"; then echo "Already running (pid $pid) at $URL"; return 0; fi
    echo "Port $PORT is in use by another process (pid $pid):" >&2
    ps -o command= -p "$pid" >&2
    return 1
  fi

  [[ -f "$ROOT/.env" ]] || echo "Warning: no .env — copy .env.example and add your API keys." >&2
  [[ -d "$ROOT/node_modules" ]] || (cd "$ROOT" && npm install)

  mkdir -p "$RUN_DIR"
  cd "$ROOT"
  nohup "$ROOT/node_modules/.bin/vite" --port "$PORT" --strictPort >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"

  for _ in $(seq 1 30); do
    if curl -fs -o /dev/null "$URL" 2>/dev/null; then echo "Started (pid $(cat "$PID_FILE")) at $URL"; return 0; fi
    if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then break; fi
    sleep 0.5
  done
  echo "Failed to start. Last log lines:" >&2
  tail -20 "$LOG_FILE" >&2
  stop >/dev/null 2>&1 || true
  return 1
}

stop() {
  local pids=() pid
  [[ -f "$PID_FILE" ]] && pids+=("$(cat "$PID_FILE")")
  pid="$(listener_pid)"
  if [[ -n "$pid" ]] && ours "$pid"; then pids+=("$pid"); fi

  local stopped=0
  for pid in $(printf '%s\n' "${pids[@]+"${pids[@]}"}" | sort -u); do
    kill -0 "$pid" 2>/dev/null || continue
    kill "$pid"
    for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.25; done
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid"
    stopped=1
  done
  rm -f "$PID_FILE"
  if ((stopped)); then echo "Stopped."; else echo "Not running."; fi
}

status() {
  local pid
  pid="$(listener_pid)"
  if [[ -n "$pid" ]] && ours "$pid"; then echo "Running (pid $pid) at $URL"
  elif [[ -n "$pid" ]]; then echo "Port $PORT is held by another process (pid $pid)"; return 1
  else echo "Not running."; return 1; fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  logs) tail -f "$LOG_FILE" ;;
  *) echo "Usage: $0 {start|stop|restart|status|logs}   (PORT=$PORT)" >&2; exit 2 ;;
esac
