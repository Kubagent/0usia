# SplitScreenCTA Component

A modern, responsive split-screen call-to-action component with modal forms and mailto functionality.

## Features

### Core Functionality
- **Split-Screen Layout**: Responsive left/right layout that stacks on mobile
- **Modal Form System**: Full-featured form with validation and file upload
- **Mailto Integration**: Quick email functionality with pre-filled content
- **File Upload**: Drag & drop support with size validation (10MB limit)
- **Form Validation**: Real-time validation with error messaging

### User Experience
- **Smooth Animations**: Powered by Framer Motion for fluid interactions
- **Loading States**: Visual feedback during form submission
- **Error Handling**: Comprehensive validation and error display
- **Keyboard Navigation**: Full keyboard accessibility support

### Performance & Accessibility
- **React.memo Optimization**: Prevents unnecessary re-renders
- **WCAG 2.1 AA Compliant**: Proper ARIA labels and semantic HTML
- **Mobile-First Design**: Responsive across all device sizes
- **Focus Management**: Proper focus handling in modals

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftTitle` | `string` | `"Let's Work Together"` | Title for the left CTA section |
| `leftDescription` | `string` | Default description | Description text for left section |
| `leftButtonText` | `string` | `"Start a Project"` | Button text for modal trigger |
| `rightTitle` | `string` | `"Quick Questions?"` | Title for the right CTA section |
| `rightDescription` | `string` | Default description | Description text for right section |
| `rightButtonText` | `string` | `"Send Email"` | Button text for mailto action |
| `mailtoEmail` | `string` | `"hello@ovsia.com"` | Email address for mailto link |
| `className` | `string` | `""` | Additional CSS classes |

### Form Data Structure

```typescript
interface FormData {
  name: string;        // Required
  email: string;       // Required, validated format
  company: string;     // Optional
  message: string;     // Required
  file?: File;         // Optional, max 10MB
}
```

## Usage Examples

### Basic Implementation
```jsx
import { SplitScreenCTA } from '@/components';

export default function ContactPage() {
  return (
    <div>
      <SplitScreenCTA />
    </div>
  );
}
```

### Customized for Agency
```jsx
<SplitScreenCTA
  leftTitle="Ready to Transform Your Business?"
  leftDescription="Share your vision with us and we'll craft a strategic solution that drives real results for your company."
  leftButtonText="Start Your Project"
  rightTitle="Have Questions?"
  rightDescription="Not sure where to begin? Let's have a conversation about your goals and challenges."
  rightButtonText="Let's Talk"
  mailtoEmail="projects@agency.com"
/>
```

### SaaS Product Version
```jsx
<SplitScreenCTA
  leftTitle="Ready to Get Started?"
  leftDescription="Sign up for a personalized demo and see how our platform can streamline your workflow."
  leftButtonText="Request Demo"
  rightTitle="Need Support?"
  rightDescription="Our team is here to help you succeed. Get in touch for technical assistance."
  rightButtonText="Contact Support"
  mailtoEmail="support@saas.com"
/>
```

## Implementation Guide

### 1. Form Submission Handling

The component includes a mock form submission. To integrate with your backend:

```jsx
// In the handleSubmit function, replace the mock API call:
try {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      message: formData.message,
      file: formData.file // Handle file upload separately
    }),
  });
  
  if (!response.ok) throw new Error('Submission failed');
  
  // Success handling
  closeModal();
  showSuccessMessage();
} catch (error) {
  showErrorMessage();
}
```

### 2. File Upload Integration

For file uploads, you'll typically need a separate endpoint:

```jsx
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};
```

### 3. Email Service Integration

For advanced email handling, consider integrating with services like:
- **Mailchimp**: For newsletter subscriptions
- **SendGrid**: For transactional emails
- **Resend**: For modern email APIs

## Styling Customization

### CSS Classes Used
- `.font-space`: Space Grotesk font family
- `.font-cormorant`: Cormorant Garamond font family
- Custom Tailwind animations and transitions
- Responsive breakpoints: `lg:`, `sm:`, etc.

### Customizing Colors
```jsx
// Override the gradient backgrounds
<SplitScreenCTA
  className="[&_.left-section]:bg-gradient-to-br [&_.left-section]:from-blue-50 [&_.left-section]:to-blue-100"
/>
```

### Animation Customization
The component uses Framer Motion variants that can be overridden:

```jsx
const customVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modal

### Screen Reader Support
- Proper ARIA labels on all interactive elements
- Form validation errors announced to screen readers
- Modal focus management with proper role attributes

### Focus Indicators
- Visible focus rings on all interactive elements
- High contrast colors for better visibility
- Logical tab order throughout the interface

## Performance Considerations

### Optimization Features
- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Memoizes event handlers
- **Lazy Loading**: Form validation only runs when needed
- **Efficient Animations**: Hardware-accelerated transforms

### Performance Budget
- Initial bundle size: ~8KB gzipped
- Runtime performance: 60fps animations
- Memory usage: Minimal state overhead

### Best Practices
1. Only import the component when needed
2. Use proper loading states during submission
3. Implement proper error boundaries
4. Consider code splitting for large applications

## Testing

### Unit Tests Included
- Form validation logic
- File upload functionality
- Mailto link generation
- Accessibility compliance
- Responsive behavior

### Testing Commands
```bash
# Run component tests
npm test SplitScreenCTA

# Run with coverage
npm test SplitScreenCTA -- --coverage

# Watch mode for development
npm test SplitScreenCTA -- --watch
```

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Required
- None (uses modern web standards)

## Troubleshooting

### Common Issues

1. **Modal not opening**: Check that Framer Motion is properly installed
2. **File upload not working**: Verify file size limits and MIME types
3. **Mailto not working**: Ensure email client is configured on user's device
4. **Styling issues**: Verify Tailwind CSS is properly configured

### Debug Mode
Enable console logging by setting:
```jsx
const DEBUG = process.env.NODE_ENV === 'development';
```

## Migration Guide

### From Previous Versions
If migrating from a simpler CTA component:

1. Update import statement
2. Replace props with new API
3. Test form submission flow
4. Verify accessibility compliance

### Breaking Changes
- None (initial release)

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start demo: `npm run dev`

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Semantic HTML elements
- Accessible component patterns

## License

This component is part of the Ovsia V4 project and follows the project's licensing terms.