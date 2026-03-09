import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy — TEKU',
    description: 'TEKU privacy policy and data handling practices.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                    Your privacy is important to us. This policy explains how TEKU collects, uses, and
                    protects your personal information.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">Data We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    We collect information you provide when creating an account, placing orders, or contacting us.
                    This includes your name, email address, and order history.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Data</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    We use your data to process orders, improve our services, and communicate with you about
                    your account. We never sell your personal information to third parties.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                    For privacy-related inquiries, contact us at privacy@teku.store.
                </p>
            </div>
            <Link href="/" className="text-black font-medium underline hover:no-underline">
                ← Back to Home
            </Link>
        </div>
    );
}
