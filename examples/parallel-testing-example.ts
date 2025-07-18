#!/usr/bin/env ts-node

import { ParallelTestManager, ParallelTestManagerOptions } from '../src/core/parallel-test-manager';
import { QueueStats } from '../src/core/event-driven-queue';

/**
 * Beispiel für parallele Accessibility-Tests mit Event-Driven Queue
 * 
 * Dieses Beispiel zeigt:
 * - Parallele Test-Ausführung mit konfigurierbarer Anzahl von Workern
 * - Echtzeit-Status-Reporting über Events
 * - Resource-Monitoring (Memory, CPU)
 * - Progress-Bar mit ETA
 * - Retry-Logik für fehlgeschlagene Tests
 * - Event-Callbacks für Custom-Logging
 */

async function runParallelAccessibilityTests() {
  console.log('🚀 Starting Parallel Accessibility Test Example\n');

  // Test-URLs (Beispiel)
  const testUrls = [
    'http://localhost:4321/',
    'http://localhost:4321/about',
    'http://localhost:4321/contact',
    'http://localhost:4321/services',
    'http://localhost:4321/blog',
    'http://localhost:4321/faq',
    'http://localhost:4321/privacy',
    'http://localhost:4321/terms',
    'http://localhost:4321/support',
    'http://localhost:4321/pricing'
  ];

  // Konfiguration für parallele Tests
  const options: ParallelTestManagerOptions = {
    // Queue-Konfiguration
    maxConcurrent: 3, // 3 parallele Worker
    maxRetries: 2,    // 2 Retry-Versuche bei Fehlern
    retryDelay: 2000, // 2 Sekunden zwischen Retries
    
    // Test-Optionen
    testOptions: {
      timeout: 10000,
      waitUntil: 'domcontentloaded',
      verbose: false,
      pa11yStandard: 'WCAG2AA'
    },
    
    // Progress-Reporting
    enableProgressBar: true,
    progressUpdateInterval: 1000, // 1 Sekunde
    
    // Resource-Monitoring
    enableResourceMonitoring: true,
    maxMemoryUsage: 512, // 512 MB
    maxCpuUsage: 80,     // 80%
    
    // Event-Callbacks für Custom-Logging
    onTestStart: (url: string) => {
      console.log(`🎯 Starting test: ${url}`);
    },
    
    onTestComplete: (url: string, result: any) => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      const errors = result.errors.length;
      const warnings = result.warnings.length;
      console.log(`${status} ${url} - ${errors} errors, ${warnings} warnings`);
    },
    
    onTestError: (url: string, error: string) => {
      console.log(`💥 Error testing ${url}: ${error}`);
    },
    
    onProgressUpdate: (stats: QueueStats) => {
      // Custom Progress-Logging
      console.log(`📊 Progress Update: ${stats.progress.toFixed(1)}% | Active: ${stats.activeWorkers} | Memory: ${stats.memoryUsage}MB`);
    },
    
    onQueueEmpty: () => {
      console.log('🎉 All tests completed!');
    }
  };

  // Parallel Test Manager initialisieren
  const testManager = new ParallelTestManager(options);
  
  try {
    // Manager initialisieren
    await testManager.initialize();
    
    console.log(`🧪 Testing ${testUrls.length} URLs with ${options.maxConcurrent} parallel workers\n`);
    
    // Tests starten
    const startTime = Date.now();
    const result = await testManager.runTests(testUrls);
    const totalDuration = Date.now() - startTime;
    
    // Ergebnisse ausgeben
    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📄 URLs Tested: ${result.results.length}`);
    console.log(`✅ Successful: ${result.results.filter(r => r.passed).length}`);
    console.log(`❌ Failed: ${result.results.filter(r => !r.passed).length}`);
    console.log(`💥 Errors: ${result.errors.length}`);
    
    // Detaillierte Statistiken
    console.log('\n📊 Queue Statistics:');
    console.log('===================');
    console.log(`Total: ${result.stats.total}`);
    console.log(`Completed: ${result.stats.completed}`);
    console.log(`Failed: ${result.stats.failed}`);
    console.log(`Retrying: ${result.stats.retrying}`);
    console.log(`Progress: ${result.stats.progress.toFixed(1)}%`);
    console.log(`Average Duration: ${result.stats.averageDuration}ms`);
    console.log(`Memory Usage: ${result.stats.memoryUsage}MB`);
    console.log(`CPU Usage: ${result.stats.cpuUsage}s`);
    
    // Performance-Metriken
    const avgTimePerUrl = totalDuration / testUrls.length;
    const speedup = avgTimePerUrl > 0 ? (avgTimePerUrl * testUrls.length) / totalDuration : 0;
    
    console.log('\n🚀 Performance Metrics:');
    console.log('======================');
    console.log(`Average time per URL: ${avgTimePerUrl.toFixed(0)}ms`);
    console.log(`Speedup factor: ${speedup.toFixed(1)}x`);
    console.log(`Throughput: ${(testUrls.length / (totalDuration / 1000)).toFixed(1)} URLs/second`);
    
    // Fehler-Details
    if (result.errors.length > 0) {
      console.log('\n❌ Failed URLs:');
      console.log('===============');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.url} (${error.attempts} attempts): ${error.error}`);
      });
    }
    
    // Accessibility-Ergebnisse
    const totalErrors = result.results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = result.results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    console.log('\n♿ Accessibility Summary:');
    console.log('========================');
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log(`Success Rate: ${((result.results.filter(r => r.passed).length / result.results.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    // Cleanup
    await testManager.cleanup();
  }
}

/**
 * Beispiel für Event-Listener-basierte Queue-Überwachung
 */
async function demonstrateEventListeners() {
  console.log('\n🎧 Event Listener Example\n');
  
  const testManager = new ParallelTestManager({
    maxConcurrent: 2,
    enableProgressBar: false // Custom Progress-Handling
  });
  
  await testManager.initialize();
  
  // Event-Listener für detaillierte Überwachung
  testManager['queue'].onUrlAdded((event) => {
    console.log(`📋 Event: URL added - ${event.data.url} (priority: ${event.data.priority})`);
  });
  
  testManager['queue'].onUrlStarted((event) => {
    console.log(`🚀 Event: Test started - ${event.data.url}`);
  });
  
  testManager['queue'].onUrlCompleted((event) => {
    console.log(`✅ Event: Test completed - ${event.data.url} (${event.data.duration}ms)`);
  });
  
  testManager['queue'].onUrlFailed((event) => {
    console.log(`💥 Event: Test failed - ${event.data.url} (attempt ${event.data.attempts})`);
  });
  
  testManager['queue'].onProgressUpdate((event) => {
    const stats = event.data.stats;
    console.log(`📊 Event: Progress update - ${stats.progress.toFixed(1)}% (${stats.completed}/${stats.total})`);
  });
  
  testManager['queue'].onQueueEmpty(() => {
    console.log('🎉 Event: Queue empty - all tests finished');
  });
  
  // Kurzer Test mit Event-Überwachung
  const testUrls = ['http://localhost:4321/', 'http://localhost:4321/about'];
  await testManager.runTests(testUrls);
  
  await testManager.cleanup();
}

/**
 * Beispiel für Resource-Monitoring
 */
async function demonstrateResourceMonitoring() {
  console.log('\n💾 Resource Monitoring Example\n');
  
  const testManager = new ParallelTestManager({
    maxConcurrent: 5,
    enableResourceMonitoring: true,
    maxMemoryUsage: 256, // 256 MB Limit
    maxCpuUsage: 50,     // 50% CPU Limit
    onProgressUpdate: (stats) => {
      console.log(`💾 Memory: ${stats.memoryUsage}MB | CPU: ${stats.cpuUsage}s | Workers: ${stats.activeWorkers}`);
    }
  });
  
  await testManager.initialize();
  
  // Simuliere hohe Last
  const manyUrls = Array.from({ length: 20 }, (_, i) => `http://localhost:4321/page${i}`);
  
  try {
    await testManager.runTests(manyUrls);
  } catch (error) {
    console.error('Resource limit exceeded:', error);
  } finally {
    await testManager.cleanup();
  }
}

// Hauptfunktion
async function main() {
  console.log('🎯 Parallel Accessibility Testing Examples\n');
  
  // Beispiel 1: Grundlegende parallele Tests
  await runParallelAccessibilityTests();
  
  // Beispiel 2: Event-Listener
  await demonstrateEventListeners();
  
  // Beispiel 3: Resource-Monitoring
  await demonstrateResourceMonitoring();
  
  console.log('\n🎉 All examples completed!');
}

// Nur ausführen, wenn direkt aufgerufen
if (require.main === module) {
  main().catch(console.error);
}

export { runParallelAccessibilityTests, demonstrateEventListeners, demonstrateResourceMonitoring }; 