import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import Providers from '@/providers';
import AuthModal from '@/components/auth-modal';
import Navbar from '@/app/_components/navigation/navbar';
import './globals.css';

const openSans = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reddit Clone',
  description: 'A Reddit clone built with Next.js and Tailwind CSS'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.className} min-h-screen pt-12 bg-slate-50 antialiased`}>
        <Providers>
          <AuthModal />
          <Navbar />
          <div className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
