import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Plus, 
  Minus,
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
  BarChart3,
  Lock,
  Key,
  ShieldCheck,
  Eye,
  Info,
  Upload,
  Image as ImageIcon,
  Edit2
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
  recentSales: { 
    date: string; 
    orders_count: number;
    sales_amount: number;
    profit_amount: number;
  }[];
}

// --- Components ---

const Navbar = ({ isAdmin, setIsAdmin, cartCount, onCartClick, onLogout }: { 
  isAdmin: boolean; 
  setIsAdmin: (v: boolean) => void; 
  cartCount: number;
  onCartClick: () => void;
  onLogout: () => void;
}) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">Logeachi<span className="text-emerald-600">.com</span></h1>
    </div>
    
    <div className="flex items-center gap-4">
      {isAdmin ? (
        <button 
          onClick={onLogout}
          className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          Logout
        </button>
      ) : (
        <button 
          onClick={() => setIsAdmin(true)}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Admin Panel
        </button>
      )}
      
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

const AdminLogin = ({ onLogin, onCancel }: { onLogin: (pw: string) => Promise<boolean>, onCancel: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await onLogin(password);
    if (!success) {
      setError('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-[40px] border border-zinc-100 shadow-2xl"
      >
        <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-black text-center mb-2">Admin Access</h2>
        <p className="text-zinc-500 text-center mb-8">Please enter your password to continue.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login to Dashboard'}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-4 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-all"
          >
            Back to Store
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Constants ---

const BANGLADESH_DATA: Record<string, string[]> = {
  "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur", "Motijheel", "Tejgaon", "Badda", "Khilgaon", "Savar", "Keraniganj", "Dhamrai", "Nawabganj", "Dohar"],
  "Chittagong": ["Panchlaish", "Double Mooring", "Kotwali", "Bakalia", "Halishahar", "Pahartali", "Bandar", "Chandgaon", "Patenga", "Hathazari", "Sitakunda", "Patiya", "Raozan", "Fatikchhari"],
  "Sylhet": ["Kotwali", "Shahporan", "South Surma", "Osmani Nagar", "Bishwanath", "Fenchuganj", "Balaganj", "Golapganj", "Beani Bazar", "Zakiganj", "Kanaighat", "Jaintiapur"],
  "Rajshahi": ["Boalia", "Rajput", "Motihar", "Shah Mokhdum", "Paba", "Godagari", "Tanore", "Bagmara", "Durgapur", "Putia", "Charghat", "Mohanpur"],
  "Khulna": ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Batiaghata", "Dacope", "Dumuria", "Paikgachha", "Phultala", "Rupsha", "Terokhada"],
  "Barisal": ["Barisal Sadar", "Bakerganj", "Babuganj", "Banaripara", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur", "Agailjhara"],
  "Rangpur": ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  "Mymensingh": ["Mymensingh Sadar", "Muktagachha", "Fulbaria", "Trishal", "Bhaluka", "Gaffargaon", "Nandail", "Ishwarganj", "Haluaghat", "Dhobaura", "Phulpur", "Tara Khanda"],
  "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"],
  "Narayanganj": ["Narayanganj Sadar", "Bandar", "Fatullah", "Siddhirganj", "Araihazar", "Sonargaon", "Rupganj"],
  "Comilla": ["Comilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Titas"],
  "Brahmanbaria": ["Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Akhaura", "Bijoynagar"],
  "Noakhali": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"],
  "Feni": ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"],
  "Bogura": ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Sherpur", "Shajahanpur", "Sonatola", "Shibganj"],
  "Dinajpur": ["Dinajpur Sadar", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  "Jessore": ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  "Kushtia": ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Daulatpur", "Bheramara"],
  "Pabna": ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  "Tangail": ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Dhanbari"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"],
  "Sunamganj": ["Sunamganj Sadar", "Bishwamvampur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur", "South Sunamganj"],
  "Habiganj": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Sayestaganj"],
  "Moulvibazar": ["Moulvibazar Sadar", "Barlekha", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal", "Juri"],
};

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: 0, cost_price: 0, image_url: '', category: '', stock: 0
  });

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price,
      cost_price: product.cost_price,
      image_url: product.image_url || '',
      category: product.category || '',
      stock: product.stock
    });
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', description: '', price: 0, cost_price: 0, image_url: '', category: '', stock: 0 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please select an image under 5MB.");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image_url: reader.result as string });
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, oRes, aRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/analytics')
      ]);
      
      if (pRes.ok) setProducts(await pRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (!response.ok) {
        let errorMessage = editingId ? 'Failed to update product' : 'Failed to add product';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON (e.g. HTML error page)
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setNewProduct({ name: '', description: '', price: 0, cost_price: 0, image_url: '', category: '', stock: 0 });
      setEditingId(null);
      await fetchData();
      alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Error: ' + error.message);
    }
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

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold mb-6">Daily Performance (Last 7 Days)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="pb-4 font-bold text-zinc-400 text-xs uppercase tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-zinc-400 text-xs uppercase tracking-wider">Orders</th>
                    <th className="pb-4 font-bold text-zinc-400 text-xs uppercase tracking-wider">Sales</th>
                    <th className="pb-4 font-bold text-zinc-400 text-xs uppercase tracking-wider">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {analytics.recentSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 font-medium text-zinc-700">{sale.date}</td>
                      <td className="py-4 font-bold text-zinc-900">{sale.orders_count}</td>
                      <td className="py-4 font-bold text-emerald-600">৳{sale.sales_amount.toLocaleString()}</td>
                      <td className="py-4 font-bold text-blue-600">৳{sale.profit_amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.recentSales.length === 0 && (
                <p className="text-center text-zinc-400 py-12">No sales data yet.</p>
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
                {editingId ? (
                  <>
                    <Edit2 size={20} className="text-amber-600" /> Edit Product
                  </>
                ) : (
                  <>
                    <Plus size={20} className="text-emerald-600" /> Add New Product
                  </>
                )}
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
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Cost Price (৳)</label>
                    <input 
                      type="number" required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={newProduct.cost_price}
                      onChange={e => setNewProduct({...newProduct, cost_price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Stock Quantity</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Product Image</label>
                  <div className="space-y-3">
                    {newProduct.image_url && (
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                        <img 
                          src={newProduct.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setNewProduct({...newProduct, image_url: ''})}
                          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 hover:bg-white transition-all shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 hover:border-emerald-500/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                          <p className="text-sm text-zinc-500">
                            <span className="font-bold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ImageIcon size={16} className="text-zinc-400" />
                        </div>
                        <input 
                          type="text"
                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                          value={newProduct.image_url.startsWith('data:') ? '' : newProduct.image_url}
                          placeholder="Or paste image URL here..."
                          onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Description</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    rows={3}
                    value={newProduct.description}
                    placeholder="Describe your product..."
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className={`flex-1 py-4 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      editingId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    }`}
                  >
                    {isUploading ? 'Processing Image...' : editingId ? 'Update Product' : 'Save Product'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="p-2 text-zinc-400 hover:text-amber-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }: { 
  product: Product | null; 
  isOpen: boolean; 
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) => {
  if (!product || !isOpen) return null;

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
        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-sm"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
          <img 
            src={product.image_url || `https://picsum.photos/seed/${product.id}/800/800`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {product.category || 'General'}
              </span>
            </div>
            
            <h2 className="text-3xl font-black text-zinc-900 mb-4">{product.name}</h2>
            <p className="text-4xl font-black text-emerald-600 mb-8">৳{product.price}</p>
            
            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Product Details
              </h4>
              <p className="text-zinc-600 leading-relaxed">
                {product.description || "No description provided for this product. Our items are carefully selected to ensure the highest quality for our customers."}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100">
            <button 
              disabled={product.stock <= 0}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full py-5 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:bg-zinc-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CustomerView = ({ onAddToCart }: { onAddToCart: (p: Product) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

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
              onClick={() => openProductDetail(product)}
              className="group bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 bg-white/90 backdrop-blur-md rounded-full text-zinc-900 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Eye size={24} />
                  </div>
                </div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
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

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

const CartModal = ({ isOpen, onClose, cart, setCart, onUpdateQuantity }: { 
  isOpen: boolean; 
  onClose: () => void; 
  cart: { product: Product; quantity: number }[];
  setCart: (c: any) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    phone: '', 
    district: '', 
    thana: '', 
    localAddress: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fullAddress = `${customerInfo.localAddress}, ${customerInfo.thana}, ${customerInfo.district}`;
    
    const orderData = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: fullAddress,
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
                          <div className="flex items-center gap-3 mt-1">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-zinc-200 rounded-md hover:bg-zinc-300 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-zinc-200 rounded-md hover:bg-zinc-300 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="text-sm text-zinc-500 ml-2">৳{item.product.price * item.quantity}</span>
                          </div>
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
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setStep('checkout')}
                        className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-zinc-900/10"
                      >
                        Proceed to Checkout
                      </button>
                      <button 
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                      >
                        Add More Products
                      </button>
                    </div>
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">District (জেলা)</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                    value={customerInfo.district}
                    onChange={e => setCustomerInfo({...customerInfo, district: e.target.value, thana: ''})}
                  >
                    <option value="">Select District</option>
                    {Object.keys(BANGLADESH_DATA).sort().map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Thana/Upazila (থানা)</label>
                  <select 
                    required
                    disabled={!customerInfo.district}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none disabled:opacity-50"
                    value={customerInfo.thana}
                    onChange={e => setCustomerInfo({...customerInfo, thana: e.target.value})}
                  >
                    <option value="">Select Thana</option>
                    {customerInfo.district && BANGLADESH_DATA[customerInfo.district].sort().map(thana => (
                      <option key={thana} value={thana}>{thana}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Local Address (বাসা/রোড/এলাকা)</label>
                  <textarea 
                    required rows={2}
                    placeholder="House no, Road no, Area details..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    value={customerInfo.localAddress}
                    onChange={e => setCustomerInfo({...customerInfo, localAddress: e.target.value})}
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

  const handleLogout = () => {
    setIsAdmin(false);
  };

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

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onLogout={handleLogout}
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
        onUpdateQuantity={updateQuantity}
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
