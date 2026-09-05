import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Toolora — One Platform. Every Tool You Need.',
  description:
    'Convert files, edit PDFs, generate spreadsheets, compress images, audit SEO data, format JSON, and simplify everyday digital workflows with zero-knowledge browser security.',
  keywords: [
    'pdf tools',
    'online tools',
    'image compressor',
    'spreadsheet generator',
    'sitemap generator',
    'json formatter',
    'qr code generator',
    'seo toolkit',
  ],
  authors: [{ name: 'Toolora' }],
  metadataBase: new URL('https://toolora.com'),
  openGraph: {
    title: 'Toolora — One Platform. Every Tool You Need.',
    description:
      'All-in-one commercial utility SaaS platform. 100% private, client-side zero-knowledge file processing, free tools, and $100 All-Access.',
    url: 'https://toolora.com',
    siteName: 'Toolora',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolora — One Platform. Every Tool You Need.',
    description: 'Convert files, generate spreadsheets, optimize websites, and edit PDFs directly in your browser.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
