# 🔴 YouTube Infinite Loading Fix

A Tampermonkey userscript that fixes the issue of videos loading indefinitely on YouTube, 
including the "resetting timer" and the spinner getting stuck.

## Problem

YouTube sometimes freezes while loading a video:
- The loading spinner spins indefinitely
- The timer/video duration resets or doesn’t update
- The video doesn’t start despite a good internet connection

## Solution

The script automatically:
1. Detects when the player is frozen (>8 seconds of the spinner with no progress)
2. Restarts the HTML5 player without reloading the page
3. Resets the network cache by changing the video quality
4. Restores the playback position
5. Adds a manual repair button to the YouTube interface

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension (Chrome/Firefox/Edge)
2. Click [here to install the script](https://raw.githubusercontent.com/4ncode/youtube-loading-fix/main/youtube-loading-fix.user.js)
3. Done! The script works automatically on youtube.com

## Debugging

If the problem persists:
1. Open the console (F12 → Console)
2. In the script, change `DEBUG: false` to `DEBUG: true`
3. Check the logs prefixed with `[YT-Loading-Fix]`
4. Report an issue on GitHub with the logs

## Collaboration

We welcome PRs! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - free to use, modify, and distribute.