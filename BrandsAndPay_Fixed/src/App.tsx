import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Plus, Minus, Settings, LogOut, RefreshCw, Upload, Trash2, Package, Tag, Bell, Database, Search, ChevronDown } from 'lucide-react';

// ─── Firebase Config ─────────────────────────────────────────────────────────
const DEFAULT_FB_CONFIG = {
  apiKey: "AIzaSyBKA4fcjjoltyeljlKb-pD3Ieumk7qiAxY",
  databaseURL: "https://barndsandpay-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "barndsandpay",
  storageBucket: "barndsandpay.firebasestorage.app"
};
const ADMIN_PASS = '1234';

// ─── Brands ──────────────────────────────────────────────────────────────────
const BRANDS = [
  'Calvin Klein', 'Bershka', 'Tommy Hilfiger', 'DeFacto', 'American Eagle',
  "Levi's", 'Koton', 'GUESS', 'Timberland', 'LACOSTE',
  'Polo Ralph Lauren', 'US Polo', 'Columbia', 'Ralph Lauren', 'GANT'
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  brand: string;
  category: 'tshirts' | 'shirts' | 'pants' | 'jackets' | 'shoes' | 'accessories';
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

// ─── Default Products ─────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "Classic Logo T-Shirt", nameAr: "تيشيرت كلاسيك", price: 450, brand: "Calvin Klein", category: "tshirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description: "تيشيرت قطن 100% بشعار كلاسيكي", sizes: ["S","M","L","XL","XXL"], colors: ["#FFFFFF","#000000","#1a1a2e"] },
  { id: 2, name: "Slim Fit Oxford Shirt", nameAr: "قميص أوكسفورد سليم", price: 680, brand: "Tommy Hilfiger", category: "shirts", image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80", description: "قميص أوكسفورد سليم فيت بياقة كلاسيكية", sizes: ["S","M","L","XL"], colors: ["#FFFFFF","#87CEEB","#003087"] },
  { id: 3, name: "501 Original Jeans", nameAr: "جينز 501 أوريجينال", price: 1200, brand: "Levi's", category: "pants", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", description: "الجينز الأصلي الكلاسيكي بقصة مستقيمة", sizes: ["28","30","32","34","36"], colors: ["#1a237e","#212121","#455a64"] },
  { id: 4, name: "Puffer Down Jacket", nameAr: "جاكيت بافر", price: 2200, brand: "Columbia", category: "jackets", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80", description: "جاكيت دافي مناسب للشتاء بتقنية عازلة للحرارة", sizes: ["S","M","L","XL","XXL"], colors: ["#000000","#1a237e","#4a4a4a"] },
  { id: 5, name: "Classic Polo Shirt", nameAr: "قميص بولو كلاسيك", price: 890, brand: "LACOSTE", category: "tshirts", image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80", description: "قميص بولو بالتمساح الشهير قطن بيكيه", sizes: ["S","M","L","XL","XXL"], colors: ["#FFFFFF","#1B4F72","#1E8449","#922B21"] },
  { id: 6, name: "Chino Slim Fit", nameAr: "بنطلون تشينو سليم", price: 750, brand: "American Eagle", category: "pants", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80", description: "بنطلون تشينو سليم فيت مريح وأنيق", sizes: ["28","30","32","34","36"], colors: ["#D2B48C","#2F4F4F","#000000"] },
  { id: 7, name: "6-Inch Premium Boots", nameAr: "بوت تيمبرلاند 6 إنش", price: 3200, brand: "Timberland", category: "shoes", image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80", description: "البوت الأشهر في العالم بجلد طبيعي مقاوم للماء", sizes: ["40","41","42","43","44","45"], colors: ["#D4A256","#8B4513","#000000"] },
  { id: 8, name: "Big Pony Polo", nameAr: "بولو بيج بوني", price: 1100, brand: "Polo Ralph Lauren", category: "tshirts", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80", description: "قميص بولو بشعار الفارس الكبير قطن ممتاز", sizes: ["S","M","L","XL","XXL"], colors: ["#FFFFFF","#003087","#B22222","#2E8B57"] },
  { id: 9, name: "Relaxed Fit Hoodie", nameAr: "هودي ريلاكسد", price: 950, brand: "Calvin Klein", category: "jackets", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80", description: "هودي قطن فليس مريح بشعار مطبوع", sizes: ["S","M","L","XL","XXL"], colors: ["#808080","#000000","#FFFFFF"] },
  { id: 10, name: "Denim Jacket", nameAr: "جاكيت جينز", price: 1400, brand: "Bershka", category: "jackets", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80", description: "جاكيت جينز كلاسيكي بقصة عصرية", sizes: ["S","M","L","XL"], colors: ["#1a237e","#455a64","#212121"] },
  { id: 11, name: "Graphic Print Tee", nameAr: "تيشيرت بريند", price: 380, brand: "GUESS", category: "tshirts", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80", description: "تيشيرت قطن بطباعة جيس المميزة", sizes: ["S","M","L","XL","XXL"], colors: ["#FFFFFF","#000000","#C0C0C0"] },
  { id: 12, name: "Sport Sneakers", nameAr: "سنيكرز رياضي", price: 1800, brand: "US Polo", category: "shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "حذاء رياضي مريح مناسب للاستخدام اليومي", sizes: ["40","41","42","43","44"], colors: ["#FFFFFF","#000000","#1a237e"] },
  { id: 13, name: "Linen Blend Shirt", nameAr: "قميص كتان", price: 560, brand: "DeFacto", category: "shirts", image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80", description: "قميص كتان خفيف مثالي للصيف", sizes: ["S","M","L","XL","XXL"], colors: ["#FFFFFF","#F5DEB3","#87CEEB","#98FB98"] },
  { id: 14, name: "Leather Belt", nameAr: "حزام جلد", price: 420, brand: "Tommy Hilfiger", category: "accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", description: "حزام جلد طبيعي بإبزيم معدني فاخر", sizes: ["85cm","90cm","95cm","100cm","105cm"], colors: ["#8B4513","#000000","#D4A256"] },
  { id: 15, name: "Classic Cap", nameAr: "كاب كلاسيك", price: 350, brand: "Ralph Lauren", category: "accessories", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80", description: "كاب بيسبول بشعار الفارس الكلاسيكي", sizes: ["Free Size"], colors: ["#000000","#FFFFFF","#1a237e","#8B0000"] },
  { id: 16, name: "Premium Chino Jogger", nameAr: "جوجر تشينو", price: 820, brand: "Koton", category: "pants", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80", description: "جوجر تشينو مريح بقصة عصرية", sizes: ["S","M","L","XL","XXL"], colors: ["#808080","#000000","#2F4F4F","#D2B48C"] },
  { id: 17, name: "Waterproof Jacket", nameAr: "جاكيت مقاوم للماء", price: 2800, brand: "GANT", category: "jackets", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", description: "جاكيت مقاوم للماء بتقنية WindShield", sizes: ["S","M","L","XL","XXL"], colors: ["#1B4F72","#2F4F4F","#000000","#8B0000"] },
  { id: 18, name: "Logo Waistbag", nameAr: "شنطة ويست", price: 650, brand: "GUESS", category: "accessories", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", description: "شنطة ويست عملية بشعار جيس البارز", sizes: ["Free Size"], colors: ["#000000","#8B4513","#C0C0C0"] },
];

const CATEGORIES = [
  { value: 'all', label: 'الكل', labelEn: 'All' },
  { value: 'tshirts', label: 'تيشيرتات', labelEn: 'T-Shirts' },
  { value: 'shirts', label: 'قمصان', labelEn: 'Shirts' },
  { value: 'pants', label: 'بناطيل', labelEn: 'Pants' },
  { value: 'jackets', label: 'جاكيتات', labelEn: 'Jackets' },
  { value: 'shoes', label: 'أحذية', labelEn: 'Shoes' },
  { value: 'accessories', label: 'إكسسوارات', labelEn: 'Accessories' },
];

// ─── Firebase Hook ────────────────────────────────────────────────────────────
function useFirebase() {
  const [db, setDb] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [products, setProductsState] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const fbConfig = JSON.parse(localStorage.getItem('bp_fb_config') || 'null') || DEFAULT_FB_CONFIG;
    loadFirebase(fbConfig);
  }, []);

  function loadFirebase(config: typeof DEFAULT_FB_CONFIG) {
    if (typeof window === 'undefined') return;
    // Fallback: إذا Firebase اتأخر أكتر من 5 ثواني، نفتح الموقع عادي
    const timeout = setTimeout(() => setFirebaseReady(true), 5000);
    const load = () => {
      clearTimeout(timeout);
      try {
        if ((window as any).firebase?.apps?.length) {
          (window as any).firebase.apps[0].delete().then(() => initDb(config));
        } else { initDb(config); }
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
      // نحط الصفحة تظهر فوراً بالـ default products
      setFirebaseReady(true);
      // نجيب البيانات في الخلفية من غير ما نأثر على الـ UI
      database.ref('.info/connected').on('value', (snap: any) => {
        setConnected(snap.val() === true);
        if (snap.val() === true) loadData(database);
      });
      setDb(database);
    } catch { setConnected(false); setFirebaseReady(true); }
  }

  async function loadData(database: any) {
    try {
      const prodSnap = await database.ref('data/products').once('value');
      if (prodSnap.exists()) {
        const prods = (Object.values(prodSnap.val()) as Product[]).map(p => ({
          ...p,
          colors: Array.isArray(p.colors) ? p.colors : ['#000000'],
          sizes: Array.isArray(p.sizes) ? p.sizes : ['M'],
          image: p.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
        }));
        setProductsState(prods);
      }
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
    setProductsState(prods);
    localStorage.setItem('bp_products', JSON.stringify(prods));
    if (db && connected) await db.ref('data/products').set(prods);
  }

  return { db, connected, products, setProducts: saveProducts, orders, saveOrder, updateOrderStatus, loadFirebase, firebaseReady };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg: string, duration = 2500) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:32px;right:32px;background:#111827;color:#fff;padding:14px 28px;z-index:9999;font-size:14px;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.3);font-family:system-ui;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ cartCount, wishlistCount, onCartClick, onWishlistClick }: {
  cartCount: number; wishlistCount: number; onCartClick: () => void; onWishlistClick: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-xl font-black tracking-tight text-gray-900">Brand's<span className="text-blue-600">&amp;pay</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">المتجر</Link>
            <div className="group relative">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                البراندات <ChevronDown size={14} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                {BRANDS.slice(0, 8).map(b => (
                  <Link key={b} to={`/shop?brand=${encodeURIComponent(b)}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">{b}</Link>
                ))}
                <Link to="/shop" className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg">كل البراندات →</Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <button onClick={onWishlistClick} className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
            </button>
            <button onClick={onCartClick} className="relative flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              <ShoppingBag size={16} />
              {cartCount > 0 && <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-3 border-t">
            <input
              autoFocus
              type="text"
              placeholder="ابحث عن منتج أو براند..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link to="/shop" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>المتجر</Link>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider pt-2">البراندات</div>
          {BRANDS.map(b => (
            <Link key={b} to={`/shop?brand=${encodeURIComponent(b)}`} className="block py-1.5 text-gray-600 text-sm" onClick={() => setMobileOpen(false)}>{b}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onQuickView, onToggleWishlist, isWishlisted }: {
  product: Product; onQuickView: (p: Product) => void; onToggleWishlist: (id: number) => void; isWishlisted: boolean;
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onQuickView(product)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
        </button>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800">
          {product.brand}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.stopPropagation(); onQuickView(product); }}
            className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700"
          >عرض سريع</button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.nameAr}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.name}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">ج.م {product.price.toLocaleString()}</span>
          <div className="flex gap-1">
            {(product.colors || []).slice(0, 3).map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
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
    showToast('✅ تمت الإضافة للسلة');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-50 rounded-t-2xl md:rounded-l-none md:rounded-r-2xl overflow-hidden">
            <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover min-h-[300px]" />
          </div>
          <div className="md:w-1/2 p-8 md:p-10" dir="rtl">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">{product.brand}</span>
                <h2 className="text-2xl font-bold text-gray-900">{product.nameAr}</h2>
                <p className="text-gray-500 text-sm mt-1">{product.name}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="text-3xl font-black text-gray-900 mt-4">ج.م {product.price.toLocaleString()}</div>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">{product.description}</p>

            <div className="mt-6">
              <div className="text-sm font-semibold text-gray-700 mb-3">اللون</div>
              <div className="flex gap-3">
                {(product.colors || []).map((color, idx) => (
                  <button key={idx} onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-gray-700 mb-3">المقاس</div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map((size, idx) => (
                  <button key={idx} onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all ${selectedSize === size ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="text-sm font-semibold text-gray-700">الكمية</div>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                <span className="px-4 py-2 font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={handleAdd} className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
                أضف للسلة
              </button>
              <button onClick={() => onToggleWishlist(product.id)}
                className={`border-2 px-5 rounded-xl transition-colors ${isWishlisted ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ cart, onClose, onSuccess }: { cart: CartItem[]; onClose: () => void; onSuccess: (o: Order) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const submit = () => {
    if (!name) { showToast('❌ اكتب اسمك أولاً'); return; }
    if (!phone) { showToast('❌ اكتب رقم جوالك'); return; }
    const orderId = 'BP' + Date.now().toString().slice(-8);
    onSuccess({ id: orderId, name, phone, address, notes, items: cart, total, status: 'pending', timestamp: Date.now() });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">إتمام الطلب</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
        </div>

        <div className="space-y-3 mb-6">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم *" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الجوال *" type="tel" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="العنوان" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات" rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none" />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.nameAr} × {item.quantity}</span>
              <span className="font-semibold">ج.م {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
            <span>الإجمالي</span>
            <span className="text-blue-600">ج.م {total.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={submit} className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
          تأكيد الطلب ←
        </button>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ products, onProductClick, onToggleWishlist, wishlist }: {
  products: Product[]; onProductClick: (p: Product) => void; onToggleWishlist: (id: number) => void; wishlist: number[];
}) {
  return (
    <div dir="rtl">
      {/* Hero */}
      <div className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              أكبر متجر أزياء رجالي في مصر
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              Brand's<span className="text-blue-400">&amp;</span><br />
              <span className="text-blue-400">pay</span>
            </h1>
            <p className="text-gray-300 text-lg mt-6 leading-relaxed">
              أفضل البراندات العالمية في مكان واحد<br />
              كالفن كلاين • تومي هيلفيجر • ليفايز • لاكوست والمزيد
            </p>
            <div className="flex gap-4 mt-10 flex-wrap">
              <Link to="/shop" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-blue-500/30">
                تسوق الآن
              </Link>
              <Link to="/shop" className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-base transition-colors">
                اكتشف البراندات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Strip */}
      <div className="bg-gray-900 py-6 overflow-hidden">
        <div className="flex gap-12 items-center animate-none px-6">
          <div className="flex gap-12 items-center min-w-max">
            {BRANDS.map(b => (
              <Link key={b} to={`/shop?brand=${encodeURIComponent(b)}`}
                className="text-gray-400 hover:text-white font-bold text-sm tracking-wider transition-colors whitespace-nowrap uppercase">
                {b}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">وصل حديثاً</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">أحدث المنتجات</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-gray-600 hover:text-gray-900 border-b-2 border-gray-900 pb-0.5">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} onQuickView={onProductClick} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.includes(p.id)} />
          ))}
        </div>
      </div>

      {/* Brands Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">شركاؤنا</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">البراندات المتاحة</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {BRANDS.map(brand => (
              <Link key={brand} to={`/shop?brand=${encodeURIComponent(brand)}`}
                className="bg-white rounded-xl p-4 text-center text-sm font-bold text-gray-700 hover:bg-gray-900 hover:text-white transition-all duration-200 border border-gray-200 hover:border-gray-900 hover:shadow-lg">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🚚', title: 'توصيل سريع', desc: 'توصيل لجميع محافظات مصر خلال 2-5 أيام' },
            { icon: '✅', title: 'منتجات أصلية 100%', desc: 'جميع منتجاتنا أصلية ومضمونة بضمان رسمي' },
            { icon: '🔄', title: 'إرجاع سهل', desc: 'سياسة إرجاع مرنة خلال 14 يوم من الاستلام' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────
function ShopPage({ products, onProductClick, onToggleWishlist, wishlist }: {
  products: Product[]; onProductClick: (p: Product) => void; onToggleWishlist: (id: number) => void; wishlist: number[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brand = params.get('brand');
    if (brand) setSelectedBrand(brand);
  }, []);

  const filtered = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => selectedBrand === 'all' || p.brand === selectedBrand)
    .filter(p => p.nameAr.includes(searchTerm) || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOption === 'price-low' ? a.price - b.price : sortOption === 'price-high' ? b.price - a.price : 0);

  const FilterPanel = () => (
    <div className="space-y-6" dir="rtl">
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">الفئة</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.value ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">البراند</h3>
        <div className="space-y-2">
          <button onClick={() => setSelectedBrand('all')}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedBrand === 'all' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            كل البراندات
          </button>
          {BRANDS.map(b => (
            <button key={b} onClick={() => setSelectedBrand(b)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedBrand === b ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-16 pb-20 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">المتجر</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} منتج</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="بحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={sortOption} onChange={e => setSortOption(e.target.value)}
              className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium">
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: الأقل أولاً</option>
              <option value="price-high">السعر: الأعلى أولاً</option>
            </select>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden bg-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium">
              فلتر
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden md:block w-56 flex-shrink-0 sticky top-24 h-fit bg-white rounded-2xl border border-gray-200 p-5">
            <FilterPanel />
          </div>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg">فلتر</h2>
                  <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold">لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={onProductClick} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.includes(p.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
function AdminPage({ orders, products, onUpdateStatus, onSaveProducts, connected }: {
  orders: Order[]; products: Product[]; onUpdateStatus: (id: string, s: Order['status']) => void; onSaveProducts: (p: Product[]) => void; connected: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', nameAr: '', price: 0, brand: BRANDS[0], category: 'tshirts',
    image: '', description: '', sizes: ['S', 'M', 'L', 'XL'], colors: ['#000000']
  });

  useEffect(() => { setLocalProducts(products); }, [products]);

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
    delivered: 'bg-green-100 text-green-800 border border-green-200',
  };
  const statusAr: Record<Order['status'], string> = {
    pending: '⏳ انتظار', confirmed: '✅ مؤكد', shipped: '🚚 شحن', delivered: '📦 تسليم'
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm" dir="rtl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-2xl font-black text-gray-900">لوحة التحكم</h2>
            <p className="text-gray-500 text-sm mt-1">Brand's&amp;pay Admin</p>
          </div>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (pass === ADMIN_PASS ? (setIsLoggedIn(true), showToast('✅ أهلاً!')) : showToast('❌ كلمة مرور خاطئة'))}
            placeholder="كلمة المرور" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-blue-500 mb-4" />
          <button onClick={() => pass === ADMIN_PASS ? (setIsLoggedIn(true), showToast('✅ أهلاً!')) : showToast('❌ كلمة مرور خاطئة')}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-700 transition-colors">
            دخول ←
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">الباسورد الافتراضي: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-gray-900">Brand's&amp;pay</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500 font-medium">لوحة التحكم</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            <Database size={12} /> {connected ? 'Firebase ✓' : 'غير متصل'}
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium">
            <LogOut size={16} /> خروج
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: orders.length, color: 'bg-blue-50 text-blue-600', icon: <Package size={22} /> },
          { label: 'قيد الانتظار', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 text-yellow-600', icon: <Bell size={22} /> },
          { label: 'المنتجات', value: products.length, color: 'bg-green-50 text-green-600', icon: <Tag size={22} /> },
          { label: 'إجمالي المبيعات', value: `${orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0).toLocaleString()} ج.م`, color: 'bg-purple-50 text-purple-600', icon: <ShoppingBag size={22} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${s.color}`}>{s.icon}</div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {[{ key: 'orders', label: '📦 الطلبات' }, { key: 'products', label: '🏷 المنتجات' }, { key: 'settings', label: '⚙ الإعدادات' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 text-sm rounded-lg font-semibold transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">الطلبات ({orders.length})</h3>
              <button onClick={() => showToast('🔄 جاري التحديث...')} className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                <RefreshCw size={14} /> تحديث
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['رقم الطلب', 'العميل', 'الجوال', 'الإجمالي', 'الحالة', 'التاريخ', 'تغيير الحالة'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-16 text-gray-400 font-medium">لا توجد طلبات بعد 📭</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{o.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{o.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs" dir="ltr">{o.phone}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">ج.م {o.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[o.status]}`}>{statusAr[o.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.timestamp).toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={e => onUpdateStatus(o.id, e.target.value as Order['status'])}
                          className="border-2 border-gray-200 text-xs px-3 py-1.5 rounded-lg bg-white focus:outline-none focus:border-blue-500 font-medium">
                          {(['pending', 'confirmed', 'shipped', 'delivered'] as Order['status'][]).map(s => (
                            <option key={s} value={s}>{statusAr[s]}</option>
                          ))}
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
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-900">المنتجات ({localProducts.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddProduct(true)} className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-400 font-semibold">
                    <Plus size={14} /> منتج جديد
                  </button>
                  <button onClick={() => onSaveProducts(localProducts)} className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-700 font-semibold">
                    <Upload size={14} /> حفظ للسحابة
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{['الصورة', 'الاسم', 'البراند', 'السعر', 'الفئة', 'إجراء'].map(h => (
                      <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-500">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {localProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img src={p.image} alt="" className="w-12 h-14 object-cover rounded-lg bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{p.nameAr}</div>
                          <div className="text-xs text-gray-500">{p.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">{p.brand}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">ج.م {p.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs capitalize">{p.category}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-xs border-2 border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all font-medium">
                            تعديل
                          </button>
                          <button onClick={() => { if (confirm('حذف المنتج؟')) setLocalProducts(prev => prev.filter(x => x.id !== p.id)); }}
                            className="text-xs border-2 border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-8 max-h-[90vh] overflow-auto" dir="rtl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">تعديل المنتج</h3>
                    <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'الاسم بالعربي', key: 'nameAr' },
                      { label: 'الاسم بالإنجليزي', key: 'name' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{f.label}</label>
                        <input value={(editingProduct as any)[f.key]} onChange={e => setEditingProduct({ ...editingProduct, [f.key]: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">السعر (ج.م)</label>
                      <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: +e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">البراند</label>
                      <select value={editingProduct.brand} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الفئة</label>
                      <select value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        {CATEGORIES.slice(1).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">رابط الصورة</label>
                      <input value={editingProduct.image} onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الوصف</label>
                      <textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p)); setEditingProduct(null); showToast('✅ تم التعديل'); }}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700">حفظ</button>
                    <button onClick={() => setEditingProduct(null)} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-8 max-h-[90vh] overflow-auto" dir="rtl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">إضافة منتج جديد</h3>
                    <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'الاسم بالعربي', key: 'nameAr' },
                      { label: 'الاسم بالإنجليزي', key: 'name' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{f.label}</label>
                        <input value={(newProduct as any)[f.key] || ''} onChange={e => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">السعر (ج.م)</label>
                      <input type="number" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: +e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">البراند</label>
                      <select value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الفئة</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value as any })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        {CATEGORIES.slice(1).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">رابط الصورة</label>
                      <input value={newProduct.image || ''} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" dir="ltr" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الوصف</label>
                      <textarea value={newProduct.description || ''} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!newProduct.nameAr || !newProduct.price) { showToast('❌ أكمل البيانات'); return; }
                    const prod: Product = {
                      id: Date.now(),
                      name: newProduct.name || newProduct.nameAr || '',
                      nameAr: newProduct.nameAr || '',
                      price: newProduct.price || 0,
                      brand: newProduct.brand || BRANDS[0],
                      category: newProduct.category || 'tshirts',
                      image: newProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
                      description: newProduct.description || '',
                      sizes: ['S', 'M', 'L', 'XL'],
                      colors: ['#000000', '#FFFFFF'],
                    };
                    setLocalProducts(prev => [prod, ...prev]);
                    setShowAddProduct(false);
                    showToast('✅ تم إضافة المنتج');
                  }} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-700 mt-6">
                    إضافة المنتج
                  </button>
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
    showToast('✅ تم حفظ الإعدادات!');
  };
  return (
    <div className="grid md:grid-cols-2 gap-6" dir="rtl">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Database size={18} /> إعدادات Firebase</h3>
        <div className="space-y-4">
          {[{ label: 'API Key', key: 'apiKey' }, { label: 'Database URL', key: 'databaseURL' }, { label: 'Project ID', key: 'projectId' }, { label: 'Storage Bucket', key: 'storageBucket' }].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{f.label}</label>
              <input value={(fbConfig as any)[f.key] || ''} onChange={e => setFbConfig({ ...fbConfig, [f.key]: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500" dir="ltr" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Settings size={18} /> الأمان</h3>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">كلمة مرور جديدة</label>
        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="اتركها فارغة للإبقاء على الحالية"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 mb-4" />
        <button onClick={save} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-700">حفظ الإعدادات</button>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onUpdate, onCheckout }: {
  cart: CartItem[]; onClose: () => void; onRemove: (i: number) => void; onUpdate: (i: number, q: number) => void; onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-[120] flex" onClick={onClose}>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />
      <div className="w-full max-w-md bg-white h-full overflow-auto shadow-2xl" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">السلة</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={22} /></button>
          </div>
        </div>
        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">السلة فارغة</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                    <img src={item.image} className="w-20 h-24 object-cover rounded-xl flex-shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.nameAr}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{item.brand}</p>
                      <p className="text-xs text-gray-500 mt-1">مقاس: {item.selectedSize}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                          <button onClick={() => onUpdate(idx, Math.max(1, item.quantity - 1))} className="px-2.5 py-1 hover:bg-gray-100 text-sm font-bold">-</button>
                          <span className="px-3 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => onUpdate(idx, item.quantity + 1)} className="px-2.5 py-1 hover:bg-gray-100 text-sm font-bold">+</button>
                        </div>
                        <span className="font-black text-gray-900">ج.م {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <button onClick={() => onRemove(idx)} className="text-xs text-red-500 mt-2 font-medium">إزالة</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-gray-50 rounded-2xl p-5">
                <div className="flex justify-between items-center text-xl font-black text-gray-900">
                  <span>الإجمالي</span>
                  <span className="text-blue-600">ج.م {total.toLocaleString()}</span>
                </div>
                <button onClick={onCheckout} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-base mt-4 hover:bg-gray-700 transition-colors">
                  إتمام الطلب ←
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Wishlist Modal ───────────────────────────────────────────────────────────
function WishlistModal({ items, onClose, onProductClick, onToggle }: {
  items: Product[]; onClose: () => void; onProductClick: (p: Product) => void; onToggle: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">المفضلة ❤️</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={22} /></button>
          </div>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Heart size={48} className="mx-auto mb-4" />
              <p className="font-medium">المفضلة فارغة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p, i) => (
                <div key={i} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                  <img src={p.image} alt="" className="w-20 h-24 object-cover rounded-xl cursor-pointer flex-shrink-0" onClick={() => { onProductClick(p); onClose(); }} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{p.nameAr}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{p.brand}</p>
                    <p className="font-black text-gray-900 mt-2">ج.م {p.price.toLocaleString()}</p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => { onProductClick(p); onClose(); }} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700">عرض</button>
                      <button onClick={() => onToggle(p.id)} className="text-xs text-red-500 font-semibold hover:text-red-700">إزالة</button>
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

// ─── App ──────────────────────────────────────────────────────────────────────
function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();
  const { connected, products, setProducts: saveProducts, orders, saveOrder, updateOrderStatus, firebaseReady } = useFirebase();

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
    showToast(`✅ تم تأكيد طلبك! رقم: ${order.id}`, 4000);
    setTimeout(() => { setOrderSuccess(false); navigate('/'); }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-5 z-[200] flex items-center gap-4 shadow-2xl rounded-2xl">
          <div className="text-2xl">✅</div>
          <div>
            <div className="font-bold">تم استلام طلبك!</div>
            <div className="text-sm text-gray-400">سيتم التواصل معك قريباً</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <Router><AppContent /></Router>;
}
