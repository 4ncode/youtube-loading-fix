(function() {
    'use strict';

    const CONFIG = {
        SPINNER_TIMEOUT: 8000,
        CHECK_INTERVAL: 1000,
        MAX_RETRIES: 3,
        DEBUG: false
    };

    let retryCount = 0;
    let lastTime = 0;
    let stuckTimer = null;
    let isFixing = false

    function log(...args) {
        if (CONFIG.DEBUG) console.log('[YT-Loading-Fix]', ...args);
    }

    function getVideoPlayer() {
        return document.querySelector('video.html5-main-video') ||
               document.querySelector('video');
    }

    function getSpinner() {
        return document.querySelector('.ytp-spinner') ||
               document.querySelector('.ytp-load-progress') ||
               document.querySelector('tp-yt-paper-spiner') ||
               document.querySelector('[class*="spinner]');
    }

    function getYTPlayer() {
        return document.querySelector('#movie_player');
    }

    function isStruckLoading() {
        const video = getVideoPlayer();
        const spinner = getSpinner();

        if (!Video || !spinner) return false;

        const spinnerVisible = spinner.style.display !=='none' && window.getComputedStyle(spinner).opacity !== '0';
        const currentTime = video.currentTime;
        const isPaused = video.paused;
        const isBuffering = video.readyState < 3;

        log('Check:', {currentTime, lastTime, isPaused, isBuffering, spinnerVisible });

        if (currentTime === lastTime && !isPaused && (isBuffering || spinnerVisible)) {
            return true;
        }

        lastTime = currentTime;
        return false;
    }

    function fixPlayerReset() {
        log('Attempting player reset...');
        const video = getVideoPlayer();
        if (!video) return false;

        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;
        const src = video.src;

        video.src = '';
        video.load();

        setTimeout(() => {
            video.src = src;
            video.load();
            video.currentTime = currentTime;
            if (wasPlaying) video.play().catch (e => log('Play error:', e));
        }, 500);

        return true;
    }

    function fixQualityChange() {
        log('Attempting quality change...');
        const player = getYTPlayer();
        if (player && typeof player.getAvailableQualityLevels === 'function') {
            const levels = player.getAvailableQualityLevels();
            const currentQuality = player.getPlaybackQuality();

            if (levels.length > 1) {
                const newQuality = levels.find(q => q !== currentQuality) || levels[0];
                player.setPlaybackQualityRange(newQuality, newQuality);

                setTimeout(() => {
                    player.setPlaybackQualityRange(currentQuality, currentQuality);
                }, 2000);

                return true;
            }
        }
    }
})