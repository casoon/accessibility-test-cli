import { TestSummary, AccessibilityResult, Pa11yIssue } from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface DetailedReportOptions {
  outputDir?: string;
  includeContext?: boolean;
  includeRecommendations?: boolean;
  groupByType?: boolean;
  includeCodeExamples?: boolean;
}

export class DetailedReportGenerator {
  
  /**
   * Generiert einen detaillierten Fehlerbericht
   */
  async generateDetailedReport(summary: TestSummary, options: DetailedReportOptions = {}): Promise<string> {
    const timestamp = new Date().toISOString();
    const outputDir = options.outputDir || './reports';
    const domain = this.extractDomainFromResults(summary.results);
    const filename = `${domain}-detailed-errors-${timestamp.split('T')[0]}.md`;
    const outputPath = path.join(outputDir, filename);
    
    // Erstelle Output-Verzeichnis falls nicht vorhanden
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const content = this.generateDetailedReportContent(summary, timestamp, options);
    fs.writeFileSync(outputPath, content, 'utf8');
    
    return outputPath;
  }
  
  private extractDomainFromResults(results: AccessibilityResult[]): string {
    if (results.length === 0) return 'unknown';
    try {
      const url = new URL(results[0].url);
      return url.hostname.replace(/\./g, '-');
    } catch {
      return 'unknown';
    }
  }
  
  private generateDetailedReportContent(summary: TestSummary, timestamp: string, options: DetailedReportOptions): string {
    const lines: string[] = [];
    
    // Header
    lines.push('# Detailed Accessibility Error Report');
    lines.push(`Generated: ${timestamp}`);
    lines.push(`Total Errors: ${summary.totalErrors}`);
    lines.push(`Total Warnings: ${summary.totalWarnings}`);
    lines.push(`Failed Pages: ${summary.failedPages}`);
    lines.push('');
    
    // Executive Summary
    lines.push('## Executive Summary');
    lines.push('');
    lines.push('This report contains structured accessibility errors that can be automatically fixed by AI tools.');
    lines.push(`- **Critical Issues**: ${summary.totalErrors} errors requiring immediate attention`);
    lines.push(`- **Warnings**: ${summary.totalWarnings} issues for improvement`);
    lines.push(`- **Pages with Issues**: ${summary.failedPages} out of ${summary.testedPages} tested`);
    lines.push(`- **Success Rate**: ${summary.testedPages > 0 ? (summary.passedPages / summary.testedPages * 100).toFixed(1) : 0}%`);
    lines.push('');
    
    // Gruppierte Fehler nach Typ
    if (options.groupByType !== false) {
      lines.push('## Errors Grouped by Type');
      lines.push('');
      
      const errorGroups = this.groupErrorsByType(summary.results);
      
      for (const [errorType, errors] of Object.entries(errorGroups)) {
        lines.push(`### ${errorType} (${errors.length} occurrences)`);
        lines.push('');
        
        errors.forEach((error, index) => {
          lines.push(`#### Error ${index + 1}: ${error.title}`);
          lines.push(`- **URL**: ${error.url}`);
          lines.push(`- **Error**: ${error.message}`);
          if (error.selector && options.includeContext !== false) {
            lines.push(`- **Element**: \`${error.selector}\``);
          }
          if (error.context && options.includeContext !== false) {
            lines.push(`- **Context**: \`${error.context}\``);
          }
          if (error.recommendation && options.includeRecommendations !== false) {
            lines.push(`- **AI Fix**: ${error.recommendation}`);
          }
          lines.push('');
        });
      }
    }
    
    // Detaillierte Fehlerliste
    lines.push('## Detailed Error List');
    lines.push('');
    
    const allErrors = this.extractAllErrors(summary.results);
    
    allErrors.forEach((error, index) => {
      lines.push(`### Error ${index + 1}`);
      lines.push(`- **Page**: ${error.url}`);
      lines.push(`- **Title**: ${error.title}`);
      lines.push(`- **Type**: ${error.type}`);
      lines.push(`- **Code**: ${error.code}`);
      lines.push(`- **Message**: ${error.message}`);
      
      if (error.selector) {
        lines.push(`- **Selector**: \`${error.selector}\``);
      }
      
      if (error.context) {
        lines.push(`- **Context**: \`${error.context}\``);
      }
      
      if (options.includeCodeExamples !== false) {
        const codeExample = this.generateCodeExample(error);
        if (codeExample) {
          lines.push(`- **Code Example**:`);
          lines.push('```html');
          lines.push(codeExample);
          lines.push('```');
        }
      }
      
              if (options.includeRecommendations !== false) {
          const recommendation = this.generateRecommendation(error);
          if (recommendation) {
            lines.push(`- **Recommendation**: ${recommendation}`);
          }
        }
      
      lines.push('');
    });
    
    // Verarbeitungsanweisungen
    lines.push('## Processing Instructions');
    lines.push('');
    lines.push('This report is structured for automated tools to fix accessibility issues:');
    lines.push('');
    lines.push('1. **Parse each error** using the structured format above');
    lines.push('2. **Identify the element** using the provided selector');
    lines.push('3. **Apply the recommended fix** based on the error type');
    lines.push('4. **Test the fix** to ensure it resolves the issue');
    lines.push('5. **Update the code** with the corrected version');
    lines.push('');
    lines.push('### Common Fix Patterns:');
    lines.push('- **Missing alt attributes**: Add descriptive alt text to images');
    lines.push('- **Missing aria-labels**: Add aria-label or aria-labelledby to interactive elements');
    lines.push('- **Color contrast**: Adjust text/background colors for better contrast');
    lines.push('- **Heading structure**: Ensure proper heading hierarchy (h1, h2, h3, etc.)');
    lines.push('- **Form labels**: Associate form controls with their labels');
    lines.push('- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible');
    lines.push('');
    
    // Prioritätsliste
    lines.push('## Priority List');
    lines.push('');
    lines.push('Process errors in this order for maximum impact:');
    lines.push('');
    
    const priorityErrors = this.getPriorityErrors(allErrors);
    priorityErrors.forEach((error, index) => {
      lines.push(`${index + 1}. **${error.type}** - ${error.message} (${error.url})`);
    });
    
    return lines.join('\n');
  }
  
  private groupErrorsByType(results: AccessibilityResult[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    results.forEach(result => {
      // Playwright-Fehler
      result.errors.forEach(error => {
        const type = this.categorizeError(error);
        if (!groups[type]) groups[type] = [];
        groups[type].push({
          url: result.url,
          title: result.title,
          message: error,
          type: type,
          selector: null,
          context: null
        });
      });
      
      // pa11y-Fehler
      if (result.pa11yIssues) {
        result.pa11yIssues.forEach(issue => {
          const type = this.categorizePa11yIssue(issue);
          if (!groups[type]) groups[type] = [];
          groups[type].push({
            url: result.url,
            title: result.title,
            message: issue.message,
            type: type,
            code: issue.code,
            selector: issue.selector,
            context: issue.context
          });
        });
      }
    });
    
    return groups;
  }
  
  private extractAllErrors(results: AccessibilityResult[]): any[] {
    const allErrors: any[] = [];
    
    results.forEach(result => {
      // Playwright-Fehler
      result.errors.forEach(error => {
        allErrors.push({
          url: result.url,
          title: result.title,
          message: error,
          type: this.categorizeError(error),
          code: 'PLAYWRIGHT_ERROR',
          selector: null,
          context: null
        });
      });
      
      // pa11y-Fehler
      if (result.pa11yIssues) {
        result.pa11yIssues.forEach(issue => {
          allErrors.push({
            url: result.url,
            title: result.title,
            message: issue.message,
            type: this.categorizePa11yIssue(issue),
            code: issue.code,
            selector: issue.selector,
            context: issue.context
          });
        });
      }
    });
    
    return allErrors;
  }
  
  private categorizeError(error: string): string {
    if (error.includes('alt')) return 'Missing Alt Attributes';
    if (error.includes('aria-label')) return 'Missing ARIA Labels';
    if (error.includes('heading')) return 'Heading Structure Issues';
    if (error.includes('title')) return 'Missing Page Title';
    return 'General Accessibility Issue';
  }
  
  private categorizePa11yIssue(issue: Pa11yIssue): string {
    const code = issue.code.toLowerCase();
    
    if (code.includes('alt')) return 'Missing Alt Attributes';
    if (code.includes('aria')) return 'ARIA Issues';
    if (code.includes('color') || code.includes('contrast')) return 'Color Contrast Issues';
    if (code.includes('heading')) return 'Heading Structure Issues';
    if (code.includes('label')) return 'Form Label Issues';
    if (code.includes('keyboard')) return 'Keyboard Navigation Issues';
    if (code.includes('focus')) return 'Focus Management Issues';
    
    return 'WCAG Compliance Issue';
  }
  
  private generateCodeExample(error: any): string | null {
    if (!error.selector) return null;
    
    switch (error.type) {
      case 'Missing Alt Attributes':
        return `<img src="image.jpg" alt="Descriptive text about the image">`;
      case 'Missing ARIA Labels':
        return `<button aria-label="Submit form">Submit</button>`;
      case 'Heading Structure Issues':
        return `<h1>Main Heading</h1>\n<h2>Sub Heading</h2>\n<h3>Section Heading</h3>`;
      case 'Color Contrast Issues':
        return `<p style="color: #000; background-color: #fff;">High contrast text</p>`;
      case 'Form Label Issues':
        return `<label for="email">Email:</label>\n<input type="email" id="email" name="email">`;
      default:
        return null;
    }
  }
  
  private generateRecommendation(error: any): string | null {
    switch (error.type) {
      case 'Missing Alt Attributes':
        return 'Add descriptive alt text to all images that convey information';
      case 'Missing ARIA Labels':
        return 'Add aria-label or aria-labelledby attributes to interactive elements without visible text';
      case 'Heading Structure Issues':
        return 'Ensure proper heading hierarchy: h1 for main title, h2 for sections, h3 for subsections';
      case 'Color Contrast Issues':
        return 'Increase color contrast ratio to at least 4.5:1 for normal text, 3:1 for large text';
      case 'Form Label Issues':
        return 'Associate form controls with their labels using for/id attributes or aria-labelledby';
      case 'Keyboard Navigation Issues':
        return 'Ensure all interactive elements are accessible via keyboard navigation';
      default:
        return 'Review WCAG guidelines for this specific error type';
    }
  }
  
  private getPriorityErrors(errors: any[]): any[] {
    // Sortiere Fehler nach Priorität
    const priorityOrder = [
      'Missing Alt Attributes',
      'Missing ARIA Labels', 
      'Heading Structure Issues',
      'Color Contrast Issues',
      'Form Label Issues',
      'Keyboard Navigation Issues',
      'WCAG Compliance Issue',
      'General Accessibility Issue'
    ];
    
    return errors.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.type);
      const bIndex = priorityOrder.indexOf(b.type);
      return aIndex - bIndex;
    });
  }
} 