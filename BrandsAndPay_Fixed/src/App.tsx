import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';

import { ShoppingBag, Heart, Menu, X, Plus, Minus, Settings, LogOut, RefreshCw, Upload, Trash2, Package, Tag, Users, Bell, Database } from 'lucide-react';

// ─── Firebase Config ───────────────────────────────────────────────────────────
const DEFAULT_FB_CONFIG = {
  apiKey: "AIzaSyBKA4fcjjoltyeljlKb-pD3Ieumk7qiAxY",
  databaseURL: "https://barndsandpay-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "barndsandpay",
  storageBucket: "barndsandpay.firebasestorage.app"
};
const ADMIN_PASS = '1234';
const MASTER_PASS = '1234';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  price: number;
  category: 'women' | 'men' | 'accessories';
  brand?: string;
  image: string;
  description: string;
  sizes: string[];
  colors: string[];
}
interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}
interface Order {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  timestamp: number;
}

// ─── Default Products ──────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "Wool Blend Trench Coat", price: 299, category: "women", image: "/images/products/trench-coat.jpg", description: "Timeless wool blend trench coat.", sizes: ["XS","S","M","L"], colors: ["#000000","#4B5563","#D1D5DB"] },
  { id: 2, name: "Linen Shirt Dress", price: 129, category: "women", image: "/images/products/shirt-dress.jpg", description: "Crisp linen shirt dress.", sizes: ["XS","S","M","L"], colors: ["#F8F8F8","#000000","#334155"] },
  { id: 3, name: "Slim Fit Black Jeans", price: 89, category: "women", image: "/images/products/black-jeans.jpg", description: "Premium stretch denim jeans.", sizes: ["26","28","30","32"], colors: ["#111111","#334155"] },
  { id: 4, name: "Leather Biker Jacket", price: 399, category: "men", image: "/images/products/leather-jacket.jpg", description: "Genuine leather biker jacket.", sizes: ["S","M","L","XL"], colors: ["#3F2A1E","#111111"] },
  { id: 5, name: "Oxford Button-Down Shirt", price: 79, category: "men", image: "/images/products/oxford-shirt.jpg", description: "Classic oxford cotton shirt.", sizes: ["S","M","L","XL"], colors: ["#F8F8F8","#111111","#334155"] },
  { id: 6, name: "Slim Chino Pants", price: 99, category: "men", image: "/images/products/chino-pants.jpg", description: "Tailored slim fit chinos.", sizes: ["28","30","32","34"], colors: ["#E5E7EB","#111111","#4B5563"] },
  { id: 7, name: "Leather Tote Bag", price: 149, category: "accessories", image: "/images/products/leather-tote.jpg", description: "Structured leather tote bag.", sizes: ["One Size"], colors: ["#5C4033","#111111"] },
  { id: 8, name: "Leather Sneakers", price: 119, category: "accessories", image: "/images/products/sneakers.jpg", description: "Premium leather sneakers.", sizes: ["40","41","42","43"], colors: ["#FFFFFF","#111111"] },
  { id: 9, name: "Silk Button-Up Blouse", price: 159, category: "women", image: "/images/products/silk-blouse.jpg", description: "Luxurious silk blouse.", sizes: ["XS","S","M","L"], colors: ["#111111","#F3E8FF","#334155"] },
  { id: 10, name: "Cable Knit Wool Sweater", price: 129, category: "men", image: "/images/products/wool-sweater.jpg", description: "Heavyweight cable knit sweater.", sizes: ["S","M","L","XL"], colors: ["#9CA3AF","#111111","#4B5563"] },
  { id: 11, name: "Aviator Sunglasses", price: 89, category: "accessories", image: "/images/products/sunglasses.jpg", description: "Classic aviator sunglasses.", sizes: ["One Size"], colors: ["#000000","#D4AF37"] }
];

const categories = [
  { name: 'Women', value: 'women' as const, image: '/images/hero-women.jpg' },
  { name: 'Men', value: 'men' as const, image: '/images/hero-men.jpg' },
  { name: 'Accessories', value: 'accessories' as const, image: '/images/hero-accessories.jpg' },
];

// ─── Firebase Hook ─────────────────────────────────────────────────────────────
function useFirebase() {
  const [db, setDb] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fbConfig = JSON.parse(localStorage.getItem('bp_fb_config') || 'null') || DEFAULT_FB_CONFIG;
    loadFirebase(fbConfig);
  }, []);

  function loadFirebase(config: typeof DEFAULT_FB_CONFIG) {
    if (typeof window === 'undefined') return;
    const load = () => {
      try {
        if ((window as any).firebase?.apps?.length) {
          (window as any).firebase.apps[0].delete().then(() => initDb(config));
        } else {
          initDb(config);
        }
      } catch { initDb(config); }
    };
    if (!(window as any).firebase) {
      const s1 = document.createElement('script');
      s1.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js';
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database-compat.js';
        s2.onload = load;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    } else { load(); }
  }

  function initDb(config: typeof DEFAULT_FB_CONFIG) {
    try {
      const app = (window as any).firebase.initializeApp(config);
      const database = (window as any).firebase.database(app);
      database.ref('.info/connected').on('value', (snap: any) => {
        setConnected(snap.val() === true);
        if (snap.val() === true) loadData(database);
      });
      setDb(database);
    } catch (e) { setConnected(false); }
  }

  async function loadData(database: any) {
    try {
      const prodSnap = await database.ref('data/products').once('value');
      if (prodSnap.exists()) setProducts(Object.values(prodSnap.val()));
      const orderSnap = await database.ref('orders').once('value');
      if (orderSnap.exists()) {
        const arr: Order[] = [];
        orderSnap.forEach((c: any) => { if (c.val()) arr.push(c.val()); });
        setOrders(arr.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (e) { console.error(e); }
  }

  async function saveOrder(order: Order) {
    if (db && connected) {
      await db.ref(`orders/${order.id}`).set(order);
      setOrders(prev => [order, ...prev]);
    }
  }

  async function updateOrderStatus(orderId: string, status: Order['status']) {
    if (db && connected) {
      await db.ref(`orders/${orderId}/status`).set(status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  }

  async function saveProducts(prods: Product[]) {
    setProducts(prods);
    localStorage.setItem('bp_products', JSON.stringify(prods));
    if (db && connected) await db.ref('data/products').set(prods);
  }

  return { db, connected, products, setProducts: saveProducts, orders, saveOrder, updateOrderStatus, loadFirebase };
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg: string, duration = 2200) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:32px;right:32px;background:#111;color:#fff;padding:14px 24px;z-index:9999;font-size:14px;border-radius:4px;animation:fadeIn .2s;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ cartCount, wishlistCount, onCartClick, onWishlistClick }: {
  cartCount: number; wishlistCount: number; onCartClick: () => void; onWishlistClick: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { label: 'Women', key: 'women' }, { label: 'Men', key: 'men' }, { label: 'Accessories', key: 'accessories' },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-black">Brand's<span className="text-zinc-500">&amp;pay</span></Link>
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <Link key={item.key} to="/shop" className="text-sm uppercase tracking-[1px] hover:text-zinc-400 transition-colors font-medium">{item.label}</Link>
            ))}
            <Link to="/shop" className="text-sm uppercase tracking-[1px] hover:text-zinc-400 transition-colors font-medium">NEW</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative w-64">
              <input type="text" placeholder="SEARCH" className="w-full bg-zinc-100 border border-transparent focus:border-black pl-10 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none" />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button onClick={onWishlistClick} className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</div>}
            </button>
            <button onClick={onCartClick} className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</div>}
            </button>
            <Link to="/admin" className="hidden md:flex items-center gap-1 text-xs text-zinc-400 hover:text-black transition-colors"><Settings size={16} /></Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">{isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </div>
      
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-6 py-8 flex flex-col gap-6 text-lg">
              {navItems.map((item, i) => <Link key={i} to="/shop" className="py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>)}
              <Link to="/admin" className="py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>⚙ Admin</Link>
            </div>
          </div>
        )}
      
    </nav>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onQuickView, onToggleWishlist, isWishlisted }: {
  product: Product; onQuickView: (p: Product) => void; onToggleWishlist: (id: number) => void; isWishlisted: boolean;
}) {
  return (
    <div className="group relative overflow-hidden bg-white cursor-pointer" onClick={() => onQuickView(product)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-4 right-4 z-10">
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }} className="bg-white/90 hover:bg-white p-3 rounded-full transition-all">
            <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-black"} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className="w-full bg-white py-3.5 text-xs tracking-[1px] uppercase font-medium opacity-0 group-hover:opacity-100 transition-all">QUICK VIEW</button>
        </div>
      </div>
      <div className="pt-5 pb-8 px-1">
        <div className="flex justify-between items-baseline">
          <h3 className="font-light text-[15px] tracking-tight">{product.name}</h3>
          <div className="text-sm tabular-nums">ج.م {product.price}</div>
        </div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{product.category}</div>
      </div>
    </div>
  );
}

// ─── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetail({ product, onAddToCart, onClose, onToggleWishlist, isWishlisted }: {
  product: Product | null; onAddToCart: (item: CartItem) => void; onClose: () => void; onToggleWishlist: (id: number) => void; isWishlisted: boolean;
}) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const handleAdd = () => {
    if (!selectedSize || !selectedColor) { showToast('❌ اختر المقاس واللون'); return; }
    onAddToCart({ ...product, selectedSize, selectedColor, quantity });
    onClose();
    showToast('✓ تمت الإضافة للسلة');
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-zinc-50"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
          <div className="md:w-1/2 p-10 md:p-14">
            <button onClick={onClose} className="float-right -mr-2 -mt-2 p-3"><X size={22} /></button>
            <div className="mb-8">
              <div className="uppercase tracking-[2px] text-xs mb-2 text-zinc-500">{product.category}</div>
              <h1 className="text-4xl font-light tracking-tight">{product.name}</h1>
              <div className="text-2xl mt-4">ج.م {product.price}</div>
            </div>
            <p className="text-zinc-600 leading-relaxed mb-9 max-w-md">{product.description}</p>
            <div className="mb-8">
              <div className="uppercase text-xs tracking-[1px] mb-3">COLOR</div>
              <div className="flex gap-3">{product.colors.map((color, idx) => <button key={idx} onClick={() => setSelectedColor(color)} className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black scale-110' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} />)}</div>
            </div>
            <div className="mb-9">
              <div className="flex justify-between items-center mb-3"><div className="uppercase text-xs tracking-[1px]">SIZE</div></div>
              <div className="flex flex-wrap gap-2">{product.sizes.map((size, idx) => <button key={idx} onClick={() => setSelectedSize(size)} className={`px-6 py-3 border text-sm transition-all hover:border-black ${selectedSize === size ? 'border-black bg-black text-white' : 'border-zinc-200'}`}>{size}</button>)}</div>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <div className="uppercase text-xs tracking-[1px] pr-4 border-r">QUANTITY</div>
              <div className="flex items-center border border-zinc-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-zinc-100"><Minus size={14} /></button>
                <div className="px-6 font-mono text-sm">{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-zinc-100"><Plus size={14} /></button>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleAdd} className="flex-1 bg-black text-white py-4 text-sm tracking-[2px] hover:bg-zinc-900 transition-colors">ADD TO BAG</button>
              <button onClick={() => onToggleWishlist(product.id)} className="border border-black px-8 flex items-center justify-center hover:bg-zinc-100 transition-colors"><Heart className={isWishlisted ? "fill-red-500 text-red-500" : ""} size={19} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ cart, onClose, onSuccess }: { cart: CartItem[]; onClose: () => void; onSuccess: (order: Order) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const submit = () => {
    if (!name) { showToast('❌ اكتب اسمك أولاً!'); return; }
    if (!phone) { showToast('❌ اكتب رقم جوالك!'); return; }
    const orderId = 'BP' + Date.now().toString().slice(-8);
    const order: Order = { id: orderId, name, phone, address, notes, items: cart, total, status: 'pending', timestamp: Date.now() };
    onSuccess(order);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md p-10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-light">إتمام الطلب</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="space-y-4 mb-8">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم *" className="w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-black" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الجوال *" className="w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-black" type="tel" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="العنوان" className="w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-black" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات" rows={3} className="w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" />
        </div>
        <div className="border-t pt-6 mb-6">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between text-sm mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>ج.م {item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4 pt-4 border-t">
            <span>الإجمالي</span>
            <span>ج.م {total}</span>
          </div>
        </div>
        <button onClick={submit} className="w-full py-4 bg-black text-white text-sm tracking-[2px] hover:bg-zinc-900">تأكيد الطلب ←</button>
      </div>
    </div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ products, onProductClick, onToggleWishlist, wishlist }: {
  products: Product[]; onProductClick: (p: Product) => void; onToggleWishlist: (id: number) => void; wishlist: number[];
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = ['/images/hero-women.jpg', '/images/hero-men.jpg', '/images/hero-accessories.jpg'];
  useEffect(() => {
    const interval = setInterval(() => setHeroIndex(prev => (prev + 1) % heroImages.length), 4500);
    return () => clearInterval(interval);
  }, []);
  const featured = products.slice(0, 8);
  return (
    <>
      <div className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        
          <img key={heroIndex} src={heroImages[heroIndex]} alt="Campaign" className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <div className="uppercase tracking-[4px] text-sm mb-5 text-white/90">AUTUMN WINTER 2024</div>
          <h1 className="text-[72px] md:text-[110px] font-bold text-white tracking-[-3px] leading-none mb-4">Brand's<br /><span className="font-light">&amp;pay</span></h1>
          <Link to="/shop" className="inline-block border border-white text-white px-16 py-4 text-xs tracking-[3px] hover:bg-white hover:text-black transition-all mt-6">SHOP NOW</Link>
        </div>
        <div className="absolute bottom-12 left-1/2 flex gap-3 z-10">
          {heroImages.map((_, i) => <button key={i} onClick={() => setHeroIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-8' : 'bg-white/50'}`} />)}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="uppercase tracking-[3px] text-sm">JUST IN</div>
            <div className="text-5xl font-light mt-1">New Arrivals</div>
          </div>
          <Link to="/shop" className="text-sm pb-1 border-b">VIEW ALL</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => <ProductCard key={product.id} product={product} onQuickView={onProductClick} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.includes(product.id)} />)}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <div className="uppercase tracking-[3px] text-xs">EXPLORE</div>
          <div className="text-5xl font-light mt-2">Collections</div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link to="/shop" key={i} className="group relative h-[580px] overflow-hidden rounded-xl" onClick={() => window.scrollTo({ top: 0 })}>
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 text-white">
                <div className="text-sm tracking-[3px] mb-3">SHOP {cat.name.toUpperCase()}</div>
                <div className="text-6xl font-light tracking-tight">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="bg-zinc-900 py-24 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs tracking-[3px] opacity-60 mb-4">Brand's&amp;pay</div>
          <div className="text-5xl font-light max-w-[26ch] mx-auto leading-none">Timeless design crafted with the finest materials.</div>
        </div>
      </div>
    </>
  );
}

// ─── Shop Page ─────────────────────────────────────────────────────────────────
function ShopPage({ products, onProductClick, onToggleWishlist, wishlist }: {
  products: Product[]; onProductClick: (p: Product) => void; onToggleWishlist: (id: number) => void; wishlist: number[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'women' | 'men' | 'accessories'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = products.filter(p => (selectedCategory === 'all' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => sortOption === 'price-low' ? a.price - b.price : sortOption === 'price-high' ? b.price - a.price : 0);
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-60 flex-shrink-0">
            <div className="sticky top-24">
              <div className="uppercase tracking-widest text-xs mb-8">FILTERS</div>
              <div className="mb-9">
                <div className="text-sm mb-4">CATEGORIES</div>
                <div className="space-y-3">{['all', 'women', 'men', 'accessories'].map(cat => <label key={cat} className="flex items-center gap-3 cursor-pointer text-sm"><input type="radio" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat as any)} className="accent-black" /><span className="capitalize">{cat}</span></label>)}</div>
              </div>
              <div>
                <div className="text-sm mb-4">SORT BY</div>
                <select value={sortOption} onChange={e => setSortOption(e.target.value as any)} className="w-full border py-3.5 px-4 text-sm bg-white">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border py-3 px-5 w-72 focus:outline-none focus:border-black text-sm" />
              <div className="text-sm text-zinc-500">{filtered.length} PRODUCTS</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filtered.length > 0 ? filtered.map(p => <ProductCard key={p.id} product={p} onQuickView={onProductClick} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.includes(p.id)} />) : <div className="col-span-full py-12 text-center">No products found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ────────────────────────────────────────────────────────────────
function AdminPage({ orders, products, onUpdateStatus, onSaveProducts, connected }: {
  orders: Order[]; products: Product[]; onUpdateStatus: (id: string, status: Order['status']) => void; onSaveProducts: (p: Product[]) => void; connected: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  const login = () => {
    if (pass === ADMIN_PASS || pass === MASTER_PASS) { setIsLoggedIn(true); showToast('✓ مرحباً يا مدير!'); }
    else showToast('❌ كلمة المرور غير صحيحة!');
  };

  useEffect(() => { setLocalProducts(products); }, [products]);

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
  };
  const statusAr: Record<Order['status'], string> = {
    pending: 'قيد الانتظار', confirmed: 'مؤكد', shipped: 'تم الشحن', delivered: 'تم التسليم'
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-zinc-50">
        <div className="bg-white border border-zinc-200 p-12 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2">لوحة التحكم</h2>
          <p className="text-zinc-500 text-sm mb-8">Brand's&amp;pay Admin</p>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="كلمة المرور..." className="w-full border border-zinc-200 px-4 py-3 text-center text-lg focus:outline-none focus:border-black mb-4" />
          <button onClick={login} className="w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-zinc-800 transition-colors">دخول ←</button>
          <p className="text-xs text-zinc-400 mt-4">الباسورد الافتراضي: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Brand's&amp;pay</span>
          <span className="text-zinc-400">|</span>
          <span className="text-sm text-zinc-500">لوحة التحكم</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            <Database size={12} />
            {connected ? 'متصل بـ Firebase' : 'غير متصل'}
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black"><LogOut size={16} /> خروج</button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: orders.length, icon: <Package size={20} />, color: 'text-blue-600' },
          { label: 'قيد الانتظار', value: orders.filter(o => o.status === 'pending').length, icon: <Bell size={20} />, color: 'text-yellow-600' },
          { label: 'المنتجات', value: products.length, icon: <Tag size={20} />, color: 'text-green-600' },
          { label: 'إجمالي المبيعات', value: `ج.م ${orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0).toLocaleString()}`, icon: <Users size={20} />, color: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-5 rounded-lg">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="flex gap-1 mb-6 border-b">
          {[{ key: 'orders', label: '📦 الطلبات' }, { key: 'products', label: '🏷 المنتجات' }, { key: 'settings', label: '⚙ الإعدادات' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} className={`px-6 py-3 text-sm transition-colors -mb-px border-b-2 ${tab === t.key ? 'border-black text-black font-semibold' : 'border-transparent text-zinc-500 hover:text-black'}`}>{t.label}</button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-semibold">الطلبات ({orders.length})</h3>
              <button onClick={() => showToast('🔄 جاري التحديث...')} className="text-xs flex items-center gap-1 text-zinc-500 hover:text-black"><RefreshCw size={14} /> تحديث</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b">
                  <tr>{['رقم الطلب', 'العميل', 'الجوال', 'الإجمالي', 'الحالة', 'التاريخ', 'إجراء'].map(h => <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-zinc-500">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-zinc-400">لا توجد طلبات بعد</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id} className="border-b hover:bg-zinc-50">
                      <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                      <td className="px-4 py-3 font-medium">{o.name}</td>
                      <td className="px-4 py-3 text-zinc-500" dir="ltr">{o.phone}</td>
                      <td className="px-4 py-3">ج.م {o.total.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{statusAr[o.status]}</span></td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(o.timestamp).toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={e => onUpdateStatus(o.id, e.target.value as Order['status'])} className="border border-zinc-200 text-xs px-2 py-1 rounded bg-white focus:outline-none focus:border-black">
                          {(['pending','confirmed','shipped','delivered'] as Order['status'][]).map(s => <option key={s} value={s}>{statusAr[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-semibold">المنتجات ({localProducts.length})</h3>
                <button onClick={() => onSaveProducts(localProducts)} className="bg-black text-white text-xs px-4 py-2 flex items-center gap-1 hover:bg-zinc-800"><Upload size={14} /> حفظ ورفع للسحابة</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b">
                    <tr>{['الصورة','الاسم','السعر','الفئة','إجراء'].map(h=><th key={h} className="px-4 py-3 text-right text-xs font-semibold text-zinc-500">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {localProducts.map(p => (
                      <tr key={p.id} className="border-b hover:bg-zinc-50">
                        <td className="px-4 py-3"><img src={p.image} alt="" className="w-12 h-14 object-cover bg-zinc-100" /></td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3">ج.م {p.price}</td>
                        <td className="px-4 py-3 capitalize text-zinc-500">{p.category}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-xs border px-3 py-1 hover:bg-black hover:text-white transition-colors">تعديل</button>
                          <button onClick={() => { if(confirm('حذف المنتج؟')) setLocalProducts(prev=>prev.filter(x=>x.id!==p.id)); }} className="text-xs border border-red-200 text-red-500 px-3 py-1 hover:bg-red-50"><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Edit Product Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md p-8 rounded-lg">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">تعديل المنتج</h3><button onClick={() => setEditingProduct(null)}><X size={20} /></button></div>
                  <div className="space-y-4">
                    <div><label className="text-xs text-zinc-500 mb-1 block">الاسم</label><input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="text-xs text-zinc-500 mb-1 block">السعر (ج.م)</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: +e.target.value})} className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="text-xs text-zinc-500 mb-1 block">الوصف</label><textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} rows={3} className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-black resize-none" /></div>
                    <div><label className="text-xs text-zinc-500 mb-1 block">الفئة</label>
                      <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="w-full border px-3 py-2 text-sm bg-white focus:outline-none focus:border-black">
                        <option value="women">Women</option><option value="men">Men</option><option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { setLocalProducts(prev=>prev.map(p=>p.id===editingProduct.id?editingProduct:p)); setEditingProduct(null); showToast('✓ تم التعديل'); }} className="flex-1 bg-black text-white py-3 text-sm hover:bg-zinc-800">حفظ</button>
                    <button onClick={() => setEditingProduct(null)} className="flex-1 border py-3 text-sm hover:bg-zinc-50">إلغاء</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}

function AdminSettings() {
  const [fbConfig, setFbConfig] = useState(() => JSON.parse(localStorage.getItem('bp_fb_config') || 'null') || DEFAULT_FB_CONFIG);
  const [newPass, setNewPass] = useState('');

  const save = () => {
    localStorage.setItem('bp_fb_config', JSON.stringify(fbConfig));
    if (newPass) localStorage.setItem('bp_admin_pass', newPass);
    showToast('✓ تم حفظ الإعدادات! أعد تحميل الصفحة.');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-semibold mb-5 flex items-center gap-2"><Database size={18} /> إعدادات Firebase</h3>
        <div className="space-y-4">
          {[{label:'API Key',key:'apiKey'},{label:'Database URL',key:'databaseURL'},{label:'Project ID',key:'projectId'},{label:'Storage Bucket',key:'storageBucket'}].map(f => (
            <div key={f.key}>
              <label className="text-xs text-zinc-500 mb-1 block">{f.label}</label>
              <input value={(fbConfig as any)[f.key] || ''} onChange={e => setFbConfig({...fbConfig,[f.key]:e.target.value})} className="w-full border px-3 py-2 text-sm font-mono focus:outline-none focus:border-black" dir="ltr" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="font-semibold mb-5 flex items-center gap-2"><Settings size={18} /> الأمان</h3>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">كلمة مرور جديدة للأدمن</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="اتركها فارغة للإبقاء على الحالية" className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-black mb-4" />
        </div>
        <button onClick={save} className="w-full bg-black text-white py-3 text-sm hover:bg-zinc-800 transition-colors">حفظ الإعدادات</button>
      </div>
    </div>
  );
}

// ─── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onUpdate, onCheckout }: {
  cart: CartItem[]; onClose: () => void; onRemove: (i: number) => void; onUpdate: (i: number, q: number) => void; onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-[120] flex" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div className="w-full max-w-md bg-white h-full overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-9">
          <div className="flex justify-between items-center mb-12">
            <div className="text-4xl font-light tracking-tight">السلة</div>
            <button onClick={onClose}><X /></button>
          </div>
          {cart.length > 0 ? (
            <>
              <div className="space-y-10">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-24 h-32 flex-shrink-0 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" alt="" /></div>
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">المقاس: {item.selectedSize}</div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex border items-center">
                          <button onClick={() => onUpdate(idx, Math.max(1, item.quantity - 1))} className="px-3 py-1">-</button>
                          <div className="px-4">{item.quantity}</div>
                          <button onClick={() => onUpdate(idx, item.quantity + 1)} className="px-3 py-1">+</button>
                        </div>
                        <div>ج.م {item.price * item.quantity}</div>
                      </div>
                      <button onClick={() => onRemove(idx)} className="text-xs text-red-500 mt-4">إزالة</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16">
                <div className="flex justify-between text-xl mb-8"><div>الإجمالي</div><div>ج.م {total}</div></div>
                <button onClick={onCheckout} className="w-full bg-black py-4 text-white text-sm tracking-widest">إتمام الطلب ←</button>
              </div>
            </>
          ) : <div className="py-20 text-center text-zinc-400">السلة فارغة</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Wishlist Modal ────────────────────────────────────────────────────────────
function WishlistModal({ items, onClose, onProductClick, onToggle }: {
  items: Product[]; onClose: () => void; onProductClick: (p: Product) => void; onToggle: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div><div className="tracking-[3px] text-xs">WISHLIST</div><div className="text-4xl font-light">المفضلة</div></div>
            <button onClick={onClose}><X size={26} /></button>
          </div>
          {items.length === 0 ? <div className="text-center py-12">المفضلة فارغة</div> : (
            <div className="space-y-8">
              {items.map((p, i) => (
                <div key={i} className="flex gap-5 border-b pb-8 last:border-none">
                  <div className="w-24 h-28 cursor-pointer flex-shrink-0 overflow-hidden" onClick={() => { onProductClick(p); onClose(); }}>
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-light text-lg">{p.name}</div>
                    <div className="text-sm text-zinc-500 mt-1">ج.م {p.price}</div>
                    <div className="flex gap-4 mt-6">
                      <button onClick={() => { onProductClick(p); onClose(); }} className="text-xs border px-7 py-3 hover:bg-black hover:text-white transition-colors">عرض</button>
                      <button onClick={() => onToggle(p.id)} className="text-xs text-red-500">إزالة</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App Content ───────────────────────────────────────────────────────────────
function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();
  const { db, connected, products, setProducts: saveProducts, orders, saveOrder, updateOrderStatus } = useFirebase();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistItems = products.filter(p => wishlist.includes(p.id));

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (i: number) => setCart(prev => prev.filter((_, idx) => idx !== i));
  const updateQuantity = (i: number, q: number) => setCart(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: q } : item));
  const toggleWishlist = (id: number) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleOrderSuccess = async (order: Order) => {
    await saveOrder(order);
    setCart([]);
    setShowCheckout(false);
    setOrderSuccess(true);
    showToast(`✅ تم تأكيد طلبك! رقم الطلب: ${order.id}`, 4000);
    setTimeout(() => { setOrderSuccess(false); navigate('/'); }, 3000);
  };

  return (
    <div className="min-h-screen font-sans bg-white text-black">
      <Navbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setIsWishlistOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage products={products} onProductClick={setSelectedProduct} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
        <Route path="/shop" element={<ShopPage products={products} onProductClick={setSelectedProduct} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
        <Route path="/admin" element={<AdminPage orders={orders} products={products} onUpdateStatus={updateOrderStatus} onSaveProducts={saveProducts} connected={connected} />} />
      </Routes>

      
        {selectedProduct && <ProductDetail product={selectedProduct} onAddToCart={addToCart} onClose={() => setSelectedProduct(null)} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.includes(selectedProduct.id)} />}
      
      
        {isCartOpen && <CartDrawer cart={cart} onClose={() => setIsCartOpen(false)} onRemove={removeFromCart} onUpdate={updateQuantity} onCheckout={() => { setIsCartOpen(false); setShowCheckout(true); }} />}
      
      
        {isWishlistOpen && <WishlistModal items={wishlistItems} onClose={() => setIsWishlistOpen(false)} onProductClick={setSelectedProduct} onToggle={toggleWishlist} />}
      
      
        {showCheckout && <CheckoutModal cart={cart} onClose={() => setShowCheckout(false)} onSuccess={handleOrderSuccess} />}
      
      
        {orderSuccess && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-16 py-6 z-[200] flex items-center gap-6 shadow-2xl">
            <div>✅</div>
            <div><div className="text-lg">تم استلام طلبك!</div><div className="text-sm opacity-60">سيتم التواصل معك قريباً</div></div>
          </div>
        )}
      
    </div>
  );
}

export default function App() {
  return <Router><AppContent /></Router>;
}
