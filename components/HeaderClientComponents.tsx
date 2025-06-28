// components/HeaderClientComponents.tsx
'use client';

import Link from 'next/link';
import { ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import Search from './Search'; // Мы создадим этот компонент следующим

export default function HeaderClientComponents() {
  const { itemCount } = useCart();

  return (
    <div className="flex flex-1 items-center justify-end space-x-6">
      {/* Search Component */}
      <Search />
      
      {/* Cart Icon with Badge */}
      <div className="flow-root">
        <Link href="/cart" className="group -m-2 flex items-center p-2 relative">
          <ShoppingBagIcon
            className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
              {itemCount}
            </span>
          )}
          <span className="sr-only">items in cart, view bag</span>
        </Link>
      </div>

      {/* Profile Icon */}
      <div className="flow-root">
        <Link href="/profile" className="group -m-2 flex items-center p-2">
          <UserIcon
            className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          <span className="sr-only">view profile</span>
        </Link>
      </div>
    </div>
  );
}