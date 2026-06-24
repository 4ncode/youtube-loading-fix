// ==UserScript==
// @name         YouTube Infinite Loading Fix
// @namespace    https://github.com/4ncode/youtube-loading-fix
// @version      1.0.0
// @description  Fixes the issue of YouTube loading indefinitely and the timer resetting
// @author       4ncode
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// @supportURL   https://github.com/4ncode/youtube-loading-fix/issues
// @homepageURL  https://github.com/4ncode/youtube-loading-fix
// ==/UserScript==

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

            function attemptFix() {
                if (isFixing || retryCount >= CONFIG.MAX_RETRIES) {
                    log('Fix skipped:', {isFixing, retryCount});
                    return;
                }

                isFixing = true;
                retryCount++;
                log(`Fix attempt ${retryCount}/${CONFIG.MAX_RETRIES}`);

                const fixes = [fixQualityChange, fixPlayerReset, fixStreamRefresh];
                let fixed = false;

                for (const fix of fixes) {
                    try {
                        if (fix()) {fixed = true; break;}
                    } catch (e) {log ('fix error:', e);}
                }

                showNotification (fixed ? 'The loading issue has been fixed!' :
                    'We were unable to fix the problem. Please refresh the page (F5)'
                );

                setTimeout(() => {
                    isFixing = false;
                    if (!isStruckLoading()) retryCount = 0;
                }, 15000);
            }
        }

        function showNotification(message) {
            const existing = document.getElementById('yt-loading-fix-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.id - 'yt-loading-fix-toast';
            toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff0000;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Roboto, Arial, sans-serif;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            `;
            toast.textContent = message;

            const style = document.createElement('style');
            style.textContent = `
            @keyframes slideIn {
            from {transform: translateX(100%); opacity: 0;}
            to {transform: translateX(0); opacity: 1;}
            }
        
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
        }

        function startMonitoring() {
            log('Monitoring started');

            if (!location.pathname.startsWith('/watch')) {
                log('Not a video page');
                return;
            }

            let lastUrl = location.href;
            new MutationObserver(() => {
                if (location.href !== lastUrl) {
                    lastUrl = location.href;
                    retryCount = 0;
                    lastTime = 0;
                    isFixing = false;
                    log('Navigation detected, reset');
                }
            }).observe(document, {subtree: true, childList: true });

            setInterval(() => {
                if (isStruckLoading()) {
                    if (!stuckTimer) {
                        stuckTimer = setTimeout(() => {
                            attemptFix();
                            stuckTimer = null;
                        }, CONFIG.SPINNER_TIMEOUT);
                    }
                } else {
                    if (stuckTimer) {
                        clearTimeout(stuckTimer);
                        stuckTimer = null;
                        log('Stuck cleared');
                    }
                    if (retryCount > 0 && !isFixing) retryCount = 0;
                }
            }, CONFIG.CHECK_INTERVAL);
        }

        function addManualFixButton() {
            const observer = new MutationObserver(() => {
                const rightControls = document.querySelector('.ytp-right-controls');
                if (rightControls && !document.getElementById('yt-fix-button')) {
                    const btn = document.createElement('button');
                    btn.id = 'yt-fix-button';
                    btn.innerHTML = '👽';
                    btn.title = 'Fix the loading issue';
                    btn.style.cssText = `
                    background: rgba(255,0,0,0.8);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    margin-left: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                `}
                btn.onclick = () => {retryCount = 0; attemptFix();};
                
                if (rightControls.firstChild) {
                    rightControls.insertBefore(btn, rightControls.firstChild);
                } else {
                    rightControls.appendChild(btn);
                }
            });
            observer.observe(document.body, {childList: true, subtree: true});
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                startMonitoring();
                addManualFixButton();
            });
        } else {
            startMonitoring();
            addManualFixButton();
        }
    }
})();