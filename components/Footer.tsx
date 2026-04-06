// components/Footer.tsx

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');
  const tBrowse = useTranslations('browse');

  return (
    <footer className="border-t border-gray-200">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand & Copyright */}
          <div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {tCommon('brandName')}. {tCommon('allRightsReserved')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tCommon('madeIn')}
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{tFooter('shop')}</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-500">
              <Link href="/brands" className="hover:text-black transition">{tBrowse('brands')}</Link>
              <Link href="/materials" className="hover:text-black transition">{tBrowse('materials')}</Link>
              <Link href="/colors" className="hover:text-black transition">{tBrowse('colors')}</Link>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{tFooter('company')}</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-500">
              <Link href="/about" className="hover:text-black transition">{tFooter('about')}</Link>
              <Link href="/contact" className="hover:text-black transition">{tFooter('contact')}</Link>
              <Link href="/privacy" className="hover:text-black transition">{tFooter('privacy')}</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}