'use client';

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { IntroProvider } from "./IntroContext";
import { ContentAnimationProvider } from "./ContentAnimationContext";
import { User, CartItem } from "@/types";

export function Providers({ 
  user, 
  cart, 
  children 
}: { 
  user: User | null; 
  cart: CartItem[]; 
  children: ReactNode 
}) {
  return (
    <IntroProvider>
      <AuthProvider user={user}>
        <CartProvider cart={cart}>
          <ContentAnimationProvider>
            {children}
          </ContentAnimationProvider>
        </CartProvider>
      </AuthProvider>
    </IntroProvider>
  );
}