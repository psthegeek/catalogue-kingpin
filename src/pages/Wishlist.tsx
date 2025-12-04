import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      const wishlistProductIds = data?.map(item => item.product_id) || [];
      const wishlistProducts = products.filter(p => wishlistProductIds.includes(p.id));
      setWishlistItems(wishlistProducts);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Could not remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Heart size={48} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Please sign in</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to view and manage your wishlist.
            </p>
            <Link to="/auth">
              <Button className="btn-buy">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading wishlist...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Heart size={48} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and come back to them later.
            </p>
            <Link to="/products">
              <Button className="btn-buy">
                <ShoppingBag size={18} className="mr-2" />
                Start Shopping
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
          My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-card rounded-xl overflow-hidden shadow-card">
              <Link to={`/product/${product.id}`}>
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-1">{product.brand}</p>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => moveToCart(product)}
                    className="flex-1 btn-cart text-sm h-10"
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(product.id)}
                    className="shrink-0"
                  >
                    <Trash2 size={18} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
