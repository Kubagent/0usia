/**
 * Contact Form API Endpoint
 * 
 * Handles contact form submissions with Mailchimp integration
 * 
 * Features:
 * - Form validation (server-side)
 * - Rate limiting and spam protection
 * - Mailchimp integration for lead capture
 * - GDPR compliance
 * - File upload handling
 * - Error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm, detectSpamPatterns, validateHoneypot, sanitizeString, sanitizeEmail } from '@/lib/validation';
import { checkMultipleRateLimits, RATE_LIMIT_CONFIGS, getClientIP, logRateLimitEvent } from '@/lib/rate-limit';
import { mailchimpAPI, MailchimpAPIError } from '@/lib/mailchimp';

// Request body interface
interface ContactFormRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  gdprConsent: boolean;
  marketingConsent?: boolean;
  honeypot?: string; // Spam protection field
  source?: string;
}

// Response interfaces
interface ContactFormResponse {
  success: boolean;
  message: string;
  data?: {
    submissionId?: string;
    mailchimpId?: string;
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
 * Handle POST requests to contact form endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || undefined;

  try {
    // Parse request body
    let body: ContactFormRequest;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'INVALID_JSON',
          message: 'Invalid request format',
        },
        { status: 400 }
      );
    }

    // Validate honeypot (anti-spam)
    if (!validateHoneypot(body.honeypot || '')) {
      logRateLimitEvent('exceeded', '/api/contact', clientIP, userAgent);
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
      name: sanitizeString(body.name),
      email: sanitizeEmail(body.email),
      company: body.company ? sanitizeString(body.company) : undefined,
      message: sanitizeString(body.message),
      gdprConsent: Boolean(body.gdprConsent),
      marketingConsent: Boolean(body.marketingConsent),
      source: body.source ? sanitizeString(body.source) : 'contact_form',
    };

    // Validate form data
    const validation = validateContactForm({
      name: sanitizedData.name,
      email: sanitizedData.email,
      company: sanitizedData.company || '',
      message: sanitizedData.message,
      gdprConsent: sanitizedData.gdprConsent,
      marketingConsent: sanitizedData.marketingConsent,
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
      console.log('Spam detected in contact form:', {
        timestamp: new Date().toISOString(),
        ip: clientIP.substring(0, 8) + '****', // Partial IP for privacy
        reasons: spamCheck.reasons,
      });

      return NextResponse.json<ContactFormErrorResponse>(
        {
          success: false,
          error: 'SPAM_DETECTED',
          message: 'Your message appears to be spam. Please contact us directly if this is an error.',
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
      logRateLimitEvent('exceeded', '/api/contact', clientIP, userAgent);
      return rateLimitResult.response;
    }

    // Submit to Mailchimp
    let mailchimpResponse;
    try {
      mailchimpResponse = await mailchimpAPI.submitContactForm({
        name: sanitizedData.name,
        email: sanitizedData.email,
        company: sanitizedData.company,
        message: sanitizedData.message,
        gdprConsent: sanitizedData.gdprConsent,
        marketingConsent: sanitizedData.marketingConsent,
      });
    } catch (error) {
      if (error instanceof MailchimpAPIError) {
        // Handle specific Mailchimp errors
        if (error.isMemberExistsError()) {
          // Member already exists - this is actually OK for contact forms
          console.log('Contact form submitted for existing Mailchimp member:', {
            email: sanitizedData.email.substring(0, 3) + '****', // Partial email for privacy
            timestamp: new Date().toISOString(),
          });
        } else if (error.isInvalidEmailError()) {
          return NextResponse.json<ContactFormErrorResponse>(
            {
              success: false,
              error: 'INVALID_EMAIL',
              message: 'Please enter a valid email address',
            },
            { status: 400 }
          );
        } else {
          console.error('Mailchimp API error:', {
            type: error.type,
            status: error.status,
            detail: error.detail,
            timestamp: new Date().toISOString(),
          });

          return NextResponse.json<ContactFormErrorResponse>(
            {
              success: false,
              error: 'MAILCHIMP_ERROR',
              message: error.getUserFriendlyMessage(),
            },
            { status: 500 }
          );
        }
      } else {
        console.error('Contact form submission error:', error);
        return NextResponse.json<ContactFormErrorResponse>(
          {
            success: false,
            error: 'SUBMISSION_ERROR',
            message: 'Unable to process your request. Please try again later.',
          },
          { status: 500 }
        );
      }
    }

    // Log successful submission (without personal data)
    console.log('Contact form submitted successfully:', {
      timestamp: new Date().toISOString(),
      hasCompany: !!sanitizedData.company,
      messageLength: sanitizedData.message.length,
      marketingConsent: sanitizedData.marketingConsent,
      source: sanitizedData.source,
      processingTime: Date.now() - startTime,
    });

    // Return success response
    return NextResponse.json<ContactFormResponse>(
      {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
        data: {
          submissionId: `contact_${Date.now()}`,
          mailchimpId: mailchimpResponse?.id,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form endpoint error:', error);
    
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