import { Spinner } from '@/components/Spinner';

export default function ProductsLoading() {
    return (
        <div className="container mx-auto py-12 px-4 pt-[calc(var(--header-total-height)+3rem)]">
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        </div>
    );
}
