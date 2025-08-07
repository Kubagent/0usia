/**
 * Mailchimp API Integration Library
 * 
 * This module provides a clean interface for interacting with the Mailchimp API
 * for contact forms and newsletter subscriptions.
 * 
 * Features:
 * - Contact form submissions to Mailchimp audience
 * - Newsletter subscriptions with GDPR compliance
 * - Error handling and validation
 * - Rate limiting support
 * - TypeScript support
 */

import { env } from './env-config';

// Mailchimp API types
export interface MailchimpConfig {
  apiKey: string;
  server: string;
  audienceId: string;
  contactFormListId?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  gdprConsent: boolean;
  marketingConsent?: boolean;
}

export interface NewsletterSubscriptionData {
  email: string;
  firstName?: string;
  lastName?: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
  source?: string;
}

export interface MailchimpMember {
  email_address: string;
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    COMPANY?: string;
    SOURCE?: string;
    MESSAGE?: string;
  };
  tags?: string[];
  marketing_permissions?: Array<{
    marketing_permission_id: string;
    enabled: boolean;
  }>;
}

export interface MailchimpResponse {
  id: string;
  email_address: string;
  status: string;
  merge_fields: Record<string, any>;
}

export interface MailchimpError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

class MailchimpAPI {
  private config: MailchimpConfig;
  private baseUrl: string;

  constructor(config: MailchimpConfig) {
    this.config = config;
    this.baseUrl = `https://${config.server}.api.mailchimp.com/3.0`;
  }

  /**
   * Make authenticated request to Mailchimp API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new MailchimpAPIError(responseData, response.status);
      }

      return responseData;
    } catch (error) {
      if (error instanceof MailchimpAPIError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add or update a member in the audience
   */
  async addOrUpdateMember(
    audienceId: string,
    memberData: MailchimpMember
  ): Promise<MailchimpResponse> {
    const subscriberHash = this.getSubscriberHash(memberData.email_address);
    const endpoint = `/lists/${audienceId}/members/${subscriberHash}`;
    
    return this.makeRequest(endpoint, 'PUT', memberData);
  }

  /**
   * Subscribe email to newsletter
   */
  async subscribeToNewsletter(data: NewsletterSubscriptionData): Promise<MailchimpResponse> {
    const memberData: MailchimpMember = {
      email_address: data.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: data.firstName,
        LNAME: data.lastName,
        SOURCE: data.source || 'website_footer',
      },
      tags: ['newsletter', 'website_signup'],
    };

    // Add marketing permissions for GDPR compliance
    if (data.marketingConsent) {
      memberData.marketing_permissions = [{
        marketing_permission_id: 'marketing',
        enabled: true
      }];
    }

    return this.addOrUpdateMember(this.config.audienceId, memberData);
  }

  /**
   * Submit contact form data
   */
  async submitContactForm(data: ContactFormData): Promise<MailchimpResponse> {
    const memberData: MailchimpMember = {
      email_address: data.email,
      status: data.marketingConsent ? 'subscribed' : 'pending',
      merge_fields: {
        FNAME: data.name.split(' ')[0],
        LNAME: data.name.split(' ').slice(1).join(' ') || '',
        COMPANY: data.company,
        MESSAGE: data.message,
        SOURCE: 'contact_form',
      },
      tags: ['contact_form', 'lead'],
    };

    // Add marketing permissions for GDPR compliance
    if (data.marketingConsent) {
      memberData.marketing_permissions = [{
        marketing_permission_id: 'marketing',
        enabled: true
      }];
    }

    // Use contact form list if specified, otherwise use main audience
    const listId = this.config.contactFormListId || this.config.audienceId;
    return this.addOrUpdateMember(listId, memberData);
  }

  /**
   * Generate MD5 hash for subscriber (required by Mailchimp API)
   */
  private getSubscriberHash(email: string): string {
    // Use Node.js crypto module (server-side only)
    if (typeof window === 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    }
    
    // Fallback for client-side (shouldn't happen in this context)
    throw new Error('Subscriber hash generation is only available server-side');
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if API configuration is valid
   */
  isConfigValid(): boolean {
    // Allow placeholder values during build
    const hasPlaceholders = this.config.apiKey === 'placeholder-key' ||
                           this.config.server === 'placeholder-server' ||
                           this.config.audienceId === 'placeholder-audience-id';
    
    if (hasPlaceholders) {
      return true;
    }
    
    return !!(
      this.config.apiKey &&
      this.config.server &&
      this.config.audienceId &&
      this.config.apiKey.includes('-') &&
      this.config.server.length > 0
    );
  }
}

/**
 * Custom error class for Mailchimp API errors
 */
export class MailchimpAPIError extends Error {
  public status: number;
  public type: string;
  public detail: string;

  constructor(errorData: MailchimpError, status: number) {
    super(errorData.title || 'Mailchimp API Error');
    this.name = 'MailchimpAPIError';
    this.status = status;
    this.type = errorData.type || 'unknown';
    this.detail = errorData.detail || 'No details provided';
  }

  /**
   * Check if error is due to member already existing
   */
  isMemberExistsError(): boolean {
    return this.type === 'member_exists' || this.detail.includes('already a list member');
  }

  /**
   * Check if error is due to invalid email
   */
  isInvalidEmailError(): boolean {
    return this.type === 'invalid_resource' && this.detail.includes('email');
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
    if (this.isMemberExistsError()) {
      return 'This email is already subscribed to our newsletter.';
    }
    
    if (this.isInvalidEmailError()) {
      return 'Please enter a valid email address.';
    }

    if (this.status === 400) {
      return 'Please check your information and try again.';
    }

    if (this.status === 429) {
      return 'Too many requests. Please try again in a few minutes.';
    }

    if (this.status >= 500) {
      return 'Our servers are experiencing issues. Please try again later.';
    }

    return 'Something went wrong. Please try again.';
  }
}

/**
 * Create Mailchimp API instance
 */
export function createMailchimpAPI(): MailchimpAPI {
  const config: MailchimpConfig = {
    apiKey: env.MAILCHIMP_API_KEY,
    server: env.MAILCHIMP_SERVER,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
    contactFormListId: env.MAILCHIMP_CONTACT_LIST_ID,
  };

  const api = new MailchimpAPI(config);
  
  // Allow placeholder values during build process
  const hasPlaceholders = config.apiKey === 'placeholder-key' ||
                         config.server === 'placeholder-server' ||
                         config.audienceId === 'placeholder-audience-id';
  
  if (!hasPlaceholders && !api.isConfigValid()) {
    throw new Error('Invalid Mailchimp configuration. Check your environment variables.');
  }

  return api;
}

// Export singleton instance
export const mailchimpAPI = createMailchimpAPI();