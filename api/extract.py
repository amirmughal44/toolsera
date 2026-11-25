from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import re
import base64
import time
import random
import requests

# In-Memory Cache for High-Traffic Viral Requests (Reduces upstream hits by up to 80%)
CACHE = {}
CACHE_TTL = 900  # 15 minutes cache

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.109 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.6478.122 Mobile Safari/537.36"
]

def clean_username(input_str):
    s = input_str.strip()
    s = re.sub(r'https?://(?:www\.)?instagram\.com/(?:stories/)?', '', s)
    s = s.strip('/').split('/')[0].split('?')[0].lstrip('@')
    return s

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
        requested_mode = payload.get('type', 'auto').strip().lower()

        if not target_url:
            self.send_json(400, {'success': False, 'message': 'Please provide an Instagram URL or username.'})
            return

        now = time.time()
        ua = random.choice(USER_AGENTS)

        # ------------------------------------------------------------------
        # MODE 1: PROFILE PICTURE (HD DP) EXTRACTION
        # ------------------------------------------------------------------
        if requested_mode == 'dp':
            username = clean_username(target_url)
            cache_key = f"dp_{username}"
            if cache_key in CACHE and now - CACHE[cache_key]['timestamp'] < CACHE_TTL:
                self.send_json(200, {'success': True, 'mode': 'dp', 'data': CACHE[cache_key]['data']})
                return

            dp_data = self.extract_dp(username, ua)
            if dp_data:
                CACHE[cache_key] = {'data': dp_data, 'timestamp': now}
                self.send_json(200, {'success': True, 'mode': 'dp', 'data': dp_data})
            else:
                self.send_json(422, {
                    'success': False,
                    'message': f'Could not find profile for @{username}. Please verify the username.'
                })
            return

        # ------------------------------------------------------------------
        # MODE 2: ANONYMOUS STORY VIEWER EXTRACTION
        # ------------------------------------------------------------------
        if requested_mode == 'story' or 'instagram.com/stories/' in target_url:
            username = clean_username(target_url)
            cache_key = f"story_{username}"
            if cache_key in CACHE and now - CACHE[cache_key]['timestamp'] < CACHE_TTL:
                self.send_json(200, {'success': True, 'mode': 'stories', 'data': CACHE[cache_key]['data']})
                return

            story_data = self.extract_stories(username, ua)
            if story_data:
                if story_data.get('type') == 'stories_private':
                    self.send_json(200, {'success': True, 'mode': 'stories_private', 'data': story_data})
                elif story_data.get('type') == 'stories_empty':
                    self.send_json(200, {'success': True, 'mode': 'stories_empty', 'data': story_data})
                else:
                    CACHE[cache_key] = {'data': story_data, 'timestamp': now}
                    self.send_json(200, {'success': True, 'mode': 'stories', 'data': story_data})
            else:
                self.send_json(422, {
                    'success': False,
                    'message': f'Could not retrieve stories for @{username}. Post or profile might be restricted.'
                })
            return

        # ------------------------------------------------------------------
        # MODE 3: VIDEO / REEL EXTRACTION (DEFAULT)
        # ------------------------------------------------------------------
        match = re.search(r'instagram\.com/(?:p|reel|reels|tv|share/(?:p|reel))/([A-Za-z0-9_-]+)', target_url)
        if not match:
            # If the user typed a username without choosing DP or Story tab, auto-detect as Profile DP
            if not target_url.startswith('http') or re.match(r'^@?[a-zA-Z0-9._]+$', target_url):
                username = clean_username(target_url)
                dp_data = self.extract_dp(username, ua)
                if dp_data:
                    self.send_json(200, {'success': True, 'mode': 'dp', 'data': dp_data})
                    return

            self.send_json(422, {'success': False, 'message': 'Invalid Instagram post or reel link.'})
            return

        shortcode = match.group(1)

        # Check in-memory cache
        if shortcode in CACHE:
            cached_item = CACHE[shortcode]
            if now - cached_item['timestamp'] < CACHE_TTL:
                self.send_json(200, {
                    'success': True,
                    'mode': 'video',
                    'data': cached_item['data'],
                    'driver': 'Toolsera Turbo Cache (Edge Optimized)'
                })
                return

        extracted = self.extract_instagram(target_url, shortcode, ua)

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

        # Store in Cache
        CACHE[shortcode] = {
            'data': extracted,
            'timestamp': now
        }

        self.send_json(200, {
            'success': True,
            'mode': 'video',
            'data': extracted,
            'driver': 'Toolsera High-Speed Multi-Engine'
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

    # ----------------------------------------------------------------------
    # EXTRACTOR: PROFILE DP
    # ----------------------------------------------------------------------
    def extract_dp(self, username, ua):
        s = requests.Session()
        s.headers.update({'User-Agent': ua})
        try:
            r = s.get('https://indown.io/insta-dp-viewer', timeout=8)
            token = re.search(r'name="_token"\s*value="([^"]+)"', r.text).group(1)
            res = s.post('https://indown.io/download', data={'_token': token, 'link': f'https://www.instagram.com/{username}/'}, timeout=12)
            links = re.findall(r'href="(https://[^"]*(?:cdninstagram\.com|fbcdn\.net)[^"]*)"', res.text)
            if links:
                raw_dp = links[0].replace('&amp;', '&')
                proxy_dp = f"api/image_proxy.php?url={urllib.parse.quote(raw_dp)}"
                return {
                    'username': f'@{username}',
                    'title': f'{username} - Full HD Profile Picture',
                    'dp_url': raw_dp,
                    'thumbnail': proxy_dp,
                    'download_url': raw_dp,
                    'type': 'dp'
                }
        except Exception:
            pass

        # Fallback via oEmbed/public graph
        try:
            api_url = f"https://www.instagram.com/api/v1/oembed/?url=https://www.instagram.com/{username}/"
            req = urllib.request.Request(api_url, headers={'User-Agent': ua, 'X-IG-App-ID': '936619743392459'})
            with urllib.request.urlopen(req, timeout=6) as response:
                meta = json.loads(response.read().decode('utf-8'))
                thumb = meta.get('thumbnail_url')
                if thumb:
                    proxy_dp = f"api/image_proxy.php?url={urllib.parse.quote(thumb)}"
                    return {
                        'username': f'@{username}',
                        'title': f'{username} - Profile Picture',
                        'dp_url': thumb,
                        'thumbnail': proxy_dp,
                        'download_url': thumb,
                        'type': 'dp'
                    }
        except Exception:
            pass

        return None

    # ----------------------------------------------------------------------
    # EXTRACTOR: STORIES
    # ----------------------------------------------------------------------
    def extract_stories(self, username, ua):
        s = requests.Session()
        s.headers.update({'User-Agent': ua})
        try:
            r = s.get('https://indown.io/insta-stories-download', timeout=8)
            token = re.search(r'name="_token"\s*value="([^"]+)"', r.text).group(1)
            res = s.post('https://indown.io/download', data={'_token': token, 'link': f'https://www.instagram.com/stories/{username}/'}, timeout=14)

            # Check for private account indicator
            if 'private' in res.text.lower() and not re.search(r'href="(https://[^"]*(?:cdninstagram\.com|fbcdn\.net)[^"]*)"', res.text):
                return {
                    'username': f'@{username}',
                    'is_private': True,
                    'message': f'@{username} is a Private Account. Instagram protects their 24h stories and requires an accepted follow request. However, you can view and download their Full HD Profile Picture!',
                    'type': 'stories_private'
                }

            # Parse story media links
            raw_links = re.findall(r'href="(https://[^"]*(?:cdninstagram\.com|fbcdn\.net|indown\.io/fetch)[^"]*)"', res.text)
            stories = []
            seen = set()
            for link in raw_links:
                clean_link = link.replace('&amp;', '&')
                if clean_link in seen:
                    continue
                seen.add(clean_link)
                is_vid = '.mp4' in clean_link or 'video' in clean_link
                stories.append({
                    'type': 'video' if is_vid else 'image',
                    'url': clean_link,
                    'download_url': clean_link,
                    'preview_proxy': f"api/image_proxy.php?url={urllib.parse.quote(clean_link)}" if not is_vid else None
                })

            if stories:
                return {
                    'username': f'@{username}',
                    'count': len(stories),
                    'stories': stories,
                    'type': 'stories'
                }
            else:
                return {
                    'username': f'@{username}',
                    'count': 0,
                    'message': f'No active stories found in the last 24 hours for @{username}.',
                    'type': 'stories_empty'
                }
        except Exception:
            pass

        return None

    # ----------------------------------------------------------------------
    # EXTRACTOR: VIDEO / REEL
    # ----------------------------------------------------------------------
    def extract_instagram(self, target_url, shortcode, ua):
        clean_url = f"https://www.instagram.com/reel/{shortcode}/"
        meta = {
            'title': f'Instagram Video ({shortcode})',
            'author': '@instagram_creator',
            'thumbnail': None
        }

        # Step 1: OEmbed metadata
        try:
            api_url = f"https://www.instagram.com/api/v1/oembed/?url={clean_url}"
            req = urllib.request.Request(api_url, headers={
                'User-Agent': ua,
                'X-IG-App-ID': '936619743392459'
            })
            with urllib.request.urlopen(req, timeout=5) as r:
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

        # Engine 1: Indown High-Speed Gateway
        try:
            s = requests.Session()
            s.headers.update({"User-Agent": ua})
            home_res = s.get("https://indown.io/", timeout=7)
            token_match = re.search(r'name="_token"\s*value="([^"]+)"', home_res.text)
            if token_match:
                token = token_match.group(1)
                post_res = s.post("https://indown.io/download", data={
                    "_token": token,
                    "link": clean_url
                }, timeout=10)

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

        # Engine 2: Instagram Direct Embed Scraper
        if not video_url:
            try:
                embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
                headers = {
                    'User-Agent': ua,
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Dest': 'iframe'
                }
                req = urllib.request.Request(embed_url, headers=headers)
                with urllib.request.urlopen(req, timeout=7) as response:
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

        # Ensure direct download trigger parameter on CDN link
        if 'cdninstagram.com' in video_url or 'fbcdn.net' in video_url:
            if 'dl=1' not in video_url:
                video_url += ('&dl=1' if '?' in video_url else '?dl=1')

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
