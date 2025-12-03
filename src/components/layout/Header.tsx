import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="gradient-primary">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-primary-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold text-primary-foreground tracking-tight">
                  ShopKart
                </span>
                <span className="text-[10px] text-primary-foreground/80 italic hidden sm:block">
                  Explore <span className="text-accent">Plus</span>
                </span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-12 pr-4"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4 ml-auto">
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hidden sm:flex items-center gap-2">
                    <User size={20} />
                    <span className="hidden lg:inline">Account</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-dropdown">
                  <DropdownMenuItem>
                    <Link to="/login" className="w-full">Login / Sign Up</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/orders" className="w-full">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/wishlist" className="w-full">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/account" className="w-full">My Account</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hidden lg:flex items-center gap-2">
                  <Heart size={20} />
                  <span>Wishlist</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2">
                  <div className="relative">
                    <ShoppingCart size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">Cart</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-12 pr-4"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Categories Bar - Desktop */}
      <nav className="bg-card border-b border-border hidden lg:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-2 overflow-x-auto">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="nav-link text-sm whitespace-nowrap py-2 block"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products?deal=true" className="text-accent font-semibold text-sm whitespace-nowrap py-2 block">
                Flash Deals 🔥
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-b border-border animate-slide-up">
          <div className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="block py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products?deal=true"
                  className="block py-2 text-accent font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Flash Deals 🔥
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
