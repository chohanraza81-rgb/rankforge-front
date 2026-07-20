import './globals.css';

export const metadata = {
  title: 'RankForge - Premium SEO Intelligence',
  description: 'AI analyzes competitors, finds content gaps, and gives you winning strategies. No fluff, just insights.',
  keywords: 'SEO tool, content gap analysis, competitor research',
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
