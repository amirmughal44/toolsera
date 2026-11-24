from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import re
import base64
import requests

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        target_url = payload.get('url', '').strip()
        if not target_url:
            self.send_json(400, {'success': False, 'message': 'Please provide an Instagram URL'})
            return

        match = re.search(r'instagram\.com/(?:p|reel|reels|tv|share/(?:p|reel))/([A-Za-z0-9_-]+)', target_url)
        if not match:
            self.send_json(422, {'success': False, 'message': 'Invalid Instagram post or reel link.'})
            return

        shortcode = match.group(1)
        extracted = self.extract_instagram(target_url, shortcode)

        if not extracted or not extracted.get('video_url'):
            self.send_json(422, {
                'success': False,
                'message': 'Could not extract video. Post might be private or temporarily restricted by Instagram.'
            })
            return

        direct_video_url = extracted['video_url']
        encoded_cdn = base64.b64encode(direct_video_url.encode('utf-8')).decode('utf-8')
        proxy_download = f"api/download.php?v={urllib.parse.quote(encoded_cdn)}&title=instagram_video"

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

        self.send_json(200, {
            'success': True,
            'data': extracted,
            'driver': 'Toolsera High-Speed Engine'
        })

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.end_headers()
        self.wfile.write(body)

    def extract_instagram(self, target_url, shortcode):
        clean_url = f"https://www.instagram.com/reel/{shortcode}/"
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
        except Exception:
            pass

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
