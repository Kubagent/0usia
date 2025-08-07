# SplitScreenCTA Accessibility Compliance

This document outlines the accessibility features and compliance measures implemented in the SplitScreenCTA component.

## WCAG 2.1 AA Compliance Checklist

### ✅ Principle 1: Perceivable

#### 1.1 Text Alternatives
- [x] All buttons have descriptive `aria-label` attributes
- [x] File upload area has proper labeling for screen readers
- [x] Form fields have associated labels using `htmlFor` and `id`

#### 1.2 Time-based Media
- [x] No time-based media used (N/A)

#### 1.3 Adaptable
- [x] Content can be presented in different ways without losing meaning
- [x] Form structure is logical and follows semantic HTML
- [x] Information and relationships are preserved when styles are disabled

#### 1.4 Distinguishable
- [x] Color contrast meets WCAG AA standards (minimum 4.5:1)
- [x] Text is resizable up to 200% without horizontal scrolling
- [x] Focus indicators are clearly visible
- [x] No content flashes more than 3 times per second

### ✅ Principle 2: Operable

#### 2.1 Keyboard Accessible
- [x] All functionality is available via keyboard
- [x] Tab order is logical and follows visual flow
- [x] No keyboard traps exist
- [x] Modal focus is properly managed

#### 2.2 Enough Time
- [x] No time limits imposed on user interactions
- [x] Form submission provides adequate feedback

#### 2.3 Seizures and Physical Reactions
- [x] No content causes seizures or physical reactions
- [x] Animations use `prefers-reduced-motion` respect

#### 2.4 Navigable
- [x] Modal has proper heading structure
- [x] Focus management in modal interactions
- [x] Purpose of links and buttons is clear from context

### ✅ Principle 3: Understandable

#### 3.1 Readable
- [x] Language of page is specified (inherits from document)
- [x] Meaning of unusual words is clear from context

#### 3.2 Predictable
- [x] Navigation and functionality behave consistently
- [x] Form validation provides clear error messages
- [x] Changes of context are user-initiated

#### 3.3 Input Assistance
- [x] Form validation errors are clearly identified
- [x] Labels and instructions are provided for form fields
- [x] Error prevention through client-side validation

### ✅ Principle 4: Robust

#### 4.1 Compatible
- [x] Valid HTML5 semantic markup
- [x] Proper ARIA attributes where needed
- [x] Compatible with assistive technologies

## Keyboard Navigation

### Tab Order
1. Left side button (opens modal)
2. Right side button (mailto)
3. Modal elements (when open):
   - Close button
   - Name field
   - Email field
   - Company field
   - Message field
   - File upload area
   - Cancel button
   - Submit button

### Keyboard Shortcuts
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward
- **Enter/Space**: Activate buttons
- **Escape**: Close modal (when open)

## Screen Reader Support

### ARIA Labels and Roles
```jsx
// Button accessibility
<button
  aria-label="Open form to start a project"
  onClick={openModal}
>
  Start a Project
</button>

// Modal accessibility
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>

// Form field accessibility
<input
  id="name"
  aria-describedby={errors.name ? "name-error" : undefined}
/>
{errors.name && (
  <p id="name-error" role="alert">
    {errors.name}
  </p>
)}
```

### Screen Reader Announcements
- Form validation errors are announced immediately
- Modal open/close state changes are communicated
- File upload status is announced
- Form submission progress is communicated

## Focus Management

### Modal Focus Behavior
1. **On Open**: Focus moves to modal container
2. **During Use**: Focus is trapped within modal
3. **On Close**: Focus returns to triggering element

### Visual Focus Indicators
- High contrast focus rings (2px solid #3b82f6)
- Visible on all interactive elements
- Maintains sufficient contrast ratios

## Color and Contrast

### Color Contrast Ratios
- **Normal text**: Minimum 4.5:1 (meets AA)
- **Large text**: Minimum 3:1 (meets AA)
- **Interactive elements**: Minimum 3:1 for borders/backgrounds

### Color Usage
- Information is not conveyed through color alone
- Error states use both color and text indicators
- Success states provide textual confirmation

## Responsive Design

### Mobile Accessibility
- Touch targets are minimum 44px × 44px
- Content reflows properly on small screens
- No horizontal scrolling required
- Pinch-to-zoom is not disabled

### Breakpoint Behavior
- Desktop: Side-by-side layout
- Tablet: Maintains side-by-side with adjusted spacing
- Mobile: Stacked vertical layout

## Animation and Motion

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are reduced or disabled */
  .animate-fade-in {
    animation: none;
  }
}
```

### Animation Guidelines
- Animations don't last longer than 5 seconds
- Users can pause or disable animations
- No essential information is conveyed through animation alone

## Form Accessibility

### Field Requirements
- All required fields are clearly marked with asterisks
- Field labels are descriptive and clear
- Help text is provided where needed

### Error Handling
- Errors are announced immediately to screen readers
- Error messages are specific and actionable
- Form remains functional when errors occur

### File Upload Accessibility
- Drag and drop area is keyboard accessible
- File selection is announced to screen readers
- Upload progress and completion are communicated
- Error states for file size/type are clearly indicated

## Testing Methods

### Automated Testing
- ESLint plugin for accessibility rules
- Jest tests for ARIA attributes and keyboard behavior
- Lighthouse accessibility audits

### Manual Testing
- Keyboard-only navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- High contrast mode testing
- Zoom testing up to 200%

### Browser Support
- Chrome + NVDA
- Firefox + JAWS
- Safari + VoiceOver
- Edge + Narrator

## Common Accessibility Issues Prevented

### ❌ Anti-patterns Avoided
- Using placeholder text as labels
- Relying solely on color for error indication
- Missing focus indicators
- Keyboard traps in modals
- Unlabeled form controls
- Poor heading structure
- Missing alt text for informative images

### ✅ Best Practices Implemented
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive link and button text
- Form validation with clear error messages
- Keyboard navigation support
- Screen reader friendly content
- Consistent navigation patterns

## Compliance Statement

This component has been designed and tested to meet WCAG 2.1 AA standards. Regular audits and user testing ensure continued compliance as the component evolves.

For accessibility issues or improvements, please contact our accessibility team at accessibility@ovsia.com.