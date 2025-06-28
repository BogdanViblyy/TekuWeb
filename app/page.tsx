// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

function AudienceCard({ href, imgSrc, title, textColor = 'text-black' }: { href: string; imgSrc: string; title: string; textColor?: string }) {
  return (
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
        {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
        {/* Вместо transition-colors и bg-black/0, мы используем transition-opacity и group-hover:opacity-0 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 transition-opacity duration-300 group-hover:opacity-0">
          <h2 className={`text-3xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest ${textColor}`}>
            {title}
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="border-b border-gray-200 mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AudienceCard
          href="/products/men"
          imgSrc="/images/menswear.jpg"
          title="Menswear"
        />
        <AudienceCard
          href="/products/women"
          imgSrc="/images/womenswear.jpg"
          title="Womenswear"
        />
        <AudienceCard
          href="/products/kids"
          imgSrc="/images/kidswear.jpg"
          title="Kidswear"
          textColor="text-white"
        />
      </div>

      <div className="border-t border-gray-200 mt-8"></div>

      <footer className="text-center py-8">
        <p className="text-sm text-gray-500 italic">Style is everything.</p>
      </footer>
    </div>
  );
}