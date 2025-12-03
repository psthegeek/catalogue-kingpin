import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showBadge?: boolean;
}

export function ProductCard({ product, compact = false, showBadge = false }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card group relative">
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden bg-secondary",
          compact ? "h-32 sm:h-40" : "h-48 sm:h-56"
        )}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 deal-badge">
              {product.discount}% OFF
            </span>
          )}
          
          {/* Best Seller Badge */}
          {showBadge && (
            <span className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded">
              Best Seller
            </span>
          )}

          {/* Wishlist Button */}
          <button className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart size={18} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className={cn("p-3 sm:p-4", compact && "p-2 sm:p-3")}>
          {/* Brand */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          
          {/* Name */}
          <h3 className={cn(
            "font-medium text-foreground line-clamp-2 mb-2",
            compact ? "text-sm" : "text-sm sm:text-base"
          )}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <span className="rating-badge">
              {product.rating}
              <Star size={12} fill="currentColor" />
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="price-current">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="price-original">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="price-discount">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Delivery Info */}
          {!compact && product.freeDelivery && (
            <p className="text-xs text-success mt-2">
              Free delivery
            </p>
          )}
        </div>
      </Link>

      {/* Quick Add to Cart */}
      {!compact && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
