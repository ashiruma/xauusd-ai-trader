import 'server-only';
import { blockedResponse } from './http';
// Handler-level enforcement. This does not depend on middleware, a session flag,
// an admin cookie, legacy AUTH_SECRET, environment toggles, or the Python backend.
export function denyLegacyOperation() { return blockedResponse(); }
