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

const SITE_URL = 'https://0usia.com';
const SITE_DESCRIPTION =
  '0usia is an interdisciplinary vision studio. We work with founders, operators, and creators on strategy, communication, community, operations, and product — five disciplines held in harmony, led by Kuba Wójcik.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '0usia Vision Studio',
    template: '%s | 0usia',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'vision studio', 'startup strategy', 'brand communication', 'product development',
    'operations design', 'community building', 'GTM strategy', 'founder support',
    'Kuba Wójcik', 'interdisciplinary studio', 'Berlin', 'Warsaw',
  ],
  authors: [{ name: 'Jakub Wójcik', url: SITE_URL }],
  creator: 'Jakub Wójcik',
  publisher: '0usia',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/0usia_black.png',
    shortcut: '/0usia_black.png',
    apple: '/0usia_black.png',
  },
  openGraph: {
    title: '0usia Vision Studio',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: '0usia',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/0usia_black.png', width: 600, height: 600, alt: '0usia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0usia Vision Studio',
    description: SITE_DESCRIPTION,
    images: ['/0usia_black.png'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '0usia',
              url: SITE_URL,
              logo: `${SITE_URL}/0usia_black.png`,
              description: SITE_DESCRIPTION,
              founder: {
                '@type': 'Person',
                name: 'Jakub Wójcik',
                sameAs: 'https://www.linkedin.com/in/jm-wojcik/',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@0usia.com',
                contactType: 'customer service',
              },
              sameAs: [
                'https://www.linkedin.com/company/0usia',
              ],
            }),
          }}
        />
        <AnalyticsProvider autoTrackPageViews={true} showConsentBanner={true}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
