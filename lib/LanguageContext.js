'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
  { code: 'ti', label: 'Tigrinya', nativeLabel: 'ትግርኛ' },
  { code: 'om', label: 'Oromo', nativeLabel: 'Afaan Oromoo' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('habesha-lang');
    if (saved && ['en', 'am', 'ti', 'om'].includes(saved)) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('habesha-lang', language);
    document.documentElement.setAttribute('lang', language);
  }, [language, mounted]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found
          }
        }
        return fallback;
      }
    }
    return value;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  const translateRestaurant = useCallback((restaurant) => {
    if (!restaurant) return null;
    const { language, t } = context;
    if (language === 'en') return restaurant;

    const translatedName = t(`restaurants.${restaurant.id}.name`);
    const translatedTagline = t(`restaurants.${restaurant.id}.tagline`);
    const translatedDesc = t(`restaurants.${restaurant.id}.description`);
    const translatedArea = t(`restaurants.${restaurant.id}.area`);
    const translatedSpecialty = t(`restaurants.${restaurant.id}.specialty`);

    const translatedMenu = restaurant.menu ? restaurant.menu.map((cat) => {
      const translatedCatName = t(`menu.categories.${cat.id}`);
      return {
        ...cat,
        name: translatedCatName.startsWith('menu.categories.') ? cat.name : translatedCatName,
        items: cat.items ? cat.items.map((item) => {
          const translatedItemName = t(`menuItems.${item.id}.name`);
          const translatedItemDesc = t(`menuItems.${item.id}.description`);
          return {
            ...item,
            name: translatedItemName.startsWith('menuItems.') ? item.name : translatedItemName,
            description: translatedItemDesc.startsWith('menuItems.') ? item.description : translatedItemDesc,
          };
        }) : []
      };
    }) : [];

    return {
      ...restaurant,
      name: translatedName.startsWith('restaurants.') ? restaurant.name : translatedName,
      tagline: translatedTagline.startsWith('restaurants.') ? restaurant.tagline : translatedTagline,
      description: translatedDesc.startsWith('restaurants.') ? restaurant.description : translatedDesc,
      area: translatedArea.startsWith('restaurants.') ? restaurant.area : translatedArea,
      specialty: translatedSpecialty.startsWith('restaurants.') ? restaurant.specialty : translatedSpecialty,
      menu: translatedMenu
    };
  }, [context]);

  const translateMenuItem = useCallback((item) => {
    if (!item) return null;
    const { language, t } = context;
    if (language === 'en') return item;

    const translatedName = t(`menuItems.${item.id}.name`);
    const translatedDesc = t(`menuItems.${item.id}.description`);

    return {
      ...item,
      name: translatedName.startsWith('menuItems.') ? item.name : translatedName,
      description: translatedDesc.startsWith('menuItems.') ? item.description : translatedDesc,
    };
  }, [context]);

  return {
    ...context,
    translateRestaurant,
    translateMenuItem,
  };
}
