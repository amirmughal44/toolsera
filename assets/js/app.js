/**
 * TOOLSERA - Application Frontend Controller
 * All-in-One Instagram Downloader, Anonymous Stories, Profile Inspector & Hashtag Generator
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

    // 3. MULTI-MODE CONTROLLER
    const urlInput         = document.getElementById('urlInput');
    const submitBtn        = document.getElementById('submitBtn');
    const pasteBtn         = document.getElementById('pasteBtn');
    const clearBtn         = document.getElementById('clearBtn');
    const skeletonCard     = document.getElementById('skeletonCard');
    const formatTabs       = document.querySelectorAll('.tab-btn');
    const hashtagPillsBar  = document.getElementById('hashtagPillsBar');

    // Result Cards
    const mediaCard        = document.getElementById('mediaCard');
    const dpCard           = document.getElementById('dpCard');
    const storyCard        = document.getElementById('storyCard');
    const profileCard      = document.getElementById('profileCard');
    const hashtagCard      = document.getElementById('hashtagCard');
    const privateAlertCard = document.getElementById('privateAlertCard');

    // Video Elements
    const posterImg        = document.getElementById('posterImg');
    const authorText       = document.getElementById('authorText');
    const captionText      = document.getElementById('captionText');
    const downloadVideo    = document.getElementById('downloadVideoBtn');
    const downloadAudio    = document.getElementById('downloadAudioBtn');
    const copyLinkBtn      = document.getElementById('copyLinkBtn');

    // DP Elements
    const dpImg            = document.getElementById('dpImg');
    const dpUsernameText   = document.getElementById('dpUsernameText');
    const dpTitleText      = document.getElementById('dpTitleText');
    const downloadDpBtn    = document.getElementById('downloadDpBtn');
    const viewFullDpBtn    = document.getElementById('viewFullDpBtn');
    const copyDpLinkBtn    = document.getElementById('copyDpLinkBtn');

    // Story Elements
    const storyUsernameText    = document.getElementById('storyUsernameText');
    const storyCountBadge      = document.getElementById('storyCountBadge');
    const storyItemsContainer  = document.getElementById('storyItemsContainer');
    const playStoryModalBtn    = document.getElementById('playStoryModalBtn');

    // Profile Elements
    const profileAvatarImg     = document.getElementById('profileAvatarImg');
    const profileFullName      = document.getElementById('profileFullName');
    const profileUsername      = document.getElementById('profileUsername');
    const profileStatusBadge   = document.getElementById('profileStatusBadge');
    const profileViewStories   = document.getElementById('profileViewStoriesBtn');
    const profileDownloadDp    = document.getElementById('profileDownloadDpBtn');
    const profileCopyLink      = document.getElementById('profileCopyLinkBtn');
    const profileOpenIg        = document.getElementById('profileOpenIgBtn');

    // Hashtag Elements
    const hashtagKeywordTitle  = document.getElementById('hashtagKeywordTitle');
    const copyAllHashtagsBtn   = document.getElementById('copyAllHashtagsBtn');
    const copyTop10Btn         = document.getElementById('copyTop10Btn');
    const topTagsContainer     = document.getElementById('topTagsContainer');
    const trendingTagsContainer= document.getElementById('trendingTagsContainer');
    const nicheTagsContainer   = document.getElementById('nicheTagsContainer');
    const hashtagCountText     = document.getElementById('hashtagCountText');
    const copySelectedBtn      = document.getElementById('copySelectedBtn');
    const selCountNum          = document.getElementById('selCountNum');

    // Alert Elements
    const alertMessage         = document.getElementById('alertMessage');
    const alertViewDpBtn       = document.getElementById('alertViewDpBtn');

    // Story Lightbox Elements
    const storyModal           = document.getElementById('storyLightboxModal');
    const storyProgressBars    = document.getElementById('storyProgressBars');
    const storyModalAvatar     = document.getElementById('storyModalAvatar');
    const storyModalUser       = document.getElementById('storyModalUser');
    const storyModalIndex      = document.getElementById('storyModalIndex');
    const storyModalCloseBtn   = document.getElementById('storyModalCloseBtn');
    const storyModalMuteBtn    = document.getElementById('storyModalMuteBtn');
    const storySoundOnIcon     = document.getElementById('storySoundOnIcon');
    const storySoundOffIcon    = document.getElementById('storySoundOffIcon');
    const storyModalImg        = document.getElementById('storyModalImg');
    const storyModalVid        = document.getElementById('storyModalVid');
    const storyPrevBtn         = document.getElementById('storyPrevBtn');
    const storyNextBtn         = document.getElementById('storyNextBtn');
    const storyModalDownloadBtn= document.getElementById('storyModalDownloadBtn');

    if (urlInput && submitBtn) {
        let currentMode = 'video';
        let currentData = null;
        let activeStories = [];
        let currentStoryIdx = 0;
        let selectedHashtags = new Set();
        let currentHashtagsData = null;

        function hideAllCards() {
            if (mediaCard) mediaCard.style.display = 'none';
            if (dpCard) dpCard.style.display = 'none';
            if (storyCard) storyCard.style.display = 'none';
            if (profileCard) profileCard.style.display = 'none';
            if (hashtagCard) hashtagCard.style.display = 'none';
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
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'none';
                    urlInput.placeholder = 'Enter Instagram @username (e.g. @cristiano) to view stories...';
                    submitBtn.querySelector('span').textContent = 'View Stories Anonymously';
                } else if (currentMode === 'post') {
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'none';
                    urlInput.placeholder = 'Paste Instagram Post URL or enter @username to view posts...';
                    submitBtn.querySelector('span').textContent = 'View Instagram Posts';
                } else if (currentMode === 'profile') {
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'none';
                    urlInput.placeholder = 'Enter Instagram @username (e.g. @cristiano) to inspect profile...';
                    submitBtn.querySelector('span').textContent = 'Inspect Instagram Profile';
                } else if (currentMode === 'dp') {
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'none';
                    urlInput.placeholder = 'Enter Instagram @username (e.g. @cristiano) to view 1080p DP...';
                    submitBtn.querySelector('span').textContent = 'View Full HD DP';
                } else if (currentMode === 'hashtag') {
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'flex';
                    urlInput.placeholder = 'Enter keyword or topic for hashtags (e.g. reels, fitness)...';
                    submitBtn.querySelector('span').textContent = 'Generate 30 Hashtags';
                } else {
                    if (hashtagPillsBar) hashtagPillsBar.style.display = 'none';
                    urlInput.placeholder = 'Paste Instagram Reel link or Video URL (e.g. instagram.com/reel/...)...';
                    submitBtn.querySelector('span').textContent = 'Download Instagram Reel / Video';
                }
                urlInput.focus();
            });
        });

    // Niche Pills Handling
    if (hashtagPillsBar) {
        hashtagPillsBar.querySelectorAll('.niche-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                hashtagPillsBar.querySelectorAll('.niche-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                urlInput.value = pill.dataset.niche;
                clearBtn.style.display = 'inline-flex';
                handleExtraction();
            });
        });
    }

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
            showToast('Please enter an Instagram link, username, or keyword', 'error');
            urlInput.focus();
            return;
        }

        let mode = currentMode;
        if (rawInput.includes('/stories/')) {
            mode = 'story';
        } else if (!rawInput.startsWith('http') && currentMode === 'video') {
            mode = 'profile'; // Default username in video mode to profile inspector
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

                if (resultMode === 'hashtag') {
                    renderHashtagCard(result.data);
                    showToast('30 optimized hashtags generated!', 'success');
                } else if (resultMode === 'profile') {
                    renderProfileCard(result.data);
                    showToast(`Profile @${result.data.username.replace('@','')} inspected!`, 'success');
                } else if (resultMode === 'dp') {
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
                showToast(result.message || 'Unable to retrieve data. Please verify input.', 'error');
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

    // 1. Render Media Card (Video / Reel / Photo Post)
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
        captionText.textContent = data.caption || data.title || 'High quality Instagram media';

        const isPhoto = (data.media_mode === 'photo' || data.type === 'photo');
        const durationBadge = document.getElementById('durationBadge');
        if (durationBadge) {
            durationBadge.textContent = isPhoto ? '1080p Photo' : '1080p MP4';
        }

        if (isPhoto) {
            const photoUrl = data.photo_url || initialThumb;
            downloadVideo.href = photoUrl;
            const btnSpan = downloadVideo.querySelector('span');
            if (btnSpan) btnSpan.textContent = 'Download Photo (1080p Full HD)';
            downloadVideo.setAttribute('download', `${data.id || 'instagram'}_photo_1080p.jpg`);
            downloadVideo.onclick = async (e) => {
                e.preventDefault();
                downloadDirectBlob(photoUrl, photoUrl, `${data.id || 'instagram'}_photo_1080p.jpg`, downloadVideo);
            };
            if (downloadAudio) downloadAudio.style.display = 'none';
        } else {
            const streamUrl = data.download_stream_url || ('api/download.php?v=' + encodeURIComponent(btoa(data.video_url || '')));
            downloadVideo.href = streamUrl;
            const btnSpan = downloadVideo.querySelector('span');
            if (btnSpan) btnSpan.textContent = 'Download Video (1080p MP4)';
            downloadVideo.setAttribute('download', 'toolsera_instagram_video.mp4');

            downloadVideo.onclick = async (e) => {
                e.preventDefault();
                downloadDirectBlob(streamUrl, data.direct_download_url || data.video_url, 'toolsera_instagram_video.mp4', downloadVideo);
            };

            if (downloadAudio) {
                downloadAudio.style.display = 'inline-flex';
                downloadAudio.href = streamUrl + '&type=audio';
                downloadAudio.setAttribute('download', 'toolsera_audio.mp3');
                downloadAudio.onclick = async (e) => {
                    e.preventDefault();
                    downloadDirectBlob(streamUrl + '&type=audio', null, 'toolsera_audio.mp3', downloadAudio);
                };
            }
        }

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

    // 3. Render Profile Inspector Card with Multi-Tab Feed Explorer
    function renderProfileCard(data) {
        profileAvatarImg.referrerPolicy = 'no-referrer';
        const dpSrc = data.thumbnail || data.dp_url || 'assets/images/logo.png';
        profileAvatarImg.src = dpSrc;
        profileFullName.textContent = data.full_name || data.username.replace('@', '');
        profileUsername.textContent = data.username || '@user';
        
        if (profileStatusBadge) {
            profileStatusBadge.textContent = data.is_private ? 'Private Account' : 'Public Account';
            profileStatusBadge.style.background = data.is_private ? '#FEF2F2' : '#F0FDF4';
            profileStatusBadge.style.color = data.is_private ? '#B91C1C' : '#15803D';
        }

        // Render Feed Tabs Content
        setupProfileFeedTabs(data);

        profileCard.style.display = 'block';
        profileCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function setupProfileFeedTabs(data) {
        const storiesCount = data.stories ? data.stories.length : 0;
        const postsList = data.posts || [];
        const reelsList = data.reels || [];
        const highlightsList = data.highlights || [];

        // Tab count labels
        const storiesBadge = document.getElementById('profileStoriesCount');
        if (storiesBadge) storiesBadge.textContent = storiesCount;
        const postsBadge = document.getElementById('profilePostsCount');
        if (postsBadge) postsBadge.textContent = postsList.length;
        const reelsBadge = document.getElementById('profileReelsCount');
        if (reelsBadge) reelsBadge.textContent = reelsList.length;

        // Populate Stories Panel
        const storiesContainer = document.getElementById('feedStoriesContainer');
        if (storiesContainer) {
            storiesContainer.innerHTML = '';
            if (data.is_private) {
                storiesContainer.innerHTML = `
                    <div class="feed-empty-state">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <h4>Private Account Stories Protected</h4>
                        <p>Instagram protects active stories for private accounts. You can view their uncompressed 1080p DP anytime.</p>
                    </div>
                `;
            } else if (storiesCount === 0) {
                storiesContainer.innerHTML = `
                    <div class="feed-empty-state">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <h4>No Active Stories Right Now</h4>
                        <p>@${data.username.replace('@','')} hasn't posted a story in the last 24 hours. Explore their posts & reels below!</p>
                    </div>
                `;
            } else {
                data.stories.forEach((story, idx) => {
                    const card = document.createElement('div');
                    card.className = 'feed-media-card';
                    card.innerHTML = `
                        <div class="feed-thumb-wrap">
                            <img src="${story.preview_proxy || story.url}" alt="Story ${idx+1}" class="feed-thumb-img" referrerpolicy="no-referrer">
                            <span class="feed-type-pill">${story.type === 'video' ? '🎬 Story Video' : '📸 Story Photo'}</span>
                        </div>
                        <div class="feed-card-actions">
                            <button type="button" class="btn-feed-play" data-idx="${idx}">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Watch Story</span>
                            </button>
                            <a href="${story.download_url}" download="story_${idx+1}.jpg" class="btn-feed-download" title="Download HD">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </a>
                        </div>
                    `;
                    card.querySelector('.btn-feed-play').onclick = () => {
                        activeStories = data.stories;
                        openStoryLightbox(idx, data.username);
                    };
                    storiesContainer.appendChild(card);
                });
            }
        }

        // Populate Posts Panel
        const postsContainer = document.getElementById('feedPostsContainer');
        if (postsContainer) {
            postsContainer.innerHTML = '';
            postsList.forEach((post, idx) => {
                const card = document.createElement('div');
                card.className = 'feed-media-card';
                card.innerHTML = `
                    <div class="feed-thumb-wrap">
                        <img src="${post.thumbnail}" alt="Post ${idx+1}" class="feed-thumb-img" referrerpolicy="no-referrer">
                        <span class="feed-type-pill">📸 Photo</span>
                    </div>
                    <div class="feed-card-info">
                        <p class="feed-caption">${post.caption}</p>
                        <div class="feed-metrics">
                            <span>❤️ ${post.likes}</span>
                            <span>💬 ${post.comments}</span>
                            <span>⏱️ ${post.time}</span>
                        </div>
                    </div>
                    <div class="feed-card-actions">
                        <a href="${post.thumbnail}" download="${data.username.replace('@','')}_post_${idx+1}_1080p.jpg" class="btn-feed-download-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download 1080p Photo</span>
                        </a>
                    </div>
                `;
                postsContainer.appendChild(card);
            });
        }

        // Populate Reels Panel
        const reelsContainer = document.getElementById('feedReelsContainer');
        if (reelsContainer) {
            reelsContainer.innerHTML = '';
            reelsList.forEach((reel, idx) => {
                const card = document.createElement('div');
                card.className = 'feed-media-card';
                card.innerHTML = `
                    <div class="feed-thumb-wrap">
                        <img src="${reel.thumbnail}" alt="Reel ${idx+1}" class="feed-thumb-img" referrerpolicy="no-referrer">
                        <span class="feed-type-pill">🎬 ${reel.duration}</span>
                    </div>
                    <div class="feed-card-info">
                        <p class="feed-caption">${reel.caption}</p>
                        <div class="feed-metrics">
                            <span>👁️ ${reel.views}</span>
                            <span>❤️ ${reel.likes}</span>
                        </div>
                    </div>
                    <div class="feed-card-actions">
                        <a href="${reel.thumbnail}" download="${data.username.replace('@','')}_reel_${idx+1}_1080p.mp4" class="btn-feed-download-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download 1080p Reel</span>
                        </a>
                    </div>
                `;
                reelsContainer.appendChild(card);
            });
        }

        // Populate Highlights Panel
        const highlightsContainer = document.getElementById('feedHighlightsContainer');
        if (highlightsContainer) {
            highlightsContainer.innerHTML = '';
            highlightsList.forEach((hl) => {
                const item = document.createElement('div');
                item.className = 'highlight-bubble-card';
                item.innerHTML = `
                    <div class="highlight-ring">
                        <img src="${hl.cover}" alt="${hl.title}" class="highlight-cover-img" referrerpolicy="no-referrer">
                    </div>
                    <span class="highlight-title">${hl.title}</span>
                    <span class="highlight-count">${hl.count}</span>
                `;
                highlightsContainer.appendChild(item);
            });
        }

        // Tab Switching Click Logic
        const tabBtns = document.querySelectorAll('.feed-tab-btn');
        const panels = document.querySelectorAll('.feed-panel');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.tab;
                const activePanel = document.getElementById(`feedPanel_${target}`);
                if (activePanel) activePanel.classList.add('active');
            };
        });

        // Auto-switch tab if requested
        if (data.active_tab) {
            const targetBtn = document.querySelector(`.feed-tab-btn[data-tab="${data.active_tab}"]`);
            if (targetBtn) targetBtn.click();
        }
    }

    // 4. Render Hashtags Card
    function renderHashtagCard(data) {
        currentHashtagsData = data;
        selectedHashtags = new Set(data.all_30 || []);
        
        hashtagKeywordTitle.textContent = `30 Viral Hashtags for #${data.query || 'Instagram'}`;

        function buildTagPills(tagsList, container) {
            container.innerHTML = '';
            tagsList.forEach(tag => {
                const pill = document.createElement('span');
                pill.className = 'tag-pill selected';
                pill.textContent = tag;
                pill.title = 'Click to copy individual tag';

                pill.onclick = async () => {
                    if (selectedHashtags.has(tag)) {
                        selectedHashtags.delete(tag);
                        pill.classList.remove('selected');
                    } else {
                        selectedHashtags.add(tag);
                        pill.classList.add('selected');
                    }
                    updateSelectionBar();

                    try {
                        await navigator.clipboard.writeText(tag);
                        pill.classList.add('copied');
                        setTimeout(() => pill.classList.remove('copied'), 1200);
                        showToast(`Copied ${tag}`, 'info');
                    } catch (e) {}
                };

                container.appendChild(pill);
            });
        }

        buildTagPills(data.top || [], topTagsContainer);
        buildTagPills(data.trending || [], trendingTagsContainer);
        buildTagPills(data.niche || [], nicheTagsContainer);

        function updateSelectionBar() {
            const count = selectedHashtags.size;
            selCountNum.textContent = count;
            if (count > 0 && count < 30) {
                copySelectedBtn.style.display = 'inline-block';
                hashtagCountText.textContent = `${count} of 30 tags selected.`;
            } else if (count === 30) {
                copySelectedBtn.style.display = 'none';
                hashtagCountText.textContent = `All 30 tags ready! Click "Copy All" below.`;
            } else {
                copySelectedBtn.style.display = 'none';
                hashtagCountText.textContent = `0 tags selected. Click tags to select.`;
            }
        }

        updateSelectionBar();

        // Copy All (30 Tags)
        copyAllHashtagsBtn.onclick = async () => {
            const textToCopy = (data.all_30 || []).join(' ');
            try {
                await navigator.clipboard.writeText(textToCopy);
                showToast('All 30 hashtags copied to clipboard!', 'success');
            } catch (e) {
                showToast('Could not copy tags', 'error');
            }
        };

        // Copy Top 10
        copyTop10Btn.onclick = async () => {
            const top10 = (data.top || []).slice(0, 10).join(' ');
            try {
                await navigator.clipboard.writeText(top10);
                showToast('Top 10 viral hashtags copied!', 'success');
            } catch (e) {
                showToast('Could not copy tags', 'error');
            }
        };

        // Copy Selected
        copySelectedBtn.onclick = async () => {
            const selText = Array.from(selectedHashtags).join(' ');
            try {
                await navigator.clipboard.writeText(selText);
                showToast(`Copied ${selectedHashtags.size} selected hashtags!`, 'success');
            } catch (e) {
                showToast('Could not copy tags', 'error');
            }
        };

        hashtagCard.style.display = 'block';
        hashtagCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 5. Render Stories Card
    function renderStoryCard(data) {
        activeStories = data.stories || [];
        storyUsernameText.textContent = data.username || '@user';
        storyCountBadge.textContent = `${activeStories.length} Active Stories`;
        storyItemsContainer.innerHTML = '';

        activeStories.forEach((story, idx) => {
            const card = document.createElement('div');
            card.className = 'story-item-card';

            const isVideo = story.type === 'video';
            const mediaTag = isVideo 
                ? `<video src="${story.url}" controls class="story-preview-video" preload="metadata"></video>`
                : `<img src="${story.preview_proxy || story.url}" alt="Story ${idx+1}" class="story-preview-img" referrerpolicy="no-referrer">`;

            const fileName = `toolsera_${data.username.replace('@','')}_story_${idx+1}.${isVideo ? 'mp4' : 'jpg'}`;

            card.innerHTML = `
                <div class="story-media-preview" title="Click to open in viewer">
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

            // Click preview to open lightbox
            const previewEl = card.querySelector('.story-media-preview');
            previewEl.onclick = (e) => {
                if (e.target.tagName !== 'VIDEO') {
                    openStoryLightbox(idx, data.username);
                }
            };

            // Attach blob download click
            const dlBtn = card.querySelector('.btn-story-download');
            dlBtn.onclick = (e) => {
                e.preventDefault();
                downloadDirectBlob(story.download_url, story.url, fileName, dlBtn);
            };

            storyItemsContainer.appendChild(card);
        });

        if (playStoryModalBtn) {
            playStoryModalBtn.onclick = () => {
                if (activeStories.length > 0) {
                    openStoryLightbox(0, data.username);
                }
            };
        }

        storyCard.style.display = 'block';
        storyCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 6. Interactive Story Lightbox
    function openStoryLightbox(index, username) {
        if (!activeStories || activeStories.length === 0) return;
        currentStoryIdx = index;
        const total = activeStories.length;

        storyModalUser.textContent = username || '@instagram_user';
        storyModalIndex.textContent = `${currentStoryIdx + 1} / ${total} • 🛡️ Anonymous`;

        // Build top progress bars
        storyProgressBars.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const seg = document.createElement('div');
            seg.className = 'story-progress-segment';
            const fill = document.createElement('div');
            fill.className = 'story-progress-fill';
            if (i < currentStoryIdx) fill.classList.add('completed');
            if (i === currentStoryIdx) fill.style.width = '100%';
            seg.appendChild(fill);
            storyProgressBars.appendChild(seg);
        }

        loadCurrentStoryMedia();

        storyModal.style.display = 'flex';
        storyModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function loadCurrentStoryMedia() {
        const story = activeStories[currentStoryIdx];
        if (!story) return;

        const isVideo = story.type === 'video';
        storyModalIndex.textContent = `${currentStoryIdx + 1} / ${activeStories.length} • 🛡️ Anonymous`;

        // Update progress bar
        const fills = storyProgressBars.querySelectorAll('.story-progress-fill');
        fills.forEach((f, i) => {
            if (i < currentStoryIdx) {
                f.className = 'story-progress-fill completed';
                f.style.width = '100%';
            } else if (i === currentStoryIdx) {
                f.className = 'story-progress-fill';
                f.style.width = '100%';
            } else {
                f.className = 'story-progress-fill';
                f.style.width = '0%';
            }
        });

        if (isVideo) {
            storyModalImg.style.display = 'none';
            storyModalVid.style.display = 'block';
            storyModalVid.src = story.url;
            storyModalVid.muted = false;
            storyModalMuteBtn.style.display = 'inline-flex';
            storyModalVid.play().catch(() => {
                storyModalVid.muted = true;
                storySoundOnIcon.style.display = 'none';
                storySoundOffIcon.style.display = 'block';
                storyModalVid.play();
            });
        } else {
            storyModalVid.pause();
            storyModalVid.style.display = 'none';
            storyModalMuteBtn.style.display = 'none';
            storyModalImg.style.display = 'block';
            storyModalImg.src = story.url;
        }

        // Setup download button
        const fileName = `toolsera_story_${currentStoryIdx + 1}.${isVideo ? 'mp4' : 'jpg'}`;
        storyModalDownloadBtn.href = story.download_url;
        storyModalDownloadBtn.onclick = (e) => {
            e.preventDefault();
            downloadDirectBlob(story.download_url, story.url, fileName, storyModalDownloadBtn);
        };
    }

    function closeStoryLightbox() {
        if (!storyModal) return;
        storyModal.style.display = 'none';
        storyModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (storyModalVid) {
            storyModalVid.pause();
            storyModalVid.src = '';
        }
    }

    if (storyModalCloseBtn) storyModalCloseBtn.addEventListener('click', closeStoryLightbox);

    if (storyPrevBtn) {
        storyPrevBtn.addEventListener('click', () => {
            if (currentStoryIdx > 0) {
                currentStoryIdx--;
                loadCurrentStoryMedia();
            }
        });
    }

    if (storyNextBtn) {
        storyNextBtn.addEventListener('click', () => {
            if (currentStoryIdx < activeStories.length - 1) {
                currentStoryIdx++;
                loadCurrentStoryMedia();
            } else {
                closeStoryLightbox();
            }
        });
    }

    if (storyModalMuteBtn) {
        storyModalMuteBtn.addEventListener('click', () => {
            if (!storyModalVid) return;
            storyModalVid.muted = !storyModalVid.muted;
            storySoundOnIcon.style.display = storyModalVid.muted ? 'none' : 'block';
            storySoundOffIcon.style.display = storyModalVid.muted ? 'block' : 'none';
        });
    }

    // Keyboard navigation in lightbox
    document.addEventListener('keydown', (e) => {
        if (storyModal && storyModal.style.display === 'flex') {
            if (e.key === 'Escape') closeStoryLightbox();
            if (e.key === 'ArrowLeft' && storyPrevBtn) storyPrevBtn.click();
            if (e.key === 'ArrowRight' && storyNextBtn) storyNextBtn.click();
        }
    });

    // 7. Render Private Account Alert
    function renderPrivateAlert(data) {
        if (alertMessage) {
            alertMessage.innerHTML = `
                This account <strong>(${data.username})</strong> is private. Instagram protects their 24h stories and requires an accepted follow request. However, you can still view and download their <strong>Full HD Profile Picture (DP)</strong>!
            `;
        }

        if (alertViewDpBtn) {
            alertViewDpBtn.querySelector('span').textContent = `View ${data.username}'s Full HD DP`;
            alertViewDpBtn.onclick = () => {
                urlInput.value = data.username.replace('@','');
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
    } // End of if (urlInput && submitBtn)

    // FAQ Accordion Interactivity
    document.querySelectorAll('.faq-item .faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            const parent = item.parentElement;
            if (parent) {
                parent.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            }
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Video Reviews Carousel Navigation
    const reviewsTrack = document.getElementById('reviewsCarouselTrack');
    const reviewsNextBtn = document.getElementById('reviewsNextBtn');
    const reviewsPrevBtn = document.getElementById('reviewsPrevBtn');
    if (reviewsNextBtn && reviewsTrack) {
        reviewsNextBtn.addEventListener('click', () => {
            reviewsTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }
    if (reviewsPrevBtn && reviewsTrack) {
        reviewsPrevBtn.addEventListener('click', () => {
            reviewsTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });
    }

    // Video Review Cards Click Interactivity
    document.querySelectorAll('.review-video-card').forEach(card => {
        card.addEventListener('click', () => {
            const quote = card.dataset.quote || 'Toolsera allows me to research creators and watch stories with 100% privacy!';
            const author = card.dataset.author || 'Verified Creator';
            showToast(`"${quote}" — ${author}`, 'info');
        });
    });

    // Pricing Features Table Interactive Toggles
    document.querySelectorAll('.pricing-feat-row').forEach(row => {
        row.addEventListener('click', () => {
            row.classList.toggle('expanded');
        });
    });

    // User Feedback & Issue Reporting Form Handler
    const feedbackForm = document.getElementById('feedbackForm');
    const ratingPills = document.querySelectorAll('.rating-pill');
    let selectedFeedbackRating = 5;

    if (ratingPills.length > 0) {
        ratingPills.forEach(pill => {
            pill.addEventListener('click', () => {
                ratingPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedFeedbackRating = parseInt(pill.dataset.rating || '5', 10);
            });
        });
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('feedbackName');
            const emailInput = document.getElementById('feedbackEmail');
            const categoryInput = document.getElementById('feedbackCategory');
            const messageInput = document.getElementById('feedbackMessage');
            const submitBtnEl = document.getElementById('feedbackSubmitBtn');

            const message = messageInput ? messageInput.value.trim() : '';
            if (!message) {
                showToast('Please type your feedback or issue description.', 'error');
                if (messageInput) messageInput.focus();
                return;
            }

            const payload = {
                name: nameInput ? nameInput.value.trim() : '',
                email: emailInput ? emailInput.value.trim() : '',
                category: categoryInput ? categoryInput.value : 'general',
                rating: selectedFeedbackRating,
                message: message
            };

            const origContent = submitBtnEl ? submitBtnEl.innerHTML : '';
            if (submitBtnEl) {
                submitBtnEl.disabled = true;
                submitBtnEl.innerHTML = `
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                    </svg>
                    <span>Sending to Adeel...</span>
                `;
            }

            try {
                let res = await fetch('/api/feedback.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    res = await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                const data = await res.json();
                if (data && data.success) {
                    showToast(data.message || 'Thank you! Your feedback has been sent directly to Adeel Ahmad.', 'success');
                    feedbackForm.reset();
                    ratingPills.forEach(p => p.classList.remove('active'));
                    const pill5 = document.querySelector('.rating-pill[data-rating="5"]');
                    if (pill5) pill5.classList.add('active');
                    selectedFeedbackRating = 5;
                } else {
                    showToast((data && data.message) || 'Submission received! Thank you for helping us improve.', 'success');
                }
            } catch (err) {
                showToast('Thank you! Your feedback has been recorded for developer Adeel Ahmad.', 'success');
                feedbackForm.reset();
            } finally {
                if (submitBtnEl) {
                    submitBtnEl.disabled = false;
                    submitBtnEl.innerHTML = origContent;
                }
            }
        });
    }

    // Reset Triggers
    document.querySelectorAll('.btn-reset, .reset-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof hideAllCards === 'function') hideAllCards();
            if (urlInput) {
                urlInput.value = '';
                urlInput.focus();
            }
            if (clearBtn) clearBtn.style.display = 'none';
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
