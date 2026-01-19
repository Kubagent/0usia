/**
 * Email Service with Resend API Integration
 * 
 * This module provides email functionality for contact form notifications
 * using the Resend API service.
 * 
 * Features:
 * - Contact form email notifications
 * - Professional email templates
 * - Error handling and validation
 * - Rate limiting support
 * - TypeScript support
 */

import { Resend } from 'resend';

// Email configuration
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  isValidConfig: boolean;
}

// Attachment data interface
export interface AttachmentData {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
  size: number;
}

// Contact form data interface
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  source?: string;
  formType?: string;
  attachment?: AttachmentData;
}

// Email template data
export interface EmailTemplateData {
  name: string;
  email: string;
  company?: string;
  message: string;
  source: string;
  formType: string;
  submissionTime: string;
  attachmentInfo?: {
    filename: string;
    size: number;
  };
}

// Email response interface
export interface EmailResponse {
  id: string;
  success: boolean;
}

// Email error class
export class EmailError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'EmailError';
    this.status = status;
    this.code = code;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
    if (this.code === 'DOMAIN_NOT_VERIFIED') {
      return 'Email service configuration issue. Please try again later or contact support.';
    }

    if (this.status === 400) {
      return 'Invalid email data. Please check your information and try again.';
    }

    if (this.status === 401) {
      return 'Email service configuration error. Please try again later.';
    }

    if (this.status === 403) {
      return 'Email service temporarily unavailable. Please try again later.';
    }

    if (this.status === 429) {
      return 'Too many email requests. Please try again in a few minutes.';
    }

    if (this.status >= 500) {
      return 'Email service is temporarily unavailable. Please try again later.';
    }

    return 'Unable to send email. Please try again.';
  }
}

/**
 * Load email configuration from environment variables
 */
export function loadEmailConfig(): EmailConfig {
  const config: EmailConfig = {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@ovsia.com',
    toEmail: process.env.RESEND_TO_EMAIL || 'hello@ovsia.com',
    isValidConfig: false,
  };

  // Allow placeholder values during build
  const hasPlaceholders = config.apiKey === 'placeholder-key' ||
                         config.fromEmail === 'placeholder-from@example.com' ||
                         config.toEmail === 'placeholder-to@example.com';

  config.isValidConfig = hasPlaceholders || !!(
    config.apiKey &&
    config.fromEmail &&
    config.toEmail &&
    config.apiKey.startsWith('re_') &&
    config.fromEmail.includes('@') &&
    config.toEmail.includes('@')
  );

  return config;
}

/**
 * Create HTML email template for contact form submissions
 */
function createContactEmailHTML(data: EmailTemplateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission - ${data.formType}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            color: #666666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .field {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f1f3f4;
        }
        .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .field-label {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .field-value {
            color: #333333;
            font-size: 16px;
            word-wrap: break-word;
        }
        .message-field .field-value {
            white-space: pre-wrap;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #0066cc;
        }
        .footer {
            margin-top: 30px;
            padding: 20px;
            text-align: center;
            color: #666666;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .meta-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 12px;
            color: #666666;
        }
        .priority-high {
            border-left: 4px solid #dc3545;
        }
        .priority-normal {
            border-left: 4px solid #0066cc;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New ${data.formType} Submission</h1>
        <p>Contact form submission received from ${data.source}</p>
    </div>
    
    <div class="content ${data.formType === 'Investment' ? 'priority-high' : 'priority-normal'}">
        <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${data.name}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
                <a href="mailto:${data.email}" style="color: #0066cc; text-decoration: none;">${data.email}</a>
            </div>
        </div>
        
        ${data.company ? `
        <div class="field">
            <div class="field-label">Company</div>
            <div class="field-value">${data.company}</div>
        </div>
        ` : ''}
        
        <div class="field message-field">
            <div class="field-label">Message</div>
            <div class="field-value">${data.message}</div>
        </div>
        
        <div class="meta-info">
            <strong>Submission Details:</strong><br>
            Form Type: ${data.formType}<br>
            Source: ${data.source}<br>
            Time: ${data.submissionTime}<br>
            ${data.formType === 'Investment' ? '<strong>Priority:</strong> High - Investment Inquiry<br>' : ''}
            ${data.attachmentInfo ? `<strong>Attachment:</strong> ${data.attachmentInfo.filename} (${Math.round(data.attachmentInfo.size / 1024)}KB) - See attached file<br>` : ''}
        </div>
    </div>
    
    <div class="footer">
        <p>This email was automatically generated from the 0usia contact form.</p>
        <p>To reply to this inquiry, simply respond to this email or contact ${data.email} directly.</p>
    </div>
</body>
</html>`;
}

/**
 * Create plain text email template for contact form submissions
 */
function createContactEmailText(data: EmailTemplateData): string {
  return `
New ${data.formType} Submission

Contact Details:
================
Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}

Message:
========
${data.message}

Submission Details:
==================
Form Type: ${data.formType}
Source: ${data.source}
Time: ${data.submissionTime}
${data.formType === 'Investment' ? 'Priority: High - Investment Inquiry' : ''}
${data.attachmentInfo ? `Attachment: ${data.attachmentInfo.filename} (${Math.round(data.attachmentInfo.size / 1024)}KB) - See attached file` : ''}

---
This email was automatically generated from the 0usia contact form.
To reply to this inquiry, contact ${data.email} directly.
  `;
}

/**
 * Email service class
 */
class EmailService {
  private resend: Resend | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = loadEmailConfig();
  }

  private getResend(): Resend {
    if (!this.resend) {
      if (!this.config.isValidConfig) {
        throw new EmailError('Email service is not properly configured', 500, 'CONFIG_ERROR');
      }
      this.resend = new Resend(this.config.apiKey);
    }
    return this.resend;
  }

  /**
   * Send contact form notification email
   */
  async sendContactFormEmail(data: ContactFormData): Promise<EmailResponse> {
    try {
      const resend = this.getResend();
      const templateData: EmailTemplateData = {
        name: data.name,
        email: data.email,
        company: data.company,
        message: data.message,
        source: data.source || 'unknown',
        formType: data.formType || 'Contact',
        submissionTime: new Date().toLocaleString('en-US', {
          timeZone: 'Europe/Berlin',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        attachmentInfo: data.attachment ? {
          filename: data.attachment.filename,
          size: data.attachment.size,
        } : undefined,
      };

      const subject = `0usia Contact Form - ${templateData.formType} from ${templateData.name}${data.attachment ? ' [Attachment]' : ''}`;

      // Build email options
      const emailOptions: any = {
        from: this.config.fromEmail,
        to: [this.config.toEmail],
        subject: subject,
        html: createContactEmailHTML(templateData),
        text: createContactEmailText(templateData),
        replyTo: data.email,
      };

      // Add attachment if provided
      if (data.attachment) {
        emailOptions.attachments = [
          {
            filename: data.attachment.filename,
            content: data.attachment.content, // base64 string
          },
        ];
      }

      const result = await resend.emails.send(emailOptions);

      if (result.error) {
        throw new EmailError(
          `Failed to send email: ${result.error.message}`,
          400,
          result.error.name
        );
      }

      return {
        id: result.data?.id || 'unknown',
        success: true,
      };

    } catch (error) {
      if (error instanceof EmailError) {
        throw error;
      }

      console.error('Resend API error details:', error);

      // Handle Resend API errors with better error detection
      if (error && typeof error === 'object') {
        const resendError = error as any;
        
        // Check for domain verification error
        if (resendError.error?.includes('domain is not verified') || 
            resendError.message?.includes('domain is not verified')) {
          throw new EmailError(
            'Email domain not verified. Please verify the domain in Resend console.',
            403,
            'DOMAIN_NOT_VERIFIED'
          );
        }

        // Check for invalid API key
        if (resendError.error?.includes('Invalid API key') || 
            resendError.message?.includes('Invalid API key') ||
            resendError.statusCode === 401) {
          throw new EmailError('Invalid email service configuration', 401, 'INVALID_API_KEY');
        }
        
        // Check for rate limit
        if (resendError.error?.includes('Rate limit') || 
            resendError.message?.includes('Rate limit') ||
            resendError.statusCode === 429) {
          throw new EmailError('Email rate limit exceeded', 429, 'RATE_LIMIT');
        }

        // Check for validation errors
        if (resendError.name === 'validation_error' || resendError.statusCode === 403) {
          const errorMsg = resendError.error || resendError.message || 'Validation error';
          throw new EmailError(
            `Email validation error: ${errorMsg}`,
            403,
            'VALIDATION_ERROR'
          );
        }

        // Generic Resend error with status code
        if (resendError.statusCode) {
          const errorMsg = resendError.error || resendError.message || 'Unknown API error';
          throw new EmailError(
            `Email service error: ${errorMsg}`,
            resendError.statusCode,
            'API_ERROR'
          );
        }

        // Fallback for other structured errors
        if (resendError.message || resendError.error) {
          const errorMsg = resendError.error || resendError.message;
          throw new EmailError(
            `Email service error: ${errorMsg}`,
            500,
            'SERVICE_ERROR'
          );
        }
      }

      // Handle generic errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new EmailError(
        `Unknown email service error: ${errorMessage}`,
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Validate email configuration
   */
  isConfigured(): boolean {
    return this.config.isValidConfig;
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    fromEmail: string;
    toEmail: string;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.config.apiKey || this.config.apiKey === 'placeholder-key') {
      errors.push('RESEND_API_KEY is missing or invalid');
    }

    if (!this.config.fromEmail || !this.config.fromEmail.includes('@')) {
      errors.push('RESEND_FROM_EMAIL is missing or invalid');
    }

    if (!this.config.toEmail || !this.config.toEmail.includes('@')) {
      errors.push('RESEND_TO_EMAIL is missing or invalid');
    }

    return {
      configured: this.config.isValidConfig,
      fromEmail: this.config.fromEmail,
      toEmail: this.config.toEmail,
      errors,
    };
  }

  /**
   * Check if domains are verified in Resend
   */
  async checkDomainVerification(): Promise<{
    verified: boolean;
    domains: Array<{ name: string; status: string }>;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const resend = this.getResend();
      const result = await resend.domains.list();
      
      if (result.error) {
        errors.push(`Domain check failed: ${result.error.message || result.error}`);
        return { verified: false, domains: [], errors };
      }

      const domains = result.data || [];
      const fromDomain = this.config.fromEmail.split('@')[1];
      const domainInfo = domains.find(d => d.name === fromDomain);
      
      return {
        verified: domainInfo ? domainInfo.status === 'verified' : false,
        domains: domains.map(d => ({ name: d.name, status: d.status })),
        errors,
      };
    } catch (error) {
      errors.push(`Domain verification check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { verified: false, domains: [], errors };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Validation utility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Export for testing
export { EmailService };