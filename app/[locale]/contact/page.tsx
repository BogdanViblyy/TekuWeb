import Link from 'next/link';

export const metadata = {
    title: 'Contact Us — TEKU',
    description: 'Get in touch with the TEKU team.',
};

export default function ContactPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
                Have a question or need help? We&apos;d love to hear from you.
            </p>
            <div className="space-y-3 mb-8">
                <p className="text-gray-700"><strong>Email:</strong> support@teku.store</p>
                <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 000-0000</p>
                <p className="text-gray-700"><strong>Hours:</strong> Mon–Fri, 9am–6pm</p>
            </div>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← Back to Home
            </Link>
        </div>
    );
}
