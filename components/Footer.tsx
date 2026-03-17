// components/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand & Copyright */}
          <div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TEKU. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Made in Europe
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Shop</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-500">
              <Link href="/brands" className="hover:text-black transition">Brands</Link>
              <Link href="/materials" className="hover:text-black transition">Materials</Link>
              <Link href="/colors" className="hover:text-black transition">Colors</Link>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Company</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-500">
              <Link href="/about" className="hover:text-black transition">About</Link>
              <Link href="/contact" className="hover:text-black transition">Contact</Link>
              <Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}