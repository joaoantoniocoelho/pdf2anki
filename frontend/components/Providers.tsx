"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from '@/contexts/UserContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { ReactNode } from 'react';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId} locale="pt-BR">
      <UserProvider>
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}
