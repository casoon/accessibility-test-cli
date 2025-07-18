import { SitemapParser } from '../parsers';
import { AccessibilityChecker } from './accessibility-checker';
import { OutputGenerator } from '../generators';
import { DetailedReportGenerator, PerformanceReportGenerator, SeoReportGenerator } from '../reports';
import { TestOptions, TestSummary } from '../types';
import * as path from 'path';

export interface StandardPipelineOptions {
  sitemapUrl: string;
  maxPages?: number;
  timeout?: number;
  pa11yStandard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
  outputDir?: string;
  includeDetails?: boolean;
  includePa11yIssues?: boolean;
  generateDetailedReport?: boolean;
  generatePerformanceReport?: boolean;
  generateSeoReport?: boolean;
  hideElements?: string;
  includeNotices?: boolean;
  includeWarnings?: boolean;
  wait?: number;
  // 🆕 Neue Playwright-Optionen
  collectPerformanceMetrics?: boolean;
  captureScreenshots?: boolean;
  testKeyboardNavigation?: boolean;
  testColorContrast?: boolean;
  testFocusManagement?: boolean;
  blockImages?: boolean;
  blockCSS?: boolean;
  mobileEmulation?: boolean;
  viewportSize?: { width: number; height: number };
  userAgent?: string;
}

export class StandardPipeline {
  
  /**
   * Führt die Standard-Pipeline aus und erstellt KI-freundliche Output-Dateien
   */
  async run(options: StandardPipelineOptions): Promise<{
    summary: TestSummary;
    outputFiles: string[];
  }> {
    const outputDir = options.outputDir || './accessibility-reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Parser initialisieren
    const parser = new SitemapParser();
    
    // Sitemap parsen
    const urls = await parser.parseSitemap(options.sitemapUrl);
    console.log(`📄 Sitemap geladen: ${urls.length} URLs gefunden`);
    
    // URLs filtern
    const filterPatterns = ['[...slug]', '[category]', '/demo/'];
    const filteredUrls = parser.filterUrls(urls, { filterPatterns });
    console.log(`🔍 URLs gefiltert: ${filteredUrls.length} URLs zum Testen`);
    
    // URLs zu lokalen URLs konvertieren
    const baseUrl = new URL(options.sitemapUrl).origin;
    const localUrls = parser.convertToLocalUrls(filteredUrls, baseUrl);
    
    // Accessibility-Checker initialisieren
    const checker = new AccessibilityChecker();
    await checker.initialize();
    
    console.log('🧪 Führe Accessibility-Tests aus...');
    console.log(`   📊 Collecting performance metrics: ${options.collectPerformanceMetrics ? 'Yes' : 'No'}`);
    console.log(`   📸 Capturing screenshots: ${options.captureScreenshots ? 'Yes' : 'No'}`);
    console.log(`   ⌨️  Testing keyboard navigation: ${options.testKeyboardNavigation ? 'Yes' : 'No'}`);
    console.log(`   🎨 Testing color contrast: ${options.testColorContrast ? 'Yes' : 'No'}`);
    console.log(`   🎯 Testing focus management: ${options.testFocusManagement ? 'Yes' : 'No'}`);
    
    // Tests ausführen
    const testOptions: TestOptions = {
      maxPages: options.maxPages || 20,
      timeout: options.timeout || 10000,
      waitUntil: 'domcontentloaded',
      pa11yStandard: options.pa11yStandard || 'WCAG2AA',
      hideElements: options.hideElements,
      includeNotices: options.includeNotices,
      includeWarnings: options.includeWarnings,
      wait: options.wait,
      // 🆕 Neue Playwright-Optionen
      collectPerformanceMetrics: options.collectPerformanceMetrics,
      captureScreenshots: options.captureScreenshots,
      testKeyboardNavigation: options.testKeyboardNavigation,
      testColorContrast: options.testColorContrast,
      testFocusManagement: options.testFocusManagement,
      blockImages: options.blockImages,
      blockCSS: options.blockCSS,
      mobileEmulation: options.mobileEmulation,
      viewportSize: options.viewportSize,
      userAgent: options.userAgent
    };
    
    const results = await checker.testMultiplePages(
      localUrls.map(url => url.loc),
      testOptions
    );
    
    console.log('\n📋 Creating test summary...');
    
    // Zusammenfassung erstellen
    const summary: TestSummary = {
      totalPages: localUrls.length,
      testedPages: results.length,
      passedPages: results.filter(r => r.passed).length,
      failedPages: results.filter(r => !r.passed).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      results
    };
    
    await checker.cleanup();
    
    console.log('📄 Generating output files...');
    
    // Output-Dateien generieren
    const outputGenerator = new OutputGenerator();
    const outputFiles: string[] = [];
    
    // Markdown für Menschen (Standard)
    const mdOutputPath = path.join(outputDir, `accessibility-report-${timestamp}.md`);
    await outputGenerator.generateOutput(summary, {
      format: 'markdown',
      outputFile: mdOutputPath,
      includeDetails: options.includeDetails || true,
      includePa11yIssues: options.includePa11yIssues || false,
      summaryOnly: false
    });
    outputFiles.push(mdOutputPath);
    
    // Detailed-Report generieren (falls gewünscht)
    if (options.generateDetailedReport !== false && summary.totalErrors > 0) {
      console.log('   📋 Generating detailed error report...');
      const detailedReportGenerator = new DetailedReportGenerator();
      const detailedReportPath = await detailedReportGenerator.generateDetailedReport(summary, {
        outputDir: options.outputDir,
        includeContext: true,
        includeRecommendations: true,
        groupByType: true,
        includeCodeExamples: true
      });
      outputFiles.push(detailedReportPath);
    }
    
    // Performance-Report generieren (falls gewünscht)
    if (options.generatePerformanceReport !== false && options.collectPerformanceMetrics) {
      console.log('   📊 Generating performance report...');
      const performanceReportGenerator = new PerformanceReportGenerator();
      const performanceReportPath = await performanceReportGenerator.generatePerformanceReport(summary, {
        outputDir: options.outputDir,
        includeRecommendations: true,
        includePageDetails: true,
        includeCoreWebVitals: true,
        includeResourceAnalysis: true
      });
      outputFiles.push(performanceReportPath);
    }
    
    // SEO-Report generieren (falls gewünscht)
    if (options.generateSeoReport !== false) {
      console.log('   🔍 Generating SEO report...');
      const seoReportGenerator = new SeoReportGenerator();
      const seoReportPath = await seoReportGenerator.generateSeoReport(summary, {
        outputDir: options.outputDir,
        includeRecommendations: true,
        includePageDetails: true,
        includeTechnicalAnalysis: true,
        includeContentAnalysis: true
      });
      outputFiles.push(seoReportPath);
    }
    
    return { summary, outputFiles };
  }
  
  /**
   * Führt eine schnelle Pipeline nur mit Markdown-Output aus
   */
  async runQuick(options: StandardPipelineOptions): Promise<{
    summary: TestSummary;
    markdownFile: string;
  }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Parser initialisieren
    const parser = new SitemapParser();
    
    // Sitemap parsen
    const urls = await parser.parseSitemap(options.sitemapUrl);
    
    // URLs filtern
    const filterPatterns = ['[...slug]', '[category]', '/demo/'];
    const filteredUrls = parser.filterUrls(urls, { filterPatterns });
    
    // URLs zu lokalen URLs konvertieren
    const baseUrl = new URL(options.sitemapUrl).origin;
    const localUrls = parser.convertToLocalUrls(filteredUrls, baseUrl);
    
    // Accessibility-Checker initialisieren
    const checker = new AccessibilityChecker();
    await checker.initialize();
    
    // Tests ausführen
    const testOptions: TestOptions = {
      maxPages: options.maxPages || 10,
      timeout: options.timeout || 10000,
      waitUntil: 'domcontentloaded',
      pa11yStandard: options.pa11yStandard || 'WCAG2AA',
      hideElements: options.hideElements,
      includeNotices: options.includeNotices,
      includeWarnings: options.includeWarnings,
      wait: options.wait,
      // 🆕 Neue Playwright-Optionen
      collectPerformanceMetrics: options.collectPerformanceMetrics,
      captureScreenshots: options.captureScreenshots,
      testKeyboardNavigation: options.testKeyboardNavigation,
      testColorContrast: options.testColorContrast,
      testFocusManagement: options.testFocusManagement,
      blockImages: options.blockImages,
      blockCSS: options.blockCSS,
      mobileEmulation: options.mobileEmulation,
      viewportSize: options.viewportSize,
      userAgent: options.userAgent
    };
    
    const results = await checker.testMultiplePages(
      localUrls.map(url => url.loc),
      testOptions
    );
    
    // Zusammenfassung erstellen
    const summary: TestSummary = {
      totalPages: localUrls.length,
      testedPages: results.length,
      passedPages: results.filter(r => r.passed).length,
      failedPages: results.filter(r => !r.passed).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      results
    };
    
    await checker.cleanup();
    
    // Nur Markdown-Output generieren
    const outputGenerator = new OutputGenerator();
    const markdownFile = `accessibility-report-${timestamp}.md`;
    
    await outputGenerator.generateOutput(summary, {
      format: 'markdown',
      outputFile: markdownFile,
      includeDetails: true,
      includePa11yIssues: false,
      summaryOnly: false
    });
    
    return { summary, markdownFile };
  }
} 