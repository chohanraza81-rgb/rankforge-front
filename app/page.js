'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, CheckCircle, Target, TrendingUp, Zap, Sparkles, Crown,
  ArrowRight, Copy, Search, Users, FileText, Link, Calendar, 
  ListChecks, Brain, Rocket, Crown as CrownIcon, BarChart3,
  Globe, Hash, Layers, PenTool, Award
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('keyword');
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [content, setContent] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'keyword', label: 'Keywords', icon: <Search size={16} /> },
    { id: 'competitor', label: 'Competitors', icon: <Users size={16} /> },
    { id: 'outline', label: 'Outline', icon: <FileText size={16} /> },
    { id: 'backlink', label: 'Backlinks', icon: <Link size={16} /> },
    { id: 'trend', label: 'Trend', icon: <Calendar size={16} /> },
    { id: 'onpage', label: 'On-Page', icon: <ListChecks size={16} /> },
    { id: 'plan', label: 'Plan', icon: <Target size={16} /> },
    { id: 'niche', label: 'Niche', icon: <Brain size={16} /> },
    { id: 'rank', label: 'Rank', icon: <Rocket size={16} /> },
    { id: 'brief', label: 'Brief', icon: <PenTool size={16} /> },
  ];

  const handleGenerate = async () => {
    // Validation
    if (activeTab === 'keyword' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    if (activeTab === 'competitor' && (!keyword.trim() || !domain.trim())) {
      setError('Please enter both keyword and domain.');
      return;
    }
    if (activeTab === 'outline' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    if (activeTab === 'backlink' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    if (activeTab === 'trend' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    if (activeTab === 'onpage' && !content.trim()) {
      setError('Please paste your content.');
      return;
    }
    if (activeTab === 'plan' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    if (activeTab === 'niche' && !selectedNiche) {
      setError('Please select a niche.');
      return;
    }
    if (activeTab === 'rank' && !domain.trim()) {
      setError('Please enter your domain.');
      return;
    }
    if (activeTab === 'brief' && !keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'keyword': endpoint = '/v13/keyword-research'; payload = { keyword }; break;
        case 'competitor': endpoint = '/v13/competitor-gap'; payload = { keyword, domain }; break;
        case 'outline': endpoint = '/v13/content-outline'; payload = { keyword, niche: selectedNiche }; break;
        case 'backlink': endpoint = '/v13/backlink-opportunities'; payload = { keyword }; break;
        case 'trend': endpoint = '/v13/trend-tracker'; payload = { keyword }; break;
        case 'onpage': endpoint = '/v13/onpage-seo'; payload = { content }; break;
        case 'plan': endpoint = '/v13/action-plan'; payload = { keyword }; break;
        case 'niche': endpoint = '/v13/niche-memory'; payload = { niche: selectedNiche }; break;
        case 'rank': endpoint = '/v13/rank-checker'; payload = { domain }; break;
        case 'brief': endpoint = '/v13/content-brief'; payload = { keyword, niche: selectedNiche }; break;
        default: throw new Error('Invalid tab');
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
              RankForge V13
            </h1>
            <CrownIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">REAL</span>
          </div>
          <p className="text-gray-400 text-sm">Real SEO Data • 90 Days to Top</p>
        </div>

        {/* ===== 10 TABS ===== */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResults(null); setError(''); }}
              className={`p-2 rounded-xl border-2 transition-all text-center ${
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                {tab.icon}
                <span className="text-[8px] font-medium leading-tight">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ===== INPUT SECTION ===== */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-6">
          <div className="space-y-3">
            {/* Keyword Input */}
            {activeTab === 'keyword' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🎯 Enter Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best smartphones"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">Real keywords with volume, KD, CPC, and Intent</p>
              </div>
            )}

            {/* Competitor Input */}
            {activeTab === 'competitor' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">⚔️ Competitor Analysis</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='Keyword'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder='Your Domain'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Outline Input */}
            {activeTab === 'outline' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">📝 Content Outline</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='Keyword'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  >
                    <option value="">Local Angle</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="UAE">🇦🇪 UAE</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="USA">🇺🇸 USA</option>
                    <option value="UK">🇬🇧 UK</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">10 H2 headings, 10 FAQ, 30 LSI keywords</p>
              </div>
            )}

            {/* Backlink Input */}
            {activeTab === 'backlink' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🔗 Backlink Opportunities</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='Enter keyword or niche'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">Real domains with DA, email, and link types</p>
              </div>
            )}

            {/* Trend Input */}
            {activeTab === 'trend' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">📈 Trend Tracker</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='Enter keyword'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">12 month trend + peak month + best publish date</p>
              </div>
            )}

            {/* On-Page Input */}
            {activeTab === 'onpage' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">✅ On-Page SEO Checklist</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Paste your content here...'
                  rows="4"
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">12 point checklist + grade (A, B, C, D)</p>
              </div>
            )}

            {/* Plan Input */}
            {activeTab === 'plan' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🗓️ 90 Day Plan</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='Enter keyword'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">12 weeks with exact tasks</p>
              </div>
            )}

            {/* Niche Input */}
            {activeTab === 'niche' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🧠 Niche Intelligence</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                >
                  <option value="">Select a niche</option>
                  <option value="Pakistan Mobile">🇵🇰 Pakistan Mobile</option>
                  <option value="AI Tools">🤖 AI Tools</option>
                  <option value="UAE Cargo">🇦🇪 UAE Cargo</option>
                  <option value="Tech Reviews">💻 Tech Reviews</option>
                  <option value="E-commerce">🛒 E-commerce</option>
                  <option value="Health & Fitness">💪 Health & Fitness</option>
                  <option value="Real Estate">🏠 Real Estate</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Food & Cooking">🍳 Food & Cooking</option>
                  <option value="Education">📚 Education</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Real competitors + 6 insights</p>
              </div>
            )}

            {/* Rank Input */}
            {activeTab === 'rank' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🏆 Rank Checker</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder='Enter domain (e.g., "mywebsite.com")'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">Current position + improvement plan</p>
              </div>
            )}

            {/* Brief Input */}
            {activeTab === 'brief' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">📄 Content Brief</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='Keyword'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  >
                    <option value="">Local Angle</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="UAE">🇦🇪 UAE</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="USA">🇺🇸 USA</option>
                    <option value="UK">🇬🇧 UK</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Complete content brief with specs and SEO tips</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Generating Real Data...</>
              ) : (
                <><Sparkles size={18} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* ===== ERROR ===== */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {results && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle size={18} /> Report Ready
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">V13 REAL</span>
              </h2>
              <button
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <CheckCircle size={14} className="text-green-400"/> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* ===== KEYWORD RESULTS ===== */}
            {activeTab === 'keyword' && results.keywords && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="text-sm text-gray-400 mb-1">{results.keywords.length} real keywords found</div>
                {results.keywords.map((kw, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <span className="font-medium text-cyan-300">{kw.keyword}</span>
                        {kw.kd < 20 && <span className="ml-2 text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">⭐ Easy</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="bg-white/10 px-2 py-0.5 rounded">Vol: {kw.volume}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded">KD: {kw.kd}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded">CPC: ${kw.cpc}</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          kw.intent === 'Commercial' ? 'bg-orange-500/20 text-orange-300' :
                          kw.intent === 'Transactional' ? 'bg-green-500/20 text-green-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>{kw.intent}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {results.trend && (
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-400 text-xs">📈 12 Month Trend • Peak: {results.peak_month}</p>
                    <div className="flex items-end gap-1 h-16 mt-2">
                      {results.trend.map((t, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*60}%` }} />
                          <span className="text-[7px] text-gray-500 mt-0.5">{t.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== COMPETITOR RESULTS ===== */}
            {activeTab === 'competitor' && results.competitors && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="text-sm text-gray-400 mb-1">{results.competitors.length} real competitors</div>
                {results.competitors.map((comp, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-cyan-300 text-sm">#{comp.rank} {comp.domain}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Words: {comp.word_count} • Backlinks: {comp.backlinks}
                        </div>
                        {comp.missing_headings?.length > 0 && (
                          <div className="mt-1.5 text-[10px]">
                            <span className="text-yellow-300">📌 Missing Headings:</span>
                            <span className="text-gray-400 ml-1">{comp.missing_headings.join(', ')}</span>
                          </div>
                        )}
                        {comp.missing_faq?.length > 0 && (
                          <div className="text-[10px]">
                            <span className="text-yellow-300">❓ Missing FAQ:</span>
                            <span className="text-gray-400 ml-1">{comp.missing_faq.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      {comp.authority && <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded">DA: {comp.authority}</span>}
                    </div>
                  </div>
                ))}
                {results.actions && (
                  <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                    <p className="font-bold text-purple-300 text-sm">🎯 Action Steps</p>
                    <ul className="mt-1 space-y-0.5">
                      {results.actions.map((a, i) => <li key={i} className="text-xs flex items-start gap-1.5"><ArrowRight size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== OUTLINE RESULTS ===== */}
            {activeTab === 'outline' && results.outline && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <h3 className="font-bold text-cyan-300 text-lg">{results.outline.h1}</h3>
                  <div className="text-xs text-gray-400 mt-1">📌 Meta Title: {results.outline.meta_title}</div>
                  <div className="text-xs text-gray-400">📝 Meta Description: {results.outline.meta_description}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="font-bold text-yellow-300 text-xs">📌 H2 Headings</p>
                    <ul className="mt-1 space-y-0.5 text-xs max-h-40 overflow-y-auto">
                      {results.outline.h2_headings?.map((h, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-cyan-400">{i+1}.</span><span className="text-gray-300">{h}</span></li>)}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="font-bold text-yellow-300 text-xs">❓ FAQ</p>
                      <ul className="list-disc pl-4 text-xs space-y-0.5 text-gray-300 max-h-24 overflow-y-auto">
                        {results.outline.faq?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="font-bold text-green-300 text-xs">🔑 LSI Keywords</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {results.outline.lsi_keywords?.map((l, i) => <span key={i} className="text-[9px] bg-green-500/20 px-1.5 py-0.5 rounded-full border border-green-500/20">{l}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
                {results.outline.local_angle && (
                  <div className="bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 text-xs">
                    🌍 {results.outline.local_angle}
                  </div>
                )}
              </div>
            )}

            {/* ===== BACKLINK RESULTS ===== */}
            {activeTab === 'backlink' && results.backlinks && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                <div className="text-sm text-gray-400 mb-1">{results.backlinks.length} real backlink opportunities</div>
                {results.backlinks.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-white/10 bg-white/5 flex flex-wrap justify-between items-center gap-1.5">
                    <div className="flex-1">
                      <div className="font-medium text-cyan-300 text-sm flex items-center gap-1.5">
                        {b.domain}
                        <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-full">DA: {b.da}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{b.link_type} • {b.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">{b.email}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        b.opportunity === 'High' ? 'bg-green-500/20 text-green-300' :
                        b.opportunity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>{b.opportunity || 'Medium'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== TREND RESULTS ===== */}
            {activeTab === 'trend' && results.trend && (
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-gray-400 text-xs">📈 12 Month Trend</p>
                  <div className="flex items-end gap-1 h-24 mt-2">
                    {results.trend.map((t, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*90}%` }} />
                        <span className="text-[7px] text-gray-500 mt-0.5">{t.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-yellow-300">{results.peak_month}</div>
                    <div className="text-[10px] text-gray-400">Peak Month</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-cyan-300">{results.peak_value}</div>
                    <div className="text-[10px] text-gray-400">Peak Value</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-sm font-bold text-green-300">{results.best_publish_date}</div>
                    <div className="text-[10px] text-gray-400">Publish Date</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ON-PAGE RESULTS ===== */}
            {activeTab === 'onpage' && results.checklist && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {results.checklist.map((item, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border flex flex-wrap justify-between items-center gap-1.5 ${
                    item.status === 'pass' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {item.status === 'pass' ? '✅' : '❌'}
                      <div>
                        <div className="font-medium text-xs">{item.check}</div>
                        <div className="text-[10px] text-gray-400">{item.issue || '✅ All good'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.status === 'pass' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {item.status === 'pass' ? 'Pass' : 'Fix'}
                    </span>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-3 rounded-xl text-center border border-green-500/20">
                  <div className="text-2xl font-bold text-cyan-300">{results.score}/12</div>
                  <div className="text-xs text-gray-400">Score • Grade: <span className="text-yellow-300 font-bold">{results.grade}</span></div>
                </div>
              </div>
            )}

            {/* ===== PLAN RESULTS ===== */}
            {activeTab === 'plan' && results.plan && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {results.plan.map((week, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-cyan-300 text-sm">Week {week.week} • {week.focus}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        week.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                        week.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{week.priority}</span>
                    </div>
                    <ul className="list-disc pl-4 text-xs text-gray-300 mt-1 space-y-0.5">
                      {week.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* ===== NICHE RESULTS ===== */}
            {activeTab === 'niche' && results.niche && (
              <div className="space-y-3">
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <h3 className="font-bold text-cyan-300 text-xl">{results.niche.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{results.niche.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="font-bold text-yellow-300 text-sm">🏆 Top Competitors</p>
                    <ul className="list-disc pl-4 text-sm mt-1 space-y-0.5">
                      {results.niche.competitors?.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="font-bold text-purple-300 text-sm">💡 Key Insights</p>
                    <ul className="list-disc pl-4 text-xs space-y-0.5 text-gray-300 mt-1">
                      {results.niche.insights?.map((ins, i) => <li key={i}>{ins}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ===== RANK RESULTS ===== */}
            {activeTab === 'rank' && results.rank && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-4 rounded-xl text-center border border-green-500/20">
                    <div className="text-3xl font-bold text-cyan-300">#{results.rank.position}</div>
                    <div className="text-xs text-gray-400">Current Position</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-yellow-300">{results.rank.total_keywords}</div>
                    <div className="text-xs text-gray-400">Total Keywords</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-green-300">{results.rank.traffic}</div>
                    <div className="text-xs text-gray-400">Estimated Traffic</div>
                  </div>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <p className="font-bold text-purple-300 text-sm">🚀 Improvement Plan</p>
                  <ul className="list-disc pl-4 text-xs mt-1 space-y-0.5 text-gray-300">
                    {results.rank.improvement?.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* ===== BRIEF RESULTS ===== */}
            {activeTab === 'brief' && results.brief && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <h3 className="font-bold text-cyan-300 text-lg">{results.brief.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{results.brief.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="font-bold text-yellow-300 text-xs">📊 Content Specs</p>
                    <div className="text-xs space-y-1 mt-1">
                      <div>Words: {results.brief.word_count}</div>
                      <div>Images: {results.brief.images}</div>
                      <div>Audience: {results.brief.target_audience}</div>
                      <div>Tone: {results.brief.tone}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="font-bold text-purple-300 text-xs">📌 Key Headings</p>
                    <ul className="list-disc pl-4 text-xs mt-1">
                      {results.brief.key_headings?.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <p className="font-bold text-green-300 text-xs">💡 SEO Tips</p>
                  <ul className="list-disc pl-4 text-xs mt-1">
                    {results.brief.seo_tips?.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && !results && !error && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">⚡</div>
            <p className="text-lg font-semibold text-gray-300">Enter keyword and click Generate</p>
            <p className="text-xs text-gray-600 mt-1">10 Features • Real Data • 90 Days to Top</p>
          </div>
        )}
      </div>
    </div>
  );
}
