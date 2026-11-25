"""
TOOLSERA - High-Performance Local Live Development Server
Serves the web application and proxies Instagram extraction & video downloads.
Developed by Adeel Ahmad
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import re
import os
import base64
import time
import requests

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ToolseraHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        clean_routes = {
            '/': '/index.html',
            '/index.php': '/index.html',
            '/posts-viewer': '/posts-viewer.html',
            '/story-viewer': '/story-viewer.html',
            '/profile-viewer': '/profile-viewer.html',
            '/reels-downloader': '/reels-downloader.html',
            '/hashtag-generator': '/hashtag-generator.html',
            '/pricing': '/pricing.html',
            '/faq': '/faq.html',
            '/about': '/about.html',
            '/contact': '/contact.html',
            '/disclaimer': '/disclaimer.html',
            '/about.php': '/about.html',
            '/contact.php': '/contact.html',
            '/disclaimer.php': '/disclaimer.html',
        }
        if self.path in clean_routes:
            self.path = clean_routes[self.path]
            return super().do_GET()

        # Image proxy endpoint
        if self.path.startswith('/api/image_proxy.php'):
            self.handle_image_proxy()
            return

        # Download proxy endpoint
        if self.path.startswith('/api/download.php'):
            self.handle_download_proxy()
            return

        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.end_headers()

    def do_POST(self):
        if self.path in ['/api/extract.php', '/api/extract']:
            try:
                from api.extract import handler as ExtractHandler
                h = ExtractHandler.__new__(ExtractHandler)
                h.request = self.request
                h.client_address = self.client_address
                h.server = self.server
                h.rfile = self.rfile
                h.wfile = self.wfile
                h.headers = self.headers
                h.path = self.path
                h.command = 'POST'
                h.request_version = self.request_version
                h.requestline = f'{self.command} {self.path} {self.request_version}'
                h.close_connection = self.close_connection
                h.do_POST()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
            return

        if self.path in ['/api/feedback.php', '/api/feedback']:
            try:
                from api.feedback import handler as FeedbackHandler
                h = FeedbackHandler.__new__(FeedbackHandler)
                h.request = self.request
                h.client_address = self.client_address
                h.server = self.server
                h.rfile = self.rfile
                h.wfile = self.wfile
                h.headers = self.headers
                h.path = self.path
                h.command = 'POST'
                h.request_version = self.request_version
                h.requestline = f'{self.command} {self.path} {self.request_version}'
                h.close_connection = self.close_connection
                h.do_POST()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def handle_extract_api(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        target_url = payload.get('url', '').strip()
        if not target_url:
            self.send_json_response(400, {'success': False, 'message': 'Please provide an Instagram URL'})
            return

        # Extract shortcode
        match = re.search(r'instagram\.com/(?:p|reel|reels|tv|share/(?:p|reel))/([A-Za-z0-9_-]+)', target_url)
        if not match:
            self.send_json_response(422, {'success': False, 'message': 'Invalid Instagram post or reel link.'})
            return

        shortcode = match.group(1)
        extracted = self.extract_instagram(target_url, shortcode)

        if not extracted or not extracted.get('video_url'):
            self.send_json_response(422, {
                'success': False,
                'message': 'Could not extract video. Post might be private or temporarily restricted by Instagram.'
            })
            return

        # Prepare Direct and Proxy URLs
        direct_video_url = extracted['video_url']
        encoded_cdn = base64.b64encode(direct_video_url.encode('utf-8')).decode('utf-8')
        proxy_download = f"api/download.php?v={urllib.parse.quote(encoded_cdn)}&title=instagram_video"

        # Proxy image for 100% reliable local preview without cross-origin or ad-blocker issues
        raw_thumbnail = extracted.get('thumbnail')
        if raw_thumbnail and raw_thumbnail.startswith('http'):
            extracted['thumbnail_raw'] = raw_thumbnail
            extracted['thumbnail_proxy'] = f"api/image_proxy.php?url={urllib.parse.quote(raw_thumbnail)}"
            extracted['thumbnail'] = extracted['thumbnail_proxy']

        extracted['download_stream_url'] = proxy_download
        extracted['direct_download_url'] = direct_video_url
        for fmt in extracted.get('formats', []):
            fmt['download_url'] = f"{proxy_download}&type={fmt['type']}"
            fmt['direct_url'] = direct_video_url

        self.send_json_response(200, {
            'success': True,
            'data': extracted,
            'driver': 'Toolsera High-Speed Engine'
        })

    def extract_instagram(self, target_url, shortcode):
        clean_url = f"https://www.instagram.com/reel/{shortcode}/"

        # 1. Fetch Metadata (Title, Author, Thumbnail) via oEmbed API v1
        meta = {
            'title': f'Instagram Video ({shortcode})',
            'author': '@instagram_creator',
            'thumbnail': None
        }
        try:
            api_url = f"https://www.instagram.com/api/v1/oembed/?url={clean_url}"
            req = urllib.request.Request(api_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-IG-App-ID': '936619743392459'
            })
            with urllib.request.urlopen(req, timeout=6) as r:
                oembed = json.loads(r.read().decode('utf-8'))
                if oembed.get('title'):
                    meta['title'] = oembed['title']
                if oembed.get('author_name'):
                    meta['author'] = '@' + oembed['author_name'].lstrip('@')
                if oembed.get('thumbnail_url'):
                    meta['thumbnail'] = oembed['thumbnail_url']
        except Exception:
            pass

        # 2. Extract Direct MP4 via Indown Engine
        video_url = None
        try:
            s = requests.Session()
            s.headers.update({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
            })
            home_res = s.get("https://indown.io/", timeout=8)
            token_match = re.search(r'name="_token"\s*value="([^"]+)"', home_res.text)
            if token_match:
                token = token_match.group(1)
                post_res = s.post("https://indown.io/download", data={
                    "_token": token,
                    "link": clean_url
                }, timeout=12)

                raw_html = post_res.text
                cdn_links = re.findall(r'href="(https://[^"]*(?:cdninstagram\.com|fbcdn\.net)[^"]*)"', raw_html)
                for cdn in cdn_links:
                    cdn_clean = cdn.replace('&amp;', '&')
                    if '.mp4' in cdn_clean:
                        video_url = cdn_clean
                        break

                if not video_url:
                    dl_links = re.findall(r'href="(https://[^"]*indown\.io/fetch\?url=[^"]*)"', raw_html)
                    if dl_links:
                        video_url = dl_links[0].replace('&amp;', '&')
        except Exception as e:
            print("Indown engine error:", e)

        # Fallback to embed if Indown is unreachable
        if not video_url:
            try:
                embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Dest': 'iframe'
                }
                req = urllib.request.Request(embed_url, headers=headers)
                with urllib.request.urlopen(req, timeout=8) as response:
                    html = response.read().decode('utf-8', errors='ignore')
                    m_vid = re.search(r'class="EmbeddedMediaVideo"[^>]*src="([^"]+)"', html)
                    if m_vid:
                        video_url = m_vid.group(1).replace('&amp;', '&')
                    else:
                        m_json = re.search(r'"video_url"\s*:\s*"([^"]+)"', html)
                        if m_json:
                            video_url = json.loads(f'"{m_json.group(1)}"')
            except Exception:
                pass

        if not video_url:
            return None

        return {
            'id': shortcode,
            'title': meta['title'],
            'caption': meta['title'],
            'author': meta['author'],
            'thumbnail': meta['thumbnail'] or 'assets/images/favicon.svg',
            'video_url': video_url,
            'quality': '1080p Full HD',
            'formats': [
                {
                    'label': '1080p Full HD (MP4)',
                    'quality': '1080p',
                    'type': 'video',
                    'url': video_url,
                    'badge': 'HD'
                },
                {
                    'label': 'Audio Only (MP3)',
                    'quality': 'High Quality',
                    'type': 'audio',
                    'url': video_url,
                    'badge': 'Audio'
                }
            ]
        }

    def handle_image_proxy(self):
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

    def handle_download_proxy(self):
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
            print("Download proxy streaming error:", e)

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    server_address = ('127.0.0.1', PORT)
    httpd = ThreadedHTTPServer(server_address, ToolseraHandler)
    print(f"Toolsera Live Server running at http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
