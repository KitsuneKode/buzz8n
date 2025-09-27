import { Lora, Plus_Jakarta_Sans, Roboto_Mono } from 'next/font/google'

import { SmartHeader } from '@/components/site/SmartHeader'
import { Providers } from '@/components/providers'
import '@xyflow/react/dist/base.css'
import '@buzz8n/ui/globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontSerif = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
})
const fontMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased monspace`}
      >
        <Providers>
          <SmartHeader />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
