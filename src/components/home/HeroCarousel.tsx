import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Big Billion Days',
    subtitle: 'Up to 80% Off on Electronics',
    cta: 'Shop Now',
    link: '/products?category=Electronics',
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Fashion Week Sale',
    subtitle: 'Minimum 50% Off on Top Brands',
    cta: 'Explore Fashion',
    link: '/products?category=Fashion',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Home Makeover',
    subtitle: 'Transform Your Space with 40% Off',
    cta: 'Shop Home',
    link: '/products?category=Home%20%26%20Furniture',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&h=400&fit=crop',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden rounded-xl">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full h-full relative bg-gradient-to-r ${slide.gradient}`}
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 lg:px-20">
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 animate-fade-in">
                {slide.title}
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-4 sm:mb-6">
                {slide.subtitle}
              </p>
              <Link
                to={slide.link}
                className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors w-fit"
              >
                {slide.cta}
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
      >
        <ChevronLeft size={24} className="text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
      >
        <ChevronRight size={24} className="text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
