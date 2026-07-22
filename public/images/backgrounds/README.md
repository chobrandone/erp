# ERP background images (monthly rotation)

Drop image files here (`.jpg`, `.jpeg`, `.png`, `.webp`, or `.svg`) and they are
picked up automatically on the next build/deploy. The app shows a different one
each month and cycles through them (month 1 → image 1, month 2 → image 2, … then
loops back to the start).

- Any number of images works. With 12 images you get a distinct one every month
  of the year; with fewer, they simply repeat in order.
- They render subtly behind the app content, so use calm images (port, yard,
  containers, skyline). High-detail busy photos are fine — they're dimmed.
- File order = alphabetical by filename. Name them `bg-01`, `bg-02`, … to control
  the order.

No code change is needed — just add the files and redeploy (`git push`).
The three `bg-0x.svg` here are defaults; replace them with the client's photos.
