import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Zap, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products" className="text-primary hover:underline">
            Browse all products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <Link to={`/products?category=${product.category}`} className="hover:text-primary">
            {product.category}
          </Link>
          <ChevronRight size={16} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl overflow-hidden aspect-square shadow-card">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <span className="rating-badge text-sm">
                  {product.rating}
                  <Star size={14} fill="currentColor" />
                </span>
                <span className="text-muted-foreground">
                  {product.reviewCount.toLocaleString()} Ratings & Reviews
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-success font-semibold">
                      {product.discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Offers */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Available Offers</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="deal-badge shrink-0">Bank Offer</span>
                  <span>10% Instant Discount on HDFC Bank Cards</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="deal-badge shrink-0">Special Price</span>
                  <span>Get extra 5% off (price inclusive of discount)</span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Highlights</h3>
              <ul className="space-y-2">
                {product.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={16} className="text-success shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Truck className="text-primary" size={24} />
                <div>
                  <p className="font-medium text-foreground">
                    {product.freeDelivery ? 'FREE Delivery' : 'Standard Delivery'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Delivered in {product.deliveryDays} days
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-foreground font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-cart h-12"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </Button>
                <Button className="flex-1 btn-buy h-12" onClick={() => { addToCart(product, quantity); navigate('/checkout'); }}>
                  <Zap size={20} />
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Heart size={18} className="mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 size={18} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-card rounded-lg">
                <RefreshCw className="mx-auto text-muted-foreground mb-2" size={24} />
                <p className="text-xs text-muted-foreground">10 Days Return</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <Shield className="mx-auto text-muted-foreground mb-2" size={24} />
                <p className="text-xs text-muted-foreground">{product.warranty}</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <Truck className="mx-auto text-muted-foreground mb-2" size={24} />
                <p className="text-xs text-muted-foreground">
                  {product.freeDelivery ? 'Free Delivery' : 'Fast Delivery'}
                </p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sold by</p>
                  <p className="font-medium text-foreground">{product.seller.name}</p>
                </div>
                <div className="rating-badge">
                  {product.seller.rating}
                  <Star size={12} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Specifications & Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="specs"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
              >
                Reviews ({product.reviewCount.toLocaleString()})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="w-32 shrink-0 text-muted-foreground">{key}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description" className="mt-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{product.rating}</div>
                    <div className="flex items-center justify-center text-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.reviewCount.toLocaleString()} ratings
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Sample reviews */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rating-badge text-xs">
                        5 <Star size={10} fill="currentColor" />
                      </span>
                      <span className="font-medium">Excellent product!</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Great quality and fast delivery. Highly recommended!
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">John D. - 2 days ago</p>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rating-badge text-xs">
                        4 <Star size={10} fill="currentColor" />
                      </span>
                      <span className="font-medium">Good value for money</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Product matches the description. Happy with my purchase.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Sarah M. - 1 week ago</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-card group">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-foreground line-clamp-2 text-sm">{p.name}</p>
                    <p className="text-lg font-bold text-foreground mt-2">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
