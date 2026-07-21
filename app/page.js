'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileText, Loader2, CheckCircle, Target, 
  TrendingUp, Zap, Lightbulb, Sparkles, Copy, ExternalLink,
  BarChart3, LineChart, DollarSign, BookOpen, Link2, Settings2,
  Users, Search, Database, Code, Network, Shield, Award,
  Hash, Map, Video, Image, FolderTree, Layers, Brain
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

  // ---------- Filter Competitors ----------
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
        if (titleLower.includes('reddit') || titleLower.includes('youtube') || 
            titleLower.includes('facebook') || titleLower.includes('twitter')) {
          return false;
        }
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
    setStatusMessage('⏳ Starting Power Analysis...');

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
        setStatusMessage('✅ Power Report ready from cache!');
        setLoading(false);
        return;
      }

      const reportId = data.reportId;
      setStatusMessage('🔄 Fetching competitor data...');

      let pollCount = 0;
      const maxPolls = 180;

      intervalRef.current = setInterval(async () => {
        pollCount++;
        
        if (pollCount < 10) setStatusMessage('🔍 Analyzing top competitors...');
        else if (pollCount < 20) setStatusMessage('🧠 Generating Power insights...');
        else if (pollCount < 30) setStatusMessage('📊 Extracting NLP keywords & entities...');
        else if (pollCount < 40) setStatusMessage('🔗 Building real-time competitor analysis...');
        else setStatusMessage('⏳ Finalizing Power report...');
        
        setProgress(Math.min(pollCount * 1.2, 95));

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
            setStatusMessage('✅ Power Report ready!');
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              RankForge
            </h1>
            <span className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full border border-purple-500/50 shadow-lg shadow-purple-500/20 animate-pulse">
              POWER EDITION
            </span>
          </div>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Ultimate SEO intelligence with Real-time Competitor Analysis • NLP Keywords • PAA • SERP Analysis • Schema Markup • Internal Links
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
            placeholder='Enter keyword (e.g., "best sports shoes in India")'
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
                <Sparkles size={18} /> Generate Power Report
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

        {/* Power Report */}
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
                    Power Report: <span className="text-white font-mono">{keyword}</span>
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

              {/* ===== NEW V6 FEATURES ===== */}

              {/* 1. REAL-TIME COMPETITOR ANALYSIS */}
              {report.realtime_competitor_analysis && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-red-400 flex items-center gap-2 mb-3">
                    <Users size={18}/> Real-time Competitor Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400">🎯 Market Position:</span> <span className="text-cyan-300">{report.realtime_competitor_analysis.market_position || 'N/A'}</span></div>
                    <div><span className="text-gray-400">⚡ Competitive Edge:</span> <span className="text-green-300">{report.realtime_competitor_analysis.competitive_edge || 'N/A'}</span></div>
                  </div>
                  {report.realtime_competitor_analysis.competitors?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-400 text-xs">Top Competitors:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {report.realtime_competitor_analysis.competitors.map((c, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-lg text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-cyan-300 font-semibold">{c.name || 'N/A'}</span>
                              <span className="text-gray-400">DA: {c.domain_authority || 'N/A'}</span>
                            </div>
                            <div className="text-gray-400">Traffic: {c.traffic || 'N/A'} | Keywords: {c.keyword_count || 'N/A'}</div>
                            <div className="text-gray-400">Backlinks: {c.backlinks || 'N/A'}</div>
                            {c.strengths?.length > 0 && (
                              <div className="text-green-300">✅ {c.strengths.join(', ')}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. NLP KEYWORDS */}
              {report.nlp_keywords && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-purple-300 flex items-center gap-2 mb-3">
                    <Brain size={18}/> NLP Keywords & Semantic Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400">⭐ Primary:</span> <span className="text-cyan-300">{report.nlp_keywords.primary?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📎 Secondary:</span> <span className="text-yellow-300">{report.nlp_keywords.secondary?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🔗 Long Tail:</span> <span className="text-purple-300">{report.nlp_keywords.long_tail?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🧠 LSI Keywords:</span> <span className="text-pink-300">{report.nlp_keywords.lsi?.join(', ') || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* 3. PEOPLE ALSO ASK */}
              {report.people_also_ask?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-orange-300 flex items-center gap-2 mb-3">
                    <Search size={18}/> People Also Ask (Google PAA)
                  </h3>
                  <div className="space-y-3">
                    {report.people_also_ask.slice(0, 4).map((paa, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl">
                        <div className="text-cyan-300 font-medium text-sm">❓ {paa.question || 'N/A'}</div>
                        <div className="text-gray-400 text-xs mt-1">💡 {paa.answer?.substring(0, 150) || 'N/A'}...</div>
                        {paa.related_questions?.length > 0 && (
                          <div className="text-gray-500 text-xs mt-1">Related: {paa.related_questions.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. SERP ANALYSIS */}
              {report.serp_analysis && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-indigo-300 flex items-center gap-2 mb-3">
                    <Layers size={18}/> SERP Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-400">📊 Total Results:</span> <span className="text-cyan-300">{report.serp_analysis.total_results?.toLocaleString() || 'N/A'}</span></div>
                    <div><span className="text-gray-400">💰 Paid Ads:</span> <span className="text-yellow-300">{report.serp_analysis.paid_ads || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📄 Organic Results:</span> <span className="text-green-300">{report.serp_analysis.organic_results_count || 'N/A'}</span></div>
                  </div>
                  {report.serp_analysis.featured_snippet && (
                    <div className="mt-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <span className="text-gray-400 text-xs">⭐ Featured Snippet:</span>
                      <p className="text-cyan-300 text-sm">{report.serp_analysis.featured_snippet.substring(0, 200)}...</p>
                    </div>
                  )}
                </div>
              )}

              {/* 5. SCHEMA MARKUP */}
              {report.schema_markup && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-emerald-300 flex items-center gap-2 mb-3">
                    <Code size={18}/> Schema Markup (JSON-LD)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-400">📄 Article:</span> <button onClick={() => copyToClipboard(report.schema_markup.article || '')} className="text-cyan-300 hover:underline">Copy</button></div>
                    <div><span className="text-gray-400">❓ FAQ:</span> <button onClick={() => copyToClipboard(report.schema_markup.faq || '')} className="text-cyan-300 hover:underline">Copy</button></div>
                    <div><span className="text-gray-400">🛒 Product:</span> <button onClick={() => copyToClipboard(report.schema_markup.product || '')} className="text-cyan-300 hover:underline">Copy</button></div>
                    <div><span className="text-gray-400">📖 How-To:</span> <button onClick={() => copyToClipboard(report.schema_markup.how_to || '')} className="text-cyan-300 hover:underline">Copy</button></div>
                    <div><span className="text-gray-400">🏢 Organization:</span> <button onClick={() => copyToClipboard(report.schema_markup.organization || '')} className="text-cyan-300 hover:underline">Copy</button></div>
                    <div><span className="text-gray-400">📦 Complete:</span> <button onClick={() => copyToClipboard(report.schema_markup.complete_json || '')} className="text-yellow-300 hover:underline">Copy All</button></div>
                  </div>
                </div>
              )}

              {/* 6. INTERNAL LINKS */}
              {report.internal_links?.length > 0 && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-blue-300 flex items-center gap-2 mb-3">
                    <Network size={18}/> Internal Links Suggestions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {report.internal_links.map((link, i) => (
                      <div key={i} className="bg-white/5 p-2 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="text-cyan-300">{link.anchor_text || 'N/A'}</span>
                          <span className="text-gray-400 ml-2">→ {link.target_url || 'N/A'}</span>
                        </div>
                        <span className="text-yellow-300">Relevance: {link.relevance_score || 'N/A'}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CONTENT QUALITY SCORE */}
              {report.content_quality && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-yellow-300 flex items-center gap-2 mb-3">
                    <Award size={18}/> Content Quality Score
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400">🆕 Uniqueness:</span> <span className="text-cyan-300">{report.content_quality.uniqueness || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">📚 Comprehensiveness:</span> <span className="text-green-300">{report.content_quality.comprehensiveness || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">💬 Engagement:</span> <span className="text-yellow-300">{report.content_quality.engagement || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">📖 Readability:</span> <span className="text-purple-300">{report.content_quality.readability_score || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">🔍 SEO Friendliness:</span> <span className="text-pink-300">{report.content_quality.seo_friendliness || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">⭐ Overall Grade:</span> <span className="text-orange-300 font-bold">{report.content_quality.overall_grade || 'N/A'}</span></div>
                  </div>
                  {report.content_quality.improvement_suggestions?.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-yellow-300">💡 Improvement Suggestions:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {report.content_quality.improvement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 8. ENTITY RECOGNITION */}
              {report.entities && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-pink-300 flex items-center gap-2 mb-3">
                    <Hash size={18}/> Entity Recognition
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400">👤 People:</span> <span className="text-cyan-300">{report.entities.people?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🏢 Organizations:</span> <span className="text-green-300">{report.entities.organizations?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📍 Locations:</span> <span className="text-yellow-300">{report.entities.locations?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🛒 Products:</span> <span className="text-purple-300">{report.entities.products?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📅 Dates:</span> <span className="text-orange-300">{report.entities.dates?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🧠 Concepts:</span> <span className="text-pink-300">{report.entities.concepts?.join(', ') || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* ===== EXISTING FEATURES ===== */}

              {/* Readability Score */}
              {report.readability_score && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-blue-300 flex items-center gap-2 mb-3">
                    <BookOpen size={18}/> Readability Score
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-400">Flesch-Kincaid:</span> <span className="text-cyan-300">{report.readability_score.flesch_kincaid || 'N/A'}</span></div>
                    <div><span className="text-gray-400">Grade Level:</span> <span className="text-yellow-300">{report.readability_score.grade_level || 'N/A'}</span></div>
                    <div><span className="text-gray-400">Sentence Length:</span> <span className="text-purple-300">{report.readability_score.sentence_length || 'N/A'} words</span></div>
                    <div><span className="text-gray-400">Word Complexity:</span> <span className="text-pink-300">{report.readability_score.word_complexity || 'N/A'}</span></div>
                  </div>
                  {report.readability_score.recommendations?.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-yellow-300">💡 Recommendations:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {report.readability_score.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Trend Forecast */}
              {report.trend_forecast && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-orange-300 flex items-center gap-2 mb-3">
                    <LineChart size={18}/> Trend Forecast
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400">📈 Growth:</span> <span className="text-green-300">{report.trend_forecast.growth || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📅 Seasonality:</span> <span className="text-cyan-300">{report.trend_forecast.seasonality || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📊 Peak Months:</span> <span className="text-yellow-300">{report.trend_forecast.peak_months?.join(', ') || 'N/A'}</span></div>
                  </div>
                  {report.trend_forecast.strategy && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-purple-300">🎯 Strategy:</span> {report.trend_forecast.strategy}
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Intelligence */}
              {report.pricing_intelligence && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-green-300 flex items-center gap-2 mb-3">
                    <DollarSign size={18}/> Pricing Intelligence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400">💰 Average Price:</span> <span className="text-cyan-300">{report.pricing_intelligence.average_price || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📊 Price Range:</span> <span className="text-yellow-300">{report.pricing_intelligence.price_range || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🏷️ Value for Money:</span> <span className="text-green-300">{report.pricing_intelligence.value_for_money || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* Content Requirements */}
              {report.content_requirements && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-purple-300 flex items-center gap-2 mb-3">
                    <Settings2 size={18}/> Content Requirements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-400">📝 Words:</span> <span className="text-cyan-300">{report.content_requirements.recommended_words || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📏 Min-Max:</span> <span className="text-yellow-300">{report.content_requirements.min_words || 'N/A'} - {report.content_requirements.max_words || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🖼️ Images:</span> <span className="text-purple-300">{report.content_requirements.images_needed || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🎬 Media:</span> <span className="text-pink-300">{report.content_requirements.media_format || 'N/A'}</span></div>
                  </div>
                  {report.content_requirements.video_suggestions?.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-orange-300">🎥 Video Suggestions:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {report.content_requirements.video_suggestions.map((v, i) => <li key={i}>{v}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Keyword Metrics */}
              {report.keyword_metrics && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-3">
                    <BarChart3 size={18}/> Keyword Volume & Difficulty
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-400">🔍 Search Volume:</span> <span className="text-green-300">{report.keyword_metrics.search_volume || 'N/A'}</span></div>
                    <div><span className="text-gray-400">📊 Difficulty:</span> <span className="text-yellow-300">{report.keyword_metrics.difficulty || 'N/A'}/100</span></div>
                    <div><span className="text-gray-400">💰 CPC:</span> <span className="text-cyan-300">${report.keyword_metrics.cpc || 'N/A'}</span></div>
                    <div><span className="text-gray-400">🏆 Competition:</span> <span className="text-pink-300">{report.keyword_metrics.competition || 'N/A'}</span></div>
                  </div>
                  {report.keyword_metrics.related_keywords?.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-purple-300">🔗 Related Keywords:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {report.keyword_metrics.related_keywords.map((k, i) => (
                          <span key={i} className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Backlink Gap */}
              {report.backlink_gap && (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-indigo-300 flex items-center gap-2 mb-3">
                    <Link2 size={18}/> Backlink Gap Analysis
                  </h3>
                  {report.backlink_gap.competitor_backlinks?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-gray-400 text-xs">Competitor Backlink Profile:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                        {report.backlink_gap.competitor_backlinks.map((b, i) => (
                          <div key={i} className="bg-white/5 p-2 rounded-lg text-xs">
                            <div className="text-cyan-300 truncate">{b.domain || 'N/A'}</div>
                            <div className="text-gray-400">Backlinks: {b.backlinks || 'N/A'} | DA: {b.da || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.backlink_gap.backlink_opportunities?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-400 text-xs">💡 Backlink Opportunities:</span>
                      <ul className="list-disc pl-5 text-sm text-yellow-300">
                        {report.backlink_gap.backlink_opportunities.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Content Strategy */}
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

              {/* FAQ - Top 4 */}
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
                    <span className="text-xs text-gray-400">*Social media filtered out</span>
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
                          <td className="p-2 truncate max-w-[200px]">{c.title}</td>
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

              <p className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
                RankForge Power Edition v6.0 | 8 Advanced Features: Real-time Competitor, NLP, PAA, SERP, Schema, Internal Links, Quality Score, Entities
                <br />
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
            <div className="text-7xl mb-4">⚡</div>
            <p className="text-xl font-semibold text-gray-300">Enter a keyword to generate a Power SEO brief</p>
            <p className="text-sm text-gray-600 mt-2">8 Advanced Features • Real-time Competitor • NLP • PAA • SERP • Schema • Internal Links • Quality Score • Entities</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
