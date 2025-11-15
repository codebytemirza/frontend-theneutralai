import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Neutral Chat',
  description: 'Empowering calm, unbiased, and intelligent conversations.',
  icons: {
    icon: [
      { url: '/media/logo.jpg', sizes: '32x32' },
      { url: '/media/logo.jpg', sizes: '16x16' }
    ],
    shortcut: '/media/logo.jpg',
    apple: '/media/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
