from http.server import BaseHTTPRequestHandler
import urllib.parse
import requests

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        target_url = query.get('url', [''])[0]
        if not target_url:
            self.send_error(400, 'Missing url parameter')
            return

        try:
            s = requests.Session()
            s.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            })
            res = s.get(target_url, timeout=12)
            if res.status_code == 200:
                self.send_response(200)
                content_type = res.headers.get('Content-Type', 'image/jpeg')
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(res.content)))
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(res.content)
            else:
                self.send_error(res.status_code, 'Upstream image error')
        except Exception as e:
            try:
                self.send_error(500, f"Image proxy error: {e}")
            except Exception:
                pass
