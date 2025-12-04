import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Truck, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

type Step = 'address' | 'payment' | 'review';

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, totalSavings, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = totalPrice > 499 ? 0 : 40;
  const finalTotal = totalPrice + deliveryFee;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
      }));

      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'pending',
        total_amount: finalTotal,
        shipping_address: address,
        items: orderItems,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
      });

      if (error) throw error;

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. You can track it in My Orders.",
      });
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Could not place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Please sign in to checkout</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to complete your purchase.
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

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/cart" className="text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft size={18} />
            Back to Cart
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {(['address', 'payment', 'review'] as Step[]).map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : (['address', 'payment', 'review'].indexOf(step) > index)
                    ? 'bg-success text-success-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {(['address', 'payment', 'review'].indexOf(step) > index) ? (
                  <Check size={16} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-2 text-sm capitalize hidden sm:inline ${
                step === s ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {s}
              </span>
              {index < 2 && (
                <ChevronRight className="mx-2 text-muted-foreground" size={20} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Address Step */}
            {step === 'address' && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-primary" size={24} />
                  <h2 className="text-xl font-semibold text-foreground">Delivery Address</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      placeholder="House No, Building Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      placeholder="Street, Landmark"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-buy h-12 mt-6">
                    Continue to Payment
                    <ChevronRight size={18} />
                  </Button>
                </form>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-primary" size={24} />
                  <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="upi" id="upi" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">UPI</p>
                        <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep('address')} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 btn-buy h-12">
                      Review Order
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Address Summary */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-primary" size={20} />
                      <h3 className="font-semibold text-foreground">Delivery Address</h3>
                    </div>
                    <Button variant="link" onClick={() => setStep('address')} className="text-primary">
                      Change
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{address.name}</p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-primary" size={20} />
                      <h3 className="font-semibold text-foreground">Payment Method</h3>
                    </div>
                    <Button variant="link" onClick={() => setStep('payment')} className="text-primary">
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">
                    {paymentMethod === 'cod' && 'Cash on Delivery'}
                    {paymentMethod === 'card' && 'Credit / Debit Card'}
                    {paymentMethod === 'upi' && 'UPI'}
                  </p>
                </div>

                {/* Items Summary */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="text-primary" size={20} />
                    <h3 className="font-semibold text-foreground">Order Items ({items.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">{formatPrice(product.price * quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 btn-buy h-12"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                        Placing Order...
                      </span>
                    ) : (
                      `Place Order • ${formatPrice(finalTotal)}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Price ({items.length} {items.length === 1 ? 'item' : 'items'})
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
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
