import { chromium, Browser, Page } from "playwright";
import { AccessibilityResult, TestOptions } from "./types";

export class AccessibilityChecker {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testPage(
    url: string,
    options: TestOptions = {},
  ): Promise<AccessibilityResult> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    const startTime = Date.now();
    const page = await this.browser.newPage();
    const result: AccessibilityResult = {
      url,
      title: "",
      imagesWithoutAlt: 0,
      buttonsWithoutLabel: 0,
      headingsCount: 0,
      errors: [],
      warnings: [],
      passed: true,
      duration: 0,
    };

    try {
      await page.goto(url, {
        waitUntil: options.waitUntil || "domcontentloaded",
        timeout: options.timeout || 10000,
      });

      // Seitentitel prüfen
      result.title = await page.title();

      // Bilder ohne alt-Attribut
      result.imagesWithoutAlt = await page.locator("img:not([alt])").count();
      if (result.imagesWithoutAlt > 0) {
        result.warnings.push(
          `${result.imagesWithoutAlt} images without alt attribute`,
        );
      }

      // Buttons ohne aria-label
      result.buttonsWithoutLabel = await page
        .locator("button:not([aria-label])")
        .filter({ hasText: "" })
        .count();
      if (result.buttonsWithoutLabel > 0) {
        result.warnings.push(
          `${result.buttonsWithoutLabel} buttons without aria-label`,
        );
      }

      // Überschriften-Hierarchie
      result.headingsCount = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .count();
      if (result.headingsCount === 0) {
        result.errors.push("No headings found");
      }

      // Prüfe auf kritische Fehler
      if (result.errors.length > 0) {
        result.passed = false;
      }
    } catch (error) {
      result.errors.push(`Navigation error: ${error}`);
      result.passed = false;
    } finally {
      await page.close();
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  async testMultiplePages(
    urls: string[],
    options: TestOptions = {},
  ): Promise<AccessibilityResult[]> {
    const results: AccessibilityResult[] = [];
    const maxPages = options.maxPages || urls.length;

    for (let i = 0; i < Math.min(urls.length, maxPages); i++) {
      const result = await this.testPage(urls[i], options);
      results.push(result);
    }

    return results;
  }
}
