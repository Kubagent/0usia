/**
 * Notion API Client
 * 
 * Handles authentication and communication with Notion API
 * Provides type-safe methods for fetching content from Notion databases
 */

import { Client } from '@notionhq/client';
import type {
  NotionVenture,
  NotionCapability,
  NotionSiteCopy,
  NotionAsset,
  NotionContactSubmission,
  NotionDatabaseResponse,
  NotionError,
  ContentFetchResult,
  NotionDatabaseConfig,
  ContactFormData,
  ContactSubmissionResult
} from '@/types/notion';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/**
 * Utility function to clean Notion database ID
 * Removes view parameters and other URL artifacts to get a clean UUID
 */
function cleanNotionDatabaseId(id: string): string {
  if (!id) return '';
  
  // Remove view parameters (everything after ?)
  const cleanId = id.split('?')[0];
  
  // Remove dashes and validate it's a 32-character hex string
  const normalizedId = cleanId.replace(/-/g, '');
  
  if (normalizedId.length === 32 && /^[0-9a-f]+$/i.test(normalizedId)) {
    return normalizedId;
  }
  
  console.warn(`Invalid Notion database ID format: ${id}`);
  return cleanId; // Return as-is if we can't validate it
}

// Database IDs configuration with cleaning
export const NOTION_DATABASES: NotionDatabaseConfig = {
  ventures: cleanNotionDatabaseId(process.env.NOTION_VENTURES_DB_ID || ''),
  capabilities: cleanNotionDatabaseId(process.env.NOTION_CAPABILITIES_DB_ID || ''),
  siteCopy: cleanNotionDatabaseId(process.env.NOTION_SITE_COPY_DB_ID || ''),
  assets: cleanNotionDatabaseId(process.env.NOTION_ASSETS_DB_ID || ''),
  contactSubmissions: cleanNotionDatabaseId(process.env.NOTION_CONTACT_DB_ID || ''),
};

/**
 * Generic function to fetch from any Notion database
 */
async function fetchNotionDatabase<T>(
  databaseId: string,
  filter?: any,
  sorts?: any[]
): Promise<ContentFetchResult<T[]>> {
  try {
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
    });

    return {
      data: response.results as T[],
      error: null,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  } catch (error: any) {
    console.error(`Error fetching from Notion database ${databaseId}:`, error);
    
    const notionError: NotionError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to fetch from Notion',
      status: error.status || 500,
    };

    return {
      data: null,
      error: notionError,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Fetch ventures/portfolio companies
 */
export async function fetchVentures(): Promise<ContentFetchResult<NotionVenture[]>> {
  return fetchNotionDatabase<NotionVenture>(
    NOTION_DATABASES.ventures,
    {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
    [
      {
        property: 'Sort Order',
        direction: 'ascending',
      },
    ]
  );
}

/**
 * Fetch capabilities/services
 */
export async function fetchCapabilities(): Promise<ContentFetchResult<NotionCapability[]>> {
  return fetchNotionDatabase<NotionCapability>(
    NOTION_DATABASES.capabilities,
    {
      property: 'Status',
      select: {
        equals: 'Active',
      },
    },
    [
      {
        property: 'Sort Order',
        direction: 'ascending',
      },
    ]
  );
}

/**
 * Fetch site copy/content
 */
export async function fetchSiteCopy(): Promise<ContentFetchResult<NotionSiteCopy[]>> {
  return fetchNotionDatabase<NotionSiteCopy>(
    NOTION_DATABASES.siteCopy,
    {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    }
  );
}

/**
 * Fetch assets
 */
export async function fetchAssets(): Promise<ContentFetchResult<NotionAsset[]>> {
  return fetchNotionDatabase<NotionAsset>(
    NOTION_DATABASES.assets,
    {
      property: 'Status',
      select: {
        equals: 'Active',
      },
    }
  );
}

/**
 * Fetch specific site copy by section name
 */
export async function fetchSiteCopyBySection(sectionName: string): Promise<ContentFetchResult<NotionSiteCopy[]>> {
  return fetchNotionDatabase<NotionSiteCopy>(
    NOTION_DATABASES.siteCopy,
    {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
        {
          property: 'Section Name',
          title: {
            equals: sectionName,
          },
        },
      ],
    }
  );
}

/**
 * Fetch assets by usage context
 */
export async function fetchAssetsByContext(context: string): Promise<ContentFetchResult<NotionAsset[]>> {
  return fetchNotionDatabase<NotionAsset>(
    NOTION_DATABASES.assets,
    {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Active',
          },
        },
        {
          property: 'Usage Context',
          multi_select: {
            contains: context,
          },
        },
      ],
    }
  );
}

/**
 * Health check for Notion API connection
 */
export async function checkNotionConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  databases: {
    [key in keyof NotionDatabaseConfig]: boolean;
  };
}> {
  const result = {
    isConnected: false,
    databases: {
      ventures: false,
      capabilities: false,
      siteCopy: false,
      assets: false,
      contactSubmissions: false,
    } as { [key in keyof NotionDatabaseConfig]: boolean },
  };

  try {
    // Test basic API connection
    await notion.users.me({});
    result.isConnected = true;

    // Test each database
    for (const [key, databaseId] of Object.entries(NOTION_DATABASES)) {
      if (databaseId) {
        try {
          console.log(`Testing database ${key} with ID: ${databaseId}`);
          const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
          console.log(`Database ${key} is accessible:`, dbInfo.title);
          result.databases[key as keyof NotionDatabaseConfig] = true;
        } catch (error: any) {
          console.warn(`Database ${key} (${databaseId}) is not accessible:`, {
            code: error.code,
            message: error.message,
            status: error.status
          });
        }
      } else {
        console.warn(`Database ${key} has no ID configured`);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Failed to connect to Notion API:', error);
    return {
      ...result,
      error: error.message || 'Failed to connect to Notion API',
    };
  }
}

/**
 * Test the contact form submission specifically
 */
export async function testContactFormSubmission(): Promise<{
  success: boolean;
  error?: string;
  databaseId?: string;
  databaseInfo?: any;
}> {
  try {
    const databaseId = NOTION_DATABASES.contactSubmissions;
    
    if (!databaseId) {
      return {
        success: false,
        error: 'Contact submissions database ID is not configured'
      };
    }

    console.log('Testing contact form database with ID:', databaseId);

    // Retrieve database info
    const databaseInfo = await notion.databases.retrieve({ database_id: databaseId });
    
    console.log('Contact form database info:', {
      title: databaseInfo.title,
      properties: Object.keys(databaseInfo.properties || {}),
    });

    return {
      success: true,
      databaseId,
      databaseInfo: {
        title: databaseInfo.title,
        properties: Object.keys(databaseInfo.properties || {}),
      }
    };

  } catch (error: any) {
    console.error('Contact form database test failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      databaseId: NOTION_DATABASES.contactSubmissions
    };
  }
}

/**
 * Utility function to extract rich text content
 */
export function extractRichTextContent(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) {
    return '';
  }
  
  return richText
    .map((text) => text.plain_text || '')
    .join('');
}

/**
 * Utility function to extract file URL
 */
export function extractFileUrl(files: any[]): string {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return '';
  }
  
  const file = files[0];
  return file.type === 'file' ? file.file.url : file.external.url;
}

/**
 * Utility function to extract select property
 */
export function extractSelectProperty(select: any): string {
  return select?.name || '';
}

/**
 * Utility function to extract multi-select properties
 */
export function extractMultiSelectProperties(multiSelect: any[]): string[] {
  if (!multiSelect || !Array.isArray(multiSelect)) {
    return [];
  }
  
  return multiSelect.map((item) => item.name);
}

/**
 * Utility function to extract number property
 */
export function extractNumberProperty(number: any): number {
  return number || 0;
}

/**
 * Utility function to extract URL property
 */
export function extractUrlProperty(url: any): string {
  return url || '';
}

/**
 * CONTACT FORM SUBMISSION FUNCTIONS
 */

/**
 * Submit contact form to Notion database
 */
export async function submitContactForm(formData: ContactFormData): Promise<ContactSubmissionResult> {
  try {
    if (!NOTION_DATABASES.contactSubmissions) {
      throw new Error('Contact submissions database ID is not configured');
    }

    // Validate database ID format
    if (NOTION_DATABASES.contactSubmissions.length !== 32 || !/^[0-9a-f]+$/i.test(NOTION_DATABASES.contactSubmissions)) {
      console.error('Invalid database ID format:', NOTION_DATABASES.contactSubmissions);
      throw new Error(`Invalid database ID format: ${NOTION_DATABASES.contactSubmissions}`);
    }

    // Prepare the properties for Notion page creation
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: formData.name,
            },
          },
        ],
      },
      Email: {
        email: formData.email,
      },
      'Form Type': {
        select: {
          name: formData.formType,
        },
      },
      Status: {
        select: {
          name: 'New',
        },
      },
      Priority: {
        select: {
          name: 'Medium',
        },
      },
    };

    // Add phone if provided
    if (formData.phone) {
      properties.Phone = {
        phone_number: formData.phone,
      };
    }

    // Add message if provided
    if (formData.message) {
      properties.Message = {
        rich_text: [
          {
            text: {
              content: formData.message,
            },
          },
        ],
      };
    }

    // Handle file attachment if provided
    if (formData.attachment) {
      // For now, we'll note that a file was attached
      // In a full implementation, you'd upload to Notion or external storage first
      properties['Internal Notes'] = {
        rich_text: [
          {
            text: {
              content: `File attachment: ${formData.attachment.name} (${Math.round(formData.attachment.size / 1024)}KB)`,
            },
          },
        ],
      };
    }

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASES.contactSubmissions,
      },
      properties,
    });

    return {
      success: true,
      submissionId: response.id,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error('Error submitting contact form to Notion:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to submit contact form to database';
    let errorCode = error.code || 'SUBMISSION_ERROR';
    
    if (error.code === 'object_not_found') {
      errorMessage = 'Contact database not found or not accessible. Please check integration permissions.';
    } else if (error.code === 'unauthorized') {
      errorMessage = 'Unauthorized access to Notion. Please check the integration token.';
    } else if (error.code === 'validation_error') {
      errorMessage = 'Invalid data format. Please check the form fields.';
    } else if (error.code === 'rate_limited') {
      errorMessage = 'Too many requests to Notion. Please try again in a few minutes.';
    } else if (error.message && error.message.includes('database_id should be a valid uuid')) {
      errorMessage = 'Database ID configuration error. Please check NOTION_CONTACT_DB_ID environment variable.';
    }
    
    const notionError: NotionError = {
      code: errorCode,
      message: errorMessage,
      status: error.status || 500,
    };

    return {
      success: false,
      error: notionError,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetch contact submissions (for admin use)
 */
export async function fetchContactSubmissions(
  status?: 'New' | 'In Progress' | 'Responded' | 'Closed',
  limit?: number
): Promise<ContentFetchResult<NotionContactSubmission[]>> {
  try {
    if (!NOTION_DATABASES.contactSubmissions) {
      throw new Error('Contact submissions database ID is not configured');
    }

    const filter = status ? {
      property: 'Status',
      select: {
        equals: status,
      },
    } : undefined;

    const response = await notion.databases.query({
      database_id: NOTION_DATABASES.contactSubmissions,
      filter,
      sorts: [
        {
          property: 'Submitted',
          direction: 'descending',
        },
      ],
      page_size: limit || 100,
    });

    return {
      data: response.results as unknown as NotionContactSubmission[],
      error: null,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };

  } catch (error: any) {
    console.error('Error fetching contact submissions from Notion:', error);
    
    const notionError: NotionError = {
      code: error.code || 'FETCH_ERROR',
      message: error.message || 'Failed to fetch contact submissions',
      status: error.status || 500,
    };

    return {
      data: null,
      error: notionError,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Update contact submission status
 */
export async function updateContactSubmissionStatus(
  submissionId: string,
  status: 'New' | 'In Progress' | 'Responded' | 'Closed',
  internalNotes?: string
): Promise<ContactSubmissionResult> {
  try {
    const properties: any = {
      Status: {
        select: {
          name: status,
        },
      },
    };

    if (internalNotes) {
      properties['Internal Notes'] = {
        rich_text: [
          {
            text: {
              content: internalNotes,
            },
          },
        ],
      };
    }

    await notion.pages.update({
      page_id: submissionId,
      properties,
    });

    return {
      success: true,
      submissionId,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error('Error updating contact submission status:', error);
    
    const notionError: NotionError = {
      code: error.code || 'UPDATE_ERROR',
      message: error.message || 'Failed to update contact submission',
      status: error.status || 500,
    };

    return {
      success: false,
      error: notionError,
      timestamp: new Date().toISOString(),
    };
  }
}