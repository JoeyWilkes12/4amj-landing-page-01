import { expect, test } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testRoot = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(testRoot, "..");
const mobileReviewDir = resolve(siteRoot, "output/playwright/mobile-review");

const expectedTitle = "Whiteley Reunion 2026 Links";
const expectedPosterAlt =
  "Whiteley reunion poster with a family tree, William Henry Adams name, and ancestor portrait on a navy background.";
const expectedPosterAssets = [
  { path: "./assets/whiteley-reunion-poster-720.webp", width: 720, height: 480 },
  { path: "./assets/whiteley-reunion-poster-1080.webp", width: 1080, height: 720 },
  { path: "./assets/whiteley-reunion-poster-1440.webp", width: 1440, height: 960 },
];
const cherieVenmoQrAsset = {
  path: "./assets/Cherie Journee QR Venmo.jpeg",
  src: "./assets/Cherie%20Journee%20QR%20Venmo.jpeg",
};
const forbiddenGenealogyPdfAssets = [
  "./assets/genealogy/William Henry Adams Life History.pdf",
  "./assets/genealogy/Life History of Frances Otten Adams.pdf",
];
const venmoGroupUrl =
  "https://link.venmo.com/groups/link/2838e16e-4031-4ccd-ac34-4581d1673ffd";
const venmoDeepLinkUrl = "venmo://groups/link/2838e16e-4031-4ccd-ac34-4581d1673ffd";
const venmoSmsUrl =
  "sms:?&body=Hi%20Cherie%2C%20can%20you%20text%20me%20the%20Venmo%20group%20link%3F";
const expectedLinks = [
  {
    title: "Genealogy",
    description: "Life histories and Church History biographical records.",
    href: "./genealogy.html",
    icon: "./assets/link-icons/whiteley-deep-roots-icon.webp",
  },
  {
    title: "Reunion Schedule & Food",
    description: "Schedule overview and food details.",
    href: "https://joeywilkes12.github.io/digital-schedule-website/",
    icon: "./assets/link-icons/reunion-pavilion-icon.webp",
  },
  {
    title: "Venmo",
    description: "Contribute to shared reunion expenses like food.",
    href: "./venmo-group.html",
    icon: "./assets/link-icons/venmo-icon.webp",
  },
  {
    title: "Miscellaneous",
    description: "Google Drive file share for downloadable and viewable resources.",
    href:
      "https://drive.google.com/drive/folders/1X6xjdzl1-UoIe6IiTYsXtW1w0s-_mGxA?usp=drive_link",
    icon: "./assets/link-icons/google-drive-icon.svg",
  },
];
const expectedGenealogyLinks = [
  {
    title: "William Henry Adams Senior",
    description: "By Brad C.",
    href: "https://drive.google.com/file/d/1S6Mpq4j3gMpkC1QICSsINpfRJWw7wg8d/view?usp=drive_link",
    icon: "./assets/genealogy/Adams_William%20Henry%20KWJ5-42R.jpg",
  },
  {
    title: "Frances Otten Adams",
    description: "By Brad C.",
    href: "https://drive.google.com/file/d/1tlhBKfo9_e3FS_pC4RoFGqbO4oUEbagy/view?usp=drive_link",
    icon: "./assets/genealogy/Frances%20Otten%20Adams.jpg",
  },
  {
    title: "Church History Biographical Database of William Henry Adams, Sr.",
    description: "Family history, ancestor records, photos, and stories.",
    href:
      "https://history.churchofjesuschrist.org/chd/individual/william-henry-adams-sr-1817?lang=eng",
    icon: "./assets/link-icons/familysearch-tree-icon.svg",
  },
];

function readSiteFile(fileName) {
  return readFileSync(resolve(siteRoot, fileName), "utf8");
}

function homeURL(baseURL) {
  return new URL("./", baseURL).toString();
}

function assetURL(baseURL, path) {
  return new URL(path, baseURL).toString();
}

function isAllowedRuntimeRequest(url, baseURL) {
  const home = homeURL(baseURL);
  return url === home || url.startsWith(home) || url.startsWith("data:");
}

function parseRgb(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not parse color: ${value}`);
  }

  return match[1]
    .split(",")
    .slice(0, 3)
    .map((part) => Number.parseFloat(part.trim()));
}

function linearize(channel) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const light = Math.max(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
  const dark = Math.min(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
  return (light + 0.05) / (dark + 0.05);
}

function durationToMs(value) {
  if (value.endsWith("ms")) {
    return Number.parseFloat(value);
  }

  if (value.endsWith("s")) {
    return Number.parseFloat(value) * 1000;
  }

  throw new Error(`Could not parse duration: ${value}`);
}

test.describe("static source contract", () => {
  test("keeps the site dependency-free and GitHub Pages-ready", async () => {
    const index = readSiteFile("index.html");
    const venmoPage = readSiteFile("venmo-group.html");
    const genealogyPage = readSiteFile("genealogy.html");
    const styles = readSiteFile("styles.css");
    const readme = readSiteFile("README.md");
    const agents = readSiteFile("agents.md");

    expect(existsSync(resolve(siteRoot, ".nojekyll"))).toBe(true);
    expect(existsSync(resolve(siteRoot, "package.json"))).toBe(false);
    expect(existsSync(resolve(siteRoot, "package-lock.json"))).toBe(false);

    expect(index).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(index).toContain('<meta property="og:title" content="Whiteley Reunion 2026 Links">');
    expect(index).toContain('<meta property="og:type" content="website">');
    expect(index).toContain('<meta property="og:url" content="https://joeywilkes12.github.io/4amj-landing-page-01/">');
    expect(index).toContain('<link rel="canonical" href="https://joeywilkes12.github.io/4amj-landing-page-01/">');
    expect(index).toContain("assets/whiteley-reunion-poster-1440.webp");
    expect(index).toContain(`alt="${expectedPosterAlt}"`);
    expect(index).toContain('<link rel="stylesheet" href="./styles.css">');
    expect(index).toContain('aria-label="Whiteley reunion resource links"');
    expect(index).toContain('class="link-icon"');
    expect(index).toContain('href="./venmo-group.html"');
    expect(index).toContain('href="./genealogy.html"');
    expect(index).not.toContain("William Henry Adams & Wife Details");
    expect(venmoPage).toContain(venmoGroupUrl);
    expect(venmoPage).toContain(venmoDeepLinkUrl);
    expect(venmoPage).toContain(cherieVenmoQrAsset.src);
    expect(venmoPage).toContain("alt=\"Venmo QR code for Cherie Journee.\"");
    expect(venmoPage).toContain("sms:?&amp;body=Hi%20Cherie");
    expect(venmoPage).toContain("Text Cherie for the Venmo group link");
    expect(venmoPage).toContain("Preferred method");
    expect(venmoPage).toContain("Click the full URL above");
    expect(venmoPage).toContain("All reunion links");
    expect(genealogyPage).toContain('<title>Genealogy | Whiteley Reunion 2026 Links</title>');
    expect(genealogyPage).toContain('<a class="back-link" href="./">&lt;- All reunion links</a>');
    expect(genealogyPage).toContain('aria-label="Genealogy resource links"');
    expect(genealogyPage).toContain("William Henry Adams Senior");
    expect(genealogyPage).toContain("Frances Otten Adams");
    expect(genealogyPage).toContain("Church History Biographical Database of William Henry Adams, Sr.");
    expect(index).not.toContain('aria-label="Toggle dark theme"');
    expect(index).not.toContain('id="theme-toggle"');
    expect(index).not.toContain("Update these links as reunion plans change.");
    expect(index).not.toContain("Family Reunion Links");
    expect(index).not.toContain("./genealogy/");

    const forbiddenRuntimePatterns = [
      /<script\b/i,
      /@import\b/i,
      /fonts\.googleapis/i,
      /cdn/i,
      /analytics/i,
      /gtag/i,
      /dataLayer/i,
    ];

    for (const pattern of forbiddenRuntimePatterns) {
      expect(index, `index.html should not match ${pattern}`).not.toMatch(pattern);
      expect(venmoPage, `venmo-group.html should not match ${pattern}`).not.toMatch(pattern);
      expect(genealogyPage, `genealogy.html should not match ${pattern}`).not.toMatch(pattern);
      expect(styles, `styles.css should not match ${pattern}`).not.toMatch(pattern);
    }

    expect(styles).toContain("--color-page: #0d2448;");
    expect(styles).toContain("--color-accent: #d6bb72;");
    expect(styles).not.toContain("body:has(.theme-toggle-input:checked)");
    expect(styles).not.toContain(".theme-toggle");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain('"Trajan Pro"');
    expect(agents).toContain("https://joeywilkes12.github.io/4amj-landing-page-01/");
    expect(agents).toContain("100+ near-simultaneous visitors");
    expect(agents).toContain("Optimize visual assets");
    expect(readme).toContain("bash tests/run-regression.sh");

    for (const asset of expectedPosterAssets) {
      const assetPath = resolve(siteRoot, asset.path);
      expect(existsSync(assetPath), `${asset.path} should exist`).toBe(true);
      expect(statSync(assetPath).size, `${asset.path} should stay under 150 KB`).toBeLessThan(150 * 1024);
    }

    const qrAssetPath = resolve(siteRoot, cherieVenmoQrAsset.path);
    expect(existsSync(qrAssetPath), `${cherieVenmoQrAsset.path} should exist`).toBe(true);
    expect(statSync(qrAssetPath).size, `${cherieVenmoQrAsset.path} should stay lightweight`).toBeLessThan(300 * 1024);

    for (const link of expectedLinks) {
      const iconPath = resolve(siteRoot, link.icon);
      expect(existsSync(iconPath), `${link.icon} should exist`).toBe(true);
      expect(statSync(iconPath).size, `${link.icon} should stay lightweight`).toBeLessThan(25 * 1024);
      expect(index).toContain(`src="${link.icon}"`);
    }

    for (const asset of forbiddenGenealogyPdfAssets) {
      const assetPath = resolve(siteRoot, asset);
      expect(existsSync(assetPath), `${asset} should not be committed`).toBe(false);
    }

    for (const link of expectedGenealogyLinks) {
      const iconPath = resolve(siteRoot, decodeURIComponent(link.icon));
      expect(existsSync(iconPath), `${link.icon} should exist`).toBe(true);
      expect(statSync(iconPath).size, `${link.icon} should stay lightweight`).toBeLessThan(25 * 1024);
      expect(genealogyPage).toContain(`src="${link.icon}"`);
    }
  });
});

test.describe("responsive link hub behavior", () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    page.consoleErrors = consoleErrors;
    page.pageErrors = pageErrors;
  });

  test("serves the landing page and stylesheet", async ({ request, baseURL }) => {
    const homeResponse = await request.get(homeURL(baseURL));
    expect(homeResponse.status()).toBe(200);
    expect(await homeResponse.text()).toContain(expectedTitle);

    const stylesheetResponse = await request.get(assetURL(baseURL, "./styles.css"));
    expect(stylesheetResponse.status()).toBe(200);
    expect(await stylesheetResponse.text()).toContain("--color-page: #0d2448;");

    const venmoPageResponse = await request.get(assetURL(baseURL, "./venmo-group.html"));
    expect(venmoPageResponse.status()).toBe(200);
    expect(await venmoPageResponse.text()).toContain("Group Venmo");

    const genealogyPageResponse = await request.get(assetURL(baseURL, "./genealogy.html"));
    expect(genealogyPageResponse.status()).toBe(200);
    expect(await genealogyPageResponse.text()).toContain("Genealogy | Whiteley Reunion 2026 Links");

    for (const asset of expectedPosterAssets) {
      const assetResponse = await request.get(assetURL(baseURL, asset.path));
      expect(assetResponse.status(), `${asset.path} should be served`).toBe(200);
      expect((await assetResponse.body()).length, `${asset.path} should be lightweight`).toBeLessThan(150 * 1024);
    }

    const qrResponse = await request.get(assetURL(baseURL, cherieVenmoQrAsset.path));
    expect(qrResponse.status(), `${cherieVenmoQrAsset.path} should be served`).toBe(200);
    expect((await qrResponse.body()).length, `${cherieVenmoQrAsset.path} should be lightweight`).toBeLessThan(300 * 1024);

    for (const link of expectedGenealogyLinks) {
      const iconResponse = await request.get(assetURL(baseURL, link.icon));
      expect(iconResponse.status(), `${link.icon} should be served`).toBe(200);
      expect((await iconResponse.body()).length, `${link.icon} should be lightweight`).toBeLessThan(25 * 1024);
    }
  });

  test("renders poster, core content, links, and layout without overflow", async ({ page, baseURL }, testInfo) => {
    const requestedUrls = [];
    page.on("request", (request) => requestedUrls.push(request.url()));

    await page.goto(homeURL(baseURL));

    await expect(page).toHaveTitle(expectedTitle);
    await expect(page.getByAltText(expectedPosterAlt)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(expectedTitle);
    await expect(page.getByText("Whiteley Reunion 2026", { exact: true })).toBeVisible();
    await expect(page.getByText("Update these links as reunion plans change.")).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: "Whiteley reunion resource links" });
    await expect(nav).toBeVisible();

    const links = nav.getByRole("link");
    await expect(links).toHaveCount(expectedLinks.length);

    for (const [index, expectedLink] of expectedLinks.entries()) {
      const link = links.nth(index);
      await expect(link).toContainText(expectedLink.title);
      await expect(link).toContainText(expectedLink.description);
      await expect(link).toHaveAttribute("href", expectedLink.href);
      await expect(link.locator(".link-icon img")).toHaveAttribute("src", expectedLink.icon);
      await expect(link.locator(".link-icon img")).toHaveAttribute("alt", "");
    }

    const metrics = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const linkBoxes = Array.from(document.querySelectorAll(".link-card")).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });
      const iconBoxes = Array.from(document.querySelectorAll(".link-icon")).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });
      const cardLayouts = Array.from(document.querySelectorAll(".link-card")).map((card) => {
        const cardRect = card.getBoundingClientRect();
        const iconRect = card.querySelector(".link-icon").getBoundingClientRect();
        const copyRect = card.querySelector(".link-copy").getBoundingClientRect();
        const arrowRect = card.querySelector(".link-arrow").getBoundingClientRect();
        return {
          card: {
            top: cardRect.top,
            right: cardRect.right,
            bottom: cardRect.bottom,
            left: cardRect.left,
          },
          icon: {
            top: iconRect.top,
            right: iconRect.right,
            bottom: iconRect.bottom,
            left: iconRect.left,
            width: iconRect.width,
            height: iconRect.height,
          },
          copy: {
            top: copyRect.top,
            right: copyRect.right,
            bottom: copyRect.bottom,
            left: copyRect.left,
          },
          arrow: {
            top: arrowRect.top,
            right: arrowRect.right,
            bottom: arrowRect.bottom,
            left: arrowRect.left,
            width: arrowRect.width,
            height: arrowRect.height,
          },
        };
      });
      const poster = document.querySelector(".poster img").getBoundingClientRect();
      const heading = document.querySelector("h1").getBoundingClientRect();

      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        linkBoxes,
        iconBoxes,
        cardLayouts,
        poster: {
          top: poster.top,
          right: poster.right,
          bottom: poster.bottom,
          left: poster.left,
          width: poster.width,
          height: poster.height,
        },
        heading: {
          top: heading.top,
          right: heading.right,
          bottom: heading.bottom,
          left: heading.left,
        },
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.poster.width).toBeGreaterThan(0);
    expect(metrics.poster.height).toBeGreaterThan(0);
    expect(metrics.poster.left).toBeGreaterThanOrEqual(0);
    expect(Math.ceil(metrics.poster.right)).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.poster.bottom).toBeLessThan(metrics.heading.top);

    for (const box of metrics.linkBoxes) {
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(Math.ceil(box.right)).toBeLessThanOrEqual(metrics.viewportWidth);
    }

    expect(metrics.iconBoxes).toHaveLength(expectedLinks.length);
    for (const box of metrics.iconBoxes) {
      expect(box.width).toBeGreaterThanOrEqual(32);
      expect(box.width).toBeLessThanOrEqual(56);
      expect(box.height).toBe(box.width);
    }

    expect(metrics.cardLayouts).toHaveLength(expectedLinks.length);
    for (const layout of metrics.cardLayouts) {
      expect(layout.icon.left).toBeGreaterThanOrEqual(layout.card.left);
      expect(layout.icon.top).toBeGreaterThanOrEqual(layout.card.top);
      expect(layout.icon.bottom).toBeLessThanOrEqual(layout.card.bottom);
      expect(Math.ceil(layout.icon.right)).toBeLessThanOrEqual(Math.floor(layout.copy.left));
      expect(Math.ceil(layout.copy.right)).toBeLessThanOrEqual(Math.floor(layout.arrow.left));
      expect(Math.ceil(layout.arrow.right)).toBeLessThanOrEqual(Math.ceil(layout.card.right));
      expect(layout.arrow.width).toBeLessThanOrEqual(36);
      expect(layout.arrow.height).toBe(layout.arrow.width);
    }

    for (let index = 1; index < metrics.linkBoxes.length; index += 1) {
      expect(metrics.linkBoxes[index].top).toBeGreaterThan(metrics.linkBoxes[index - 1].bottom);
    }

    const unexpectedRequests = requestedUrls.filter(
      (url) => !isAllowedRuntimeRequest(url, baseURL),
    );
    expect(unexpectedRequests).toEqual([]);
    expect(page.consoleErrors).toEqual([]);
    expect(page.pageErrors).toEqual([]);

    if (testInfo.project.name.startsWith("mobile-")) {
      mkdirSync(mobileReviewDir, { recursive: true });
      await page.screenshot({
        path: resolve(mobileReviewDir, `${testInfo.project.name}-full-page.png`),
        fullPage: true,
      });
    }
  });

  test("serves a mobile-first Venmo helper page", async ({ page, baseURL }, testInfo) => {
    const requestedUrls = [];
    page.on("request", (request) => requestedUrls.push(request.url()));

    await page.goto(assetURL(baseURL, "./venmo-group.html"));

    await expect(page).toHaveTitle("Group Venmo | Whiteley Reunion 2026 Links");
    await expect(page.getByAltText("Venmo QR code for Cherie Journee.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Group Venmo");
    await expect(page.getByText("Sending Venmo directly to Cherie Journee could also work.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preferred method" })).toBeVisible();

    await expect(page.getByRole("link", { name: venmoGroupUrl })).toHaveAttribute(
      "href",
      venmoGroupUrl,
    );
    await expect(page.getByRole("link", { name: "Text Cherie for the Venmo group link" })).toHaveAttribute(
      "href",
      venmoSmsUrl,
    );
    await expect(page.getByRole("link", { name: "Text Cherie for the Venmo group link" })).toHaveClass(
      /action-primary/,
    );
    await expect(page.getByRole("link", { name: /Last option: open Venmo directly/ })).toHaveAttribute(
      "href",
      venmoDeepLinkUrl,
    );
    await expect(page.getByRole("link", { name: /Last option: open Venmo directly/ })).toHaveClass(
      /action-danger/,
    );
    await expect(page.locator(".action-note")).toHaveText(
      "Although this doesn't open to the group link or Cherie's profile.",
    );
    await expect(page.getByRole("link", { name: "All reunion links" })).toHaveAttribute(
      "href",
      "./",
    );
    await expect(page.locator(".copyable-link")).toHaveText(venmoGroupUrl);
    await expect(page.locator(".method-list li")).toHaveCount(4);

    const metrics = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const fallbackPanel = document.querySelector(".fallback-panel").getBoundingClientRect();
      const venmoPanel = document.querySelector(".venmo-panel").getBoundingClientRect();
      const actionButtons = Array.from(document.querySelectorAll(".action-button"));
      const panels = Array.from(document.querySelectorAll(".venmo-panel, .fallback-panel, .action-button, .venmo-qr img")).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          right: rect.right,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });

      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        panels,
        fallbackTop: fallbackPanel.top,
        venmoPanelTop: venmoPanel.top,
        firstActionText: actionButtons[0].textContent.trim(),
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.fallbackTop).toBeLessThan(metrics.venmoPanelTop);
    expect(metrics.firstActionText).toBe("Text Cherie for the Venmo group link");
    for (const panel of metrics.panels) {
      expect(panel.height).toBeGreaterThanOrEqual(48);
      expect(panel.left).toBeGreaterThanOrEqual(0);
      expect(Math.ceil(panel.right)).toBeLessThanOrEqual(metrics.viewportWidth);
    }

    const unexpectedRequests = requestedUrls.filter(
      (url) => !isAllowedRuntimeRequest(url, baseURL),
    );
    expect(unexpectedRequests).toEqual([]);
    expect(page.consoleErrors).toEqual([]);
    expect(page.pageErrors).toEqual([]);

    if (testInfo.project.name.startsWith("mobile-")) {
      mkdirSync(mobileReviewDir, { recursive: true });
      await page.screenshot({
        path: resolve(mobileReviewDir, `${testInfo.project.name}-venmo-full-page.png`),
        fullPage: true,
      });
    }
  });

  test("renders the genealogy page with Google Drive links and thumbnails", async ({ page, baseURL }) => {
    await page.goto(assetURL(baseURL, "./genealogy.html"));

    await expect(page).toHaveTitle("Genealogy | Whiteley Reunion 2026 Links");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Genealogy");
    await expect(page.getByRole("link", { name: "All reunion links" })).toHaveAttribute(
      "href",
      "./",
    );

    const nav = page.getByRole("navigation", { name: "Genealogy resource links" });
    await expect(nav).toBeVisible();

    const links = nav.getByRole("link");
    await expect(links).toHaveCount(expectedGenealogyLinks.length);

    for (const [index, expectedLink] of expectedGenealogyLinks.entries()) {
      const link = links.nth(index);
      await expect(link).toContainText(expectedLink.title);
      await expect(link).toContainText(expectedLink.description);
      await expect(link).toHaveAttribute("href", expectedLink.href);
      await expect(link.locator(".link-icon img")).toHaveAttribute("src", expectedLink.icon);
      await expect(link.locator(".link-icon img")).toHaveAttribute("alt", "");
    }

    const metrics = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const linkBoxes = Array.from(document.querySelectorAll(".link-card")).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          height: rect.height,
        };
      });
      const iconBoxes = Array.from(document.querySelectorAll(".link-icon")).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
        };
      });

      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        linkBoxes,
        iconBoxes,
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    for (const box of metrics.linkBoxes) {
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(Math.ceil(box.right)).toBeLessThanOrEqual(metrics.viewportWidth);
    }

    expect(metrics.iconBoxes).toHaveLength(expectedGenealogyLinks.length);
    for (const box of metrics.iconBoxes) {
      expect(box.width).toBeGreaterThanOrEqual(32);
      expect(box.width).toBeLessThanOrEqual(56);
      expect(box.height).toBe(box.width);
    }
  });

  test("uses the navy theme and optimized responsive poster", async ({ page, baseURL }) => {
    await page.goto(homeURL(baseURL));

    await expect(page.getByRole("checkbox", { name: "Toggle dark theme" })).toHaveCount(0);

    const theme = await page.evaluate(() => {
      const bodyStyles = getComputedStyle(document.body);
      const linkStyles = getComputedStyle(document.querySelector(".link-card"));
      const poster = document.querySelector(".poster img");
      const posterRect = poster.getBoundingClientRect();
      return {
        background: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        page: bodyStyles.getPropertyValue("--color-page").trim(),
        accent: bodyStyles.getPropertyValue("--color-accent").trim(),
        linkColor: linkStyles.color,
        linkBackground: linkStyles.backgroundColor,
        posterComplete: poster.complete,
        posterWidth: posterRect.width,
        posterHeight: posterRect.height,
        posterSrc: poster.currentSrc,
      };
    });

    expect(theme.page).toBe("#0d2448");
    expect(theme.accent).toBe("#d6bb72");
    expect(theme.posterComplete).toBe(true);
    expect(theme.posterSrc).toContain("assets/whiteley-reunion-poster-");
    expect(theme.posterSrc).toContain(".webp");
    expect(theme.posterWidth).toBeGreaterThan(0);
    expect(theme.posterHeight).toBeGreaterThan(0);
    expect(contrastRatio(theme.color, theme.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.linkColor, theme.linkBackground)).toBeGreaterThanOrEqual(4.5);
  });

  test("keeps keyboard order and visible focus states", async ({ page, baseURL }) => {
    await page.goto(homeURL(baseURL));

    const expectedFocusOrder = expectedLinks.map((link) => link.href);
    for (const href of expectedFocusOrder) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`a[href="${href}"]`)).toBeFocused();

      const outline = await page.locator(`a[href="${href}"]`).evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
        };
      });

      expect(outline.outlineStyle).toBe("solid");
      expect(Number.parseFloat(outline.outlineWidth)).toBeGreaterThanOrEqual(3);
    }
  });

  test("maintains readable contrast in the navy theme", async ({ page, baseURL }) => {
    await page.goto(homeURL(baseURL));

    async function sampleContrast() {
      return page.evaluate(() => {
        const link = document.querySelector(".link-card");
        const linkBackground = getComputedStyle(link).backgroundColor;

        return [
          {
            name: "body text",
            foreground: getComputedStyle(document.body).color,
            background: getComputedStyle(document.body).backgroundColor,
          },
          {
            name: "heading",
            foreground: getComputedStyle(document.querySelector("h1")).color,
            background: getComputedStyle(document.body).backgroundColor,
          },
          {
            name: "subtitle",
            foreground: getComputedStyle(document.querySelector(".subtitle")).color,
            background: getComputedStyle(document.body).backgroundColor,
          },
          {
            name: "link title",
            foreground: getComputedStyle(document.querySelector(".link-title")).color,
            background: linkBackground,
          },
          {
            name: "link description",
            foreground: getComputedStyle(document.querySelector(".link-description")).color,
            background: linkBackground,
          },
        ];
      });
    }

    for (const sample of await sampleContrast()) {
      expect(contrastRatio(sample.foreground, sample.background), sample.name).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("honors reduced motion preferences", async ({ page, baseURL }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(homeURL(baseURL));

    const transitionDurations = await page.locator(".link-card").first().evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .map((value) => value.trim()),
    );

    expect(transitionDurations.every((value) => durationToMs(value) <= 0.02)).toBe(true);
  });
});
