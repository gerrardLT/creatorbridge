import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Notifications } from '@/components/Notifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreatorBridge - Programmable IP Protocol',
  description: 'The programmable IP layer for the Agentic Economy. Register assets, set liquid terms, and earn yield automatically.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        <AuthProvider>
          <AppProvider>
            <LoadingOverlay />
            <Notifications />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
