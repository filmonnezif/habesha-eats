'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { 
  MapPin, Globe, Phone, Plus, Trash2, Shield, Lock, 
  Share2, ShoppingBag, CheckCircle, Navigation, Info, PlusCircle, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { getUserLocation, reverseGeocode } from '@/lib/geo';
import './partner.css';

// Local Translations dictionary for the Partner Onboarding Flow
const localTranslations = {
  en: {
    title: 'Partner With Us',
    subtitle: 'Join the largest Habesha food community in the UAE. List your restaurant and reach thousands of customers.',
    step1: 'Basics & Admin',
    step2: 'Location',
    step3: 'Social & Delivery',
    step4: 'Menu Creator',
    restName: 'Restaurant Name *',
    restNamePl: 'e.g. Addis Ababa Restaurant',
    tagline: 'Tagline',
    taglinePl: 'e.g. The Taste of Authentic Mesob',
    description: 'Description',
    descriptionPl: 'Tell customers about your kitchen...',
    type: 'Restaurant Type',
    cuisines: 'Cuisine Specialties',
    adminCreds: 'Admin Account (For Editing Your Listing Later)',
    adminUser: 'Admin Username *',
    adminPass: 'Admin Password *',
    emirate: 'Emirate *',
    area: 'Area *',
    areaPl: 'e.g. Al Karama',
    address: 'Full Address *',
    addressPl: 'Street, building, shop number...',
    detectLoc: '📍 Auto-detect Location',
    detecting: 'Locating...',
    lat: 'Latitude',
    lng: 'Longitude',
    phone: 'Contact Phone *',
    whatsapp: 'WhatsApp Number',
    email: 'Business Email',
    gmaps: 'Google Maps Link',
    gmapsPl: 'https://maps.google.com/...',
    socialTitle: 'Social Media Profiles',
    socialDesc: 'Help customers connect with you on social apps.',
    deliveryTitle: 'Delivery Service Links',
    deliveryDesc: 'Provide links to your restaurant pages on food delivery apps.',
    menuTitle: 'Upload Your Menu',
    menuDesc: 'A menu is mandatory to register. Add at least 1 food item with description, price, and picture.',
    addMenuItem: 'Add Menu Item',
    itemName: 'Item Name *',
    itemPrice: 'Price (AED) *',
    itemCat: 'Category (e.g. Mains, Drinks)',
    itemDesc: 'Description',
    itemTags: 'Tags (comma separated, e.g. spicy, vegan)',
    selectPic: 'Choose Dish Picture *',
    customPic: 'Or Paste Custom Image URL',
    addedItems: 'Added Menu Items',
    noItems: 'No menu items added yet. Please add at least 1 item to proceed.',
    back: '← Back',
    continue: 'Continue →',
    register: '🚀 Register Restaurant',
    successTitle: 'Welcome to Habesha Eats!',
    successPending: 'Your listing is PENDING review and will be live shortly.',
    successAction: 'Go to Admin Dashboard →'
  },
  am: {
    title: 'ከእኛ ጋር አጋር ይሁኑ',
    subtitle: 'በተባበሩት አረብ ኤምሬትስ ውስጥ ትልቁን የሐበሻ ምግብ ማህበረሰብ ይቀላቀሉ። ሬስቶራንትዎን ይመዝግቡ እና በሺዎች የሚቆጠሩ ደንበኞችን ይድረሱ።',
    step1: 'መነሻ እና መለያ',
    step2: 'ቦታ',
    step3: 'ማህበራዊ እና ማድረሻ',
    step4: 'ሜኑ ፈጣሪ',
    restName: 'የሬስቶራንቱ ስም *',
    restNamePl: 'ለምሳሌ፡ አዲስ አበባ ሬስቶራንት',
    tagline: 'አጭር መግለጫ (Tagline)',
    taglinePl: 'ለምሳሌ፡ የእውነተኛ ማዕድ ጣዕም',
    description: 'ሙሉ መግለጫ',
    descriptionPl: 'ስለ ሬስቶራንትዎ ለደንበኞች ያብራሩ...',
    type: 'የሬስቶራንት አይነት',
    cuisines: 'የምግብ ልዩነቶች',
    adminCreds: 'የአስተዳዳሪ መለያ (በኋላ ላይ ሬስቶራንቱን ለማስተካከል)',
    adminUser: 'የአስተዳዳሪ ስም *',
    adminPass: 'የአስተዳዳሪ የይለፍ ቃል *',
    emirate: 'ኤምሬት *',
    area: 'አካባቢ (Area) *',
    areaPl: 'ለምሳሌ፡ አል ካራማ',
    address: 'ሙሉ አድራሻ *',
    addressPl: 'መንገድ፣ ህንፃ፣ የሱቅ ቁጥር...',
    detectLoc: '📍 ቦታን በራስ-ሰር ፈልግ',
    detecting: 'በመፈለግ ላይ...',
    lat: 'ላቲቲዩድ',
    lng: 'ሎንጊቲዩድ',
    phone: 'የስልክ ቁጥር *',
    whatsapp: 'የዋትስአፕ ቁጥር',
    email: 'የንግድ ኢሜይል',
    gmaps: 'የጉግል ካርታ ሊንክ',
    gmapsPl: 'https://maps.google.com/...',
    socialTitle: 'የማህበራዊ ሚዲያ ሊንኮች',
    socialDesc: 'ደንበኞች በማህበራዊ ሚዲያ እንዲያገኙዎት ሊንኮችን ያክሉ።',
    deliveryTitle: 'የምግብ ማድረሻ አፕ ሊንኮች',
    deliveryDesc: 'በማድረሻ መተግበሪያዎች (ለምሳሌ ታላባት) ላይ ያሉ የሬስቶራንትዎን ሊንኮች ያክሉ።',
    menuTitle: 'የምግብ ዝርዝር (ሜኑ) ያክሉ',
    menuDesc: 'ለመመዝገብ ሜኑ ማስገባት ግዴታ ነው። እባክዎ ቢያንስ 1 ምግብ ከነዋጋው እና ፎቶው ያክሉ።',
    addMenuItem: 'ምግብ ጨምር',
    itemName: 'የምግቡ ስም *',
    itemPrice: 'ዋጋ (AED) *',
    itemCat: 'ምድብ (ለምሳሌ ዋና ምግብ፣ መጠጥ)',
    itemDesc: 'መግለጫ',
    itemTags: 'መለያዎች (በነጠላ ሰረዝ የተለዩ፣ ለምሳሌ ጾም፣ ቅመም)',
    selectPic: 'የምግቡን ፎቶ ይምረጡ *',
    customPic: 'ወይም የፎቶ ሊንክ እዚህ ይለጥፉ',
    addedItems: 'የተጨመሩ ምግቦች',
    noItems: 'እስካሁን ምንም ምግብ አልተጨመረም። እባክዎ ለመቀጠል ቢያንስ 1 ምግብ ያክሉ።',
    back: '← ወደ ኋላ',
    continue: 'ቀጥል →',
    register: '🚀 ሬስቶራንቱን መዝግብ',
    successTitle: 'እንኳን ወደ ሐበሻ ኢትስ በደህና መጡ!',
    successPending: 'የሬስቶራንትዎ ምዝገባ በመጠባበቅ ላይ ነው፣ በቅርቡ ይፋ ይሆናል።',
    successAction: 'ወደ አስተዳዳሪ ገጽ ሂድ →'
  },
  ti: {
    title: 'ምስ ኣጋርነትና ተጸንበሩ',
    subtitle: 'ኣብ ሕቡራት ዓረብ ኢማራት ዘሎ ዝዓበየ ማሕበረሰብ መግቢ ሓበሻ ተጸንበሩ። ቤት-መግቢኹም መዝግቡ እሞ ናብ ኣሽሓት ዓማዊል ብጽሑ።',
    step1: 'መሰረታውን መለያን',
    step2: 'ቦታ',
    step3: 'ማሕበራዊን ምብጻሕን',
    step4: 'ፈጣሪ ሜኑ',
    restName: 'ስም ቤት-መግቢ *',
    restNamePl: 'ንኣብነት፡ ኣዲስ ኣበባ ቤት-መግቢ',
    tagline: 'ሓጺር መግለጺ (Tagline)',
    taglinePl: 'ንኣብነት፡ ናይ ሓቂ መሶብ ጣዕሚ',
    description: 'ምሉእ መግለጺ',
    descriptionPl: 'ብዛዕባ ቤት-መግቢኹም ንዓማዊል ግለጹ...',
    type: 'ዓይነት ቤት-መግቢ',
    cuisines: 'ፍሉያት መግብታት',
    adminCreds: 'ናይ ኣመሓዳሪ መለያ (ድሕሪ ሕጂ ንምስትኽኻል)',
    adminUser: 'ስም ኣመሓዳሪ *',
    adminPass: 'ናይ ምስጢር ቃል ኣመሓሪ *',
    emirate: 'ኢማራት *',
    area: 'ከባቢ (Area) *',
    areaPl: 'ንኣብነት፡ ኣል ካራማ',
    address: 'ምሉእ ኣድራሻ *',
    addressPl: 'ጎደና፣ ህንጻ፣ ቁጽሪ ድኳን...',
    detectLoc: '📍 ቦታ ብኣውቶማቲክ ድለ',
    detecting: 'አብ ምድላይ...',
    lat: 'ላቲቲዩድ',
    lng: 'ሎንጊቲዩድ',
    phone: 'ቁጽሪ ስልኪ *',
    whatsapp: 'ቁጽሪ ዋትስአፕ',
    email: 'ናይ ንግዲ ኢመይል',
    gmaps: 'ናይ ጉግል ካርታ ሊንክ',
    gmapsPl: 'https://maps.google.com/...',
    socialTitle: 'ናይ ማሕበራዊ መራኸቢ ሊንክታት',
    socialDesc: 'ዓማዊል ብማሕበራዊ መራኸቢታት ክረኽቡኹም ሊንክታት ያክሉ።',
    deliveryTitle: 'ናይ መግቢ ምብጻሕ ሊንክታት',
    deliveryDesc: 'ኣብ መተግበሪታት ምብጻሕ መግቢ (ንኣብነት ታላባት) ዘለኩም ሊንክታት ያክሉ።',
    menuTitle: 'ናይ መግቢ ዝርዝር (ሜኑ) ያክሉ',
    menuDesc: 'ንምዝጋብ ሜኑ ምእታው ግዴታ እዩ። በጃኹም ቢያንስ 1 መግቢ ምስ ዋግኡን ፎቶኡን ያክሉ።',
    addMenuItem: 'መግቢ ወስኽ',
    itemName: 'ስም መግቢ *',
    itemPrice: 'ዋጋ (AED) *',
    itemCat: 'ዓይነት (ንኣብነት ቀንዲ መግቢ፣ መስተ)',
    itemDesc: 'መግለጺ',
    itemTags: 'መለያታት (ብነጠላ ሰረዝ ዝተፈለዩ፣ ንኣብነት ጾም፣ በርበረ)',
    selectPic: 'ፎቶ መግቢ ምረጽ *',
    customPic: 'ወይ ናይ ፎቶ ሊንክ ኣብዚ ለጥፍ',
    addedItems: 'ዝተወሰኹ መግብታት',
    noItems: 'ክሳብ ሕጂ ምንም መግቢ ኣይተወሰኸን። በጃኹም ንምቕጻል ቢያንስ 1 መግቢ ወስኹ።',
    back: '← ንድሕሪት',
    continue: 'ቀጽል →',
    register: '🚀 ቤት-መግቢ መዝግብ',
    successTitle: 'እንቋዕ ናብ ሓበሻ ኢትስ ብደሓን መጻእኩም!',
    successPending: 'ናይ ቤት-መግቢኹም ምዝገባ ኣብ ምጽባይ እዩ፣ ድሕሪ ሓጺር ግዜ ክረአ እዩ።',
    successAction: 'ናብ ገጽ ኣመሓዳሪ ኺድ →'
  },
  om: {
    title: 'Keenya Wajjin Hojjedhaa',
    subtitle: 'Hawaasa nyaata Habeshaa UAE keessatti isa guddaa ta’e tami. Nyaata keessan galmeessaa fi maamiltoota kumaatama bira gaha.',
    step1: 'Bu\'uura & Bulchaa',
    step2: 'Bakka',
    step3: 'Hawaasummaa & Dhiheessii',
    step4: 'Hojjetaa Menii',
    restName: 'Maqaa Nyaataa *',
    restNamePl: 'fkn. Addis Ababa Restaurant',
    tagline: 'Tagline',
    taglinePl: 'fkn. Mi\'aa Msooba Dhugaa',
    description: 'Ibsa',
    descriptionPl: 'Waa\'ee nyaata keessanii maamiltootaaf ibsaa...',
    type: 'Gosa Nyaataa',
    cuisines: 'Gosa Nyaata Addaa',
    adminCreds: 'Mootummaa Admin (Booda Nyaata sirreessuuf)',
    adminUser: 'Maqaa Bulchaa *',
    adminPass: 'Jabaa Jecha Bulchaa *',
    emirate: 'Emiraata *',
    area: 'Naannoo *',
    areaPl: 'fkn. Al Karama',
    address: 'Teessoo Guutuu *',
    addressPl: 'Daandii, gamoo, kkf...',
    detectLoc: '📍 Ofumaan Bakka Barbaadi',
    detecting: 'Barbaadaa jira...',
    lat: 'Latitude',
    lng: 'Longitude',
    phone: 'Simbirtuu Bilbilaa *',
    whatsapp: 'Bilbila WhatsApp',
    email: 'E-mail Nyaataa',
    gmaps: 'Liinkii Google Maps',
    gmapsPl: 'https://maps.google.com/...',
    socialTitle: 'Teessoo Hawaasummaa',
    socialDesc: 'Maamiltoonni hawaasummaan akka si quunnaman gargaari.',
    deliveryTitle: 'Liinkii Appii Dhiheessii',
    deliveryDesc: 'Liinkii nyaata keessanii kan appii dhiheessii nyaataa irratti qabdan kennaa.',
    menuTitle: 'Menii Galmeessi',
    menuDesc: 'Galmee raawwachuuf menii galmeessuun dirqama. Nyaata yoo xiqqaate 1 ibsa, gatii fi suuraan galmeessi.',
    addMenuItem: 'Nyaata Dabali',
    itemName: 'Maqaa Nyaataa *',
    itemPrice: 'Gatii (AED) *',
    itemCat: 'Gosa (fkn. Nyaata Guddaa, Dhugaatii)',
    itemDesc: 'Ibsa Nyaataa',
    itemTags: 'Tags (fkn. spicy, vegan)',
    selectPic: 'Suuraa Nyaataa Filadhu *',
    customPic: 'Yookiin Liinkii Suuraa Aadaa Iksii',
    addedItems: 'Nyaatawwan Galmeeffaman',
    noItems: 'Nyaanni galmeeffame hin jiru. Nyaata yoo xiqqaate 1 dabali.',
    back: '← Boodatti',
    continue: 'Itti Fufi →',
    register: '🚀 Nyaata Galmeessi',
    successTitle: 'Baga Gara Habesha Eats Nageyaan Dhuftan!',
    successPending: 'Galmeen nyaata keessanii eegamaa jira, dhihootti ni banama.',
    successAction: 'Gara Admin Dashboard Deemi →'
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

export default function PartnerPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Auto-location state
  const [detecting, setDetecting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    typeCode: 'RESTAURANT',
    cuisineIds: [],
    emirateCode: '',
    area: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    googleMapsUrl: '',
    adminUsername: 'Habesha',
    adminPassword: '1234',
    latitude: '',
    longitude: '',
    socialLinks: [
      { platformCode: 'INSTAGRAM', url: '' },
      { platformCode: 'FACEBOOK', url: '' },
      { platformCode: 'TIKTOK', url: '' },
    ],
    deliveryPartners: [
      { code: 'TALABAT', partnerUrl: '' },
      { code: 'DELIVEROO', partnerUrl: '' },
      { code: 'NOON', partnerUrl: '' },
      { code: 'CAREEM', partnerUrl: '' }
    ],
    menuItems: []
  });

  // Local state for the item currently being added
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Mains',
    description: '',
    tags: '',
    imageUrl: '/images/dish_doro_wot.webp'
  });

  const t = (key) => {
    return localTranslations[language]?.[key] || localTranslations['en']?.[key] || key;
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleCuisine = (code) => {
    setFormData(prev => ({
      ...prev,
      cuisineIds: prev.cuisineIds.includes(code)
        ? prev.cuisineIds.filter(c => c !== code)
        : [...prev.cuisineIds, code],
    }));
  };

  const updateSocialLink = (index, url) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) => i === index ? { ...s, url } : s),
    }));
  };

  const updateDeliveryPartner = (index, url) => {
    setFormData(prev => ({
      ...prev,
      deliveryPartners: prev.deliveryPartners.map((dp, i) => i === index ? { ...dp, partnerUrl: url } : dp),
    }));
  };

  // Auto detect location helper
  const handleAutoLocation = async () => {
    setDetecting(true);
    setError('');
    try {
      const coords = await getUserLocation();
      updateField('latitude', coords.lat.toString());
      updateField('longitude', coords.lng.toString());

      // Reverse geocode to get suburb/area name
      const areaName = await reverseGeocode(coords.lat, coords.lng);
      if (areaName) {
        updateField('area', areaName);
        updateField('address', `${areaName}, United Arab Emirates`);
      }

      // Map detected emirate automatically
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=10&addressdetails=1`
      );
      if (res.ok) {
        const geoData = await res.json();
        const addr = geoData.address || {};
        const fullAddrStr = JSON.stringify(addr).toLowerCase();
        
        let detectedEmirate = '';
        if (fullAddrStr.includes('dubai')) detectedEmirate = 'DXB';
        else if (fullAddrStr.includes('abu dhabi')) detectedEmirate = 'AUH';
        else if (fullAddrStr.includes('sharjah')) detectedEmirate = 'SHJ';
        else if (fullAddrStr.includes('ajman')) detectedEmirate = 'AJM';
        else if (fullAddrStr.includes('ras al khaimah') || fullAddrStr.includes('ra\'s al-khaymah')) detectedEmirate = 'RAK';
        else if (fullAddrStr.includes('fujairah')) detectedEmirate = 'FUJ';
        else if (fullAddrStr.includes('umm al quwain') || fullAddrStr.includes('umm al-qaywayn')) detectedEmirate = 'UAQ';

        if (detectedEmirate) {
          updateField('emirateCode', detectedEmirate);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not access device location. Please fill it manually.');
    } finally {
      setDetecting(false);
    }
  };

  // Menu item helpers
  const addMenuItem = () => {
    if (!newItem.name.trim()) return setError('Item Name is required');
    if (!newItem.price.trim() || isNaN(newItem.price)) return setError('Price must be a valid number');

    const item = {
      ...newItem,
      price: parseFloat(newItem.price),
      tags: newItem.tags ? newItem.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    setFormData(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, item]
    }));

    // Reset local add item state
    setNewItem({
      name: '',
      price: '',
      category: 'Mains',
      description: '',
      tags: '',
      imageUrl: '/images/dish_doro_wot.webp'
    });
    setError('');
  };

  const deleteMenuItem = (index) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }));
  };

  // Animate step transitions
  useEffect(() => {
    gsap.fromTo('.partner-step', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }, [step]);

  const handleSubmit = async () => {
    setError('');
    if (formData.menuItems.length === 0) {
      return setError(t('noItems'));
    }

    setSubmitting(true);
    try {
      const body = {
        ...formData,
        socialLinks: formData.socialLinks.filter(s => s.url.trim()),
        deliveryPartners: formData.deliveryPartners.filter(dp => dp.partnerUrl.trim()),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="partner-page">
        <div className="partner-success glass-panel">
          <div className="partner-success-icon">🎉</div>
          <h1 className="success-glow">{t('successTitle')}</h1>
          <p>Your restaurant <strong>{formData.name}</strong> has been registered successfully.</p>
          <p className="status-note">
            Your status is currently <strong className="status-badge-pending">PENDING</strong> — our team will review and activate your listing.
          </p>
          <div className="success-actions">
            <Link href={`/admin/${success.slug}`} className="partner-btn-primary animate-pulse">
              {t('successAction')}
            </Link>
            <Link href={`/restaurant/${success.slug}`} className="partner-btn-outline">
              View Page (Preview)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cuisineOptions = [
    { code: 'ETHIOPIAN', label: '🇪🇹 Ethiopian' },
    { code: 'ERITREAN', label: '🇪🇷 Eritrean' },
    { code: 'ETHIOPIAN_ERITREAN', label: '🇪🇹🇪🇷 Ethiopian & Eritrean' },
    { code: 'FUSION', label: '🍴 Fusion' },
  ];

  const emirateOptions = [
    { code: 'DXB', label: 'Dubai' },
    { code: 'AUH', label: 'Abu Dhabi' },
    { code: 'SHJ', label: 'Sharjah' },
    { code: 'AJM', label: 'Ajman' },
    { code: 'RAK', label: 'Ras Al Khaimah' },
    { code: 'FUJ', label: 'Fujairah' },
    { code: 'UAQ', label: 'Umm Al Quwain' },
  ];

  const typeOptions = [
    { code: 'RESTAURANT', label: '🍽️ Restaurant' },
    { code: 'CAFE', label: '☕ Cafe' },
    { code: 'BAKERY', label: '🥐 Bakery' },
    { code: 'GROCERY', label: '🛒 Grocery' },
    { code: 'CATERING', label: '🍲 Catering' },
  ];

  const isEthiopic = ['am', 'ti'].includes(language);

  return (
    <div className={`partner-page ${isEthiopic ? 'font-ethiopic' : ''}`}>
      {/* Background orbs */}
      <div className="partner-bg-orb partner-bg-orb-1" />
      <div className="partner-bg-orb partner-bg-orb-2" />

      <div className="partner-container">
        {/* Header */}
        <div className="partner-header">
          <Link href="/" className="partner-logo">
            <img src="/logo.png" alt="Habesha Eats" width="55" height="55" className="logo-glow" />
          </Link>
          <h1 className="partner-title">{t('title')}</h1>
          <p className="partner-subtitle">{t('subtitle')}</p>

          {/* Progress indicator */}
          <div className="partner-progress">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`partner-progress-step ${step >= s ? 'step-active' : ''}`}>
                <span className="partner-progress-dot">{step > s ? '✓' : s}</span>
                <span className="partner-progress-label">
                  {s === 1 ? t('step1') : s === 2 ? t('step2') : s === 3 ? t('step3') : t('step4')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="partner-error alert-error">❌ {error}</div>
        )}

        {/* Step 1: Basic Info & Admin credentials */}
        {step === 1 && (
          <div className="partner-step">
            <div className="partner-card glass-panel">
              <h2 className="partner-card-title flex items-center gap-2">
                <Sparkles size={18} className="text-gold" /> Restaurant Details
              </h2>

              <div className="partner-field">
                <label>{t('restName')}</label>
                <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder={t('restNamePl')} />
              </div>

              <div className="partner-form-row">
                <div className="partner-field">
                  <label>{t('tagline')}</label>
                  <input type="text" value={formData.tagline} onChange={e => updateField('tagline', e.target.value)} placeholder={t('taglinePl')} />
                </div>
                <div className="partner-field">
                  <label>{t('type')}</label>
                  <select value={formData.typeCode} onChange={e => updateField('typeCode', e.target.value)} className="partner-select">
                    {typeOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="partner-field">
                <label>{t('description')}</label>
                <textarea value={formData.description} onChange={e => updateField('description', e.target.value)} rows={3} placeholder={t('descriptionPl')} />
              </div>

              <div className="partner-field">
                <label>{t('cuisines')}</label>
                <div className="partner-chip-group">
                  {cuisineOptions.map(opt => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`partner-chip ${formData.cuisineIds.includes(opt.code) ? 'partner-chip-active' : ''}`}
                      onClick={() => toggleCuisine(opt.code)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-credentials-section border-t border-white-10 pt-4 mt-4">
                <h3 className="admin-section-title flex items-center gap-2">
                  <Shield size={16} className="text-green" /> {t('adminCreds')}
                </h3>
                <div className="partner-form-row">
                  <div className="partner-field">
                    <label>{t('adminUser')}</label>
                    <div className="input-icon-wrapper">
                      <Lock size={14} className="input-icon" />
                      <input type="text" value={formData.adminUsername} onChange={e => updateField('adminUsername', e.target.value)} />
                    </div>
                  </div>
                  <div className="partner-field">
                    <label>{t('adminPass')}</label>
                    <div className="input-icon-wrapper">
                      <Lock size={14} className="input-icon" />
                      <input type="password" value={formData.adminPassword} onChange={e => updateField('adminPassword', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="partner-btn-primary partner-btn-full" onClick={() => {
              if (!formData.name.trim()) return setError('Restaurant name is required');
              if (!formData.adminUsername.trim() || !formData.adminPassword.trim()) return setError('Admin username and password are required');
              setError('');
              setStep(2);
            }}>
              {t('continue')}
            </button>
          </div>
        )}

        {/* Step 2: Location & Contact */}
        {step === 2 && (
          <div className="partner-step">
            <div className="partner-card glass-panel">
              <div className="flex justify-between items-center mb-4">
                <h2 className="partner-card-title flex items-center gap-2">
                  <MapPin size={18} className="text-green" /> Location & Contact
                </h2>
                <button
                  type="button"
                  className="btn-location-detect flex items-center gap-1"
                  onClick={handleAutoLocation}
                  disabled={detecting}
                >
                  <Navigation size={14} className={detecting ? 'animate-spin' : ''} />
                  {detecting ? t('detecting') : t('detectLoc')}
                </button>
              </div>

              <div className="partner-field">
                <label>{t('emirate')}</label>
                <div className="partner-chip-group">
                  {emirateOptions.map(opt => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`partner-chip ${formData.emirateCode === opt.code ? 'partner-chip-active' : ''}`}
                      onClick={() => updateField('emirateCode', opt.code)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="partner-form-row">
                <div className="partner-field">
                  <label>{t('area')}</label>
                  <input type="text" value={formData.area} onChange={e => updateField('area', e.target.value)} placeholder={t('areaPl')} />
                </div>
                <div className="partner-field">
                  <label>{t('phone')}</label>
                  <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+971 ..." />
                </div>
              </div>

              <div className="partner-field">
                <label>{t('address')}</label>
                <input type="text" value={formData.address} onChange={e => updateField('address', e.target.value)} placeholder={t('addressPl')} />
              </div>

              <div className="partner-form-row">
                <div className="partner-field">
                  <label>{t('lat')}</label>
                  <input type="text" value={formData.latitude} onChange={e => updateField('latitude', e.target.value)} placeholder="0.0000" />
                </div>
                <div className="partner-field">
                  <label>{t('lng')}</label>
                  <input type="text" value={formData.longitude} onChange={e => updateField('longitude', e.target.value)} placeholder="0.0000" />
                </div>
              </div>

              <div className="partner-form-row">
                <div className="partner-field">
                  <label>{t('whatsapp')}</label>
                  <input type="tel" value={formData.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} placeholder="+971 ..." />
                </div>
                <div className="partner-field">
                  <label>{t('email')}</label>
                  <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="info@restaurant.com" />
                </div>
              </div>

              <div className="partner-field">
                <label>{t('gmaps')}</label>
                <input type="url" value={formData.googleMapsUrl} onChange={e => updateField('googleMapsUrl', e.target.value)} placeholder={t('gmapsPl')} />
              </div>
            </div>

            <div className="partner-btn-row">
              <button className="partner-btn-outline" onClick={() => setStep(1)}>{t('back')}</button>
              <button className="partner-btn-primary" onClick={() => {
                if (!formData.emirateCode) return setError('Please select an emirate');
                if (!formData.area.trim()) return setError('Area is required');
                if (!formData.address.trim()) return setError('Full Address is required');
                if (!formData.phone.trim()) return setError('Contact Phone is required');
                setError('');
                setStep(3);
              }}>
                {t('continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Social & Delivery App Links */}
        {step === 3 && (
          <div className="partner-step">
            <div className="partner-card glass-panel">
              <h2 className="partner-card-title flex items-center gap-2">
                <Share2 size={18} className="text-gold" /> {t('socialTitle')}
              </h2>
              <p className="partner-card-desc">{t('socialDesc')}</p>

              {formData.socialLinks.map((link, i) => {
                const icons = { INSTAGRAM: '📸 Instagram', FACEBOOK: '📘 Facebook', TIKTOK: '🎵 TikTok' };
                return (
                  <div key={i} className="partner-field">
                    <label>{icons[link.platformCode] || link.platformCode}</label>
                    <input type="url" value={link.url} onChange={e => updateSocialLink(i, e.target.value)} placeholder={`https://${link.platformCode.toLowerCase()}.com/...`} />
                  </div>
                );
              })}
            </div>

            <div className="partner-card glass-panel">
              <h2 className="partner-card-title flex items-center gap-2">
                <ShoppingBag size={18} className="text-green" /> {t('deliveryTitle')}
              </h2>
              <p className="partner-card-desc">{t('deliveryDesc')}</p>

              {formData.deliveryPartners.map((dp, i) => {
                const partnerNames = { TALABAT: '🛵 Talabat URL', DELIVEROO: '🛵 Deliveroo URL', NOON: '🛵 Noon Food URL', CAREEM: '🛵 Careem Food URL' };
                return (
                  <div key={i} className="partner-field">
                    <label>{partnerNames[dp.code] || dp.code}</label>
                    <input type="url" value={dp.partnerUrl} onChange={e => updateDeliveryPartner(i, e.target.value)} placeholder="https://..." />
                  </div>
                );
              })}
            </div>

            <div className="partner-btn-row">
              <button className="partner-btn-outline" onClick={() => setStep(2)}>{t('back')}</button>
              <button className="partner-btn-primary" onClick={() => {
                setError('');
                setStep(4);
              }}>
                {t('continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Menu Creator */}
        {step === 4 && (
          <div className="partner-step">
            <div className="partner-card glass-panel">
              <h2 className="partner-card-title flex items-center gap-2">
                <PlusCircle size={18} className="text-green" /> {t('menuTitle')}
              </h2>
              <p className="partner-card-desc">{t('menuDesc')}</p>

              {/* Add Item Form */}
              <div className="menu-item-creator border border-white-10 p-4 rounded-xl bg-white-02 mb-6">
                <h3 className="creator-title mb-3 font-semibold text-sm uppercase text-gray-300">{t('addMenuItem')}</h3>
                
                <div className="partner-form-row">
                  <div className="partner-field">
                    <label>{t('itemName')}</label>
                    <input type="text" value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Doro Wot" />
                  </div>
                  <div className="partner-field">
                    <label>{t('itemPrice')}</label>
                    <input type="number" value={newItem.price} onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} placeholder="0.00" />
                  </div>
                </div>

                <div className="partner-form-row">
                  <div className="partner-field">
                    <label>{t('itemCat')}</label>
                    <input type="text" value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Mains" />
                  </div>
                  <div className="partner-field">
                    <label>{t('itemTags')}</label>
                    <input type="text" value={newItem.tags} onChange={e => setNewItem(prev => ({ ...prev, tags: e.target.value }))} placeholder="spicy, popular" />
                  </div>
                </div>

                <div className="partner-field">
                  <label>{t('itemDesc')}</label>
                  <input type="text" value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} placeholder="Slow cooked chicken in berbere sauce..." />
                </div>

                {/* visual image selector */}
                <div className="partner-field">
                  <label>{t('selectPic')}</label>
                  <div className="dish-visual-selector grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    {DEFAULT_DISH_GALLERY.map(dish => (
                      <button
                        key={dish.id}
                        type="button"
                        className={`dish-img-btn relative rounded-lg overflow-hidden border-2 ${newItem.imageUrl === dish.path ? 'border-green' : 'border-transparent'}`}
                        onClick={() => setNewItem(prev => ({ ...prev, imageUrl: dish.path }))}
                      >
                        <img src={dish.path} alt={dish.name} className="w-full h-12 object-cover" />
                        <span className="text-[9px] block text-center py-0.5 bg-black-50 text-white truncate">{dish.name}</span>
                      </button>
                    ))}
                  </div>

                  <label>{t('customPic')}</label>
                  <input type="url" value={newItem.imageUrl} onChange={e => setNewItem(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://..." />
                </div>

                <button type="button" className="partner-btn-primary btn-sm flex items-center gap-1 mt-2" onClick={addMenuItem}>
                  <Plus size={14} /> {t('addMenuItem')}
                </button>
              </div>

              {/* Added Items List */}
              <h3 className="font-bold text-sm uppercase text-gray-400 mb-2">{t('addedItems')} ({formData.menuItems.length})</h3>
              
              {formData.menuItems.length === 0 ? (
                <div className="p-4 border border-dashed border-white-10 rounded-xl text-center text-gray-500 text-sm">
                  {t('noItems')}
                </div>
              ) : (
                <div className="added-items-list flex flex-col gap-2">
                  {formData.menuItems.map((item, idx) => (
                    <div key={idx} className="added-item-row flex items-center justify-between p-3 border border-white-05 rounded-xl bg-white-02">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.name}</h4>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                          <span className="text-xs font-semibold text-green">AED {item.price} • {item.category}</span>
                        </div>
                      </div>
                      <button type="button" className="btn-delete-item text-red hover:text-red-500 p-1" onClick={() => deleteMenuItem(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="partner-btn-row mt-4">
              <button className="partner-btn-outline" onClick={() => setStep(3)}>{t('back')}</button>
              <button className="partner-btn-primary" onClick={handleSubmit} disabled={submitting || formData.menuItems.length === 0}>
                {submitting ? 'Registering...' : t('register')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
