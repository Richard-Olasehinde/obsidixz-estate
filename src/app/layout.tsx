import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/montserrat/wght.css';
import '@fontsource-variable/open-sans/wght.css';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { siteConfig } from '@/lib/site';
import { SiteStructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // `buildMetadata()` in src/lib/metadata.ts produces complete, page-specific
  // titles (including the site name where appropriate). The template therefore
  // must not append a suffix, or every inner page would read
  // "About Us | Obsidixz Real Estate | Obsidixz Real Estate".
  title: {
    default: `${siteConfig.name} — US Property Lead Research`,
    template: '%s',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: 'default',
  },
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, address: false, email: false },
  category: 'business',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — US Property Lead Research`,
    description: siteConfig.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Obsidixz Real Estate — property lead research' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — US Property Lead Research`,
    description: siteConfig.description,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#315C9B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className="flex min-h-svh flex-col antialiased">
        <SiteStructuredData />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
