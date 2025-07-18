#!/usr/bin/env node

const { Command } = require('commander');
const { StandardPipeline } = require('../dist/core/standard-pipeline');
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
  .option('--standard <standard>', 'Accessibility standard (WCAG2A|WCAG2AA|WCAG2AAA|Section508)')
  .option('--include-details', 'Include detailed information in output')
  .option('--include-pa11y', 'Include pa11y issues in output')
  .option('--pa11y-standard <standard>', 'Pa11y standard (WCAG2A|WCAG2AA|WCAG2AAA|Section508)', 'WCAG2AA')
  .option('--hide-elements <selectors>', 'CSS selectors to hide from pa11y tests')
  .option('--include-notices', 'Include pa11y notices in output')
  .option('--include-warnings', 'Include pa11y warnings in output', true)
  .option('--pa11y-wait <ms>', 'Wait time after page load for pa11y tests', '1000')
  .option('--performance-metrics', 'Collect performance metrics')
  .option('--screenshots', 'Capture desktop and mobile screenshots')
  .option('--keyboard-tests', 'Test keyboard navigation')
  .option('--color-contrast', 'Test color contrast (simplified)')
  .option('--focus-management', 'Test focus management')
  .option('--block-images', 'Block images for faster testing')
  .option('--block-css', 'Block CSS for faster testing')
  .option('--mobile-emulation', 'Enable mobile emulation')
  .option('--viewport <size>', 'Set viewport size (e.g., 1920x1080)')
  .option('--user-agent <agent>', 'Set custom user agent (default: a11y-test/1.0)')
  .option('--no-markdown', 'Disable automatic markdown output')
  .option('--output-dir <dir>', 'Output directory for markdown file', './reports')
  .option('--force-new-queue', 'Force creation of new queue (ignore existing queue)')
  .option('--detailed-report', 'Generate detailed error report for automated fixes')
  .option('--performance-report', 'Generate performance report with PageSpeed/Lightspeed analysis')
  .option('--seo-report', 'Generate SEO report with search engine optimization analysis')
  .action(async (sitemapUrl, options) => {
    console.log('🚀 Starting Accessibility Test...');
    console.log(`📄 Sitemap: ${sitemapUrl}`);
    
    // Interactive prompts for all options if not specified
    let maxPages = options.maxPages;
    let standard = options.standard;
    let generateDetailedReport = options.detailedReport;
    let generatePerformanceReport = options.performanceReport;
    let generateSeoReport = options.seoReport;
    
    // Set default standard if not provided
    if (!standard) {
      standard = 'WCAG2AA';
    }
    
    if (!maxPages || !generateDetailedReport || !generatePerformanceReport || !generateSeoReport) {
      const maxPagesChoices = [
        { name: '5 pages (Quick test)', value: 5 },
        { name: '10 pages (Standard test)', value: 10 },
        { name: '20 pages (Comprehensive test)', value: 20 },
        { name: '50 pages (Full audit)', value: 50 },
        { name: '100 pages (Complete analysis)', value: 100 },
        { name: 'All pages (Maximum coverage)', value: 1000 }
      ];
      
      const standardChoices = [
        { name: 'WCAG 2.0 Level A (Basic)', value: 'WCAG2A' },
        { name: 'WCAG 2.0 Level AA (Recommended)', value: 'WCAG2AA' },
        { name: 'WCAG 2.0 Level AAA (Strict)', value: 'WCAG2AAA' },
        { name: 'Section 508 (US Federal)', value: 'Section508' }
      ];
      
      const prompts = [];
      
      if (!maxPages) {
        prompts.push({
          type: 'list',
          name: 'maxPages',
          message: 'How many pages would you like to test?',
          choices: maxPagesChoices,
          default: 20
        });
      }
      
      // Always ask for standard (since we removed the default from CLI option)
      prompts.push({
        type: 'list',
        name: 'standard',
        message: 'Which accessibility standard would you like to test against?',
        choices: standardChoices,
        default: standard
      });
      
      if (!generateDetailedReport) {
        prompts.push({
          type: 'confirm',
          name: 'generateDetailedReport',
          message: 'Would you like to generate a detailed error report for automated fixes?',
          default: true
        });
      }
      
      if (!generatePerformanceReport) {
        prompts.push({
          type: 'confirm',
          name: 'generatePerformanceReport',
          message: 'Would you like to generate a performance report with PageSpeed/Lightspeed analysis?',
          default: true
        });
      }
      
      if (!generateSeoReport) {
        prompts.push({
          type: 'confirm',
          name: 'generateSeoReport',
          message: 'Would you like to generate an SEO report with search engine optimization analysis?',
          default: true
        });
      }
      
      const answers = await inquirer.prompt(prompts);
      
      maxPages = maxPages || answers.maxPages;
      standard = answers.standard; // Always use the selected standard
      generateDetailedReport = generateDetailedReport || answers.generateDetailedReport;
      generatePerformanceReport = generatePerformanceReport || answers.generatePerformanceReport;
      generateSeoReport = generateSeoReport || answers.generateSeoReport;
      
      if (maxPages) maxPages = parseInt(maxPages);
    } else {
      maxPages = parseInt(maxPages);
    }
    
    console.log(`🧪 Max Pages: ${maxPages}`);
    console.log(`⏱️  Timeout: ${options.timeout}ms`);
    console.log(`📋 Standard: ${standard}`);
    console.log(`📋 Detailed Report: ${generateDetailedReport ? 'Yes' : 'No'}`);
    console.log(`📋 Performance Report: ${generatePerformanceReport ? 'Yes' : 'No'}`);
    console.log(`📋 SEO Report: ${generateSeoReport ? 'Yes' : 'No'}`);
    
    try {
      // Extract domain for filename
      const domain = new URL(sitemapUrl).hostname.replace(/\./g, '-');
      const timestamp = new Date().toISOString().split('T')[0]; // Date-only for overwritable files
      const filename = `${domain}-accessibility-report-${timestamp}.md`;
      
      // Create output directory if it doesn't exist
      const fs = require('fs');
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }
      
      const outputPath = path.join(options.outputDir, filename);
      
      // Run standard pipeline
      const pipeline = new StandardPipeline();
      // Parse viewport size if provided
      let viewportSize;
      if (options.viewport) {
        const [width, height] = options.viewport.split('x').map(Number);
        if (width && height) {
          viewportSize = { width, height };
        }
      }

      const pipelineOptions = {
        sitemapUrl,
        maxPages: maxPages,
        timeout: parseInt(options.timeout),
        pa11yStandard: standard,
        outputDir: options.outputDir,
        includeDetails: options.includeDetails,
        includePa11yIssues: options.includePa11y,
        generateDetailedReport: generateDetailedReport,
        generatePerformanceReport: generatePerformanceReport,
        generateSeoReport: generateSeoReport,
        hideElements: options.hideElements,
        includeNotices: options.includeNotices,
        includeWarnings: options.includeWarnings,
        wait: parseInt(options.pa11yWait),
        // 🆕 Neue Playwright-Optionen
        collectPerformanceMetrics: options.performanceMetrics || generatePerformanceReport,
        captureScreenshots: options.screenshots,
        testKeyboardNavigation: options.keyboardTests,
        testColorContrast: options.colorContrast,
        testFocusManagement: options.focusManagement,
        blockImages: options.blockImages,
        blockCSS: options.blockCSS,
        mobileEmulation: options.mobileEmulation,
        viewportSize,
        userAgent: options.userAgent,
        // 🆕 Queue-Optionen
        forceNewQueue: options.forceNewQueue
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
        
        // Zeige alle generierten Dateien an
        if (outputFiles.length > 0) {
          console.log(`📁 Generated files:`);
          outputFiles.forEach(file => {
            const filename = path.basename(file);
            if (filename.includes('detailed-errors')) {
              console.log(`   📋 Detailed Error Report: ${file}`);
            } else if (filename.includes('performance-report')) {
              console.log(`   📊 Performance Report: ${file}`);
            } else if (filename.includes('seo-report')) {
              console.log(`   🔍 SEO Report: ${file}`);
            } else if (filename.includes('seo-report')) {
              console.log(`   🔍 SEO Report: ${file}`);
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
        
        // Zeige alle generierten Dateien an (auch ohne Markdown)
        if (outputFiles.length > 0) {
          console.log(`📁 Generated files:`);
          outputFiles.forEach(file => {
            const filename = path.basename(file);
            if (filename.includes('detailed-errors')) {
              console.log(`   📋 Detailed Error Report: ${file}`);
            } else if (filename.includes('performance-report')) {
              console.log(`   📊 Performance Report: ${file}`);
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