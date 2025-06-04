import { useCallback } from 'react';
import { 
  trackEvent, 
  trackPurchase, 
  trackBeginCheckout, 
  trackAddPaymentInfo, 
  trackAddShippingInfo,
  PurchaseEventData,
  PurchaseItem
} from '@/lib/analytics';
import { Product } from '@/lib/types';

interface TrackingData {
  element: string;
  action?: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

interface ShippingMethod {
  id: string;
  carrier: string;
  method: string;
  price: string;
  deliveryTimeframe: string;
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

  const trackPurchaseEvent = useCallback((purchaseData: PurchaseEventData) => {
    if (!analyticsId) return;
    trackPurchase(purchaseData, analyticsId);
  }, [analyticsId]);

  const trackCheckoutBegin = useCallback((value: number, currency: string, items: PurchaseItem[]) => {
    if (!analyticsId) return;
    trackBeginCheckout(value, currency, items, analyticsId);
  }, [analyticsId]);

  const trackPaymentInfo = useCallback((value: number, currency: string, paymentType: string) => {
    if (!analyticsId) return;
    trackAddPaymentInfo(value, currency, paymentType, analyticsId);
  }, [analyticsId]);

  const trackShippingInfo = useCallback((value: number, currency: string, shippingTier: string) => {
    if (!analyticsId) return;
    trackAddShippingInfo(value, currency, shippingTier, analyticsId);
  }, [analyticsId]);

  return {
    trackInteraction,
    trackPurchaseEvent,
    trackCheckoutBegin,
    trackPaymentInfo,
    trackShippingInfo
  };
};

// Dedicated hook for ecommerce purchase tracking
export const usePurchaseTracking = (analyticsId: string | null, companyName?: string) => {
  const generateTransactionId = useCallback(() => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createPurchaseItem = useCallback((product: Product): PurchaseItem => {
    return {
      item_id: product.id,
      item_name: product.offeringName,
      item_category: product.compound?.name || 'Medication',
      item_brand: companyName || 'Capture Health',
      price: Number(product.price),
      quantity: 1,
      item_variant: product.dosageVariety?.dosage || undefined,
      affiliation: companyName || 'Capture Health'
    };
  }, [companyName]);

  const trackCheckoutStart = useCallback((product: Product) => {
    if (!analyticsId) return;
    
    const items = [createPurchaseItem(product)];
    trackBeginCheckout(Number(product.price), 'USD', items, analyticsId);
  }, [analyticsId, createPurchaseItem]);

  const trackAddPayment = useCallback((totalValue: number, paymentType: string = 'credit_card') => {
    if (!analyticsId) return;
    trackAddPaymentInfo(totalValue, 'USD', paymentType, analyticsId);
  }, [analyticsId]);

  const trackAddShipping = useCallback((totalValue: number, shippingMethod: ShippingMethod) => {
    if (!analyticsId) return;
    const shippingTier = `${shippingMethod.carrier}_${shippingMethod.method}`;
    trackAddShippingInfo(totalValue, 'USD', shippingTier, analyticsId);
  }, [analyticsId]);

  const trackCompletePurchase = useCallback((
    product: Product, 
    shippingMethod: ShippingMethod | null,
    transactionId?: string
  ) => {
    if (!analyticsId) return;

    const shippingCost = shippingMethod ? Number(shippingMethod.price) : 0;
    const totalValue = Number(product.price) + shippingCost;
    const items = [createPurchaseItem(product)];

    const purchaseData: PurchaseEventData = {
      transaction_id: transactionId || generateTransactionId(),
      value: totalValue,
      shipping: shippingCost,
      currency: 'USD',
      items: items
    };

    trackPurchase(purchaseData, analyticsId);
  }, [analyticsId, createPurchaseItem, generateTransactionId]);

  return {
    trackCheckoutStart,
    trackAddPayment,
    trackAddShipping,
    trackCompletePurchase,
    generateTransactionId,
    createPurchaseItem
  };
}; 