'use client';

import { Settings, MessageCircle, Key, Globe } from 'lucide-react';
import { AdminShell, AdminPanel, AdminBadge } from '../components/AdminShell';

const envRows = [
  { label: 'MongoDB URI', key: 'MONGO_URI', note: 'Atlas cluster connection string' },
  { label: 'JWT Secret', key: 'JWT_SECRET', note: 'Admin token signing key' },
  { label: 'Cloudinary Cloud Name', key: 'CLOUDINARY_CLOUD_NAME', note: 'Media delivery host' },
  { label: 'Cloudinary API Key', key: 'CLOUDINARY_API_KEY', note: 'Upload credentials' },
  { label: 'WhatsApp Number', key: 'WHATSAPP_NUMBER', note: 'Order contact destination' },
];

export default function SettingsPage() {
  return (
    <AdminShell
      eyebrow="Operations"
      title="Settings"
      description="System configuration, environment variables, and integration status."
    >
      <div className="space-y-6">

        <AdminPanel
          title="Environment Configuration"
          description="These variables are set in your .env file on the server. They cannot be edited from the UI — update them on the server and restart."
        >
          <div className="space-y-2">
            {envRows.map(({ label, key, note }) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{note}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="text-[11px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/8">{key}</code>
                  <AdminBadge tone="success">Set</AdminBadge>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Integrations">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400 shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">MongoDB Atlas</p>
                <p className="text-xs text-gray-500 mt-0.5">Database connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400 shrink-0">
                <Key size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Cloudinary</p>
                <p className="text-xs text-gray-500 mt-0.5">Image CDN active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400 shrink-0">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">WhatsApp</p>
                <p className="text-xs text-gray-500 mt-0.5">Checkout enabled</p>
              </div>
            </div>
          </div>
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
