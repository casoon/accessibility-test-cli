import { chromium, Browser, Page } from "playwright";
import pa11y from "pa11y";
import { AccessibilityResult, TestOptions, Pa11yIssue } from "../types";

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

      // pa11y Accessibility-Tests durchführen
      try {
        const pa11yResult = await pa11y(url, {
          timeout: options.timeout || 10000,
          wait: options.wait || 1000,
          standard: options.pa11yStandard || 'WCAG2AA',
          hideElements: options.hideElements || 'iframe[src*="google-analytics"], iframe[src*="doubleclick"]',
          includeNotices: options.includeNotices !== false,
          includeWarnings: options.includeWarnings !== false,
          // includePasses: options.includePasses || false, // Not supported in current pa11y version
          runners: options.runners || ['axe', 'htmlcs'],
          chromeLaunchConfig: options.chromeLaunchConfig,
          log: options.verbose ? console : undefined,
        });

        // pa11y-Ergebnisse in unser Format konvertieren
        pa11yResult.issues.forEach((issue) => {
          // Detaillierte Issue-Informationen speichern
          const detailedIssue: Pa11yIssue = {
            code: issue.code,
            message: issue.message,
            type: issue.type as 'error' | 'warning' | 'notice',
            selector: issue.selector,
            context: issue.context,
            impact: (issue as any).impact,
            help: (issue as any).help,
            helpUrl: (issue as any).helpUrl
          };
          
          result.pa11yIssues = result.pa11yIssues || [];
          result.pa11yIssues.push(detailedIssue);
          
          // Für Kompatibilität auch in errors/warnings
          const message = `${issue.code}: ${issue.message}`;
          if (issue.type === 'error') {
            result.errors.push(message);
          } else if (issue.type === 'warning') {
            result.warnings.push(message);
          } else if (issue.type === 'notice') {
            result.warnings.push(`Notice: ${message}`);
          }
        });

        // Zusätzliche pa11y-Metriken
        if (pa11yResult.documentTitle) {
          result.title = pa11yResult.documentTitle;
        }

        // pa11y Score berechnen
        if (pa11yResult.issues.length > 0) {
          const totalIssues = pa11yResult.issues.length;
          const errorIssues = pa11yResult.issues.filter(issue => issue.type === 'error').length;
          result.pa11yScore = Math.max(0, 100 - (errorIssues * 10) - (totalIssues - errorIssues) * 2);
        } else {
          result.pa11yScore = 100;
        }

      } catch (pa11yError) {
        result.warnings.push(`pa11y test failed: ${pa11yError}`);
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
