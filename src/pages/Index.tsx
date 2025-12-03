import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FlashDeals } from '@/components/home/FlashDeals';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { BestSellers } from '@/components/home/BestSellers';
import { OffersBar } from '@/components/home/OffersBar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Carousel */}
        <HeroCarousel />
        
        {/* Offers Bar */}
        <OffersBar />
        
        {/* Categories */}
        <CategoryGrid />
        
        {/* Flash Deals */}
        <FlashDeals />
        
        {/* Trending Products */}
        <TrendingProducts />
        
        {/* Best Sellers */}
        <BestSellers />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
