import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Heart, LogOut, Edit2, Save, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function Account() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data?.full_name || '',
        phone: data?.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev!,
        full_name: formData.full_name,
        phone: formData.phone,
      }));
      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <User size={48} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Please sign in</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to view and manage your account.
            </p>
            <Link to="/auth">
              <Button className="btn-buy">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">My Account</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <User className="text-primary" size={32} />
                  </div>
                  <h2 className="font-semibold text-foreground">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <nav className="space-y-1">
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground"
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground"
                  >
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    to="/addresses"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-foreground"
                  >
                    <MapPin size={20} />
                    <span>Addresses</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive w-full"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            full_name: profile?.full_name || '',
                            phone: profile?.phone || '',
                          });
                        }}
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        <Save size={16} className="mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editing ? (
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                          <User size={18} className="text-muted-foreground" />
                          <span className="text-foreground">{profile?.full_name || 'Not set'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <Mail size={18} className="text-muted-foreground" />
                        <span className="text-foreground">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <Phone size={18} className="text-muted-foreground" />
                        <span className="text-foreground">{profile?.phone || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <Link to="/orders" className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                  <Package className="text-primary mb-3" size={24} />
                  <h3 className="font-semibold text-foreground mb-1">My Orders</h3>
                  <p className="text-sm text-muted-foreground">Track, return, or buy things again</p>
                </Link>

                <Link to="/wishlist" className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                  <Heart className="text-primary mb-3" size={24} />
                  <h3 className="font-semibold text-foreground mb-1">Wishlist</h3>
                  <p className="text-sm text-muted-foreground">Your saved items</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
