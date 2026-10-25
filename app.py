from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import re
import socket
import ipaddress
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)

# ---------- Config ----------
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # 16 KB max POST body

csrf = CSRFProtect(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per hour"],
    storage_uri="memory://",
)

# ---------- Safety limits ----------
MAX_PORTS_PER_SCAN = 200
SCAN_TIMEOUT = 0.5
MAX_WORKERS = 20
ALLOWED_SCAN_HOSTS = {"127.0.0.1", "localhost"}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------- Helpers ----------
def scan_port(host: str, port: int):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(SCAN_TIMEOUT)
            result = s.connect_ex((host, port))
            if result == 0:
                try:
                    service = socket.getservbyport(port)
                except OSError:
                    service = "unknown"
                return (port, "open", service)
            return (port, "closed", None)
    except (socket.error, OSError):
        return (port, "error", None)


def scan_range(host: str, start: int, end: int):
    ports = list(range(start, end + 1))
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(lambda p: scan_port(host, p), ports))
    return [r for r in results if r[1] == "open"]


def is_allowed_target(host: str) -> bool:
    if host.lower() in ALLOWED_SCAN_HOSTS:
        return True
    try:
        ip = ipaddress.ip_address(host)
        return ip.is_loopback
    except ValueError:
        return False


# ---------- Security headers ----------
@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "media-src 'self'; "
        "img-src 'self' data:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; "
        "frame-ancestors 'none';"
    )
    return response


# ---------- Routes ----------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
@limiter.limit("5 per minute")
def contact():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    message = request.form.get("message", "").strip()

    if not name or not email or not message:
        flash("Please fill in all fields.", "error")
        return redirect(url_for("home") + "#contact")

    if len(name) > 100 or len(email) > 200 or len(message) > 5000:
        flash("One of the fields is too long.", "error")
        return redirect(url_for("home") + "#contact")

    if not EMAIL_RE.match(email):
        flash("Please enter a valid email address.", "error")
        return redirect(url_for("home") + "#contact")

    app.logger.info("Contact form: %s <%s>", name, email)
    flash("Thanks! Your message was received.", "success")
    return redirect(url_for("home") + "#contact")


@app.route("/scanner", methods=["POST"])
@limiter.limit("5 per minute")
def scanner():
    host = request.form.get("host", "").strip()
    start = request.form.get("start_port", "").strip()
    end = request.form.get("end_port", "").strip()
    permission = request.form.get("permission")

    if not permission:
        flash("You must confirm you have permission to scan this host.", "error")
        return redirect(url_for("home") + "#scanner")

    if not host:
        flash("Please enter a host (e.g. 127.0.0.1).", "error")
        return redirect(url_for("home") + "#scanner")

    if not is_allowed_target(host):
        flash(
            "For safety, this demo only scans localhost (127.0.0.1). "
            "Scanning other hosts requires explicit authorization.",
            "error",
        )
        return redirect(url_for("home") + "#scanner")

    try:
        start_i = int(start)
        end_i = int(end)
    except ValueError:
        flash("Ports must be numbers.", "error")
        return redirect(url_for("home") + "#scanner")

    if not (1 <= start_i <= 65535 and 1 <= end_i <= 65535):
        flash("Ports must be between 1 and 65535.", "error")
        return redirect(url_for("home") + "#scanner")

    if start_i > end_i:
        flash("Start port must be less than or equal to end port.", "error")
        return redirect(url_for("home") + "#scanner")

    if (end_i - start_i + 1) > MAX_PORTS_PER_SCAN:
        flash(f"Maximum {MAX_PORTS_PER_SCAN} ports per scan.", "error")
        return redirect(url_for("home") + "#scanner")

    try:
        ip = socket.gethostbyname(host)
    except socket.gaierror:
        flash(f"Could not resolve host: {host}", "error")
        return redirect(url_for("home") + "#scanner")

    open_ports = scan_range(ip, start_i, end_i)

    if open_ports:
        flash(f"Scan complete on {host} ({ip}) — {len(open_ports)} open port(s) found.", "success")
    else:
        flash(f"Scan complete on {host} ({ip}) — no open ports in that range.", "success")

    return render_template(
        "index.html",
        scan_results=open_ports,
        scanned_host=host,
        scanned_ip=ip,
        scanned_range=f"{start_i}-{end_i}",
    )


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)