/**
 * Error Boundary Component for Notion CMS
 * 
 * Provides graceful error handling with fallback UI and error reporting
 * Integrates with the logging system for comprehensive error tracking
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
  showError?: boolean; // Show error details in development
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    };
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || 'application';
    
    // Log the error with full context
    logger.error('content', `Error boundary caught error in ${context}`, {
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props.context,
    }, error);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In development, also log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${context}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();
    }
  }

  private handleRetry = () => {
    logger.info('content', `Retrying after error: ${this.state.errorId}`);
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId(),
    });
  };

  private renderFallbackUI(): ReactNode {
    const { fallback, context, showError } = this.props;
    const { error, errorInfo, errorId } = this.state;
    
    // If custom fallback provided, use it
    if (fallback) {
      return fallback;
    }

    // Default fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              We encountered an error while loading {context || 'the page'}. 
              This might be a temporary issue with our content management system.
            </p>
            
            {process.env.NODE_ENV === 'development' && showError && error && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Development Error Details:
                </h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                  {error.message}
                </pre>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap mt-1">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Error ID: {errorId}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different contexts
export function NotionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      context="Notion CMS"
      showError={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-4xl font-cormorant mb-4">Content Unavailable</h1>
            <p className="text-xl font-space text-gray-300 mb-6">
              We're having trouble loading content from our CMS. 
              The site will fall back to default content.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ContentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      context="content rendering"
      showError={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="min-h-96 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Content temporarily unavailable</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling async errors in components
export function useErrorHandler() {
  return (error: Error, context: string = 'component') => {
    logger.error('content', `Async error in ${context}`, {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    }, error);

    // In development, also throw to trigger error boundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  };
}