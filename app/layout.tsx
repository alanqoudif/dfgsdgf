import "./globals.css";
import type { Metadata, Viewport } from "next";
import { GeistSans } from 'geist/font/sans';
import { Tajawal, Montserrat } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Providers } from './providers';
import { LanguageProvider } from '@/app/language-context';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import { createAIDataBucketIfNotExists } from '@/lib/supabase';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  preload: true,
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-montserrat',
  preload: true,
  display: 'swap',
});

// Server-side initialization
createAIDataBucketIfNotExists()
  .then(result => {
    if (result.success) {
      console.log('AI data bucket initialization complete');
    } else {
      console.error('Failed to initialize AI data bucket:', result.error);
    }
  })
  .catch(error => {
    console.error('Error during AI data bucket initialization:', error);
  });

export const metadata: Metadata = {
  metadataBase: new URL('https://dhaki.ai'),
  title: "ذكي | محرك بحث ذكي مدعوم بالذكاء الاصطناعي",
  description: "ذكي هو محرك بحث مدعوم بالذكاء الاصطناعي. استفد من قوة الذكاء الاصطناعي للحصول على إجابات في الوقت الحالي.",
  openGraph: {
    type: "website",
    title: "ذكي | محرك بحث ذكي مدعوم بالذكاء الاصطناعي",
    description: "ذكي هو محرك بحث مدعوم بالذكاء الاصطناعي. استفد من قوة الذكاء الاصطناعي للحصول على إجابات في الوقت الحالي.",
    url: "https://dhaki.ai",
    siteName: "Dhaki",
    images: [{
      url: "https://dhaki.ai/og-image.png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ذكي | محرك بحث ذكي مدعوم بالذكاء الاصطناعي",
    description: "ذكي هو محرك بحث مدعوم بالذكاء الاصطناعي. استفد من قوة الذكاء الاصطناعي للحصول على إجابات في الوقت الحالي.",
    images: ["https://dhaki.ai/og-image.png"],
  },
  keywords: [
    "ذكي",
    "محرك بحث",
    "ذكاء اصطناعي",
    "بحث ذكي",
    "Dhaki",
    "Dhaki AI",
    "ai search engine",
    "AI Search Engine",
    "open source ai search engine",
    "search engine",
    "AI",
  ]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased overflow-x-hidden", GeistSans.variable, tajawal.variable, montserrat.variable)} suppressHydrationWarning>
        <NuqsAdapter>
          <Providers>
            <LanguageProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>
            </LanguageProvider>
          </Providers>
        </NuqsAdapter>
        <Analytics />
      </body>
    </html>
  );
}
