import { chromium, Browser, Page } from "playwright";
import pa11y from "pa11y";
import { AccessibilityResult, TestOptions, Pa11yIssue } from "../types";
import * as fs from 'fs';
import * as path from 'path';
import { TestQueue, QueuedUrl } from './test-queue';

export class AccessibilityChecker {
  private browser: Browser | null = null;
  private testQueue: TestQueue | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      slowMo: 0,
      devtools: false
    });
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
      if (options.verbose) console.log(`   🔧 Configuring page...`);
      // 🆕 Erweiterte Page-Konfiguration
      await this.configurePage(page, options);

      if (options.verbose) console.log(`   🌐 Navigating to page...`);
      await page.goto(url, {
        waitUntil: options.waitUntil || "domcontentloaded",
        timeout: options.timeout || 10000,
      });

      // 🆕 Performance-Metriken sammeln
      if (options.collectPerformanceMetrics) {
        if (options.verbose) console.log(`   📊 Collecting performance metrics...`);
        await this.collectPerformanceMetrics(page, result, options);
      }

      // Seitentitel prüfen
      if (options.verbose) console.log(`   📋 Extracting page title...`);
      result.title = await page.title();

      // Bilder ohne alt-Attribut
      if (options.verbose) console.log(`   🖼️  Checking images for alt attributes...`);
      result.imagesWithoutAlt = await page.locator("img:not([alt])").count();
      if (result.imagesWithoutAlt > 0) {
        result.warnings.push(
          `${result.imagesWithoutAlt} images without alt attribute`,
        );
      }

      // Buttons ohne aria-label
      if (options.verbose) console.log(`   🔘 Checking buttons for aria labels...`);
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
      if (options.verbose) console.log(`   📝 Checking heading hierarchy...`);
      result.headingsCount = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .count();
      if (result.headingsCount === 0) {
        result.errors.push("No headings found");
      }

      // 🆕 Erweiterte Accessibility-Tests
      if (options.testKeyboardNavigation) {
        if (options.verbose) console.log(`   ⌨️  Testing keyboard navigation...`);
        await this.testKeyboardNavigation(page, result, options);
      }

      if (options.testColorContrast) {
        if (options.verbose) console.log(`   🎨 Testing color contrast...`);
        await this.testColorContrast(page, result, options);
      }

      if (options.testFocusManagement) {
        if (options.verbose) console.log(`   🎯 Testing focus management...`);
        await this.testFocusManagement(page, result, options);
      }

      // 🆕 Screenshots
      if (options.captureScreenshots) {
        if (options.verbose) console.log(`   📸 Capturing screenshots...`);
        await this.captureScreenshots(page, url, result, options);
      }

      // pa11y Accessibility-Tests durchführen
      if (options.verbose) console.log(`   🔍 Running pa11y accessibility tests...`);
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
    const pagesToTest = urls.slice(0, maxPages);

    // Prüfen, ob eine bestehende Queue existiert
    const existingQueueFile = this.findExistingQueueFile();
    
    if (existingQueueFile && !options.forceNewQueue) {
      console.log(`🔄 Found existing queue: ${existingQueueFile}`);
      console.log(`🔄 Resuming previous test session...`);
      
      // Bestehende Queue laden
      this.testQueue = new TestQueue({
        maxRetries: 3,
        maxConcurrent: 1,
        saveInterval: 5000,
        dataFile: existingQueueFile,
        priorityPatterns: [
          { pattern: '/home', priority: 1 },
          { pattern: '/', priority: 2 },
          { pattern: '/about', priority: 3 },
          { pattern: '/contact', priority: 3 },
          { pattern: '/blog', priority: 4 },
          { pattern: '/products', priority: 4 }
        ]
      });
      
      // Status der bestehenden Queue anzeigen
      this.testQueue.showStats();
      
      // Prüfen, ob noch URLs zu testen sind
      const status = this.testQueue.getStatus();
      if (status.pending === 0) {
        console.log(`✅ All URLs already tested! Loading results from queue...`);
        
        // Ergebnisse aus der Queue laden
        const queueData = JSON.parse(fs.readFileSync(existingQueueFile, 'utf8'));
        const completedResults = queueData.completed.map((item: any) => item.result);
        const failedResults = queueData.failed.map((item: any) => ({
          url: item.url,
          title: "",
          imagesWithoutAlt: 0,
          buttonsWithoutLabel: 0,
          headingsCount: 0,
          errors: [`Test failed: ${item.error}`],
          warnings: [],
          passed: false,
          duration: 0,
        }));
        
        return [...completedResults, ...failedResults];
      }
      
    } else {
      // Neue Queue erstellen
      this.testQueue = new TestQueue({
        maxRetries: 3,
        maxConcurrent: 1,
        saveInterval: 5000,
        dataFile: `./test-queue-${Date.now()}.json`,
        priorityPatterns: [
          { pattern: '/home', priority: 1 },
          { pattern: '/', priority: 2 },
          { pattern: '/about', priority: 3 },
          { pattern: '/contact', priority: 3 },
          { pattern: '/blog', priority: 4 },
          { pattern: '/products', priority: 4 }
        ]
      });

      // URLs zur Queue hinzufügen
      this.testQueue.addUrls(pagesToTest);
    }
    
    console.log(`🧪 Testing ${pagesToTest.length} pages using queue system...`);
    this.testQueue.showStats();

    let completedCount = 0;
    const maxAttempts = pagesToTest.length * 3; // Sicherheitsgrenze
    let attempts = 0;

    while (completedCount < pagesToTest.length && attempts < maxAttempts) {
      attempts++;
      
      // Nächste URL aus der Queue holen
      const queuedUrl = this.testQueue.getNextUrl();
      if (!queuedUrl) {
        // Keine URLs mehr in der Queue
        break;
      }

      const startTime = Date.now();
      console.log(`\n📄 Testing page ${completedCount + 1}/${pagesToTest.length}: ${queuedUrl.url}`);
      console.log(`   ⏱️  Starting test (attempt ${queuedUrl.attempts})...`);
      
      try {
        const result = await this.testPage(queuedUrl.url, options);
        const duration = Date.now() - startTime;
        result.duration = duration;
        results.push(result);
        
        // URL als abgeschlossen markieren
        this.testQueue.markCompleted(queuedUrl.url, result);
        completedCount++;
        
        console.log(`   ✅ Test completed in ${duration}ms`);
        
        if (result.passed) {
          console.log(`   🎯 Result: PASSED (${result.errors.length} errors, ${result.warnings.length} warnings)`);
        } else {
          console.log(`   🎯 Result: FAILED (${result.errors.length} errors, ${result.warnings.length} warnings)`);
        }
        
        // Status alle 5 URLs anzeigen
        if (completedCount % 5 === 0) {
          this.testQueue.showStats();
        }
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`   💥 Error testing page after ${duration}ms: ${error}`);
        
        // URL als fehlgeschlagen markieren
        this.testQueue.markFailed(queuedUrl.url, String(error));
        
        // Error-Result erstellen
        const errorResult: AccessibilityResult = {
          url: queuedUrl.url,
          title: "",
          imagesWithoutAlt: 0,
          buttonsWithoutLabel: 0,
          headingsCount: 0,
          errors: [`Test failed: ${error}`],
          warnings: [],
          passed: false,
          duration,
        };
        results.push(errorResult);
        completedCount++;
      }
    }

    // Finale Statistiken anzeigen
    console.log('\n📊 Final Queue Statistics:');
    this.testQueue.showStats();
    
    // Queue aufräumen
    if (this.testQueue) {
      this.testQueue.stopAutoSave();
      this.testQueue.saveQueue();
    }

    return results;
  }

  /**
   * Findet eine bestehende Queue-Datei
   */
  private findExistingQueueFile(): string | null {
    try {
      const files = fs.readdirSync('.');
      const queueFiles = files.filter(file => 
        file.startsWith('test-queue-') && file.endsWith('.json')
      );
      
      if (queueFiles.length === 0) return null;
      
      // Neueste Queue-Datei verwenden
      const latestFile = queueFiles.sort().reverse()[0];
      return latestFile;
    } catch (error) {
      return null;
    }
  }

  // 🆕 Erweiterte Page-Konfiguration
  private async configurePage(page: Page, options: TestOptions): Promise<void> {
    // Viewport-Konfiguration
    const viewportSize = options.viewportSize || { width: 1920, height: 1080 };
    await page.setViewportSize(viewportSize);

    // User-Agent setzen (Standard: a11y-test)
    const userAgent = options.userAgent || 'a11y-test/1.0 (+https://github.com/casoon/accessibility-test-cli)';
    await page.setExtraHTTPHeaders({
      'User-Agent': userAgent
    });

    // Network-Interception für Performance
    if (options.blockImages) {
      await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', route => {
        route.abort();
      });
    }

    if (options.blockCSS) {
      await page.route('**/*.css', route => {
        route.abort();
      });
    }

    // Console-Logging
    page.on('console', msg => {
      if (options.verbose) {
        console.log(`Browser Console: ${msg.text()}`);
      }
    });

    // Error-Handling
    page.on('pageerror', error => {
      if (options.verbose) {
        console.log(`JavaScript Error: ${error.message}`);
      }
    });
  }

  // 🆕 Performance-Metriken sammeln
  private async collectPerformanceMetrics(page: Page, result: AccessibilityResult, options: TestOptions): Promise<void> {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
        };
      });

      result.performanceMetrics = metrics;

      // Performance-Warnungen
      if (metrics.loadTime > 3000) {
        result.warnings.push(`Slow page load: ${Math.round(metrics.loadTime)}ms`);
      }
    } catch (error) {
      if (options.verbose) {
        console.log(`Performance metrics collection failed: ${error}`);
      }
    }
  }

  // 🆕 Keyboard Navigation Test
  private async testKeyboardNavigation(page: Page, result: AccessibilityResult, options: TestOptions): Promise<void> {
    try {
      const keyboardNavigation = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        const navigation: string[] = [];
        
        // Simuliere Tab-Navigation für die ersten 10 Elemente
        for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
          const element = focusableElements[i] as HTMLElement;
          navigation.push(`${element.tagName.toLowerCase()}: ${element.textContent?.trim().substring(0, 50) || element.outerHTML}`);
        }
        
        return navigation;
      });

      result.keyboardNavigation = keyboardNavigation;
    } catch (error) {
      if (options.verbose) {
        console.log(`Keyboard navigation test failed: ${error}`);
      }
    }
  }

  // 🆕 Color Contrast Test (vereinfacht)
  private async testColorContrast(page: Page, result: AccessibilityResult, options: TestOptions): Promise<void> {
    try {
      const contrastIssues = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, label');
        const issues: string[] = [];
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Einfache Kontrast-Prüfung (vereinfacht)
          if (color && backgroundColor && 
              color !== backgroundColor && 
              color !== 'rgba(0, 0, 0, 0)' && 
              backgroundColor !== 'rgba(0, 0, 0, 0)') {
            issues.push(`${el.tagName}: ${color} on ${backgroundColor}`);
          }
        });
        
        return issues.slice(0, 10); // Limitiere auf 10 Issues
      });

      if (contrastIssues.length > 0) {
        result.colorContrastIssues = contrastIssues;
        result.warnings.push(`${contrastIssues.length} potential color contrast issues found`);
      }
    } catch (error) {
      if (options.verbose) {
        console.log(`Color contrast test failed: ${error}`);
      }
    }
  }

  // 🆕 Focus Management Test
  private async testFocusManagement(page: Page, result: AccessibilityResult, options: TestOptions): Promise<void> {
    try {
      const focusIssues = await page.evaluate(() => {
        const issues: string[] = [];
        
        // Prüfe auf focus-visible
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        focusableElements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.outline === 'none' && 
              style.border === 'none' && 
              !el.classList.contains('focus-visible') &&
              !el.classList.contains('focus')) {
            issues.push(`Element without focus indicator: ${el.tagName} - ${el.textContent?.trim().substring(0, 30) || 'no text'}`);
          }
        });
        
        return issues.slice(0, 10); // Limitiere auf 10 Issues
      });

      if (focusIssues.length > 0) {
        result.focusManagementIssues = focusIssues;
        result.warnings.push(`${focusIssues.length} focus management issues found`);
      }
    } catch (error) {
      if (options.verbose) {
        console.log(`Focus management test failed: ${error}`);
      }
    }
  }

  // 🆕 Screenshot-Funktionalität
  private async captureScreenshots(page: Page, url: string, result: AccessibilityResult, options: TestOptions): Promise<void> {
    try {
      // Screenshots-Ordner erstellen
      const screenshotsDir = './screenshots';
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(url).hostname.replace(/\./g, '-');
      
      // Desktop Screenshot
      const desktopPath = path.join(screenshotsDir, `${domain}-desktop-${timestamp}.png`);
      await page.screenshot({
        path: desktopPath,
        fullPage: true
      });
      result.screenshots = { desktop: desktopPath };

      // Mobile Screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      const mobilePath = path.join(screenshotsDir, `${domain}-mobile-${timestamp}.png`);
      await page.screenshot({
        path: mobilePath,
        fullPage: true
      });
      result.screenshots.mobile = mobilePath;
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
      if (options.verbose) {
        console.log(`Screenshot capture failed: ${error}`);
      }
    }
  }
}
