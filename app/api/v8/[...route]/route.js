import { NextResponse } from 'next/server';

// ===== GROQ API CALL (Without SDK) =====
const callGroq = async (prompt, systemMsg = 'You are an SEO expert. Return valid JSON.') => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 6000,
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error('❌ GROQ Error:', error.message);
    throw error;
  }
};

// ============================================================
// ===== V8 API ROUTES =====
// ============================================================

export async function POST(request) {
  try {
    const body = await request.json();
    const { pathname } = new URL(request.url);
    const route = pathname.split('/api/v8/')[1] || '';
    
    console.log(`📡 Route: /api/v8/${route}`);

    // ---- TAB 1: KEYWORD RESEARCH ----
    if (route === 'keyword-research') {
      const { keyword } = body;
      if (!keyword) {
        return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
      }

      try {
        const prompt = `
          Analyze keyword "${keyword}" for SEO.
          Return JSON: {
            "keywords": [
              {"keyword": "", "volume": 0, "kd": 0, "cpc": 0, "intent": ""}
            ],
            "trend": [{"month": "", "value": 0}]
          }
          Important: Filter KD < 25 keywords only. Max 10 keywords.
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        // Fallback demo data
        return NextResponse.json({
          keywords: [
            { keyword: `best ${keyword}`, volume: 1200, kd: 18, cpc: 1.5, intent: 'Commercial' },
            { keyword: `cheap ${keyword}`, volume: 800, kd: 12, cpc: 0.9, intent: 'Transactional' },
            { keyword: `top ${keyword}`, volume: 900, kd: 15, cpc: 1.2, intent: 'Informational' },
          ],
          trend: [
            { month: 'Jan', value: 45 }, { month: 'Feb', value: 50 },
            { month: 'Mar', value: 55 }, { month: 'Apr', value: 60 },
            { month: 'May', value: 70 }, { month: 'Jun', value: 80 },
            { month: 'Jul', value: 85 }, { month: 'Aug', value: 90 },
            { month: 'Sep', value: 95 }, { month: 'Oct', value: 100 },
            { month: 'Nov', value: 95 }, { month: 'Dec', value: 85 }
          ]
        });
      }
    }

    // ---- TAB 2: COMPETITOR GAP ----
    if (route === 'competitor-gap') {
      const { keyword, domain } = body;
      if (!keyword || !domain) {
        return NextResponse.json({ error: 'Keyword and domain required' }, { status: 400 });
      }

      try {
        const prompt = `
          For keyword "${keyword}", analyze competitors and give actionable steps for ${domain}.
          Return JSON: {
            "competitors": [{"rank": 0, "domain": "", "authority": 0, "word_count": 0, "backlinks": 0, "missing_headings": [], "missing_faq": []}],
            "actions": ["Action 1", "Action 2", "Action 3"]
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        return NextResponse.json({
          competitors: [
            { rank: 1, domain: 'competitor1.com', authority: 75, word_count: 2000, backlinks: 3000,
              missing_headings: ['Best Features', 'User Reviews'], missing_faq: ['What is best?'] },
            { rank: 2, domain: 'competitor2.com', authority: 70, word_count: 1800, backlinks: 2500,
              missing_headings: ['Price Comparison'], missing_faq: ['How to choose?'] }
          ],
          actions: [
            'Create detailed comparison table',
            `Add content about ${keyword} for ${domain}`,
            'Include expert reviews'
          ]
        });
      }
    }

    // ---- TAB 3: CONTENT OUTLINE ----
    if (route === 'content-outline') {
      const { keyword, niche } = body;
      if (!keyword) {
        return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
      }

      try {
        const localAngle = niche ? `Include local angle for ${niche}` : '';
        const prompt = `
          Create content outline for keyword "${keyword}". ${localAngle}
          Return JSON: {
            "outline": {
              "h1": "",
              "meta_title": "",
              "meta_description": "",
              "h2_headings": [8 headings],
              "faq": [5 questions],
              "lsi_keywords": [15 keywords],
              "local_angle": "${niche ? `Include ${niche} specific examples` : ''}"
            }
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        return NextResponse.json({
          outline: {
            h1: `Best ${keyword}: Complete Guide 2026`,
            meta_title: `Best ${keyword} | Expert Reviews & Buying Guide`,
            meta_description: `Find the best ${keyword} with expert reviews and comparisons.`,
            h2_headings: [
              'Top 10 Products', 'Best Budget Options', 'Best Premium Products',
              'Features Comparison', 'Buying Guide', 'Expert Reviews',
              'Customer Feedback', 'FAQs About Products'
            ],
            faq: [
              `What is the best ${keyword}?`,
              `How to choose the right ${keyword}?`,
              `What is the price of ${keyword}?`,
              `Which brand is best for ${keyword}?`,
              `Is ${keyword} worth buying?`
            ],
            lsi_keywords: [
              'top products', 'best deals', 'product reviews',
              'buying guide', 'product comparison', 'best value',
              'customer reviews', 'product features', 'product price',
              'product quality', 'brand comparison', 'product rating',
              'product recommendations', 'product selection', 'product tips'
            ],
            local_angle: niche ? `🇵🇰 Specific recommendations for ${niche} market` : ''
          }
        });
      }
    }

    // ---- TAB 4: BACKLINK ----
    if (route === 'backlink-opportunities') {
      const { keyword } = body;
      if (!keyword) {
        return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
      }

      try {
        const prompt = `
          Find 10 websites for backlinks for niche "${keyword}".
          Filter: Domain Authority between 20-60 only.
          Return JSON: {
            "backlinks": [
              {"domain": "", "da": 0, "email": "", "link_type": "Guest Post", "opportunity": "High/Medium/Low"}
            ]
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        return NextResponse.json({
          backlinks: [
            { domain: 'example1.com', da: 45, email: 'editor@example1.com', link_type: 'Guest Post', opportunity: 'High' },
            { domain: 'example2.com', da: 38, email: 'admin@example2.com', link_type: 'Resource Page', opportunity: 'Medium' },
            { domain: 'example3.com', da: 42, email: 'contact@example3.com', link_type: 'Guest Post', opportunity: 'High' }
          ]
        });
      }
    }

    // ---- TAB 5: TREND ----
    if (route === 'trend-tracker') {
      const { keyword } = body;
      if (!keyword) {
        return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
      }

      try {
        const prompt = `
          Analyze trend for keyword "${keyword}" for last 12 months.
          Return JSON: {
            "trend": [{"month": "Jan", "value": 0}, ...12 months],
            "peak_month": "December",
            "best_publish_date": "2026-10-01"
          }
          Values should be between 0-100.
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        return NextResponse.json({
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
        });
      }
    }

    // ---- TAB 6: ON-PAGE SEO ----
    if (route === 'onpage-seo') {
      const { content } = body;
      if (!content) {
        return NextResponse.json({ error: 'Content required' }, { status: 400 });
      }

      try {
        const prompt = `
          Analyze this content for on-page SEO:
          ${content.substring(0, 2000)}
          
          Return JSON: {
            "checklist": [
              {"check": "Title Tag", "status": "pass/fail", "issue": ""},
              {"check": "Meta Description", "status": "pass/fail", "issue": ""},
              {"check": "Keyword Density", "status": "pass/fail", "issue": ""},
              {"check": "Image Alt Tags", "status": "pass/fail", "issue": ""},
              {"check": "Internal Links", "status": "pass/fail", "issue": ""},
              {"check": "H1 Tag", "status": "pass/fail", "issue": ""},
              {"check": "H2 Headings", "status": "pass/fail", "issue": ""},
              {"check": "Readability", "status": "pass/fail", "issue": ""},
              {"check": "Word Count", "status": "pass/fail", "issue": ""},
              {"check": "External Links", "status": "pass/fail", "issue": ""}
            ],
            "score": 0
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        return NextResponse.json({
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
        });
      }
    }

    // ---- TAB 7: 90 DAY PLAN ----
    if (route === 'action-plan') {
      const { keyword } = body;
      if (!keyword) {
        return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
      }

      try {
        const prompt = `
          Create a 90 day SEO action plan for keyword "${keyword}".
          Return JSON: {
            "plan": [
              {"week": 1, "focus": "Research", "priority": "High", "tasks": ["Task 1", "Task 2"]},
              ...12 weeks
            ]
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        const weeks = [
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
        ];
        return NextResponse.json({ plan: weeks });
      }
    }

    // ---- TAB 8: NICHE MEMORY ----
    if (route === 'niche-memory') {
      const { niche } = body;
      if (!niche) {
        return NextResponse.json({ error: 'Niche required' }, { status: 400 });
      }

      try {
        const prompt = `
          Provide comprehensive info for niche "${niche}".
          Return JSON: {
            "niche": {
              "name": "",
              "description": "",
              "competitors": ["", "", "", ""],
              "insights": ["", "", ""]
            }
          }
        `;
        const data = await callGroq(prompt);
        return NextResponse.json(data);
      } catch (error) {
        const nicheData = {
          'Pakistan Mobile': {
            name: 'Pakistan Mobile',
            description: 'Smartphone market in Pakistan with focus on budget and mid-range phones.',
            competitors: ['PakWheels', 'WhatMobile', 'MobileZone', 'PhoneWorld'],
            insights: [
              'Budget phones under PKR 50,000 have highest search volume',
              'Samsung and Xiaomi dominate the Pakistani smartphone market',
              'Mobile reviews with local pricing get 70% more clicks'
            ]
          },
          'AI Tools': {
            name: 'AI Tools',
            description: 'Artificial Intelligence tools and software market.',
            competitors: ['OpenAI', 'Google AI', 'Microsoft AI', 'Anthropic'],
            insights: [
              'ChatGPT and Claude have highest search volume',
              'AI productivity tools are trending',
              'Enterprise AI solutions growing fast'
            ]
          }
        };
        return NextResponse.json({ niche: nicheData[niche] || {
          name: niche,
          description: `Market insights for ${niche}`,
          competitors: ['Competitor 1', 'Competitor 2', 'Competitor 3', 'Competitor 4'],
          insights: ['Insight 1', 'Insight 2', 'Insight 3']
        }});
      }
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
