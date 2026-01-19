/**
 * Contact Form API Route
 * 
 * Handles contact form submissions with:
 * - Email notifications via Resend
 * - Storage in Notion database
 * - Rate limiting and validation
 * - Proper error handling
 */

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { emailService, ContactFormData as EmailFormData } from '@/lib/email';
import { submitContactForm } from '@/lib/notion';
import { ContactFormData as NotionFormData } from '@/types/notion';
import { validateContactForm, ContactFormValidationData } from '@/lib/validation';
import { checkMultipleRateLimits, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

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

    // Parse request body
    let body: ContactFormRequest;
    try {
      body = await request.json();
    } catch (error) {
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
      console.warn('Honeypot field filled, likely spam:', body);
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
      console.error('Email service failed:', error);
      
      // Log more details for debugging
      if (error instanceof Error) {
        console.error('Email error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
    
    if (!notionSuccess) {
      const error = notionResult.status === 'rejected' ? notionResult.reason : 'Unknown error';
      console.error('Notion service failed:', error);
      
      // Log more details for debugging
      if (error instanceof Error) {
        console.error('Notion error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      
      // Log the specific Notion error for debugging
      if (notionResult.status === 'fulfilled' && !notionResult.value.success) {
        console.error('Notion submission error:', notionResult.value.error);
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
    console.error('Contact form API error:', error);
    
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