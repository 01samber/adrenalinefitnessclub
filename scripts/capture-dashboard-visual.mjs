/**
 * Captures owner dashboard visual verification screenshots.
 * Usage: node scripts/capture-dashboard-visual.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.MOTION_TEST_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "motion-captures");

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "anwargreige@afc.com");
  await page.fill('input[type="password"]', "1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/owner/dashboard", { timeout: 20000 });
}

async function waitForTiles(page) {
  await page.waitForFunction(
    () =>
      document.querySelectorAll(
        ".afc-stat-tile:not(.afc-stat-tile--skeleton) .afc-stat-tile__icon",
      ).length >= 9,
    { timeout: 20000 },
  );
  await page.waitForTimeout(600);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await login(page);
    await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "networkidle" });
    await waitForTiles(page);

    await page.screenshot({
      path: path.join(OUT_DIR, "dashboard-ambient-rest.png"),
      fullPage: false,
    });

    const tile = page.locator(".afc-stat-tile").nth(4);
    await tile.scrollIntoViewIfNeeded();
    await tile.hover({ force: true });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(OUT_DIR, "dashboard-stat-hover.png"),
      fullPage: false,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(OUT_DIR, "dashboard-mobile-375.png"),
      fullPage: false,
    });

    const iconSize = await page.evaluate(() => {
      const icon = document.querySelector(".afc-stat-tile__icon");
      if (!icon) return null;
      const rect = icon.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    console.log(
      JSON.stringify(
        {
          outputDir: OUT_DIR,
          screenshots: [
            "dashboard-ambient-rest.png",
            "dashboard-stat-hover.png",
            "dashboard-mobile-375.png",
          ],
          mobileIconSize: iconSize,
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

main();
