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
 * @see https://github.com/adobe/adobe-client-data-layer
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
  });
}

export function pushRemoveFromCart(productId: string) {
  adobePush('removeFromCart', {
    productListItems: [{ SKU: productId }],
    commerce: { productListRemovals: { value: 1 } },
  });
}

export function pushPurchase(
  orderId: string,
  total: number,
  items: Array<{ product_id?: string; name?: string; price?: number; quantity?: number }>,
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
  });
}

export function pushCategoryBrowse(category: string, subcategory?: string) {
  adobePush('categoryBrowse', {
    category: { primaryCategory: category, subCategory: subcategory },
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
  });
}
