import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/products';

interface ProductFiltersProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedRatings: number[];
  setSelectedRatings: (ratings: number[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  onClearFilters: () => void;
}

const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Levi\'s', 'LG', 'Dyson', 'boAt', 'IKEA', 'Fitbit'];

export function ProductFilters({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedRatings,
  setSelectedRatings,
  selectedBrands,
  setSelectedBrands,
  onClearFilters,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    ratings: true,
    brands: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(
      selectedRatings.includes(rating)
        ? selectedRatings.filter(r => r !== rating)
        : [...selectedRatings, rating]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(
      selectedBrands.includes(brand)
        ? selectedBrands.filter(b => b !== brand)
        : [...selectedBrands, brand]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedRatings.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 200000;

  return (
    <div className="bg-card rounded-lg p-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-primary">
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="border-b border-border pb-4 mb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left font-medium text-foreground mb-3"
        >
          Categories
          {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => toggleCategory(category.name)}
                />
                <span className="text-sm text-foreground">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-border pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-foreground mb-3"
        >
          Price Range
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              value={priceRange}
              min={0}
              max={200000}
              step={1000}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ratings */}
      <div className="border-b border-border pb-4 mb-4">
        <button
          onClick={() => toggleSection('ratings')}
          className="flex items-center justify-between w-full text-left font-medium text-foreground mb-3"
        >
          Customer Ratings
          {expandedSections.ratings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.ratings && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedRatings.includes(rating)}
                  onCheckedChange={() => toggleRating(rating)}
                />
                <span className="flex items-center gap-1 text-sm text-foreground">
                  {rating}
                  <Star size={14} className="text-rating fill-rating" />
                  & above
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full text-left font-medium text-foreground mb-3"
        >
          Brands
          {expandedSections.brands ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <span className="text-sm text-foreground">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
