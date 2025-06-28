'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Контекст просто принимает данные о корзине через props
export const CartProvider = ({ cart, children }: { cart: CartItem[]; children: ReactNode }) => {
    
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const price = item.priceAtPurchase - (item.discountOnUnit || 0);
    return total + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};