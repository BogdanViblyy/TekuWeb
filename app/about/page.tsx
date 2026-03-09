import Link from 'next/link';

export const metadata = {
    title: 'About Us — TEKU',
    description: 'Learn about TEKU — a modern clothing store.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">About TEKU</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
                TEKU is a modern fashion destination offering curated collections for men, women, and kids.
                We believe in quality craftsmanship, sustainable practices, and timeless style.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
                Our mission is to make exceptional fashion accessible to everyone, bringing together the best
                brands and independent designers under one roof.
            </p>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← Back to Home
            </Link>
        </div>
    );
}
