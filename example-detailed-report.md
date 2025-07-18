# Detailed Accessibility Error Report
Generated: 2024-01-15T14:30:00.000Z
Total Errors: 8
Total Warnings: 12
Failed Pages: 3

## Executive Summary

This report contains structured accessibility errors that can be automatically fixed by automated tools.
- **Critical Issues**: 8 errors requiring immediate attention
- **Warnings**: 12 issues for improvement
- **Pages with Issues**: 3 out of 10 tested
- **Success Rate**: 70.0%

## Errors Grouped by Type

### Missing Alt Attributes (4 occurrences)

#### Error 1: Homepage
- **URL**: https://example.com/
- **Error**: Images missing alt attributes
- **Element**: `img.product-image`
- **Context**: `<img src="/images/product1.jpg" class="product-image">`
- **Recommendation**: Add descriptive alt text to all images that convey information

#### Error 2: About Page
- **URL**: https://example.com/about
- **Error**: Hero image missing alt text
- **Element**: `img.hero-image`
- **Context**: `<img src="/images/about-hero.jpg" class="hero-image">`
- **Recommendation**: Add descriptive alt text to all images that convey information

#### Error 3: Services Page
- **URL**: https://example.com/services
- **Error**: Service icons missing alt attributes
- **Element**: `img.service-icon`
- **Context**: `<img src="/icons/service1.svg" class="service-icon">`
- **Recommendation**: Add descriptive alt text to all images that convey information

#### Error 4: Contact Page
- **URL**: https://example.com/contact
- **Error**: Contact form image missing alt
- **Element**: `img.contact-image`
- **Context**: `<img src="/images/contact.jpg" class="contact-image">`
- **Recommendation**: Add descriptive alt text to all images that convey information

### Color Contrast Issues (2 occurrences)

#### Error 1: About Page
- **URL**: https://example.com/about
- **Error**: Insufficient color contrast for body text
- **Element**: `.text-content`
- **Context**: `<p class="text-content" style="color: #666;">About our company...</p>`
- **Recommendation**: Increase color contrast ratio to at least 4.5:1 for normal text, 3:1 for large text

#### Error 2: Services Page
- **URL**: https://example.com/services
- **Error**: Low contrast for service descriptions
- **Element**: `.service-description`
- **Context**: `<div class="service-description" style="color: #777;">Service details...</div>`
- **Recommendation**: Increase color contrast ratio to at least 4.5:1 for normal text, 3:1 for large text

### Missing ARIA Labels (2 occurrences)

#### Error 1: Homepage
- **URL**: https://example.com/
- **Error**: Navigation menu missing aria-label
- **Element**: `nav.main-nav`
- **Context**: `<nav class="main-nav"><ul>...</ul></nav>`
- **Recommendation**: Add aria-label or aria-labelledby attributes to interactive elements without visible text

#### Error 2: Contact Page
- **URL**: https://example.com/contact
- **Error**: Submit button missing aria-label
- **Element**: `button[type="submit"]`
- **Context**: `<button type="submit">Submit</button>`
- **Recommendation**: Add aria-label or aria-labelledby attributes to interactive elements without visible text

## Detailed Error List

### Error 1
- **Page**: https://example.com/
- **Title**: Homepage
- **Type**: Missing Alt Attributes
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Images missing alt attributes
- **Code Example**:
```html
<img src="image.jpg" alt="Descriptive text about the image">
```
- **Recommendation**: Add descriptive alt text to all images that convey information

### Error 2
- **Page**: https://example.com/about
- **Title**: About Page
- **Type**: Missing Alt Attributes
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Hero image missing alt text
- **Code Example**:
```html
<img src="image.jpg" alt="Descriptive text about the image">
```
- **Recommendation**: Add descriptive alt text to all images that convey information

### Error 3
- **Page**: https://example.com/about
- **Title**: About Page
- **Type**: Color Contrast Issues
- **Code**: WCAG2AA
- **Message**: Insufficient color contrast for body text
- **Selector**: `.text-content`
- **Context**: `<p class="text-content" style="color: #666;">About our company...</p>`
- **Code Example**:
```html
<p style="color: #000; background-color: #fff;">High contrast text</p>
```
- **Recommendation**: Increase color contrast ratio to at least 4.5:1 for normal text, 3:1 for large text

### Error 4
- **Page**: https://example.com/services
- **Title**: Services Page
- **Type**: Missing Alt Attributes
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Service icons missing alt attributes
- **Code Example**:
```html
<img src="image.jpg" alt="Descriptive text about the image">
```
- **Recommendation**: Add descriptive alt text to all images that convey information

### Error 5
- **Page**: https://example.com/services
- **Title**: Services Page
- **Type**: Color Contrast Issues
- **Code**: WCAG2AA
- **Message**: Low contrast for service descriptions
- **Selector**: `.service-description`
- **Context**: `<div class="service-description" style="color: #777;">Service details...</div>`
- **Code Example**:
```html
<p style="color: #000; background-color: #fff;">High contrast text</p>
```
- **Recommendation**: Increase color contrast ratio to at least 4.5:1 for normal text, 3:1 for large text

### Error 6
- **Page**: https://example.com/contact
- **Title**: Contact Page
- **Type**: Missing Alt Attributes
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Contact form image missing alt
- **Code Example**:
```html
<img src="image.jpg" alt="Descriptive text about the image">
```
- **Recommendation**: Add descriptive alt text to all images that convey information

### Error 7
- **Page**: https://example.com/
- **Title**: Homepage
- **Type**: Missing ARIA Labels
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Navigation menu missing aria-label
- **Selector**: `nav.main-nav`
- **Context**: `<nav class="main-nav"><ul>...</ul></nav>`
- **Code Example**:
```html
<button aria-label="Submit form">Submit</button>
```
- **Recommendation**: Add aria-label or aria-labelledby attributes to interactive elements without visible text

### Error 8
- **Page**: https://example.com/contact
- **Title**: Contact Page
- **Type**: Missing ARIA Labels
- **Code**: PLAYWRIGHT_ERROR
- **Message**: Submit button missing aria-label
- **Selector**: `button[type="submit"]`
- **Context**: `<button type="submit">Submit</button>`
- **Code Example**:
```html
<button aria-label="Submit form">Submit</button>
```
- **Recommendation**: Add aria-label or aria-labelledby attributes to interactive elements without visible text

## Processing Instructions

This report is structured for automated tools to fix accessibility issues:

1. **Parse each error** using the structured format above
2. **Identify the element** using the provided selector
3. **Apply the recommended fix** based on the error type
4. **Test the fix** to ensure it resolves the issue
5. **Update the code** with the corrected version

### Common Fix Patterns:
- **Missing alt attributes**: Add descriptive alt text to images
- **Missing aria-labels**: Add aria-label or aria-labelledby to interactive elements
- **Color contrast**: Adjust text/background colors for better contrast
- **Heading structure**: Ensure proper heading hierarchy (h1, h2, h3, etc.)
- **Form labels**: Associate form controls with their labels
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible

## Priority List

Process errors in this order for maximum impact:

1. **Missing Alt Attributes** - Images missing alt attributes (https://example.com/)
2. **Missing Alt Attributes** - Hero image missing alt text (https://example.com/about)
3. **Color Contrast Issues** - Insufficient color contrast for body text (https://example.com/about)
4. **Missing Alt Attributes** - Service icons missing alt attributes (https://example.com/services)
5. **Color Contrast Issues** - Low contrast for service descriptions (https://example.com/services)
6. **Missing Alt Attributes** - Contact form image missing alt (https://example.com/contact)
7. **Missing ARIA Labels** - Navigation menu missing aria-label (https://example.com/)
8. **Missing ARIA Labels** - Submit button missing aria-label (https://example.com/contact) 