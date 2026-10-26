"""Local preview server for the website (only for this computer — not deployed).

Same as `python -m http.server`, but tells the browser never to cache,
so every refresh shows the latest files.

Run:  python dev-server.py      then open http://localhost:5173
"""
import functools
import http.server

PORT = 5173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory="public")
with http.server.ThreadingHTTPServer(("", PORT), handler) as server:
    print(f"K S Men's Salon preview: http://localhost:{PORT}")
    server.serve_forever()
