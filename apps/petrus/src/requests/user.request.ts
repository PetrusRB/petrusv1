import { api } from '@/lib/api';
import { UserPublic } from '@/schemas/user.schema';
// type ApiPayload<T> =
//   | { success: true; user: T; created?: boolean; cached?: boolean }
//   | { success: false; error?: string; message?: string; action?: string };

// /**
//  * Safe JSON parse helper
//  */
// async function safeParseJson(res: Response | any) {
//   try {
//     if (res && typeof res.json === 'function') return await res.json();
//     return res;
//   } catch {
//     return null;
//   }
// }

// /**
//  * POST /api/users/sync
//  * clerkToken (opcional)
//  */
// export async function syncUserWithBackend(
//   clerkToken?: string,
//   forceUpdate = false
// ): Promise<UserPublic> {
//   const res = await fetch('/api/users/sync', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}),
//     },
//     body: JSON.stringify({ forceUpdate }),
//   });

//   if (!res.ok) {
//     const parsed = await safeParseJson(res);
//     const msg =
//       parsed?.message ?? parsed?.error ?? `Sync failed (${res.status})`;
//     throw new Error(msg);
//   }

//   const payload = (await safeParseJson(res)) as ApiPayload<UserPublic>;
//   if (!payload || !payload.success || !payload.user) {
//     throw new Error('Failed to sync user');
//   }
//   return payload.user;
// }

export async function getCurrentUser(): Promise<UserPublic> {
  const response = await api.get('/users/me');

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to fetch user');
  }

  return response.json();
}
export const getUser = async () => {
  const req = await api.get('/user');
  if (!req.ok) {
    if (req.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to fetch user');
  }
  return req.json();
};
