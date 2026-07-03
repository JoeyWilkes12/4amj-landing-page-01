import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testRoot = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(testRoot, "..");

const expectedTitle = "Whiteley Reunion 2026 Links";
const expectedLinks = [
  {
    title: "William Henry Adams",
    description: "Family history, ancestor records, photos, and stories.",
    href:
      "https://history.churchofjesuschrist.org/chd/individual/william-henry-adams-sr-1817?lang=eng",
  },
  {
    title: "Reunion Food",
    description: "Meal plans, potluck signups, food assignments, and dietary notes.",
    href: "./reunion-food/",
  },
  {
    title: "Misc",
    description: "Other reunion resources, announcements, maps, schedules, and shared links.",
    href: "./misc/",
  },
];

function readSiteFile(fileName) {
  return readFileSync(resolve(siteRoot, fileName), "utf8");
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

function overlaps(a, b) {
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

async function waitForThemeTransition(page) {
  await page.waitForTimeout(250);
}

test.describe("static source contract", () => {
  test("keeps the site dependency-free and GitHub Pages-ready", async () => {
    const index = readSiteFile("index.html");
    const styles = readSiteFile("styles.css");
    const readme = readSiteFile("README.md");

    expect(existsSync(resolve(siteRoot, ".nojekyll"))).toBe(true);
    expect(existsSync(resolve(siteRoot, "package.json"))).toBe(false);
    expect(existsSync(resolve(siteRoot, "package-lock.json"))).toBe(false);

    expect(index).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(index).toContain('<meta property="og:title" content="Whiteley Reunion 2026 Links">');
    expect(index).toContain('<meta property="og:type" content="website">');
    expect(index).toContain("Add a canonical URL here");
    expect(index).toContain('<link rel="stylesheet" href="./styles.css">');
    expect(index).toContain('aria-label="Whiteley reunion resource links"');
    expect(index).toContain('aria-label="Toggle dark theme"');
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
      expect(styles, `styles.css should not match ${pattern}`).not.toMatch(pattern);
    }

    expect(styles).toContain("#687249");
    expect(styles).toContain("#b0c088");
    expect(styles).toContain("body:has(.theme-toggle-input:checked)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain('"Trajan Pro"');
    expect(readme).toContain("bash tests/run-regression.sh");
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

  test("renders core content, links, and layout without overflow", async ({ page, baseURL }) => {
    const requestedUrls = [];
    page.on("request", (request) => requestedUrls.push(request.url()));

    await page.goto("/");

    await expect(page).toHaveTitle(expectedTitle);
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
      const toggle = document.querySelector(".theme-toggle").getBoundingClientRect();
      const avatar = document.querySelector(".avatar").getBoundingClientRect();
      const heading = document.querySelector("h1").getBoundingClientRect();

      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        linkBoxes,
        toggle: {
          top: toggle.top,
          right: toggle.right,
          bottom: toggle.bottom,
          left: toggle.left,
        },
        avatar: {
          top: avatar.top,
          right: avatar.right,
          bottom: avatar.bottom,
          left: avatar.left,
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

    for (const box of metrics.linkBoxes) {
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(Math.ceil(box.right)).toBeLessThanOrEqual(metrics.viewportWidth);
    }

    for (let index = 1; index < metrics.linkBoxes.length; index += 1) {
      expect(metrics.linkBoxes[index].top).toBeGreaterThan(metrics.linkBoxes[index - 1].bottom);
    }

    expect(overlaps(metrics.toggle, metrics.avatar)).toBe(false);
    expect(overlaps(metrics.toggle, metrics.heading)).toBe(false);

    const unexpectedRequests = requestedUrls.filter(
      (url) => !url.startsWith(`${baseURL}/`) && !url.startsWith("data:"),
    );
    expect(unexpectedRequests).toEqual([]);
    expect(page.consoleErrors).toEqual([]);
    expect(page.pageErrors).toEqual([]);
  });

  test("defaults to light theme and toggles to dark theme", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("checkbox", { name: "Toggle dark theme" });
    await expect(toggle).not.toBeChecked();

    const lightTheme = await page.evaluate(() => {
      const bodyStyles = getComputedStyle(document.body);
      const cardStyles = getComputedStyle(document.querySelector(".link-hub"));
      return {
        background: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        accent: bodyStyles.getPropertyValue("--color-accent").trim(),
        cardBackground: cardStyles.backgroundColor,
      };
    });

    expect(lightTheme.accent).toBe("#687249");

    await toggle.click();
    await waitForThemeTransition(page);
    await expect(toggle).toBeChecked();

    const darkTheme = await page.evaluate(() => {
      const bodyStyles = getComputedStyle(document.body);
      const cardStyles = getComputedStyle(document.querySelector(".link-hub"));
      const avatarStyles = getComputedStyle(document.querySelector(".avatar"));
      return {
        background: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        accent: bodyStyles.getPropertyValue("--color-accent").trim(),
        cardBackground: cardStyles.backgroundColor,
        avatarBackground: avatarStyles.backgroundColor,
        avatarColor: avatarStyles.color,
      };
    });

    expect(darkTheme.accent).toBe("#b0c088");
    expect(darkTheme.background).not.toBe(lightTheme.background);
    expect(darkTheme.cardBackground).not.toBe(lightTheme.cardBackground);
    expect(contrastRatio(darkTheme.avatarColor, darkTheme.avatarBackground)).toBeGreaterThanOrEqual(4.5);
  });

  test("keeps keyboard order and visible focus states", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const toggle = page.locator("#theme-toggle");
    await expect(toggle).toBeFocused();

    const toggleFocus = await page.locator(".theme-toggle").evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
      };
    });

    expect(toggleFocus.outlineStyle).toBe("solid");
    expect(Number.parseFloat(toggleFocus.outlineWidth)).toBeGreaterThanOrEqual(3);

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

  test("maintains readable contrast in light and dark themes", async ({ page }) => {
    await page.goto("/");

    async function sampleContrast() {
      return page.evaluate(() => {
        const card = document.querySelector(".link-hub");
        const link = document.querySelector(".link-card");
        const cardBackground = getComputedStyle(card).backgroundColor;
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
            background: cardBackground,
          },
          {
            name: "subtitle",
            foreground: getComputedStyle(document.querySelector(".subtitle")).color,
            background: cardBackground,
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

    await page.getByRole("checkbox", { name: "Toggle dark theme" }).click();
    await waitForThemeTransition(page);

    for (const sample of await sampleContrast()) {
      expect(contrastRatio(sample.foreground, sample.background), `dark ${sample.name}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("honors reduced motion preferences", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const transitionDurations = await page.locator(".link-card").first().evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .map((value) => value.trim()),
    );

    expect(transitionDurations.every((value) => durationToMs(value) <= 0.02)).toBe(true);
  });
});
