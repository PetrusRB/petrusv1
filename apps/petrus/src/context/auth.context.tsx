'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { UserPublic } from '@/schemas/user.schema';
import { useUser, useAuth as useClerkAuth, useSignIn } from '@clerk/nextjs';
import { syncUserAction } from '@/actions/action.user';

interface AuthContextType {
  user: UserPublic | null;
  clerkUser: ReturnType<typeof useUser>['user'] | null;
  isLoading: boolean;
  isSignInLoading: boolean;
  signIn: (redirect?: string) => Promise<void>;
  isSignedIn: boolean;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { signIn, isLoaded: signInIsLoaded } = useSignIn();
  const { getToken } = useClerkAuth();
  const [backendUser, setBackendUser] = useState<UserPublic | null>(null);
  const [isSyncing, setIsSynching] = useState(true);
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // Sincroniza usuário do Clerk com o backend
  const syncUser = useCallback(async () => {
    if (!clerkUser || !clerkIsLoaded) {
      setBackendUser(null);
      return;
    }
    setIsSynching(true);
    try {
      const token = await getToken();
      if (!token) {
        setBackendUser(null);
        console.log('Não existe token, retornando');
        return;
      }
      const userReq = await syncUserAction();
      if (userReq.success) {
        setBackendUser(userReq.user);
      } else {
        setBackendUser(null);
      }
    } catch (error) {
      console.error('Failed to sync user:', error);
      setBackendUser(null);
    } finally {
      setIsSynching(false);
    }
  }, [clerkIsLoaded, clerkUser, getToken]);

  const handleSignIn = async (redirectUrl?: string) => {
    if (!signInIsLoaded || !signIn) {
      console.warn('Clerk SignIn ainda não carregou');
      return;
    }
    setIsSignInLoading(true);
    try {
      // Inicia o fluxo OAuth com Discord
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_discord',
        redirectUrl: `${redirectUrl ?? '/sso-callback'}`,
        redirectUrlComplete: '/',
      });
    } catch (error: any) {
      if (error?.errors?.[0]?.code === 'popup_closed') {
        console.log('Popup de login fechado pelo usuário');
        return;
      }

      console.error('Erro durante signIn:', error);
    }
  };

  useEffect(() => {
    if (clerkIsLoaded) {
      syncUser();
    }
  }, [clerkIsLoaded, clerkUser?.id, syncUser]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: backendUser,
      clerkUser,
      isSignInLoading,
      signIn: (redirect) => handleSignIn(redirect),
      refreshUser: syncUser,
      isSignedIn: !!clerkUser,
      isAuthenticated: !!backendUser,
      isLoading: !clerkIsLoaded || isSyncing,
    }),
    [
      backendUser,
      clerkUser,
      clerkIsLoaded,
      isSyncing,
      isSignInLoading,
      handleSignIn,
      syncUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return context;
}

export function useBackendUser() {
  const { user } = useAuth();
  return user;
}

export function useCombinedAuth() {
  const { user: clerkUser } = useUser();
  const { user: backendUser } = useAuth();

  return {
    clerkUser,
    backendUser,
    // Dados prioritários: backend > clerk
    displayName:
      backendUser?.username ||
      clerkUser?.username ||
      clerkUser?.fullName ||
      clerkUser?.emailAddresses[0]?.emailAddress,
    avatarUrl: backendUser?.pictureUrl || clerkUser?.imageUrl,
  };
}
