import type { AppProps } from 'next/app'
import '@/styles/globals.scss'
import { Kanit } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      .then((registration) => registration.update())
      .catch((error) => {
        if (!cancelled) {
          console.error('[Service Worker] Registration failed:', error)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`${kanit.className} antialiased`}>
        <Component {...pageProps} />
        {/* Portal target so modals inherit Kanit and theme */}
        <div id="modal-root" />
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  )
}
