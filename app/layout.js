import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Nexus Commerce — GPUs',
  description: 'Curated performance. Nexus Commerce GPU store.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-sans">
        <Providers>
          <SiteHeader />
          <main className="min-h-screen pt-16">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
