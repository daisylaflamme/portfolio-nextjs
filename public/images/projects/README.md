# Project images

- **thumbnails/** – card preview images (e.g. 250×150 or similar)
- **Root** – full-size images used in the “View Details” modal

Add new images here when you add projects in `src/data/projects.ts`.

Images here are WebP, at most 1600px wide (the case-study modal shows about 976px; the
lightbox shows the file as-is). Export new screenshots at 2×, drop the PNG/JPG here,
reference it in `src/data/projects.ts`, then run:

    npm run images:projects

That converts it to WebP, updates the path in `projects.ts`, and moves the original out. The full-size PNG/JPG originals go to `assets/originals/images/projects/`, outside
`public/` and git-ignored: they stay on your machine but are never committed or shipped.
Back that folder up separately if you want to keep the originals.
