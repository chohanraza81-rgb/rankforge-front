'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileText, Loader2, CheckCircle, Target, 
  TrendingUp, Zap, Lightbulb, Sparkles, Shield, 
  ChevronRight, Copy, ExternalLink 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ---------- PDF Export ----------
  const exportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`RankForge-Report-${keyword.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  // ---------- Copy to Clipboard ----------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // ---------- Filter Competitors (Remove Social Media) ----------
  const filterCompetitors = (competitors) => {
    if (!competitors || !Array.isArray(competitors)) return [];
    
    const blacklist = [
      'reddit.com', 'youtube.com', 'youtu.be', 'facebook.com', 'fb.com',
      'instagram.com', 'twitter.com', 'x.com', 'tiktok.com', 'linkedin.com',
      'quora.com', 'pinterest.com', 'medium.com'
    ];

    return competitors.filter(comp => {
      if (comp.link) {
        const linkLower = comp.link.toLowerCase();
        for (const domain of blacklist) {
          if (linkLower.includes(domain)) return false;
        }
      }
      if (comp.title) {
        const titleLower = comp.title.toLowerCase();
        if (titleLower.includes('reddit') || titleLower.includes('youtube')) return false;
      }
      return true;
    });
  };

  // ---------- Handle Generate ----------
  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setReport(null);
    setError('');
    setStatusMessage('⏳ Starting premium analysis...');

    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        setError('API URL is not configured.');
        setLoading(false);
        return;
      }

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

      if (data.cached) {
        const filteredData = { ...data.data };
        if (filteredData.competitor_table) {
          filteredData.competitor_table = filterCompetitors(filteredData.competitor_table);
        }
        setReport(filteredData);
        setProgress(100);
        setStatusMessage('✅ Report ready from cache!');
        setLoading(false);
        return;
      }

      const reportId = data.reportId;
      setStatusMessage('🔄 Fetching competitor data...');

      let pollCount = 0;
      const maxPolls = 120;

      intervalRef.current = setInterval(async () => {
        pollCount++;
        
        if (pollCount < 10) setStatusMessage('🔍 Analyzing top competitors...');
        else if (pollCount < 20) setStatusMessage('🧠 Generating premium insights...');
        else setStatusMessage('⏳ Finalizing premium report...');
        
        setProgress(Math.min(pollCount * 1.5, 95));

        try {
          const statusRes = await fetch(`${baseUrl}/report/${reportId}`);
          if (!statusRes.ok) throw new Error('Status check failed');

          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            const filteredData = { ...statusData.data };
            if (filteredData.competitor_table) {
              filteredData.competitor_table = filterCompetitors(filteredData.competitor_table);
            }
            setReport(filteredData);
            setProgress(100);
            setStatusMessage('✅ Premium report ready!');
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else if (statusData.status === 'failed') {
            setError(`❌ ${statusData.errorMessage || 'Report generation failed.'}`);
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          } else if (pollCount >= maxPolls) {
            setError('⏰ Generation is taking too long. Please try again.');
            setLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);

    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              RankForge
            </h1>
            <span className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full border border-purple-500/50 shadow-lg shadow-purple-500/20 animate-pulse">
              V4 ENTERPRISE
            </span>
          </div>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Enterprise-grade SEO intelligence. AI analyzes competitors, finds gaps, and delivers actionable strategies.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder='Enter keyword (e.g., "best cars in Pakistan")'
            className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-400 transition"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform rounded-2xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Brief
              </>
            )}
          </button>
        </motion.div>

        {/* Status & Progress */}
        <AnimatePresence>
          {statusMessage && loading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 text-sm text-cyan-300 text-center"
            >
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {loading && (
          <div className="mb-8 space-y-2">
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">{progress}% complete</p>
          </div>
        )}

        {/* Premium Report */}
        <AnimatePresence>
          {report && (
            <motion.div 
              ref={reportRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 space-y-6"
            >
              {/* Report Header */}
              <div className="flex flex-wrap gap-3 justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-green-400">
                    Premium Report: <span className="text-white font-mono">{keyword}</span>
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={exportPDF} 
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    <FileText size={16} /> Export PDF
                  </button>
                  <button 
                    onClick={() => window.print()} 
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2"
                  >
                    <Download size={16} /> Print
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><Target size={14}/> Search Intent</p>
                  <p className="text-xl font-bold text-cyan-300 mt-1">{report.keyword_intent || 'Informational'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><TrendingUp size={14}/> Content Score</p>
                  <p className="text-xl font-bold text-yellow-300 mt-1">{report.content_score || 85}/100</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><Zap size={14}/> Readability</p>
                  <p className="text-xl font-bold text-green-300 mt-1">{report.readability_avg || 'Medium'}</p>
                </div>
              </div>

              {/* Content Recommendations */}
              {report.content_recommendations && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 rounded-2xl border border-purple-500/20">
                  <h3 className="font-bold text-purple-300 flex items-center gap-2 mb-3">
                    <Lightbulb size={18}/> Content Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400">📌 Title:</span> {report.content_recommendations.title || 'N/A'}</div>
                    <div><span className="text-gray-400">📝 Meta:</span> {report.content_recommendations.meta_description || 'N/A'}</div>
                    <div><span className="text-gray-400">🎯 Audience:</span> {report.content_recommendations.target_audience || 'N/A'}</div>
                    <div><span className="text-gray-400">📄 Length:</span> {report.content_recommendations.content_length || 'N/A'}</div>
                    <div><span className="text-gray-400">🎤 Tone:</span> {report.content_recommendations.tone || 'N/A'}</div>
                    <div className="md:col-span-2">
                      <span className="text-gray-400">💡 SEO Tips:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {report.content_recommendations.seo_tips?.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Missing Headings */}
              {report.missing_headings?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-purple-300 mb-3">📌 Missing Headings (Content Gaps)</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                    {report.missing_headings.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}

              {/* FAQ - Only 4 */}
              {report.faq_questions?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-yellow-300">❓ FAQ Schema (Top 4)</h3>
                    <button 
                      onClick={() => copyToClipboard(report.faq_questions.slice(0, 4).join('\n'))}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      {copied ? <CheckCircle size={12} className="text-green-400"/> : <Copy size={12}/>}
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                    {report.faq_questions.slice(0, 4).map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                  {report.faq_questions.length > 4 && (
                    <p className="text-xs text-gray-500 mt-2">Showing 4 out of {report.faq_questions.length} questions</p>
                  )}
                </div>
              )}

              {/* Competitor Battle - Filtered */}
              {report.competitor_table?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 overflow-x-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-orange-300">🏆 Competitor Battle Card</h3>
                    <span className="text-xs text-gray-400">*Social media removed</span>
                  </div>
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-gray-400">
                        <th className="p-2">Rank</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Strength</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.competitor_table.map((c, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-cyan-300">#{c.rank}</td>
                          <td className="p-2 truncate max-w-[180px]">{c.title}</td>
                          <td className="p-2 text-green-300 text-xs">{c.strength}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Authority Links */}
              {report.authority_links?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-blue-300 mb-3">🔗 Authority Citations</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.authority_links.map((l, i) => (
                      <a 
                        key={i} 
                        href={l} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs bg-blue-500/20 hover:bg-blue-500/40 px-3 py-1.5 rounded-full transition truncate max-w-[250px] border border-blue-500/20 flex items-center gap-1"
                      >
                        {l.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 30)}
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Metadata */}
              {report.seo_metadata && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-emerald-300">🏷️ SEO Metadata</h3>
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(report.seo_metadata, null, 2))}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Copy size={12}/> Copy All
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Title Tag:</span> {report.seo_metadata.title_tag || 'N/A'}</div>
                    <div><span className="text-gray-400">Meta Description:</span> {report.seo_metadata.meta_description || 'N/A'}</div>
                    <div><span className="text-gray-400">URL Slug:</span> {report.seo_metadata.url_slug || 'N/A'}</div>
                    <div><span className="text-gray-400">Focus Keyword:</span> <span className="text-yellow-300">{report.seo_metadata.focus_keyword || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <p className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
                ⚠️ Do not copy-paste raw data. Use these human-edited insights to create original content.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && !report && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-20 text-gray-500"
          >
            <div className="text-7xl mb-4">🧠</div>
            <p className="text-xl font-semibold text-gray-300">Enter a keyword to generate a premium SEO brief</p>
            <p className="text-sm text-gray-600 mt-2">Powered by GROQ, SerpAPI, and MongoDB</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
