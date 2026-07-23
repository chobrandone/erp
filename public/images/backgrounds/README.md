# ERP background images (bi-weekly rotation)

The app shows a subtle background image behind the content and **changes it every
two weeks**, like a desktop wallpaper slideshow. It cycles through every image
here (fortnight 1 → image 1, fortnight 2 → image 2, … then loops).

## Adding your own images (no code needed)

Drop image files here (`.jpg`, `.jpeg`, `.png`, `.webp`, or `.svg`) and they are
picked up automatically on the next build/deploy.

- File order = alphabetical by filename. Name them `bg-01`, `bg-02`, … to control
  the rotation order.
- They render dimmed behind the app, so calm, wide shots work best (port, yard,
  containers, skyline, cranes). Busy photos are fine — they're faded.
- Any number of images works; with 26 you'd get a distinct one for every
  fortnight of the year.

No code change is needed — just add the files and redeploy (`git push`).

## Online theme (auto-refresh from Unsplash)

Recommended source: **Unsplash** — the best free library of high-resolution,
hotlink-friendly maritime / port / logistics photography, with a simple API.

`scripts/fetch-online-backgrounds.mjs` pulls fresh image links (queries like
"container ship port", "cargo terminal", "shipping logistics") and writes them to
`src/lib/backgrounds.online.generated.ts`, which the app merges with these bundled
images in the same 2-week rotation.

To enable it:

1. Get a free **Access Key** at https://unsplash.com/developers.
2. Run `UNSPLASH_ACCESS_KEY=xxxxx npm run fetch-backgrounds`.
3. Commit the regenerated file and redeploy.

To auto-refresh "after some weeks", run that on a schedule (e.g. a GitHub Action
every 2 weeks) that commits the file and triggers a redeploy. Without the key the
script is a no-op and only these bundled images are used.
