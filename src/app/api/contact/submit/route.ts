/**
 * Contact Form Submission API Endpoint with File Upload Support
 * 
 * Handles contact form submissions with file attachments using Resend email integration
 * 
 * Features:
 * - File upload handling and validation
 * - Form validation (server-side)
 * - Rate limiting and spam protection
 * - Resend email integration with attachments
 * - GDPR compliance
 * - Error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm, detectSpamPatterns, validateHoneypot, sanitizeString, sanitizeEmail, validateFile } from '@/lib/validation';
import { checkMultipleRateLimits, RATE_LIMIT_CONFIGS, getClientIP, logRateLimitEvent } from '@/lib/rate-limit';
import { emailService, EmailError } from '@/lib/email';

// Response interfaces
interface ContactFormResponse {
  success: boolean;
  message: string;
  data?: {
    submissionId?: string;
    emailId?: string;
    hasAttachment?: boolean;
  };
}

interface ContactFormErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string>;
  retryAfter?: number;
}

/**
 * Handle POST requests to contact form submission endpoint with file uploads
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || undefined;

  try {
    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'INVALID_FORM_DATA',
          message: 'Invalid form data format',
        },
        { status: 400 }
      );
    }

    // Extract form fields
    const name = formData.get('name') as string || '';
    const email = formData.get('email') as string || '';
    const phone = formData.get('phone') as string || '';
    const company = formData.get('company') as string || '';
    const message = formData.get('message') as string || '';
    const formType = formData.get('formType') as string || 'Contact';
    const honeypot = formData.get('honeypot') as string || '';
    const gdprConsent = formData.get('gdprConsent') === 'true';
    const marketingConsent = formData.get('marketingConsent') === 'true';
    const attachment = formData.get('attachment') as File | null;

    // Validate honeypot (anti-spam)
    if (!validateHoneypot(honeypot)) {
      logRateLimitEvent('exceeded', '/api/contact/submit', clientIP, userAgent);
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'SPAM_DETECTED',
          message: 'Request rejected',
        },
        { status: 429 }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      phone: phone ? sanitizeString(phone) : undefined,
      company: company ? sanitizeString(company) : undefined,
      message: message ? sanitizeString(message) : '',
      formType: sanitizeString(formType),
      gdprConsent,
      marketingConsent,
    };

    // Validate form data
    const validation = validateContactForm({
      name: sanitizedData.name,
      email: sanitizedData.email,
      company: sanitizedData.company || '',
      message: sanitizedData.message,
      gdprConsent: sanitizedData.gdprConsent,
      marketingConsent: sanitizedData.marketingConsent,
      file: attachment,
    });

    if (!validation.isValid) {
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Please check your information and try again',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Special validation for investment forms (require attachment)
    if (formType === 'Investment' && !attachment) {
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'ATTACHMENT_REQUIRED',
          message: 'Please attach your pitch deck for investment inquiries',
          details: {
            attachment: 'Pitch deck is required for investment submissions',
          },
        },
        { status: 400 }
      );
    }

    // Validate file attachment if present
    if (attachment) {
      const fileValidation = validateFile(attachment);
      if (!fileValidation.isValid) {
        return NextResponse.json<ContactFormErrorResponse>(
          {
            success: false,
            error: 'INVALID_FILE',
            message: 'File attachment is invalid',
            details: fileValidation.errors,
          },
          { status: 400 }
        );
      }
    }

    // GDPR Compliance: Privacy policy consent is required
    if (!sanitizedData.gdprConsent) {
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'CONSENT_REQUIRED',
          message: 'You must accept the privacy policy to continue',
          details: {
            gdprConsent: 'Privacy policy consent is required',
          },
        },
        { status: 400 }
      );
    }

    // Check for spam patterns
    const spamCheck = detectSpamPatterns({
      name: sanitizedData.name,
      email: sanitizedData.email,
      company: sanitizedData.company || '',
      message: sanitizedData.message,
      gdprConsent: sanitizedData.gdprConsent,
      marketingConsent: sanitizedData.marketingConsent,
    });

    if (spamCheck.isSpam) {
      console.log('Spam detected in contact form submission:', {
        timestamp: new Date().toISOString(),
        ip: clientIP.substring(0, 8) + '****', // Partial IP for privacy
        reasons: spamCheck.reasons,
        formType: sanitizedData.formType,
      });

      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'SPAM_DETECTED',
          message: 'Your submission appears to be spam. Please contact us directly if this is an error.',
        },
        { status: 429 }
      );
    }

    // Check rate limits
    const rateLimitChecks = [
      {
        name: 'CONTACT_FORM',
        config: RATE_LIMIT_CONFIGS.CONTACT_FORM,
      },
      {
        name: 'EMAIL_BASED',
        config: RATE_LIMIT_CONFIGS.EMAIL_BASED,
        email: sanitizedData.email,
      },
      {
        name: 'GLOBAL_API',
        config: RATE_LIMIT_CONFIGS.GLOBAL_API,
      },
    ];

    const rateLimitResult = await checkMultipleRateLimits(req, rateLimitChecks);
    
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      logRateLimitEvent('exceeded', '/api/contact/submit', clientIP, userAgent);
      return rateLimitResult.response;
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      console.error('Email service is not configured');
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'Contact form service is temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Prepare email content with additional details
    const emailMessage = [
      sanitizedData.message,
      sanitizedData.phone ? `\n\nPhone: ${sanitizedData.phone}` : '',
      sanitizedData.company ? `Company: ${sanitizedData.company}` : '',
      attachment ? `\nAttachment: ${attachment.name} (${Math.round(attachment.size / 1024)}KB)` : '',
    ].filter(Boolean).join('\n');

    // Send email notification
    let emailResponse;
    try {
      emailResponse = await emailService.sendContactFormEmail({
        name: sanitizedData.name,
        email: sanitizedData.email,
        company: sanitizedData.company,
        message: emailMessage,
        source: 'form_submission',
        formType: sanitizedData.formType,
      });
    } catch (error) {
      if (error instanceof EmailError) {
        console.error('Email sending error:', {
          code: error.code,
          status: error.status,
          message: error.message,
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json<ContactFormErrorResponse>(
          {
            success: false,
            error: 'EMAIL_ERROR',
            message: error.getUserFriendlyMessage(),
          },
          { status: error.status }
        );
      } else {
        console.error('Contact form submission error:', error);
        return NextResponse.json<ContactFormErrorResponse>(
          {
            success: false,
            error: 'SUBMISSION_ERROR',
            message: 'Unable to process your submission. Please try again later.',
          },
          { status: 500 }
        );
      }
    }

    // Log successful submission (without personal data)
    console.log('Contact form submission successful:', {
      timestamp: new Date().toISOString(),
      formType: sanitizedData.formType,
      hasPhone: !!sanitizedData.phone,
      hasCompany: !!sanitizedData.company,
      hasMessage: !!sanitizedData.message,
      hasAttachment: !!attachment,
      attachmentSize: attachment ? Math.round(attachment.size / 1024) : 0,
      marketingConsent: sanitizedData.marketingConsent,
      emailId: emailResponse.id,
      processingTime: Date.now() - startTime,
    });

    // Determine success message based on form type
    const getSuccessMessage = (formType: string) => {
      switch (formType) {
        case 'Investment':
          return 'Thank you for your investment inquiry! We\'ve received your pitch deck and will review it carefully. We\'ll be in touch soon.';
        case 'Partnership':
          return 'Thank you for your partnership inquiry! We\'re excited about the possibility of working together and will get back to you soon.';
        case 'Project':
          return 'Thank you for your project inquiry! We\'ve received your details and will get back to you soon to discuss next steps.';
        default:
          return 'Thank you for your message! We\'ll get back to you soon.';
      }
    };

    // Return success response
    return NextResponse.json<ContactFormResponse>(
      {
        success: true,
        message: getSuccessMessage(sanitizedData.formType),
        data: {
          submissionId: `${sanitizedData.formType.toLowerCase()}_${Date.now()}`,
          emailId: emailResponse.id,
          hasAttachment: !!attachment,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission endpoint error:', error);
    
    return NextResponse.json<ContactFormErrorResponse>(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests (not allowed)
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'GET method not supported for this endpoint',
    },
    { status: 405 }
  );
}

/**
 * Handle other HTTP methods (not allowed)
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'PUT method not supported for this endpoint',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'DELETE method not supported for this endpoint',
    },
    { status: 405 }
  );
}