'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('profile');

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'ru' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    const currentFlag = locale === 'en' ? '/images/United_Kingdom.svg' : '/images/Russia.svg';
    const currentLangText = locale === 'en' ? t('english') : t('russian');

    return (
        <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4">{t('languageAndRegion')}</h3>
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-4 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                aria-label="Switch Language"
            >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                    <img 
                        src={currentFlag} 
                        alt={currentLangText} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <div className="font-semibold text-[17px]">{currentLangText}</div>
                    <div className="text-sm text-gray-500">{t('language')}</div>
                </div>
            </button>
        </div>
    );
}
