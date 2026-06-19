import { connectToDatabase } from './mongodb';
import { AuditLog } from '@/models/Schemas';

/**
 * Records an admin action to the AuditLog collection.
 * Fire-and-forget — a logging failure never interrupts the main request.
 *
 * @param {object} opts
 * @param {{ id: string, username: string }} opts.admin  - From getAdminFromRequest()
 * @param {string}  opts.action    - e.g. 'ORDER_STATUS_UPDATE'
 * @param {string}  opts.entity    - e.g. 'Order', 'Brand', 'Product'
 * @param {string}  [opts.entityId]
 * @param {object}  [opts.before]  - Snapshot before the change
 * @param {object}  [opts.after]   - Snapshot after the change
 * @param {string}  [opts.ip]      - Client IP
 */
export async function logAdminAction({ admin, action, entity, entityId, before, after, ip = '' }) {
  try {
    await connectToDatabase();
    await AuditLog.create({
      adminId:       String(admin?.id || admin?._id || 'unknown'),
      adminUsername: String(admin?.username || 'unknown'),
      action,
      entity,
      entityId:      entityId ? String(entityId) : '',
      before:        before ?? null,
      after:         after  ?? null,
      ip,
    });
  } catch (err) {
    console.error('AuditLog write failed:', err.message);
  }
}
