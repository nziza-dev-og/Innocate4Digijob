import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthAwareLayout } from '@/components/layout/auth-aware-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DigiSpark - Empowering Youth Through Digital Innovation',
  description: 'Innovate4DigiJob @ CBG II - Transforming education and job creation with technology and creativity in Rubavu, Rwanda.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="antialiased flex flex-col min-h-screen text-foreground bg-background">
        <AuthAwareLayout>
          {children}
        </AuthAwareLayout>
        <Toaster />
      </body>
    </html>
  );
}
