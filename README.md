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

### Basic Usage

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

## 🧪 Accessibility Checks

The tool performs the following accessibility checks:

- **Page Title**: Checks if a title is present
- **Alt Attributes**: Counts images without alt attribute
- **Button Labels**: Counts buttons without aria-label
- **Heading Hierarchy**: Checks if headings are present

## 📊 Output

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