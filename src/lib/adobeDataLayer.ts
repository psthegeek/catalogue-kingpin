/**
 * Adobe Client Data Layer (ACDL) integration.
 *
 * Events pushed here are picked up by Adobe Launch rules configured with
 * the "Adobe Client Data Layer" extension → "Data Pushed" event type.
 *
 * Adobe Launch then uses the Web SDK (alloy.js) extension to forward
 * the XDM payload to Adobe Edge Network, which routes to AEP + Target
 * based on your Datastream configuration.
 *
 * For Adobe Target Recommendations, entity.* parameters are included
 * so Launch rules can map them to Target mbox parameters.
 *
 * @see https://github.com/adobe/adobe-client-data-layer
 * @see https://experienceleague.adobe.com/docs/target/using/recommendations/entities/entity-attributes.html
 */

declare global {
  interface Window {
    adobeDataLayer?: Array<Record<string, unknown>>;
  }
}

// Ensure the data layer array exists
function ensureDataLayer() {
  window.adobeDataLayer = window.adobeDataLayer || [];
}

/** Generic push — any Launch rule using "Data Pushed" will see this */
export function adobePush(event: string, data: Record<string, unknown>) {
  ensureDataLayer();
  window.adobeDataLayer!.push({
    event,
    ...data,
  });
}

/* ------------------------------------------------------------------ */
/*  Adobe Target entity helper                                         */
/* ------------------------------------------------------------------ */

/**
 * Build entity.* params that Adobe Target Recommendations requires.
 * These are mapped inside Launch rules to Target mbox parameters.
 * @see https://experienceleague.adobe.com/docs/target/using/recommendations/entities/entity-attributes.html
 */
function buildEntityParams(product: Record<string, unknown>) {
  return {
    'entity.id': product.id,
    'entity.name': product.name,
    'entity.categoryId': product.category,
    'entity.brand': product.brand,
    'entity.value': product.price,
    'entity.thumbnailUrl': product.image || product.thumbnailUrl || '',
    'entity.pageUrl': product.pageUrl || `${window.location.origin}/product/${product.id}`,
    'entity.inventory': product.stock != null ? Number(product.stock) > 0 ? 'InStock' : 'OutOfStock' : 'InStock',
    'entity.message': product.discount ? `${product.discount}% OFF` : '',
    'entity.subcategoryId': product.subcategory || '',
  };
}

/* ------------------------------------------------------------------ */
/*  Convenience helpers aligned with XDM / Web SDK conventions         */
/* ------------------------------------------------------------------ */

export function pushPageView(pageName: string, pageUrl: string, extra?: Record<string, unknown>) {
  adobePush('pageView', {
    page: { pageName, pageUrl, ...extra },
  });
}

export function pushProductView(product: Record<string, unknown>) {
  adobePush('productView', {
    productListItems: [
      {
        SKU: product.id,
        name: product.name,
        priceTotal: product.price,
        quantity: 1,
        category: product.category,
        brand: product.brand,
      },
    ],
    commerce: { productViews: { value: 1 } },
    // Target Recommendations entity params
    ...buildEntityParams(product),
  });
}

export function pushAddToCart(product: Record<string, unknown>, quantity: number) {
  adobePush('addToCart', {
    productListItems: [
      {
        SKU: product.id,
        name: product.name,
        priceTotal: product.price,
        quantity,
        category: product.category,
        brand: product.brand,
      },
    ],
    commerce: { productListAdds: { value: 1 } },
    // Target Recommendations entity params
    ...buildEntityParams(product),
  });
}

export function pushRemoveFromCart(productId: string) {
  adobePush('removeFromCart', {
    productListItems: [{ SKU: productId }],
    commerce: { productListRemovals: { value: 1 } },
    'entity.id': productId,
  });
}

export function pushPurchase(
  orderId: string,
  total: number,
  items: Array<{ product_id?: string; name?: string; price?: number; quantity?: number; category?: string }>,
  paymentMethod: string,
) {
  adobePush('purchase', {
    commerce: {
      purchases: { value: 1 },
      order: {
        purchaseID: orderId,
        priceTotal: total,
        payments: [{ paymentType: paymentMethod }],
      },
    },
    productListItems: items.map((i) => ({
      SKU: i.product_id,
      name: i.name,
      priceTotal: (i.price ?? 0) * (i.quantity ?? 1),
      quantity: i.quantity ?? 1,
    })),
    // Target: pass purchased entity IDs so they can be excluded from recs
    'excludedIds': items.map((i) => i.product_id).filter(Boolean),
    // Target: entity for each purchased item
    'entity.id': items.map((i) => i.product_id).filter(Boolean).join(','),
    'entity.categoryId': items.map((i) => i.category).filter(Boolean).join(','),
  });
}

export function pushSearch(searchTerm: string, resultCount: number) {
  adobePush('internalSearch', {
    search: { searchTerm, resultCount },
  });
}

export function pushCheckoutStep(step: string, data?: Record<string, unknown>) {
  adobePush('checkoutStep', {
    commerce: { checkouts: { value: 1 } },
    checkout: { step, ...data },
  });
}

export function pushWishlistAction(action: 'add' | 'remove', productId: string) {
  adobePush(action === 'add' ? 'wishlistAdd' : 'wishlistRemove', {
    productListItems: [{ SKU: productId }],
    commerce: { saveForLaters: { value: 1 } },
    'entity.id': productId,
  });
}

export function pushCategoryBrowse(category: string, subcategory?: string) {
  adobePush('categoryBrowse', {
    category: { primaryCategory: category, subCategory: subcategory },
    // Target: category affinity
    'user.categoryAffinity': category,
    'user.subCategoryAffinity': subcategory || '',
  });
}

export function pushProductClick(product: Record<string, unknown>, listName?: string) {
  adobePush('productClick', {
    productListItems: [
      {
        SKU: product.id,
        name: product.name,
        priceTotal: product.price,
        category: product.category,
        brand: product.brand,
      },
    ],
    commerce: { productListOpens: { value: 1 } },
    list: { name: listName },
    // Target Recommendations entity params
    ...buildEntityParams(product),
  });
}

/* ------------------------------------------------------------------ */
/*  User profile push for Target personalization                       */
/* ------------------------------------------------------------------ */

/**
 * Push user profile attributes to the data layer for Target.
 * Call this after login or when profile data is available.
 * Adobe Launch maps these to Target profile parameters.
 */
export function pushUserProfile(profile: {
  userId?: string | null;
  email?: string | null;
  userSegment?: string;
  subscriptionTier?: string;
  loyaltyScore?: number;
  preferences?: Record<string, unknown>;
  demographicAttributes?: Record<string, unknown>;
}) {
  adobePush('userProfileUpdate', {
    'user.authState': profile.userId ? 'authenticated' : 'anonymous',
    'user.id': profile.userId || '',
    'user.email': profile.email || '',
    'user.segment': profile.userSegment || '',
    'user.subscriptionTier': profile.subscriptionTier || '',
    'user.loyaltyScore': profile.loyaltyScore ?? 0,
    'user.preferences': profile.preferences ? JSON.stringify(profile.preferences) : '',
    'user.demographics': profile.demographicAttributes ? JSON.stringify(profile.demographicAttributes) : '',
  });
}
