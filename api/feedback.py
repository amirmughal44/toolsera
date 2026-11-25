from http.server import BaseHTTPRequestHandler
import json
import os
import time
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
FEEDBACK_FILE = os.path.join(DATA_DIR, 'feedbacks.json')
ADMIN_TOKEN = "toolsera_admin_2026"
OWNER_EMAIL = "adeelahmed3376@gmail.com"

def get_feedbacks():
    if not os.path.exists(FEEDBACK_FILE):
        return []
    try:
        with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_feedbacks(feedbacks):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(feedbacks, f, indent=2, ensure_ascii=False)

def dispatch_email_notification(entry):
    """
    Dispatches feedback notification to the owner.
    Falls back gracefully if SMTP is not configured in local/serverless env.
    """
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')

    subject = f"[TOOLSERA Feedback] ({entry.get('category', 'General').upper()}) - {entry.get('subject', 'New Feedback')}"
    body = f"""Hello Adeel,

You received new feedback on TOOLSERA:

------------------------------------------------
Feedback ID: {entry.get('id')}
Date:        {entry.get('date')}
From:        {entry.get('name')} ({entry.get('email')})
Category:    {entry.get('category')}
Rating:      {entry.get('rating')}/5 Stars
Subject:     {entry.get('subject')}
Status:      {entry.get('status')}

Message:
{entry.get('message')}

User Agent:
{entry.get('user_agent')}
------------------------------------------------
Manage feedbacks in your admin dashboard:
https://toolsera.com/admin/feedback.html
"""

    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = OWNER_EMAIL
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, OWNER_EMAIL, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            # Safe fallback log
            log_notification(entry, str(e))
            return False
    else:
        # Log to data folder for audit trail
        log_notification(entry, "Local log recorded (SMTP not configured in current environment)")
        return True

def log_notification(entry, note=""):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        log_file = os.path.join(DATA_DIR, 'feedback_notifications.log')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{entry.get('date')}] ID:{entry.get('id')} | Rating:{entry.get('rating')}★ | Note: {note}\n")
    except Exception:
        pass


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.end_headers()

    def check_admin_auth(self):
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
            if token == ADMIN_TOKEN:
                return True
        if '?' in self.path:
            query = self.path.split('?', 1)[1]
            params = dict(qc.split('=', 1) for qc in query.split('&') if '=' in qc)
            if params.get('token') == ADMIN_TOKEN:
                return True
        return False

    def do_GET(self):
        # Admin feedback list endpoint
        if self.path.startswith('/api/admin/feedback') or '/api/feedback?admin=1' in self.path:
            if not self.check_admin_auth():
                self.send_json(401, {'success': False, 'message': 'Unauthorized. Admin access required.'})
                return

            feedbacks = get_feedbacks()
            # Summary stats
            total = len(feedbacks)
            new_count = sum(1 for f in feedbacks if f.get('status') == 'New')
            reviewed_count = sum(1 for f in feedbacks if f.get('status') == 'Reviewed')
            resolved_count = sum(1 for f in feedbacks if f.get('status') == 'Resolved')

            self.send_json(200, {
                'success': True,
                'stats': {
                    'total': total,
                    'new': new_count,
                    'reviewed': reviewed_count,
                    'resolved': resolved_count
                },
                'feedbacks': feedbacks
            })
            return

        self.send_json(404, {'success': False, 'message': 'Endpoint not found'})

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        # Handle Admin status update / delete actions
        if self.path.startswith('/api/admin/feedback'):
            if not self.check_admin_auth():
                self.send_json(401, {'success': False, 'message': 'Unauthorized. Admin access required.'})
                return

            action = payload.get('action')
            fb_id = payload.get('id')
            feedbacks = get_feedbacks()

            if action == 'update_status':
                new_status = payload.get('status', 'Reviewed')
                updated = False
                for fb in feedbacks:
                    if fb.get('id') == fb_id:
                        fb['status'] = new_status
                        updated = True
                        break
                if updated:
                    save_feedbacks(feedbacks)
                    self.send_json(200, {'success': True, 'message': f'Status updated to {new_status}'})
                else:
                    self.send_json(404, {'success': False, 'message': 'Feedback entry not found'})
                return

            elif action == 'delete':
                original_len = len(feedbacks)
                feedbacks = [fb for fb in feedbacks if fb.get('id') != fb_id]
                if len(feedbacks) < original_len:
                    save_feedbacks(feedbacks)
                    self.send_json(200, {'success': True, 'message': 'Feedback entry deleted'})
                else:
                    self.send_json(404, {'success': False, 'message': 'Feedback entry not found'})
                return

        # Public Visitor Feedback Submission
        message = payload.get('message', '').strip()
        if not message:
            self.send_json(400, {'success': False, 'message': 'Please provide your message or feedback details.'})
            return

        unique_id = f"fb_{secrets.token_hex(4)}"
        name = payload.get('name', '').strip() or 'Anonymous Visitor'
        email = payload.get('email', '').strip() or 'None provided'
        subject = payload.get('subject', '').strip() or 'General Feedback'
        category = payload.get('category', 'general').strip()
        rating = int(payload.get('rating', 5))
        if rating < 1 or rating > 5:
            rating = 5

        entry = {
            'id': unique_id,
            'timestamp': int(time.time()),
            'date': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            'name': name,
            'email': email,
            'subject': subject,
            'category': category,
            'rating': rating,
            'message': message,
            'status': 'New',
            'user_agent': self.headers.get('User-Agent', '')[:120]
        }

        try:
            feedbacks = get_feedbacks()
            feedbacks.insert(0, entry)  # Latest on top
            save_feedbacks(feedbacks)
            dispatch_email_notification(entry)
        except Exception:
            pass

        self.send_json(200, {
            'success': True,
            'id': unique_id,
            'message': 'Thank you for helping us improve TOOLSERA! Your feedback has been received.'
        })

    def do_PATCH(self):
        # Allow standard PATCH method for admin updates
        self.do_POST()

    def do_DELETE(self):
        if not self.check_admin_auth():
            self.send_json(401, {'success': False, 'message': 'Unauthorized. Admin access required.'})
            return

        fb_id = None
        if '?' in self.path:
            query = self.path.split('?', 1)[1]
            params = dict(qc.split('=', 1) for qc in query.split('&') if '=' in qc)
            fb_id = params.get('id')

        if not fb_id:
            self.send_json(400, {'success': False, 'message': 'Feedback ID is required.'})
            return

        feedbacks = get_feedbacks()
        original_len = len(feedbacks)
        feedbacks = [fb for fb in feedbacks if fb.get('id') != fb_id]
        if len(feedbacks) < original_len:
            save_feedbacks(feedbacks)
            self.send_json(200, {'success': True, 'message': 'Feedback entry deleted'})
        else:
            self.send_json(404, {'success': False, 'message': 'Feedback entry not found'})

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.end_headers()
        self.wfile.write(body)
