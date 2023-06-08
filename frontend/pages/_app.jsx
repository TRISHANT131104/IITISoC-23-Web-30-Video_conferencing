import '@/styles/globals.css'
import React from 'react'
import { ContextProvider } from '../context/Context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Navbar from '../components/Navbar'
export default function App({ Component, pageProps }) {
  const queryClient = new QueryClient()
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <Navbar />
          <div className='z-0'>
          <Component {...pageProps} />
          </div>
        </ContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>

    </>
  )
}
