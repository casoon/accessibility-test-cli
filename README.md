# Accessibility Test CLI

A CLI tool for automated accessibility tests based on sitemap URLs.

## 🚀 Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# (Optional) Install CLI globally
npm link
```

## 📖 Usage

### Simple Command (Recommended)

```bash
# Test with interactive page selection
a11y-test https://example.com/sitemap.xml

# With custom options (bypasses interactive prompt)
a11y-test https://example.com/sitemap.xml --max-pages 50 --standard WCAG2AAA

# With custom output directory
a11y-test https://example.com/sitemap.xml --output-dir ./my-reports

# Without markdown output (console only)
a11y-test https://example.com/sitemap.xml --no-markdown
```

### Interactive Mode

When you run the command without specifying `--max-pages`, you'll see an interactive dropdown:

```
🚀 Starting Accessibility Test...
📄 Sitemap: https://example.com/sitemap.xml

? How many pages would you like to test? (Use arrow keys)
❯ 20 pages (Comprehensive test)
  5 pages (Quick test)
  10 pages (Standard test)
  50 pages (Full audit)
  100 pages (Complete analysis)
  All pages (Maximum coverage)

? Which accessibility standard would you like to test against? (Use arrow keys)
❯ WCAG 2.0 Level AA (Recommended)
  WCAG 2.0 Level A (Basic)
  WCAG 2.0 Level AAA (Strict)
  Section 508 (US Federal)
```

**Page Count Options:**
- **5 pages**: Quick test for basic validation
- **10 pages**: Standard test for most use cases
- **20 pages**: Comprehensive test (default)
- **50 pages**: Full audit for important sites
- **100 pages**: Complete analysis for large sites
- **All pages**: Maximum coverage (up to 1000 pages)

**Accessibility Standards:**
- **WCAG 2.0 Level A**: Basic accessibility requirements
- **WCAG 2.0 Level AA**: Recommended standard for most websites (default)
- **WCAG 2.0 Level AAA**: Strictest accessibility requirements
- **Section 508**: US federal accessibility standards

### Advanced Options

```bash
# Maximum number of pages to test (bypasses interactive prompt)
a11y-test https://example.com/sitemap.xml --max-pages 10

# Accessibility standard (bypasses interactive prompt)
a11y-test https://example.com/sitemap.xml --standard WCAG2AAA

# Adjust timeout
a11y-test https://example.com/sitemap.xml --timeout 15000

# Verbose output
a11y-test https://example.com/sitemap.xml --verbose

# Filter URL patterns
a11y-test https://example.com/sitemap.xml \
  --filter "demo,test,admin" \
  --include "blog,services"
```

### Advanced Options

```bash
# Set maximum number of pages to test
a11y-test https://example.com/sitemap.xml --max-pages 10

# Adjust timeout
a11y-test https://example.com/sitemap.xml --timeout 15000

# Verbose output
a11y-test https://example.com/sitemap.xml --verbose

# Filter URL patterns
a11y-test https://example.com/sitemap.xml \
  --filter "demo,test,admin" \
  --include "blog,services"

# Use different pa11y standard
a11y-test https://example.com/sitemap.xml --pa11y-standard WCAG2AAA
```

## ⚙️ Options

| Option | Description | Default |
|--------|-------------|---------|
| `-m, --max-pages <number>` | Maximum number of pages to test | `5` |
| `-t, --timeout <number>` | Timeout in milliseconds | `10000` |
| `-w, --wait-until <string>` | Wait until (domcontentloaded\|load\|networkidle) | `domcontentloaded` |
| `-f, --filter <patterns>` | Exclude URL patterns (comma-separated) | `[...slug],[category],/demo/` |
| `-i, --include <patterns>` | Include URL patterns (comma-separated) | - |
| `-v, --verbose` | Verbose output | `false` |


| `--standard <standard>` | Accessibility standard (WCAG2A\|WCAG2AA\|WCAG2AAA\|Section508) | `WCAG2AA` |
| `--output-dir <dir>` | Output directory for markdown file | `./reports` |
| `--include-details` | Include detailed information in output | `false` |
| `--include-pa11y` | Include pa11y issues in output | `false` |
| `--detailed-report` | Generate detailed error report for automated fixes | `false` |

## 🧪 Accessibility Checks

The tool performs comprehensive accessibility checks using both Playwright and pa11y:

### Playwright Checks
- **Page Title**: Checks if a title is present
- **Alt Attributes**: Counts images without alt attribute
- **Button Labels**: Counts buttons without aria-label
- **Heading Hierarchy**: Checks if headings are present

### pa11y WCAG Compliance Tests
- **WCAG 2.0/2.1 Standards**: Full compliance testing (A, AA, AAA levels)
- **Section 508**: US federal accessibility standards
- **Detailed Issues**: Specific error codes and recommendations
- **Context Information**: Element selectors and context for each issue

## 📊 Output

### Automatic Markdown Output

The command automatically generates **Markdown output files** with domain-based names:

#### **Markdown (For Humans)**
```markdown
# Accessibility Test Report
Generated: 2024-01-15T10:30:00.000Z

## Summary
- **Overall Status**: FAILED
- **Success Rate**: 90.00%
- **Score**: 90/100
- **Critical Issues**: 5
- **Warnings**: 12
- **Average Load Time**: 1200ms

## Page Results

| URL | Title | Status | Load Time | Errors | Warnings |
|-----|-------|--------|-----------|--------|----------|
| https://example.com/ | Homepage | PASSED | 1200ms | 0 | 2 |
| https://example.com/about | About | FAILED | 800ms | 1 | 0 |

## Recommendations
- Fix 5 critical accessibility errors to meet WCAG standards.
- Address 12 accessibility warnings to improve user experience.
```

**Filename Format:**
```
{domain}-accessibility-report-{YYYY-MM-DD}.md
```

**Examples:**
- `example-com-accessibility-report-2024-01-15.md`
- `mywebsite-de-accessibility-report-2024-01-15.md`

**Benefits:**
- Automatic domain-based naming
- Structured reports with tables
- Summary and recommendations
- Easy to read and share
- Perfect for documentation and reports

#### **Detailed Error Report (For Automated Fixes)**
```bash
# Generate detailed error report (automatic prompt when errors found)
a11y-test https://example.com/sitemap.xml

# Force detailed error report generation
a11y-test https://example.com/sitemap.xml --detailed-report
```

**Filename Format:**
```
{domain}-detailed-errors-{YYYY-MM-DD}.md
```

**Features:**
- **Interactive Prompt**: Automatically asks if you want a detailed report when errors are found
- **Structured for Automated Processing**: Optimized format for automated tools
- **Error Categorization**: Grouped by error type (alt attributes, ARIA, contrast, etc.)
- **Code Examples**: HTML examples for each error type
- **Recommendations**: Specific fix suggestions for each error
- **Priority Ordering**: Errors sorted by impact and fix complexity
- **Context Information**: Element selectors and surrounding context
- **Processing Instructions**: Step-by-step guide for automated tools

**Example Detailed Report Structure:**
```markdown
# Detailed Accessibility Error Report

## Executive Summary
- Critical Issues: 5 errors requiring immediate attention
- Pages with Issues: 3 out of 10 tested
- Success Rate: 70.0%

## Errors Grouped by Type

### Missing Alt Attributes (3 occurrences)
#### Error 1: Homepage
- **URL**: https://example.com/
- **Error**: Images missing alt attributes
- **Element**: `img.product-image`
- **Recommendation**: Add descriptive alt text to all images that convey information

### Color Contrast Issues (2 occurrences)
#### Error 1: About Page
- **URL**: https://example.com/about
- **Error**: Insufficient color contrast
- **Element**: `.text-content`
- **Recommendation**: Increase color contrast ratio to at least 4.5:1

## Processing Instructions
1. Parse each error using the structured format above
2. Identify the element using the provided selector
3. Apply the recommended fix based on the error type
4. Test the fix to ensure it resolves the issue
5. Update the code with the corrected version
```

### Interactive Detailed Report Generation

When accessibility errors are found, the tool automatically prompts you to generate a detailed report:

```
✅ Test completed successfully!
📊 Results:
   - Pages tested: 5
   - Passed: 3
   - Failed: 2
   - Errors: 8
   - Warnings: 12
   - Success rate: 60.0%
📄 Markdown report: ./reports/example-com-accessibility-report-2024-01-15.md

🔍 8 accessibility errors found.

? Would you like to generate a detailed error report for automated fixes? (Y/n)
```

### Console Output
```
🎯 Accessibility Test Summary
──────────────────────────────────────────────────
📄 Total pages: 113
🧪 Pages tested: 5
✅ Passed: 4
❌ Failed: 1
⚠️  Warnings: 3
⏱️  Total duration: 2345ms
```

### Verbose Output (--verbose)
```
📋 Detailed Results:
✅ https://example.com/
   Title: Homepage
   Duration: 456ms
   ⚠️  2 buttons without aria-label

❌ https://example.com/error-page
   Title: Error Page
   Duration: 123ms
   ❌ No headings found
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Compile TypeScript
npm run build

# Format code
npm run format

# Linting
npm run lint
```

## 📁 Project Structure

```
accessibility-test-cli/
├── src/
│   ├── index.ts              # Main entry point
│   ├── sitemap-parser.ts     # Sitemap parsing logic
│   ├── accessibility-checker.ts # Playwright tests
│   └── types.ts              # TypeScript types
├── bin/
│   └── a11y-test.js          # CLI entry point
├── dist/                     # Compiled files
└── package.json
```

## 🤝 Contributing

1. Create a fork
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Create a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details. 