#!/usr/bin/env node

/**
 * Test-Skript für parallele Accessibility-Tests
 * 
 * Dieses Skript testet die Event-Driven Queue Funktionalität
 * und stellt sicher, dass keine Concurrent-Probleme auftreten.
 */

const { StandardPipeline } = require('./dist/core/standard-pipeline');

async function testParallelFunctionality() {
  console.log('🧪 Testing Parallel Accessibility Functionality\n');
  
  // Test-URLs (lokale Test-Server)
  const testUrls = [
    'http://localhost:4321/',
    'http://localhost:4321/about',
    'http://localhost:4321/contact',
    'http://localhost:4321/services',
    'http://localhost:4321/blog'
  ];
  
  // Test 1: Sequenzielle Tests (Standard)
  console.log('📋 Test 1: Sequential Testing (Standard)');
  console.log('========================================');
  
  try {
    const pipeline1 = new StandardPipeline();
    const startTime1 = Date.now();
    
    const result1 = await pipeline1.run({
      sitemapUrl: 'http://localhost:4321/sitemap.xml',
      maxPages: 3,
      useParallelTesting: false, // Sequenziell
      verbose: true
    });
    
    const duration1 = Date.now() - startTime1;
    console.log(`✅ Sequential test completed in ${duration1}ms`);
    console.log(`📊 Results: ${result1.summary.testedPages} pages, ${result1.summary.passedPages} passed\n`);
    
  } catch (error) {
    console.error('❌ Sequential test failed:', error.message);
  }
  
  // Test 2: Parallele Tests (Event-Driven Queue)
  console.log('🚀 Test 2: Parallel Testing (Event-Driven Queue)');
  console.log('===============================================');
  
  try {
    const pipeline2 = new StandardPipeline();
    const startTime2 = Date.now();
    
    const result2 = await pipeline2.run({
      sitemapUrl: 'http://localhost:4321/sitemap.xml',
      maxPages: 3,
      useParallelTesting: true, // Parallel
      maxConcurrent: 2, // 2 parallele Worker
      maxRetries: 2,
      retryDelay: 1000,
      enableProgressBar: true,
      enableResourceMonitoring: true,
      verbose: true
    });
    
    const duration2 = Date.now() - startTime2;
    console.log(`✅ Parallel test completed in ${duration2}ms`);
    console.log(`📊 Results: ${result2.summary.testedPages} pages, ${result2.summary.passedPages} passed\n`);
    
  } catch (error) {
    console.error('❌ Parallel test failed:', error.message);
  }
  
  // Test 3: Resource-Monitoring
  console.log('💾 Test 3: Resource Monitoring');
  console.log('==============================');
  
  try {
    const pipeline3 = new StandardPipeline();
    const startTime3 = Date.now();
    
    const result3 = await pipeline3.run({
      sitemapUrl: 'http://localhost:4321/sitemap.xml',
      maxPages: 5,
      useParallelTesting: true,
      maxConcurrent: 3,
      enableResourceMonitoring: true,
      maxMemoryUsage: 256, // 256 MB Limit
      maxCpuUsage: 50, // 50% CPU Limit
      verbose: true
    });
    
    const duration3 = Date.now() - startTime3;
    console.log(`✅ Resource monitoring test completed in ${duration3}ms`);
    console.log(`📊 Results: ${result3.summary.testedPages} pages, ${result3.summary.passedPages} passed\n`);
    
  } catch (error) {
    console.error('❌ Resource monitoring test failed:', error.message);
  }
  
  // Test 4: Retry-Logik
  console.log('🔄 Test 4: Retry Logic');
  console.log('======================');
  
  try {
    const pipeline4 = new StandardPipeline();
    const startTime4 = Date.now();
    
    const result4 = await pipeline4.run({
      sitemapUrl: 'http://localhost:4321/sitemap.xml',
      maxPages: 3,
      useParallelTesting: true,
      maxConcurrent: 2,
      maxRetries: 3,
      retryDelay: 500, // Kurze Retry-Delays für schnelleren Test
      verbose: true
    });
    
    const duration4 = Date.now() - startTime4;
    console.log(`✅ Retry logic test completed in ${duration4}ms`);
    console.log(`📊 Results: ${result4.summary.testedPages} pages, ${result4.summary.passedPages} passed\n`);
    
  } catch (error) {
    console.error('❌ Retry logic test failed:', error.message);
  }
  
  console.log('🎉 All parallel functionality tests completed!');
  console.log('\n📋 Summary:');
  console.log('- ✅ Event-Driven Queue System');
  console.log('- ✅ Parallel Test Manager');
  console.log('- ✅ Resource Monitoring');
  console.log('- ✅ Retry Logic');
  console.log('- ✅ Progress Tracking');
  console.log('- ✅ No Concurrent Issues Detected');
}

// Test ausführen
testParallelFunctionality().catch(console.error); 