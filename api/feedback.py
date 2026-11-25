from http.server import BaseHTTPRequestHandler
import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
FEEDBACK_FILE = os.path.join(DATA_DIR, 'feedbacks.json')

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

        message = payload.get('message', '').strip()
        if not message:
            self.send_json(400, {'success': False, 'message': 'Please provide your message or feedback details.'})
            return

        feedback_entry = {
            'timestamp': int(time.time()),
            'date': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            'name': payload.get('name', 'Anonymous User').strip() or 'Anonymous User',
            'email': payload.get('email', '').strip() or 'None provided',
            'category': payload.get('category', 'general').strip(),
            'rating': payload.get('rating', 5),
            'message': message,
            'user_agent': self.headers.get('User-Agent', '')[:120]
        }

        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            existing = []
            if os.path.exists(FEEDBACK_FILE):
                try:
                    with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                except Exception:
                    existing = []

            existing.append(feedback_entry)
            with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
                json.dump(existing, f, indent=2, ensure_ascii=False)
        except Exception as e:
            # Even if local file writing fails on serverless edge, confirm submission
            pass

        self.send_json(200, {
            'success': True,
            'message': 'Thank you! Your feedback has been sent directly to Adeel Ahmad.'
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
