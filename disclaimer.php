<?php
/**
 * TOOLSERA - Disclaimer & Legal
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
    <title>Disclaimer - <?= htmlspecialchars($appName) ?></title>
    <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <!-- HEADER -->
    <header class="site-header">
        <div class="container header-inner">
            <a href="index.php" class="brand-link" aria-label="Toolsera Home">
                <img src="assets/images/logo.png" alt="Toolsera" class="brand-logo-img">
            </a>

            <nav aria-label="Main Navigation">
                <ul class="nav-links">
                    <li><a href="index.php">Home</a></li>
                    <li><a href="about.php">About Us</a></li>
                    <li><a href="contact.php">Contact Us</a></li>
                    <li><a href="disclaimer.php" class="active">Disclaimer</a></li>
                </ul>
            </nav>

            <div class="header-action">
                <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileDrawer">
                    <svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="18" x2="18" y2="6"></line></svg>
                </button>
            </div>
        </div>

        <div class="mobile-drawer" id="mobileDrawer">
            <a href="index.php">Home</a>
            <a href="about.php">About Us</a>
            <a href="contact.php">Contact Us</a>
            <a href="disclaimer.php" class="active">Disclaimer</a>
        </div>
        <div class="drawer-backdrop" id="drawerBackdrop"></div>
    </header>

    <main class="page-container">
        <div class="page-header">
            <h1 class="page-title">Legal <span class="brand-purple-text">Disclaimer</span></h1>
            <p class="page-subtitle">Terms, intellectual property information, and fair use policies.</p>
        </div>

        <div class="page-card">
            <h2>Non-Affiliation Notice</h2>
            <p>
                <strong>Toolsera</strong> is an independent software tool and web utility developed by <strong>Adeel Ahmad</strong>. Toolsera is <strong>NOT</strong> affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with <strong>Instagram</strong>, <strong>Meta Platforms, Inc.</strong>, or any of their subsidiaries or affiliates.
            </p>
            <p>
                The official Instagram website can be found at <a href="https://www.instagram.com" target="_blank" rel="noopener" style="color: var(--brand-purple);">https://www.instagram.com</a>. The names "Instagram", "Insta", as well as related names, marks, emblems, and images are registered trademarks of their respective owners.
            </p>

            <h2>No Media Hosting or Storage</h2>
            <p>
                Toolsera does <strong>not</strong> host, store, archive, or cache any video, audio, or photographic files on its servers. When a user requests a download, our script acts strictly as a real-time transport bridge between Instagram's public Content Delivery Network (CDN) and the user's browser. All content remains solely on Instagram's official servers.
            </p>

            <h2>Personal Use & Fair Use Policy</h2>
            <p>
                This utility is provided exclusively for personal, non-commercial, and educational archival purposes. Users are solely responsible for ensuring that their download of any media complies with local copyright laws, intellectual property rights, and fair-use principles. You must not use Toolsera to download copyrighted material for redistribution or commercial exploitation without obtaining prior explicit authorization from the original creator.
            </p>

            <h2>Private Accounts Protection</h2>
            <p>
                Toolsera strictly respects user privacy. We do not provide mechanisms to bypass privacy settings or download content from private Instagram accounts. Only publicly accessible media can be retrieved through this platform.
            </p>

            <h2>DMCA & Content Inquiries</h2>
            <p>
                If you are a copyright holder and have concerns regarding public media references, please contact our administrator directly:
            </p>
            <p>
                <strong>Developer & Administrator:</strong> Adeel Ahmad<br>
                <strong>Contact Email:</strong> <a href="mailto:adeelahmed3376@gmail.com" style="color: var(--brand-purple); font-weight: 600;">adeelahmed3376@gmail.com</a>
            </p>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-bottom-flex">
                <p class="copyright-text">&copy; <?= date('Y') ?> <strong>Toolsera</strong>. All rights reserved.</p>
                <p class="developer-credit-text">Developed with precision by <strong>Adeel Ahmad</strong></p>
            </div>
        </div>
    </footer>

    <script src="assets/js/app.js"></script>
</body>
</html>
