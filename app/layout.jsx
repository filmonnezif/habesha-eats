import { Inter } from 'next/font/google';
import './globals.css';
import './app.css';
import SmoothScroll from '@/components/SmoothScroll';
import ScrollProgress from '@/components/ScrollProgress';
import { CartProvider } from '@/lib/CartContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'Habesha Eats — Discover Ethiopian & Eritrean Restaurants',
  description:
    'A curated directory of the finest Ethiopian and Eritrean restaurants. Discover authentic flavors, traditional Mesob dining, and local favorites near you.',
  keywords: [
    'Ethiopian restaurant',
    'Eritrean restaurant',
    'Habesha food',
    'injera',
    'doro wot',
    'traditional dining',
    'restaurant directory',
  ],
  openGraph: {
    title: 'Habesha Eats — Discover Ethiopian & Eritrean Restaurants',
    description:
      'A curated directory of the finest Ethiopian and Eritrean restaurants.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider>
          <CartProvider>
            <SmoothScroll>
              {/* Ambient gradient blobs */}
              <div className="gradient-blobs" aria-hidden="true">
                <div className="gradient-blob blob-green" />
                <div className="gradient-blob blob-gold" />
                <div className="gradient-blob blob-red" />
              </div>

              <ScrollProgress />
              <ThemeToggle />
              {children}
            </SmoothScroll>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
