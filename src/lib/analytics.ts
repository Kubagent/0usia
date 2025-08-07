/**
 * Analytics Configuration and Event Tracking System
 * 
 * Features:
 * - Google Analytics 4 integration
 * - Privacy-compliant tracking (GDPR/CCPA)
 * - Custom business metrics
 * - Performance monitoring integration
 * - Event batching and optimization
 * - Debug mode for development
 */

// Types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface UserProperties {
  user_id?: string;
  session_id?: string;
  page_title?: string;
  page_location?: string;
  client_id?: string;
  language?: string;
  screen_resolution?: string;
  user_agent?: string;
  referrer?: string;
}

export interface ConversionEvent {
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price?: number;
    quantity?: number;
  }>;
}

export interface PerformanceMetrics {
  page_load_time?: number;
  first_contentful_paint?: number;
  largest_contentful_paint?: number;
  first_input_delay?: number;
  cumulative_layout_shift?: number;
  time_to_interactive?: number;
}

// Configuration
const ANALYTICS_CONFIG = {
  GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
  MATOMO_SITE_ID: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '',
  MATOMO_URL: process.env.NEXT_PUBLIC_MATOMO_URL || '',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  BATCH_SIZE: 10,
  BATCH_TIMEOUT: 5000, // 5 seconds
  PRIVACY_MODE: true,
  RESPECT_DNT: true, // Respect Do Not Track header
};

// Event batching for performance
let eventBatch: AnalyticsEvent[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

// Privacy compliance checks
const isTrackingAllowed = (): boolean => {
  // Check Do Not Track header
  if (ANALYTICS_CONFIG.RESPECT_DNT && navigator.doNotTrack === '1') {
    return false;
  }

  // Check for stored consent (GDPR compliance)
  if (typeof window !== 'undefined') {
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'false' || (!consent && ANALYTICS_CONFIG.PRIVACY_MODE)) {
      return false;
    }
  }

  return true;
};

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (ANALYTICS_CONFIG.DEBUG_MODE) {
    console.log(`[Analytics] ${message}`, data || '');
  }
};

// Google Analytics 4 functions
const initializeGA4 = () => {
  if (!ANALYTICS_CONFIG.GA4_MEASUREMENT_ID || typeof window === 'undefined') {
    debugLog('GA4 not initialized - missing measurement ID or server-side');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).gtag = (window as any).gtag || function (...args: any[]) {
    ((window as any).gtag.q = (window as any).gtag.q || []).push(args);
  };
  (window as any).gtag.l = +new Date();

  // Configure GA4
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    restricted_data_processing: ANALYTICS_CONFIG.PRIVACY_MODE,
  });

  debugLog('GA4 initialized', { measurement_id: ANALYTICS_CONFIG.GA4_MEASUREMENT_ID });
};

// Matomo functions
const initializeMatomo = () => {
  if (!ANALYTICS_CONFIG.MATOMO_SITE_ID || !ANALYTICS_CONFIG.MATOMO_URL || typeof window === 'undefined') {
    debugLog('Matomo not initialized - missing configuration');
    return;
  }

  window._paq = window._paq || [];
  
  // Configure Matomo for privacy compliance
  window._paq.push(['requireCookieConsent']);
  window._paq.push(['setDoNotTrack', ANALYTICS_CONFIG.RESPECT_DNT]);
  window._paq.push(['disableCookies']);
  window._paq.push(['trackPageView']);
  window._paq.push(['enableLinkTracking']);

  const script = document.createElement('script');
  script.src = `${ANALYTICS_CONFIG.MATOMO_URL}/matomo.js`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  debugLog('Matomo initialized', { site_id: ANALYTICS_CONFIG.MATOMO_SITE_ID });
};

// Event tracking functions
const trackGA4Event = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const eventData: Record<string, any> = {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.custom_parameters,
  };

  window.gtag('event', event.action, eventData);
  debugLog('GA4 event tracked', { action: event.action, data: eventData });
};

const trackMatomoEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window._paq) return;

  window._paq.push([
    'trackEvent',
    event.category,
    event.action,
    event.label,
    event.value
  ]);

  debugLog('Matomo event tracked', event);
};

// Batch processing
const processBatch = () => {
  if (eventBatch.length === 0) return;

  const events = [...eventBatch];
  eventBatch = [];

  events.forEach(event => {
    trackGA4Event(event);
    trackMatomoEvent(event);
  });

  debugLog('Processed event batch', { count: events.length });
};

const addToBatch = (event: AnalyticsEvent) => {
  eventBatch.push(event);

  if (eventBatch.length >= ANALYTICS_CONFIG.BATCH_SIZE) {
    processBatch();
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
  } else if (!batchTimeout) {
    batchTimeout = setTimeout(processBatch, ANALYTICS_CONFIG.BATCH_TIMEOUT);
  }
};

// Main Analytics Class
export class Analytics {
  private static instance: Analytics;
  private initialized = false;
  private userProperties: UserProperties = {};

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    debugLog('Initializing analytics...');

    // Check privacy compliance
    if (!isTrackingAllowed()) {
      debugLog('Tracking not allowed - respecting user privacy');
      return;
    }

    // Initialize tracking services
    initializeGA4();
    initializeMatomo();

    // Set up user properties
    this.setupUserProperties();

    // Set up performance monitoring
    this.setupPerformanceTracking();

    // Set up error tracking
    this.setupErrorTracking();

    this.initialized = true;
    debugLog('Analytics initialized successfully');
  }

  private setupUserProperties() {
    this.userProperties = {
      session_id: this.generateSessionId(),
      page_title: document.title,
      page_location: window.location.href,
      language: navigator.language,
      screen_resolution: `${screen.width}x${screen.height}`,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPerformanceTracking() {
    // Web Vitals tracking
    if ('web-vital' in window) {
      this.trackWebVitals();
    }

    // Custom performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => this.trackPerformanceMetrics(), 1000);
    });
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'promise_rejection', event.reason?.toString() || 'Unknown', {
        promise: event.promise,
      });
    });
  }

  private trackWebVitals() {
    // This would integrate with web-vitals library if available
    try {
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => this.trackPerformanceMetric('CLS', metric.value));
        onFID((metric) => this.trackPerformanceMetric('FID', metric.value));
        onFCP((metric) => this.trackPerformanceMetric('FCP', metric.value));
        onLCP((metric) => this.trackPerformanceMetric('LCP', metric.value));
        onTTFB((metric) => this.trackPerformanceMetric('TTFB', metric.value));
      });
    } catch (error) {
      debugLog('Web Vitals not available');
    }
  }

  private trackPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics: PerformanceMetrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        first_contentful_paint: this.getPerformanceMetric('first-contentful-paint'),
        largest_contentful_paint: this.getPerformanceMetric('largest-contentful-paint'),
        time_to_interactive: navigation.domInteractive - (navigation.fetchStart || 0),
      };

      this.trackEvent('performance', 'page_metrics', 'load_complete', {
        ...metrics,
        page_url: window.location.pathname,
      });
    }
  }

  private getPerformanceMetric(name: string): number | undefined {
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[0].startTime : undefined;
  }

  private trackPerformanceMetric(name: string, value: number) {
    this.trackEvent('performance', 'web_vitals', name, { value });
  }

  // Public API
  trackEvent(
    action: string,
    category: string,
    label?: string,
    customParameters?: Record<string, any>
  ) {
    if (!isTrackingAllowed()) {
      debugLog('Event tracking blocked by privacy settings', { action, category });
      return;
    }

    const event: AnalyticsEvent = {
      action,
      category,
      label,
      custom_parameters: {
        ...customParameters,
        ...this.userProperties,
        timestamp: Date.now(),
      },
    };

    addToBatch(event);
  }

  trackPageView(path?: string, title?: string) {
    const page_path = path || window.location.pathname;
    const page_title = title || document.title;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
        page_path,
        page_title,
      });
    }

    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setCustomUrl', page_path]);
      window._paq.push(['setDocumentTitle', page_title]);
      window._paq.push(['trackPageView']);
    }

    debugLog('Page view tracked', { path: page_path, title: page_title });
  }

  trackConversion(eventName: string, conversionData?: ConversionEvent) {
    this.trackEvent(eventName, 'conversion', undefined, {
      currency: conversionData?.currency || 'USD',
      value: conversionData?.value || 0,
      transaction_id: conversionData?.transaction_id,
      items: conversionData?.items || [],
    });
  }

  setUserProperties(properties: Partial<UserProperties>) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
        user_properties: properties,
      });
    }
  }

  setConsent(consent: boolean) {
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (consent && !this.initialized) {
      this.initialize();
    }

    if (typeof window !== 'undefined' && window._paq) {
      if (consent) {
        window._paq.push(['rememberCookieConsentGiven']);
      } else {
        window._paq.push(['forgetCookieConsentGiven']);
      }
    }

    debugLog('Analytics consent updated', { consent });
  }

  // Business-specific tracking methods
  trackCTAClick(ctaType: string, location: string, label?: string) {
    this.trackEvent('cta_click', 'engagement', label || ctaType, {
      cta_type: ctaType,
      cta_location: location,
      page_section: this.getCurrentSection(),
    });
  }

  trackFormSubmission(formType: string, success: boolean, errorMessage?: string) {
    this.trackEvent('form_submission', 'conversion', formType, {
      success,
      error_message: errorMessage,
      form_type: formType,
    });

    if (success) {
      this.trackConversion('form_submit', {
        value: this.getFormValue(formType),
        transaction_id: this.generateTransactionId(),
      });
    }
  }

  trackScrollBehavior(scrollDepth: number, timeOnPage: number, section?: string) {
    // Only track significant scroll milestones
    const milestones = [25, 50, 75, 90, 100];
    const milestone = milestones.find(m => scrollDepth >= m && scrollDepth < m + 5);
    
    if (milestone) {
      this.trackEvent('scroll_depth', 'engagement', `${milestone}_percent`, {
        scroll_depth: scrollDepth,
        time_on_page: timeOnPage,
        current_section: section,
      });
    }
  }

  trackProjectInteraction(projectId: string, interactionType: string, details?: any) {
    this.trackEvent('project_interaction', 'engagement', `${projectId}_${interactionType}`, {
      project_id: projectId,
      interaction_type: interactionType,
      ...details,
    });
  }

  trackCapabilityInteraction(capabilityId: string, interactionType: string) {
    this.trackEvent('capability_interaction', 'engagement', `${capabilityId}_${interactionType}`, {
      capability_id: capabilityId,
      interaction_type: interactionType,
    });
  }

  // Helper methods
  private getCurrentSection(): string {
    // Determine current section based on scroll position
    const sections = document.querySelectorAll('[data-section]');
    const scrollTop = window.pageYOffset;
    
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        return section.getAttribute('data-section') || 'unknown';
      }
    }
    
    return 'unknown';
  }

  private getFormValue(formType: string): number {
    // Estimate form value for conversion tracking
    const formValues: Record<string, number> = {
      contact: 100,
      project_inquiry: 500,
      newsletter: 25,
      support: 50,
    };
    
    return formValues[formType] || 0;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global type declarations
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    _paq: any[];
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Export utility functions
export {
  isTrackingAllowed,
  debugLog,
  ANALYTICS_CONFIG,
};