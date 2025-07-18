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

### Standard Pipeline (Empfohlen)

```bash
# Vollständige Pipeline mit Markdown-Output
node bin/standard-pipeline.js https://example.com/sitemap.xml

# Schnelle Pipeline nur mit Markdown-Output
node bin/standard-pipeline.js https://example.com/sitemap.xml --quick

# Mit benutzerdefinierten Optionen
node bin/standard-pipeline.js https://example.com/sitemap.xml \
  --max-pages 50 \
  --pa11y-standard WCAG2AAA \
  --output-dir ./reports
```

### Basic CLI Usage

```bash
# Test all pages from the sitemap
a11y-test https://example.com/sitemap.xml

# Or with npm
npm start -- https://example.com/sitemap.xml
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
| `-o, --output <format>` | Output format (console\|json\|html) | `console` |
| `--output-file <file>` | Output file | - |
| `--pa11y-standard <standard>` | pa11y Standard (WCAG2A\|WCAG2AA\|WCAG2AAA\|Section508) | `WCAG2AA` |

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

### Standard Pipeline Output

Die Standard-Pipeline generiert automatisch **Markdown-Output-Dateien**:

#### **Markdown (Für Menschen)**
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

**Vorteile:**
- Strukturierte Berichte mit Tabellen
- Zusammenfassung und Empfehlungen
- Einfach lesbar und teilbar
- Perfekt für Dokumentation und Berichte

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