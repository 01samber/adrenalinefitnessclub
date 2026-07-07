/**
 * Verifies Iron Lanes motion against a running dev server (npm run dev).
 * Usage: npx playwright install chromium && node scripts/verify-motion.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.MOTION_TEST_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "motion-captures");

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/owner/dashboard", { timeout: 20000 });
}

async function waitForLoadedStatTiles(page) {
  await page.waitForFunction(
    () => {
      const tile = document.querySelector(
        ".afc-stat-tile:not(.afc-stat-tile--skeleton)",
      );
      return Boolean(tile);
    },
    { timeout: 20000 },
  );
}

async function pollNumericStatValues(page, durationMs = 1400, intervalMs = 50) {
  return page.evaluate(
    async ({ durationMs: duration, intervalMs: interval }) => {
      const samples = [];
      const start = Date.now();
      while (Date.now() - start < duration) {
        const values = [
          ...document.querySelectorAll(
            ".afc-stat-tile:not(.afc-stat-tile--skeleton) .afc-stat-tile__value",
          ),
        ];
        for (const el of values) {
          const text = el.textContent?.trim() ?? "";
          if (/^\d+$/.test(text)) {
            samples.push(Number(text));
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      return samples;
    },
    { durationMs, intervalMs },
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  const results = [];

  try {
    await login(page, "anwargreige@afc.com", "1234");

    // 1) Stagger on stat grid after data load
    await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "networkidle" });
    await waitForLoadedStatTiles(page);

    const tileEarly = await page.$eval(
      ".afc-stat-tile:not(.afc-stat-tile--skeleton)",
      (el) => {
        const style = getComputedStyle(el);
        return {
          opacity: style.opacity,
          transform: style.transform,
          animationName: style.animationName,
        };
      },
    );
    await page.waitForTimeout(450);
    const tileLate = await page.$eval(
      ".afc-stat-tile:not(.afc-stat-tile--skeleton)",
      (el) => {
        const style = getComputedStyle(el);
        return { opacity: style.opacity, transform: style.transform };
      },
    );

    results.push({
      check: "page-load-stagger",
      pass:
        tileEarly.animationName.includes("afc-enter-rise") &&
        (tileEarly.transform !== tileLate.transform ||
          Number(tileEarly.opacity) < Number(tileLate.opacity)),
      tileEarly,
      tileLate,
    });

    // 2) LIVE badge pulse
    const pulse = await page.evaluate(() => {
      const dot = document.querySelector(".afc-live-badge .afc-status-pulse");
      if (!dot) return null;
      const before = getComputedStyle(dot, "::before");
      return {
        animationName: before.animationName,
        animationDuration: before.animationDuration,
      };
    });

    results.push({
      check: "live-badge-pulse",
      pass: Boolean(pulse?.animationName?.includes("afc-pulse-breathe")),
      pulse,
    });

    // 3) Count-up — hard reload and poll as soon as tiles mount
    await page.reload({ waitUntil: "domcontentloaded" });
    const countPromise = pollNumericStatValues(page, 1600, 40);
    await waitForLoadedStatTiles(page);
    const countSamples = await countPromise;
    const final = countSamples.at(-1);
    const sawCountUp =
      countSamples.includes(0) ||
      countSamples.some(
        (value, index) =>
          index > 0 &&
          value !== undefined &&
          countSamples[index - 1] !== undefined &&
          value > countSamples[index - 1],
      );

    results.push({
      check: "stat-count-up",
      pass: sawCountUp && final !== undefined && final > 0,
      samples: countSamples,
    });

    await page.screenshot({
      path: path.join(OUT_DIR, "01-dashboard-motion.png"),
    });

    // 4a) Squad card hover — mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });
    await page.waitForSelector(".afc-squad-card", { timeout: 15000 });

    const squadCard = page.locator(".afc-squad-card").first();
    const squadBefore = await squadCard.evaluate((el) => getComputedStyle(el).transform);
    await squadCard.scrollIntoViewIfNeeded();
    await squadCard.hover({ force: true });
    await page.waitForTimeout(220);
    const squadAfter = await squadCard.evaluate((el) => getComputedStyle(el).transform);

    results.push({
      check: "squad-card-hover",
      pass: squadBefore !== squadAfter,
      squadBefore,
      squadAfter,
    });

    // 4b) Table row hover — desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector(".afc-roster-row", { timeout: 15000 });

    const row = page.locator(".afc-roster-row").first();
    const bgBefore = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    await row.hover();
    await page.waitForTimeout(220);
    const bgAfter = await row.evaluate((el) => getComputedStyle(el).backgroundColor);

    results.push({
      check: "roster-row-hover",
      pass: bgBefore !== bgAfter,
      bgBefore,
      bgAfter,
    });

    await page.screenshot({
      path: path.join(OUT_DIR, "02-roster-hover.png"),
    });
  } catch (error) {
    results.push({ check: "fatal", pass: false, error: String(error) });
  } finally {
    await page.waitForTimeout(800);
    await context.close();
    await browser.close();
  }

  console.log(JSON.stringify({ outputDir: OUT_DIR, results }, null, 2));
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main();
