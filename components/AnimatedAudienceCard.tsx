// components/AnimatedAudienceCard.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { itemVariants } from './HomepageAnimation'; // Импортируем варианты отсюда

interface AudienceCardProps {
  href: string;
  imgSrc: string;
  title: string;
  textColor?: string;
}

// Этот компонент теперь является "чистым" клиентским компонентом
export default function AnimatedAudienceCard({ href, imgSrc, title, textColor = 'text-black' }: AudienceCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Link 
        href={href} 
        className="block group transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 transition-opacity duration-300 group-hover:opacity-0">
            <h2 className={`text-3xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest ${textColor}`}>
              {title}
            </h2>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}