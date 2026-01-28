import type { AuthUser } from '@/types/auth-context';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser | null;
    sessionId: string | null;
  }
}
