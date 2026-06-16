'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((item, restaurant) => {
    setItems((prev) => {
      // If adding from a different restaurant, clear cart first
      if (restaurantId && restaurantId !== restaurant.id) {
        setRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name);
        return [{ ...item, quantity: item.quantity || 1, cartId: Date.now().toString() }];
      }

      if (!restaurantId) {
        setRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name);
      }

      // Check if same item with same options already exists
      const existingIdx = prev.findIndex(
        (ci) => ci.id === item.id && JSON.stringify(ci.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + (item.quantity || 1),
        };
        return updated;
      }

      return [...prev, { ...item, quantity: item.quantity || 1, cartId: Date.now().toString() }];
    });
  }, [restaurantId]);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.cartId !== cartId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName('');
      }
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    let itemPrice = i.price;
    if (i.selectedOptions) {
      Object.values(i.selectedOptions).forEach((opts) => {
        if (Array.isArray(opts)) {
          opts.forEach((o) => { itemPrice += o.price || 0; });
        } else if (opts && opts.price) {
          itemPrice += opts.price;
        }
      });
    }
    return sum + itemPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
