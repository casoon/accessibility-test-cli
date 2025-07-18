import { SitemapParser } from './sitemap-parser';
import { AccessibilityChecker } from './accessibility-checker';
import { OutputGenerator } from './output-generator';
import { TestOptions, TestSummary } from './types';
import * as path from 'path';

export interface StandardPipelineOptions {
  sitemapUrl: string;
  maxPages?: number;
  timeout?: number;
  pa11yStandard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
  outputDir?: string;
  includeDetails?: boolean;
  includePa11yIssues?: boolean;
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
    
    // Tests ausführen
    const testOptions: TestOptions = {
      maxPages: options.maxPages || 20,
      timeout: options.timeout || 10000,
      waitUntil: 'domcontentloaded',
      pa11yStandard: options.pa11yStandard || 'WCAG2AA'
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
    
    // Output-Dateien generieren
    const outputGenerator = new OutputGenerator();
    const outputFiles: string[] = [];
    
    // JSON für KI-Verarbeitung (Standard)
    const jsonOutputPath = path.join(outputDir, `accessibility-report-${timestamp}.json`);
    await outputGenerator.generateOutput(summary, {
      format: 'json',
      outputFile: jsonOutputPath,
      includeDetails: options.includeDetails || true,
      includePa11yIssues: options.includePa11yIssues || true,
      summaryOnly: false
    });
    outputFiles.push(jsonOutputPath);
    
    // Markdown für Menschen
    const mdOutputPath = path.join(outputDir, `accessibility-report-${timestamp}.md`);
    await outputGenerator.generateOutput(summary, {
      format: 'markdown',
      outputFile: mdOutputPath,
      includeDetails: options.includeDetails || true,
      includePa11yIssues: options.includePa11yIssues || false,
      summaryOnly: false
    });
    outputFiles.push(mdOutputPath);
    
    // CSV für Tabellenkalkulation
    const csvOutputPath = path.join(outputDir, `accessibility-report-${timestamp}.csv`);
    await outputGenerator.generateOutput(summary, {
      format: 'csv',
      outputFile: csvOutputPath,
      includeDetails: false,
      includePa11yIssues: false,
      summaryOnly: false
    });
    outputFiles.push(csvOutputPath);
    
    // HTML für Browser
    const htmlOutputPath = path.join(outputDir, `accessibility-report-${timestamp}.html`);
    await outputGenerator.generateOutput(summary, {
      format: 'html',
      outputFile: htmlOutputPath,
      includeDetails: options.includeDetails || true,
      includePa11yIssues: options.includePa11yIssues || false,
      summaryOnly: false
    });
    outputFiles.push(htmlOutputPath);
    
    return { summary, outputFiles };
  }
  
  /**
   * Führt eine schnelle Pipeline nur mit JSON-Output aus
   */
  async runQuick(options: StandardPipelineOptions): Promise<{
    summary: TestSummary;
    jsonFile: string;
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
      pa11yStandard: options.pa11yStandard || 'WCAG2AA'
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
    
    // Nur JSON-Output generieren
    const outputGenerator = new OutputGenerator();
    const jsonFile = `accessibility-report-${timestamp}.json`;
    
    await outputGenerator.generateOutput(summary, {
      format: 'json',
      outputFile: jsonFile,
      includeDetails: true,
      includePa11yIssues: true,
      summaryOnly: false
    });
    
    return { summary, jsonFile };
  }
} 