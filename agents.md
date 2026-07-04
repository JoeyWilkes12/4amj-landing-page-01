# Agent Notes

- Do not commit directly to remote `main`; create a branch and open a pull request.
- Deployment destination: GitHub Pages at `https://joeywilkes12.github.io/4amj-landing-page-01/`.
- GitHub Pages should publish the repository root from the `main` branch.
- Keep the site lightweight enough for 100+ near-simultaneous visitors on static hosting.
- Preserve the no-build static contract: plain HTML/CSS, no JavaScript runtime, no analytics, no external fonts, no CDN dependencies, and no package manager files.
- Optimize visual assets before committing them. Prefer responsive WebP files under `assets/`; avoid committing original multi-megabyte source images.
- When changing visible content, links, colors, or image assets, update the Playwright regression expectations in `tests/regression.spec.mjs`.
