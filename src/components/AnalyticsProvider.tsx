'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics, Analytics } from '@/lib/analytics';

// Context Types
interface AnalyticsContextType {
  analytics: Analytics;
  isInitialized: boolean;
  hasConsent: boolean;
  setConsent: (consent: boolean) => void;
  trackEvent: Analytics['trackEvent'];
  trackPageView: Analytics['trackPageView'];
  trackCTAClick: Analytics['trackCTAClick'];
  trackFormSubmission: Analytics['trackFormSubmission'];
  trackScrollBehavior: Analytics['trackScrollBehavior'];
  trackProjectInteraction: Analytics['trackProjectInteraction'];
  trackCapabilityInteraction: Analytics['trackCapabilityInteraction'];
}

// Create Context
const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// Provider Props
interface AnalyticsProviderProps {
  children: ReactNode;
  autoTrackPageViews?: boolean;
  showConsentBanner?: boolean;
}

// Internal component that uses useSearchParams
const AnalyticsProviderInternal: React.FC<AnalyticsProviderProps> = ({
  children,
  autoTrackPageViews = true,
  showConsentBanner = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics and check consent
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Check existing consent
        const storedConsent = localStorage.getItem('analytics_consent');
        const consentGiven = storedConsent === 'true';
        
        setHasConsent(consentGiven);
        
        // Show banner if no consent decision has been made
        if (showConsentBanner && storedConsent === null) {
          setShowBanner(true);
        }

        // Initialize analytics if consent is given
        if (consentGiven) {
          await analytics.initialize();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    initializeAnalytics();
  }, [showConsentBanner]);

  // Handle consent changes
  const handleSetConsent = async (consent: boolean) => {
    setHasConsent(consent);
    setShowBanner(false);
    
    analytics.setConsent(consent);
    
    if (consent && !isInitialized) {
      await analytics.initialize();
    }
  };

  // Auto-track page views
  useEffect(() => {
    if (autoTrackPageViews && hasConsent && isInitialized) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      analytics.trackPageView(url);
    }
  }, [pathname, searchParams, autoTrackPageViews, hasConsent, isInitialized]);

  // Context value
  const contextValue: AnalyticsContextType = {
    analytics,
    isInitialized,
    hasConsent,
    setConsent: handleSetConsent,
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackCTAClick: analytics.trackCTAClick.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackScrollBehavior: analytics.trackScrollBehavior.bind(analytics),
    trackProjectInteraction: analytics.trackProjectInteraction.bind(analytics),
    trackCapabilityInteraction: analytics.trackCapabilityInteraction.bind(analytics),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
      
      {/* GDPR/CCPA Consent Banner */}
      {showBanner && (
        <ConsentBanner
          onAccept={() => handleSetConsent(true)}
          onDecline={() => handleSetConsent(false)}
        />
      )}
    </AnalyticsContext.Provider>
  );
};

/**
 * ConsentBanner Component
 * GDPR/CCPA compliant consent banner
 */
interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-space">
            Privacy & Analytics
          </h3>
          <p className="text-sm text-gray-600 font-cormorant leading-relaxed">
            We use analytics to understand how our website is used and to improve your experience. 
            We respect your privacy and only collect anonymized data. You can change your preferences at any time.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 min-w-max">
          <button
            onClick={onDecline}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors font-space"
            type="button"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-space"
            type="button"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * useAnalytics Hook
 * Provides access to analytics functionality
 */
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
};

/**
 * useScrollTracking Hook
 * Automatically tracks scroll behavior for a component
 */
export const useScrollTracking = (sectionName?: string) => {
  const { trackScrollBehavior, hasConsent } = useAnalytics();
  const [startTime] = useState(Date.now());
  
  useEffect(() => {
    if (!hasConsent) return;

    let ticking = false;
    let lastScrollDepth = 0;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollDepth = Math.round((scrollTop / docHeight) * 100);
          
          // Only track significant changes
          if (Math.abs(scrollDepth - lastScrollDepth) >= 5) {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            trackScrollBehavior(scrollDepth, timeOnPage, sectionName);
            lastScrollDepth = scrollDepth;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasConsent, trackScrollBehavior, sectionName, startTime]);
};

/**
 * useFormTracking Hook
 * Tracks form interactions and submissions
 */
export const useFormTracking = (formType: string) => {
  const { trackFormSubmission, trackEvent, hasConsent } = useAnalytics();
  
  const trackFormStart = () => {
    if (hasConsent) {
      trackEvent('form_start', 'engagement', formType);
    }
  };
  
  const trackFormField = (fieldName: string) => {
    if (hasConsent) {
      trackEvent('form_field_focus', 'engagement', `${formType}_${fieldName}`);
    }
  };
  
  const trackFormSubmit = (success: boolean, errorMessage?: string) => {
    if (hasConsent) {
      trackFormSubmission(formType, success, errorMessage);
    }
  };
  
  const trackFormError = (fieldName: string, errorMessage: string) => {
    if (hasConsent) {
      trackEvent('form_error', 'engagement', `${formType}_${fieldName}`, {
        error_message: errorMessage,
      });
    }
  };
  
  return {
    trackFormStart,
    trackFormField,
    trackFormSubmit,
    trackFormError,
  };
};

/**
 * useInteractionTracking Hook
 * Tracks user interactions with UI elements
 */
export const useInteractionTracking = () => {
  const { trackEvent, hasConsent } = useAnalytics();
  
  const trackClick = (element: string, location: string, details?: any) => {
    if (hasConsent) {
      trackEvent('click', 'interaction', `${element}_${location}`, details);
    }
  };
  
  const trackHover = (element: string, duration: number) => {
    if (hasConsent) {
      trackEvent('hover', 'interaction', element, { duration });
    }
  };
  
  const trackVideoPlay = (videoId: string, position: number) => {
    if (hasConsent) {
      trackEvent('video_play', 'media', videoId, { position });
    }
  };
  
  const trackVideoComplete = (videoId: string, duration: number) => {
    if (hasConsent) {
      trackEvent('video_complete', 'media', videoId, { duration });
    }
  };
  
  return {
    trackClick,
    trackHover,
    trackVideoPlay,
    trackVideoComplete,
  };
};

/**
 * AnalyticsProvider Component with Suspense wrapper
 * 
 * Provides analytics functionality throughout the app with:
 * - Automatic page view tracking
 * - Consent management (GDPR/CCPA compliant)
 * - Context-based analytics methods
 * - Automatic initialization
 * - Suspense boundary for useSearchParams
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = (props) => {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <AnalyticsProviderInternal {...props} />
    </Suspense>
  );
};

export default AnalyticsProvider;