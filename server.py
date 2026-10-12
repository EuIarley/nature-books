import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(ROOT, "public")
sys.path.insert(0, os.path.join(ROOT, "api"))
import _nb

HOST = "127.0.0.1"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC, **kwargs)

    def do_GET(self):
        if self.path.split("?", 1)[0].lower().startswith("/api/"):
            return self.api("GET")
        return super().do_GET()

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
