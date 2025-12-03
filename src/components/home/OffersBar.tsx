import { Gift, Truck, Shield, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Gift,
    title: 'Daily Offers',
    description: 'New deals every day',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over ₹499',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '100% protected',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day returns',
  },
];

export function OffersBar() {
  return (
    <section className="py-6">
      <div className="bg-card rounded-xl shadow-card p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <feature.icon className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
