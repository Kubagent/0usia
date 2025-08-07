# Mailchimp Integration Documentation

## Overview

This document provides comprehensive guidance for setting up and using the Mailchimp API integration in the Ovsia V4 website. The integration handles contact form submissions and newsletter subscriptions with full GDPR compliance, rate limiting, and security features.

## Features

### ✅ Core Functionality
- **Contact Form Integration**: Captures leads from the SplitScreenCTA component
- **Newsletter Subscriptions**: Handles signups from the Footer component
- **GDPR Compliance**: Full consent management and privacy controls
- **Rate Limiting**: Spam protection and abuse prevention
- **Form Validation**: Client and server-side validation
- **Error Handling**: User-friendly error messages and retry logic
- **TypeScript Support**: Full type safety throughout the integration

### ✅ Security Features
- Anti-spam honeypot fields
- Rate limiting per IP and email
- Input sanitization and validation
- CORS protection
- Secure error handling (no sensitive data exposure)

### ✅ GDPR Compliance
- Explicit consent checkboxes
- Privacy policy integration
- Data retention policies
- Audit logging (privacy-compliant)
- Right to be forgotten support
- Marketing consent separation

## Setup Instructions

### 1. Environment Variables

Create or update your `.env.local` file with the following Mailchimp configuration:

```bash
# Mailchimp API Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_SERVER=us1  # Replace with your server (us1, us2, etc.)
MAILCHIMP_AUDIENCE_ID=your_main_audience_id_here
MAILCHIMP_CONTACT_LIST_ID=your_contact_list_id_here  # Optional: separate list for contact forms

# Rate Limiting (Optional - defaults provided)
RATE_LIMIT_MAX_REQUESTS=10  # Max requests per window
RATE_LIMIT_WINDOW_MS=60000  # Window in milliseconds (1 minute)

# Security (Optional)
ALLOWED_ORIGINS=localhost:3000,*.ovsia.com  # Comma-separated allowed origins
```

### 2. Getting Mailchimp Credentials

#### API Key
1. Log in to your Mailchimp account
2. Go to Account → Extras → API keys
3. Create a new API key
4. Copy the key (format: `key-us1` where `us1` is your server)

#### Server Identifier
- Extract the server identifier from your API key (the part after the dash)
- Common servers: `us1`, `us2`, `us3`, etc.

#### Audience ID
1. Go to Audience → All contacts
2. Click on Settings → Audience name and defaults
3. Copy the Audience ID (List ID)

#### Contact List ID (Optional)
- If you want separate lists for contact forms vs newsletter, create a second audience
- Use the main audience for newsletter, contact list for form submissions

### 3. Mailchimp Audience Setup

#### Required Merge Fields
Set up these merge fields in your Mailchimp audience:

| Field Name | Merge Tag | Type | Required |
|------------|-----------|------|----------|
| First Name | FNAME | Text | No |
| Last Name | LNAME | Text | No |
| Company | COMPANY | Text | No |
| Message | MESSAGE | Text | No |
| Source | SOURCE | Text | No |

#### GDPR Settings
1. Enable GDPR features in your Mailchimp account
2. Set up marketing permissions:
   - Create a "Marketing Communications" permission
   - Set it as required for newsletter subscriptions
3. Configure double opt-in if required by your jurisdiction

### 4. Component Integration

#### SplitScreenCTA Component
The contact form is automatically integrated. Features:
- Name, email, company, and message fields
- File upload support (up to 10MB)
- GDPR consent checkboxes
- Anti-spam protection
- Real-time validation

Usage:
```tsx
<SplitScreenCTA 
  leftTitle="Let's Work Together"
  leftDescription="Tell us about your project"
  rightTitle="Quick Questions?"
  mailtoEmail="hello@ovsia.com"
/>
```

#### Footer Component
The newsletter signup is integrated into the footer. Features:
- Email and optional first name
- GDPR consent checkboxes
- Success/error messaging
- Responsive design

Usage:
```tsx
<Footer 
  showNewsletter={true}  // Enable newsletter signup
  showTime={true}        // Show Berlin time
/>
```

## API Endpoints

### POST /api/contact

Handles contact form submissions.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "message": "I'm interested in your services",
  "gdprConsent": true,
  "marketingConsent": false,
  "honeypot": "",
  "source": "split_screen_cta"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you! We'll get back to you soon.",
  "data": {
    "submissionId": "contact_1234567890",
    "mailchimpId": "abc123def456"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Please check your information and try again",
  "details": {
    "email": "Please enter a valid email address"
  }
}
```

### POST /api/newsletter

Handles newsletter subscriptions.

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "firstName": "Jane",
  "gdprConsent": true,
  "marketingConsent": true,
  "honeypot": "",
  "source": "footer_newsletter"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for subscribing to our newsletter!",
  "data": {
    "subscriptionId": "newsletter_1234567890",
    "mailchimpId": "xyz789abc123",
    "status": "subscribed",
    "requiresConfirmation": false
  }
}
```

## Rate Limiting

### Default Limits
- **Contact Form**: 5 submissions per 15 minutes per IP
- **Newsletter**: 3 subscriptions per hour per IP
- **Email-based**: 2 submissions per email per hour
- **Global API**: 100 requests per hour per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

### Customizing Rate Limits
Update the configuration in `/src/lib/rate-limit.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  CONTACT_FORM: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    // ... other config
  },
  // ... other configs
};
```

## GDPR Compliance

### Data Processing
- **Contact Forms**: Processed under legitimate interest + consent
- **Newsletter**: Processed under explicit consent only
- **Retention**: Automatic deletion based on retention policies
- **Rights**: Support for access, rectification, erasure, portability

### Consent Requirements
1. **Privacy Policy Consent**: Required for all forms
2. **Marketing Consent**: Required for newsletter, optional for contact forms
3. **Consent Recording**: Timestamp, IP (hashed), and method recorded
4. **Withdrawal**: Users can withdraw consent via unsubscribe links

### Privacy by Design
- Minimal data collection
- Purpose limitation
- Data minimization
- Pseudonymization in logs
- Secure transmission and storage

## Error Handling

### Client-Side Validation
- Real-time form validation
- User-friendly error messages
- Accessibility compliance (ARIA labels)
- Visual error indicators

### Server-Side Validation
- Comprehensive input validation
- Sanitization and security checks
- Spam detection algorithms
- Rate limiting enforcement

### Error Categories
1. **Validation Errors**: Invalid input data
2. **Rate Limit Errors**: Too many requests
3. **Spam Detection**: Suspicious patterns detected
4. **API Errors**: Mailchimp service issues
5. **Network Errors**: Connection problems

## Monitoring and Analytics

### Logging
- GDPR-compliant event logging
- No personal data in logs
- Hashed identifiers for privacy
- Structured JSON logging format

### Metrics to Monitor
- Form submission rates
- Newsletter signup rates
- Error rates by type
- Rate limit violations
- Spam detection rates

### Log Examples
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "event": "form_submitted",
  "endpoint": "/api/contact",
  "hasCompany": true,
  "messageLength": 150,
  "marketingConsent": false,
  "source": "split_screen_cta",
  "processingTime": 250
}
```

## Testing

### Test Endpoints Locally
```bash
# Test contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "message": "Test message",
    "gdprConsent": true,
    "marketingConsent": false,
    "honeypot": ""
  }'

# Test newsletter
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "gdprConsent": true,
    "marketingConsent": true,
    "honeypot": ""
  }'
```

### Rate Limit Testing
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/newsletter \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","gdprConsent":true,"marketingConsent":true}'
done
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Mailchimp audiences set up
- [ ] GDPR settings enabled
- [ ] Rate limiting configured
- [ ] Privacy policy pages created
- [ ] SSL certificate installed
- [ ] Error monitoring set up

### Performance Considerations
- API responses cached where appropriate
- Rate limiting prevents abuse
- Asynchronous processing for better UX
- Minimal payload sizes
- Efficient database queries

### Security Hardening
- CORS properly configured
- Input validation on all endpoints
- Rate limiting in place
- No sensitive data in error messages
- Secure headers configured

## Troubleshooting

### Common Issues

#### "Invalid Mailchimp configuration"
- Check environment variables are set correctly
- Verify API key format (should contain server suffix)
- Ensure audience ID is correct

#### "Rate limit exceeded"
- Check if rate limits are too restrictive
- Monitor for unusual traffic patterns
- Consider implementing user-specific limits

#### "GDPR consent required"
- Ensure both consent checkboxes are being submitted
- Check client-side validation logic
- Verify consent UI is user-friendly

#### "Spam detected"
- Review spam detection algorithms
- Check for false positives
- Monitor honeypot field effectiveness

### Debug Mode
Enable detailed logging in development:

```bash
NODE_ENV=development
DEBUG=mailchimp:*
```

### Health Checks
Monitor these endpoints for system health:
- `GET /api/newsletter` - Should return service availability
- Check Mailchimp API status at status.mailchimp.com

## Support and Maintenance

### Regular Tasks
- Monitor error rates and performance
- Review and update spam detection rules  
- Check GDPR compliance requirements
- Update rate limits based on usage patterns
- Review and rotate API keys periodically

### Documentation Updates
- Keep environment variable documentation current
- Update API endpoint documentation for changes
- Maintain troubleshooting guide
- Document any custom modifications

### Contact
For technical support with this integration:
- Internal development team
- Mailchimp API documentation: mailchimp.com/developer/
- GDPR compliance resources: gdpr.eu

---

*This integration was designed with security, privacy, and user experience as top priorities. All components are production-ready and follow industry best practices.*