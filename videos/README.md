# Hero video

The desktop hero looks for `videos/hero.mp4`. That file isn't in the repo yet,
so until you add it the site falls back to streaming the clip from Pexels.

**To finish the job:**

1. Download the clip: https://www.pexels.com/video/5044420/
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
- Once `hero.mp4` exists you can delete the `data-fallback` attribute on the
  `<video>` in `index.html` to drop the Pexels dependency entirely.
