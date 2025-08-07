/**
 * Newsletter Subscription API Endpoint
 * 
 * Handles newsletter subscription requests with Mailchimp integration
 * 
 * Features:
 * - Email validation
 * - Rate limiting and spam protection
 * - Mailchimp integration for subscriber management
 * - GDPR compliance
 * - Double opt-in support
 * - Error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateNewsletterSubscription, validateHoneypot, sanitizeString, sanitizeEmail } from '@/lib/validation';
import { checkMultipleRateLimits, RATE_LIMIT_CONFIGS, getClientIP, logRateLimitEvent } from '@/lib/rate-limit';
import { mailchimpAPI, MailchimpAPIError } from '@/lib/mailchimp';

// Request body interface
interface NewsletterRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
  honeypot?: string; // Spam protection field
  source?: string;
  doubleOptIn?: boolean;
}

// Response interfaces
interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: {
    subscriptionId?: string;
    mailchimpId?: string;
    status?: string;
    requiresConfirmation?: boolean;
  };
}

interface NewsletterErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string>;
  retryAfter?: number;
}

/**
 * Handle POST requests to newsletter subscription endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || undefined;

  try {
    // Parse request body
    let body: NewsletterRequest;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json<NewsletterErrorResponse>(
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
      logRateLimitEvent('exceeded', '/api/newsletter', clientIP, userAgent);
      return NextResponse.json<NewsletterErrorResponse>(
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
      email: sanitizeEmail(body.email),
      firstName: body.firstName ? sanitizeString(body.firstName) : undefined,
      lastName: body.lastName ? sanitizeString(body.lastName) : undefined,
      gdprConsent: Boolean(body.gdprConsent),
      marketingConsent: Boolean(body.marketingConsent),
      source: body.source ? sanitizeString(body.source) : 'footer_newsletter',
      doubleOptIn: Boolean(body.doubleOptIn),
    };

    // Validate form data
    const validation = validateNewsletterSubscription({
      email: sanitizedData.email,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      gdprConsent: sanitizedData.gdprConsent,
      marketingConsent: sanitizedData.marketingConsent,
      source: sanitizedData.source,
    });

    if (!validation.isValid) {
      return NextResponse.json<NewsletterErrorResponse>(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Please check your information and try again',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // GDPR Compliance: Both consents must be true for newsletter
    if (!sanitizedData.gdprConsent || !sanitizedData.marketingConsent) {
      return NextResponse.json<NewsletterErrorResponse>(
        {
          success: false,
          error: 'CONSENT_REQUIRED',
          message: 'You must consent to our privacy policy and marketing communications to subscribe to our newsletter',
          details: {
            gdprConsent: !sanitizedData.gdprConsent ? 'Privacy policy consent is required' : '',
            marketingConsent: !sanitizedData.marketingConsent ? 'Marketing consent is required for newsletter subscription' : '',
          },
        },
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitChecks = [
      {
        name: 'NEWSLETTER',
        config: RATE_LIMIT_CONFIGS.NEWSLETTER,
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
      logRateLimitEvent('exceeded', '/api/newsletter', clientIP, userAgent);
      return rateLimitResult.response;
    }

    // Submit to Mailchimp
    let mailchimpResponse;
    let requiresConfirmation = false;
    
    try {
      mailchimpResponse = await mailchimpAPI.subscribeToNewsletter({
        email: sanitizedData.email,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        gdprConsent: sanitizedData.gdprConsent,
        marketingConsent: sanitizedData.marketingConsent,
        source: sanitizedData.source,
      });

      // Check if double opt-in is required (status would be 'pending')
      requiresConfirmation = mailchimpResponse.status === 'pending';
      
    } catch (error) {
      if (error instanceof MailchimpAPIError) {
        // Handle specific Mailchimp errors
        if (error.isMemberExistsError()) {
          // Member already exists - check if they're subscribed
          console.log('Newsletter subscription attempt for existing member:', {
            email: sanitizedData.email.substring(0, 3) + '****', // Partial email for privacy
            timestamp: new Date().toISOString(),
          });

          return NextResponse.json<NewsletterResponse>(
            {
              success: true,
              message: 'You\'re already subscribed to our newsletter! Thanks for your interest.',
              data: {
                subscriptionId: `newsletter_existing_${Date.now()}`,
                status: 'already_subscribed',
                requiresConfirmation: false,
              },
            },
            { status: 200 }
          );
        } else if (error.isInvalidEmailError()) {
          return NextResponse.json<NewsletterErrorResponse>(
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

          return NextResponse.json<NewsletterErrorResponse>(
            {
              success: false,
              error: 'MAILCHIMP_ERROR',
              message: error.getUserFriendlyMessage(),
            },
            { status: 500 }
          );
        }
      } else {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json<NewsletterErrorResponse>(
          {
            success: false,
            error: 'SUBSCRIPTION_ERROR',
            message: 'Unable to process your subscription. Please try again later.',
          },
          { status: 500 }
        );
      }
    }

    // Log successful subscription (without personal data)
    console.log('Newsletter subscription successful:', {
      timestamp: new Date().toISOString(),
      hasName: !!(sanitizedData.firstName || sanitizedData.lastName),
      source: sanitizedData.source,
      requiresConfirmation,
      processingTime: Date.now() - startTime,
    });

    // Return success response with appropriate message
    const successMessage = requiresConfirmation
      ? 'Almost there! Please check your email and click the confirmation link to complete your subscription.'
      : 'Thank you for subscribing to our newsletter! You\'ll receive updates about our latest work and insights.';

    return NextResponse.json<NewsletterResponse>(
      {
        success: true,
        message: successMessage,
        data: {
          subscriptionId: `newsletter_${Date.now()}`,
          mailchimpId: mailchimpResponse?.id,
          status: mailchimpResponse?.status || 'subscribed',
          requiresConfirmation,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter endpoint error:', error);
    
    return NextResponse.json<NewsletterErrorResponse>(
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
 * Handle GET requests - return subscription info/status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email parameter is required',
      },
      { status: 400 }
    );
  }

  // Rate limit GET requests too
  const rateLimitResult = await checkMultipleRateLimits(req, [
    {
      name: 'GLOBAL_API',
      config: RATE_LIMIT_CONFIGS.GLOBAL_API,
    },
  ]);

  if (!rateLimitResult.allowed && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    // For security, we don't expose subscription status
    // Instead, we return a generic response
    return NextResponse.json(
      {
        success: true,
        message: 'Newsletter subscription service is available',
        data: {
          canSubscribe: true,
          requiresConsent: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
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