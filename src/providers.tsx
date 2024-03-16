'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}
