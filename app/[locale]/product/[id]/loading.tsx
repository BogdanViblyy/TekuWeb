import { Spinner } from '@/components/Spinner';

export default function ProductLoading() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 pt-[calc(var(--header-total-height)+3rem)]">
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        </div>
    );
}
