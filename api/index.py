import os
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _nb

def original_path(raw):
    parts = urlsplit(raw)
    route = parse_qs(parts.query).get("route")
    if route:
        return "/api/" + route[0].lstrip("/")
    return parts.path


class handler(BaseHTTPRequestHandler):
    def _run(self, method):
        ip = (self.headers.get("x-forwarded-for") or self.client_address[0]).split(",")[0].strip()
        res = _nb.handle(method, original_path(self.path), self.headers, self.rfile.read, ip)
        payload = res.body()
        self.send_response(res.status)
        secure = (self.headers.get("x-forwarded-proto") or "https") == "https"
        for k, v in res.headers(secure=secure):
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        self._run("GET")

    def do_POST(self):
        self._run("POST")
