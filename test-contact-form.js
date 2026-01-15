/**
 * Test Contact Form API
 *
 * This script tests the improved contact form handling
 * to ensure it properly handles different response scenarios.
 */

const testContactFormAPI = async () => {
  const baseUrl = 'http://localhost:3000'; // Adjust if different

  console.log('🧪 Testing Contact Form API...\n');

  // Test 1: Valid submission
  console.log('Test 1: Valid form submission');
  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        message: 'This is a test message',
        formType: 'Project',
        gdprConsent: true,
        marketingConsent: false,
        honeypot: '',
        source: 'api_test'
      }),
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', result);

    // Try to parse as JSON
    try {
      const jsonResult = JSON.parse(result);
      console.log('✅ Valid JSON response:', jsonResult);
    } catch (parseError) {
      console.log('❌ Failed to parse as JSON:', parseError.message);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Invalid submission (missing required fields)
  console.log('Test 2: Invalid submission (missing required fields)');
  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        gdprConsent: false,
        honeypot: ''
      }),
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    try {
      const jsonResult = JSON.parse(result);
      console.log('✅ Valid JSON error response:', jsonResult);
    } catch (parseError) {
      console.log('❌ Failed to parse error response as JSON:', parseError.message);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Wrong method (should return 405)
  console.log('Test 3: Wrong HTTP method (GET instead of POST)');
  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'GET',
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    try {
      const jsonResult = JSON.parse(result);
      console.log('✅ Valid JSON method error response:', jsonResult);
    } catch (parseError) {
      console.log('❌ Failed to parse method error as JSON:', parseError.message);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
};

// Check if we're in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch support or a browser environment');
  console.log('To run this test:');
  console.log('1. Start your Next.js development server: npm run dev');
  console.log('2. Open this file in a browser or run with Node.js 18+');
} else {
  testContactFormAPI().catch(console.error);
}