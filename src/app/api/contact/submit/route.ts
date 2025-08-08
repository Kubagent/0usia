import { NextRequest, NextResponse } from 'next/server';
import { submitContactForm } from '@/lib/notion';
import type { ContactFormData } from '@/types/notion';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const formType = formData.get('formType') as 'Partnership' | 'Project' | 'Investment';
    const attachment = formData.get('attachment') as File;

    // Validate required fields
    if (!name || !email || !formType) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: 'Name, email, and form type are required' 
          } 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format' 
          } 
        },
        { status: 400 }
      );
    }

    // Validate attachment size (10MB limit)
    if (attachment && attachment.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: 'File size must be less than 10MB' 
          } 
        },
        { status: 400 }
      );
    }

    // Special validation for Investment form
    if (formType === 'Investment' && !attachment) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: 'Pitch deck attachment is required for investment inquiries' 
          } 
        },
        { status: 400 }
      );
    }

    // Prepare contact form data
    const contactData: ContactFormData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      message: message?.trim() || undefined,
      formType,
      attachment: attachment || undefined,
    };

    // Submit to Notion
    const result = await submitContactForm(contactData);

    if (!result.success) {
      console.error('Contact form submission failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || {
            code: 'SUBMISSION_ERROR',
            message: 'Failed to submit contact form'
          }
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      timestamp: result.timestamp,
      message: 'Contact form submitted successfully'
    });

  } catch (error: any) {
    console.error('Contact form API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}