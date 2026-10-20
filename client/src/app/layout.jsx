import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers.jsx';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar.jsx';
import { Header } from '@/components/layout/Header.jsx';
import { MobileNav } from '@/components/layout/MobileNav.jsx';
import { Footer } from '@/components/layout/Footer.jsx';
import { QuoteModal } from '@/components/modals/QuoteModal.jsx';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'GIFT KRO — Custom T-Shirts & Express Apparel Printing in Raipur',
  description:
    'GIFT KRO: Customized T-shirts, Event T-shirts, Group T-shirts, and Corporate T-shirts. High-definition screen & DTF printing on 100% bio-washed cotton. Minimum order quantity: 10 pieces. 24-hour delivery available in selected Raipur areas subject to eligibility.',
  keywords: [
    'custom t-shirt printing raipur',
    'event t-shirts raipur',
    'group t-shirts raipur',
    'corporate t-shirts raipur',
    'customized t-shirts',
    'gift kro',
  ],
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎁</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface-base text-stone-900 min-h-screen antialiased selection:bg-brand-500 selection:text-white flex flex-col font-sans">
        <Providers>
          <AnnouncementBar />
          <Header />
          <MobileNav />
          <QuoteModal />
          <main className="flex-grow w-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
