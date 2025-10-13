import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'
import '@/styles/antd-custom.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SmartGrid - Professional SaaS Dashboard',
  description: 'A modern SaaS dashboard with Next.js, Ant Design, and TanStack Query',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
