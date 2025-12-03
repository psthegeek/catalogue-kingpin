import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { deals } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export function FlashDeals() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 32,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer
          hours = 5;
          minutes = 32;
          seconds = 15;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="py-8">
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-xl p-1">
        <div className="bg-card rounded-lg p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <Zap className="text-accent" size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Flash Deals</h2>
                <p className="text-sm text-muted-foreground">Limited time offers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-destructive" />
              <span className="text-sm text-muted-foreground">Ends in:</span>
              <div className="flex items-center gap-1">
                <span className="bg-foreground text-background px-2 py-1 rounded font-mono font-bold">
                  {formatTime(timeLeft.hours)}
                </span>
                <span className="text-foreground font-bold">:</span>
                <span className="bg-foreground text-background px-2 py-1 rounded font-mono font-bold">
                  {formatTime(timeLeft.minutes)}
                </span>
                <span className="text-foreground font-bold">:</span>
                <span className="bg-foreground text-background px-2 py-1 rounded font-mono font-bold">
                  {formatTime(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {deals.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>

          {/* View All */}
          <div className="mt-6 text-center">
            <Link
              to="/products?deal=true"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              View All Deals
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
