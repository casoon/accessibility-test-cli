export interface Pa11yIssue {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'notice';
  selector?: string;
  context?: string;
  impact?: string;
  help?: string;
  helpUrl?: string;
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
  performanceMetrics?: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  keyboardNavigation?: string[];
  colorContrastIssues?: string[];
  focusManagementIssues?: string[];
  screenshots?: {
    desktop?: string;
    mobile?: string;
  };
  consoleErrors?: string[];
  networkErrors?: string[];
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
  hideElements?: string;
  includeNotices?: boolean;
  includeWarnings?: boolean;
  includePasses?: boolean;
  runners?: string[];
  wait?: number;
  chromeLaunchConfig?: any;
  captureScreenshots?: boolean;
  testKeyboardNavigation?: boolean;
  testColorContrast?: boolean;
  testFocusManagement?: boolean;
  collectPerformanceMetrics?: boolean;
  blockImages?: boolean;
  blockCSS?: boolean;
  mobileEmulation?: boolean;
  viewportSize?: { width: number; height: number };
  userAgent?: string;
  // 🆕 Queue-Optionen
  forceNewQueue?: boolean;
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
