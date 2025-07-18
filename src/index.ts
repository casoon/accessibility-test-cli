#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { SitemapParser } from "./sitemap-parser";
import { AccessibilityChecker } from "./accessibility-checker";
import { TestOptions, TestSummary } from "./types";

const program = new Command();

program
  .name("a11y-test")
  .description(
    "CLI-Tool für automatische Accessibility-Tests basierend auf Sitemap",
  )
  .version("1.0.0");

program
  .argument("<sitemap-url>", "URL zur sitemap.xml")
  .option(
    "-m, --max-pages <number>",
    "Maximale Anzahl zu testender Seiten",
    "20",
  )
  .option("-t, --timeout <number>", "Timeout in Millisekunden", "10000")
  .option(
    "-w, --wait-until <string>",
    "Warten bis (domcontentloaded|load|networkidle)",
    "domcontentloaded",
  )
  .option(
    "-f, --filter <patterns>",
    "Auszuschließende URL-Muster (kommagetrennt)",
    "[...slug],[category],/demo/",
  )
  .option(
    "-i, --include <patterns>",
    "Einzuschließende URL-Muster (kommagetrennt)",
  )
  .option("-v, --verbose", "Detaillierte Ausgabe")
  .option(
    "-o, --output <format>",
    "Ausgabeformat (console|json|html)",
    "console",
  )
  .option("--output-file <file>", "Ausgabedatei")
  .option(
    "--pa11y-standard <standard>",
    "pa11y Standard (WCAG2A|WCAG2AA|WCAG2AAA|Section508)",
    "WCAG2AA"
  )
  .action(async (sitemapUrl: string, options: any) => {
    const spinner = ora("Initialisiere Accessibility-Tests...").start();

    try {
      // Parser initialisieren
      const parser = new SitemapParser();
      spinner.text = "Lade Sitemap...";

      // Sitemap parsen
      const urls = await parser.parseSitemap(sitemapUrl);
      spinner.text = `Sitemap geladen: ${urls.length} URLs gefunden`;

      // URLs filtern
      const filterPatterns = options.filter
        ? options.filter.split(",")
        : ["[...slug]", "[category]", "/demo/"];
      const includePatterns = options.include
        ? options.include.split(",")
        : undefined;

      const filteredUrls = parser.filterUrls(urls, {
        filterPatterns,
        includePatterns,
      });
      spinner.text = `URLs gefiltert: ${filteredUrls.length} URLs zum Testen`;

      // URLs zu lokalen URLs konvertieren (falls nötig)
      const baseUrl = new URL(sitemapUrl).origin;
      const localUrls = parser.convertToLocalUrls(filteredUrls, baseUrl);

      // Accessibility-Checker initialisieren
      const checker = new AccessibilityChecker();
      await checker.initialize();

      spinner.text = "Führe Accessibility-Tests aus...";

      // Tests ausführen
      const testOptions: TestOptions = {
        maxPages: parseInt(options.maxPages),
        timeout: parseInt(options.timeout),
        waitUntil: options.waitUntil,
        verbose: options.verbose,
        pa11yStandard: options.pa11yStandard,
      };

      const results = await checker.testMultiplePages(
        localUrls.map((url) => url.loc),
        testOptions,
      );

      // Zusammenfassung erstellen
      const summary: TestSummary = {
        totalPages: localUrls.length,
        testedPages: results.length,
        passedPages: results.filter((r) => r.passed).length,
        failedPages: results.filter((r) => !r.passed).length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
        totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
        results,
      };

      await checker.cleanup();

      // Ergebnisse ausgeben
      spinner.succeed("Tests abgeschlossen!");
      displayResults(summary, options);
    } catch (error) {
      spinner.fail(`Fehler: ${error}`);
      process.exit(1);
    }
  });

function displayResults(summary: TestSummary, options: any): void {
  console.log("\n" + chalk.bold.blue("🎯 Accessibility Test Zusammenfassung"));
  console.log(chalk.gray("─".repeat(50)));

  console.log(`📄 Gesamtseiten: ${summary.totalPages}`);
  console.log(`🧪 Getestete Seiten: ${summary.testedPages}`);
  console.log(`✅ Bestanden: ${chalk.green(summary.passedPages)}`);
  console.log(`❌ Fehlgeschlagen: ${chalk.red(summary.failedPages)}`);
  console.log(`⚠️  Warnungen: ${chalk.yellow(summary.totalWarnings)}`);
  console.log(`⏱️  Gesamtdauer: ${summary.totalDuration}ms`);

  if (options.verbose) {
    console.log("\n" + chalk.bold("📋 Detaillierte Ergebnisse:"));
    summary.results.forEach((result) => {
      const status = result.passed ? chalk.green("✅") : chalk.red("❌");
      console.log(`${status} ${result.url}`);
      console.log(`   Titel: ${result.title}`);
      console.log(`   Dauer: ${result.duration}ms`);

      if (result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          console.log(`   ⚠️  ${warning}`);
        });
      }

      if (result.errors.length > 0) {
        result.errors.forEach((error) => {
          console.log(`   ❌ ${error}`);
        });
      }
    });
  }

  if (summary.failedPages > 0) {
    process.exit(1);
  }
}

program.parse();
