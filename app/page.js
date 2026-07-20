'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }

    // Reset states
    setLoading(true);
    setProgress(0);
    setReport(null);
    setError('');
    setStatusMessage('⏳ Starting analysis...');
    startTimeRef.current = Date.now();

    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        setError('NEXT_PUBLIC_API_URL is not set.');
        setLoading(false);
        return;
      }

      // 1. Call Backend to generate report
      const res = await fetch(`${baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to start generation');
      }

      const data = await res.json();

      // 2. If Cache hit, display immediately
      if (data.cached) {
        setReport(data.data);
        setProgress(100);
        setStatusMessage('✅ Report ready from cache!');
        setLoading(false);
        return;
      }

      const reportId = data.reportId;
      setStatusMessage('🔄 Fetching competitor data... (Step 1/3)');

      // 3. Polling with longer timeout (5 minutes max)
      let pollCount = 0;
      const maxPolls = 120; // 120 * 5 seconds = 10 minutes max
      let lastProgress = 0;

      intervalRef.current = setInterval(async () => {
        pollCount++;
        
        // Update progress (simulate)
        if (pollCount < 20) {
          // Step 1: SerpAPI (0-40%)
          const newProgress = Math.min(pollCount * 2, 40);
          setProgress(newProgress);
          if (pollCount === 5) setStatusMessage('🔍 Analyzing competitor pages... (Step 2/3)');
        } else if (pollCount < 40) {
          // Step 2: Gemini Processing (40-85%)
          const newProgress = Math.min(40 + (pollCount - 20) * 2.25, 85);
          setProgress(newProgress);
          if (pollCount === 25) setStatusMessage('🧠 Generating AI insights... (Step 3/3)');
        } else {
          // Step 3: Almost done (85-95%)
          setProgress(Math.min(85 + (pollCount - 40) * 0.5, 95));
          setStatusMessage('⏳ Finalizing report...');
        }

        try {
          const statusRes = await fetch(`${baseUrl}/report/${reportId}`);
          if (!statusRes.ok) throw new Error('Status check failed');

          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            setReport(statusData.data);
            setProgress(100);
            setStatusMessage('✅ Report ready!');
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else if (statusData.status === 'failed') {
            const errorMsg = statusData.errorMessage || 'Report generation failed. Please try again.';
            setError(`❌ ${errorMsg}`);
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else if (pollCount >= maxPolls) {
            // Timeout after 10 minutes
            setError('⏰ Generation is taking too long (over 10 minutes). Please try again with a different keyword.');
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } catch (err) {
          console.error('Polling error:', err);
          // Don't stop loading, let it retry
        }
      }, 5000); // 5 seconds interval

    } catch (err) {
      setError(err.message || 'Something went wrong. Check if backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text inline-block">
            RankForge
          </h1>
          <span className="ml-3 text-xs font-semibold bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/50">
            PREMIUM v2.0
          </span>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            AI doesn't write. It analyzes competitors, finds gaps, and gives you the winning strategy.
          </p>
        </div>

        {/* Input Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder='Enter keyword (e.g., "best budget laptops 2025")'
            className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-400 transition"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform rounded-2xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[160px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              '🚀 Generate Brief'
            )}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && loading && (
          <div className="mb-3 text-sm text-cyan-300 text-center">
            {statusMessage}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mb-8 space-y-2">
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">{progress}% complete</p>
          </div>
        )}

        {/* Report Section */}
        {report && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Report Ready: <span className="text-white font-mono text-sm">{keyword}</span>
              </h2>
              <button
                onClick={() => window.print()}
                className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF
              </button>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Search Intent</p>
                <p className="text-xl font-bold text-cyan-300 mt-1">{report.keyword_intent || 'Informational'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Content Quality Score</p>
                <p className="text-xl font-bold text-yellow-300 mt-1">{report.content_score || 85}/100</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Readability Level</p>
                <p className="text-xl font-bold text-green-300 mt-1">{report.readability_avg || 'Medium'}</p>
              </div>
            </div>

            {/* Missing Headings */}
            {report.missing_headings && report.missing_headings.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-purple-300 flex items-center gap-2 mb-3">
                  📌 Missing Headings (Add these to your content)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                  {report.missing_headings.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQ Questions */}
            {report.faq_questions && report.faq_questions.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-yellow-300 flex items-center gap-2 mb-3">
                  ❓ FAQ Schema Ideas (Answer these in your post)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                  {report.faq_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competitor Battle Table */}
            {report.competitor_table && report.competitor_table.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-x-auto">
                <h3 className="font-bold text-orange-300 flex items-center gap-2 mb-3">
                  ⚔️ Competitor Battle Card (Top 5)
                </h3>
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400">
                      <th className="p-2 font-medium">Rank</th>
                      <th className="p-2 font-medium">Title</th>
                      <th className="p-2 font-medium">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.competitor_table.map((c, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-2 font-mono text-xs text-cyan-300">#{c.rank}</td>
                        <td className="p-2 truncate max-w-[200px]">{c.title}</td>
                        <td className="p-2 text-xs text-green-300">{c.strength || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Authority Links */}
            {report.authority_links && report.authority_links.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-blue-300 flex items-center gap-2 mb-3">
                  🔗 Authority Citations (Add outbound links to these)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.authority_links.map((l, i) => (
                    <a
                      key={i}
                      href={l}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs bg-blue-500/20 hover:bg-blue-500/40 px-3 py-1.5 rounded-full transition truncate max-w-[250px] border border-blue-500/20"
                      title={l}
                    >
                      {l.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 30)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
              ⚠️ Do not copy-paste this raw data. Use these human-edited insights to create original, high-quality content that outranks competitors.
            </p>
          </div>
        )}

        {/* Initial Empty State */}
        {!loading && !report && !error && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🧠</div>
            <p>Enter a keyword above to generate a detailed SEO brief.</p>
            <p className="text-sm text-gray-600 mt-2">Powered by SerpAPI, Gemini AI, and MongoDB.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
