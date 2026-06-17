'use client';

import { adminLogs } from '../constants/adminLogs';

export default function AdminLogs() {
  if (adminLogs.length === 0) {
    return (
      <p className="text-sm text-gray-500">No activity logged yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {adminLogs.map((log, index) => (
        <li key={index} className="flex items-start justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-3">
          <p className="text-sm text-gray-300 leading-relaxed">{log.message}</p>
          <time className="shrink-0 text-[11px] text-gray-600 font-mono mt-0.5">{log.date}</time>
        </li>
      ))}
    </ul>
  );
}
