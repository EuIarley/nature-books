import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from http import cookies

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PG_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
ON_VERCEL = bool(os.environ.get("VERCEL"))
DB_PATH = os.environ.get("NB_DB", os.path.join(ROOT, "nature_books.db"))

COOKIE = "nb_session"
SESSION_DAYS = 30
PBKDF2_ITER = 310_000
MAX_BODY = 10_000
FAIL_LIMIT, FAIL_WINDOW = 5, 600
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")

if PG_URL:
    import psycopg
    from psycopg.rows import dict_row

    UNIQUE_ERRORS = (psycopg.errors.UniqueViolation,)
    SCHEMA = """
        CREATE TABLE IF NOT EXISTS users (
            id            BIGSERIAL PRIMARY KEY,
            name          TEXT   NOT NULL,
            email         TEXT   NOT NULL UNIQUE,
            password_hash TEXT   NOT NULL,
            salt          TEXT   NOT NULL,
            created_at    BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT   PRIMARY KEY,
            user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at BIGINT NOT NULL,
            expires_at BIGINT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE TABLE IF NOT EXISTS login_fails (
            key TEXT   NOT NULL,
            at  BIGINT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_login_fails_key ON login_fails(key);
    """
else:
    UNIQUE_ERRORS = (sqlite3.IntegrityError,)
    SCHEMA = """
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT    NOT NULL,
            salt          TEXT    NOT NULL,
            created_at    INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT    PRIMARY KEY,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE TABLE IF NOT EXISTS login_fails (
            key TEXT    NOT NULL,
            at  INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_login_fails_key ON login_fails(key);
    """

class DB:

    def __enter__(self):
        if PG_URL:
            self.conn = psycopg.connect(PG_URL, row_factory=dict_row, connect_timeout=10)
        else:
            self.conn = sqlite3.connect(DB_PATH, timeout=10)
            self.conn.row_factory = sqlite3.Row
            self.conn.execute("PRAGMA foreign_keys = ON")
        return self

    def __exit__(self, exc_type, *_):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        self.conn.close()

    def run(self, sql, params=()):
        if PG_URL:
            sql = sql.replace("?", "%s")
        return self.conn.execute(sql, params)

    def one(self, sql, params=()):
        return self.run(sql, params).fetchone()

_schema_ready = False

def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    with DB() as db:
        if PG_URL:
            db.conn.execute(SCHEMA)
        else:
            db.conn.executescript(SCHEMA)
    _schema_ready = True

def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), PBKDF2_ITER)
    return digest.hex(), salt

def check_password(password, stored_hash, salt):
    digest, _ = hash_password(password, salt)
    return hmac.compare_digest(digest, stored_hash)

def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()

def create_session(db, user_id):
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    db.run(
        "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token_hash(token), user_id, now, now + SESSION_DAYS * 86400),
    )
    db.run("DELETE FROM sessions WHERE expires_at < ?", (now,))
    return token

def public_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "created_at": row["created_at"]}

def too_many_fails(db, key):
    since = int(time.time()) - FAIL_WINDOW
    db.run("DELETE FROM login_fails WHERE at < ?", (since,))
    row = db.one("SELECT COUNT(*) AS n FROM login_fails WHERE key = ?", (key,))
    return row["n"] >= FAIL_LIMIT

class Response:
    def __init__(self, status, data, token=None, remember=False):
        self.status, self.data, self.token, self.remember = status, data, token, remember

    def body(self):
        return json.dumps(self.data, ensure_ascii=False).encode()

    def headers(self, secure=False):
        h = [
            ("Content-Type", "application/json; charset=utf-8"),
            ("Cache-Control", "no-store"),
            ("X-Content-Type-Options", "nosniff"),
        ]
        if self.token is not None:
            cookie = f"{COOKIE}={self.token}; Path=/; HttpOnly; SameSite=Lax"
            if secure:
                cookie += "; Secure"
            if self.token == "":
                cookie += "; Max-Age=0"
            elif self.remember:
                cookie += f"; Max-Age={SESSION_DAYS * 86400}"
            h.append(("Set-Cookie", cookie))
        return h

def session_token(headers):
    jar = cookies.SimpleCookie(headers.get("Cookie", ""))
    return jar[COOKIE].value if COOKIE in jar else None

def handle(method, path, headers, read_body, client_ip):
    path = path.split("?", 1)[0].rstrip("/")
    if not path.startswith("/api/"):
        return Response(404, {"error": "Página não encontrada."})
    if path == "/api/status":
        return api_status()
    if ON_VERCEL and not PG_URL:
        return Response(503, {"error": "O banco de dados ainda não foi conectado ao site. Tente de novo mais tarde."})
    try:
        ensure_schema()
        if method == "GET" and path == "/api/me":
            return api_me(headers)
        routes = {"/api/register": api_register, "/api/login": api_login, "/api/logout": api_logout}
        if method != "POST" or path not in routes:
            return Response(404, {"error": "Rota não encontrada."})
        if not headers.get("Content-Type", "").startswith("application/json"):
            return Response(415, {"error": "Envie os dados em JSON."})
        length = int(headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            return Response(413, {"error": "Dados grandes demais."})
        try:
            body = json.loads(read_body(length) or b"{}")
            if not isinstance(body, dict):
                raise ValueError
        except ValueError:
            return Response(400, {"error": "JSON inválido."})
        return routes[path](body, headers, client_ip)
    except Exception as exc:
        print("Erro na API:", repr(exc))
        return Response(500, {"error": "O servidor teve um problema. Tente de novo em instantes."})

def api_register(body, headers, _ip):
    name = str(body.get("name", "")).strip()
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    if not 2 <= len(name) <= 60:
        return Response(400, {"error": "Informe seu nome (2 a 60 caracteres).", "field": "name"})
    if not EMAIL_RE.match(email) or len(email) > 120:
        return Response(400, {"error": "Informe um e-mail válido, como nome@exemplo.com.", "field": "email"})
    if len(password) < 8 or len(password) > 128:
        return Response(400, {"error": "A senha precisa ter pelo menos 8 caracteres.", "field": "password"})
    if not (re.search(r"[A-Za-z]", password) and re.search(r"\d", password)):
        return Response(400, {"error": "Use letras e números na senha.", "field": "password"})
    pw_hash, salt = hash_password(password)
    try:
        with DB() as db:
            user = db.one(
                "INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *",
                (name, email, pw_hash, salt, int(time.time())),
            )
            token = create_session(db, user["id"])
    except UNIQUE_ERRORS:
        return Response(409, {"error": "Já existe uma conta com este e-mail. Tente entrar.", "field": "email"})
    return Response(201, {"user": public_user(user)}, token=token, remember=bool(body.get("remember", True)))

def api_login(body, headers, ip):
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    key = f"{ip}|{email}"
    with DB() as db:
        if too_many_fails(db, key):
            return Response(429, {"error": "Muitas tentativas. Aguarde alguns minutos e tente de novo."})
        user = db.one("SELECT * FROM users WHERE email = ?", (email,))
        if not user or not check_password(password, user["password_hash"], user["salt"]):
            db.run("INSERT INTO login_fails (key, at) VALUES (?, ?)", (key, int(time.time())))
            return Response(401, {"error": "E-mail ou senha incorretos."})
        db.run("DELETE FROM login_fails WHERE key = ?", (key,))
        token = create_session(db, user["id"])
    return Response(200, {"user": public_user(user)}, token=token, remember=bool(body.get("remember", False)))

def api_logout(_body, headers, _ip):
    token = session_token(headers)
    if token:
        with DB() as db:
            db.run("DELETE FROM sessions WHERE token_hash = ?", (token_hash(token),))
    return Response(200, {"ok": True}, token="")

def api_status():
    info = {
        "database": "postgres" if PG_URL else "sqlite",
        "vercel": ON_VERCEL,
        "variaveis": [k for k in ("DATABASE_URL", "POSTGRES_URL") if os.environ.get(k)],
        "conectado": False,
        "erro": None,
    }
    if ON_VERCEL and not PG_URL:
        info["erro"] = "DATABASE_URL ausente"
        return Response(503, info)
    try:
        ensure_schema()
        with DB() as db:
            db.one("SELECT COUNT(*) AS n FROM users")
        info["conectado"] = True
    except Exception as exc:
        print("Erro no status:", repr(exc))
        info["erro"] = type(exc).__name__
    return Response(200 if info["conectado"] else 503, info)


def api_me(headers):
    token = session_token(headers)
    user = None
    if token:
        with DB() as db:
            user = db.one(
                "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id "
                "WHERE s.token_hash = ? AND s.expires_at > ?",
                (token_hash(token), int(time.time())),
            )
    return Response(200, {"user": public_user(user) if user else None})
