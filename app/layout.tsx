import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FinancialProductSchema from '@/components/FinancialProductSchema';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xauusd-ai-trader.vercel.app'),
  title: {
    default: 'Velarion Markets | Institutional XAUUSD Quantitative Trading & Forex Academy',
    template: '%s | Velarion Markets'
  },
  description: 'AI-assisted XAUUSD spot gold market structure analysis, 4 quantitative execution models, 200-pip compounding calculator, and 30-lesson interactive Forex school subsidized by JustMarkets.',
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
  authors: [{ name: 'Velarion Markets Quantitative Group' }],
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
    url: 'https://xauusd-ai-trader.vercel.app',
    siteName: 'Velarion Markets',
    title: 'Velarion Markets | Institutional XAUUSD Quantitative Trading & Forex Academy',
    description: 'Autonomous Spot Gold quantitative execution, 200-pip compounding calculator, and 30-lesson gated Forex school. Non-custodial MT5 execution subsidized through JustMarkets.',
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
    description: 'Systematic XAUUSD algorithmic trading, balance-tiered risk governor, and structured 30-lesson Forex school.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <FinancialProductSchema />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
