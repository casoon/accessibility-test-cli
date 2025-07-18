# Accessibility Test CLI

Ein CLI-Tool für automatische Accessibility-Tests basierend auf Sitemap-URLs.

## 🚀 Installation

```bash
# Dependencies installieren
npm install

# TypeScript kompilieren
npm run build

# CLI global installieren (optional)
npm link
```

## 📖 Verwendung

### Grundlegende Verwendung

```bash
# Teste alle Seiten aus der Sitemap
a11y-test https://example.com/sitemap.xml

# Oder mit npm
npm start -- https://example.com/sitemap.xml
```

### Erweiterte Optionen

```bash
# Maximale Anzahl zu testender Seiten
a11y-test https://example.com/sitemap.xml --max-pages 10

# Timeout anpassen
a11y-test https://example.com/sitemap.xml --timeout 15000

# Detaillierte Ausgabe
a11y-test https://example.com/sitemap.xml --verbose

# URL-Muster filtern
a11y-test https://example.com/sitemap.xml \
  --filter "demo,test,admin" \
  --include "blog,leistungen"
```

## ⚙️ Optionen

| Option | Beschreibung | Standard |
|--------|-------------|----------|
| `-m, --max-pages <number>` | Maximale Anzahl zu testender Seiten | `5` |
| `-t, --timeout <number>` | Timeout in Millisekunden | `10000` |
| `-w, --wait-until <string>` | Warten bis (domcontentloaded\|load\|networkidle) | `domcontentloaded` |
| `-f, --filter <patterns>` | Auszuschließende URL-Muster (kommagetrennt) | `[...slug],[category],/demo/` |
| `-i, --include <patterns>` | Einzuschließende URL-Muster (kommagetrennt) | - |
| `-v, --verbose` | Detaillierte Ausgabe | `false` |
| `-o, --output <format>` | Ausgabeformat (console\|json\|html) | `console` |
| `--output-file <file>` | Ausgabedatei | - |

## 🧪 Accessibility-Checks

Das Tool führt folgende Accessibility-Tests durch:

- **Seitentitel**: Prüft ob ein Titel vorhanden ist
- **Alt-Attribute**: Zählt Bilder ohne alt-Attribut
- **Button-Labels**: Zählt Buttons ohne aria-label
- **Überschriften-Hierarchie**: Prüft ob Überschriften vorhanden sind

## 📊 Ausgabe

### Console-Ausgabe
```
🎯 Accessibility Test Zusammenfassung
──────────────────────────────────────────────────
📄 Gesamtseiten: 113
🧪 Getestete Seiten: 5
✅ Bestanden: 4
❌ Fehlgeschlagen: 1
⚠️  Warnungen: 3
⏱️  Gesamtdauer: 2345ms
```

### Detaillierte Ausgabe (--verbose)
```
📋 Detaillierte Ergebnisse:
✅ https://example.com/
   Titel: Homepage
   Dauer: 456ms
   ⚠️  2 buttons without aria-label

❌ https://example.com/error-page
   Titel: Error Page
   Dauer: 123ms
   ❌ No headings found
```

## 🔧 Entwicklung

```bash
# Entwicklungsserver starten
npm run dev

# TypeScript kompilieren
npm run build

# Code formatieren
npm run format

# Linting
npm run lint
```

## 📁 Projektstruktur

```
accessibility-test-cli/
├── src/
│   ├── index.ts              # Haupt-Einstiegspunkt
│   ├── sitemap-parser.ts     # Sitemap-Parsing-Logik
│   ├── accessibility-checker.ts # Playwright-Tests
│   └── types.ts              # TypeScript-Typen
├── bin/
│   └── a11y-test.js          # CLI-Einstiegspunkt
├── dist/                     # Kompilierte Dateien
└── package.json
```

## 🤝 Beitragen

1. Fork erstellen
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details. 