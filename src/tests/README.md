# Accessibility Test Suite

Diese Test-Suite bietet eine strukturierte und erweiterbare Architektur für Accessibility-Tests.

## 📁 Ordnerstruktur

```
src/tests/
├── base-test.ts              # Basis-Test-Klasse und Interfaces
├── test-manager.ts           # Test-Manager für Koordination
├── index.ts                  # Export aller Tests
├── README.md                 # Diese Dokumentation
├── form/                     # Formular-Tests
│   └── form-label-test.ts
├── keyboard/                 # Keyboard Navigation Tests
│   └── keyboard-navigation-test.ts
├── aria/                     # ARIA Tests
│   └── aria-landmarks-test.ts
├── semantic/                 # Semantic HTML Tests
│   └── semantic-html-test.ts
├── media/                    # Media Accessibility Tests
│   └── media-accessibility-test.ts
├── language/                 # Language & i18n Tests (geplant)
├── performance/              # Performance Tests (geplant)
└── validation/               # Validation Tests (geplant)
```

## 🧪 Verfügbare Tests

### Form Tests
- **FormLabelTest**: Prüft Formular-Labels und -Associations
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Inputs ohne Labels
  - Labels ohne for-Attribute
  - Selects und Textareas ohne Labels

### Keyboard Tests
- **KeyboardNavigationTest**: Prüft Keyboard Navigation
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Focusable Elements
  - Focus Indicators
  - Skip Links
  - Tabindex Management

### ARIA Tests
- **AriaLandmarksTest**: Prüft ARIA Landmarks und Rollen
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Main Landmark
  - Navigation Landmarks
  - ARIA Labels
  - Invalid ARIA Attributes

### Semantic HTML Tests
- **SemanticHtmlTest**: Prüft Semantic HTML Struktur
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Heading Hierarchy
  - Semantic Elements
  - Lists und Tables
  - Definition Lists

### Media Tests
- **MediaAccessibilityTest**: Prüft Media Accessibility
  - **Standards**: WCAG 2.1 AA, WCAG 2.2 AA, Section 508
  - Images mit Alt-Text
  - Videos mit Captions
  - Audio mit Transcripts
  - Iframes mit Titles

## 🚀 Verwendung

### TestManager verwenden

```typescript
import { TestManager } from './tests';

const testManager = new TestManager();

// Alle Tests ausführen
const result = await testManager.runAllTests(context);

// Tests nach Kategorie ausführen
const formResults = await testManager.runTestsByCategory(context, ['form']);

// Tests nach Priorität ausführen
const criticalResults = await testManager.runTestsByPriority(context, ['critical']);

// Tests nach Standard ausführen
const wcagResults = await testManager.runTestsByStandard(context, ['WCAG 2.1 AA']);
```

### Neuen Test erstellen

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
        // Test-Logik hier
        return { issues: [], warnings: [] };
      });

      return this.createResult(true, 0, result.issues, result.warnings);
    } catch (error) {
      return this.createErrorResult(`Test failed: ${error}`);
    }
  }
}
```

## 📊 Test-Kategorien

- **form**: Formular-Accessibility
- **keyboard**: Keyboard Navigation
- **aria**: ARIA Landmarks und Rollen
- **semantic**: Semantic HTML
- **media**: Media Accessibility
- **language**: Language & Internationalization
- **performance**: Performance & Loading
- **validation**: Error Handling & Validation

## 🎯 Unterstützte Standards

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines 2.1 Level AA
- **WCAG 2.2 AA**: Web Content Accessibility Guidelines 2.2 Level AA
- **Section 508**: Rehabilitation Act Section 508 Standards

## ⚡ Test-Prioritäten

- **critical**: Kritische Accessibility-Fehler
- **high**: Wichtige Accessibility-Probleme
- **medium**: Mittlere Accessibility-Probleme
- **low**: Geringe Accessibility-Probleme

## 🔧 Erweiterung

Um neue Tests hinzuzufügen:

1. Erstellen Sie eine neue Datei im entsprechenden Kategorie-Ordner
2. Erben Sie von `BaseAccessibilityTest`
3. Implementieren Sie die erforderlichen Methoden
4. Registrieren Sie den Test im `TestManager`
5. Exportieren Sie den Test in `index.ts`

## 📈 Metriken

Jeder Test liefert detaillierte Metriken zurück:

- **passed**: Test erfolgreich
- **count**: Anzahl gefundener Probleme
- **errors**: Kritische Fehler
- **warnings**: Warnungen
- **details**: Zusätzliche Informationen

## 🎯 Ziele

- **Keine Dopplungen**: Jeder Test hat eine spezifische Verantwortlichkeit
- **Erweiterbar**: Einfache Hinzufügung neuer Tests
- **Strukturiert**: Klare Kategorisierung und Priorisierung
- **Wartbar**: Modulare Architektur
- **Performant**: Effiziente Test-Ausführung 