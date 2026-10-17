// app/api/users/login/route.ts
// Deprecated duplicate endpoint: forward directly to authoritative /api/auth/login
import { POST as authLoginPost } from '@/app/api/auth/login/route';

export async function POST(request: Request) {
  return authLoginPost(request);
}
