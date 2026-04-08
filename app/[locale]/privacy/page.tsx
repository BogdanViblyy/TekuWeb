import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export const metadata = {
    title: 'Privacy Policy — TEKU',
    description: 'TEKU privacy policy and data handling practices.',
};

export default async function PrivacyPage() {
    const tPrivacy = await getTranslations('privacy');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-2">{tPrivacy('title')}</h1>
            <p className="text-sm text-gray-400 mb-6">{tPrivacy('lastUpdated')}</p>
            <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                    {tPrivacy('intro')}
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">{tPrivacy('dataWeCollect')}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    {tPrivacy('dataList')}
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">{tPrivacy('howWeUse')}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    {tPrivacy('useList')}
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">{tPrivacy('yourRights')}</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                    {tPrivacy('rightsText')}
                </p>
            </div>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← {tCommon('backTo')} Home
            </Link>
        </div>
    );
}
