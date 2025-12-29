import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Trash2 } from "lucide-react";

export default function ProductsList() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile) {
      loadProducts();
    }
  }, [profile, authLoading]);

  async function loadProducts() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Products & Services
            </h1>
            <p className="text-gray-400">Manage your products that will be used in ad campaigns</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/products/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6">Create your first product or service to start advertising</p>
              <Button onClick={() => navigate('/products/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
                <CardHeader>
                  {product.logo_url && (
                    <img 
                      src={product.logo_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle className="text-white">{product.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {product.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  {product.price && (
                    <p className="text-primary font-bold mb-4">₹{product.price}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.target_age_min && product.target_age_max && (
                      <Badge variant="outline" className="text-gray-300">
                        Age: {product.target_age_min}-{product.target_age_max}
                      </Badge>
                    )}
                    {product.target_gender && (
                      <Badge variant="outline" className="text-gray-300">
                        {product.target_gender}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('Delete this product?')) {
                          await supabase.from('products').delete().eq('id', product.id);
                          loadProducts();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
