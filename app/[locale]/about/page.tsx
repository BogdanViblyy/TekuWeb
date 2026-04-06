import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export const metadata = {
    title: 'About Us — TEKU',
    description: 'Learn about TEKU — a modern clothing store.',
};

export default async function AboutPage() {
    const tAbout = await getTranslations('about');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">{tAbout('title')}</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
                {tAbout('description')}
            </p>
            <h2 className="text-xl font-semibold mt-6 mb-3">{tAbout('mission')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                {tAbout('missionText')}
            </p>
            <h2 className="text-xl font-semibold mt-6 mb-3">{tAbout('values')}</h2>
            <ul className="list-disc pl-5 mb-8 space-y-2 text-gray-600">
                <li><strong>{tAbout('quality')}:</strong> {tAbout('qualityText')}</li>
                <li><strong>{tAbout('sustainability')}:</strong> {tAbout('sustainabilityText')}</li>
                <li><strong>{tAbout('style')}:</strong> {tAbout('styleText')}</li>
            </ul>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← {tCommon('backTo')} Home
            </Link>
        </div>
    );
}
