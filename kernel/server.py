#!/usr/bin/env python3
"""Local PyTorch kernel for the LLM Internals site.

The site's runnable cells POST their code here and show the output — this is how
you get *real* PyTorch (autograd, MPS/CUDA, the actual API) in the browser, which
Pyodide can't provide.

Start it (from the project root):

    python3 kernel/server.py            # needs: pip install torch

Leave it running; the site auto-detects it (a status pill shows "PyTorch … · device").
It binds to 127.0.0.1 only and executes the code from the cells in a fresh namespace
each run. It runs arbitrary Python — only run it on your own machine, for your own
study cells. Ctrl-C to stop.
"""
import ast
import io
import json
import traceback
from contextlib import redirect_stdout, redirect_stderr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST, PORT = "127.0.0.1", 8177

try:
    import torch  # noqa: F401  (imported so the kernel fails fast if torch is missing)
    TORCH_VERSION = torch.__version__
    DEVICE = ("cuda" if torch.cuda.is_available()
              else "mps" if torch.backends.mps.is_available() else "cpu")
    TORCH_OK = True
except Exception as e:  # pragma: no cover
    TORCH_VERSION, DEVICE, TORCH_OK = None, str(e), False


def run_code(code):
    """Exec a cell in a fresh namespace; capture stdout + the final expression's repr."""
    buf = io.StringIO()
    ns = {}
    try:
        tree = ast.parse(code, mode="exec")
        last_expr = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last_expr = ast.Expression(tree.body.pop().value)
        with redirect_stdout(buf), redirect_stderr(buf):
            exec(compile(tree, "<cell>", "exec"), ns)  # noqa: S102 (local, trusted)
            if last_expr is not None:
                val = eval(compile(last_expr, "<cell>", "eval"), ns)  # noqa: S307
                if val is not None:
                    print(repr(val), file=buf)
        text = buf.getvalue().rstrip("\n") or "(ran with no output — use print(...))"
        return {"text": text, "isError": False}
    except Exception:
        return {"text": buf.getvalue() + traceback.format_exc(), "isError": True}


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/health"):
            self._send(200, {"status": "ok", "torch": TORCH_VERSION, "device": DEVICE})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if not self.path.startswith("/run"):
            self._send(404, {"error": "not found"})
            return
        n = int(self.headers.get("Content-Length", 0) or 0)
        try:
            body = json.loads(self.rfile.read(n) or b"{}")
            result = run_code(body.get("code", ""))
        except Exception as e:
            result = {"text": f"kernel error: {e}", "isError": True}
        self._send(200, result)

    def log_message(self, *args):
        pass  # quiet


if __name__ == "__main__":
    if not TORCH_OK:
        print("!! PyTorch import failed:", DEVICE)
        print("   Install it first:  pip install torch")
    print(f"PyTorch kernel on http://{HOST}:{PORT}   (torch {TORCH_VERSION}, device {DEVICE})")
    print("Leave this running; the site will connect to it. Ctrl-C to stop.")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
