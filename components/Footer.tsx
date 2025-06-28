// components/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Copyright и Made in Europe */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TEKU. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Made in Europe
            </p>
          </div>
          
          {/* Навигационные ссылки футера */}
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}