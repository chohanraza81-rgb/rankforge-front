import './globals.css';

export const metadata = {
  title: 'RankForge - Premium SEO Intelligence Suite v4.0',
  description: 'Enterprise-grade content intelligence. Keyword Volume, Backlink Gap, Readability Score, Trend Forecast & more.',
  keywords: 'SEO tool, content gap analysis, competitor research, keyword analysis, backlink analysis, content strategy, readability score',
  openGraph: {
    title: 'RankForge - Premium SEO Intelligence Suite v4.0',
    description: 'AI-powered competitor analysis, keyword volume, backlink gap, and readability scoring tool.',
    url: 'https://rankforge-front.vercel.app',
    siteName: 'RankForge',
    images: [
      {
        url: 'https://rankforge-front.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankForge - Premium SEO Intelligence Suite v4.0',
    description: 'AI-powered competitor analysis, keyword volume, and backlink gap analysis tool.',
    images: ['https://rankforge-front.vercel.app/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
