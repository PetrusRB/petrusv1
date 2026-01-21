import { api } from '@/lib/api';
import { UserPublicSchema } from '@peterrb/papi/src/modules/user/user.schema';

export async function getCurrentUser() {
  const res = await api.get('user').json();
  return UserPublicSchema.parse(res);
}
