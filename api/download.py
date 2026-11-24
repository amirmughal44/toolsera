from http.server import BaseHTTPRequestHandler
import urllib.parse
import base64
import requests

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)

        v_encoded = query.get('v', [''])[0]
        if not v_encoded:
            self.send_error(400, 'Missing video token')
            return

        try:
            cdn_url = base64.b64decode(v_encoded).decode('utf-8')
        except Exception:
            self.send_error(400, 'Invalid token')
            return

        req_type = query.get('type', ['video'])[0]
        ext = '.mp3' if req_type == 'audio' else '.mp4'
        content_type = 'audio/mpeg' if req_type == 'audio' else 'video/mp4'
        filename = f"toolsera_instagram_video{ext}"

        s = requests.Session()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': '*/*',
        }

        try:
            res = s.get(cdn_url, stream=True, timeout=30, headers=headers)
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            content_len = res.headers.get('Content-Length')
            if content_len:
                self.send_header('Content-Length', content_len)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()

            for chunk in res.iter_content(chunk_size=65536):
                if chunk:
                    try:
                        self.wfile.write(chunk)
                    except Exception:
                        break
        except Exception as e:
            try:
                self.send_error(500, f"Streaming error: {e}")
            except Exception:
                pass
