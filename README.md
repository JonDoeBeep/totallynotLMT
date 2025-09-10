# totallynotLMT (React + Vite)

This is a React rewrite of the original static site, preserving the 90s vibes and effects.

What's included:
- Vite + React app structure
- Ported HTML/CSS as React components and global styles
- Visitor counter using Appwrite (same public endpoint; falls back gracefully)
- Konami code, sparkles, title shenanigans, right-click blocker, guestbook with localStorage
- GitHub Pages deployment via gh-pages, with base path configured and CNAME preserved

Scripts:
- dev: start local dev server
- build: production build to dist/
- preview: preview the build locally
- deploy: build and publish dist/ to gh-pages

Notes:
- The Appwrite SDK is loaded via a CDN script tag in index.html. If you have environment-specific keys, swap to an npm SDK and env vars.