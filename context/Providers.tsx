// context/Providers.tsx
'use client';

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
// IntroProvider удален
import { User, CartItem } from "@/types";

export function Providers({ user, cart, children }: { user: User | null, cart: CartItem[], children: ReactNode }) {
    return (
        <AuthProvider user={user}>
            <CartProvider cart={cart}>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}