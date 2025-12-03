import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { trending } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export function TrendingProducts() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary" size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Trending Now</h2>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1 text-primary font-medium hover:underline"
        >
          View All
          <ChevronRight size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {trending.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
