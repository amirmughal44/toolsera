# TOOLSERA - Instagram Video & Reels Downloader

A high-performance, watermark-free Instagram media downloader web application built with a multi-tier extraction engine, bespoke UI/UX design, and zero-bloat vanilla frontend.

---

## 🚀 Key Highlights & Architectural Features

1. **Bespoke UI/UX Design System:**
   - Designed around the official **TOOLSERA** brand identity (Obsidian dark background, electric purple `#635BFF` accent, subtle glassmorphism, and custom typography with *Plus Jakarta Sans* and *Outfit*).
   - Smart clipboard detection: Automatically pastes from clipboard on click (`navigator.clipboard`).
   - Format tabs for **Video**, **Reels**, **Stories**, and **Audio (MP3)**.
   - Interactive skeleton shimmer preview during extraction.
   - Direct media card with author metadata, quality badges (`1080p Full HD`), and dual download triggers.

2. **Chunked Streaming Download Proxy (`api/download.php`):**
   - Bypasses Instagram CDN hotlinking/CORS protection and referrer restrictions.
   - Sets `Content-Disposition: attachment; filename="toolsera_video.mp4"` so clicking **Download** directly downloads the file to the user's phone or computer rather than playing it in a new browser tab.
   - Streams in chunks to maintain low server RAM usage (< 15MB).

3. **Multi-Tier Extraction Pipeline ("Lifetime" Reliability):**
   - **Driver 1 (`InstagramEmbedExtractor`):** Exploits Instagram's public embed endpoint, which has significantly fewer bot restrictions because it is designed to be embedded across external websites.
   - **Driver 2 (`InstagramDirectExtractor`):** Scrapes JSON-LD structured schema and OpenGraph video tags with rotating browser headers.
   - **Driver 3 (`YtDlpExtractor`):** If `yt-dlp` is installed on your server, this driver seamlessly extracts direct MP4 URLs.
   - **Driver 4 (`RapidApiExtractor`):** Optional high-availability fallback. If your server IP faces temporary challenge checks, this handles requests without user disruption.

---

## 📁 Project Structure

```text
fb software/
├── config.php                      # Application settings, pipeline switches, proxies, API keys
├── index.php                       # Main responsive single-page web app
├── api/
│   ├── extract.php                 # AJAX endpoint for video analysis & metadata extraction
│   └── download.php                # Chunked stream proxy forcing attachment downloads
├── includes/
│   ├── ExtractorInterface.php      # Base extraction contract
│   ├── InstagramEmbedExtractor.php # Embed captioned endpoint extractor
│   ├── InstagramDirectExtractor.php# Direct HTML/JSON-LD extractor
│   ├── RapidApiExtractor.php       # Optional 3rd party fallback
│   ├── YtDlpExtractor.php          # Optional CLI fallback
│   └── ExtractionManager.php       # Orchestrator managing fallbacks
└── assets/
    ├── images/
    │   ├── logo.png                # Official Toolsera logo
    │   └── favicon.svg             # Custom vector favicon
    ├── css/
    │   └── style.css               # Bespoke CSS (modern dark SaaS theme)
    └── js/
        └── app.js                  # Frontend interactions, AJAX, toast alerts, FAQ accordion
```

---

## 🛠️ Deployment Instructions

### Option A: Uploading to cPanel / Shared Hosting (Apache / LiteSpeed)
1. Compress all files in `fb software` into a `.zip` file.
2. In cPanel, open **File Manager** and navigate to your `public_html` directory (or a subdomain folder).
3. Upload and extract the zip file.
4. Ensure PHP version is set to **PHP 8.0, 8.1, 8.2, or 8.3** with `curl` and `json` extensions enabled (enabled by default on all hosts).
5. Open your domain in your browser!

### Option B: VPS (Nginx / Apache + Ubuntu)
Ensure `php-curl` is installed:
```bash
sudo apt update && sudo apt install php-fpm php-curl -y
```

Point your Nginx `root` to the project directory:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/toolsera;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }
}
```

---

## ⚙️ Configuration (`config.php`)

To toggle drivers or configure optional backups:
```php
'pipeline' => [
    'enable_embed_extractor'  => true,  // Primary driver
    'enable_direct_extractor' => true,  // Secondary driver
    'enable_ytdlp'            => false, // Set true if server has yt-dlp installed
    'enable_rapidapi_fallback'=> false, // Set true if you enter a RapidAPI key
],
```
