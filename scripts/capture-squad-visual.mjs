/**
 * Captures squad management visual verification screenshots.
 * Usage: node scripts/capture-squad-visual.mjs
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

  try {
    await login(page);

    // Roster page
    await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });
    await page.waitForSelector(".afc-roster-row, .afc-squad-card", { timeout: 20000 });

    // Sidebar footer regression check
    const sidebarFooter = await page.evaluate(() => {
      const footer = document.querySelector(".afc-sidebar-footer");
      if (!footer) return null;
      return {
        hasUserBlock: Boolean(footer.querySelector(".afc-sidebar-user")),
        statusLabel: footer.querySelector(".afc-sidebar-status__label")?.textContent?.trim(),
        statusDetail: footer.querySelector(".afc-sidebar-status__detail")?.textContent?.trim(),
      };
    });

    await page.screenshot({
      path: path.join(OUT_DIR, "squad-roster.png"),
      fullPage: false,
    });

    // Status filter open (gold styling)
    const statusTrigger = page.locator("#client-status-trigger");
    if (await statusTrigger.count()) {
      await statusTrigger.click();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(OUT_DIR, "squad-status-select.png"),
        fullPage: false,
      });
      await page.keyboard.press("Escape");
    }

    // Roster row hover
    const row = page.locator(".afc-roster-row").first();
    await row.hover({ force: true });
    await page.waitForTimeout(220);
    await page.screenshot({
      path: path.join(OUT_DIR, "squad-roster-hover.png"),
      fullPage: false,
    });

    // Client detail empty states — open first athlete profile from roster actions
    await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });
    const profileHref = await page
      .locator('.afc-roster-actions-cell a[href^="/owner/clients/"]')
      .first()
      .getAttribute("href");

    if (profileHref) {
      await page.goto(`${BASE}${profileHref}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".afc-player-card", { timeout: 20000 });
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.62));
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(OUT_DIR, "squad-client-empty-states.png"),
        fullPage: false,
      });
    }

    // Onboarding step completion
    await page.goto(`${BASE}/owner/clients/new`, { waitUntil: "networkidle" });
    await page.getByLabel("Full name").fill("Jordan Miles");
    await page.getByLabel("Email").fill("jordan.miles@example.com");
    await page.getByLabel("Temporary password").fill("TempPass123!");
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT_DIR, "squad-onboarding-step-complete.png"),
      fullPage: false,
    });

    const selectSelectedColor = await page.evaluate(() => {
      const selected = document.querySelector(".afc-select-option--selected");
      if (!selected) return null;
      const style = getComputedStyle(selected);
      const label = selected.querySelector(".afc-select-option__label");
      return {
        background: style.backgroundColor,
        labelColor: label ? getComputedStyle(label).color : null,
      };
    });

    console.log(
      JSON.stringify(
        {
          outputDir: OUT_DIR,
          sidebarFooter,
          selectSelectedColor,
          screenshots: [
            "squad-roster.png",
            "squad-status-select.png",
            "squad-roster-hover.png",
            "squad-client-empty-states.png",
            "squad-onboarding-step-complete.png",
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
