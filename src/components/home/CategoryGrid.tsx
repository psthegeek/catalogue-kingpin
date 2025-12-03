import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export function CategoryGrid() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Shop by Category</h2>
        <Link to="/products" className="text-primary font-medium hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${encodeURIComponent(category.name)}`}
            className="category-card group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full overflow-hidden bg-secondary">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
