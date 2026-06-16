/**
 * Habesha Eats — Hardcoded Data Layer
 * All restaurant, menu, and review data for the frontend.
 */

export const EMIRATES = [
  'All Emirates',
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export const CUISINES = ['All', 'Ethiopian', 'Eritrean', 'Fusion'];
export const DIETARY = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free'];
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
];

export const DISH_CATEGORIES = [
  { key: 'doro-wot', label: 'Doro Wot', emoji: '🍲' },
  { key: 'kitfo', label: 'Kitfo', emoji: '🥩' },
  { key: 'beyaynetu', label: 'Beyaynetu', emoji: '🥗' },
  { key: 'coffee', label: 'Coffee', emoji: '☕' },
  { key: 'tibs', label: 'Tibs', emoji: '🌶️' },
  { key: 'shiro', label: 'Shiro', emoji: '🫘' },
  { key: 'injera', label: 'Injera', emoji: '🫓' },
  { key: 'dessert', label: 'Desserts', emoji: '🍯' },
];

export const restaurants = [
  {
    id: 'al-habasha',
    name: 'Al Habasha Restaurant',
    slug: 'al-habasha',
    tagline: 'The pioneer of traditional taste',
    description: 'Renowned for their legendary slow-cooked Doro Wot and rich, authentic flavor profile serving the diaspora since 1999. A cornerstone of Habesha dining in the UAE.',
    cuisine: ['Ethiopian', 'Eritrean'],
    emirate: 'Dubai',
    area: 'Al Karama',
    address: 'Al Karama, Dubai, UAE',
    coordinates: { lat: 25.2467, lng: 55.3047 },
    rating: 4.8,
    reviewCount: 1240,
    priceRange: '$$',
    heroImage: '/images/restaurant_al_habasha.webp',
    images: ['/images/restaurant_al_habasha.webp', '/images/dish_doro_wot.webp', '/images/dish_injera.webp'],
    hours: {
      mon: { open: '10:00', close: '23:00' },
      tue: { open: '10:00', close: '23:00' },
      wed: { open: '10:00', close: '23:00' },
      thu: { open: '10:00', close: '23:00' },
      fri: { open: '12:00', close: '23:30' },
      sat: { open: '10:00', close: '23:30' },
      sun: { open: '10:00', close: '23:00' },
    },
    amenities: ['wifi', 'parking', 'halal', 'mesob', 'delivery'],
    deliveryFee: 10,
    deliveryTime: '25-35',
    isOpen: true,
    tags: ['Signature Doro Wot', 'Family-friendly'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'ah-1', name: 'Doro Wot', description: 'Slow-braised chicken stew in rich berbere sauce with hard-boiled eggs', price: 55, image: '/images/dish_doro_wot.webp', tags: ['popular', 'spicy'], dishCategory: 'doro-wot', options: [{ name: 'Spice Level', required: true, type: 'radio', options: [{ name: 'Mild', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Extra Spicy', price: 0 }] }, { name: 'Extras', required: false, type: 'checkbox', options: [{ name: 'Extra Injera', price: 5 }, { name: 'Extra Egg', price: 8 }] }], available: true },
          { id: 'ah-2', name: 'Kitfo', description: 'Ethiopian steak tartare seasoned with mitmita spice and niter kibbeh', price: 65, image: '/images/dish_kitfo.webp', tags: ['delicacy'], dishCategory: 'kitfo', options: [{ name: 'Preparation', required: true, type: 'radio', options: [{ name: 'Leb Leb (Lightly cooked)', price: 0 }, { name: 'Tire (Raw)', price: 0 }, { name: 'Well Done', price: 0 }] }], available: true },
          { id: 'ah-3', name: 'Special Tibs', description: 'Sizzling sautéed beef with peppers, onions, and rosemary', price: 50, image: '/images/dish_tibs.webp', tags: ['popular', 'spicy'], dishCategory: 'tibs', options: [], available: true },
        ],
      },
      {
        id: 'appetizers',
        name: 'Appetizers',
        items: [
          { id: 'ah-4', name: 'Sambusa (3 pcs)', description: 'Crispy pastry filled with spiced lentils or ground beef', price: 20, image: '/images/dish_injera.webp', tags: ['vegetarian'], dishCategory: null, options: [{ name: 'Filling', required: true, type: 'radio', options: [{ name: 'Lentil (Vegan)', price: 0 }, { name: 'Beef', price: 5 }] }], available: true },
          { id: 'ah-5', name: 'Kategna', description: 'Crispy injera with berbere and niter kibbeh butter', price: 18, image: '/images/dish_injera.webp', tags: ['vegetarian'], dishCategory: 'injera', options: [], available: true },
        ],
      },
      {
        id: 'mains',
        name: 'Main Dishes',
        items: [
          { id: 'ah-6', name: 'Beyaynetu Platter', description: 'Colorful assortment of vegetarian stews on injera', price: 45, image: '/images/dish_injera.webp', tags: ['vegan', 'popular'], dishCategory: 'beyaynetu', options: [], available: true },
          { id: 'ah-7', name: 'Shiro Wot', description: 'Creamy chickpea stew with garlic, ginger, and Ethiopian spices', price: 35, image: '/images/dish_shiro.webp', tags: ['vegan', 'popular'], dishCategory: 'shiro', options: [{ name: 'Spice Level', required: true, type: 'radio', options: [{ name: 'Mild', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Spicy', price: 0 }] }], available: true },
          { id: 'ah-8', name: 'Zilzil Tibs', description: 'Strips of tender beef sautéed with jalapeños and onions', price: 52, image: '/images/dish_tibs.webp', tags: ['spicy'], dishCategory: 'tibs', options: [], available: true },
        ],
      },
      {
        id: 'sides',
        name: 'Sides & Extras',
        items: [
          { id: 'ah-9', name: 'Extra Injera (3 pcs)', description: 'Fresh sourdough flatbread', price: 10, image: '/images/dish_injera.webp', tags: ['vegan'], dishCategory: 'injera', options: [], available: true },
          { id: 'ah-10', name: 'Ayib', description: 'Fresh Ethiopian cottage cheese with herbs', price: 15, image: '/images/dish_injera.webp', tags: ['vegetarian'], dishCategory: null, options: [], available: true },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        items: [
          { id: 'ah-11', name: 'Traditional Coffee Ceremony', description: 'Freshly roasted and brewed Ethiopian coffee — the full ritual', price: 25, image: '/images/dish_coffee.webp', tags: ['cultural'], dishCategory: 'coffee', options: [], available: true },
          { id: 'ah-12', name: 'Tej (Honey Wine)', description: 'Traditional Ethiopian honey mead', price: 30, image: '/images/dish_coffee.webp', tags: [], dishCategory: null, options: [], available: true },
        ],
      },
    ],
  },
  {
    id: 'zagol',
    name: 'Zagol Ethiopian Restaurant',
    slug: 'zagol',
    tagline: 'An authentic Mesob experience',
    description: 'Dine in traditional mud-wall decorated rooms on low-slung hand-woven Mesob tables for a deeply immersive cultural feast.',
    cuisine: ['Ethiopian'],
    emirate: 'Dubai',
    area: 'Karama',
    address: 'Karama, Dubai, UAE',
    coordinates: { lat: 25.2481, lng: 55.3009 },
    rating: 4.9,
    reviewCount: 850,
    priceRange: '$$',
    heroImage: '/images/restaurant_zagol.webp',
    images: ['/images/restaurant_zagol.webp', '/images/dish_injera.webp'],
    hours: {
      mon: { open: '11:00', close: '22:30' }, tue: { open: '11:00', close: '22:30' },
      wed: { open: '11:00', close: '22:30' }, thu: { open: '11:00', close: '23:00' },
      fri: { open: '12:00', close: '23:00' }, sat: { open: '11:00', close: '23:00' },
      sun: { open: '11:00', close: '22:30' },
    },
    amenities: ['halal', 'mesob', 'delivery', 'dine-in'],
    deliveryFee: 8,
    deliveryTime: '30-40',
    isOpen: true,
    tags: ['Mesob Dining', 'Cultural'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'zg-1', name: 'Beyaynetu Special', description: 'Chef\'s selection of 6 vegetarian stews on fresh injera', price: 48, image: '/images/dish_injera.webp', tags: ['vegan', 'popular'], dishCategory: 'beyaynetu', options: [], available: true },
          { id: 'zg-2', name: 'Doro Wot', description: 'Traditional chicken stew with hard-boiled eggs in berbere sauce', price: 52, image: '/images/dish_doro_wot.webp', tags: ['popular', 'spicy'], dishCategory: 'doro-wot', options: [], available: true },
          { id: 'zg-3', name: 'Kitfo Special', description: 'Premium minced beef with mitmita, served with ayib and gomen', price: 68, image: '/images/dish_kitfo.webp', tags: ['delicacy'], dishCategory: 'kitfo', options: [{ name: 'Preparation', required: true, type: 'radio', options: [{ name: 'Leb Leb', price: 0 }, { name: 'Tire', price: 0 }] }], available: true },
        ],
      },
      {
        id: 'mains',
        name: 'Main Dishes',
        items: [
          { id: 'zg-4', name: 'Lamb Tibs', description: 'Tender lamb sautéed with vegetables and aromatic spices', price: 58, image: '/images/dish_tibs.webp', tags: ['popular'], dishCategory: 'tibs', options: [], available: true },
          { id: 'zg-5', name: 'Shiro', description: 'Slow-cooked chickpea flour stew', price: 32, image: '/images/dish_shiro.webp', tags: ['vegan'], dishCategory: 'shiro', options: [], available: true },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        items: [
          { id: 'zg-6', name: 'Ethiopian Coffee', description: 'Traditional ceremony coffee', price: 22, image: '/images/dish_coffee.webp', tags: ['cultural'], dishCategory: 'coffee', options: [], available: true },
        ],
      },
    ],
  },
  {
    id: 'kazoza',
    name: 'Kazoza Eritrean Restaurant',
    slug: 'kazoza',
    tagline: 'True Eritrean hospitality',
    description: 'Savor sizzling Lamb Tibs served in rustic clay burners alongside house-roasted Eritrean coffee and fresh, warm injera.',
    cuisine: ['Eritrean'],
    emirate: 'Abu Dhabi',
    area: 'Tourist Club',
    address: 'Tourist Club Area, Abu Dhabi, UAE',
    coordinates: { lat: 24.4870, lng: 54.3570 },
    rating: 4.7,
    reviewCount: 620,
    priceRange: '$$',
    heroImage: '/images/restaurant_kazoza.webp',
    images: ['/images/restaurant_kazoza.webp', '/images/dish_tibs.webp'],
    hours: {
      mon: { open: '10:00', close: '22:00' }, tue: { open: '10:00', close: '22:00' },
      wed: { open: '10:00', close: '22:00' }, thu: { open: '10:00', close: '23:00' },
      fri: { open: '12:00', close: '23:00' }, sat: { open: '10:00', close: '23:00' },
      sun: { open: '10:00', close: '22:00' },
    },
    amenities: ['halal', 'delivery', 'parking'],
    deliveryFee: 12,
    deliveryTime: '35-45',
    isOpen: true,
    tags: ['Eritrean Specialty', 'Clay Burner'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'kz-1', name: 'Sizzling Lamb Tibs', description: 'Tender lamb cubes in a clay burner with vegetables', price: 60, image: '/images/dish_tibs.webp', tags: ['popular'], dishCategory: 'tibs', options: [], available: true },
          { id: 'kz-2', name: 'Zigni Beef', description: 'Spicy Eritrean beef stew in tomato-berbere sauce', price: 48, image: '/images/dish_doro_wot.webp', tags: ['spicy'], dishCategory: 'doro-wot', options: [], available: true },
          { id: 'kz-3', name: 'Shiro', description: 'Eritrean-style chickpea stew', price: 30, image: '/images/dish_shiro.webp', tags: ['vegan'], dishCategory: 'shiro', options: [], available: true },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        items: [
          { id: 'kz-4', name: 'Eritrean Coffee', description: 'House-roasted with cardamom', price: 20, image: '/images/dish_coffee.webp', tags: ['cultural'], dishCategory: 'coffee', options: [], available: true },
        ],
      },
    ],
  },
  {
    id: 'milano',
    name: 'Milano Habesha Restaurant',
    slug: 'milano',
    tagline: 'Where East Africa meets Italy',
    description: 'Blending the best of Eritrean hospitality with signature Italian-influenced coffee beverages and breakfast specialties.',
    cuisine: ['Eritrean', 'Fusion'],
    emirate: 'Sharjah',
    area: 'Al Nahda',
    address: 'Al Nahda, Sharjah, UAE',
    coordinates: { lat: 25.3063, lng: 55.3712 },
    rating: 4.6,
    reviewCount: 410,
    priceRange: '$',
    heroImage: '/images/restaurant_milano.webp',
    images: ['/images/restaurant_milano.webp'],
    hours: {
      mon: { open: '07:00', close: '22:00' }, tue: { open: '07:00', close: '22:00' },
      wed: { open: '07:00', close: '22:00' }, thu: { open: '07:00', close: '23:00' },
      fri: { open: '08:00', close: '23:00' }, sat: { open: '07:00', close: '23:00' },
      sun: { open: '07:00', close: '22:00' },
    },
    amenities: ['wifi', 'halal', 'delivery'],
    deliveryFee: 7,
    deliveryTime: '20-30',
    isOpen: true,
    tags: ['Breakfast', 'Italian-Eritrean Fusion'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'ml-1', name: 'Kitcha Fit-Fit', description: 'Torn flatbread with berbere and clarified butter', price: 25, image: '/images/dish_injera.webp', tags: ['popular'], dishCategory: 'injera', options: [], available: true },
          { id: 'ml-2', name: 'Cappuccino Eritreo', description: 'Italian-style cappuccino with Eritrean spice blend', price: 18, image: '/images/dish_coffee.webp', tags: ['cultural'], dishCategory: 'coffee', options: [], available: true },
          { id: 'ml-3', name: 'Ful Medames', description: 'Fava bean stew with tomatoes, cumin, and olive oil', price: 22, image: '/images/dish_shiro.webp', tags: ['vegan'], dishCategory: 'shiro', options: [], available: true },
        ],
      },
    ],
  },
  {
    id: 'abyssinia',
    name: 'Abyssinia Restaurant',
    slug: 'abyssinia',
    tagline: 'Historic flavors, modern elegance',
    description: 'A beautiful upscale setting to enjoy modern takes on classic stews, premium kitfo, and traditional coffee ceremonies.',
    cuisine: ['Ethiopian'],
    emirate: 'Dubai',
    area: 'Deira',
    address: 'Deira, Dubai, UAE',
    coordinates: { lat: 25.2697, lng: 55.3095 },
    rating: 4.8,
    reviewCount: 530,
    priceRange: '$$$',
    heroImage: '/images/restaurant_abyssinia.webp',
    images: ['/images/restaurant_abyssinia.webp', '/images/dish_kitfo.webp'],
    hours: {
      mon: { open: '12:00', close: '23:00' }, tue: { open: '12:00', close: '23:00' },
      wed: { open: '12:00', close: '23:00' }, thu: { open: '12:00', close: '23:30' },
      fri: { open: '13:00', close: '23:30' }, sat: { open: '12:00', close: '23:30' },
      sun: { open: '12:00', close: '23:00' },
    },
    amenities: ['wifi', 'parking', 'halal', 'mesob', 'dine-in'],
    deliveryFee: 0,
    deliveryTime: null,
    isOpen: true,
    tags: ['Fine Dining', 'Coffee Ceremony'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'ab-1', name: 'Premium Kitfo', description: 'Hand-selected beef, freshly minced with premium mitmita', price: 75, image: '/images/dish_kitfo.webp', tags: ['delicacy', 'popular'], dishCategory: 'kitfo', options: [{ name: 'Preparation', required: true, type: 'radio', options: [{ name: 'Leb Leb', price: 0 }, { name: 'Tire', price: 0 }] }], available: true },
          { id: 'ab-2', name: 'Royal Doro Wot', description: 'Signature chicken stew with premium spice blend', price: 65, image: '/images/dish_doro_wot.webp', tags: ['popular', 'spicy'], dishCategory: 'doro-wot', options: [], available: true },
          { id: 'ab-3', name: 'Full Coffee Ceremony', description: 'Complete traditional coffee ceremony with popcorn and incense', price: 35, image: '/images/dish_coffee.webp', tags: ['cultural'], dishCategory: 'coffee', options: [], available: true },
        ],
      },
      {
        id: 'mains',
        name: 'Main Dishes',
        items: [
          { id: 'ab-4', name: 'Awaze Tibs', description: 'Beef sautéed in awaze paste with peppers', price: 58, image: '/images/dish_tibs.webp', tags: ['spicy'], dishCategory: 'tibs', options: [], available: true },
          { id: 'ab-5', name: 'Yemisir Wot', description: 'Red lentil stew with berbere spice', price: 38, image: '/images/dish_shiro.webp', tags: ['vegan'], dishCategory: 'shiro', options: [], available: true },
        ],
      },
    ],
  },
  {
    id: 'queen-sheba',
    name: 'Queen of Sheba',
    slug: 'queen-sheba',
    tagline: 'Royal dining experience',
    description: 'Named after the legendary Ethiopian queen, offering a royal feast of traditional dishes in an elegantly decorated setting.',
    cuisine: ['Ethiopian'],
    emirate: 'Ajman',
    area: 'Al Nuaimia',
    address: 'Al Nuaimia, Ajman, UAE',
    coordinates: { lat: 25.4052, lng: 55.4445 },
    rating: 4.5,
    reviewCount: 280,
    priceRange: '$$',
    heroImage: '/images/dish_injera.webp',
    images: ['/images/dish_injera.webp'],
    hours: {
      mon: { open: '11:00', close: '22:00' }, tue: { open: '11:00', close: '22:00' },
      wed: { open: '11:00', close: '22:00' }, thu: { open: '11:00', close: '22:30' },
      fri: { open: '12:00', close: '22:30' }, sat: { open: '11:00', close: '22:30' },
      sun: { open: '11:00', close: '22:00' },
    },
    amenities: ['halal', 'delivery', 'parking', 'mesob'],
    deliveryFee: 10,
    deliveryTime: '30-45',
    isOpen: true,
    tags: ['Traditional', 'Group Dining'],
    menu: [
      {
        id: 'popular',
        name: 'Popular',
        items: [
          { id: 'qs-1', name: 'Royal Beyaynetu', description: 'Grand vegetarian platter with 8 different stews', price: 55, image: '/images/dish_injera.webp', tags: ['vegan', 'popular'], dishCategory: 'beyaynetu', options: [], available: true },
          { id: 'qs-2', name: 'Doro Wot', description: 'Classic chicken stew', price: 48, image: '/images/dish_doro_wot.webp', tags: ['popular'], dishCategory: 'doro-wot', options: [], available: true },
          { id: 'qs-3', name: 'Derek Tibs', description: 'Dry-fried beef tibs with rosemary', price: 45, image: '/images/dish_tibs.webp', tags: ['popular'], dishCategory: 'tibs', options: [], available: true },
        ],
      },
    ],
  },
];

export const reviews = [
  { id: 'r1', restaurantId: 'al-habasha', userName: 'Hanna M.', rating: 5, text: 'Finally, a platform that understands what it means to crave the taste of home. The Doro Wot here is legendary!', date: '2026-06-10', helpfulCount: 12 },
  { id: 'r2', restaurantId: 'al-habasha', userName: 'Daniel K.', rating: 5, text: 'Best Habesha food in Dubai. The injera is always fresh and the portions are generous.', date: '2026-06-08', helpfulCount: 8 },
  { id: 'r3', restaurantId: 'al-habasha', userName: 'Sara A.', rating: 4, text: 'Great food, but delivery took a bit longer than expected. The Kitfo was perfectly done though.', date: '2026-06-05', helpfulCount: 4 },
  { id: 'r4', restaurantId: 'zagol', userName: 'Tesfaye G.', rating: 5, text: 'The Mesob dining experience is unmatched. Feels like home. Must visit!', date: '2026-06-12', helpfulCount: 15 },
  { id: 'r5', restaurantId: 'zagol', userName: 'Meron T.', rating: 5, text: 'Zagol never disappoints. The Beyaynetu is a work of art.', date: '2026-06-09', helpfulCount: 9 },
  { id: 'r6', restaurantId: 'kazoza', userName: 'Yonas B.', rating: 4, text: 'Authentic Eritrean flavors. The clay burner tibs are spectacular.', date: '2026-06-11', helpfulCount: 6 },
  { id: 'r7', restaurantId: 'kazoza', userName: 'Hanna M.', rating: 5, text: 'The coffee here is roasted with cardamom — absolutely divine.', date: '2026-06-07', helpfulCount: 11 },
  { id: 'r8', restaurantId: 'abyssinia', userName: 'Sara A.', rating: 5, text: 'Premium experience. The coffee ceremony alone is worth the visit.', date: '2026-06-14', helpfulCount: 7 },
  { id: 'r9', restaurantId: 'milano', userName: 'Daniel K.', rating: 4, text: 'Great breakfast spot. The Kitcha Fit-Fit with Eritrean coffee is a perfect morning combo.', date: '2026-06-06', helpfulCount: 3 },
  { id: 'r10', restaurantId: 'queen-sheba', userName: 'Meron T.', rating: 5, text: 'The Royal Beyaynetu is the best vegetarian platter I\'ve had in the UAE.', date: '2026-06-13', helpfulCount: 5 },
];

/** Helper: get restaurant by ID */
export function getRestaurantById(id) {
  return restaurants.find((r) => r.id === id) || null;
}

/** Helper: get reviews for a restaurant */
export function getReviewsForRestaurant(id) {
  return reviews.filter((r) => r.restaurantId === id);
}

/** Helper: get all menu items across all restaurants for a dish category */
export function getDishesByCategory(categoryKey) {
  const results = [];
  restaurants.forEach((r) => {
    r.menu.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.dishCategory === categoryKey) {
          results.push({ ...item, restaurantId: r.id, restaurantName: r.name });
        }
      });
    });
  });
  return results;
}
