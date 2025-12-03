import { Link } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';
import { bestSellers } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export function BestSellers() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="text-accent" size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Best Sellers</h2>
        </div>
        <Link
          to="/products?sort=bestseller"
          className="flex items-center gap-1 text-primary font-medium hover:underline"
        >
          View All
          <ChevronRight size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {bestSellers.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} showBadge />
        ))}
      </div>
    </section>
  );
}
