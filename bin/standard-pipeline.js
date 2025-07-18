#!/usr/bin/env node

const { StandardPipeline } = require('../dist/standard-pipeline');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎯 Accessibility Test Standard Pipeline
=====================================

Verwendung:
  node bin/standard-pipeline.js <sitemap-url> [optionen]

Optionen:
  --max-pages <number>     Maximale Anzahl zu testender Seiten (Standard: 20)
  --timeout <number>       Timeout in Millisekunden (Standard: 10000)
  --pa11y-standard <std>   pa11y Standard (WCAG2A|WCAG2AA|WCAG2AAA|Section508)
  --output-dir <dir>       Ausgabeverzeichnis (Standard: ./accessibility-reports)
  --quick                  Schnelle Pipeline nur mit JSON-Output
  --include-details        Detaillierte Informationen in Output-Dateien
  --include-pa11y          pa11y-Issues in Output-Dateien einschließen

Beispiele:
  node bin/standard-pipeline.js https://example.com/sitemap.xml
  node bin/standard-pipeline.js https://example.com/sitemap.xml --max-pages 50 --quick
  node bin/standard-pipeline.js https://example.com/sitemap.xml --pa11y-standard WCAG2AAA

Output-Dateien:
  - JSON: Für KI-Verarbeitung (Standard)
  - Markdown: Für Menschen lesbar
  - CSV: Für Tabellenkalkulation
  - HTML: Für Browser-Anzeige
`);
    process.exit(1);
  }
  
  const sitemapUrl = args[0];
  const options = {
    sitemapUrl,
    maxPages: parseInt(getArg('--max-pages')) || 20,
    timeout: parseInt(getArg('--timeout')) || 10000,
    pa11yStandard: getArg('--pa11y-standard') || 'WCAG2AA',
    outputDir: getArg('--output-dir') || './accessibility-reports',
    includeDetails: hasArg('--include-details'),
    includePa11yIssues: hasArg('--include-pa11y')
  };
  
  const isQuick = hasArg('--quick');
  
  console.log('🚀 Starte Accessibility Test Standard Pipeline...');
  console.log(`📄 Sitemap: ${sitemapUrl}`);
  console.log(`🧪 Max Pages: ${options.maxPages}`);
  console.log(`⏱️  Timeout: ${options.timeout}ms`);
  console.log(`📋 pa11y Standard: ${options.pa11yStandard}`);
  console.log(`📁 Output Directory: ${options.outputDir}`);
  console.log(`⚡ Quick Mode: ${isQuick ? 'Ja' : 'Nein'}`);
  console.log('');
  
  try {
    const pipeline = new StandardPipeline();
    
    if (isQuick) {
      console.log('⚡ Führe schnelle Pipeline aus...');
      const { summary, jsonFile } = await pipeline.runQuick(options);
      
      console.log('');
      console.log('✅ Pipeline abgeschlossen!');
      console.log(`📊 Ergebnisse:`);
      console.log(`   - Getestete Seiten: ${summary.testedPages}`);
      console.log(`   - Bestanden: ${summary.passedPages}`);
      console.log(`   - Fehlgeschlagen: ${summary.failedPages}`);
      console.log(`   - Fehler: ${summary.totalErrors}`);
      console.log(`   - Warnungen: ${summary.totalWarnings}`);
      console.log(`📄 JSON-Output: ${jsonFile}`);
      
    } else {
      console.log('🔄 Führe vollständige Pipeline aus...');
      const { summary, outputFiles } = await pipeline.run(options);
      
      console.log('');
      console.log('✅ Pipeline abgeschlossen!');
      console.log(`📊 Ergebnisse:`);
      console.log(`   - Getestete Seiten: ${summary.testedPages}`);
      console.log(`   - Bestanden: ${summary.passedPages}`);
      console.log(`   - Fehlgeschlagen: ${summary.failedPages}`);
      console.log(`   - Fehler: ${summary.totalErrors}`);
      console.log(`   - Warnungen: ${summary.totalWarnings}`);
      console.log(`📁 Output-Dateien:`);
      outputFiles.forEach(file => console.log(`   - ${file}`));
    }
    
  } catch (error) {
    console.error('❌ Fehler in der Pipeline:', error.message);
    process.exit(1);
  }
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index !== -1 && index + 1 < process.argv.length ? process.argv[index + 1] : null;
}

function hasArg(name) {
  return process.argv.includes(name);
}

main().catch(console.error); 