'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { 
  Lock, Shield, Eye, EyeOff, Save, MapPin, 
  Share2, ShoppingBag, Plus, Trash2, Edit2, LogOut, CheckSquare, Sparkles, Navigation
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { getUserLocation, reverseGeocode } from '@/lib/geo';
import './admin.css';

// Local Translations for the Admin Panel
const adminTranslations = {
  en: {
    loginTitle: 'Admin Access Gate',
    loginSubtitle: 'Please enter credentials to manage your restaurant page.',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Unlock Dashboard',
    loggingIn: 'Authenticating...',
    logout: 'Lock / Log Out',
    saveBtn: 'Save Changes',
    saving: 'Saving...',
    viewPublic: 'View Public Page ↗',
    backDiscover: 'Back',
    overviewTab: '📊 Overview',
    menuTab: '🍽️ Menu & Items',
    branchesTab: '📍 Branches',
    socialTab: '📱 Social Links',
    quickStats: 'Quick Stats',
    branches: 'Branches',
    menuItems: 'Menu Items',
    socialLinks: 'Social Links',
    cuisines: 'Cuisines',
    restInfo: 'Restaurant Information',
    restName: 'Restaurant Name',
    tagline: 'Tagline',
    desc: 'Description',
    priceRange: 'Price Range',
    adminCreds: 'Change Admin Credentials',
    adminUser: 'Admin Username',
    adminPass: 'Admin Password',
    editBranch: 'Edit Branch Details',
    acceptsDineIn: 'Accepts Dine-In',
    acceptsDelivery: 'Accepts Delivery',
    menuCat: 'Menu Categories',
    addCat: 'Add Category',
    newCatPl: 'New category name (e.g. Desserts)',
    addMenuItem: 'Add Menu Item',
    itemName: 'Item Name *',
    itemPrice: 'Price (AED) *',
    itemDesc: 'Description',
    itemTags: 'Tags (comma-separated)',
    selectPic: 'Dish Picture *',
    customPic: 'Or custom image URL',
    saveItem: 'Save Item',
    cancel: 'Cancel',
    noItems: 'No items in this category yet.',
    noBranches: 'No branches registered.',
    emptySocial: 'No social links. Enter URLs below to add them.',
    socialHeader: 'Social Media Profiles',
    deliveryHeader: 'Delivery App Partner Links',
    detectLoc: '📍 Auto-detect'
  },
  am: {
    loginTitle: 'የአስተዳዳሪ መግቢያ',
    loginSubtitle: 'እባክዎ ሬስቶራንትዎን ለማስተዳደር መለያዎን ያስገቡ።',
    username: 'የመለያ ስም',
    password: 'የይለፍ ቃል',
    loginBtn: 'ዳሽቦርድ ክፈት',
    loggingIn: 'በማረጋገጥ ላይ...',
    logout: 'ውጣ / ቆልፍ',
    saveBtn: 'ለውጦችን አስቀምጥ',
    saving: 'በማስቀመጥ ላይ...',
    viewPublic: 'ገጹን ጎብኝ ↗',
    backDiscover: 'ተመለስ',
    overviewTab: '📊 አጠቃላይ መግለጫ',
    menuTab: '🍽️ የምግብ ዝርዝር',
    branchesTab: '📍 ቅርንጫፎች',
    socialTab: '📱 ማህበራዊ ሊንኮች',
    quickStats: 'ፈጣን መረጃዎች',
    branches: 'ቅርንጫፎች',
    menuItems: 'ምግቦች',
    socialLinks: 'ማህበራዊ ሊንኮች',
    cuisines: 'ምግብ አይነቶች',
    restInfo: 'የሬስቶራንት መረጃ',
    restName: 'የሬስቶራንቱ ስም',
    tagline: 'መፈክር (Tagline)',
    desc: 'መግለጫ',
    priceRange: 'የዋጋ ደረጃ',
    adminCreds: 'የአስተዳዳሪ የይለፍ ቃል ቀይር',
    adminUser: 'የአስተዳዳሪ ስም',
    adminPass: 'የአስተዳዳሪ የይለፍ ቃል',
    editBranch: 'ቅርንጫፉን አሻሽል',
    acceptsDineIn: 'እዚሁ መመገብ ይቻላል',
    acceptsDelivery: 'ማድረስ ይቻላል',
    menuCat: 'የሜኑ ምድቦች',
    addCat: 'ምድብ ጨምር',
    newCatPl: 'አዲስ ምድብ ስም (ለምሳሌ፡ ጣፋጭ ምግቦች)',
    addMenuItem: 'አዲስ ምግብ ጨምር',
    itemName: 'የምግቡ ስም *',
    itemPrice: 'ዋጋ (AED) *',
    itemDesc: 'መግለጫ',
    itemTags: 'መለያዎች (በነጠላ ሰረዝ የተለዩ)',
    selectPic: 'የምግቡ ፎቶ *',
    customPic: 'ወይም የፎቶ ሊንክ ያስገቡ',
    saveItem: 'ምግቡን አስቀምጥ',
    cancel: 'ሰርዝ',
    noItems: 'በዚህ ምድብ ውስጥ እስካሁን ምንም ምግብ የለም።',
    noBranches: 'ምንም ቅርንጫፎች አልተመዘገቡም።',
    emptySocial: 'ምንም ማህበራዊ ሊንክ የለም። ለመጨመር ከታች ያስገቡ።',
    socialHeader: 'የማህበራዊ ሚዲያ ገጾች',
    deliveryHeader: 'የማድረሻ መተግበሪያዎች ሊንክ',
    detectLoc: '📍 ፈልግ'
  },
  ti: {
    loginTitle: 'ናይ ኣመሓዳሪ መእተዊ',
    loginSubtitle: 'ቤት-መግቢኹም ንምሕደራ እባክኩም መለያኹም የእትዉ።',
    username: 'ስም መለያ',
    password: 'ምስጢር ቃል',
    loginBtn: 'ዳሽቦርድ ክፈት',
    loggingIn: 'አብ ምርግጋጽ...',
    logout: 'ውጻእ / ቆልፍ',
    saveBtn: 'ለውጥታት ዓቅብ',
    saving: 'አብ ምዕቃብ...',
    viewPublic: 'ገጽ ርአ ↗',
    backDiscover: 'ተመለስ',
    overviewTab: '📊 ሓፈሻዊ መግለጺ',
    menuTab: '🍽️ ዝርዝር መግብታት',
    branchesTab: '📍 ጨናፍር',
    socialTab: '📱 ማሕበራዊ ሊንክታት',
    quickStats: 'ቅልጡፍ መረዳእታታት',
    branches: 'ጨናፍር',
    menuItems: 'መግብታት',
    socialLinks: 'ማሕበራዊ ሊንክታት',
    cuisines: 'ዓይነት መግብታት',
    restInfo: 'ናይ ቤት-መግቢ ሓበሬታ',
    restName: 'ስም ቤት-መግቢ',
    tagline: 'ሓጺር መግለጺ (Tagline)',
    desc: 'መግለጺ',
    priceRange: 'ደረጃ ዋጋ',
    adminCreds: 'ናይ ኣመሓዳሪ ምስጢር ቃል ቀይር',
    adminUser: 'ስም ኣመሓዳሪ',
    adminPass: 'ምስጢር ቃል ኣመሓሪ',
    editBranch: 'ጨንፈር ኣመሓይሽ',
    acceptsDineIn: 'ኣብዚ ምምጋብ ይከኣል',
    acceptsDelivery: 'ምብጻሕ ይከኣል',
    menuCat: 'ምድብ መግብታት',
    addCat: 'ምድብ ወስኽ',
    newCatPl: 'ሓድሽ ምድብ ስም (ንኣብነት፡ ጥዑም መግቢ)',
    addMenuItem: 'ሓድሽ መግቢ ወስኽ',
    itemName: 'ስም መግቢ *',
    itemPrice: 'ዋጋ (AED) *',
    itemDesc: 'መግለጺ',
    itemTags: 'መለያታት (ብነጠላ ሰረዝ ዝተፈለዩ)',
    selectPic: 'ፎቶ መግቢ *',
    customPic: 'ወይ ናይ ፎቶ ሊንክ የእትዉ',
    saveItem: 'መግቢ ዓቅብ',
    cancel: 'ሰርዝ',
    noItems: 'ኣብዚ ምድብ ክሳብ ሕጂ ምንም መግቢ የለን።',
    noBranches: 'ምንም ጨናፍር ኣይተመዝገቡን።',
    emptySocial: 'ምንም ማሕበራዊ ሊንክ የለን። ንምውሳኽ ኣብ ታሕቲ የእትዉ።',
    socialHeader: 'ናይ ማሕበራዊ ገጻት',
    deliveryHeader: 'ናይ ምብጻሕ መተግበሪታት ሊንክ',
    detectLoc: '📍 ፈልግ'
  },
  om: {
    loginTitle: 'Seensa Bulchaa',
    loginSubtitle: 'Dafqaan nyaata keessan bulchuuf odeeffannoo seensaa galchaa.',
    username: 'Maqaa Seensaa',
    password: 'Jecha Darbi',
    loginBtn: 'Dashboard Bani',
    loggingIn: 'Mirkaneessaa jira...',
    logout: 'Bahi / Cufi',
    saveBtn: 'Odeeffannoo Save Godhi',
    saving: 'Save gochaa jira...',
    viewPublic: 'Page Daawwadhu ↗',
    backDiscover: 'Boodatti',
    overviewTab: '📊 Walii-gala',
    menuTab: '🍽️ Menii Nyaataa',
    branchesTab: '📍 Dameewwan',
    socialTab: '📱 Hawaasummaa',
    quickStats: 'Stats Saffisaa',
    branches: 'Dameewwan',
    menuItems: 'Nyaatawwan',
    socialLinks: 'Social Links',
    cuisines: 'Cuisines',
    restInfo: 'Odeeffannoo Nyaataa',
    restName: 'Maqaa Nyaataa',
    tagline: 'Tagline',
    desc: 'Ibsa Nyaataa',
    priceRange: 'Gatii',
    adminCreds: 'Jecha Darbi Bulchaa Jijjiiri',
    adminUser: 'Maqaa Bulchaa',
    adminPass: 'Jecha Darbi Bulchaa',
    editBranch: 'Damee Sirreessi',
    acceptsDineIn: 'Dine-In Ni Danda\'ama',
    acceptsDelivery: 'Dhiheessi Ni Danda\'ama',
    menuCat: 'Gosa Menii',
    addCat: 'Gosa Dabali',
    newCatPl: 'Maqaa gosa haaraa',
    addMenuItem: 'Nyaata Dabali',
    itemName: 'Maqaa Nyaataa *',
    itemPrice: 'Gatii (AED) *',
    itemDesc: 'Ibsa',
    itemTags: 'Tags (fkn. spicy)',
    selectPic: 'Suuraa Nyaataa *',
    customPic: 'Liinkii Suuraa Aadaa',
    saveItem: 'Nyaata Save Godhi',
    cancel: 'Dhiisi',
    noItems: 'Gosni kun nyaata hin qabu.',
    noBranches: 'Dameen galmeeffame hin jiru.',
    emptySocial: 'Liinkiin hawaasummaa hin jiru. Galchi.',
    socialHeader: 'Hawaasummaa',
    deliveryHeader: 'Liinkii Dhiheessii',
    detectLoc: '📍 Barbaadi'
  }
};

// Gallery of default premium dish pictures
const DEFAULT_DISH_GALLERY = [
  { id: 'doro', name: 'Doro Wot', path: '/images/dish_doro_wot.webp' },
  { id: 'kitfo', name: 'Kitfo', path: '/images/dish_kitfo.webp' },
  { id: 'injera', name: 'Veg Platter / Injera', path: '/images/dish_injera.webp' },
  { id: 'tibs', name: 'Sizzling Tibs', path: '/images/dish_tibs.webp' },
  { id: 'shiro', name: 'Shiro Stew', path: '/images/dish_shiro.webp' },
  { id: 'coffee', name: 'Traditional Coffee', path: '/images/dish_coffee.webp' }
];

const ImageUploadZone = ({ currentUrl, onUploadComplete, labelText }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onUploadComplete(data.url);
      } else {
        const base64 = await convertToBase64(file);
        onUploadComplete(base64);
      }
    } catch {
      const base64 = await convertToBase64(file);
      onUploadComplete(base64);
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <label className="text-xs font-semibold text-gray-400 uppercase">{labelText || 'Upload Image'}</label>
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
          dragActive ? 'border-gold bg-gold-05' : 'border-white-10 hover:border-white-20 bg-white-02'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); const file = e.dataTransfer.files?.[0]; if (file) uploadFile(file); }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="admin-spinner w-6 h-6" />
            <span className="text-xs text-gray-400">Uploading to free local CDN...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 w-full">
            {currentUrl && (
              <img src={currentUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white-10" />
            )}
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-white">Drag & drop image or browse your device</p>
              <p className="text-[10px] text-gray-500">PNG, JPG, WEBP up to 5MB</p>
            </div>
            <label className="admin-btn-outline text-xs px-3 py-1.5 cursor-pointer select-none">
              Browse
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};


const CustomCategorySelector = ({ value, onChange, menuData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = menuData.find(c => c.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="custom-category-select-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCategory ? selectedCategory.name : 'Select category...'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="custom-category-select-dropdown">
          <div className="flex flex-col gap-0.5">
            {menuData.map(c => (
              <button
                key={c.id}
                type="button"
                className={`custom-category-select-item ${c.id === value ? 'active' : ''}`}
                onClick={() => {
                  onChange(c.id);
                  setIsOpen(false);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const COMMON_DISHES = [
  'Doro Wot',
  'Kitfo',
  'Beef Tibs',
  'Shiro Wot',
  'Veggie Combo (Beyaynetu)',
  'Gomen Besiga',
  'Key Wot',
  'Injera Fitfit',
  'Kinche',
  'Sambusa',
  'Burger',
  'Pizza',
  'Pasta',
  'French Fries',
  'Traditional Coffee (Buna)',
  'Avocado Juice',
  'Mango Juice',
  'Soft Drink',
  'Water'
];

const AutocompleteInput = ({ value, onChange, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (val) => {
    onChange(val);
    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const filtered = COMMON_DISHES.filter(dish =>
      dish.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  };

  const handleSelectSuggestion = (dish) => {
    onChange(dish);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => {
          if (value.trim()) {
            const filtered = COMMON_DISHES.filter(dish =>
              dish.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setIsOpen(filtered.length > 0);
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && (
        <div className="autocomplete-dropdown">
          <div className="flex flex-col gap-0.5">
            {suggestions.map((dish, i) => (
              <button
                key={i}
                type="button"
                className="autocomplete-item"
                onClick={() => handleSelectSuggestion(dish)}
              >
                ✨ {dish}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { language } = useLanguage();

  // Auth gate states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App data states
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit states for basic info & credentials
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('$$');
  const [editAdminUser, setEditAdminUser] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');

  // Cuisine edit states
  const [selectedCuisines, setSelectedCuisines] = useState([]);

  // Menu states
  const [menuData, setMenuData] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newItemData, setNewItemData] = useState({ 
    categoryId: '', name: '', description: '', price: '', tags: '', imageUrl: '/images/dish_doro_wot.webp' 
  });
  const [editingItem, setEditingItem] = useState(null);

  // Branches states (for inline editing)
  const [editingBranches, setEditingBranches] = useState([]);
  const [detectingBranchId, setDetectingBranchId] = useState(null);

  // Social edit states
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Delivery partner states
  const [talabatUrl, setTalabatUrl] = useState('');
  const [deliverooUrl, setDeliverooUrl] = useState('');
  const [noonUrl, setNoonUrl] = useState('');
  const [careemUrl, setCareemUrl] = useState('');
  const [ketaUrl, setKetaUrl] = useState('');
  const [smilesUrl, setSmilesUrl] = useState('');

  const t = (key) => {
    return adminTranslations[language]?.[key] || adminTranslations['en']?.[key] || key;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check auth session on mount
  useEffect(() => {
    const isSuperAuthed = localStorage.getItem('session_super_admin') === 'true';
    const isAuthed = localStorage.getItem(`session_auth_${slug}`);
    if (isSuperAuthed || isAuthed === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, [slug]);

  // Fetch restaurant data
  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        const res = await fetch(`/api/restaurants/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
          setEditName(data.name);
          setEditTagline(data.tagline || '');
          setEditDescription(data.description || '');
          setEditPriceRange(data.priceRange || '$$');
          setEditAdminUser(data.adminUsername || '');
          setEditAdminPass(data.adminPassword || '');
          let fetchedMenu = data.menu || [];
          const standardNames = ['Mains', 'Starters', 'Drinks', 'Coffee'];
          const finalMenu = [];
          
          for (const name of standardNames) {
            let cat = fetchedMenu.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (!cat) {
              try {
                const catRes = await fetch(`/api/restaurants/${slug}/menu`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'category', name, displayOrder: standardNames.indexOf(name) }),
                });
                if (catRes.ok) {
                  const catData = await catRes.json();
                  cat = { id: catData.category.id, name: catData.category.name, displayOrder: catData.category.display_order, items: [] };
                }
              } catch (e) {
                console.error(`Failed to auto-create category ${name}:`, e);
              }
            }
            if (cat) {
              finalMenu.push(cat);
            }
          }
          setMenuData(finalMenu);
          if (finalMenu.length > 0) {
            setNewItemData(p => ({ ...p, categoryId: finalMenu[0].id }));
          }
          setSelectedCuisines(data.cuisines || []);

          // Set socials
          const insta = data.socialLinks?.find(s => s.code === 'INSTAGRAM')?.url || '';
          const fb = data.socialLinks?.find(s => s.code === 'FACEBOOK')?.url || '';
          const tt = data.socialLinks?.find(s => s.code === 'TIKTOK')?.url || '';
          setInstagramUrl(insta);
          setFacebookUrl(fb);
          setTiktokUrl(tt);

          // Map branches
          if (data.branches) {
            const mappedBranches = data.branches.map(b => ({
              ...b,
              talabatUrl: b.deliveryPartners?.find(dp => dp.code === 'TALABAT')?.partnerUrl || '',
              deliverooUrl: b.deliveryPartners?.find(dp => dp.code === 'DELIVEROO')?.partnerUrl || '',
              noonUrl: b.deliveryPartners?.find(dp => dp.code === 'NOON')?.partnerUrl || '',
              careemUrl: b.deliveryPartners?.find(dp => dp.code === 'CAREEM')?.partnerUrl || '',
              ketaUrl: b.deliveryPartners?.find(dp => dp.code === 'KEETA')?.partnerUrl || '',
              smilesUrl: b.deliveryPartners?.find(dp => dp.code === 'SMILES')?.partnerUrl || '',
            }));
            setEditingBranches(mappedBranches);

            const primary = mappedBranches.find(b => b.isFeatured) || mappedBranches[0];
            if (primary) {
              setTalabatUrl(primary.talabatUrl || '');
              setDeliverooUrl(primary.deliverooUrl || '');
              setNoonUrl(primary.noonUrl || '');
              setCareemUrl(primary.careemUrl || '');
              setKetaUrl(primary.ketaUrl || '');
              setSmilesUrl(primary.smilesUrl || '');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, isAuthenticated]);

  // Tab entry animation
  useEffect(() => {
    if (!restaurant) return;
    gsap.fromTo('.admin-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' });
  }, [activeTab, restaurant]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch(`/api/restaurants/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`session_auth_${slug}`, 'true');
        setIsAuthenticated(true);
        showToast('Unlocked Dashboard!');
      } else {
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`session_auth_${slug}`);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Save restaurant info, cuisines, and credentials
  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      const primary = editingBranches.find(b => b.isFeatured) || editingBranches[0];
      const branchesPayload = primary ? [{
        id: primary.id,
        deliveryPartners: [
          { code: 'TALABAT', partnerUrl: talabatUrl },
          { code: 'DELIVEROO', partnerUrl: deliverooUrl },
          { code: 'NOON', partnerUrl: noonUrl },
          { code: 'CAREEM', partnerUrl: careemUrl },
          { code: 'KEETA', partnerUrl: ketaUrl },
          { code: 'SMILES', partnerUrl: smilesUrl }
        ]
      }] : undefined;

      const res = await fetch(`/api/restaurants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          tagline: editTagline,
          description: editDescription,
          priceRange: editPriceRange,
          adminUsername: editAdminUser,
          adminPassword: editAdminPass,
          cuisines: selectedCuisines,
          branches: branchesPayload
        }),
      });
      if (res.ok) {
        showToast('Restaurant information updated!');
        if (primary) {
          setEditingBranches(prev => prev.map(b => b.id === primary.id ? {
            ...b,
            talabatUrl,
            deliverooUrl,
            noonUrl,
            careemUrl,
            ketaUrl,
            smilesUrl,
            deliveryPartners: [
              { name: 'Talabat', code: 'TALABAT', partnerUrl: talabatUrl },
              { name: 'Deliveroo', code: 'DELIVEROO', partnerUrl: deliverooUrl },
              { name: 'Noon Food', code: 'NOON', partnerUrl: noonUrl },
              { name: 'Careem Food', code: 'CAREEM', partnerUrl: careemUrl },
              { name: 'Keeta', code: 'KEETA', partnerUrl: ketaUrl },
              { name: 'Smiles', code: 'SMILES', partnerUrl: smilesUrl }
            ].filter(dp => dp.partnerUrl.trim())
          } : b));
        }
        setRestaurant(prev => ({
          ...prev,
          name: editName,
          tagline: editTagline,
          description: editDescription,
          priceRange: editPriceRange,
          adminUsername: editAdminUser,
          adminPassword: editAdminPass,
          cuisines: selectedCuisines
        }));
      } else {
        showToast('Failed to save changes', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Social Links
  const handleSaveSocials = async () => {
    setSaving(true);
    try {
      const links = [
        { code: 'INSTAGRAM', url: instagramUrl },
        { code: 'FACEBOOK', url: facebookUrl },
        { code: 'TIKTOK', url: tiktokUrl }
      ].filter(l => l.url.trim());

      const res = await fetch(`/api/restaurants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: links }),
      });
      if (res.ok) {
        showToast('Social media links updated!');
      } else {
        showToast('Failed to save social links', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Branch Editing Helpers
  const handleUpdateBranchField = (branchId, field, value) => {
    setEditingBranches(prev => prev.map(b => b.id === branchId ? { ...b, [field]: value } : b));
  };

  const handleBranchLocationDetect = async (branchId) => {
    setDetectingBranchId(branchId);
    try {
      const coords = await getUserLocation();
      handleUpdateBranchField(branchId, 'latitude', coords.lat);
      handleUpdateBranchField(branchId, 'longitude', coords.lng);
      
      const areaName = await reverseGeocode(coords.lat, coords.lng);
      if (areaName) {
        handleUpdateBranchField(branchId, 'area', areaName);
        handleUpdateBranchField(branchId, 'address', `${areaName}, United Arab Emirates`);
      }
      showToast('Location updated!');
    } catch {
      showToast('Could not fetch GPS coords', 'error');
    } finally {
      setDetectingBranchId(null);
    }
  };

  const handleSaveBranch = async (branchId) => {
    setSaving(true);
    const branch = editingBranches.find(b => b.id === branchId);
    if (!branch) return;

    try {
      // Assemble delivery partners
      const dps = [
        { code: 'TALABAT', partnerUrl: branch.talabatUrl },
        { code: 'DELIVEROO', partnerUrl: branch.deliverooUrl },
        { code: 'NOON', partnerUrl: branch.noonUrl },
        { code: 'CAREEM', partnerUrl: branch.careemUrl },
        { code: 'KEETA', partnerUrl: branch.ketaUrl },
        { code: 'SMILES', partnerUrl: branch.smilesUrl }
      ];

      const res = await fetch(`/api/restaurants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branches: [{
            id: branch.id,
            area: branch.area,
            address: branch.address,
            phone: branch.phone,
            whatsapp: branch.whatsapp,
            googleMapsUrl: branch.googleMapsUrl,
            latitude: branch.latitude ? parseFloat(branch.latitude) : null,
            longitude: branch.longitude ? parseFloat(branch.longitude) : null,
            acceptsDineIn: branch.acceptsDineIn,
            acceptsDelivery: branch.acceptsDelivery,
            deliveryPartners: dps
          }]
        }),
      });

      if (res.ok) {
        showToast('Branch details saved!');
      } else {
        showToast('Failed to save branch details', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add menu category
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`/api/restaurants/${slug}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name: newCatName, displayOrder: menuData.length }),
      });
      if (res.ok) {
        const data = await res.json();
        setMenuData(prev => [...prev, { id: data.category.id, name: data.category.name, displayOrder: data.category.display_order, items: [] }]);
        setNewCatName('');
        showToast('Category added!');
      }
    } catch {
      showToast('Failed to add category', 'error');
    }
  };

  // Add menu item
  const handleAddItem = async () => {
    const targetCategoryId = newItemData.categoryId || menuData[0]?.id;
    if (!targetCategoryId) {
      showToast('Please wait for categories to load', 'error');
      return;
    }

    if (!newItemData.name) return;
    try {
      const tags = newItemData.tags ? newItemData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const res = await fetch(`/api/restaurants/${slug}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          categoryId: targetCategoryId,
          name: newItemData.name,
          description: newItemData.description,
          price: parseFloat(newItemData.price) || 0,
          imageUrl: newItemData.imageUrl,
          tags,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMenuData(prev => prev.map(cat =>
          cat.id === targetCategoryId
            ? { ...cat, items: [...cat.items, { id: data.item.id, categoryId: targetCategoryId, name: data.item.name, description: data.item.description, price: parseFloat(data.item.price), imageUrl: data.item.image_url, tags: data.item.tags || [], isAvailable: true }] }
            : cat
        ));
        setNewItemData({ categoryId: targetCategoryId, name: '', description: '', price: '', tags: '', imageUrl: '/images/dish_doro_wot.webp' });
        showToast('Menu item added!');
      }
    } catch {
      showToast('Failed to add item', 'error');
    }
  };

  // Update menu item
  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const tags = typeof editingItem.tags === 'string'
        ? editingItem.tags.split(',').map(t => t.trim()).filter(Boolean)
        : editingItem.tags || [];
      const res = await fetch(`/api/restaurants/${slug}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          id: editingItem.id,
          categoryId: editingItem.categoryId,
          name: editingItem.name,
          description: editingItem.description,
          price: parseFloat(editingItem.price) || 0,
          imageUrl: editingItem.imageUrl,
          tags,
          isAvailable: editingItem.isAvailable,
        }),
      });
      if (res.ok) {
        setMenuData(prev => prev.map(cat => {
          // If this is the category the item is now assigned to
          if (cat.id === editingItem.categoryId) {
            const exists = cat.items.some(i => i.id === editingItem.id);
            if (exists) {
              return {
                ...cat,
                items: cat.items.map(i => i.id === editingItem.id ? {
                  id: editingItem.id,
                  categoryId: editingItem.categoryId,
                  name: editingItem.name,
                  description: editingItem.description,
                  price: parseFloat(editingItem.price),
                  imageUrl: editingItem.imageUrl,
                  tags,
                  isAvailable: editingItem.isAvailable
                } : i)
              };
            } else {
              return {
                ...cat,
                items: [...cat.items, {
                  id: editingItem.id,
                  categoryId: editingItem.categoryId,
                  name: editingItem.name,
                  description: editingItem.description,
                  price: parseFloat(editingItem.price),
                  imageUrl: editingItem.imageUrl,
                  tags,
                  isAvailable: editingItem.isAvailable
                }]
              };
            }
          }
          
          // If this is the old category that the item was moved out of
          if (cat.id !== editingItem.categoryId && cat.items.some(i => i.id === editingItem.id)) {
            return {
              ...cat,
              items: cat.items.filter(i => i.id !== editingItem.id)
            };
          }

          return cat;
        }));
        setEditingItem(null);
        showToast('Item updated!');
      }
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const handleDeleteItem = async (itemId, categoryId) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      const res = await fetch(`/api/restaurants/${slug}/menu?type=item&id=${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuData(prev => prev.map(cat =>
          cat.id === categoryId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
        ));
        showToast('Item deleted');
      }
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      const res = await fetch(`/api/restaurants/${slug}/menu?type=category&id=${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuData(prev => prev.filter(c => c.id !== catId));
        showToast('Category deleted');
      }
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const toggleCuisine = (code) => {
    setSelectedCuisines(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  // 1. LOGIN GATE INTERFACE
  if (!isAuthenticated) {
    return (
      <div className="high-end-login-container">
        <div className="admin-bg-orb partner-bg-orb-1" />
        <div className="admin-bg-orb partner-bg-orb-2" />
        
        <div className="high-end-login-card text-center">
          <div className="login-lock-circle">
            <Lock size={32} className="text-gold" />
          </div>
          <h1 className="high-end-login-title mt-4">{t('loginTitle')}</h1>
          <p className="high-end-login-subtitle">{t('loginSubtitle')}</p>

          {authError && (
            <div className="partner-error alert-error mb-4">❌ {authError}</div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="high-end-field text-left">
              <label>{t('username')}</label>
              <div className="high-end-input-wrapper">
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  placeholder="e.g. Habesha"
                  className="high-end-input"
                />
              </div>
            </div>
            
            <div className="high-end-field text-left">
              <label>{t('password')}</label>
              <div className="high-end-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="••••"
                  className="high-end-input"
                />
                <button
                  type="button"
                  className="high-end-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="high-end-btn-submit mt-6" disabled={authLoading}>
              {authLoading ? t('loggingIn') : t('loginBtn')}
            </button>
          </form>
          
          <div className="mt-6">
            <Link href="/discover" className="partner-btn-outline partner-btn-full text-xs">
              {t('backDiscover')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="admin-page">
        <div className="admin-loading text-center">
          <h2 className="text-white text-xl font-bold">Restaurant Not Found</h2>
          <p className="text-gray-400 mt-2">No restaurant matches the slug &quot;{slug}&quot;</p>
          <Link href="/discover" className="partner-btn-primary mt-4">Back to Discover</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('overviewTab') },
    { id: 'menu', label: t('menuTab') },
    { id: 'branches', label: t('branchesTab') },
    { id: 'social', label: t('socialTab') },
  ];

  const cuisineOptions = [
    { code: 'ETHIOPIAN', label: '🇪🇹 Ethiopian' },
    { code: 'ERITREAN', label: '🇪🇷 Eritrean' },
    { code: 'ETHIOPIAN_ERITREAN', label: '🇪🇹🇪🇷 Ethiopian & Eritrean' },
    { code: 'FUSION', label: '🍴 Fusion' },
  ];

  const isEthiopic = ['am', 'ti'].includes(language);

  return (
    <div className={`admin-page ${isEthiopic ? 'font-ethiopic' : ''}`}>
      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : 'admin-toast-success'}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="admin-header glass-panel">
        <div className="admin-header-left">
          <Link href="/discover" className="admin-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="admin-title">{restaurant.name}</h1>
            <div className="admin-subtitle">
              <span className={`admin-status-badge ${restaurant.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>
                {restaurant.status}
              </span>
              <span className="admin-meta-sep">·</span>
              <span>{restaurant.type?.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/restaurant/${slug}`} className="admin-btn-outline" target="_blank">
            {t('viewPublic')}
          </Link>
          <button onClick={handleLogout} className="btn-logout flex items-center gap-1" title={t('logout')}>
            <LogOut size={16} /> <span className="hide-mobile">{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-content">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="admin-grid">
            {/* Restaurant Info Card */}
            <div className="admin-card glass-panel admin-card-wide">
              <h2 className="admin-card-title flex items-center gap-2">
                <Sparkles size={18} className="text-gold" /> {t('restInfo')}
              </h2>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>{t('restName')}</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>{t('tagline')}</label>
                  <input type="text" value={editTagline} onChange={e => setEditTagline(e.target.value)} />
                </div>
                <div className="admin-field admin-field-full">
                  <label>{t('desc')}</label>
                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
                </div>
                <div className="admin-field">
                  <label>{t('priceRange')}</label>
                  <select value={editPriceRange} onChange={e => setEditPriceRange(e.target.value)} className="partner-select">
                    <option value="$">$ — Budget</option>
                    <option value="$$">$$ — Moderate</option>
                    <option value="$$$">$$$ — Premium</option>
                  </select>
                </div>

                <div className="admin-field admin-field-full">
                  <label>{t('cuisines')}</label>
                  <div className="partner-chip-group">
                    {cuisineOptions.map(opt => (
                      <button
                        key={opt.code}
                        type="button"
                        className={`partner-chip ${selectedCuisines.includes(opt.code) ? 'partner-chip-active' : ''}`}
                        onClick={() => toggleCuisine(opt.code)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white-10 pt-4 mt-6">
                <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400 mb-3">Delivery Partner URLs (UAE Apps)</h3>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label>Talabat URL</label>
                    <input 
                      type="text" 
                      value={talabatUrl} 
                      onChange={e => setTalabatUrl(e.target.value)} 
                      placeholder="https://www.talabat.com/uae/..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Deliveroo URL</label>
                    <input 
                      type="text" 
                      value={deliverooUrl} 
                      onChange={e => setDeliverooUrl(e.target.value)} 
                      placeholder="https://deliveroo.ae/menu/..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Noon Food URL</label>
                    <input 
                      type="text" 
                      value={noonUrl} 
                      onChange={e => setNoonUrl(e.target.value)} 
                      placeholder="https://noon.com/uae-en/food/..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Careem Food URL</label>
                    <input 
                      type="text" 
                      value={careemUrl} 
                      onChange={e => setCareemUrl(e.target.value)} 
                      placeholder="https://careem.com/..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Keeta URL</label>
                    <input 
                      type="text" 
                      value={ketaUrl} 
                      onChange={e => setKetaUrl(e.target.value)} 
                      placeholder="https://keeta.ae/..."
                    />
                  </div>
                  <div className="admin-field">
                    <label>Smiles URL</label>
                    <input 
                      type="text" 
                      value={smilesUrl} 
                      onChange={e => setSmilesUrl(e.target.value)} 
                      placeholder="https://www.smilesuae.ae/..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white-10 pt-4 mt-6">
                <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400 mb-3">{t('adminCreds')}</h3>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label>{t('adminUser')}</label>
                    <input type="text" value={editAdminUser} onChange={e => setEditAdminUser(e.target.value)} />
                  </div>
                  <div className="admin-field">
                    <label>{t('adminPass')}</label>
                    <input type="text" value={editAdminPass} onChange={e => setEditAdminPass(e.target.value)} />
                  </div>
                </div>
              </div>

              <button className="partner-btn-primary mt-6" onClick={handleSaveInfo} disabled={saving}>
                <Save size={16} /> {saving ? t('saving') : t('saveBtn')}
              </button>
            </div>

            {/* Quick Stats Card */}
            <div className="admin-card glass-panel">
              <h3 className="admin-card-subtitle flex items-center gap-2">
                <CheckSquare size={16} className="text-green" /> {t('quickStats')}
              </h3>
              <div className="admin-stats">
                <div className="admin-stat">
                  <span className="admin-stat-value">{restaurant.branches?.length || 0}</span>
                  <span className="admin-stat-label">{t('branches')}</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{menuData.reduce((sum, c) => sum + c.items.length, 0)}</span>
                  <span className="admin-stat-label">{t('menuItems')}</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{restaurant.socialLinks?.length || 0}</span>
                  <span className="admin-stat-label">{t('socialLinks')}</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{selectedCuisines.length}</span>
                  <span className="admin-stat-label">{t('cuisines')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="admin-grid">
            {/* Add Item form */}
            <div className="admin-card glass-panel admin-card-wide">
              <h2 className="admin-card-title">{t('addMenuItem')}</h2>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>Category</label>
                  <CustomCategorySelector 
                    value={newItemData.categoryId} 
                    onChange={(catId) => setNewItemData(p => ({ ...p, categoryId: catId }))} 
                    menuData={menuData}
                  />
                </div>
                <div className="admin-field">
                  <label>{t('itemName')}</label>
                  <AutocompleteInput 
                    value={newItemData.name} 
                    onChange={val => setNewItemData(p => ({ ...p, name: val }))} 
                  />
                </div>
                <div className="admin-field">
                  <label>{t('itemPrice')}</label>
                  <input type="number" value={newItemData.price} onChange={e => setNewItemData(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="admin-field admin-field-full">
                  <label>{t('itemDesc')}</label>
                  <input type="text" value={newItemData.description} onChange={e => setNewItemData(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="admin-field admin-field-full">
                  <label>{t('itemTags')}</label>
                  <input type="text" value={newItemData.tags} onChange={e => setNewItemData(p => ({ ...p, tags: e.target.value }))} placeholder="spicy, popular" />
                </div>
                
                {/* Visual Picker */}
                <div className="admin-field admin-field-full">
                  <label>{t('selectPic')}</label>
                  <div className="dish-visual-selector grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    {DEFAULT_DISH_GALLERY.map(dish => (
                      <button
                        key={dish.id}
                        type="button"
                        className={`dish-img-btn relative rounded-lg overflow-hidden border-2 ${newItemData.imageUrl === dish.path ? 'border-green' : 'border-transparent'}`}
                        onClick={() => setNewItemData(p => ({ ...p, imageUrl: dish.path }))}
                      >
                        <img src={dish.path} alt={dish.name} className="w-full h-10 object-cover" />
                        <span className="text-[9px] block text-center py-0.5 bg-black-50 text-white truncate">{dish.name}</span>
                      </button>
                    ))}
                  </div>
                  <ImageUploadZone 
                    currentUrl={newItemData.imageUrl} 
                    onUploadComplete={(url) => setNewItemData(p => ({ ...p, imageUrl: url }))} 
                    labelText={t('customPic')}
                  />
                </div>
              </div>
              <button className="partner-btn-primary mt-4" onClick={handleAddItem}>
                <Plus size={16} /> {t('addMenuItem')}
              </button>
            </div>

            {/* Render Items */}
            {menuData.map(cat => (
              <div key={cat.id} className="admin-card glass-panel admin-card-wide">
                <h2 className="admin-card-title text-base font-extrabold text-gold mb-4">{cat.name}</h2>
                {cat.items.length === 0 ? (
                  <p className="admin-empty-text">{t('noItems')}</p>
                ) : (
                  <div className="admin-menu-items">
                    {cat.items.map(item => (
                      <div key={item.id} className="admin-menu-item-row">
                        {editingItem?.id === item.id ? (
                          // Edit form
                          <div className="admin-edit-item-form p-2 border border-white-05 rounded-xl bg-white-02 w-full">
                            <div className="admin-form-grid">
                              <div className="admin-field">
                                <label>Category</label>
                                <CustomCategorySelector 
                                  value={editingItem.categoryId} 
                                  onChange={(catId) => setEditingItem(p => ({ ...p, categoryId: catId }))} 
                                  menuData={menuData}
                                />
                              </div>
                              <div className="admin-field">
                                <label>Name</label>
                                <AutocompleteInput 
                                  value={editingItem.name} 
                                  onChange={val => setEditingItem(p => ({ ...p, name: val }))} 
                                />
                              </div>
                              <div className="admin-field">
                                <label>Price (AED)</label>
                                <input type="number" value={editingItem.price} onChange={e => setEditingItem(p => ({ ...p, price: e.target.value }))} />
                              </div>
                              <div className="admin-field admin-field-full">
                                <label>Description</label>
                                <input type="text" value={editingItem.description || ''} onChange={e => setEditingItem(p => ({ ...p, description: e.target.value }))} />
                              </div>
                              <div className="admin-field admin-field-full">
                                <label>Tags (comma-separated)</label>
                                <input type="text" value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : editingItem.tags} onChange={e => setEditingItem(p => ({ ...p, tags: e.target.value }))} />
                              </div>

                              {/* Visual Picker */}
                              <div className="admin-field admin-field-full">
                                <label>Select Picture</label>
                                <div className="dish-visual-selector grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                                  {DEFAULT_DISH_GALLERY.map(dish => (
                                    <button
                                      key={dish.id}
                                      type="button"
                                      className={`dish-img-btn relative rounded-lg overflow-hidden border-2 ${editingItem.imageUrl === dish.path ? 'border-green' : 'border-transparent'}`}
                                      onClick={() => setEditingItem(p => ({ ...p, imageUrl: dish.path }))}
                                    >
                                      <img src={dish.path} alt={dish.name} className="w-full h-10 object-cover" />
                                      <span className="text-[9px] block text-center py-0.5 bg-black-50 text-white truncate">{dish.name}</span>
                                    </button>
                                  ))}
                                </div>
                                <ImageUploadZone 
                                  currentUrl={editingItem.imageUrl} 
                                  onUploadComplete={(url) => setEditingItem(p => ({ ...p, imageUrl: url }))} 
                                  labelText="Or upload image"
                                />
                              </div>

                              <div className="admin-field">
                                <label className="admin-checkbox">
                                  <input type="checkbox" checked={editingItem.isAvailable} onChange={e => setEditingItem(p => ({ ...p, isAvailable: e.target.checked }))} />
                                  Available
                                </label>
                              </div>
                            </div>
                            
                            <div className="admin-edit-actions mt-3">
                              <button className="partner-btn-primary" onClick={handleUpdateItem}>Save</button>
                              <button className="partner-btn-outline" onClick={() => setEditingItem(null)}>{t('cancel')}</button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex items-center gap-3">
                              <img src={item.imageUrl || '/images/dish_injera.webp'} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                              <div className="admin-menu-item-info">
                                <span className="admin-menu-item-name">{item.name}</span>
                                {item.description && <span className="admin-menu-item-desc">{item.description}</span>}
                                <div className="admin-menu-item-meta">
                                  <span className="admin-menu-item-price">AED {item.price}</span>
                                  {item.tags?.map(tag => (
                                    <span key={tag} className="admin-item-tag">{tag}</span>
                                  ))}
                                  {!item.isAvailable && <span className="admin-item-tag admin-item-tag-unavailable">Unavailable</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="admin-btn-icon" title="Edit" onClick={() => setEditingItem({ ...item })}><Edit2 size={14} /></button>
                              <button className="admin-btn-icon admin-btn-icon-danger" title="Delete" onClick={() => handleDeleteItem(item.id, cat.id)}><Trash2 size={14} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BRANCHES TAB */}
        {activeTab === 'branches' && (
          <div className="admin-grid">
            {editingBranches.map(branch => (
              <div key={branch.id} className="admin-card glass-panel admin-card-wide">
                <div className="admin-card-header-row border-b border-white-10 pb-3 mb-4">
                  <div>
                    <h2 className="admin-card-title text-lg mb-1">📍 {branch.emirate} - {branch.area || 'Main Branch'}</h2>
                    <span className="text-xs text-gray-400">ID: {branch.id}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-location-detect flex items-center gap-1"
                    onClick={() => handleBranchLocationDetect(branch.id)}
                    disabled={detectingBranchId === branch.id}
                  >
                    <Navigation size={12} className={detectingBranchId === branch.id ? 'animate-spin' : ''} />
                    {detectingBranchId === branch.id ? 'Locating...' : t('detectLoc')}
                  </button>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label>Area Name</label>
                    <input 
                      type="text" 
                      value={branch.area} 
                      onChange={e => handleUpdateBranchField(branch.id, 'area', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={branch.phone} 
                      onChange={e => handleUpdateBranchField(branch.id, 'phone', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field admin-field-full">
                    <label>Full Address</label>
                    <input 
                      type="text" 
                      value={branch.address} 
                      onChange={e => handleUpdateBranchField(branch.id, 'address', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field">
                    <label>WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={branch.whatsapp} 
                      onChange={e => handleUpdateBranchField(branch.id, 'whatsapp', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field">
                    <label>Google Maps URL</label>
                    <input 
                      type="text" 
                      value={branch.googleMapsUrl} 
                      onChange={e => handleUpdateBranchField(branch.id, 'googleMapsUrl', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field">
                    <label>Latitude</label>
                    <input 
                      type="number" 
                      value={branch.latitude || ''} 
                      onChange={e => handleUpdateBranchField(branch.id, 'latitude', e.target.value)} 
                    />
                  </div>
                  <div className="admin-field">
                    <label>Longitude</label>
                    <input 
                      type="number" 
                      value={branch.longitude || ''} 
                      onChange={e => handleUpdateBranchField(branch.id, 'longitude', e.target.value)} 
                    />
                  </div>

                  <div className="admin-field admin-field-full flex gap-4 mt-2">
                    <label className="admin-checkbox">
                      <input 
                        type="checkbox" 
                        checked={branch.acceptsDineIn} 
                        onChange={e => handleUpdateBranchField(branch.id, 'acceptsDineIn', e.target.checked)} 
                      />
                      {t('acceptsDineIn')}
                    </label>
                    <label className="admin-checkbox">
                      <input 
                        type="checkbox" 
                        checked={branch.acceptsDelivery} 
                        onChange={e => handleUpdateBranchField(branch.id, 'acceptsDelivery', e.target.checked)} 
                      />
                      {t('acceptsDelivery')}
                    </label>
                  </div>
                </div>

                {/* Delivery Integrations */}
                <div className="border-t border-white-10 pt-4 mt-6">
                  <h3 className="admin-card-subtitle text-xs uppercase tracking-wider text-gray-400 mb-3">
                    <ShoppingBag size={14} className="inline mr-1" /> {t('deliveryHeader')}
                  </h3>
                  <div className="admin-form-grid">
                    <div className="admin-field">
                      <label>Talabat URL</label>
                      <input 
                        type="url" 
                        value={branch.talabatUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'talabatUrl', e.target.value)} 
                        placeholder="https://talabat.com/..."
                      />
                    </div>
                    <div className="admin-field">
                      <label>Deliveroo URL</label>
                      <input 
                        type="url" 
                        value={branch.deliverooUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'deliverooUrl', e.target.value)} 
                        placeholder="https://deliveroo.ae/..."
                      />
                    </div>
                    <div className="admin-field">
                      <label>Noon Food URL</label>
                      <input 
                        type="url" 
                        value={branch.noonUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'noonUrl', e.target.value)} 
                        placeholder="https://noon.com/..."
                      />
                    </div>
                    <div className="admin-field">
                      <label>Careem Food URL</label>
                      <input 
                        type="url" 
                        value={branch.careemUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'careemUrl', e.target.value)} 
                        placeholder="https://careem.com/..."
                      />
                    </div>
                    <div className="admin-field">
                      <label>Keeta URL</label>
                      <input 
                        type="url" 
                        value={branch.ketaUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'ketaUrl', e.target.value)} 
                        placeholder="https://keeta.ae/..."
                      />
                    </div>
                    <div className="admin-field">
                      <label>Smiles URL</label>
                      <input 
                        type="url" 
                        value={branch.smilesUrl || ''} 
                        onChange={e => handleUpdateBranchField(branch.id, 'smilesUrl', e.target.value)} 
                        placeholder="https://www.smilesuae.ae/..."
                      />
                    </div>
                  </div>
                </div>

                <button className="partner-btn-primary mt-6" onClick={() => handleSaveBranch(branch.id)} disabled={saving}>
                  <Save size={16} /> {saving ? t('saving') : t('saveBtn')}
                </button>
              </div>
            ))}

            {editingBranches.length === 0 && (
              <div className="admin-card glass-panel admin-card-wide">
                <p className="admin-empty-text">{t('noBranches')}</p>
              </div>
            )}
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && (
          <div className="admin-grid">
            <div className="admin-card glass-panel admin-card-wide">
              <h2 className="admin-card-title flex items-center gap-2">
                <Share2 size={18} className="text-gold" /> {t('socialHeader')}
              </h2>
              <p className="admin-card-desc">Edit links to your restaurant social pages.</p>
              
              <div className="admin-form-grid mt-4">
                <div className="admin-field">
                  <label>📸 Instagram URL</label>
                  <input 
                    type="url" 
                    value={instagramUrl} 
                    onChange={e => setInstagramUrl(e.target.value)} 
                    placeholder="https://instagram.com/your-page"
                  />
                </div>
                <div className="admin-field">
                  <label>📘 Facebook URL</label>
                  <input 
                    type="url" 
                    value={facebookUrl} 
                    onChange={e => setFacebookUrl(e.target.value)} 
                    placeholder="https://facebook.com/your-page"
                  />
                </div>
                <div className="admin-field">
                  <label>🎵 TikTok URL</label>
                  <input 
                    type="url" 
                    value={tiktokUrl} 
                    onChange={e => setTiktokUrl(e.target.value)} 
                    placeholder="https://tiktok.com/@your-page"
                  />
                </div>
              </div>

              <button className="partner-btn-primary mt-6" onClick={handleSaveSocials} disabled={saving}>
                <Save size={16} /> {saving ? t('saving') : t('saveBtn')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
