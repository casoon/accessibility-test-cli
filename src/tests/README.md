# Accessibility Test Suite

This test suite provides a structured and extensible architecture for accessibility testing.

## 📁 Directory Structure

```
src/tests/
├── base-test.ts              # Base test class and interfaces
├── test-manager.ts           # Test manager for coordination
├── index.ts                  # Export all tests
├── README.md                 # This documentation
├── form/                     # Form tests
│   └── form-label-test.ts
├── keyboard/                 # Keyboard navigation tests
│   └── keyboard-navigation-test.ts
├── aria/                     # ARIA tests
│   └── aria-landmarks-test.ts
├── semantic/                 # Semantic HTML tests
│   └── semantic-html-test.ts
├── media/                    # Media accessibility tests
│   └── media-accessibility-test.ts
├── language/                 # Language & i18n tests (planned)
├── performance/              # Performance tests (planned)
└── validation/               # Validation tests (planned)
```

## 🧪 Available Tests

### Form Tests
- **FormLabelTest**: Checks form labels and associations
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Inputs without labels
  - Labels without for attributes
  - Selects and textareas without labels

### Keyboard Tests
- **KeyboardNavigationTest**: Checks keyboard navigation
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Focusable elements
  - Focus indicators
  - Skip links
  - Tabindex management

### ARIA Tests
- **AriaLandmarksTest**: Checks ARIA landmarks and roles
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Main landmark
  - Navigation landmarks
  - ARIA labels
  - Invalid ARIA attributes

### Semantic HTML Tests
- **SemanticHtmlTest**: Checks semantic HTML structure
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Heading hierarchy
  - Semantic elements
  - Lists and tables
  - Definition lists

### Media Tests
- **MediaAccessibilityTest**: Checks media accessibility
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Images with alt text
  - Videos with captions
  - Audio with transcripts
  - Iframes with titles

## 🚀 Usage

### Using TestManager

```typescript
import { TestManager } from './tests';

const testManager = new TestManager();

// Run all tests
const result = await testManager.runAllTests(context);

// Run tests by category
const formResults = await testManager.runTestsByCategory(context, ['form']);

// Run tests by priority
const criticalResults = await testManager.runTestsByPriority(context, ['critical']);

// Run tests by standard
const wcagResults = await testManager.runTestsByStandard(context, ['WCAG 2.1 AA']);
```

### Creating a New Test

```typescript
import { BaseAccessibilityTest, TestContext, TestResult } from './tests';

export class MyCustomTest extends BaseAccessibilityTest {
  name = 'My Custom Test';
  description = 'Description of what this test does';
  category = 'custom';
  priority = 'high';
  standards = ['WCAG 2.1 AA', 'WCAG 2.2 AA'];

  async run(context: TestContext): Promise<TestResult> {
    const { page } = context;
    
    try {
      const result = await this.evaluateOnPage(page, () => {
        // Test logic here
        return { issues: [], warnings: [] };
      });

      return this.createResult(true, 0, result.issues, result.warnings);
    } catch (error) {
      return this.createErrorResult(`Test failed: ${error}`);
    }
  }
}
```

## 📊 Test Categories

- **form**: Form accessibility
- **keyboard**: Keyboard navigation
- **aria**: ARIA landmarks and roles
- **semantic**: Semantic HTML
- **media**: Media accessibility
- **language**: Language & internationalization
- **performance**: Performance & loading
- **validation**: Error handling & validation

## 🎯 Supported Standards

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines 2.1 Level AA
- **WCAG 2.2 AA**: Web Content Accessibility Guidelines 2.2 Level AA
- **Section 508**: Rehabilitation Act Section 508 Standards

## ⚡ Test Priorities

- **critical**: Critical accessibility errors
- **high**: Important accessibility issues
- **medium**: Moderate accessibility issues
- **low**: Minor accessibility issues

## 🔧 Extension

To add new tests:

1. Create a new file in the appropriate category folder
2. Extend `BaseAccessibilityTest`
3. Implement the required methods
4. Register the test in `TestManager`
5. Export the test in `index.ts`

## 📈 Metrics

Each test returns detailed metrics:

- **passed**: Test successful
- **count**: Number of issues found
- **errors**: Critical errors
- **warnings**: Warnings
- **details**: Additional information

## 🎯 Goals

- **No Duplication**: Each test has a specific responsibility
- **Extensible**: Easy addition of new tests
- **Structured**: Clear categorization and prioritization
- **Maintainable**: Modular architecture
- **Performant**: Efficient test execution 