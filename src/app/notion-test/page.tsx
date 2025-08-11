'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  connection?: any;
  environment?: any;
  rawValues?: any;
  error?: any;
}

export default function NotionTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-notion');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: { message: 'Failed to run test', details: error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testContactForm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('message', 'This is a test submission');
      formData.append('formType', 'Partnership');

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        connection: result,
        environment: { testType: 'Contact Form Submission' }
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: { message: 'Contact form test failed', details: error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notion Integration Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runTest}
            disabled={isLoading}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Notion Connection'}
          </button>
          
          <button
            onClick={testContactForm}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 ml-4"
          >
            {isLoading ? 'Testing...' : 'Test Contact Form'}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
            </h2>
            
            {testResult.environment && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Environment Check:</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  {Object.entries(testResult.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className={value ? 'text-green-600' : 'text-red-600'}>
                        {value ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResult.rawValues && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Configuration Values:</h3>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  {Object.entries(testResult.rawValues).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResult.connection && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Connection Details:</h3>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(testResult.connection, null, 2)}
                </pre>
              </div>
            )}

            {testResult.error && (
              <div className="mb-4">
                <h3 className="font-medium mb-2 text-red-600">Error Details:</h3>
                <pre className="bg-red-50 p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Update your <code>.env.local</code> file with real Notion token and database IDs</li>
            <li>Click "Test Notion Connection" to verify the setup</li>
            <li>If connection works, try "Test Contact Form" to test full submission</li>
            <li>Check your Notion database for the test submission</li>
          </ol>
        </div>
      </div>
    </div>
  );
}