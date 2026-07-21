'use client';
import { useState, useRef } from 'react';
import { 
  Download, Loader2, CheckCircle, TrendingUp, 
  Search, Users, FileText, Link, Calendar, ListChecks, 
  Target, Brain, Sparkles, BarChart3
} from 'lucide-react';

export default function Home() {
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState('keyword');
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [niche, setNiche] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');

  // ===== TABS CONFIG =====
  const tabs = [
    { id: 'keyword', label: '🔍 Keyword Research', icon: <Search size={18} /> },
    { id: 'competitor', label: '⚔️ Competitor Gap', icon: <Users size={18} /> },
    { id: 'outline', label: '📝 Content Outline', icon: <FileText size={18} /> },
    { id: 'backlink', label: '🔗 Backlink Ops', icon: <Link size={18} /> },
    { id: 'trend', label: '📈 Trend Tracker', icon: <Calendar size={18} /> },
    { id: 'onpage', label: '✅ On-Page SEO', icon: <ListChecks size={18} /> },
    { id: 'plan', label: '🗓️ 90 Day Plan', icon: <Target size={18} /> },
    { id: 'niche', label: '🧠 Niche Memory', icon: <Brain size={18} /> },
  ];

  // ===== HANDLE GENERATE =====
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('API URL not configured');
      }

      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'keyword':
          endpoint = '/api/v8/keyword-research';
          payload = { keyword };
          break;
        case 'competitor':
          endpoint = '/api/v8/competitor-gap';
          payload = { keyword, domain };
          break;
        case 'outline':
          endpoint = '/api/v8/content-outline';
          payload = { keyword, niche: selectedNiche };
          break;
        case 'backlink':
          endpoint = '/api/v8/backlink-opportunities';
          payload = { keyword: keyword || niche };
          break;
        case 'trend':
          endpoint = '/api/v8/trend-tracker';
          payload = { keyword };
          break;
        case 'onpage':
          endpoint = '/api/v8/onpage-seo';
          payload = { url, content };
          break;
        case 'plan':
          endpoint = '/api/v8/action-plan';
          payload = { keyword };
          break;
        case 'niche':
          endpoint = '/api/v8/niche-memory';
          payload = { niche: selectedNiche };
          break;
        default:
          throw new Error('Invalid tab');
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
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ===== EXPORT FUNCTION =====
  const exportResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            RankForge V8
          </h1>
          <p className="text-gray-400 text-sm mt-1">Personal SEO Ranking Engine • 90 Days to Top</p>
        </div>

        {/* ===== 8 BIG BUTTONS (No Sidebar) ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResults(null);
                setError('');
              }}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ===== INPUT SECTION ===== */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-4">
            {/* Dynamic Inputs based on Tab */}
            {activeTab === 'keyword' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Seed Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'competitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g., "best laptops"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">My Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder='e.g., "mywebsite.com"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'outline' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Keyword</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g., "best laptops"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Niche (Local Angle)</label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select Niche</option>
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
                <label className="text-sm text-gray-400 block mb-1">Keyword / Niche</label>
                <input
                  type="text"
                  value={keyword || niche}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setNiche(e.target.value);
                  }}
                  placeholder='e.g., "tech blogs" or "laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'trend' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'onpage' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">URL (Optional)</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder='e.g., "https://mywebsite.com/page"'
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Content (Paste here)</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder='Paste your content here...'
                    rows="4"
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {activeTab === 'niche' && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Select Niche</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select a niche</option>
                  <option value="Pakistan Mobile">🇵🇰 Pakistan Mobile</option>
                  <option value="AI Tools">🤖 AI Tools</option>
                  <option value="UAE Cargo">🇦🇪 UAE Cargo</option>
                  <option value="Tech Reviews">💻 Tech Reviews</option>
                  <option value="Health & Fitness">💪 Health & Fitness</option>
                </select>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate {activeTab === 'keyword' ? 'Keywords' : activeTab === 'competitor' ? 'Gap Analysis' : activeTab === 'outline' ? 'Content Outline' : activeTab === 'backlink' ? 'Backlink Opportunities' : activeTab === 'trend' ? 'Trend Report' : activeTab === 'onpage' ? 'SEO Checklist' : activeTab === 'plan' ? '90 Day Plan' : 'Niche Memory'}</>
              )}
            </button>
          </div>
        </div>

        {/* ===== ERROR ===== */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {results && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle size={20} /> Report Ready
              </h2>
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm flex items-center gap-2 transition"
              >
                <Download size={16} /> Export
              </button>
            </div>

            {/* ===== TAB 1: KEYWORD RESEARCH ===== */}
            {activeTab === 'keyword' && results.keywords && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.keywords.slice(0, 10).map((kw, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-cyan-300">{kw.keyword}</span>
                        {kw.kd < 25 && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">KD {kw.kd}</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Volume: {kw.volume} | CPC: ${kw.cpc} | Intent: {kw.intent}
                      </div>
                    </div>
                  ))}
                </div>
                {results.trend && (
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="text-gray-400 text-sm">📈 12 Month Trend:</span>
                    <div className="flex items-end gap-1 h-20 mt-2">
                      {results.trend.map((t, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-cyan-400/30 rounded-t" style={{ height: `${(t/100)*80}%` }}></div>
                          <span className="text-[8px] text-gray-500 mt-1">{t.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB 2: COMPETITOR GAP ===== */}
            {activeTab === 'competitor' && results.competitors && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.competitors.map((comp, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="font-bold text-cyan-300">{comp.domain}</div>
                      <div className="text-xs text-gray-400">Word Count: {comp.word_count} | Backlinks: {comp.backlinks}</div>
                      <div className="text-xs text-gray-400 mt-1">Missing Headings: {comp.missing_headings?.join(', ') || 'None'}</div>
                      <div className="text-xs text-gray-400">Missing FAQ: {comp.missing_faq?.join(', ') || 'None'}</div>
                    </div>
                  ))}
                </div>
                {results.actions && (
                  <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <h3 className="font-bold text-purple-300 mb-2">🎯 Action Steps</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {results.actions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB 3: CONTENT OUTLINE ===== */}
            {activeTab === 'outline' && results.outline && (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-cyan-300">{results.outline.h1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                    <div><span className="text-gray-400">Meta Title:</span> {results.outline.meta_title}</div>
                    <div><span className="text-gray-400">Meta Desc:</span> {results.outline.meta_description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-2">H2 Headings</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {results.outline.h2_headings?.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-yellow-300 mb-2">FAQ</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {results.outline.faq?.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                </div>
                {results.outline.local_angle && (
                  <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-sm">
                    🌍 Local Angle: {results.outline.local_angle}
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB 4: BACKLINK OPPORTUNITIES ===== */}
            {activeTab === 'backlink' && results.backlinks && (
              <div className="space-y-3">
                {results.backlinks.map((b, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-cyan-300">{b.domain}</div>
                      <div className="text-xs text-gray-400">DA: {b.da} | Type: {b.link_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{b.email || 'N/A'}</div>
                      <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">{b.opportunity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== TAB 5: TREND ===== */}
            {activeTab === 'trend' && results.trend && (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex items-end gap-1 h-32">
                    {results.trend.map((t, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t" style={{ height: `${(t.value/100)*100}%` }}></div>
                        <span className="text-[8px] text-gray-500 mt-1">{t.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-yellow-300">{results.peak_month}</div>
                    <div className="text-xs text-gray-400">Peak Month</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl text-center">
                    <div className="text-sm text-cyan-300">{results.best_publish_date}</div>
                    <div className="text-xs text-gray-400">Best Publish Date</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB 6: ON-PAGE SEO ===== */}
            {activeTab === 'onpage' && results.checklist && (
              <div className="space-y-3">
                {results.checklist.map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex justify-between items-center ${
                    item.status === 'pass' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    <div>
                      <div className="font-medium">{item.check}</div>
                      <div className="text-xs text-gray-400">{item.issue || '✅ All good'}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'pass' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {item.status === 'pass' ? '✅ Pass' : '❌ Fix'}
                      </span>
                    </div>
                  </div>
                ))}
                {results.score && (
                  <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-cyan-300">{results.score}/10</div>
                    <div className="text-sm text-gray-400">Overall Score</div>
                  </div>
                )}
              </div>
            )}

            {/* ===== TAB 7: 90 DAY PLAN ===== */}
            {activeTab === 'plan' && results.plan && (
              <div className="space-y-3">
                {results.plan.map((week, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-cyan-300">Week {week.week}</h3>
                      <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">{week.focus}</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-gray-300 mt-2 space-y-1">
                      {week.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* ===== TAB 8: NICHE MEMORY ===== */}
            {activeTab === 'niche' && results.niche && (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="font-bold text-cyan-300">{results.niche.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{results.niche.description}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <h4 className="font-bold text-yellow-300 mb-2">🏆 Top Competitors</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {results.niche.competitors?.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <h4 className="font-bold text-purple-300 mb-2">📌 Key Insights</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                    {results.niche.insights?.map((i, idx) => <li key={idx}>{i}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
