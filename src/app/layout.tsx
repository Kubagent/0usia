import type { Metadata } from 'next';
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google';
import './globals.css';
import AnalyticsProvider from '@/components/AnalyticsProvider';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: '0usia → 1',
  description:
    '0usia brings your vision, virtue and venture to life. Flourishment of narrative, innovative strategy and partnerships to create value. Stay in ousia.',
  keywords: 'ventures, GTM, AI, operations, capital, innovation, start-up, enactivism, life',
  authors: [{ name: 'Ovsia Team' }],
  icons: {
    icon: '/0usia_black.png',
    shortcut: '/0usia_black.png',
    apple: '/0usia_black.png',
  },
  openGraph: {
    title: 'ousia',
    description:
      '0usia brings your vision, virtue and venture to life. Flourishment of narrative, innovative strategy and partnerships to create value. Stay in ousia.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ousia',
    description:
      '0usia brings your vision, virtue and venture to life. Flourishment of narrative, innovative strategy and partnerships to create value. Stay in ousia.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${cormorant.variable} ${spaceGrotesk.variable}`}
    >
      <body className='antialiased overflow-x-hidden'>
        <AnalyticsProvider autoTrackPageViews={true} showConsentBanner={true}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
