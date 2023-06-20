import '@/styles/globals.css'
import React from 'react'
import { ContextProvider } from '../context/Context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Navbar from '../components/Navbar'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import 'regenerator-runtime/runtime'
import { store } from '../store/store';
import { Provider } from 'react-redux';
import { useEffect } from 'react'
export default function App({ Component, pageProps }) {
  const queryClient = new QueryClient()
  const state = store.getState()
  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <Provider store={store}>
            <div className=''>
              <Navbar />
              <ToastContainer />
              <div className='z-0 '>
                <Component {...pageProps} />
              </div>
              
            </div>
          </Provider>
        </ContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>

    </>
  )
}
