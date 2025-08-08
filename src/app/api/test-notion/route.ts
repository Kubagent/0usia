import { NextResponse } from 'next/server';
import { checkNotionConnection } from '@/lib/notion';

export async function GET() {
  try {
    console.log('Testing Notion connection...');
    
    // Test the connection
    const connectionResult = await checkNotionConnection();
    
    // Return detailed connection status
    return NextResponse.json({
      success: true,
      connection: connectionResult,
      environment: {
        hasToken: !!process.env.NOTION_TOKEN && process.env.NOTION_TOKEN !== 'placeholder-notion-token',
        hasContactDbId: !!process.env.NOTION_CONTACT_DB_ID && process.env.NOTION_CONTACT_DB_ID !== 'placeholder-contact-db-id',
        hasVenturesDbId: !!process.env.NOTION_VENTURES_DB_ID && process.env.NOTION_VENTURES_DB_ID !== 'placeholder-ventures-db-id',
        hasCapabilitiesDbId: !!process.env.NOTION_CAPABILITIES_DB_ID && process.env.NOTION_CAPABILITIES_DB_ID !== 'placeholder-capabilities-db-id',
      },
      rawValues: {
        tokenLength: process.env.NOTION_TOKEN?.length || 0,
        contactDbIdLength: process.env.NOTION_CONTACT_DB_ID?.length || 0,
        venturesDbIdLength: process.env.NOTION_VENTURES_DB_ID?.length || 0,
        capabilitiesDbIdLength: process.env.NOTION_CAPABILITIES_DB_ID?.length || 0,
      }
    });
    
  } catch (error: any) {
    console.error('Notion connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code || 'TEST_ERROR',
        stack: error.stack
      },
      environment: {
        hasToken: !!process.env.NOTION_TOKEN && process.env.NOTION_TOKEN !== 'placeholder-notion-token',
        hasContactDbId: !!process.env.NOTION_CONTACT_DB_ID && process.env.NOTION_CONTACT_DB_ID !== 'placeholder-contact-db-id',
        hasVenturesDbId: !!process.env.NOTION_VENTURES_DB_ID && process.env.NOTION_VENTURES_DB_ID !== 'placeholder-ventures-db-id',
        hasCapabilitiesDbId: !!process.env.NOTION_CAPABILITIES_DB_ID && process.env.NOTION_CAPABILITIES_DB_ID !== 'placeholder-capabilities-db-id',
      }
    }, { status: 500 });
  }
}