import { useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';

interface TrackingData {
  element: string;
  action?: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const useTrackInteraction = (analyticsId: string | null) => {
  const trackInteraction = useCallback((data: TrackingData) => {
    if (!analyticsId) return;
    
    trackEvent('user_interaction', {
      element_type: data.element,
      action: data.action || 'click',
      category: data.category || 'engagement',
      label: data.label,
      value: data.value,
      timestamp: new Date().toISOString(),
      ...data
    }, analyticsId);
  }, [analyticsId]);

  return trackInteraction;
}; 