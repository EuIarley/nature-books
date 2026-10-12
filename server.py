"""Nature Books — servidor local com login e registro.

Serve o site e a API de contas (a mesma lógica usada na Vercel, em api/_nb.py).
Localmente guarda tudo em SQLite (nature_books.db): nada para instalar.

    python server.py            -> http://localhost:8000
    python server.py 8080       -> outra porta
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "api"))
import _nb  # noqa: E402

HOST = "127.0.0.1"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
BLOCKED = (".py", ".db", ".db-journal", ".db-wal", ".db-shm", ".bat", ".md", ".txt", ".json")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0].lower()
        if path.startswith("/api/"):
            return self.api("GET")
        if path.endswith(BLOCKED) or path.startswith(("/api", "/.git")):
            return self.send_error(404)
        return super().do_GET()

    def do_HEAD(self):
        path = self.path.split("?", 1)[0].lower()
        if path.endswith(BLOCKED) or path.startswith(("/api", "/.git")):
            return self.send_error(404)
        return super().do_HEAD()

    def do_POST(self):
        return self.api("POST")

    def api(self, method):
        res = _nb.handle(method, self.path, self.headers, self.rfile.read, self.client_address[0])
        payload = res.body()
        self.send_response(res.status)
        for k, v in res.headers(secure=False):
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        if "/api/" in self.path or (args and str(args[1]) >= "400"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    _nb.ensure_schema()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Nature Books rodando em http://localhost:{PORT}  (banco: {os.path.basename(_nb.DB_PATH)})")
    print("Ctrl+C para parar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
