'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error.message || 'An unexpected error occurred.'}</p>
            <button
                onClick={reset}
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition"
            >
                Try Again
            </button>
        </div>
    );
}
