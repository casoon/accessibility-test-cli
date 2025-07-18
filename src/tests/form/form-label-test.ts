import { BaseAccessibilityTest, TestContext, TestResult } from '../base-test';

export class FormLabelTest extends BaseAccessibilityTest {
  name = 'Form Label Association';
  description = 'Check if form controls have proper label associations';
  category = 'form';
  priority = 'critical';
  standards = ['WCAG 2.1 AA', 'WCAG 2.2 AA', 'Section 508'];

  async run(context: TestContext): Promise<TestResult> {
    const { page } = context;
    
    try {
      const result = await this.evaluateOnPage(page, () => {
        const issues: string[] = [];
        const warnings: string[] = [];
        let totalIssues = 0;

        // Check inputs without labels
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"])');
        inputs.forEach((input: Element) => {
          const inputElement = input as HTMLInputElement;
          const hasLabel = inputElement.labels && inputElement.labels.length > 0;
          const hasAriaLabel = inputElement.hasAttribute('aria-label');
          const hasAriaLabelledBy = inputElement.hasAttribute('aria-labelledby');
          const hasPlaceholder = inputElement.hasAttribute('placeholder');
          
          if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder) {
            totalIssues++;
            issues.push(`Input without label: ${inputElement.outerHTML}`);
          }
        });

        // Check labels without for attribute
        const labels = document.querySelectorAll('label');
        labels.forEach((label: Element) => {
          const labelElement = label as HTMLLabelElement;
          if (!labelElement.hasAttribute('for') && !labelElement.querySelector('input, select, textarea')) {
            totalIssues++;
            warnings.push(`Label without for attribute or nested control: ${labelElement.outerHTML}`);
          }
        });

        // Check selects without labels
        const selects = document.querySelectorAll('select');
        selects.forEach((select: Element) => {
          const selectElement = select as HTMLSelectElement;
          const hasLabel = selectElement.labels && selectElement.labels.length > 0;
          const hasAriaLabel = selectElement.hasAttribute('aria-label');
          const hasAriaLabelledBy = selectElement.hasAttribute('aria-labelledby');
          
          if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
            totalIssues++;
            issues.push(`Select without label: ${selectElement.outerHTML}`);
          }
        });

        // Check textareas without labels
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach((textarea: Element) => {
          const textareaElement = textarea as HTMLTextAreaElement;
          const hasLabel = textareaElement.labels && textareaElement.labels.length > 0;
          const hasAriaLabel = textareaElement.hasAttribute('aria-label');
          const hasAriaLabelledBy = textareaElement.hasAttribute('aria-labelledby');
          const hasPlaceholder = textareaElement.hasAttribute('placeholder');
          
          if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder) {
            totalIssues++;
            issues.push(`Textarea without label: ${textareaElement.outerHTML}`);
          }
        });

        return {
          totalIssues,
          issues,
          warnings
        };
      });

      return this.createResult(
        result.totalIssues === 0,
        result.totalIssues,
        result.issues,
        result.warnings,
        { category: 'form-labels' }
      );

    } catch (error) {
      return this.createErrorResult(`Form label test failed: ${error}`);
    }
  }
} 