import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Package, 
  Phone, 
  MapPin, 
  User,
  ChevronRight,
  Menu,
  X,
  ShoppingCart,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

interface Analytics {
  total_sales: number;
  total_orders: number;
  total_profit: number;
  recentSales: { date: string; amount: number }[];
}

// --- Components ---

const Navbar = ({ isAdmin, setIsAdmin, cartCount, onCartClick }: { 
  isAdmin: boolean; 
  setIsAdmin: (v: boolean) => void; 
  cartCount: number;
  onCartClick: () => void;
}) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">Logeachi<span className="text-emerald-600">.com</span></h1>
    </div>
    
    <div className="flex items-center gap-4">
      <button 
        onClick={() => setIsAdmin(!isAdmin)}
        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        {isAdmin ? 'Customer View' : 'Admin Panel'}
      </button>
      
      {!isAdmin && (
        <button 
          onClick={onCartClick}
          className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      )}
    </div>
  </nav>
);

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: 0, cost_price: 0, image_url: '', category: '', stock: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pRes, oRes, aRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/orders'),
      fetch('/api/analytics')
    ]);
    setProducts(await pRes.json());
    setOrders(await oRes.json());
    setAnalytics(await aRes.json());
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    setNewProduct({ name: '', description: '', price: 0, cost_price: 0, image_url: '', category: '', stock: 0 });
    fetchData();
  };

  const handleDeleteProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'}`}
        >
          <BarChart3 size={18} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'}`}
        >
          <Package size={18} /> Products
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'}`}
        >
          <ShoppingBag size={18} /> Orders
        </button>
      </div>

      {activeTab === 'stats' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign size={24} />
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Sales</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-1">৳{analytics.total_sales.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Profit</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-1">৳{analytics.total_profit.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={24} />
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-1">{analytics.total_orders}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Recent Sales Activity</h3>
            <div className="space-y-4">
              {analytics.recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-zinc-700">{sale.date}</span>
                  </div>
                  <span className="font-bold text-zinc-900">৳{sale.amount.toLocaleString()}</span>
                </div>
              ))}
              {analytics.recentSales.length === 0 && (
                <p className="text-center text-zinc-400 py-8">No sales data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" /> Add New Product
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Product Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Selling Price (৳)</label>
                    <input 
                      type="number" required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={newProduct.price || ''}
                      onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Cost Price (৳)</label>
                    <input 
                      type="number" required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={newProduct.cost_price || ''}
                      onChange={e => setNewProduct({...newProduct, cost_price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Stock Quantity</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={newProduct.stock || ''}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Image URL</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={newProduct.image_url}
                    placeholder="https://picsum.photos/seed/product/400/400"
                    onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image_url || `https://picsum.photos/seed/${product.id}/50/50`} 
                            className="w-10 h-10 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-medium text-zinc-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">৳{product.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-12 text-center text-zinc-400">No products found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold">Order #{order.id}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button 
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-zinc-400 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase">Customer</p>
                      <p className="font-medium">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-zinc-400 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase">Phone</p>
                      <p className="font-medium">{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-zinc-400 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase">Address</p>
                      <p className="font-medium">{order.customer_address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Order Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-zinc-600">{item.product_name} x {item.quantity}</span>
                        <span className="font-bold">৳{item.price_at_purchase * item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-3 mt-3 border-t border-zinc-200 flex justify-between">
                      <span className="font-bold text-zinc-900">Total</span>
                      <span className="font-bold text-emerald-600 text-lg">৳{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-12 text-center text-zinc-400 bg-white rounded-3xl border border-zinc-100">No orders placed yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

const CustomerView = ({ onAddToCart }: { onAddToCart: (p: Product) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-[40px] overflow-hidden mb-12 bg-zinc-900">
        <img 
          src="https://picsum.photos/seed/shopping/1920/1080" 
          className="w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
          >
            Quality Products,<br/>Delivered to You.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-300 text-lg max-w-xl"
          >
            Explore our curated collection of high-quality items at the best prices in Bangladesh.
          </motion.p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-zinc-900">Featured Products</h3>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-zinc-100 rounded-full text-sm font-medium text-zinc-600">All</span>
          <span className="px-4 py-2 hover:bg-zinc-100 rounded-full text-sm font-medium text-zinc-400 cursor-pointer transition-colors">New Arrivals</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-[350px] bg-zinc-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-full uppercase tracking-widest">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h4 className="font-bold text-zinc-900 mb-1 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-black text-zinc-900">৳{product.price}</span>
                  <button 
                    disabled={product.stock <= 0}
                    onClick={() => onAddToCart(product)}
                    className="p-3 bg-zinc-900 text-white rounded-2xl hover:bg-emerald-600 disabled:bg-zinc-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-900/10"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-20 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
          <Package size={48} className="mx-auto text-zinc-300 mb-4" />
          <h4 className="text-xl font-bold text-zinc-900">No products yet</h4>
          <p className="text-zinc-500">Check back later for amazing deals!</p>
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-20 bg-emerald-600 rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-black mb-4">Need Help?</h3>
          <p className="text-emerald-100 text-lg">Our customer support is available 24/7 for any queries.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="tel:+880123456789" className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-colors">
            <Phone size={20} /> +880 123 456 789
          </a>
          <button className="flex items-center gap-3 px-8 py-4 bg-emerald-700 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

const CartModal = ({ isOpen, onClose, cart, setCart }: { 
  isOpen: boolean; 
  onClose: () => void; 
  cart: { product: Product; quantity: number }[];
  setCart: (c: any) => void;
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const orderData = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        setStep('success');
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-zinc-900">
              {step === 'cart' ? 'Your Cart' : step === 'checkout' ? 'Checkout' : 'Order Placed!'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {step === 'cart' && (
            <div className="space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="mx-auto text-zinc-100 mb-4" />
                  <p className="text-zinc-500">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2">
                    {cart.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
                        <img 
                          src={item.product.image_url || `https://picsum.photos/seed/${item.product.id}/80/80`} 
                          className="w-16 h-16 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-900">{item.product.name}</h4>
                          <p className="text-sm text-zinc-500">৳{item.product.price} x {item.quantity}</p>
                        </div>
                        <button 
                          onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-zinc-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-zinc-500 font-medium">Total Amount</span>
                      <span className="text-2xl font-black text-zinc-900">৳{total}</span>
                    </div>
                    <button 
                      onClick={() => setStep('checkout')}
                      className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-zinc-900/10"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'checkout' && (
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Phone Number</label>
                  <input 
                    type="tel" required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Delivery Address</label>
                  <textarea 
                    required rows={3}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-500 font-medium">Total to Pay</span>
                  <span className="text-2xl font-black text-zinc-900">৳{total}</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep('cart')}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-2">Thank you for your order!</h4>
              <p className="text-zinc-500 mb-8">We've received your order and will contact you shortly for confirmation.</p>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main>
        <AnimatePresence mode="wait">
          {isAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminDashboard />
            </motion.div>
          ) : (
            <motion.div
              key="customer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CustomerView onAddToCart={addToCart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        setCart={setCart}
      />

      <footer className="bg-white border-t border-zinc-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <span className="font-bold tracking-tight">Logeachi.com</span>
          </div>
          <p className="text-zinc-400 text-sm">© 2024 Logeachi.com. All rights reserved.</p>
          <div className="flex gap-6 text-zinc-400 text-sm font-medium">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
