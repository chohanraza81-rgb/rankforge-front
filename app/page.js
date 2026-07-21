'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Loader2, CheckCircle, TrendingUp, 
  Search, Users, FileText, Link, Calendar, ListChecks, 
  Target, Brain, Sparkles, Crown, ArrowRight, Copy
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
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      setError('Please enter a keyword or niche.');
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

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // ✅ FIX: Use relative path for Next.js API routes
      const baseUrl = '/api/v8';
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'keyword':
          endpoint = '/keyword-research';
          payload = { keyword };
          break;
        case 'competitor':
          endpoint = '/competitor-gap';
          payload = { keyword, domain };
          break;
        case 'outline':
          endpoint = '/content-outline';
          payload = { keyword, niche: selectedNiche };
          break;
        case 'backlink':
          endpoint = '/backlink-opportunities';
          payload = { keyword };
          break;
        case 'trend':
          endpoint = '/trend-tracker';
          payload = { keyword };
          break;
        case 'onpage':
          endpoint = '/onpage-seo';
          payload = { url, content };
          break;
        case 'plan':
          endpoint = '/action-plan';
          payload = { keyword };
          break;
        case 'niche':
          endpoint = '/niche-memory';
          payload = { niche: selectedNiche };
          break;
        default:
          throw new Error('Invalid tab');
      }

      console.log(`📡 Calling: ${baseUrl}${endpoint}`);
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

  // ✅ FAKE DATA FOR DEMO (If backend not ready)
  const getDemoData = () => {
    const keyword = 'laptops for students';
    const niche = 'Pakistan';
    
    const demoData = {
      keyword: {
        keywords: [
          { keyword: 'best laptops for students', volume: 2200, kd: 22, cpc: 1.8, intent: 'Commercial' },
          { keyword: 'cheap laptops for students', volume: 1800, kd: 18, cpc: 1.2, intent: 'Transactional' },
          { keyword: 'best laptops for college students', volume: 1500, kd: 20, cpc: 1.5, intent: 'Informational' },
          { keyword: 'laptops for students under 500', volume: 1200, kd: 15, cpc: 0.9, intent: 'Transactional' },
          { keyword: 'best budget laptops for students', volume: 1000, kd: 12, cpc: 0.8, intent: 'Commercial' },
        ],
        trend: [
          { month: 'Jan', value: 45 }, { month: 'Feb', value: 50 },
          { month: 'Mar', value: 55 }, { month: 'Apr', value: 60 },
          { month: 'May', value: 70 }, { month: 'Jun', value: 80 },
          { month: 'Jul', value: 85 }, { month: 'Aug', value: 90 },
          { month: 'Sep', value: 95 }, { month: 'Oct', value: 100 },
          { month: 'Nov', value: 95 }, { month: 'Dec', value: 85 }
        ]
      },
      competitor: {
        competitors: [
          { rank: 1, domain: 'techradar.com', authority: 85, word_count: 2500, backlinks: 4500, 
            missing_headings: ['Best Laptops for Students', 'Student Discounts'], 
            missing_faq: ['Which laptop is best for students?'] },
          { rank: 2, domain: 'cnet.com', authority: 82, word_count: 2200, backlinks: 3800,
            missing_headings: ['College Laptop Guide', 'Budget Options'],
            missing_faq: ['What is the best cheap laptop?'] },
          { rank: 3, domain: 'pcmag.com', authority: 80, word_count: 2000, backlinks: 3200,
            missing_headings: ['Student Tech Guide', 'Laptop Comparisons'],
            missing_faq: ['Which brand is best for students?'] }
        ],
        actions: [
          'Create a dedicated "Best Laptops for Students" page with student-specific features',
          'Add a comparison table of top 5 student laptops with prices and specs',
          'Include student discount information for major brands'
        ]
      },
      outline: {
        outline: {
          h1: 'Best Laptops for Students in 2026: Complete Buying Guide',
          meta_title: 'Best Laptops for Students 2026 | Expert Reviews & Buying Guide',
          meta_description: 'Find the best laptops for students with expert reviews, comparisons, and student discount information.',
          h2_headings: [
            'Top 10 Laptops for Students in 2026',
            'Best Budget Laptops Under $500',
            'Best Laptops for Engineering Students',
            'Best Laptops for Business Students',
            'Best Laptops for Graphic Design Students',
            'Student Discounts: How to Save Money',
            'Laptop Buying Guide for Students',
            'FAQs About Student Laptops'
          ],
          faq: [
            'What is the best laptop for students?',
            'Which laptop has the best battery life for students?',
            'What is the cheapest laptop for college students?',
            'Is MacBook worth it for students?',
            'How much RAM do students need?'
          ],
          lsi_keywords: [
            'student laptop deals', 'college laptop guide', 'budget laptops',
            'student discounts', 'laptop comparison', 'best value laptops',
            'student tech', 'laptop buying guide', 'student computers',
            'laptop for school', 'student macbook', 'chromebook for students',
            'student pc', 'laptop under 1000', 'student technology'
          ],
          local_angle: `🇵🇰 For Pakistani students: Include local pricing in PKR, available brands in Pakistan (Dell, HP, Lenovo), and local warranty information.`
        }
      },
      backlink: {
        backlinks: [
          { domain: 'studenttech.com', da: 45, email: 'editor@studenttech.com', link_type: 'Guest Post', opportunity: 'High' },
          { domain: 'teachblog.com', da: 38, email: 'admin@teachblog.com', link_type: 'Resource Page', opportunity: 'Medium' },
          { domain: 'edutech.com', da: 42, email: 'contact@edutech.com', link_type: 'Guest Post', opportunity: 'High' },
          { domain: 'studentguide.com', da: 35, email: 'info@studentguide.com', link_type: 'Resource Page', opportunity: 'Medium' },
          { domain: 'techparent.com', da: 28, email: 'editor@techparent.com', link_type: 'Guest Post', opportunity: 'Medium' }
        ]
      },
      trend: {
        trend: [
          { month: 'Jan', value: 45 }, { month: 'Feb', value: 50 },
          { month: 'Mar', value: 55 }, { month: 'Apr', value: 60 },
          { month: 'May', value: 70 }, { month: 'Jun', value: 80 },
          { month: 'Jul', value: 85 }, { month: 'Aug', value: 90 },
          { month: 'Sep', value: 95 }, { month: 'Oct', value: 100 },
          { month: 'Nov', value: 95 }, { month: 'Dec', value: 85 }
        ],
        peak_month: 'October',
        best_publish_date: '2026-09-15'
      },
      onpage: {
        checklist: [
          { check: 'Title Tag', status: 'pass', issue: '' },
          { check: 'Meta Description', status: 'pass', issue: '' },
          { check: 'Keyword Density', status: 'pass', issue: '' },
          { check: 'Image Alt Tags', status: 'fail', issue: 'Add alt text to images' },
          { check: 'Internal Links', status: 'pass', issue: '' },
          { check: 'H1 Tag', status: 'pass', issue: '' },
          { check: 'H2 Headings', status: 'pass', issue: '' },
          { check: 'Readability', status: 'pass', issue: '' },
          { check: 'Word Count', status: 'pass', issue: '' },
          { check: 'External Links', status: 'fail', issue: 'Add 2-3 external authority links' }
        ],
        score: 8
      },
      plan: {
        plan: [
          { week: 1, focus: 'Research & Strategy', priority: 'High', tasks: ['Keyword research', 'Competitor analysis', 'Content strategy'] },
          { week: 2, focus: 'Content Creation - Part 1', priority: 'High', tasks: ['Write main article', 'Create comparison table', 'Add images'] },
          { week: 3, focus: 'Content Creation - Part 2', priority: 'High', tasks: ['Write supporting posts', 'Create FAQ section', 'Optimize meta tags'] },
          { week: 4, focus: 'On-Page SEO', priority: 'High', tasks: ['Internal linking', 'Image optimization', 'Schema markup'] },
          { week: 5, focus: 'Backlink Outreach - Part 1', priority: 'Medium', tasks: ['Find 10 prospects', 'Email outreach', 'Guest post pitch'] },
          { week: 6, focus: 'Backlink Outreach - Part 2', priority: 'Medium', tasks: ['Follow up emails', 'Guest post writing', 'Resource page links'] },
          { week: 7, focus: 'Monitoring', priority: 'Medium', tasks: ['Track rankings', 'Analyze traffic', 'Monitor backlinks'] },
          { week: 8, focus: 'Refinement', priority: 'Medium', tasks: ['Update content', 'Add new data', 'Improve user engagement'] },
          { week: 9, focus: 'Content Expansion', priority: 'Low', tasks: ['Create video content', 'Design infographics', 'Write case studies'] },
          { week: 10, focus: 'Social Promotion', priority: 'Low', tasks: ['Share on social media', 'Engage with community', 'Build audience'] },
          { week: 11, focus: 'Analysis & Reporting', priority: 'Low', tasks: ['Performance review', 'ROI analysis', 'Weekly reporting'] },
          { week: 12, focus: 'Optimization & Scaling', priority: 'Low', tasks: ['Scale what works', 'Optimize weak spots', 'Plan next campaign'] }
        ]
      },
      niche: {
        niche: {
          name: 'Pakistan Mobile',
          description: 'Smartphone market in Pakistan with focus on budget and mid-range phones.',
          competitors: ['PakWheels', 'WhatMobile', 'MobileZone', 'PhoneWorld'],
          insights: [
            'Budget phones under PKR 50,000 have highest search volume',
            'Samsung and Xiaomi dominate the Pakistani smartphone market',
            'Mobile reviews with local pricing get 70% more clicks',
            'Video reviews perform better than text-only content in Pakistan'
          ]
        }
      }
    };

    return demoData[activeTab] || { message: 'Data not available' };
  };

  // ✅ USE DEMO DATA IF BACKEND NOT READY
  const useDemoData = () => {
    const data = getDemoData();
    setResults(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              RankForge V8
            </h1>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            ⚡ Personal SEO Ranking Engine • <span className="text-cyan-400">90 Days to Top</span>
          </p>
        </div>

        {/* 8 Tabs */}
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
              <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
              <span className="text-sm font-medium sm:hidden">{tab.label.substring(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-4">
            {/* Keyword Input - Most tabs use this */}
            {(activeTab === 'keyword' || activeTab === 'outline' || 
              activeTab === 'trend' || activeTab === 'plan' || 
              activeTab === 'backlink') && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  {activeTab === 'backlink' ? '🔗 Keyword / Niche' : '🎯 Keyword'}
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='e.g., "best laptops for students"'
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                {activeTab === 'keyword' && (
                  <p className="text-xs text-gray-500 mt-1">KD &lt; 25 wale keywords top par dikhenge</p>
                )}
                {activeTab === 'backlink' && (
                  <p className="text-xs text-gray-500 mt-1">DA 20-60 wali sites filter hongi</p>
                )}
              </div>
            )}

            {/* Competitor Tab */}
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

            {/* Niche Tab */}
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
                </select>
              </div>
            )}

            {/* On-Page Tab */}
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

            {/* Generate Button */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="animate-spin h-5 w-5" /> Generating...</>
                ) : (
                  <><Sparkles size={18} /> Generate</>
                )}
              </button>
              
              {/* Demo Button - For testing without backend */}
              <button
                onClick={useDemoData}
                disabled={loading}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 transition rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle size={18} /> Demo
              </button>
            </div>
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
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">V8</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm flex items-center gap-2 transition"
                >
                  {copied ? <CheckCircle size={16} className="text-green-400"/> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* ===== TAB 1: KEYWORD RESEARCH ===== */}
            {activeTab === 'keyword' && results.keywords && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {results.keywords.map((kw, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${
                      kw.kd < 25 ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'
                    }`}>
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <span className="font-medium text-cyan-300">{kw.keyword}</span>
                          {kw.kd < 25 && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">⭐ Easy</span>
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

            {/* ===== TAB 2: COMPETITOR GAP ===== */}
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

            {/* ===== TAB 3: CONTENT OUTLINE ===== */}
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

            {/* ===== TAB 4: BACKLINK ===== */}
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

            {/* ===== TAB 5: TREND ===== */}
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

            {/* ===== TAB 6: ON-PAGE SEO ===== */}
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

            {/* ===== TAB 7: 90 DAY PLAN ===== */}
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

            {/* ===== TAB 8: NICHE MEMORY ===== */}
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
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !error && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-xl font-semibold text-gray-300">Select a tab and enter your keyword</p>
            <p className="text-sm text-gray-600 mt-2">8 Features • Fast • 90 Days to Top</p>
            <p className="text-xs text-gray-600 mt-4">💡 Click "Demo" to see sample data</p>
          </div>
        )}
      </div>
    </div>
  );
}
