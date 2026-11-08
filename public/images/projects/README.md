# Project images

- **thumbnails/** – card preview images (e.g. 250×150 or similar)
- **Root** – full-size images used in the “View Details” modal

Add new images here when you add projects in `src/data/projects.js`.

Images here are WebP, at most 1600px wide (the case-study modal shows about 976px; the
lightbox shows the file as-is). Export new screenshots at 2×, drop the PNG/JPG here,
reference it in `src/data/projects.js`, then run:

    npm run images:projects

That converts it to WebP, updates the path in `projects.js`, and moves the original out. The full-size PNG/JPG originals live in `assets/originals/images/projects/`, outside
`public/`, so they are kept in the repo but never shipped with the site.
