import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/site';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FinancialProductSchema from '@/components/FinancialProductSchema';
import AiAssistantWidget from '@/components/AiAssistantWidget';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'Velarion Markets | XAUUSD Research & Forex School',
    template: '%s | Velarion Markets'
  },
  description: 'Education-led XAUUSD research, risk illustrations, and structured Forex learning. Automation requires separate authorization; trading can result in loss.',
  keywords: [
    'XAUUSD',
    'Gold Trading',
    'Forex Academy',
    'JustMarkets',
    'MT5',
    'Quantitative Trading',
    'Algorithmic Trading',
    'SMC Liquidity Sweeps',
    'Trend Pullback',
    'Position Sizing Calculator',
    '200 Pip Growth Engine'
  ],
  creator: 'Velarion Markets',
  publisher: 'Velarion Markets',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_ORIGIN,
    siteName: 'Velarion Markets',
    title: 'Velarion Markets | XAUUSD Research & Forex School',
    description: 'XAUUSD research and structured learning. Broker eligibility, execution readiness, and Kenya legal review remain subject to verification. Trading involves risk of loss.',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Velarion Markets XAUUSD Trading Architecture'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velarion Markets | Spot Gold AI Quant & Forex Academy',
    description: 'Education-led XAUUSD research and structured Forex learning. Trading involves risk of loss.',
    images: ['/og-preview.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/velarion_emblem_dark.png', type: 'image/png' },
      { url: '/velarion_brand_dark.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/velarion_emblem_dark.png'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/velarion_emblem_dark.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/velarion_emblem_dark.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400;0,600;0,700;1,400&family=Azeret+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Gilda+Display&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <FinancialProductSchema />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <AiAssistantWidget />
        <Footer />
      </body>
    </html>
  );
}
