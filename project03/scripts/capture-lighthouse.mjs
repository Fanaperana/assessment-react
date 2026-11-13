import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(
    pathToFileURL(resolve("docs/lighthouse-profile.report.html")).href,
  );
  await page.screenshot({ path: "docs/lighthouse-profile.png" });
} finally {
  await browser.close();
}
