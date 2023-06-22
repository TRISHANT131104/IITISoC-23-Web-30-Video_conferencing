import { store } from '@/store/store'
import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect } from 'react'

export default function Document() {
  
  return (
    <Html lang="en">
      <Head />
      <body className=''>
        <Main />
        <NextScript />
        
      </body>
    </Html>
  )
}
