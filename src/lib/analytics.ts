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

/**
 * Purchase tracking interfaces based on Google Analytics 4 ecommerce events
 * Reference: https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce
 */
export interface PurchaseItem {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price: number;
  quantity: number;
}

export interface PurchaseEventData {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  currency: string;
  coupon?: string;
  items: PurchaseItem[];
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

/**
 * Track purchase events for ecommerce
 * This function sends a 'purchase' event to Google Analytics 4
 * 
 * @param purchaseData - The purchase event data including transaction details and items
 * @param measurementId - Google Analytics measurement ID
 * 
 * Example usage:
 * ```typescript
 * trackPurchase({
 *   transaction_id: "T_12345",
 *   value: 30.03,
 *   tax: 4.90,
 *   shipping: 5.99,
 *   currency: "USD",
 *   items: [{
 *     item_id: "SKU_12345",
 *     item_name: "Product Name",
 *     price: 10.01,
 *     quantity: 3
 *   }]
 * }, measurementId);
 * ```
 */
export const trackPurchase = (purchaseData: PurchaseEventData, measurementId: string | null) => {
  if (!measurementId) return;
  
  trackEvent('purchase', {
    transaction_id: purchaseData.transaction_id,
    value: purchaseData.value,
    tax: purchaseData.tax || 0,
    shipping: purchaseData.shipping || 0,
    currency: purchaseData.currency,
    coupon: purchaseData.coupon,
    items: purchaseData.items
  }, measurementId);
};

/**
 * Track begin_checkout event
 * This event is triggered when a user begins the checkout process
 * 
 * @param value - The total value of the items in the cart
 * @param currency - The currency code (e.g., 'USD')
 * @param items - Array of items in the cart
 * @param measurementId - Google Analytics measurement ID
 */
export const trackBeginCheckout = (
  value: number,
  currency: string,
  items: PurchaseItem[],
  measurementId: string | null
) => {
  if (!measurementId) return;
  
  trackEvent('begin_checkout', {
    currency: currency,
    value: value,
    items: items
  }, measurementId);
};

/**
 * Track add_payment_info event
 * This event is triggered when a user submits their payment information
 * 
 * @param value - The total value of the purchase
 * @param currency - The currency code (e.g., 'USD')
 * @param paymentType - The payment method type (e.g., 'credit_card')
 * @param measurementId - Google Analytics measurement ID
 */
export const trackAddPaymentInfo = (
  value: number,
  currency: string,
  paymentType: string,
  measurementId: string | null
) => {
  if (!measurementId) return;
  
  trackEvent('add_payment_info', {
    currency: currency,
    value: value,
    payment_type: paymentType
  }, measurementId);
};

/**
 * Track add_shipping_info event
 * This event is triggered when a user submits their shipping information
 * 
 * @param value - The total value of the purchase including shipping
 * @param currency - The currency code (e.g., 'USD')
 * @param shippingTier - The shipping method selected (e.g., 'Ground', 'Express')
 * @param measurementId - Google Analytics measurement ID
 */
export const trackAddShippingInfo = (
  value: number,
  currency: string,
  shippingTier: string,
  measurementId: string | null
) => {
  if (!measurementId) return;
  
  trackEvent('add_shipping_info', {
    currency: currency,
    value: value,
    shipping_tier: shippingTier
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