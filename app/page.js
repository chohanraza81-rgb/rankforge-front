'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Loader2, CheckCircle, TrendingUp, 
  Search, Users, FileText, Link, Calendar, ListChecks, 
  Target, Brain, Sparkles, Crown, ArrowRight, Copy,
  Zap, Shield, Rocket, Star, Award, BarChart3,
  Gauge, Eye, PenTool, Globe, Hash, Layers
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('keyword');
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'keyword', label: '🔍 Keywords', icon: <Search size={18} /> },
    { id: 'competitor', label: '⚔️ Competitors', icon: <Users size={18} /> },
    { id: 'outline', label: '📝 Outline', icon: <FileText size={18} /> },
    { id: 'backlink', label: '🔗 Backlinks', icon: <Link size={18} /> },
    { id: 'trend', label: '📈 Trend', icon: <Calendar size={18} /> },
    { id: 'onpage', label: '✅ On-Page', icon: <ListChecks size={18} /> },
    { id: 'plan', label: '🗓️ 90 Day Plan', icon: <Target size={18} /> },
    { id: 'niche', label: '🧠 Niche', icon: <Brain size={18} /> },
    { id: 'rank', label: '🏆 Rank', icon: <Rocket size={18} /> },
    { id: 'brief', label: '📄 Brief', icon: <PenTool size={18} /> },
  ];

  const handleGenerate = async () => {
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
      setError('Please paste content.');
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
      const baseUrl = '/api/v10';
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'keyword': endpoint = '/keyword-research'; payload = { keyword }; break;
        case 'competitor': endpoint = '/competitor-gap'; payload = { keyword, domain }; break;
        case 'outline': endpoint = '/content-outline'; payload = { keyword, niche: selectedNiche }; break;
        case 'backlink': endpoint = '/backlink-opportunities'; payload = { keyword }; break;
        case 'trend': endpoint = '/trend-tracker'; payload = { keyword }; break;
        case 'onpage': endpoint = '/onpage-seo'; payload = { url, content }; break;
        case 'plan': endpoint = '/action-plan'; payload = { keyword }; break;
        case 'niche': endpoint = '/niche-memory'; payload = { niche: selectedNiche }; break;
        case 'rank': endpoint = '/rank-checker'; payload = { domain }; break;
        case 'brief': endpoint = '/content-brief'; payload = { keyword, niche: selectedNiche }; break;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              RankForge V10
            </h1>
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">REAL</span>
          </div>
          <p className="text-gray-400 text-sm">
            ⚡ Real SEO Ranking Engine • <span className="text-cyan-400">90 Days to Top</span>
          </p>
        </div>

        {/* 10 Tabs */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResults(null); setError(''); }}
              className={`p-2 rounded-xl border-2 transition-all text-center ${
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
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

        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 mb-6">
          <div className="space-y-3">
            {activeTab === 'keyword' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🎯 Seed Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops for students"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">50+ keywords • KD &lt; 25 filter • Real volume & CPC</p>
              </div>
            )}

            {activeTab === 'competitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">🎯 Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g., "best laptops"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">🌐 My Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder='e.g., "mywebsite.com"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'outline' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">📝 Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g., "best laptops"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">🌍 Local Angle</label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  >
                    <option value="">Select Location</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="UAE">🇦🇪 UAE</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="UK">🇬🇧 UK</option>
                    <option value="USA">🇺🇸 USA</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'backlink' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🔗 Keyword / Niche</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "tech blogs" or "laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">50+ real sites • DA 20-60 • Contact emails</p>
              </div>
            )}

            {activeTab === 'trend' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">📈 Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
            )}

            {activeTab === 'onpage' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">📄 Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Paste your content here...'
                  rows="4"
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">15 point checklist • Detailed fix instructions</p>
              </div>
            )}

            {activeTab === 'plan' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🗓️ Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">12 weeks • Exact tasks for ranking</p>
              </div>
            )}

            {activeTab === 'niche' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🧠 Select Niche</label>
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
                  <option value="Health & Fitness">💪 Health & Fitness</option>
                  <option value="Real Estate">🏠 Real Estate</option>
                  <option value="E-commerce">🛒 E-commerce</option>
                  <option value="Education">📚 Education</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Food & Cooking">🍳 Food & Cooking</option>
                </select>
              </div>
            )}

            {activeTab === 'rank' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🏆 Your Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder='e.g., "mywebsite.com"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">Check current position + improvement plan</p>
              </div>
            )}

            {activeTab === 'brief' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">📄 Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g., "best laptops"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">🌍 Local Angle</label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  >
                    <option value="">Select Location</option>
                    <option value="Pakistan">🇵🇰 Pakistan</option>
                    <option value="UAE">🇦🇪 UAE</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="UK">🇬🇧 UK</option>
                    <option value="USA">🇺🇸 USA</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate {activeTab === 'keyword' ? '50+ Keywords' : activeTab === 'competitor' ? 'Real Competitors' : activeTab === 'outline' ? 'Content Outline' : activeTab === 'backlink' ? '50+ Backlinks' : activeTab === 'trend' ? 'Trend Report' : activeTab === 'onpage' ? 'SEO Checklist' : activeTab === 'plan' ? '90 Day Plan' : activeTab === 'niche' ? 'Niche Intel' : activeTab === 'rank' ? 'Rank Check' : 'Content Brief'}</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle size={18} /> Report Ready
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">V10 REAL</span>
              </h2>
              <button
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <CheckCircle size={14} className="text-green-400"/> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* ===== KEYWORD RESEARCH ===== */}
            {activeTab === 'keyword' && results.keywords && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-1">{results.keywords.length} keywords found (KD &lt; 25)</div>
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
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
                </div>
                {results.trend && (
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="text-gray-400 text-xs">📈 12 Month Trend:</span>
                    <div className="flex items-end gap-1 h-20 mt-2">
                      {results.trend.map((t, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*70}%` }} />
                          <span className="text-[7px] text-gray-500 mt-0.5">{t.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== COMPETITOR GAP ===== */}
            {activeTab === 'competitor' && results.competitors && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-1">{results.competitors.length} real competitors analyzed</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {results.competitors.map((comp, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-cyan-300 text-sm">#{comp.rank} {comp.domain}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Word Count: {comp.word_count} | Backlinks: {comp.backlinks}
                          </div>
                        </div>
                        {comp.authority && (
                          <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-full">DA: {comp.authority}</span>
                        )}
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
                  ))}
                </div>
                {results.actions && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h3 className="font-bold text-purple-300 mb-1.5 flex items-center gap-2 text-sm">
                      <Target size={14} /> Action Steps
                    </h3>
                    <ul className="space-y-0.5">
                      {results.actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <ArrowRight size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== CONTENT OUTLINE ===== */}
            {activeTab === 'outline' && results.outline && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                  <h3 className="text-lg font-bold text-cyan-300">{results.outline.h1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-xs">
                    <div><span className="text-gray-400">📌 Meta Title:</span> {results.outline.meta_title}</div>
                    <div><span className="text-gray-400">📝 Meta Desc:</span> {results.outline.meta_description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-1.5 text-xs">📌 H2 Headings (10)</h4>
                    <ul className="space-y-0.5 text-xs max-h-40 overflow-y-auto">
                      {results.outline.h2_headings?.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">{i+1}.</span>
                          <span className="text-gray-300">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <h4 className="font-bold text-yellow-300 mb-1.5 text-xs">❓ FAQ (10)</h4>
                      <ul className="list-disc pl-4 text-xs space-y-0.5 text-gray-300 max-h-32 overflow-y-auto">
                        {results.outline.faq?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <h4 className="font-bold text-green-300 mb-1.5 text-xs">🔑 LSI Keywords (30)</h4>
                      <div className="flex flex-wrap gap-1">
                        {results.outline.lsi_keywords?.map((l, i) => (
                          <span key={i} className="text-[9px] bg-green-500/20 px-1.5 py-0.5 rounded-full border border-green-500/20">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {results.outline.local_angle && (
                  <div className="bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 text-xs">
                    🌍 <span className="text-green-300">Local Angle:</span> {results.outline.local_angle}
                  </div>
                )}
              </div>
            )}

            {/* ===== BACKLINK OPPORTUNITIES ===== */}
            {activeTab === 'backlink' && results.backlinks && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                <div className="text-sm text-gray-400 mb-1">{results.backlinks.length} real backlink opportunities</div>
                {results.backlinks.map((b, i) => (
                  <div key={i} className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-wrap justify-between items-center gap-1.5">
                    <div className="flex-1">
                      <div className="font-medium text-cyan-300 text-sm flex items-center gap-1.5">
                        {b.domain}
                        <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-full">DA: {b.da}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{b.link_type || 'Guest Post'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">{b.email || 'N/A'}</div>
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

            {/* ===== TREND ===== */}
            {activeTab === 'trend' && results.trend && (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-gray-400 text-xs">📈 12 Month Trend:</span>
                  <div className="flex items-end gap-1 h-28 mt-2">
                    {results.trend.map((t, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*100}%` }} />
                        <span className="text-[7px] text-gray-500 mt-0.5">{t.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-yellow-300">{results.peak_month}</div>
                    <div className="text-[10px] text-gray-400">📊 Peak Month</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-sm text-cyan-300 font-bold">{results.best_publish_date}</div>
                    <div className="text-[10px] text-gray-400">📅 Best Publish Date</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ON-PAGE SEO ===== */}
            {activeTab === 'onpage' && results.checklist && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {results.checklist.map((item, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border flex flex-wrap justify-between items-center gap-1.5 ${
                    item.status === 'pass' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {item.status === 'pass' ? '✅' : '❌'}
                      <div>
                        <div className="font-medium text-xs">{item.check}</div>
                        <div className="text-[10px] text-gray-400">{item.issue || '✅ All good'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'pass' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {item.status === 'pass' ? 'Pass' : 'Fix'}
                    </span>
                  </div>
                ))}
                {results.score !== undefined && (
                  <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-3 rounded-xl text-center border border-green-500/20">
                    <div className="text-3xl font-bold text-cyan-300">{results.score}/15</div>
                    <div className="text-xs text-gray-400">Overall SEO Score</div>
                  </div>
                )}
              </div>
            )}

            {/* ===== 90 DAY PLAN ===== */}
            {activeTab === 'plan' && results.plan && (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                {results.plan.map((week, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex flex-wrap justify-between items-center gap-1.5">
                      <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                        <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded-full text-[10px]">Week {week.week}</span>
                        {week.focus}
                      </h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        week.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                        week.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{week.priority || 'Medium'}</span>
                    </div>
                    <ul className="list-disc pl-4 text-xs text-gray-300 mt-1.5 space-y-0.5">
                      {week.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* ===== NICHE MEMORY ===== */}
            {activeTab === 'niche' && results.niche && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                  <h3 className="font-bold text-cyan-300 text-xl">{results.niche.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{results.niche.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-1.5 text-sm">🏆 Top Competitors</h4>
                    <ul className="list-disc pl-4 text-sm space-y-0.5">
                      {results.niche.competitors?.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <h4 className="font-bold text-purple-300 mb-1.5 text-sm">💡 Key Insights</h4>
                    <ul className="list-disc pl-4 text-sm space-y-0.5 text-gray-300">
                      {results.niche.insights?.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ===== RANK CHECKER ===== */}
            {activeTab === 'rank' && results.rank && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-4 rounded-xl text-center border border-green-500/20">
                    <div className="text-4xl font-bold text-cyan-300">#{results.rank.position || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Current Position</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-yellow-300">{results.rank.total_keywords || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Total Keywords</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-300">{results.rank.traffic || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Estimated Traffic</div>
                  </div>
                </div>
                {results.rank.improvement && (
                  <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h4 className="font-bold text-purple-300 mb-1.5 text-sm">🚀 Improvement Plan</h4>
                    <ul className="list-disc pl-4 text-sm space-y-0.5 text-gray-300">
                      {results.rank.improvement.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== CONTENT BRIEF ===== */}
            {activeTab === 'brief' && results.brief && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                  <h3 className="text-lg font-bold text-cyan-300">{results.brief.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{results.brief.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-1.5 text-sm">📊 Content Specs</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-400">Word Count:</span> {results.brief.word_count}</div>
                      <div><span className="text-gray-400">Images:</span> {results.brief.images}</div>
                      <div><span className="text-gray-400">Target Audience:</span> {results.brief.target_audience}</div>
                      <div><span className="text-gray-400">Tone:</span> {results.brief.tone}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <h4 className="font-bold text-purple-300 mb-1.5 text-sm">📌 Key Headings</h4>
                    <ul className="list-disc pl-4 text-sm space-y-0.5 text-gray-300">
                      {results.brief.key_headings?.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                </div>
                {results.brief.seo_tips && (
                  <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <h4 className="font-bold text-green-300 mb-1 text-sm">💡 SEO Tips</h4>
                    <ul className="list-disc pl-4 text-sm space-y-0.5 text-gray-300">
                      {results.brief.seo_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-3">⚡</div>
            <p className="text-lg font-semibold text-gray-300">Select a tab and enter your keyword</p>
            <p className="text-xs text-gray-600 mt-1">10 Features • Real Data • 90 Days to Top</p>
          </div>
        )}
      </div>
    </div>
  );
}
