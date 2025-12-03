import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, totalSavings } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = totalPrice > 499 ? 0 : 40;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button className="btn-buy">
                Start Shopping
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/product/${product.id}`} className="shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-sm text-success font-medium">
                            {product.discount}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

              {/* Coupon Code */}
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter coupon code"
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Apply</Button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Price ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span className="text-foreground">{formatPrice(totalPrice + totalSavings)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-success">-{formatPrice(totalSavings)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-success' : 'text-foreground'}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-foreground">{formatPrice(finalTotal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-success text-sm mt-1">
                      You will save {formatPrice(totalSavings)} on this order
                    </p>
                  )}
                </div>
              </div>

              {/* Free Delivery Notice */}
              {deliveryFee > 0 && (
                <div className="bg-secondary/50 rounded-lg p-3 mt-4 flex items-center gap-2">
                  <Truck size={18} className="text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Add {formatPrice(500 - totalPrice)} more for FREE delivery
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Button className="w-full btn-buy mt-6 h-12">
                Proceed to Checkout
                <ArrowRight size={18} />
              </Button>

              {/* Continue Shopping */}
              <Link to="/products" className="block text-center mt-4">
                <Button variant="link" className="text-primary">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
