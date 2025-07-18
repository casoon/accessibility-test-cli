#!/usr/bin/env node

const { Command } = require('commander');
const { StandardPipeline } = require('../dist/standard-pipeline');
const inquirer = require('inquirer').default;
const path = require('path');

const program = new Command();

program
  .name('a11y-test')
  .description('CLI tool for automated accessibility tests based on sitemap')
  .version('1.0.1');

program
  .argument('<sitemap-url>', 'URL to sitemap.xml')
  .option('-m, --max-pages <number>', 'Maximum number of pages to test (will prompt if not specified)')
  .option('-t, --timeout <number>', 'Timeout in milliseconds', '10000')
  .option('-w, --wait-until <string>', 'Wait until (domcontentloaded|load|networkidle)', 'domcontentloaded')
  .option('-f, --filter <patterns>', 'Exclude URL patterns (comma-separated)', '[...slug],[category],/demo/')
  .option('-i, --include <patterns>', 'Include URL patterns (comma-separated)')
  .option('-v, --verbose', 'Verbose output')
  .option('--standard <standard>', 'Accessibility standard (WCAG2A|WCAG2AA|WCAG2AAA|Section508)', 'WCAG2AA')
  .option('--include-details', 'Include detailed information in output')
  .option('--include-pa11y', 'Include pa11y issues in output')
  .option('--no-markdown', 'Disable automatic markdown output')
  .option('--output-dir <dir>', 'Output directory for markdown file', './reports')
  .option('--detailed-report', 'Generate detailed error report for automated fixes')
  .action(async (sitemapUrl, options) => {
    console.log('🚀 Starting Accessibility Test...');
    console.log(`📄 Sitemap: ${sitemapUrl}`);
    
    // Interactive prompt for max-pages if not specified
    let maxPages = options.maxPages;
    if (!maxPages) {
      const maxPagesChoices = [
        { name: '5 pages (Quick test)', value: 5 },
        { name: '10 pages (Standard test)', value: 10 },
        { name: '20 pages (Comprehensive test)', value: 20 },
        { name: '50 pages (Full audit)', value: 50 },
        { name: '100 pages (Complete analysis)', value: 100 },
        { name: 'All pages (Maximum coverage)', value: 1000 }
      ];
      
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'maxPages',
          message: 'How many pages would you like to test?',
          choices: maxPagesChoices,
          default: 20
        }
      ]);
      
      maxPages = answer.maxPages;
    } else {
      maxPages = parseInt(maxPages);
    }
    
    // Interactive prompt for accessibility standard if not specified
    let standard = options.standard;
    if (!standard) {
      const standardChoices = [
        { name: 'WCAG 2.0 Level A (Basic)', value: 'WCAG2A' },
        { name: 'WCAG 2.0 Level AA (Recommended)', value: 'WCAG2AA' },
        { name: 'WCAG 2.0 Level AAA (Strict)', value: 'WCAG2AAA' },
        { name: 'Section 508 (US Federal)', value: 'Section508' }
      ];
      
      const standardAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'standard',
          message: 'Which accessibility standard would you like to test against?',
          choices: standardChoices,
          default: 'WCAG2AA'
        }
      ]);
      
      standard = standardAnswer.standard;
    }
    
    console.log(`🧪 Max Pages: ${maxPages}`);
    console.log(`⏱️  Timeout: ${options.timeout}ms`);
    console.log(`📋 Standard: ${standard}`);
    
    try {
      // Extract domain for filename
      const domain = new URL(sitemapUrl).hostname.replace(/\./g, '-');
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `${domain}-accessibility-report-${timestamp}.md`;
      
      // Create output directory if it doesn't exist
      const fs = require('fs');
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }
      
      const outputPath = path.join(options.outputDir, filename);
      
      // Run standard pipeline
      const pipeline = new StandardPipeline();
      const pipelineOptions = {
        sitemapUrl,
        maxPages: maxPages,
        timeout: parseInt(options.timeout),
        pa11yStandard: standard,
        outputDir: options.outputDir,
        includeDetails: options.includeDetails,
        includePa11yIssues: options.includePa11y,
        generateDetailedReport: options.detailedReport
      };
      
      console.log('🧪 Running accessibility tests...');
      const { summary, outputFiles } = await pipeline.run(pipelineOptions);
      
      // Rename the output file to use domain-based naming
      if (outputFiles.length > 0 && options.markdown !== false) {
        const originalFile = outputFiles[0];
        fs.renameSync(originalFile, outputPath);
        
        console.log('');
        console.log('✅ Test completed successfully!');
        console.log(`📊 Results:`);
        console.log(`   - Pages tested: ${summary.testedPages}`);
        console.log(`   - Passed: ${summary.passedPages}`);
        console.log(`   - Failed: ${summary.failedPages}`);
        console.log(`   - Errors: ${summary.totalErrors}`);
        console.log(`   - Warnings: ${summary.totalWarnings}`);
        console.log(`   - Success rate: ${summary.testedPages > 0 ? (summary.passedPages / summary.testedPages * 100).toFixed(1) : 0}%`);
        console.log(`📄 Markdown report: ${outputPath}`);
        
        // Interaktive Abfrage für Detailed Report wenn Fehler gefunden wurden
        if (summary.totalErrors > 0 && !options.detailedReport) {
          console.log('');
          console.log(`🔍 ${summary.totalErrors} accessibility errors found.`);
          
          const detailedReportAnswer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'generateDetailedReport',
              message: 'Would you like to generate a detailed error report for automated fixes?',
              default: true
            }
          ]);
          
          if (detailedReportAnswer.generateDetailedReport) {
            console.log('📋 Generating detailed error report...');
            
            // Detailed Report generieren
            const detailedPipelineOptions = {
              ...pipelineOptions,
              generateDetailedReport: true
            };
            
            const { outputFiles: detailedOutputFiles } = await pipeline.run(detailedPipelineOptions);
            
            // Nur die neue Detailed Report Datei anzeigen
            const detailedReportFile = detailedOutputFiles.find(file => 
              path.basename(file).includes('detailed-errors')
            );
            
            if (detailedReportFile) {
              console.log(`📋 Detailed Error Report: ${detailedReportFile}`);
            }
          }
        } else if (options.detailedReport) {
          // Wenn Detailed Report bereits generiert wurde
          console.log(`📁 Generated files:`);
          outputFiles.forEach(file => {
            const filename = path.basename(file);
            if (filename.includes('detailed-errors')) {
              console.log(`   📋 Detailed Error Report: ${file}`);
            } else {
              console.log(`   📄 Markdown Report: ${file}`);
            }
          });
        }
        
        if (summary.failedPages > 0) {
          console.log(`⚠️  ${summary.failedPages} pages failed accessibility tests`);
          process.exit(1);
        }
      } else {
        console.log('');
        console.log('✅ Test completed successfully!');
        console.log(`📊 Results:`);
        console.log(`   - Pages tested: ${summary.testedPages}`);
        console.log(`   - Passed: ${summary.passedPages}`);
        console.log(`   - Failed: ${summary.failedPages}`);
        console.log(`   - Errors: ${summary.totalErrors}`);
        console.log(`   - Warnings: ${summary.totalWarnings}`);
        
        // Interaktive Abfrage für Detailed Report wenn Fehler gefunden wurden (auch ohne Markdown)
        if (summary.totalErrors > 0 && !options.detailedReport) {
          console.log('');
          console.log(`🔍 ${summary.totalErrors} accessibility errors found.`);
          
          const detailedReportAnswer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'generateDetailedReport',
              message: 'Would you like to generate a detailed error report for automated fixes?',
              default: true
            }
          ]);
          
          if (detailedReportAnswer.generateDetailedReport) {
            console.log('📋 Generating detailed error report...');
            
            // Detailed Report generieren
            const detailedPipelineOptions = {
              ...pipelineOptions,
              generateDetailedReport: true
            };
            
            const { outputFiles: detailedOutputFiles } = await pipeline.run(detailedPipelineOptions);
            
            // Nur die neue Detailed Report Datei anzeigen
            const detailedReportFile = detailedOutputFiles.find(file => 
              path.basename(file).includes('detailed-errors')
            );
            
            if (detailedReportFile) {
              console.log(`📋 Detailed Error Report: ${detailedReportFile}`);
            }
          }
        } else if (options.detailedReport && outputFiles.length > 0) {
          // Wenn Detailed Report bereits generiert wurde
          console.log(`📁 Generated files:`);
          outputFiles.forEach(file => {
            const filename = path.basename(file);
            if (filename.includes('detailed-errors')) {
              console.log(`   📋 Detailed Error Report: ${file}`);
            }
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error during test:', error.message);
      process.exit(1);
    }
  });

program.parse(); 