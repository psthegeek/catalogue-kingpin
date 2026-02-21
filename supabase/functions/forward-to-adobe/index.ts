import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { events, identity } = await req.json();

    // Get Adobe AEP credentials from secrets
    const AEP_DATASTREAM_ID = Deno.env.get('ADOBE_AEP_DATASTREAM_ID');
    const AEP_ORG_ID = Deno.env.get('ADOBE_AEP_ORG_ID');
    const AEP_EDGE_ENDPOINT = Deno.env.get('ADOBE_AEP_EDGE_ENDPOINT') || 'https://edge.adobedc.net';

    // If Adobe credentials not configured, just log and return success
    // Events are already stored in user_events table by the client
    if (!AEP_DATASTREAM_ID || !AEP_ORG_ID) {
      console.log('Adobe AEP not configured. Events stored locally only.', {
        event_count: events?.length || 0,
        has_identity: !!identity?.user_id,
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          forwarded: false,
          message: 'Events stored locally. Adobe AEP credentials not configured.',
          events_received: events?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform events to Adobe XDM format
    const xdmEvents = (events || []).map((event: any) => {
      const xdm: any = {
        eventType: mapEventType(event.event_type),
        timestamp: event.created_at || new Date().toISOString(),
        web: {
          webPageDetails: {
            URL: event.page_url,
            name: event.event_data?.page_name || event.page_url,
          },
          webReferrer: { URL: event.referrer },
        },
        _experience: {
          analytics: {
            customDimensions: {
              eVars: event.event_data,
            },
          },
        },
      };

      // Add identity data
      if (identity?.user_id) {
        xdm.identityMap = {
          CRMID: [{ id: identity.user_id, authenticatedState: 'authenticated', primary: true }],
        };
        if (identity.email) {
          xdm.identityMap.Email = [{ id: identity.email, authenticatedState: 'authenticated' }];
        }
      }

      // Add commerce data for purchase events
      if (event.event_type === 'purchase') {
        xdm.commerce = {
          purchases: { value: 1 },
          order: {
            purchaseID: event.event_data?.order_id,
            priceTotal: event.event_data?.total_amount,
            payments: [{ paymentType: event.event_data?.payment_method }],
          },
        };
        xdm.productListItems = (event.event_data?.items || []).map((item: any) => ({
          SKU: item.product_id,
          name: item.name,
          priceTotal: item.price * item.quantity,
          quantity: item.quantity,
        }));
      }

      // Add product view data
      if (event.event_type === 'product_view') {
        xdm.commerce = { productViews: { value: 1 } };
        xdm.productListItems = [{
          SKU: event.event_data?.product_id,
          name: event.event_data?.product_name,
          priceTotal: event.event_data?.price,
          quantity: 1,
        }];
      }

      // Add add-to-cart data
      if (event.event_type === 'add_to_cart') {
        xdm.commerce = { productListAdds: { value: 1 } };
        xdm.productListItems = [{
          SKU: event.event_data?.product_id,
          name: event.event_data?.product_name,
          priceTotal: event.event_data?.price,
          quantity: event.event_data?.quantity,
        }];
      }

      // Add profile attributes if available
      if (identity?.user_segment || identity?.subscription_tier) {
        xdm.userProfile = {
          userSegment: identity.user_segment,
          subscriptionTier: identity.subscription_tier,
          loyaltyScore: identity.loyalty_score,
          preferences: identity.preferences,
          demographicAttributes: identity.demographic_attributes,
        };
      }

      return { xdm };
    });

    // Send to Adobe Edge Network
    const aepResponse = await fetch(
      `${AEP_EDGE_ENDPOINT}/ee/v2/interact?datastreamId=${AEP_DATASTREAM_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-adobe-org-id': AEP_ORG_ID,
        },
        body: JSON.stringify({
          events: xdmEvents,
        }),
      }
    );

    if (!aepResponse.ok) {
      const errorBody = await aepResponse.text();
      throw new Error(`Adobe AEP API call failed [${aepResponse.status}]: ${errorBody}`);
    }

    const result = await aepResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        forwarded: true,
        events_sent: xdmEvents.length,
        aep_response: result,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error forwarding to Adobe AEP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapEventType(eventType: string): string {
  const mapping: Record<string, string> = {
    page_view: 'web.webpagedetails.pageViews',
    product_view: 'commerce.productViews',
    product_click: 'commerce.productListOpens',
    add_to_cart: 'commerce.productListAdds',
    remove_from_cart: 'commerce.productListRemovals',
    purchase: 'commerce.purchases',
    search: 'web.webinteraction.linkClicks',
    category_browse: 'web.webpagedetails.pageViews',
    checkout_step: 'commerce.checkouts',
    wishlist_add: 'commerce.saveForLaters',
    wishlist_remove: 'commerce.saveForLaters',
  };
  return mapping[eventType] || 'web.webpagedetails.pageViews';
}
