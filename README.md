# Whiteley Reunion 2026 Links

A small, static link hub for the Whiteley Reunion 2026. It gives family members quick access to William Henry Adams family history, food planning, and other shared reunion links.

This repository is designed for GitHub Pages, but the site is plain HTML and CSS. There is no framework, package manager, build step, analytics, or external runtime dependency. The page is intentionally lightweight so GitHub Pages can serve the site to 100+ near-simultaneous visitors.

## Repository layout

Published site files:

```text
/
index.html
styles.css
agents.md
README.md
.nojekyll
assets/
```

Regression test files:

```text
/.gitignore
/tests/playwright.config.mjs
/tests/regression.spec.mjs
/tests/run-regression.sh
```

Generated test output is written under `.test-results/`, which is ignored by Git.

## Developer prerequisites

To preview the site, you only need Python 3 or any static file server.

To run the regression suite, install these tools locally:

- `node`
- `npm`
- `python3`

The repo intentionally does not include `package.json`, `package-lock.json`, or committed `node_modules`. The regression script installs a pinned Playwright Test runner into `.test-results/runner` and creates a temporary `node_modules` symlink while tests run.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

You can also open `index.html` directly in a browser because the page uses only relative local assets and no build output.

If you prefer an isolated Python environment for local tooling, create one locally and do not commit it:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m http.server 8000
```

## Run tests

Run the default local regression layer:

```bash
bash tests/run-regression.sh
```

That command:

- installs `@playwright/test@1.61.1` into `.test-results/runner` if needed
- installs the Chromium browser used by Playwright
- starts a local Python static server on `127.0.0.1:4173`
- runs the Playwright suite across mobile, tablet, and desktop viewport projects
- writes HTML reports, traces, screenshots, and videos under `.test-results/`

Run a specific test layer:

```bash
bash tests/run-regression.sh local
bash tests/run-regression.sh live
bash tests/run-regression.sh all
```

The `live` layer targets the GitHub Pages deployment:

```text
https://joeywilkes12.github.io/4amj-landing-page-01/
```

Override it when testing a fork, preview URL, or alternate host:

```bash
LIVE_BASE_URL="https://example.com/project/" bash tests/run-regression.sh live
```

Pass extra Playwright arguments after the layer name:

```bash
bash tests/run-regression.sh local --project mobile-390
bash tests/run-regression.sh local --grep "contrast"
bash tests/run-regression.sh local --debug
```

Useful environment variables:

```text
REGRESSION_PORT                  Override the local server port. Default: 4173.
LIVE_BASE_URL                    Override the live deployment URL.
PLAYWRIGHT_TEST_VERSION          Override the pinned Playwright Test version. Default: 1.61.1.
PLAYWRIGHT_INSTALL_BROWSERS=skip Skip Playwright's Chromium install step.
PLAYWRIGHT_HTML_OPEN             Controls the Playwright HTML report auto-open behavior. Default: never.
CI=1                             Enables one retry through Playwright config.
```

If a test fails, inspect:

```text
.test-results/playwright-report/
.test-results/artifacts/
```

The HTML report is generated with `open: "never"`, so it will not automatically launch a browser.

## What the tests cover

The regression suite lives in `tests/regression.spec.mjs` and is configured by `tests/playwright.config.mjs`.

Viewport projects:

- 320 px mobile
- 390 px mobile
- 768 px tablet
- 1024 px tablet landscape
- 1366 px desktop
- 1440 px wide desktop

The suite checks:

- static source contract for GitHub Pages readiness
- absence of package manager and runtime dependencies
- landing page and stylesheet availability
- optimized local poster image availability and size budget
- expected title, copy, link labels, descriptions, and destinations
- no horizontal overflow at supported viewport widths
- poster, header, and links remain separated without overlap
- keyboard tab order and visible focus outlines
- minimum tap target sizing for link cards
- navy theme token and readable contrast
- reduced motion behavior
- no unexpected external runtime requests
- no browser console errors or page errors

The tests intentionally duplicate important content, URLs, color tokens, and image asset names. When you change visible copy, link destinations, color tokens, poster assets, or core behavior, update `index.html`, `styles.css`, and the matching expectations in `tests/regression.spec.mjs` together.

## Editing content

Open `index.html` and find the `<nav class="link-list">` section.

Each link card looks like this:

```html
<a class="link-card" href="https://history.churchofjesuschrist.org/chd/individual/william-henry-adams-sr-1817?lang=eng">
```

Change the `href` value to the real destination when it is ready. Good replacement links include:

- Notion pages
- Google Forms
- Google Drive folders
- GitHub Pages subpages
- Shared documents

The current links are:

- William Henry Adams: `https://history.churchofjesuschrist.org/chd/individual/william-henry-adams-sr-1817?lang=eng`
- Reunion Schedule & Food: `https://joeywilkes12.github.io/digital-schedule-website/`
- Miscellaneous: `https://drive.google.com/drive/folders/1X6xjdzl1-UoIe6IiTYsXtW1w0s-_mGxA?usp=drive_link`

Relative links are used for local reunion pages so the site works as either a GitHub Pages user site or a project site. External links can use full URLs.

## Editing presentation

Open `index.html` to change the main wording:

- Title: `Whiteley Reunion 2026 Links`
- Subtitle: `Quick access to genealogy, food planning, and shared reunion resources.`

Open `styles.css` to change colors, spacing, border radius, shadows, width, or transitions. These values are grouped at the top of the file as CSS custom properties.

The page uses a navy-only theme matched to the poster background. The display text uses a local Trajan/Cinzel-inspired serif stack to echo the poster lettering without loading external fonts.

## Editing images

Poster assets live in `assets/` as responsive WebP files. Keep committed image files lightweight, prefer multiple responsive sizes through `srcset`, and avoid committing original multi-megabyte source files.

The current poster derivatives are:

- `assets/whiteley-reunion-poster-720.webp`
- `assets/whiteley-reunion-poster-1080.webp`
- `assets/whiteley-reunion-poster-1440.webp`

Keep each displayed derivative under 150 KB unless there is a clear deployment reason to change the budget.

## Deployment

Publish the repository root through GitHub Pages:

1. Commit changes on a feature branch.
2. Open a pull request.
3. Merge to `main` after review.
4. Open the repository Settings.
5. Go to Pages.
6. Publish from the `main` branch and the root folder.

The production GitHub Pages URL is:

```text
https://joeywilkes12.github.io/4amj-landing-page-01/
```

## Hosting fallback options

If GitHub Pages does not meet uptime or performance needs, the same files can be hosted almost anywhere that serves static files.

Good alternatives include:

- Cloudflare Pages
- Netlify
- Vercel static hosting
- Amazon S3 or Cloudflare R2 behind a CDN
- Any basic web server such as Nginx or Apache

No build command is required. Use the repository root as the publish directory.

## Optional custom domain

You can add a custom domain later through your hosting provider. For GitHub Pages, add the domain in the repository Pages settings, then update DNS records as GitHub instructs. If you add a domain, update the future canonical URL in `index.html` to match it.
