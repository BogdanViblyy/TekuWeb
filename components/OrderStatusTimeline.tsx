// components/OrderStatusTimeline.tsx

import { StatusHistoryEntry } from '@/types';

const ALL_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STATUS_LABELS: Record<string, string> = {
    PLACED: 'Placed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

interface OrderStatusTimelineProps {
    currentStatus: string;
    history: StatusHistoryEntry[];
}

export default function OrderStatusTimeline({ currentStatus, history }: OrderStatusTimelineProps) {
    const isCancelled = currentStatus === 'CANCELLED';
    const completedStatuses = new Set(history.map((h) => h.status));
    const currentIndex = ALL_STATUSES.indexOf(currentStatus);

    const getEntryForStatus = (status: string) =>
        history.find((h) => h.status === status);

    if (isCancelled) {
        const cancelEntry = getEntryForStatus('CANCELLED');
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">✕</div>
                    <div>
                        <p className="font-semibold text-red-800">Order Cancelled</p>
                        {cancelEntry && (
                            <p className="text-sm text-red-600">{new Date(cancelEntry.changedAt).toLocaleString()}</p>
                        )}
                    </div>
                </div>
                {cancelEntry?.note && (
                    <p className="text-sm text-red-700 mt-2">{cancelEntry.note}</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-start">
            {ALL_STATUSES.map((status, i) => {
                const isCompleted = completedStatuses.has(status);
                const isCurrent = status === currentStatus;
                const isFuture = i > currentIndex && currentIndex >= 0;
                const entry = getEntryForStatus(status);
                const isLast = i === ALL_STATUSES.length - 1;

                return (
                    <div key={status} className="flex-1 flex flex-col items-center relative">
                        {/* Connector line */}
                        {!isLast && (
                            <div className="absolute top-4 left-1/2 w-full h-0.5">
                                <div className={`h-full ${isCompleted && !isCurrent ? 'bg-black' : 'bg-gray-200'}`} />
                            </div>
                        )}

                        {/* Circle */}
                        <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${isCompleted ? 'bg-black border-black text-white' : ''}
                ${isCurrent && !isCompleted ? 'bg-black border-black text-white ring-4 ring-black/10' : ''}
                ${isFuture ? 'bg-white border-gray-300 text-gray-400' : ''}
              `}
                        >
                            {isCompleted || isCurrent ? '✓' : i + 1}
                        </div>

                        {/* Label */}
                        <p className={`mt-2 text-xs font-medium text-center ${isCurrent ? 'text-black font-semibold' : isFuture ? 'text-gray-400' : 'text-gray-700'}`}>
                            {STATUS_LABELS[status] || status}
                        </p>

                        {/* Timestamp */}
                        {entry && (
                            <p className="text-[10px] text-gray-400 mt-0.5 text-center">
                                {new Date(entry.changedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
