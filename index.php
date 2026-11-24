<?php
/**
 * TOOLSERA - Master Application View
 * Fast & Clean Instagram Video Downloader
 * Developed by Adeel Ahmad
 */

declare(strict_types=1);

$config = require __DIR__ . '/config.php';
$appName = $config['app']['name'] ?? 'Toolsera';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title><?= htmlspecialchars($appName) ?> - Download Instagram Reels & Videos in 1080p HD</title>
    
    <!-- SEO & Metadata -->
    <meta name="description" content="Toolsera is a modern, watermark-free web utility to download Instagram Reels, Videos, and Audio in 1080p Full HD. Developed by Adeel Ahmad.">
    <meta property="og:title" content="<?= htmlspecialchars($appName) ?> - Instagram Video Downloader">
    <meta property="og:description" content="Download Instagram Reels and Videos in original 1080p quality for free with Toolsera.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="assets/images/logo.png">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">

    <!-- Fonts: Inter & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- SIGNATURE STAGED TOOLSERA INTRO SPLASH -->
    <div id="splashScreen" class="splash-overlay" aria-hidden="true">
        <div class="splash-container">
            <div class="splash-logo-stage">
                <img src="assets/images/splash/logo-top-bar.png" alt="" class="splash-layer layer-top">
                <img src="assets/images/splash/logo-stem.png" alt="" class="splash-layer layer-stem">
                <img src="assets/images/splash/logo-play.png" alt="" class="splash-layer layer-play">
                <div class="splash-wordmark-wrap">
                    <img src="assets/images/splash/logo-wordmark.png" alt="TOOLSERA" class="splash-layer layer-wordmark">
                </div>
            </div>
        </div>
    </div>

    <!-- SITE HEADER -->
    <header class="site-header">
        <div class="container header-inner">
            <a href="index.php" class="brand-link" aria-label="Toolsera Home">
                <img src="assets/images/logo.png" alt="Toolsera" class="brand-logo-img">
            </a>

            <nav aria-label="Main Navigation">
                <ul class="nav-links">
                    <li><a href="index.php" class="active">Home</a></li>
                    <li><a href="about.php">About Us</a></li>
                    <li><a href="contact.php">Contact Us</a></li>
                    <li><a href="disclaimer.php">Disclaimer</a></li>
                </ul>
            </nav>

            <div class="header-action">
                <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileDrawer">
                    <svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="18" x2="18" y2="6"></line></svg>
                </button>
            </div>
        </div>

        <!-- Mobile Drawer & Backdrop -->
        <div class="mobile-drawer" id="mobileDrawer">
            <a href="index.php" class="active">Home</a>
            <a href="about.php">About Us</a>
            <a href="contact.php">Contact Us</a>
            <a href="disclaimer.php">Disclaimer</a>
        </div>
        <div class="drawer-backdrop" id="drawerBackdrop"></div>
    </header>

    <!-- MAIN DOWNLOADER EXPERIENCE -->
    <main>
        <section class="hero-section" id="downloader">
            <div class="container">
                <div class="hero-pill">
                    <span>Original Quality • No Watermark • 100% Free</span>
                </div>

                <h1 class="hero-title">
                    Download Instagram <br>
                    <span class="brand-purple-text">Reels, Videos & Audio</span>
                </h1>

                <p class="hero-subtitle">
                    Fast, clean, and direct. Paste any public Instagram link below to save your video in high definition without watermarks.
                </p>

                <!-- Format Selection Tabs -->
                <div class="format-tabs" role="tablist">
                    <button class="tab-btn active" data-type="video" role="tab">
                        <svg viewBox="0 0 24 24"><path d="M4 6H20V18H4zM2 4v16h20V4z"/></svg>
                        <span>Video / Reels</span>
                    </button>
                    <button class="tab-btn" data-type="reel" role="tab">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                        <span>Reels</span>
                    </button>
                    <button class="tab-btn" data-type="audio" role="tab">
                        <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        <span>Audio (MP3)</span>
                    </button>
                </div>

                <!-- Search Capsule Box -->
                <div class="downloader-box">
                    <div class="search-capsule">
                        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>

                        <input 
                            type="text" 
                            id="urlInput" 
                            class="search-input" 
                            placeholder="Paste Instagram link here (e.g. https://www.instagram.com/reel/...)" 
                            autocomplete="off"
                            spellcheck="false"
                        >

                        <div class="capsule-actions">
                            <button type="button" id="clearBtn" class="btn-clear" title="Clear input">×</button>
                            <button type="button" id="pasteBtn" class="btn-paste">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                                <span>Paste</span>
                            </button>
                            <button type="button" id="submitBtn" class="btn-submit">
                                <span>Get Video</span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="search-hint">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            No login required
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            Original 1080p Quality
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            Instant Download
                        </span>
                    </div>

                    <!-- RESULTS CONTAINER -->
                    <div class="results-wrapper">
                        <!-- Skeleton Shimmer Loader -->
                        <div id="skeletonCard" class="skeleton-card">
                            <div class="skeleton-thumb"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-line short"></div>
                                <div class="skeleton-line medium"></div>
                                <div class="skeleton-line"></div>
                                <div class="skeleton-line btn"></div>
                            </div>
                        </div>

                        <!-- Active Result Media Card -->
                        <div id="mediaCard" class="media-card">
                            <div class="media-grid">
                                <div class="media-poster-wrap">
                                    <img id="posterImg" src="" alt="Video Poster" class="media-poster-img" referrerpolicy="no-referrer">
                                    <div class="media-quality-badge">
                                        <span>1080p Full HD</span>
                                    </div>
                                    <div id="durationBadge" class="media-duration-badge">HD MP4</div>
                                </div>

                                <div class="media-meta">
                                    <div class="media-author">
                                        <span id="authorText">@creator</span>
                                        <span class="media-author-badge">Public Video</span>
                                    </div>

                                    <p id="captionText" class="media-caption">
                                        Instagram Video
                                    </p>

                                    <div class="download-actions">
                                        <a href="#" id="downloadVideoBtn" class="btn-download-primary" download="toolsera_video.mp4">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            <span>Download Video (1080p MP4)</span>
                                        </a>

                                        <div class="action-row">
                                            <a href="#" id="downloadAudioBtn" class="btn-action-secondary" download="toolsera_audio.mp3">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M9 18V5l12-2v13"></path>
                                                    <circle cx="6" cy="18" r="3"></circle>
                                                    <circle cx="18" cy="16" r="3"></circle>
                                                </svg>
                                                <span>Audio (MP3)</span>
                                            </a>

                                            <button type="button" id="copyLinkBtn" class="btn-action-secondary">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                </svg>
                                                <span>Copy Link</span>
                                            </button>
                                        </div>

                                        <div class="reset-action">
                                            <button type="button" id="resetBtn" class="btn-reset">Download another video</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- CLEAN SAAS FOOTER -->
    <footer class="site-footer">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <a href="index.php" class="brand-link">
                        <img src="assets/images/logo.png" alt="Toolsera" class="brand-logo-img">
                    </a>
                    <p>
                        Toolsera is a fast, watermark-free digital media utility engineered for high-quality, seamless asset downloads.
                    </p>
                    <div class="dev-badge-wrap">
                        <span class="dev-badge">
                            Developed by <strong>Adeel Ahmad</strong>
                        </span>
                    </div>
                </div>

                <div class="footer-col">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="index.php">Home Downloader</a></li>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="contact.php">Contact Us</a></li>
                        <li><a href="disclaimer.php">Legal Disclaimer</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Direct Support</h4>
                    <p class="footer-email-text">Inquiries, questions, or feedback?</p>
                    <a href="mailto:adeelahmed3376@gmail.com" class="footer-mail-link">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>adeelahmed3376@gmail.com</span>
                    </a>
                </div>
            </div>

            <div class="footer-bottom">
                <p class="disclaimer-text">
                    <strong>Disclaimer:</strong> Toolsera is an independent utility and is not affiliated with, endorsed by, or sponsored by Instagram or Meta Platforms, Inc. All trademarks and media belong to their respective creators.
                </p>
                <div class="footer-bottom-flex">
                    <p class="copyright-text">
                        &copy; <?= date('Y') ?> <strong><?= htmlspecialchars($appName) ?></strong>. All rights reserved.
                    </p>
                    <p class="developer-credit-text">
                        Crafted with precision by <strong>Adeel Ahmad</strong>
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>

    <!-- Scripts -->
    <script src="assets/js/app.js"></script>
</body>
</html>
