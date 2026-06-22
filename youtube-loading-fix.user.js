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
        const isBuffering = video.readyState;
    }
})