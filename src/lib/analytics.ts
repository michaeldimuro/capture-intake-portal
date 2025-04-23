import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsConfig {
  measurementId: string | null;
}

// Initialize Google Analytics
export const initializeAnalytics = (config: AnalyticsConfig) => {
  if (typeof window === 'undefined' || !config.measurementId) return;

  // Add the Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize the dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (path: string, measurementId: string | null) => {
  if (typeof window === 'undefined' || !measurementId) return;
  window.gtag('event', 'page_view', {
    page_path: path,
  });
};

// Track user interactions
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>,
  measurementId: string | null = null
) => {
  if (typeof window === 'undefined' || !measurementId) return;
  window.gtag('event', eventName, eventParams);
};

// Track form progress
export const trackFormProgress = (
  formName: string,
  step: number,
  totalSteps: number,
  measurementId: string | null
) => {
  if (!measurementId) return;
  trackEvent('form_progress', {
    form_name: formName,
    step: step,
    total_steps: totalSteps,
    progress_percentage: (step / totalSteps) * 100,
  }, measurementId);
};

// Track form completion
export const trackFormCompletion = (formName: string, measurementId: string | null) => {
  if (!measurementId) return;
  trackEvent('form_complete', {
    form_name: formName,
  }, measurementId);
};

// Track form abandonment
export const trackFormAbandonment = (
  formName: string,
  step: number,
  totalSteps: number,
  measurementId: string | null
) => {
  if (!measurementId) return;
  trackEvent('form_abandonment', {
    form_name: formName,
    abandoned_at_step: step,
    total_steps: totalSteps,
    progress_percentage: (step / totalSteps) * 100,
  }, measurementId);
};

// Track user engagement time
export const trackEngagementTime = (timeInSeconds: number, measurementId: string | null) => {
  if (!measurementId) return;
  trackEvent('engagement_time', {
    time_seconds: timeInSeconds,
  }, measurementId);
};

// Custom hook to initialize analytics
export const useAnalytics = (config: AnalyticsConfig) => {
  useEffect(() => {
    if (!config.measurementId) return;
    
    initializeAnalytics(config);

    // Track page views on route changes
    const handleRouteChange = () => {
      trackPageView(window.location.pathname, config.measurementId);
    };

    // Track initial page view
    trackPageView(window.location.pathname, config.measurementId);

    // Set up visibility change tracking
    let startTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeSpent = (Date.now() - startTime) / 1000;
        trackEngagementTime(timeSpent, config.measurementId);
      } else {
        startTime = Date.now();
      }
    };

    // Set up beforeunload tracking
    const handleBeforeUnload = () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      trackEngagementTime(timeSpent, config.measurementId);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [config.measurementId]);

  return {
    isEnabled: Boolean(config.measurementId)
  };
}; 