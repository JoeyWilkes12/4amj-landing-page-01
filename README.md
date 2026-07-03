# Whiteley Reunion 2026 Links

A small, static link hub for the Whiteley Reunion 2026. It gives family members quick access to William Henry Adams family history, food planning, and other shared reunion links.

The site is designed for GitHub Pages, but it is just plain HTML and CSS. There is no framework, no package manager, no build step, no analytics, and no external dependencies.

## File structure

Published site files:

```text
/
index.html
styles.css
README.md
.nojekyll
```

Regression test files:

```text
/.gitignore
/tests/playwright.config.mjs
/tests/regression.spec.mjs
/tests/run-regression.sh
```

## Edit the three links

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
- Reunion Food: `https://drive.google.com/drive/folders/1X6xjdzl1-UoIe6IiTYsXtW1w0s-_mGxA?usp=drive_link`
- Misc: `./misc/`

Relative links are used for local reunion pages so the site works as either a GitHub Pages user site or a project site. External links can use full URLs.

## Edit the page text

Open `index.html` to change the main wording:

- Title: `Whiteley Reunion 2026 Links`
- Subtitle: `Quick access to genealogy, food planning, and shared reunion resources.`

Open `styles.css` to change colors, spacing, border radius, shadows, width, or transitions. These values are grouped at the top of the file as CSS custom properties.

The theme toggle is CSS-only and defaults to the light theme. The display text uses a local Trajan/Cinzel-inspired serif stack to echo the poster lettering without loading external fonts.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

You can also open `index.html` directly in a browser because the site has no build step.

If you want an isolated Python environment for local tooling, create one locally and do not commit it:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m http.server 8000
```

## Run regression tests

Run the local mobile, tablet, and desktop regression suite with one command:

```bash
bash tests/run-regression.sh
```

That default command runs the first test layer against a local Python static server. Run individual layers as needed:

```bash
bash tests/run-regression.sh local
bash tests/run-regression.sh live
bash tests/run-regression.sh all
```

The live layer targets the GitHub Pages deployment:

```text
https://joeywilkes12.github.io/4amj-landing-page-01/
```

Override it when needed:

```bash
LIVE_BASE_URL="https://example.com/project/" bash tests/run-regression.sh live
```

The suite installs pinned Playwright Test into ignored `.test-results/runner` tooling, starts a local Python static server for the local layer, and checks multiple viewport sizes:

- 320 px mobile
- 390 px mobile
- 768 px tablet
- 1024 px tablet landscape
- 1366 px desktop
- 1440 px wide desktop

The tests verify deployment availability, stylesheet loading, content, link targets, keyboard focus order, visible focus styles, tap target sizes, no horizontal overflow, light and dark themes, contrast, reduced motion handling, and that the page does not make unexpected external runtime requests.

Generated reports, browser artifacts, and temporary test dependencies are written under `.test-results/` and are ignored by Git. No `package.json`, lockfile, or runtime dependency is required for the site.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Add the repository files to the repository root.
3. Commit and push the files.
4. Open the repository Settings.
5. Go to Pages.
6. Publish from the `main` branch and the root folder.

After GitHub Pages is enabled, replace the commented canonical URL placeholder in `index.html` with the final Pages URL if you want a canonical link.

## Hosting fallback options

If GitHub Pages does not meet your uptime or performance needs, the same four files can be hosted almost anywhere that serves static files.

Good alternatives include:

- Cloudflare Pages
- Netlify
- Vercel static hosting
- Amazon S3 or Cloudflare R2 behind a CDN
- Any basic web server such as Nginx or Apache

No build command is required. Use the repository root as the publish directory.

## Optional custom domain

You can add a custom domain later through your hosting provider. For GitHub Pages, add the domain in the repository Pages settings, then update your DNS records as GitHub instructs. If you add a domain, update the future canonical URL in `index.html` to match it.
