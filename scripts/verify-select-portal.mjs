/**
 * Verifies Select dropdown is not clipped inside .afc-data-panel.
 * Usage: npm install -D playwright && npx playwright install chromium && node scripts/verify-select-portal.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.MOTION_TEST_URL ?? "http://localhost:3000";

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "anwargreige@afc.com");
  await page.fill('input[type="password"]', "1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/owner/dashboard", { timeout: 20000 });
}

async function checkNativeSelect(page, width) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });

  const select = page.locator("#client-status");
  await select.waitFor({ state: "visible", timeout: 15000 });

  const ok = await select.evaluate((el) => {
    const style = getComputedStyle(el);
    return style.display !== "none" && el.offsetParent !== null;
  });

  return { width, mode: "native", ok };
}

async function checkPortalMenu(page, width) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${BASE}/owner/clients`, { waitUntil: "networkidle" });

  const trigger = page.locator("#client-status-trigger");
  await trigger.waitFor({ state: "visible", timeout: 15000 });
  await trigger.click();

  const menu = page.locator("#client-status-listbox");
  await menu.waitFor({ state: "visible", timeout: 5000 });

  const details = await page.evaluate(() => {
    const menuEl = document.getElementById("client-status-listbox");
    const panel = document.querySelector(".afc-data-panel");
    if (!menuEl || !panel) return { ok: false, reason: "missing-elements" };

    const menuRect = menuEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const optionCount = menuEl.querySelectorAll(".afc-select-option").length;
    const parentIsBody = menuEl.parentElement === document.body;
    const fullyVisible =
      menuRect.height > 120 &&
      menuRect.top >= 0 &&
      menuRect.bottom <= window.innerHeight &&
      optionCount >= 4;

    return {
      ok: parentIsBody && fullyVisible,
      parentIsBody,
      optionCount,
      menuHeight: menuRect.height,
      menuBottom: menuRect.bottom,
      panelBottom: panelRect.bottom,
    };
  });

  await trigger.click();
  return { width, mode: "portal", ...details };
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  try {
    await login(page);
    results.push(await checkNativeSelect(page, 375));
    results.push(await checkNativeSelect(page, 768));
    results.push(await checkPortalMenu(page, 1280));
  } catch (error) {
    results.push({ ok: false, error: String(error) });
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ results }, null, 2));
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

main();
