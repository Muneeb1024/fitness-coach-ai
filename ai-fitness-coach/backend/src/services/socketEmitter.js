/**
 * Tiny socket emitter indirection.
 *
 * server.js owns the Socket.IO instance (created after module imports), so
 * controllers import this helper instead of server.js to avoid a circular
 * dependency. server.js calls setSocketIo(io) once at startup.
 */
let ioRef = null;

export function setSocketIo(io) {
  ioRef = io;
}

/** Push a plan-override event to the user's live socket room. */
export function emitPlanOverride(userId, payload = {}) {
  if (!ioRef) return false;
  ioRef.to(`user_${String(userId)}`).emit('plan_override', { userId, ...payload });
  return true;
}
