import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Filter, SlidersHorizontal, Grid, List, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'discount';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
  { value: 'newest', label: 'Newest First' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const { trackPageView, trackSearch, trackCategoryBrowse } = useAnalytics();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const category = searchParams.get('category');
    return category ? [category] : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const isDealPage = searchParams.get('deal') === 'true';
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    trackPageView('Products', { search: searchQuery, deal: isDealPage, category: categoryParam });
    if (categoryParam) trackCategoryBrowse(categoryParam);
  }, [searchQuery, isDealPage, categoryParam, trackPageView, trackCategoryBrowse]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.brand.toLowerCase().includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery)
      );
    }

    // Deal filter
    if (isDealPage) {
      filtered = filtered.filter(p => p.discount >= 20);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter
    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Rating filter
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings);
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
        // In a real app, you'd sort by date
        break;
    }

    return filtered;
  }, [searchQuery, isDealPage, selectedCategories, priceRange, selectedRatings, selectedBrands, sortBy]);

  // Track search after results are computed
  useEffect(() => {
    if (searchQuery) trackSearch(searchQuery, filteredProducts.length);
  }, [searchQuery, filteredProducts.length, trackSearch]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 200000]);
    setSelectedRatings([]);
    setSelectedBrands([]);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedRatings.length +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 200000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isDealPage ? 'Flash Deals' : searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ProductFilters
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedRatings={selectedRatings}
              setSelectedRatings={setSelectedRatings}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-card rounded-lg p-4 shadow-card mb-6 flex flex-wrap items-center justify-between gap-4">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex items-center gap-2">
                    <Filter size={18} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductFilters
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      selectedRatings={selectedRatings}
                      setSelectedRatings={setSelectedRatings}
                      selectedBrands={selectedBrands}
                      setSelectedBrands={setSelectedBrands}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal size={18} />
                    Sort by: {sortOptions.find(o => o.value === sortBy)?.label}
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {sortOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-primary/10 text-primary' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
