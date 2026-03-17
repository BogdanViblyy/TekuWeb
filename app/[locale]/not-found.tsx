// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <Link
                href="/"
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition"
            >
                Go Home
            </Link>
        </div>
    );
}
