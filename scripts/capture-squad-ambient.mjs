/**
 * Verifies squad ambient + icon work and prior regression fixes.
 * Usage: node scripts/capture-squad-ambient.mjs
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

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const checks = {};

  try {
    await login(page);

    await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });
    await page.waitForSelector(".afc-squad-ambient", { timeout: 15000 });

    checks.sidebarFooter = await page.evaluate(() => ({
      hasUserBlock: Boolean(document.querySelector(".afc-sidebar-user")),
      statusLabel: document.querySelector(".afc-sidebar-status__label")?.textContent?.trim(),
      statusDetail: document.querySelector(".afc-sidebar-status__detail")?.textContent?.trim(),
    }));

    checks.rosterAmbient = await page.evaluate(() => ({
      hasAmbient: Boolean(document.querySelector(".afc-squad-ambient--roster")),
      motifCount: document.querySelectorAll(".afc-squad-ambient--roster svg").length,
    }));

    await page.screenshot({ path: path.join(OUT_DIR, "ambient-roster.png") });

    const statusTrigger = page.locator("#client-status-trigger");
    await statusTrigger.click();
    await page.waitForTimeout(200);

    checks.selectGold = await page.evaluate(() => {
      const selected = document.querySelector(".afc-select-option--selected");
      if (!selected) return null;
      const label = selected.querySelector(".afc-select-option__label");
      return {
        background: getComputedStyle(selected).backgroundColor,
        labelColor: label ? getComputedStyle(label).color : null,
      };
    });

    await page.screenshot({ path: path.join(OUT_DIR, "ambient-roster-select.png") });
    await page.keyboard.press("Escape");

    const profileHref = await page
      .locator('.afc-roster-actions-cell a[href^="/owner/clients/"]')
      .first()
      .getAttribute("href");

    if (profileHref) {
      await page.goto(`${BASE}${profileHref}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".afc-squad-ambient--detail", { timeout: 15000 });

      checks.detailAmbient = await page.evaluate(() => ({
        hasAmbient: Boolean(document.querySelector(".afc-squad-ambient--detail")),
        sectionIcons: document.querySelectorAll(".afc-section-icon").length,
        statIcons: document.querySelectorAll(".afc-stat-tile__icon").length,
        macroRing: Boolean(document.querySelector(".afc-macro-ring")),
      }));

      await page.screenshot({ path: path.join(OUT_DIR, "ambient-client-detail.png") });

      await page.evaluate(() => {
        const card = document.querySelector(".afc-section-icon")?.closest(".afc-surface");
        card?.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT_DIR, "ambient-section-icon.png") });
    }

    await page.goto(`${BASE}/owner/clients/new`, { waitUntil: "networkidle" });
    await page.waitForSelector(".afc-plan-card", { timeout: 15000 });
    await page.evaluate(() => {
      document.getElementById("onboarding-plan")?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(300);

    checks.planIcons = await page.evaluate(
      () => document.querySelectorAll(".afc-plan-session-icon").length,
    );

    await page.screenshot({ path: path.join(OUT_DIR, "ambient-plan-cards.png") });

    for (const width of [375, 768]) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      checks[`overflow_${width}`] = overflow;
      await page.screenshot({
        path: path.join(OUT_DIR, `ambient-roster-${width}.png`),
      });
    }

    console.log(
      JSON.stringify(
        {
          outputDir: OUT_DIR,
          checks,
          screenshots: [
            "ambient-roster.png",
            "ambient-roster-select.png",
            "ambient-client-detail.png",
            "ambient-section-icon.png",
            "ambient-plan-cards.png",
            "ambient-roster-375.png",
            "ambient-roster-768.png",
          ],
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
