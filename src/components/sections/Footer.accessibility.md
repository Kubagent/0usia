# Footer Component - Accessibility Guide

## Overview
The Footer component is designed to be fully accessible and compliant with WCAG AA standards. This document outlines the accessibility features and considerations implemented in the component.

## Accessibility Features

### 1. Semantic HTML Structure
- Uses proper `<footer>` element with `role="contentinfo"`
- Implements semantic navigation with `<nav>` and `role="navigation"`
- Uses proper heading hierarchy (`<h2>` for main heading)
- Implements unordered list (`<ul>`) for social links

### 2. ARIA Labels and Descriptions
- **Footer**: `aria-label="Site footer"` provides clear identification
- **Navigation**: `aria-label="Social media links"` describes the navigation purpose
- **Time Display**: `aria-label` includes current time for screen readers
- **Social Links**: Each link has descriptive `aria-label` attributes
- **Email Link**: Clear `aria-label="Send us an email"`

### 3. Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order maintained throughout the component
- Focus indicators visible on all focusable elements
- Focus management with `tabindex` where appropriate

### 4. Focus Management
- Clear focus indicators using Tailwind's `focus:` utilities
- Focus rings with appropriate contrast ratios
- Focus offset to prevent overlap with background
- Consistent focus styling across all interactive elements

### 5. Color and Contrast
- High contrast ratios between text and background colors
- Primary text: White on black background (>21:1 ratio)
- Secondary text: Light gray on black background (>7:1 ratio)
- Hover states maintain sufficient contrast
- No reliance on color alone to convey information

### 6. Animation Considerations
- Animations respect `prefers-reduced-motion` (handled by framer-motion)
- Subtle, non-distracting animations
- No flashing or rapidly changing content
- Animation durations are reasonable (0.2s - 4s)

## WCAG AA Compliance Checklist

### ✅ Perceivable
- [x] Text has sufficient color contrast (>4.5:1 for normal text, >3:1 for large text)
- [x] Content is adaptable and can be presented in different ways
- [x] Images have appropriate alt text (icons are decorative, marked as `aria-hidden="true"`)
- [x] No content flashes more than 3 times per second

### ✅ Operable
- [x] All functionality is keyboard accessible
- [x] No keyboard traps exist
- [x] Timing is not essential (time display is informational only)
- [x] Content doesn't cause seizures or physical reactions

### ✅ Understandable
- [x] Text is readable and understandable
- [x] Content appears and operates in predictable ways
- [x] Users are helped to avoid and correct mistakes (N/A for this component)
- [x] Language is specified (inherited from document)

### ✅ Robust
- [x] Content is compatible with assistive technologies
- [x] Markup is valid and semantic
- [x] Component works across different browsers and devices

## Screen Reader Experience

### Expected Announcements
1. "Site footer landmark"
2. "Get in Touch, heading level 2"
3. "Ready to create something extraordinary together?"
4. "Send us an email, link"
5. "Social media links, navigation"
6. "Follow us on Twitter, link" (and similar for other social platforms)
7. "Current time in Berlin: [time]"
8. Copyright and legal information

### Navigation Flow
- Screen readers can jump directly to the footer using landmark navigation
- All interactive elements are discoverable in reading order
- Link purposes are clear from context or aria-labels

## Mobile Accessibility

### Touch Targets
- All interactive elements meet minimum 44x44px touch target size
- Adequate spacing between touch targets (minimum 8px gap)
- Touch targets don't overlap

### Responsive Design
- Content reflows appropriately at 320px width
- Text remains readable when zoomed to 200%
- No horizontal scrolling required
- Proper reading order maintained across breakpoints

## Testing Recommendations

### Automated Testing
```bash
# Run accessibility tests
npm test -- --testNamePattern="Footer.*accessibility"

# Run with axe-core integration
npx @axe-core/cli http://localhost:3000 --include="footer"
```

### Manual Testing Checklist
- [ ] Navigate entire footer using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Test responsive behavior
- [ ] Check with high contrast mode
- [ ] Verify with zoom at 200%

### Screen Reader Testing Commands
- **NVDA**: `NVDA + F7` (Elements List), `D` (Landmarks)
- **JAWS**: `INSERT + F6` (Headings List), `R` (Landmarks)
- **VoiceOver**: `VO + U` (Rotor), Navigate by landmarks

## Common Issues to Avoid

### ❌ Accessibility Anti-patterns
- Don't use generic link text like "click here"
- Don't rely solely on color to indicate interactive elements
- Don't use placeholder text as labels
- Don't create keyboard traps
- Don't use positive tabindex values

### ❌ Animation Issues
- Don't use rapidly flashing content
- Don't disable animations globally (respect user preferences)
- Don't make essential content depend on animation completion

## Browser Compatibility

### Supported Browsers
- Safari 14+ (with VoiceOver)
- Chrome 88+ (with ChromeVox)
- Firefox 85+ (with NVDA)
- Edge 88+

### Assistive Technology Support
- NVDA 2020.4+
- JAWS 2021+
- VoiceOver (macOS 11+, iOS 14+)
- Dragon NaturallySpeaking 16+

## Maintenance Notes

### Regular Accessibility Checks
- Validate HTML markup
- Test keyboard navigation after changes
- Verify color contrast when updating themes
- Run automated accessibility tests in CI/CD

### Updates and Improvements
- Monitor WCAG guideline updates
- Keep aria-label content current
- Update browser compatibility as needed
- Collect feedback from users with disabilities

## Resources

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)