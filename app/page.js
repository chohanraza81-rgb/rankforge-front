'use client';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Copy, CheckCircle, Loader2, History } from 'lucide-react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const eventSourceRef = useRef(null);

  // Fetch History on Load
  useEffect(() => {
    fetch('/api/history').then(res => res.json()).then(setHistory);
  }, []);

  const handleGenerate = async () => {
    if (!keyword) return;
    setLoading(true);
    setProgress(0);
    setReport(null);

    // Close previous SSE if any
    if (eventSourceRef.current) eventSourceRef.current.close();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });
    const data = await res.json();

    if (data.cached) {
      // Cache hit: Direct fetch
      const cachedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/${data.reportId}`);
      const cachedData = await cachedRes.json();
      setReport(cachedData.data);
      setProgress(100);
      setLoading(false);
      return;
    }

    // SSE Connection for Real-time Progress
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/stream/${data.reportId}`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setProgress(data.progress);
    });

    eventSource.addEventListener('done', (e) => {
      const data = JSON.parse(e.data);
      if (data.status === 'completed') {
        setReport(data.data);
        // Add to history locally
        setHistory(prev => [{ keyword, createdAt: new Date(), data: data.data }, ...prev]);
      } else {
        alert('Report generation failed. Please retry.');
      }
      setLoading(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadCSV = () => {
    if (!report) return;
    const headers = 'Missing Headings,FAQ Questions,Authority Links\n';
    const rows = [
      report.missing_headings?.join('; ') || '',
      report.faq_questions?.join('; ') || '',
      report.authority_links?.join('; ') || ''
    ].join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${keyword}-report.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/30 backdrop-blur-xl p-6 border-r border-white/10 hidden md:block">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">RankForge</h1>
        <p className="text-xs text-gray-400 mt-1">Premium v2.0</p>
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-purple-600/30 rounded-xl border border-purple-500">
            <CheckCircle size={18} className="text-purple-400"/> Dashboard
          </div>
          <div className="flex items-center gap-3 p-3 opacity-50 hover:opacity-100 cursor-pointer">📊 History</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Content Intelligence Engine</h2>
          <p className="text-gray-400 mb-6">AI doesn't write. It analyzes, compares, and gives you the edge.</p>

          {/* Input Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword (e.g., best budget phones 2025)"
              className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-400"
              disabled={loading}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition rounded-2xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin"/> : '🚀 Generate Brief'}
            </button>
          </div>

          {/* Real-time Progress Bar (Premium UX) */}
          {loading && (
            <div className="w-full bg-white/10 rounded-full h-3 mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{progress}% Complete</p>
            </div>
          )}

          {/* Report Section */}
          {report && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap gap-3 justify-between items-center border-b border-white/10 pb-4">
                <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={14}/> Analysis Complete
                </span>
                <div className="flex gap-3">
                  <button onClick={downloadCSV} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2">📊 CSV</button>
                  <button onClick={() => window.print()} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2"><Download size={16}/> PDF</button>
                </div>
              </div>

              {/* Premium Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs">User Intent</p>
                  <p className="text-xl font-bold text-cyan-300">{report.keyword_intent || 'Informational'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs">Content Quality Score</p>
                  <p className="text-xl font-bold text-yellow-300">{report.content_score || 85}/100</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs">Readability</p>
                  <p className="text-xl font-bold text-green-300">{report.readability_avg || 'Medium'}</p>
                </div>
              </div>

              {/* Missing Headings */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-purple-300 flex items-center gap-2">📌 Missing Headings</h3>
                  <button onClick={() => copyToClipboard(report.missing_headings?.join('\n'))} className="text-xs bg-white/10 px-3 py-1 rounded-full flex items-center gap-1"><Copy size={12}/> Copy</button>
                </div>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                  {report.missing_headings?.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              {/* Competitor Battle Table */}
              {report.competitor_table && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-orange-300 mb-3">⚔️ Top Competitor Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/10 text-gray-400">
                        <tr><th className="text-left p-2">#</th><th className="text-left p-2">Title</th><th className="text-left p-2">Est. Words</th><th className="text-left p-2">Strength</th></tr>
                      </thead>
                      <tbody>
                        {report.competitor_table.map((c, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2">{c.rank}</td>
                            <td className="p-2 truncate max-w-[200px]">{c.title}</td>
                            <td className="p-2">{c.word_count_est || 'N/A'}</td>
                            <td className="p-2 text-xs text-green-300">{c.strength}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Authority Links */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <h3 className="font-bold text-blue-300 mb-2">🔗 Authority Citations</h3>
                <div className="flex flex-wrap gap-2">
                  {report.authority_links?.map((l, i) => (
                    <a key={i} href={l} target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500/40 truncate max-w-[200px]">{l.replace(/^https?:\/\//, '').slice(0, 30)}</a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
