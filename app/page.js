'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, FileText, Loader2, CheckCircle, Target, 
  TrendingUp, Zap, Lightbulb, Sparkles, Copy, ExternalLink,
  BarChart3, LineChart, DollarSign, BookOpen, Link2, Settings2,
  Users, Search, Database, Code, Network, Shield, Award,
  Hash, Map, Video, Image, FolderTree, Layers, Brain,
  Compass, Globe, Clock, Star, ThumbsUp, MessageSquare,
  Share2, Eye, PenTool, FileCheck, AlertTriangle, RefreshCw
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
  const [activeTab, setActiveTab] = useState('overview');
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
    setStatusMessage('⏳ Starting ULTIMATE analysis...');

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
        setStatusMessage('✅ ULTIMATE Report ready from cache!');
        setLoading(false);
        return;
      }

      const reportId = data.reportId;
      setStatusMessage('🔄 Fetching competitor data...');

      let pollCount = 0;
      const maxPolls = 180;

      intervalRef.current = setInterval(async () => {
        pollCount++;
        
        if (pollCount < 10) setStatusMessage('🔍 Analyzing Top 10 competitors...');
        else if (pollCount < 20) setStatusMessage('🧠 Extracting NLP entities & topics...');
        else if (pollCount < 30) setStatusMessage('📊 Analyzing search intent & EEAT...');
        else if (pollCount < 40) setStatusMessage('🔗 Building topical authority map...');
        else if (pollCount < 50) setStatusMessage('⚡ Finding featured snippet opportunities...');
        else setStatusMessage('⏳ Finalizing ULTIMATE report...');
        
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
            setStatusMessage('✅ ULTIMATE Report ready!');
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

  // ---------- Tabs ----------
  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: <Eye size={14} /> },
    { id: 'intent', label: '🎯 Intent', icon: <Target size={14} /> },
    { id: 'serp', label: '🔍 SERP', icon: <Search size={14} /> },
    { id: 'nlp', label: '🧠 NLP', icon: <Brain size={14} /> },
    { id: 'topical', label: '🗺️ Topical', icon: <Compass size={14} /> },
    { id: 'eeat', label: '🛡️ EEAT', icon: <Shield size={14} /> },
    { id: 'snippet', label: '⭐ Snippet', icon: <Star size={14} /> },
    { id: 'brief', label: '📝 Brief', icon: <PenTool size={14} /> },
    { id: 'schema', label: '💻 Schema', icon: <Code size={14} /> },
    { id: 'backlink', label: '🔗 Backlink', icon: <Link2 size={14} /> },
  ];

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
              ULTIMATE V7
            </span>
          </div>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            14 ULTIMATE Features: AI Intent • SERP Analysis • NLP • Topical Map • Internal Links • EEAT • Featured Snippet • AI Overview • PAA • Content Brief • Schema • Cannibalization • Brand Backlink • Freshness
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
                Analyzing 14 Features...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate ULTIMATE Report
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

        {/* ULTIMATE Report */}
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
                    ULTIMATE Report: <span className="text-white font-mono">{keyword}</span>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><Target size={14}/> Intent</p>
                  <p className="text-xl font-bold text-cyan-300 mt-1">{report.keyword_intent || 'N/A'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><TrendingUp size={14}/> Content Score</p>
                  <p className="text-xl font-bold text-yellow-300 mt-1">{report.content_score || 'N/A'}/100</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><Zap size={14}/> Readability</p>
                  <p className="text-xl font-bold text-green-300 mt-1">{report.readability_avg || 'N/A'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-xs flex items-center gap-1"><Shield size={14}/> EEAT Score</p>
                  <p className="text-xl font-bold text-purple-300 mt-1">{report.eeat_score?.overall_score || 'N/A'}/100</p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1 ${
                      activeTab === tab.id 
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                
                {/* ===== TAB 1: OVERVIEW ===== */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-cyan-300">{report.keyword_metrics?.search_volume || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Search Volume</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-yellow-300">{report.keyword_metrics?.difficulty || 'N/A'}/100</div>
                        <div className="text-xs text-gray-400">Difficulty</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-300">{report.full_serp_analysis?.total_results?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Total Results</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-300">{report.full_serp_analysis?.paid_ads || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Paid Ads</div>
                      </div>
                    </div>

                    {/* Missing Headings */}
                    {report.missing_headings?.length > 0 && (
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-purple-300 mb-3">📌 Missing Headings (Content Gaps)</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                          {report.missing_headings.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
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
                  </div>
                )}

                {/* ===== TAB 2: AI SEARCH INTENT ===== */}
                {activeTab === 'intent' && report.search_intent_analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-cyan-300">{report.search_intent_analysis.intent_type || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Intent Type</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-yellow-300">{report.search_intent_analysis.confidence_score || 'N/A'}%</div>
                        <div className="text-xs text-gray-400">Confidence Score</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-green-300">{report.search_intent_analysis.buyer_stage || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Buyer Stage</div>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-gray-400 text-sm">🎯 User Goal:</span>
                      <p className="text-cyan-300 mt-1">{report.search_intent_analysis.user_goal || 'N/A'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-gray-400 text-sm">📋 Sub-Intents:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {report.search_intent_analysis.sub_intents?.map((s, i) => (
                          <span key={i} className="bg-purple-500/20 px-3 py-1 rounded-full text-xs border border-purple-500/30">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-gray-400 text-sm">📄 Content Type:</span>
                      <p className="text-yellow-300 mt-1">{report.search_intent_analysis.content_type || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* ===== TAB 3: FULL SERP ANALYSIS ===== */}
                {activeTab === 'serp' && report.full_serp_analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-cyan-300">{report.full_serp_analysis.total_results?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Total Results</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-yellow-300">{report.full_serp_analysis.paid_ads || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Paid Ads</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-green-300">{report.full_serp_analysis.organic_results?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Organic Results</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-purple-300">{report.full_serp_analysis.serp_features?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">SERP Features</div>
                      </div>
                    </div>

                    {report.full_serp_analysis.featured_snippet && (
                      <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                        <span className="text-gray-400 text-sm">⭐ Featured Snippet:</span>
                        <p className="text-cyan-300 mt-1">{report.full_serp_analysis.featured_snippet.substring(0, 300)}...</p>
                      </div>
                    )}

                    {report.full_serp_analysis.knowledge_panel && (
                      <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                        <span className="text-gray-400 text-sm">📋 Knowledge Panel:</span>
                        <p className="text-blue-300 mt-1">{report.full_serp_analysis.knowledge_panel}</p>
                      </div>
                    )}

                    {report.full_serp_analysis.organic_results?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📊 Top 10 Organic Results:</span>
                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                          {report.full_serp_analysis.organic_results.slice(0, 10).map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs bg-white/5 p-2 rounded-lg">
                              <span className="text-cyan-300 font-bold">#{r.rank}</span>
                              <div className="flex-1">
                                <div className="text-white truncate">{r.title}</div>
                                <div className="text-gray-400 truncate">{r.domain}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 4: NLP & ENTITY EXTRACTION ===== */}
                {activeTab === 'nlp' && report.nlp_entity_extraction && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-cyan-300">{report.nlp_entity_extraction.entities?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Entities Found</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-yellow-300">{report.nlp_entity_extraction.key_phrases?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Key Phrases</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-green-300">{report.nlp_entity_extraction.sentiment_score || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Sentiment Score</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-xl font-bold text-purple-300">{report.nlp_entity_extraction.language || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Language</div>
                      </div>
                    </div>

                    {report.nlp_entity_extraction.entities?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">🔍 Entities:</span>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {report.nlp_entity_extraction.entities.map((e, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                              <span className="text-cyan-300">{e.name}</span>
                              <span className="text-gray-400">{e.type} • Salience: {(e.salience * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.nlp_entity_extraction.key_phrases?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📝 Key Phrases:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.nlp_entity_extraction.key_phrases.map((p, i) => (
                            <span key={i} className="bg-purple-500/20 px-3 py-1 rounded-full text-xs border border-purple-500/30">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 5: TOPICAL AUTHORITY MAP ===== */}
                {activeTab === 'topical' && report.topical_authority_map && (
                  <div className="space-y-4">
                    {report.topical_authority_map.core_topics?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.topical_authority_map.core_topics.map((t, i) => (
                          <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-cyan-300">{t.topic}</span>
                              <span className="text-xs text-yellow-300">Authority: {t.authority_score}/100</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Coverage: {t.coverage_score}% • Gap: {t.gap_score}%</div>
                            {t.recommendations?.length > 0 && (
                              <div className="mt-2 text-xs text-green-300">💡 {t.recommendations.join(', ')}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {report.topical_authority_map.topic_clusters?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📊 Topic Clusters:</span>
                        <div className="mt-2 space-y-2">
                          {report.topical_authority_map.topic_clusters.map((c, i) => (
                            <div key={i} className="bg-white/5 p-2 rounded-lg text-xs">
                              <span className="text-cyan-300 font-semibold">{c.cluster_name}</span>
                              <span className="text-gray-400 ml-2">({c.priority})</span>
                              <div className="text-gray-400">{c.keywords?.join(', ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 6: EEAT SCORE ===== */}
                {activeTab === 'eeat' && report.eeat_score && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-cyan-300">{report.eeat_score.experience || 'N/A'}/100</div>
                        <div className="text-xs text-gray-400">💪 Experience</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-yellow-300">{report.eeat_score.expertise || 'N/A'}/100</div>
                        <div className="text-xs text-gray-400">🧠 Expertise</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-purple-300">{report.eeat_score.authoritativeness || 'N/A'}/100</div>
                        <div className="text-xs text-gray-400">🏆 Authoritativeness</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-green-300">{report.eeat_score.trustworthiness || 'N/A'}/100</div>
                        <div className="text-xs text-gray-400">🛡️ Trustworthiness</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-5 rounded-2xl border border-green-500/20 text-center">
                      <div className="text-3xl font-bold text-green-400">{report.eeat_score.overall_score || 'N/A'}/100</div>
                      <div className="text-gray-400">Overall EEAT Score • Grade: <span className="text-yellow-300">{report.eeat_score.grade || 'N/A'}</span></div>
                    </div>
                    {report.eeat_score.recommendations?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">💡 Recommendations:</span>
                        <ul className="list-disc pl-5 mt-1 text-sm text-cyan-300">
                          {report.eeat_score.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 7: FEATURED SNIPPET ===== */}
                {activeTab === 'snippet' && report.featured_snippet_opportunities && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-cyan-300">{report.featured_snippet_opportunities.eligibility_score || 'N/A'}%</div>
                        <div className="text-xs text-gray-400">Eligibility Score</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-yellow-300">{report.featured_snippet_opportunities.format_type || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Format Type</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-green-300">{report.featured_snippet_opportunities.priority || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Priority</div>
                      </div>
                    </div>

                    {report.featured_snippet_opportunities.current_snippet && (
                      <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                        <span className="text-gray-400 text-sm">📋 Current Snippet:</span>
                        <p className="text-cyan-300 mt-1">{report.featured_snippet_opportunities.current_snippet}</p>
                      </div>
                    )}

                    {report.featured_snippet_opportunities.optimization_tips?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">⚡ Optimization Tips:</span>
                        <ul className="list-disc pl-5 mt-1 text-sm text-yellow-300">
                          {report.featured_snippet_opportunities.optimization_tips.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 8: CONTENT BRIEF ===== */}
                {activeTab === 'brief' && report.content_brief && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 rounded-2xl border border-purple-500/20">
                      <h3 className="font-bold text-purple-300 mb-2">📝 {report.content_brief.title || 'N/A'}</h3>
                      <p className="text-gray-400 text-sm">{report.content_brief.meta_description || 'N/A'}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs">
                        <span className="bg-white/5 px-3 py-1 rounded-full">🎯 {report.content_brief.target_audience || 'N/A'}</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full">📄 {report.content_brief.content_goal || 'N/A'}</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full">📊 {report.content_brief.word_count_recommendation || 'N/A'} words</span>
                      </div>
                    </div>

                    {report.content_brief.h2_headings?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📌 H2 Headings:</span>
                        <div className="mt-2 space-y-2">
                          {report.content_brief.h2_headings.map((h, i) => (
                            <div key={i} className="bg-white/5 p-2 rounded-lg text-xs">
                              <span className="text-cyan-300 font-semibold">{h.heading}</span>
                              <span className="text-gray-400 ml-2">({h.priority})</span>
                              <div className="text-gray-400">{h.key_points?.join(', ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.content_brief.h3_subheadings?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📎 H3 Subheadings:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.content_brief.h3_subheadings.map((h, i) => (
                            <span key={i} className="bg-purple-500/20 px-3 py-1 rounded-full text-xs border border-purple-500/30">{h.heading}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.content_brief.recommended_sections?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📋 Recommended Sections:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.content_brief.recommended_sections.map((s, i) => (
                            <span key={i} className="bg-blue-500/20 px-3 py-1 rounded-full text-xs border border-blue-500/30">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 9: SCHEMA GENERATOR ===== */}
                {activeTab === 'schema' && report.schema_generator && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['faq', 'product', 'review', 'how_to', 'article', 'local_business'].map((type) => (
                        report.schema_generator[type] && (
                          <div key={type} className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                            <div className="text-xs text-gray-400 uppercase">{type.replace('_', ' ')}</div>
                            <button 
                              onClick={() => copyToClipboard(report.schema_generator[type])}
                              className="text-cyan-300 text-xs hover:underline mt-1 flex items-center justify-center gap-1"
                            >
                              <Copy size={12}/> Copy
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                    {report.schema_generator.complete_json && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">📦 Complete JSON-LD:</span>
                          <button onClick={() => copyToClipboard(report.schema_generator.complete_json)} className="text-cyan-300 text-xs hover:underline flex items-center gap-1">
                            <Copy size={12}/> Copy All
                          </button>
                        </div>
                        <pre className="text-xs text-gray-300 mt-2 overflow-x-auto bg-black/30 p-3 rounded-lg max-h-40 overflow-y-auto">
                          {report.schema_generator.complete_json.substring(0, 500)}...
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== TAB 10: BACKLINK ===== */}
                {activeTab === 'backlink' && report.brand_backlink_analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-cyan-300">{report.brand_backlink_analysis.total_opportunities || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Total Opportunities</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-yellow-300">{report.brand_backlink_analysis.brand_mentions?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Brand Mentions</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-bold text-green-300">{report.brand_backlink_analysis.backlink_gap?.length || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Backlink Gap</div>
                      </div>
                    </div>

                    {report.brand_backlink_analysis.backlink_gap?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">🔗 Backlink Gap Analysis:</span>
                        <div className="mt-2 space-y-2">
                          {report.brand_backlink_analysis.backlink_gap.map((g, i) => (
                            <div key={i} className="bg-white/5 p-2 rounded-lg text-xs">
                              <span className="text-cyan-300 font-semibold">{g.competitor}</span>
                              <span className="text-gray-400 ml-2">Backlinks: {g.backlinks}</span>
                              <span className="text-yellow-300 ml-2">Opportunity: {g.opportunity_score}/100</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.brand_backlink_analysis.brand_mentions?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-gray-400 text-sm">📢 Brand Mentions:</span>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {report.brand_backlink_analysis.brand_mentions.map((m, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                              <span className="text-cyan-300">{m.source}</span>
                              <span className={`px-2 py-0.5 rounded-full ${
                                m.sentiment === 'Positive' ? 'bg-green-500/20 text-green-300' :
                                m.sentiment === 'Negative' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>{m.sentiment || 'Neutral'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== COMMON FEATURES (Always Visible) ===== */}

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

                {/* Footer */}
                <p className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
                  RankForge ULTIMATE Edition v7.0 | 14 Enterprise Features: AI Intent • SERP • NLP • Topical • Internal Links • EEAT • Snippet • AI Overview • PAA • Content Brief • Schema • Cannibalization • Brand Backlink • Freshness
                  <br />
                  ⚠️ Do not copy-paste raw data. Use these human-edited insights to create original content.
                </p>
              </div>
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
            <p className="text-xl font-semibold text-gray-300">Enter a keyword to generate an ULTIMATE SEO brief</p>
            <p className="text-sm text-gray-600 mt-2">14 Advanced Features • AI Intent • SERP • NLP • Topical • EEAT • Snippet • Schema • Backlink</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
