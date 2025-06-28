'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ShopItemDetails } from '@/types';
import * as actions from '@/app/actions';
import toast from 'react-hot-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition disabled:bg-gray-400">
      {pending ? 'Adding...' : 'Add to Bag'}
    </button>
  );
}

export default function AddToCartButton({ product }: { product: ShopItemDetails }) {
  const [selectedSize, setSelectedSize] = useState(product.availableSizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.availableColors?.[0] || '');

  const addToCartAction = async () => {
    const result = await actions.addToCart(product.itemId, 1, selectedColor, selectedSize);
    if(result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form action={addToCartAction} className="space-y-4">
      {product.availableColors.length > 0 && (
          <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">Color</label>
              <select id="color" name="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="w-full p-2 border rounded">
                  {product.availableColors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
      )}
      
      {product.availableSizes.length > 0 && (
           <div className="space-y-2">
              <label htmlFor="size" className="text-sm font-medium">Size</label>
              <select id="size" name="size" value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="w-full p-2 border rounded">
                  {product.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>
      )}
      <SubmitButton />
    </form>
  );
}