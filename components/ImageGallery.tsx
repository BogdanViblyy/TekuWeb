// components/ImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getDefaultImageUrl } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={displayImages[selectedIndex]}
                            alt={`${productName} — image ${selectedIndex + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain p-4"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnail strip — only show if multiple images */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {displayImages.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 transform
                ${i === selectedIndex
                                    ? 'border-black ring-1 ring-black scale-100'
                                    : 'border-gray-200 hover:border-gray-400 scale-95 opacity-70 hover:opacity-100 hover:scale-100'
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`${productName} thumbnail ${i + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
