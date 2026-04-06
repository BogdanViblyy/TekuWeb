import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export const metadata = {
    title: 'Contact Us — TEKU',
    description: 'Get in touch with the TEKU team.',
};

export default async function ContactPage() {
    const tContact = await getTranslations('contact');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">{tContact('title')}</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
                {tContact('description')}
            </p>
            <div className="space-y-3 mb-8">
                <p className="text-gray-700"><strong>{tContact('emailLabel')}:</strong> {tContact('emailValue')}</p>
                <p className="text-gray-700"><strong>{tContact('hoursLabel')}:</strong> {tContact('hoursValue')}</p>
                <p className="text-gray-700"><strong>{tContact('addressLabel')}:</strong> {tContact('addressValue')}</p>
            </div>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← {tCommon('backTo')} Home
            </Link>
        </div>
    );
}
