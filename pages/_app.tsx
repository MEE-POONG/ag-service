import type { AppProps } from 'next/app'
import '@/styles/globals.scss'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

export default function App({ Component, pageProps }: AppProps) {

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: 0,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={(pageProps as any).dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
