# Resend Email Service Setup Guide

## Current Status

The Resend email service has been debugged and fixed. The email service is currently working in **test mode** with the following temporary configuration:

- **From Email**: `onboarding@resend.dev` (pre-verified domain)
- **To Email**: `jmw@0usia.com` (account owner email for test mode)
- **API Key**: Valid and working

## Issues Fixed

1. **Improved Error Handling**: Enhanced error capture and reporting for Resend API errors
2. **Domain Verification Errors**: Added specific error handling for domain verification issues
3. **API Error Messages**: Fixed "undefined" error messages by properly parsing Resend API responses
4. **User-Friendly Error Messages**: Added appropriate error messages for different failure scenarios

## Production Setup Requirements

### 1. Domain Verification

To use custom `@ovsia.com` email addresses in production, you need to:

1. **Add Domain in Resend Console**:
   - Go to [https://resend.com/domains](https://resend.com/domains)
   - Click "Add Domain"
   - Enter: `ovsia.com`

2. **Configure DNS Records**:
   - Add the required DNS records provided by Resend to your domain's DNS settings
   - Wait for DNS propagation (usually 15 minutes to 1 hour)
   - Verify the domain in Resend console

3. **Update Environment Variables**:
   ```env
   RESEND_FROM_EMAIL=noreply@ovsia.com
   RESEND_TO_EMAIL=hello@ovsia.com
   ```

### 2. API Key Modes

- **Test Mode**: Can only send to account owner's email (current setup)
- **Production Mode**: Can send to any email address after domain verification

### 3. Environment Configuration

#### Development (.env.local)
```env
# Current working configuration for development
RESEND_API_KEY=re_M6y7BSrH_EEG29Wcu56noXgRFn41XmLNu
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=jmw@0usia.com
```

#### Production
```env
# After domain verification
RESEND_API_KEY=your_production_api_key
RESEND_FROM_EMAIL=noreply@ovsia.com
RESEND_TO_EMAIL=hello@ovsia.com
```

## Testing

### Debug Scripts

Two debug scripts are available:

1. **debug-resend.js**: Tests basic Resend API functionality
   ```bash
   node debug-resend.js
   ```

2. **test-contact-form.js**: Tests the complete contact form flow
   ```bash
   node test-contact-form.js
   ```

### Manual Testing

1. Start the development server: `npm run dev`
2. Submit a contact form on the website
3. Check the logs for any errors
4. Check the inbox at `jmw@0usia.com` for the test email

## Error Handling Improvements

### Enhanced Error Detection

The email service now properly handles:

- **Domain Verification Errors** (`DOMAIN_NOT_VERIFIED`)
- **API Key Errors** (`INVALID_API_KEY`)
- **Rate Limiting** (`RATE_LIMIT`)
- **Validation Errors** (`VALIDATION_ERROR`)
- **Generic API Errors** with proper status codes

### Error Logging

- Detailed error logging for debugging
- User-friendly error messages for frontend
- Structured error codes for proper handling

## Monitoring

### Health Checks

Use the new `checkDomainVerification()` method to verify domain status:

```javascript
import { emailService } from '@/lib/email';

const status = await emailService.checkDomainVerification();
console.log('Domain verification status:', status);
```

### Configuration Status

Check email service configuration:

```javascript
const config = emailService.getConfigStatus();
console.log('Email service configuration:', config);
```

## Next Steps

1. **Verify ovsia.com domain** in Resend console
2. **Update environment variables** to use ovsia.com emails
3. **Test in production** environment
4. **Monitor email delivery** and bounce rates
5. **Set up email analytics** if needed

## Troubleshooting

### Common Issues

1. **"Domain not verified" error**: Verify ovsia.com domain in Resend console
2. **"Can only send to account owner" error**: API key is in test mode
3. **403 Forbidden errors**: Usually domain verification or API key issues
4. **Rate limiting**: Wait and retry, or upgrade Resend plan if needed

### Debug Steps

1. Run `node debug-resend.js` to test basic API connectivity
2. Check environment variables are loaded correctly
3. Verify API key format (should start with `re_`)
4. Check domain verification status in Resend console
5. Review application logs for detailed error messages

## Contact

For issues with this setup, check:
- Resend documentation: https://resend.com/docs
- API status: https://status.resend.com/
- Domain verification guide: https://resend.com/docs/send-with-nextjs#domain-verification