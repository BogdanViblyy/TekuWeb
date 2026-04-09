'use client';

import { StatusHistoryEntry } from '@/types';

interface AdminOrderTimelineProps {
    history: StatusHistoryEntry[];
    currentStatus: string;
}

export default function AdminOrderTimeline({ history, currentStatus }: AdminOrderTimelineProps) {
    return (
        <div className="admin-timeline">
            {history.map((entry, i) => {
                const isLatest = entry.status === currentStatus;

                return (
                    <div key={i} className="admin-timeline-item">
                        <div className={`admin-timeline-dot ${isLatest ? 'active' : ''}`} />
                        <div className="admin-timeline-status">{entry.status}</div>
                        <div className="admin-timeline-time">
                            {new Date(entry.changedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                        {entry.note && (
                            <div className="admin-timeline-note">{entry.note}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
