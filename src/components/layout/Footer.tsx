import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2 text-background/70">
              <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-background transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-background transition-colors">Press</Link></li>
              <li><Link to="/corporate" className="hover:text-background transition-colors">Corporate Information</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-semibold mb-4">HELP</h3>
            <ul className="space-y-2 text-background/70">
              <li><Link to="/payments" className="hover:text-background transition-colors">Payments</Link></li>
              <li><Link to="/shipping" className="hover:text-background transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-background transition-colors">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-background transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-lg font-semibold mb-4">POLICY</h3>
            <ul className="space-y-2 text-background/70">
              <li><Link to="/return-policy" className="hover:text-background transition-colors">Return Policy</Link></li>
              <li><Link to="/terms" className="hover:text-background transition-colors">Terms Of Use</Link></li>
              <li><Link to="/security" className="hover:text-background transition-colors">Security</Link></li>
              <li><Link to="/privacy" className="hover:text-background transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CONTACT US</h3>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <span>support@shopkart.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <span>1800-123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="shrink-0 mt-1" />
                <span>ShopKart Internet Pvt Ltd, Buildings Alyssa, Begonia & Clover, Embassy Tech Village, Bangalore - 560103</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">ShopKart</span>
              <span className="text-background/50">© 2024 All rights reserved</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
