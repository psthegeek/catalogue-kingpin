import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck, MapPin, CreditCard, ArrowRight, Copy, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/context/AnalyticsContext';

export default function OrderConfirmation() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('Order Confirmation');
  }, [trackPageView]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const total = searchParams.get('total') || '0';
  const method = searchParams.get('method') || 'cod';
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const paymentLabel = method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Credit / Debit Card' : method === 'upi' ? 'UPI' : method === 'netbanking' ? 'Net Banking' : 'Wallet';

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimated delivery date (5-7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5 + Math.floor(Math.random() * 3));
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>

        {/* Order ID Card */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="text-lg font-bold text-foreground font-mono">{orderId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-6 space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-foreground">Order Details</h2>

          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
            <CreditCard size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Payment</p>
              <p className="text-sm text-muted-foreground">{paymentLabel}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{formatPrice(Number(total))}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
            <Truck size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">{formattedDelivery}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
            <Package size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Order Status</p>
              <p className="text-sm text-muted-foreground">Confirmed — Being prepared for shipment</p>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Timeline</h2>
          <div className="space-y-0">
            {[
              { label: 'Order Placed', desc: 'Just now', active: true },
              { label: 'Order Confirmed', desc: 'Processing', active: true },
              { label: 'Shipped', desc: 'Estimated in 1-2 days', active: false },
              { label: 'Out for Delivery', desc: '', active: false },
              { label: 'Delivered', desc: formattedDelivery, active: false },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${step.active ? 'bg-success' : 'bg-border'}`} />
                  {i < 4 && <div className={`w-0.5 h-8 ${step.active ? 'bg-success/40' : 'bg-border'}`} />}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.desc && <p className="text-xs text-muted-foreground">{step.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/orders" className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <Package size={18} className="mr-2" />
              View My Orders
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button className="w-full btn-buy h-12">
              Continue Shopping
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
