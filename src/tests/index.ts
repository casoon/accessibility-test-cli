// Base classes and interfaces
export { BaseAccessibilityTest, TestResult, TestContext } from './base-test';
export { TestManager, TestSuiteResult } from './test-manager';

// Form tests
export { FormLabelTest } from './form/form-label-test';

// Keyboard tests
export { KeyboardNavigationTest } from './keyboard/keyboard-navigation-test';

// ARIA tests
export { AriaLandmarksTest } from './aria/aria-landmarks-test';

// Semantic HTML tests
export { SemanticHtmlTest } from './semantic/semantic-html-test';

// Media tests
export { MediaAccessibilityTest } from './media/media-accessibility-test';

// Test categories
export const TEST_CATEGORIES = {
  FORM: 'form',
  KEYBOARD: 'keyboard',
  ARIA: 'aria',
  SEMANTIC: 'semantic',
  MEDIA: 'media',
  LANGUAGE: 'language',
  PERFORMANCE: 'performance',
  VALIDATION: 'validation'
} as const;

// Test priorities
export const TEST_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const; 