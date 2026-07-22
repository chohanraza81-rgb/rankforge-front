'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Loader2, CheckCircle, TrendingUp, 
  Search, Users, FileText, Link, Calendar, ListChecks, 
  Target, Brain, Sparkles, Crown, ArrowRight, Copy,
  Zap, Shield, Rocket, Star, Award, BarChart3
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
    { id: 'keyword', label: '🔍 Keyword', icon: <Search size={18} /> },
    { id: 'competitor', label: '⚔️ Competitor', icon: <Users size={18} /> },
    { id: 'outline', label: '📝 Outline', icon: <FileText size={18} /> },
    { id: 'backlink', label: '🔗 Backlink', icon: <Link size={18} /> },
    { id: 'trend', label: '📈 Trend', icon: <Calendar size={18} /> },
    { id: 'onpage', label: '✅ On-Page', icon: <ListChecks size={18} /> },
    { id: 'plan', label: '🗓️ Plan', icon: <Target size={18} /> },
    { id: 'niche', label: '🧠 Niche', icon: <Brain size={18} /> },
    { id: 'rank', label: '🏆 Rank', icon: <Rocket size={18} /> },
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

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const baseUrl = '/api/v9';
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              RankForge V9
            </h1>
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">ULTIMATE</span>
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            ⚡ Real SEO Ranking Engine • <span className="text-cyan-400">90 Days to Top</span>
          </p>
        </div>

        {/* 9 Tabs */}
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResults(null); setError(''); }}
              className={`p-3 rounded-2xl border-2 transition-all text-center ${
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-4">
            {activeTab === 'keyword' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">🎯 Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops for students"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <p className="text-xs text-gray-500 mt-1">KD &lt; 25 wale keywords top par dikhenge</p>
              </div>
            )}

            {activeTab === 'competitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500 mt-1">DA 20-60 wali sites filter hongi</p>
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
                <p className="text-xs text-gray-500 mt-1">Check your domain's current ranking position</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle size={20} /> Report Ready
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">V9</span>
              </h2>
              <button
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2 transition"
              >
                {copied ? <CheckCircle size={16} className="text-green-400"/> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* ===== KEYWORD RESEARCH ===== */}
            {activeTab === 'keyword' && results.keywords && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {results.keywords.map((kw, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <span className="font-medium text-cyan-300">{kw.keyword}</span>
                          {kw.kd < 25 && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">⭐ Easy KD</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="bg-white/10 px-2 py-0.5 rounded">Vol: {kw.volume}</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded">KD: {kw.kd}</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded">CPC: ${kw.cpc}</span>
                          <span className={`px-2 py-0.5 rounded ${
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
                    <span className="text-gray-400 text-sm">📈 12 Month Trend:</span>
                    <div className="flex items-end gap-1 h-24 mt-2">
                      {results.trend.map((t, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*80}%` }} />
                          <span className="text-[8px] text-gray-500 mt-1">{t.month}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.competitors.map((comp, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-cyan-300">#{comp.rank} {comp.domain}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Word Count: {comp.word_count} | Backlinks: {comp.backlinks}
                          </div>
                        </div>
                        {comp.authority && (
                          <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">DA: {comp.authority}</span>
                        )}
                      </div>
                      {comp.missing_headings?.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="text-yellow-300">📌 Missing Headings:</span>
                          <span className="text-gray-400 ml-1">{comp.missing_headings.join(', ')}</span>
                        </div>
                      )}
                      {comp.missing_faq?.length > 0 && (
                        <div className="text-xs">
                          <span className="text-yellow-300">❓ Missing FAQ:</span>
                          <span className="text-gray-400 ml-1">{comp.missing_faq.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {results.actions && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                      <Target size={16} /> Action Steps
                    </h3>
                    <ul className="space-y-1">
                      {results.actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight size={14} className="text-purple-400 mt-0.5" />
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
                  <h3 className="text-xl font-bold text-cyan-300">{results.outline.h1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                    <div><span className="text-gray-400">📌 Meta Title:</span> {results.outline.meta_title}</div>
                    <div><span className="text-gray-400">📝 Meta Desc:</span> {results.outline.meta_description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-2">📌 H2 Headings (8)</h4>
                    <ul className="space-y-1 text-sm">
                      {results.outline.h2_headings?.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400">{i+1}.</span>
                          <span className="text-gray-300">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <h4 className="font-bold text-yellow-300 mb-2">❓ FAQ (5)</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                        {results.outline.faq?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <h4 className="font-bold text-green-300 mb-2">🔑 LSI Keywords (15)</h4>
                      <div className="flex flex-wrap gap-1">
                        {results.outline.lsi_keywords?.map((l, i) => (
                          <span key={i} className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/20">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {results.outline.local_angle && (
                  <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-sm">
                    🌍 <span className="text-green-300">Local Angle:</span> {results.outline.local_angle}
                  </div>
                )}
              </div>
            )}

            {/* ===== BACKLINK ===== */}
            {activeTab === 'backlink' && results.backlinks && (
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-2">DA 20-60 wali {results.backlinks.length} sites</div>
                {results.backlinks.map((b, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-cyan-300 flex items-center gap-2">
                        {b.domain}
                        <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">DA: {b.da}</span>
                      </div>
                      <div className="text-xs text-gray-400">{b.link_type || 'Guest Post'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{b.email || 'N/A'}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                  <span className="text-gray-400 text-sm">📈 12 Month Trend:</span>
                  <div className="flex items-end gap-1 h-32 mt-2">
                    {results.trend.map((t, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*100}%` }} />
                        <span className="text-[8px] text-gray-500 mt-1">{t.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-yellow-300">{results.peak_month}</div>
                    <div className="text-xs text-gray-400">📊 Peak Month</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-sm text-cyan-300 font-bold">{results.best_publish_date}</div>
                    <div className="text-xs text-gray-400">📅 Best Publish Date</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ON-PAGE SEO ===== */}
            {activeTab === 'onpage' && results.checklist && (
              <div className="space-y-3">
                {results.checklist.map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex flex-wrap justify-between items-center gap-2 ${
                    item.status === 'pass' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {item.status === 'pass' ? '✅' : '❌'}
                      <div>
                        <div className="font-medium text-sm">{item.check}</div>
                        <div className="text-xs text-gray-400">{item.issue || '✅ All good'}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'pass' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {item.status === 'pass' ? 'Pass' : 'Fix'}
                    </span>
                  </div>
                ))}
                {results.score !== undefined && (
                  <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-4 rounded-xl text-center border border-green-500/20">
                    <div className="text-3xl font-bold text-cyan-300">{results.score}/10</div>
                    <div className="text-sm text-gray-400">Overall SEO Score</div>
                  </div>
                )}
              </div>
            )}

            {/* ===== 90 DAY PLAN ===== */}
            {activeTab === 'plan' && results.plan && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {results.plan.map((week, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <h3 className="font-bold text-cyan-300 flex items-center gap-2">
                        <span className="bg-cyan-500/20 px-2 py-0.5 rounded-full text-xs">Week {week.week}</span>
                        {week.focus}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        week.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                        week.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{week.priority || 'Medium'}</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-gray-300 mt-2 space-y-1">
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
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-2">🏆 Top Competitors</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {results.niche.competitors?.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-purple-300 mb-2">💡 Key Insights</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                      {results.niche.insights?.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ===== RANK CHECKER ===== */}
            {activeTab === 'rank' && results.rank && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 p-4 rounded-xl text-center border border-green-500/20">
                    <div className="text-4xl font-bold text-cyan-300">#{results.rank.position || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Current Position</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-yellow-300">{results.rank.total_keywords || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Total Keywords</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-300">{results.rank.traffic || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Estimated Traffic</div>
                  </div>
                </div>
                {results.rank.improvement && (
                  <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h4 className="font-bold text-purple-300 mb-2">🚀 Improvement Tips</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                      {results.rank.improvement.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-xl font-semibold text-gray-300">Select a tab and enter your keyword</p>
            <p className="text-sm text-gray-600 mt-2">9 Features • Real Data • 90 Days to Top</p>
          </div>
        )}
      </div>
    </div>
  );
}
