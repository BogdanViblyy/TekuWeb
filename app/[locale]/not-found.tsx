// app/not-found.tsx
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const tErrors = useTranslations('errors');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">{tErrors('notFoundText')}</p>
            <Link
                href="/"
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition"
            >
                {tErrors('goHome')}
            </Link>
        </div>
    );
}
