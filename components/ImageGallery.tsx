// components/ImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getDefaultImageUrl } from '@/lib/utils';

interface ImageGalleryProps {
    images: string[];
    productName: string;
    categoryName: string;
}

export default function ImageGallery({ images, productName, categoryName }: ImageGalleryProps) {
    const displayImages = images.length > 0 ? images : [getDefaultImageUrl(categoryName)];
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border">
                <Image
                    src={displayImages[selectedIndex]}
                    alt={`${productName} — image ${selectedIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-4"
                    priority
                />
            </div>

            {/* Thumbnail strip — only show if multiple images */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {displayImages.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all
                ${i === selectedIndex
                                    ? 'border-black ring-1 ring-black'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`${productName} thumbnail ${i + 1}`}
                                fill
                                sizes="64px"
                                className="object-contain p-1"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
