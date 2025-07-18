export interface Pa11yIssue {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'notice';
  selector?: string;
  context?: string;
}

export interface AccessibilityResult {
  url: string;
  title: string;
  imagesWithoutAlt: number;
  buttonsWithoutLabel: number;
  headingsCount: number;
  errors: string[];
  warnings: string[];
  passed: boolean;
  duration: number;
  pa11yIssues?: Pa11yIssue[];
  pa11yScore?: number;
}

export interface TestOptions {
  maxPages?: number;
  timeout?: number;
  waitUntil?: "domcontentloaded" | "load" | "networkidle";
  filterPatterns?: string[];
  includePatterns?: string[];
  verbose?: boolean;
  output?: "console" | "json" | "html";
  outputFile?: string;
  pa11yStandard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
}

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface TestSummary {
  totalPages: number;
  testedPages: number;
  passedPages: number;
  failedPages: number;
  totalErrors: number;
  totalWarnings: number;
  totalDuration: number;
  results: AccessibilityResult[];
}
