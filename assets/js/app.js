/**
 * TOOLSERA - Application Frontend Controller
 * Enterprise UX, Staged Splash Screen & Video Extraction Pipeline
 * Developed by Adeel Ahmad
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SIGNATURE TOOLSERA STAGED SPLASH SCREEN
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        const hasViewed = sessionStorage.getItem('toolsera_splash_viewed');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (hasViewed || prefersReducedMotion) {
            splashScreen.style.display = 'none';
        } else {
            document.body.classList.add('splash-active');
            // Staged sequence completes at ~1.2s, holds until 1.55s, then smooth fade-out over 350ms
            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                document.body.classList.remove('splash-active');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    sessionStorage.setItem('toolsera_splash_viewed', 'true');
                }, 380);
            }, 1550);
        }
    }

    // 2. MOBILE MENU & ACCESSIBILITY CONTROLLER
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    function openMobileMenu() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.add('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.add('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
        if (drawerBackdrop) {
            drawerBackdrop.classList.add('active');
        }
        document.body.classList.add('menu-open');
    }

    function closeMobileMenu() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.remove('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        if (drawerBackdrop) {
            drawerBackdrop.classList.remove('active');
        }
        document.body.classList.remove('menu-open');
    }

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileDrawer.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close when tapping any link inside the mobile drawer
        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close on click outside drawer
        document.addEventListener('click', (e) => {
            if (mobileDrawer.classList.contains('active') && !mobileDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
                closeMobileMenu();
                mobileMenuBtn.focus();
            }
        });
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', closeMobileMenu);
    }

    // 3. DOWNLOADER LOGIC (Only runs if downloader elements exist on page)
    const urlInput      = document.getElementById('urlInput');
    const submitBtn     = document.getElementById('submitBtn');
    const pasteBtn      = document.getElementById('pasteBtn');
    const clearBtn      = document.getElementById('clearBtn');
    const skeletonCard  = document.getElementById('skeletonCard');
    const mediaCard     = document.getElementById('mediaCard');
    const formatTabs    = document.querySelectorAll('.tab-btn');

    const posterImg     = document.getElementById('posterImg');
    const authorText    = document.getElementById('authorText');
    const captionText   = document.getElementById('captionText');
    const downloadVideo = document.getElementById('downloadVideoBtn');
    const downloadAudio = document.getElementById('downloadAudioBtn');
    const copyLinkBtn   = document.getElementById('copyLinkBtn');
    const resetBtn      = document.getElementById('resetBtn');

    if (!urlInput || !submitBtn) {
        return; // Exit gracefully on content pages
    }

    let currentMediaData = null;

    // Format Tabs Switcher
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const formatType = tab.dataset.type;

            if (formatType === 'audio') {
                urlInput.placeholder = 'Paste Instagram link to extract MP3 audio...';
            } else if (formatType === 'reel') {
                urlInput.placeholder = 'Paste Instagram Reel link (e.g. instagram.com/reel/...)...';
            } else {
                urlInput.placeholder = 'Paste Instagram Video or Reel link here...';
            }
            urlInput.focus();
        });
    });

    // Clear Button Visibility
    urlInput.addEventListener('input', () => {
        clearBtn.style.display = urlInput.value.trim().length > 0 ? 'inline-flex' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        clearBtn.style.display = 'none';
        urlInput.focus();
    });

    // Smart Clipboard Paste
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim().length > 0) {
                        urlInput.value = text.trim();
                        clearBtn.style.display = 'inline-flex';
                        showToast('Link pasted from clipboard', 'success');

                        if (isValidInstagramUrl(urlInput.value)) {
                            handleExtraction();
                        }
                    } else {
                        showToast('Clipboard is empty', 'error');
                    }
                } else {
                    urlInput.focus();
                    showToast('Press Ctrl+V to paste', 'info');
                }
            } catch (err) {
                urlInput.focus();
                showToast('Please paste manually (Ctrl+V)', 'info');
            }
        });
    }

    // Enter Key Submission
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleExtraction();
        }
    });

    // Submit Button Trigger
    submitBtn.addEventListener('click', handleExtraction);

    // Extraction Pipeline Handler
    async function handleExtraction() {
        const url = urlInput.value.trim();

        if (!url) {
            showToast('Please enter or paste an Instagram link', 'error');
            urlInput.focus();
            return;
        }

        if (!isValidInstagramUrl(url)) {
            showToast('Please enter a valid Instagram Video or Reel URL', 'error');
            return;
        }

        // Set Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
            <span>Analyzing...</span>
        `;

        mediaCard.style.display = 'none';
        skeletonCard.style.display = 'flex';
        skeletonCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        try {
            const response = await fetch('api/extract.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            const result = await response.json();

            if (result.success && result.data) {
                renderMediaCard(result.data);
                showToast('Video ready for download!', 'success');
            } else {
                showToast(result.message || 'Unable to retrieve video. Post may be private.', 'error');
            }
        } catch (error) {
            console.error('Extraction Error:', error);
            showToast('Network error. Please verify your connection or try again.', 'error');
        } finally {
            skeletonCard.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Get Video</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            `;
        }
    }

    // Render Result Card
    function renderMediaCard(data) {
        currentMediaData = data;

        // Set image with referrerpolicy no-referrer and fallback handling
        posterImg.referrerPolicy = 'no-referrer';
        const initialThumb = data.thumbnail || data.thumbnail_proxy || data.thumbnail_raw || 'assets/images/favicon.svg';
        posterImg.src = initialThumb;
        posterImg.alt = data.title || 'Instagram Media';

        posterImg.onerror = () => {
            if (data.thumbnail_raw && posterImg.src !== data.thumbnail_raw) {
                posterImg.src = data.thumbnail_raw;
            } else {
                posterImg.src = 'assets/images/logo.png';
            }
        };

        authorText.textContent = data.author || '@instagram_creator';
        captionText.textContent = data.caption || data.title || 'High quality Instagram video';

        // Single Confirmed Download Handler
        const streamUrl = data.download_stream_url || ('api/download.php?v=' + encodeURIComponent(btoa(data.video_url)));

        downloadVideo.href = streamUrl;
        downloadVideo.setAttribute('download', 'toolsera_instagram_video.mp4');

        downloadVideo.onclick = async (e) => {
            e.preventDefault();
            const originalText = downloadVideo.innerHTML;
            downloadVideo.style.pointerEvents = 'none';
            downloadVideo.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                </svg>
                <span>Downloading Video...</span>
            `;
            showToast('Starting 1080p video download...', 'info');

            try {
                const response = await fetch(streamUrl);
                if (!response.ok) throw new Error('Stream response error');
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = 'toolsera_instagram_video.mp4';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                    a.remove();
                }, 2000);
                showToast('Video saved successfully!', 'success');
            } catch (err) {
                console.warn('Blob fetch failed, falling back to direct location download:', err);
                const targetDownload = streamUrl || data.direct_download_url || data.video_url;
                window.location.href = targetDownload;
            } finally {
                downloadVideo.style.pointerEvents = 'auto';
                downloadVideo.innerHTML = originalText;
            }
        };

        // Audio (MP3) Download Handler
        downloadAudio.href = streamUrl + '&type=audio';
        downloadAudio.setAttribute('download', 'toolsera_audio.mp3');
        downloadAudio.onclick = async (e) => {
            e.preventDefault();
            const originalAudioText = downloadAudio.innerHTML;
            downloadAudio.style.pointerEvents = 'none';
            downloadAudio.innerHTML = `<span>Saving...</span>`;
            showToast('Extracting audio track...', 'info');

            const audioUrl = streamUrl + '&type=audio';
            try {
                const response = await fetch(audioUrl);
                if (!response.ok) throw new Error('Audio stream error');
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = 'toolsera_audio.mp3';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                    a.remove();
                }, 2000);
                showToast('Audio MP3 downloaded!', 'success');
            } catch (err) {
                window.location.href = audioUrl;
            } finally {
                downloadAudio.style.pointerEvents = 'auto';
                downloadAudio.innerHTML = originalAudioText;
            }
        };

        mediaCard.style.display = 'block';
        mediaCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Copy Link
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            if (!currentMediaData || !currentMediaData.video_url) return;
            try {
                await navigator.clipboard.writeText(currentMediaData.video_url);
                showToast('Direct video link copied!', 'success');
            } catch (e) {
                showToast('Could not copy link', 'error');
            }
        });
    }

    // Reset Form
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            mediaCard.style.display = 'none';
            urlInput.value = '';
            clearBtn.style.display = 'none';
            urlInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // URL Validator
    function isValidInstagramUrl(url) {
        return /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|share)\/[A-Za-z0-9_-]+/i.test(url);
    }

    // Toast Notification
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconSvg = type === 'success'
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5938E8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }
});

// Keyframe Spin Injection
const spinStyle = document.createElement("style");
spinStyle.innerText = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);
