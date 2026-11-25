/**
 * TOOLSERA - Application Frontend Controller
 * All-in-One Instagram Downloader, Anonymous Story & HD DP Viewer
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

        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
            if (mobileDrawer.classList.contains('active') && !mobileDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

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

    // 3. MULTI-MODE DOWNLOADER & VIEWER CONTROLLER
    const urlInput         = document.getElementById('urlInput');
    const submitBtn        = document.getElementById('submitBtn');
    const pasteBtn         = document.getElementById('pasteBtn');
    const clearBtn         = document.getElementById('clearBtn');
    const skeletonCard     = document.getElementById('skeletonCard');
    const formatTabs       = document.querySelectorAll('.tab-btn');

    // Cards
    const mediaCard        = document.getElementById('mediaCard');
    const dpCard           = document.getElementById('dpCard');
    const storyCard        = document.getElementById('storyCard');
    const privateAlertCard = document.getElementById('privateAlertCard');

    // Video elements
    const posterImg        = document.getElementById('posterImg');
    const authorText       = document.getElementById('authorText');
    const captionText      = document.getElementById('captionText');
    const downloadVideo    = document.getElementById('downloadVideoBtn');
    const downloadAudio    = document.getElementById('downloadAudioBtn');
    const copyLinkBtn      = document.getElementById('copyLinkBtn');
    const resetBtn         = document.getElementById('resetBtn');

    // DP elements
    const dpImg            = document.getElementById('dpImg');
    const dpUsernameText   = document.getElementById('dpUsernameText');
    const dpTitleText      = document.getElementById('dpTitleText');
    const downloadDpBtn    = document.getElementById('downloadDpBtn');
    const viewFullDpBtn    = document.getElementById('viewFullDpBtn');
    const copyDpLinkBtn    = document.getElementById('copyDpLinkBtn');

    // Story elements
    const storyUsernameText    = document.getElementById('storyUsernameText');
    const storyCountBadge      = document.getElementById('storyCountBadge');
    const storyItemsContainer  = document.getElementById('storyItemsContainer');

    // Alert elements
    const alertMessage         = document.getElementById('alertMessage');
    const alertViewDpBtn       = document.getElementById('alertViewDpBtn');

    if (!urlInput || !submitBtn) {
        return; // Exit gracefully on secondary pages
    }

    let currentMode = 'video';
    let currentData = null;

    function hideAllCards() {
        if (mediaCard) mediaCard.style.display = 'none';
        if (dpCard) dpCard.style.display = 'none';
        if (storyCard) storyCard.style.display = 'none';
        if (privateAlertCard) privateAlertCard.style.display = 'none';
        if (skeletonCard) skeletonCard.style.display = 'none';
    }

    // Tab Switcher
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.type || 'video';

            hideAllCards();

            if (currentMode === 'story') {
                urlInput.placeholder = 'Enter @username (e.g. @cristiano) or story link...';
                submitBtn.querySelector('span').textContent = 'View Stories';
            } else if (currentMode === 'dp') {
                urlInput.placeholder = 'Enter @username (e.g. @cristiano) to view 1080p DP...';
                submitBtn.querySelector('span').textContent = 'View HD DP';
            } else {
                urlInput.placeholder = 'Paste Instagram Video or Reel link here...';
                submitBtn.querySelector('span').textContent = 'Get Video';
            }
            urlInput.focus();
        });
    });

    // Clear Button
    urlInput.addEventListener('input', () => {
        clearBtn.style.display = urlInput.value.trim().length > 0 ? 'inline-flex' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        clearBtn.style.display = 'none';
        urlInput.focus();
    });

    // Paste Button
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim().length > 0) {
                        urlInput.value = text.trim();
                        clearBtn.style.display = 'inline-flex';
                        showToast('Pasted from clipboard', 'success');
                        handleExtraction();
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

    // Enter Key
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleExtraction();
        }
    });

    submitBtn.addEventListener('click', handleExtraction);

    // Extraction Pipeline
    async function handleExtraction() {
        const rawInput = urlInput.value.trim();

        if (!rawInput) {
            showToast('Please enter an Instagram link or username', 'error');
            urlInput.focus();
            return;
        }

        // Auto-switch mode if user pasted a story link in video tab
        let mode = currentMode;
        if (rawInput.includes('/stories/')) {
            mode = 'story';
        } else if (!rawInput.startsWith('http') && currentMode === 'video') {
            mode = 'dp'; // Default raw username to HD DP viewer
        }

        // Loading State
        submitBtn.disabled = true;
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
            <span>Fetching...</span>
        `;

        hideAllCards();
        skeletonCard.style.display = 'flex';
        skeletonCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        try {
            const response = await fetch('api/extract.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url: rawInput, type: mode })
            });

            const result = await response.json();

            if (result.success && result.data) {
                currentData = result.data;
                const resultMode = result.mode || mode;

                if (resultMode === 'dp') {
                    renderDpCard(result.data);
                    showToast('Full HD Profile Picture ready!', 'success');
                } else if (resultMode === 'stories') {
                    renderStoryCard(result.data);
                    showToast(`${result.data.count || 0} active stories loaded!`, 'success');
                } else if (resultMode === 'stories_private') {
                    renderPrivateAlert(result.data);
                } else if (resultMode === 'stories_empty') {
                    showToast(result.data.message || 'No active stories in the last 24 hours.', 'info');
                } else {
                    renderMediaCard(result.data);
                    showToast('Video ready for download!', 'success');
                }
            } else {
                showToast(result.message || 'Unable to retrieve media. Please verify input.', 'error');
            }
        } catch (error) {
            console.error('Extraction Error:', error);
            showToast('Network error. Please try again.', 'error');
        } finally {
            skeletonCard.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    }

    // 1. Render Video Card
    function renderMediaCard(data) {
        posterImg.referrerPolicy = 'no-referrer';
        const initialThumb = data.thumbnail || data.thumbnail_proxy || data.thumbnail_raw || 'assets/images/logo.png';
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

        const streamUrl = data.download_stream_url || ('api/download.php?v=' + encodeURIComponent(btoa(data.video_url)));
        downloadVideo.href = streamUrl;
        downloadVideo.setAttribute('download', 'toolsera_instagram_video.mp4');

        downloadVideo.onclick = async (e) => {
            e.preventDefault();
            downloadDirectBlob(streamUrl, data.direct_download_url || data.video_url, 'toolsera_instagram_video.mp4', downloadVideo);
        };

        downloadAudio.href = streamUrl + '&type=audio';
        downloadAudio.setAttribute('download', 'toolsera_audio.mp3');
        downloadAudio.onclick = async (e) => {
            e.preventDefault();
            downloadDirectBlob(streamUrl + '&type=audio', null, 'toolsera_audio.mp3', downloadAudio);
        };

        mediaCard.style.display = 'block';
        mediaCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 2. Render DP Card
    function renderDpCard(data) {
        dpImg.referrerPolicy = 'no-referrer';
        const dpSrc = data.thumbnail || data.dp_url;
        dpImg.src = dpSrc;
        dpUsernameText.textContent = data.username || '@user';
        dpTitleText.textContent = data.title || 'Full HD Uncompressed Profile Picture';

        downloadDpBtn.href = data.dp_url;
        downloadDpBtn.setAttribute('download', `${data.username || 'instagram'}_dp_1080p.jpg`);
        downloadDpBtn.onclick = async (e) => {
            e.preventDefault();
            downloadDirectBlob(dpSrc, data.dp_url, `${data.username || 'instagram'}_dp_1080p.jpg`, downloadDpBtn);
        };

        if (viewFullDpBtn) {
            viewFullDpBtn.href = data.dp_url;
        }

        if (copyDpLinkBtn) {
            copyDpLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(data.dp_url);
                    showToast('Full HD image link copied!', 'success');
                } catch (e) {
                    showToast('Could not copy link', 'error');
                }
            };
        }

        dpCard.style.display = 'block';
        dpCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 3. Render Stories Card
    function renderStoryCard(data) {
        storyUsernameText.textContent = data.username || '@user';
        storyCountBadge.textContent = `${data.count || data.stories.length} Active Stories`;
        storyItemsContainer.innerHTML = '';

        data.stories.forEach((story, idx) => {
            const card = document.createElement('div');
            card.className = 'story-item-card';

            const isVideo = story.type === 'video';
            const mediaTag = isVideo 
                ? `<video src="${story.url}" controls class="story-preview-video" preload="metadata"></video>`
                : `<img src="${story.preview_proxy || story.url}" alt="Story ${idx+1}" class="story-preview-img" referrerpolicy="no-referrer">`;

            const fileName = `toolsera_${data.username}_story_${idx+1}.${isVideo ? 'mp4' : 'jpg'}`;

            card.innerHTML = `
                <div class="story-media-preview">
                    ${mediaTag}
                    <div class="story-type-badge">${isVideo ? 'Video' : 'Photo'}</div>
                </div>
                <div class="story-card-actions">
                    <a href="${story.download_url}" class="btn-story-download" download="${fileName}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Download ${isVideo ? 'MP4' : 'JPG'}</span>
                    </a>
                </div>
            `;

            // Attach blob download click
            const dlBtn = card.querySelector('.btn-story-download');
            dlBtn.onclick = (e) => {
                e.preventDefault();
                downloadDirectBlob(story.download_url, story.url, fileName, dlBtn);
            };

            storyItemsContainer.appendChild(card);
        });

        storyCard.style.display = 'block';
        storyCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 4. Render Private Account Alert
    function renderPrivateAlert(data) {
        if (alertMessage) {
            alertMessage.innerHTML = `
                This account <strong>(${data.username})</strong> is private. Instagram protects their 24h stories and requires an accepted follow request. However, you can still view and download their <strong>Full HD Profile Picture (DP)</strong>!
            `;
        }

        if (alertViewDpBtn) {
            alertViewDpBtn.querySelector('span').textContent = `View ${data.username}'s Full HD DP`;
            alertViewDpBtn.onclick = () => {
                urlInput.value = data.username;
                const dpTab = document.getElementById('tabDp');
                if (dpTab) dpTab.click();
                handleExtraction();
            };
        }

        privateAlertCard.style.display = 'block';
        privateAlertCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Reusable Blob Download Pipeline
    async function downloadDirectBlob(url, fallbackUrl, fileName, btnEl) {
        const originalText = btnEl.innerHTML;
        btnEl.style.pointerEvents = 'none';
        btnEl.innerHTML = `<span>Saving...</span>`;
        showToast('Starting high-speed download...', 'info');

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Fetch failed');
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                a.remove();
            }, 2000);
            showToast('Saved successfully!', 'success');
        } catch (e) {
            const target = fallbackUrl || url;
            window.location.href = target;
        } finally {
            btnEl.style.pointerEvents = 'auto';
            btnEl.innerHTML = originalText;
        }
    }

    // Copy Link Buttons
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            if (!currentData || !currentData.video_url) return;
            try {
                await navigator.clipboard.writeText(currentData.video_url);
                showToast('Direct video link copied!', 'success');
            } catch (e) {
                showToast('Could not copy link', 'error');
            }
        });
    }

    // Reset Triggers
    document.querySelectorAll('.btn-reset, .reset-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllCards();
            urlInput.value = '';
            clearBtn.style.display = 'none';
            urlInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

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
