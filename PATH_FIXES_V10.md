# SIRAJ v10 path fixes

- Replaced relative asset paths starting with `./assets/` with root-relative `/assets/`.
- This prevents validators/crawlers from requesting URLs like `/./assets/css/style.css`.
- CSS/JS/image files remain in the same `assets/` folder.

Upload the contents of this ZIP to Netlify from the project root, not from a parent folder.
