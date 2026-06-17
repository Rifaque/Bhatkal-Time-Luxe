'use client';

import { Users } from 'lucide-react';
import { AdminShell, AdminPanel } from '../components/AdminShell';

export default function UsersPage() {
  return (
    <AdminShell
      eyebrow="Operations"
      title="Users"
      description="Customer accounts and access management."
    >
      <div className="space-y-6">
        <AdminPanel
          title="Customer Accounts"
          description="This storefront currently uses anonymous cart sessions (cookie-based). No customer account system is implemented yet."
        >
          <div className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#D1B23E]/10 text-[#D1B23E]">
              <Users size={28} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-semibold text-white">No user accounts yet</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Cart identity is managed via a cookie-based UUID (<code className="text-[#D1B23E] text-xs bg-[#D1B23E]/10 px-1.5 py-0.5 rounded">cartId</code>). A customer login system and user directory can be added in a future phase.
              </p>
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
