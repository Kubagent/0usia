/**
 * Contact Form API Route
 *
 * Handles contact form submissions with:
 * - Email notifications via Resend
 * - Storage in Notion database
 * - Rate limiting and validation
 * - CSRF protection (origin/referer validation)
 * - Request size limits
 * - Proper error handling
 */

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { emailService, ContactFormData as EmailFormData } from '@/lib/email';
import { submitContactForm } from '@/lib/notion';
import { ContactFormData as NotionFormData } from '@/types/notion';
import { validateContactForm, ContactFormValidationData, validateFileSignature } from '@/lib/validation';
import { checkMultipleRateLimits, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

// Security constants
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB max request size
const ALLOWED_ORIGINS = [
  'https://ovsia.com',
  'https://www.ovsia.com',
  'https://0usia.com',
  'https://www.0usia.com',
  // Allow localhost in development
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
];

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Secure logging utility - sanitizes sensitive data in production
 */
function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  if (!isProduction) {
    // Development: full logging
    console[level](message, data);
    return;
  }

  // Production: sanitize sensitive information
  if (!data) {
    console[level](`[${level.toUpperCase()}]`, message);
    return;
  }

  // Remove sensitive fields from logged data
  const sanitized = typeof data === 'object' && data !== null
    ? sanitizeLogData(data as Record<string, unknown>)
    : '[data omitted]';

  console[level](`[${level.toUpperCase()}]`, message, sanitized);
}

/**
 * Sanitize data for production logging
 */
function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['stack', 'apiKey', 'token', 'password', 'email', 'content', 'attachment'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate request origin for CSRF protection
 */
function validateOrigin(request: NextRequest): { valid: boolean; error?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // In development, be more lenient
  if (!isProduction) {
    return { valid: true };
  }

  // Check origin header
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return { valid: false, error: 'Invalid origin' };
    }
    return { valid: true };
  }

  // Fall back to referer check if no origin (some browsers don't send origin)
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
      return { valid: false, error: 'Invalid referer' };
    }
    return { valid: true };
  }

  // Reject requests without origin or referer in production
  return { valid: false, error: 'Missing origin header' };
}

// Attachment interface
interface AttachmentRequest {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
  size: number;
}

// Request body interface
interface ContactFormRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
  honeypot: string; // Anti-spam field
  source?: string;
  formType?: string;
  attachment?: AttachmentRequest;
}

// Response interface
interface ContactFormResponse {
  success: boolean;
  message: string;
  details?: Record<string, string>;
}

export async function POST(request: NextRequest): Promise<NextResponse<ContactFormResponse>> {
  try {
    // CSRF Protection: Validate origin/referer
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      secureLog('warn', 'CSRF protection triggered', { error: originCheck.error });
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Invalid request origin.',
        },
        { status: 403 }
      );
    }

    // Request size limit check
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      secureLog('warn', 'Request too large', { size: contentLength });
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Request body too large.',
        },
        { status: 413 }
      );
    }

    // Apply rate limiting
    const rateLimitResult = await checkMultipleRateLimits(request, [
      { name: 'contact_form', config: RATE_LIMIT_CONFIGS.CONTACT_FORM },
      { name: 'global_api', config: RATE_LIMIT_CONFIGS.GLOBAL_API }
    ]);

    if (!rateLimitResult.allowed) {
      return (rateLimitResult.response as NextResponse<ContactFormResponse>) || NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body with size validation
    let body: ContactFormRequest;
    try {
      const text = await request.text();
      if (text.length > MAX_REQUEST_SIZE) {
        return NextResponse.json<ContactFormResponse>(
          {
            success: false,
            message: 'Request body too large.',
          },
          { status: 413 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Invalid request format. Please check your data and try again.',
        },
        { status: 400 }
      );
    }

    // Anti-spam check - honeypot field should be empty
    if (body.honeypot && body.honeypot.trim() !== '') {
      secureLog('warn', 'Honeypot field filled, likely spam');
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Invalid form submission.',
        },
        { status: 400 }
      );
    }

    // Validate required fields and GDPR consent
    const validationData: ContactFormValidationData = {
      name: body.name,
      email: body.email,
      company: body.company,
      message: body.message,
      gdprConsent: body.gdprConsent,
      marketingConsent: body.marketingConsent,
      file: null, // No file upload for now
    };
    
    const validation = validateContactForm(validationData);
    if (!validation.isValid) {
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Please check the form for errors and try again.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Validate file signature if attachment is provided (server-side security check)
    if (body.attachment && body.attachment.content) {
      const signatureValid = validateFileSignature(
        body.attachment.content,
        body.attachment.contentType
      );

      if (!signatureValid) {
        secureLog('warn', 'File signature validation failed', {
          filename: body.attachment.filename,
          claimedType: body.attachment.contentType,
        });
        return NextResponse.json<ContactFormResponse>(
          {
            success: false,
            message: 'Invalid file format. The file content does not match its type.',
          },
          { status: 400 }
        );
      }
    }

    // Prepare data for email service
    const emailData: EmailFormData = {
      name: body.name.trim(),
      email: body.email.trim(),
      company: body.company?.trim(),
      message: body.message.trim(),
      source: body.source || 'contact_form',
      formType: body.formType || 'Contact',
      attachment: body.attachment ? {
        filename: body.attachment.filename,
        content: body.attachment.content,
        contentType: body.attachment.contentType,
        size: body.attachment.size,
      } : undefined,
    };

    // Prepare data for Notion storage
    const notionData: NotionFormData = {
      name: body.name.trim(),
      email: body.email.trim(),
      message: body.message.trim(),
      formType: (body.formType as 'Partnership' | 'Project' | 'Investment') || 'Project',
      attachment: body.attachment ? {
        name: body.attachment.filename,
        size: body.attachment.size,
        contentType: body.attachment.contentType,
      } : undefined,
    };

    // Add company if provided
    if (body.company?.trim()) {
      // Add to internal notes in Notion since NotionFormData doesn't have company field
      notionData.message += `\n\nCompany: ${body.company.trim()}`;
    }

    // Send email notification and store in Notion concurrently
    const [emailResult, notionResult] = await Promise.allSettled([
      emailService.sendContactFormEmail(emailData),
      submitContactForm(notionData)
    ]);

    // Check results
    const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value.success;
    const notionSuccess = notionResult.status === 'fulfilled' && notionResult.value.success;

    // Log any failures but don't fail the whole request if one service fails
    if (!emailSuccess) {
      const error = emailResult.status === 'rejected' ? emailResult.reason : 'Unknown error';
      secureLog('error', 'Email service failed', {
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    if (!notionSuccess) {
      const error = notionResult.status === 'rejected' ? notionResult.reason : 'Unknown error';
      secureLog('error', 'Notion service failed', {
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      // Log the specific Notion error for debugging (without sensitive data)
      if (notionResult.status === 'fulfilled' && !notionResult.value.success) {
        secureLog('error', 'Notion submission error', {
          code: notionResult.value.error?.code,
        });
      }
    }

    // If both services fail, return error
    if (!emailSuccess && !notionSuccess) {
      return NextResponse.json<ContactFormResponse>(
        {
          success: false,
          message: 'Unable to process your request. Please try again later.',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json<ContactFormResponse>(
      {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );

  } catch (error) {
    secureLog('error', 'Contact form API error', {
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json<ContactFormResponse>(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
    },
    { status: 405 }
  );
}