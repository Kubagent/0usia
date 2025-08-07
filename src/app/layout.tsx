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
  title: 'Ovsia - From 0 → 1, We Make Essence Real',
  description:
    'Venture studio building the impossible. Strategy, AI Operations, and Capital for transformational ventures.',
  keywords: 'venture studio, AI operations, strategy, capital, innovation',
  authors: [{ name: 'Ovsia Team' }],
  openGraph: {
    title: 'Ovsia - From 0 → 1, We Make Essence Real',
    description:
      'Venture studio building the impossible. Strategy, AI Operations, and Capital for transformational ventures.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ovsia - From 0 → 1, We Make Essence Real',
    description:
      'Venture studio building the impossible. Strategy, AI Operations, and Capital for transformational ventures.',
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
