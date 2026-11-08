# Archive images

Images for `/work/marketing-design`, `/work/dashboards` and `/work/presentations`.
Until a file is here, the page hides the item that uses it.

## Adding them

1. Copy each file below into the folder shown, keeping the name. The archive's
   `.jpg` files are partly GIFs and PNGs inside; that's fine.
2. Run `npm run images:archive`. It converts everything to WebP (max 1600px wide),
   moves the originals to `assets/originals/` (git-ignored) and lists anything still missing.
3. Commit the `.webp` files.

## Files

**`graphics/`**, from the archive's `images/art/` (full size, not `thumbnails/`):

    odai2  logoumb1  logoumb2  logoumb3  logobs1  logobs2  ie-logo  n-logo
    microservices  twitter  stackoverflow  baner1  baner2  chessboard1  helpus  infographic  furn
    g1 g2 g3 g4 g5 g6 g7 g9 g11 g13 g17 g21 g22 g23 g24
    g27 g29 g30 g31 g33 g34 g35

Left out on purpose: g18 ("Necked Women"), 2–5 and g25, g28 (photography), a8.gif (animated), and the weaker personal pieces: portrait studies g8, g10, g12, g14–g16, g19, “Flower in the Desert” g20, the g26 banner, the g32 logotype and the g36 business cards.

**`dashboards/`**, from the archive's `images/` (the large versions):

    kpi1  bascket1  segment1  demographics1  h9  d1  d2  d3

**`presentations/`**: a cover per deck (the title slide, saved as PNG or JPG) and, optionally, a PDF:

    javascript-learning-platform   hci-project   retail-kpi-dashboard

The **Download PDF** button appears once `<name>.pdf` is in this folder.
