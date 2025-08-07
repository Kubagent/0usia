import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, Space_Grotesk } from 'next/font/google';
import LenisProvider from '@/components/LenisProvider';
import PerformanceInitializer from '@/components/PerformanceInitializer';
import './globals.css';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Ovsia',
  description: 'Ovsia - From Vision to Strategy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <PerformanceInitializer />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
