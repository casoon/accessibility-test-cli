import { TestSummary, AccessibilityResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface OutputOptions {
  format: 'json' | 'csv' | 'markdown' | 'html';
  outputFile?: string;
  includeDetails?: boolean;
  includePa11yIssues?: boolean;
  summaryOnly?: boolean;
}

export class OutputGenerator {
  
  /**
   * Generiert eine KI-freundliche Output-Datei
   */
  async generateOutput(summary: TestSummary, options: OutputOptions): Promise<string> {
    const timestamp = new Date().toISOString();
    const outputData = this.prepareOutputData(summary, timestamp, options);
    
    let content: string;
    let filename: string;
    
    switch (options.format) {
      case 'json':
        content = this.generateJSON(outputData, options);
        filename = options.outputFile || `accessibility-report-${Date.now()}.json`;
        break;
      case 'csv':
        content = this.generateCSV(outputData, options);
        filename = options.outputFile || `accessibility-report-${Date.now()}.csv`;
        break;
      case 'markdown':
        content = this.generateMarkdown(outputData, options);
        filename = options.outputFile || `accessibility-report-${Date.now()}.md`;
        break;
      case 'html':
        content = this.generateHTML(outputData, options);
        filename = options.outputFile || `accessibility-report-${Date.now()}.html`;
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
    
    // Datei schreiben
    const outputPath = path.resolve(filename);
    fs.writeFileSync(outputPath, content, 'utf8');
    
    return outputPath;
  }
  
  private prepareOutputData(summary: TestSummary, timestamp: string, options: OutputOptions) {
    return {
      metadata: {
        timestamp,
        tool: '@casoon/accessibility-test-cli',
        version: '1.0.1',
        totalPages: summary.totalPages,
        testedPages: summary.testedPages,
        passedPages: summary.passedPages,
        failedPages: summary.failedPages,
        totalErrors: summary.totalErrors,
        totalWarnings: summary.totalWarnings,
        totalDuration: summary.totalDuration,
        successRate: summary.testedPages > 0 ? (summary.passedPages / summary.testedPages * 100).toFixed(2) + '%' : '0%'
      },
      summary: {
        overall: summary.passedPages === summary.testedPages ? 'PASSED' : 'FAILED',
        score: summary.testedPages > 0 ? Math.round((summary.passedPages / summary.testedPages) * 100) : 0,
        criticalIssues: summary.totalErrors,
        warnings: summary.totalWarnings,
        averageLoadTime: summary.testedPages > 0 ? Math.round(summary.totalDuration / summary.testedPages) : 0
      },
      pages: options.summaryOnly ? [] : summary.results.map(result => ({
        url: result.url,
        title: result.title,
        status: result.passed ? 'PASSED' : 'FAILED',
        loadTime: result.duration,
        errors: result.errors.length,
        warnings: result.warnings.length,
        issues: options.includeDetails ? {
          imagesWithoutAlt: result.imagesWithoutAlt,
          buttonsWithoutLabel: result.buttonsWithoutLabel,
          headingsCount: result.headingsCount,
          pa11yIssues: options.includePa11yIssues ? result.pa11yIssues : undefined
        } : undefined,
        errorDetails: options.includeDetails ? result.errors : undefined,
        warningDetails: options.includeDetails ? result.warnings : undefined
      })),
      recommendations: this.generateRecommendations(summary)
    };
  }
  
  private generateJSON(data: any, options: OutputOptions): string {
    return JSON.stringify(data, null, 2);
  }
  
  private generateCSV(data: any, options: OutputOptions): string {
    const lines: string[] = [];
    
    // Header
    lines.push('URL,Title,Status,LoadTime,Errors,Warnings,ImagesWithoutAlt,ButtonsWithoutLabel,HeadingsCount');
    
    // Data rows
    data.pages.forEach((page: any) => {
      const issues = page.issues || {};
      lines.push([
        page.url,
        `"${page.title}"`,
        page.status,
        page.loadTime,
        page.errors,
        page.warnings,
        issues.imagesWithoutAlt || 0,
        issues.buttonsWithoutLabel || 0,
        issues.headingsCount || 0
      ].join(','));
    });
    
    return lines.join('\n');
  }
  
  private generateMarkdown(data: any, options: OutputOptions): string {
    const lines: string[] = [];
    
    // Header
    lines.push('# Accessibility Test Report');
    lines.push(`Generated: ${data.metadata.timestamp}`);
    lines.push('');
    
    // Summary
    lines.push('## Summary');
    lines.push(`- **Overall Status**: ${data.summary.overall}`);
    lines.push(`- **Success Rate**: ${data.metadata.successRate}`);
    lines.push(`- **Score**: ${data.summary.score}/100`);
    lines.push(`- **Critical Issues**: ${data.summary.criticalIssues}`);
    lines.push(`- **Warnings**: ${data.summary.warnings}`);
    lines.push(`- **Average Load Time**: ${data.summary.averageLoadTime}ms`);
    lines.push('');
    
    // Pages
    if (data.pages.length > 0) {
      lines.push('## Page Results');
      lines.push('');
      lines.push('| URL | Title | Status | Load Time | Errors | Warnings |');
      lines.push('|-----|-------|--------|-----------|--------|----------|');
      
      data.pages.forEach((page: any) => {
        lines.push(`| ${page.url} | ${page.title} | ${page.status} | ${page.loadTime}ms | ${page.errors} | ${page.warnings} |`);
      });
      lines.push('');
    }
    
    // Recommendations
    if (data.recommendations.length > 0) {
      lines.push('## Recommendations');
      lines.push('');
      data.recommendations.forEach((rec: string) => {
        lines.push(`- ${rec}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  private generateHTML(data: any, options: OutputOptions): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .passed { color: green; }
        .failed { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Accessibility Test Report</h1>
    <p>Generated: ${data.metadata.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Overall Status:</strong> <span class="${data.summary.overall === 'PASSED' ? 'passed' : 'failed'}">${data.summary.overall}</span></p>
        <p><strong>Success Rate:</strong> ${data.metadata.successRate}</p>
        <p><strong>Score:</strong> ${data.summary.score}/100</p>
        <p><strong>Critical Issues:</strong> ${data.summary.criticalIssues}</p>
        <p><strong>Warnings:</strong> ${data.summary.warnings}</p>
    </div>
    
    ${data.pages.length > 0 ? `
    <h2>Page Results</h2>
    <table>
        <tr>
            <th>URL</th>
            <th>Title</th>
            <th>Status</th>
            <th>Load Time</th>
            <th>Errors</th>
            <th>Warnings</th>
        </tr>
        ${data.pages.map((page: any) => `
        <tr>
            <td>${page.url}</td>
            <td>${page.title}</td>
            <td class="${page.status === 'PASSED' ? 'passed' : 'failed'}">${page.status}</td>
            <td>${page.loadTime}ms</td>
            <td>${page.errors}</td>
            <td>${page.warnings}</td>
        </tr>
        `).join('')}
    </table>
    ` : ''}
    
    ${data.recommendations.length > 0 ? `
    <h2>Recommendations</h2>
    <ul>
        ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
    </ul>
    ` : ''}
</body>
</html>`;
  }
  
  private generateRecommendations(summary: TestSummary): string[] {
    const recommendations: string[] = [];
    
    if (summary.totalErrors > 0) {
      recommendations.push(`Fix ${summary.totalErrors} critical accessibility errors to meet WCAG standards.`);
    }
    
    if (summary.totalWarnings > 0) {
      recommendations.push(`Address ${summary.totalWarnings} accessibility warnings to improve user experience.`);
    }
    
    if (summary.failedPages > 0) {
      recommendations.push(`Review and fix issues on ${summary.failedPages} pages that failed accessibility tests.`);
    }
    
    const successRate = summary.testedPages > 0 ? (summary.passedPages / summary.testedPages) * 100 : 0;
    if (successRate < 80) {
      recommendations.push(`Improve overall accessibility score (currently ${successRate.toFixed(1)}%) to reach at least 80%.`);
    }
    
    if (summary.totalDuration > 30000) {
      recommendations.push(`Optimize page load times - average load time is ${Math.round(summary.totalDuration / summary.testedPages)}ms.`);
    }
    
    return recommendations;
  }
} 