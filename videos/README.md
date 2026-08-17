# Hero video

The desktop hero looks for `videos/hero.mp4`. That file isn't in the repo, so
nothing loads and the hero stays on the van-1 photo (`images/van.jpg`) — which
is the intended hero visual. Adding a video here is optional.

**If you do want a video:**

1. Use your own footage — a clip of the AJC vans loading beats stock.
2. Compress it — target **under 2 MB**, no audio track, around 6–10 seconds:
   ```
   ffmpeg -i input.mp4 -t 8 -an -vf "scale=1280:-2" \
          -c:v libx264 -crf 30 -preset slow -movflags +faststart hero.mp4
   ```
3. Save it here as `videos/hero.mp4`.

Notes:

- The video is **desktop only**. Phones, `prefers-reduced-motion` users and
  anyone on 2G or data-saver get the van photo instead and download no video
  at all. That's deliberate — see `js/main.js`.
- `-movflags +faststart` matters: without it the browser must download the
  whole file before the first frame appears.
- There is no remote fallback. The old Pexels one was removed because it
  covered the real branded van with a generic stock clip on desktop.
