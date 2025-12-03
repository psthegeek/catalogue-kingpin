export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  inStock: boolean;
  stockCount: number;
  highlights: string[];
  specifications: Record<string, string>;
  seller: Seller;
  deliveryDays: number;
  freeDelivery: boolean;
  warranty: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  brands: string[];
  discount: number;
  availability: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
