import { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
}

interface UserIdentity {
  user_id: string | null;
  email: string | null;
  auth_status: 'authenticated' | 'anonymous';
  user_segment?: string;
  subscription_tier?: string;
  loyalty_score?: number;
  preferences?: Record<string, any>;
  demographic_attributes?: Record<string, any>;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (pageName: string, pageData?: Record<string, any>) => void;
  trackProductView: (product: Record<string, any>) => void;
  trackProductClick: (product: Record<string, any>, listName?: string) => void;
  trackAddToCart: (product: Record<string, any>, quantity: number) => void;
  trackRemoveFromCart: (productId: string) => void;
  trackSearch: (searchTerm: string, resultCount: number) => void;
  trackCategoryBrowse: (category: string, subcategory?: string) => void;
  trackPurchase: (orderId: string, total: number, items: any[], paymentMethod: string) => void;
  trackCheckoutStep: (step: string, data?: Record<string, any>) => void;
  trackWishlistAction: (action: 'add' | 'remove', productId: string) => void;
  getUserIdentity: () => UserIdentity;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const eventQueue = useRef<any[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileData = useRef<Record<string, any>>({});

  // Fetch profile attributes for identity data
  useEffect(() => {
    if (!user) {
      profileData.current = {};
      return;
    }

    supabase
      .from('profiles')
      .select('user_segment, subscription_tier, loyalty_score, preferences, demographic_attributes')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) profileData.current = data;
      });
  }, [user]);

  const getUserIdentity = useCallback((): UserIdentity => {
    return {
      user_id: user?.id ?? null,
      email: user?.email ?? null,
      auth_status: user ? 'authenticated' : 'anonymous',
      user_segment: profileData.current.user_segment,
      subscription_tier: profileData.current.subscription_tier,
      loyalty_score: profileData.current.loyalty_score,
      preferences: profileData.current.preferences,
      demographic_attributes: profileData.current.demographic_attributes,
    };
  }, [user]);

  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;
    const batch = [...eventQueue.current];
    eventQueue.current = [];

    try {
      // Store locally in Supabase
      await supabase.from('user_events').insert(batch);

      // Forward to Adobe AEP via edge function (fire-and-forget)
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (projectId) {
        fetch(`https://${projectId}.supabase.co/functions/v1/forward-to-adobe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: batch,
            identity: getUserIdentity(),
          }),
        }).catch(() => {}); // non-blocking
      }
    } catch (err) {
      console.error('Analytics flush error:', err);
      // Re-queue failed events
      eventQueue.current.unshift(...batch);
    }
  }, [getUserIdentity]);

  const enqueueEvent = useCallback((event: any) => {
    eventQueue.current.push(event);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    // Flush after 2 seconds of inactivity or when batch reaches 10
    if (eventQueue.current.length >= 10) {
      flushEvents();
    } else {
      flushTimer.current = setTimeout(flushEvents, 2000);
    }
  }, [flushEvents]);

  // Flush on unmount / page unload
  useEffect(() => {
    const handleUnload = () => flushEvents();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      flushEvents();
    };
  }, [flushEvents]);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    enqueueEvent({
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: event.event_type,
      event_data: event.event_data || {},
      page_url: event.page_url || window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, [user, enqueueEvent]);

  const trackPageView = useCallback((pageName: string, pageData?: Record<string, any>) => {
    trackEvent({
      event_type: 'page_view',
      event_data: { page_name: pageName, ...pageData },
    });
  }, [trackEvent]);

  const trackProductView = useCallback((product: Record<string, any>) => {
    trackEvent({
      event_type: 'product_view',
      event_data: {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        price: product.price,
        original_price: product.originalPrice,
        discount: product.discount,
      },
    });
  }, [trackEvent]);

  const trackProductClick = useCallback((product: Record<string, any>, listName?: string) => {
    trackEvent({
      event_type: 'product_click',
      event_data: {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        list_name: listName,
      },
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((product: Record<string, any>, quantity: number) => {
    trackEvent({
      event_type: 'add_to_cart',
      event_data: {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        quantity,
      },
    });
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((productId: string) => {
    trackEvent({
      event_type: 'remove_from_cart',
      event_data: { product_id: productId },
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string, resultCount: number) => {
    trackEvent({
      event_type: 'search',
      event_data: { search_term: searchTerm, result_count: resultCount },
    });
  }, [trackEvent]);

  const trackCategoryBrowse = useCallback((category: string, subcategory?: string) => {
    trackEvent({
      event_type: 'category_browse',
      event_data: { category, subcategory },
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((orderId: string, total: number, items: any[], paymentMethod: string) => {
    trackEvent({
      event_type: 'purchase',
      event_data: {
        order_id: orderId,
        total_amount: total,
        items: items.map(i => ({
          product_id: i.product_id || i.product?.id,
          name: i.name || i.product?.name,
          price: i.price || i.product?.price,
          quantity: i.quantity,
        })),
        payment_method: paymentMethod,
        item_count: items.length,
      },
    });
  }, [trackEvent]);

  const trackCheckoutStep = useCallback((step: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: 'checkout_step',
      event_data: { step, ...data },
    });
  }, [trackEvent]);

  const trackWishlistAction = useCallback((action: 'add' | 'remove', productId: string) => {
    trackEvent({
      event_type: `wishlist_${action}`,
      event_data: { product_id: productId },
    });
  }, [trackEvent]);

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        trackPageView,
        trackProductView,
        trackProductClick,
        trackAddToCart,
        trackRemoveFromCart,
        trackSearch,
        trackCategoryBrowse,
        trackPurchase,
        trackCheckoutStep,
        trackWishlistAction,
        getUserIdentity,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
