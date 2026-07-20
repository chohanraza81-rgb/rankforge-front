'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  Download, FileText, Loader2, CheckCircle, Target, TrendingUp, 
  Zap, Lightbulb, Link, Award, Sparkles, BarChart3, Globe,
  ArrowUpRight, Clock, TrendingDown, Users, ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const intervalRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
        setReport(data.data);
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
        else if (pollCount < 30) setStatusMessage('📊 Analyzing keyword volume & backlinks...');
        else setStatusMessage('⏳ Finalizing premium report...');
        
        setProgress(Math.min(pollCount * 1.5, 95));

        try {
          const statusRes = await fetch(`${baseUrl}/report/${reportId}`);
          if (!statusRes.ok) throw new Error('Status check failed');

          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            setReport(statusData.data);
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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text inline-block">
            RankForge
          </h1>
          <span className="ml-3 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full border border-purple-500/50 shadow-lg shadow-purple-500/20">
            ENTERPRISE v3.5
          </span>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Enterprise-grade SEO intelligence. Keyword Volume, Backlink Gap, Competitor Analysis & Content Strategy.
          </p>
        </div>

        {/* Input Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              '🚀 Generate Brief'
            )}
          </button>
        </div>

        {/* Status & Progress */}
        {statusMessage && loading && (
          <div className="mb-3 text-sm text-cyan-300 text-center">{statusMessage}</div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="mb-8 space-y-2">
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-right">{progress}% complete</p>
          </div>
        )}

        {/* Premium Report */}
        {report && (
          <div ref={reportRef} className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap gap-3 justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-semibold text-green-400">
                  Premium Report: <span className="text-white font-mono">{keyword}</span>
                </h2>
              </div>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30">
                  <FileText size={16} /> Export PDF
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2">
                  <Download size={16} /> Print
                </button>
              </div>
            </div>

            {/* Stats */}
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

            {/* 🆕 Keyword Volume Section */}
            {report.keyword_volume && (
              <div className="bg-white/5 p-5 rounded-2xl border border-cyan-500/20">
                <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-3">
                  <BarChart3 size={18}/> Keyword Volume & Difficulty
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <p className="text-gray-400 text-xs">Search Volume</p>
                    <p className="text-xl font-bold text-cyan-300">
                      {report.keyword_volume.search_volume?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <p className="text-gray-400 text-xs">Keyword Difficulty</p>
                    <p className="text-xl font-bold text-yellow-300">
                      {report.keyword_volume.keyword_difficulty}/100
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <p className="text-gray-400 text-xs">CPC (USD)</p>
                    <p className="text-xl font-bold text-green-300">
                      ${report.keyword_volume.cpc}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <p className="text-gray-400 text-xs">Competition</p>
                    <p className={`text-xl font-bold ${
                      report.keyword_volume.competition === 'Low' ? 'text-green-300' :
                      report.keyword_volume.competition === 'Medium' ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {report.keyword_volume.competition}
                    </p>
                  </div>
                </div>
                
                {/* Trend Chart */}
                {report.keyword_volume.trend && (
                  <div className="mt-3 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.keyword_volume.trend.map((v, i) => ({ 
                        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] || `M${i+1}`,
                        volume: v
                      }))}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        <Bar dataKey="volume">
                          {report.keyword_volume.trend.map((_, i) => (
                            <Cell key={i} fill={i === report.keyword_volume.trend.length - 1 ? '#8b5cf6' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 text-center">6-month search volume trend</p>
                  </div>
                )}
                
                {/* Related Keywords */}
                {report.keyword_volume.related_keywords && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-2">🔑 Related Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.keyword_volume.related_keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🆕 Backlink Gap Section */}
            {report.backlink_gap && (
              <div className="bg-white/5 p-5 rounded-2xl border border-orange-500/20">
                <h3 className="font-bold text-orange-300 flex items-center gap-2 mb-3">
                  <Link size={18}/> Backlink Gap Analysis
                </h3>
                
                {/* Competitor Backlinks */}
                {report.backlink_gap.competitor_backlinks && report.backlink_gap.competitor_backlinks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">🔗 Competitor Backlink Profile:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {report.backlink_gap.competitor_backlinks.map((comp, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="font-mono text-xs text-cyan-300 truncate">{comp.domain}</p>
                          <div className="flex justify-between mt-1 text-sm">
                            <span className="text-gray-400">Backlinks: <span className="text-white">{comp.backlink_count}</span></span>
                            <span className="text-gray-400">DA: <span className="text-yellow-300">{comp.domain_authority}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Gap Opportunities */}
                {report.backlink_gap.gap_opportunities && report.backlink_gap.gap_opportunities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">🎯 Backlink Opportunities:</p>
                    <div className="space-y-2">
                      {report.backlink_gap.gap_opportunities.map((opp, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-purple-300">{opp.source}</p>
                              <p className="text-xs text-gray-400">{opp.type} — {opp.reason}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              opp.priority === 'High' ? 'bg-green-500/20 text-green-300' :
                              opp.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {opp.priority || 'Medium'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommendations */}
                {report.backlink_gap.backlink_recommendations && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-4 rounded-xl border border-orange-500/20">
                    <h4 className="font-bold text-amber-300 text-sm mb-2">💡 Backlink Strategy</h4>
                    <p className="text-sm text-gray-300">{report.backlink_gap.backlink_recommendations.strategy}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div className="bg-white/5 p-2 rounded-lg text-center">
                        <p className="text-gray-400 text-xs">Estimated Cost</p>
                        <p className="text-sm text-gray-300">{report.backlink_gap.backlink_recommendations.estimated_cost}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg text-center">
                        <p className="text-gray-400 text-xs">Expected Impact</p>
                        <p className="text-sm text-gray-300">{report.backlink_gap.estimated_authority_gain || 'High'}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg text-center">
                        <p className="text-gray-400 text-xs">Total Opportunities</p>
                        <p className="text-sm text-gray-300">{report.backlink_gap.total_backlink_opportunities || '10+'}</p>
                      </div>
                    </div>
                    
                    {/* Priority Links */}
                    {report.backlink_gap.backlink_recommendations.priority_links && report.backlink_gap.backlink_recommendations.priority_links.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-xs mb-1">🎯 Priority Links to Acquire:</p>
                        <div className="flex flex-wrap gap-2">
                          {report.backlink_gap.backlink_recommendations.priority_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500/40 transition truncate max-w-[200px]">
                              {link.replace(/^https?:\/\//, '').slice(0, 30)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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

            {/* FAQ */}
            {report.faq_questions?.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <h3 className="font-bold text-yellow-300 mb-3">❓ FAQ Schema</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-sm">
                  {report.faq_questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}

            {/* Competitor Table */}
            {report.competitor_table?.length > 0 && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 overflow-x-auto">
                <h3 className="font-bold text-orange-300 mb-3">🏆 Competitor Battle Card</h3>
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
                    <a key={i} href={l} target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 hover:bg-blue-500/40 px-3 py-1.5 rounded-full transition truncate max-w-[250px] border border-blue-500/20">
                      {l.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 30)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Metadata */}
            {report.seo_metadata && (
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <h3 className="font-bold text-emerald-300 mb-3">🏷️ SEO Metadata</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Title Tag:</span> {report.seo_metadata.title_tag || 'N/A'}</div>
                  <div><span className="text-gray-400">Meta Description:</span> {report.seo_metadata.meta_description || 'N/A'}</div>
                  <div><span className="text-gray-400">URL Slug:</span> {report.seo_metadata.url_slug || 'N/A'}</div>
                  <div><span className="text-gray-400">Focus Keyword:</span> <span className="text-yellow-300">{report.seo_metadata.focus_keyword || 'N/A'}</span></div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
              ⚠️ Do not copy-paste raw data. Use these human-edited insights to create original content.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !report && !error && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-7xl mb-4">🧠</div>
            <p className="text-xl font-semibold text-gray-300">Enter a keyword to generate a premium SEO brief</p>
            <p className="text-sm text-gray-600 mt-2">Powered by GROQ, SerpAPI, and MongoDB</p>
          </div>
        )}
      </div>
    </div>
  );
}
