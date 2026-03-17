import { Spinner } from '@/components/Spinner';

export default function ProfileLoading() {
    return (
        <div className="container mx-auto max-w-2xl py-12 px-4 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        </div>
    );
}
