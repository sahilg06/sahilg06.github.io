/**
 * X Scholar (@vibespersecond) — Clean Google Scholar UI & Daily Post Lab
 * Designed for sahilg06.github.io
 */
(function () {
    const STORAGE_KEYS = {
        LOCAL_TWEETS: 'xscholar_local_tweets_v1',
        AI_PROVIDER: 'xscholar_ai_provider_v1',
        AI_KEY: 'xscholar_ai_key_v1',
    };

    const CLASSIC_ML_VAULT = [
        {
            id: 'classic-flow-matching',
            title: 'Flow Matching vs. Diffusion SDEs: Straight-Line Optimal Transport Paths',
            inspiration: "Lipman et al. (2022) & Rectified Flow notes",
            modernTie: 'Flux, SD3, Veo-style video generators, and few-step distillation',
            sandboxIdea: '2D particle flow canvas comparing curved VP-SDE paths vs. straight Conditional OT paths as step count N drops from 50 → 2.',
            hooks: [
                "Went a little back to basics today.\n\nWhenever I wanted clean geometric intuition on why Flow Matching replaced classic DDPM schedules in modern image/video models, I went back to the 2022 Rectified Flow & OT notes.\n\nBuilt an interactive visual note on why straight-line trajectories change everything for 4-step sampling:",
                "Why do DDPM trajectories curve in latent space while Flow Matching paths stay straight?\n\nIt comes down to a single conditioning trick in the transport ODE — and what happens when two trajectories intersect at t ∈ (0,1).\n\nInteractive visual breakdown + live NFE step slider:",
                "Can you get high-fidelity generation in 4 Euler steps without distillation?\n\nOnly if your probability flow ODE has zero curvature. Here is the exact geometry separating Score-Based Diffusion from Optimal Transport Flow Matching:"
            ],
            replyLink: "Interactive note + playground: https://sahilg06.github.io/blog.html"
        },
        {
            id: 'classic-gumbel-vq',
            title: 'Discrete Visual Tokenizers: Gumbel-Softmax, Straight-Through Estimators & FSQ',
            inspiration: "Jang et al. (2016) Gumbel-Softmax & Finite Scalar Quantization (FSQ)",
            modernTie: 'MaskGIT, MaGNeTS, and masked visual generation',
            sandboxIdea: '2D codebook commitment visualizer showing dead codes in VQ-VAE vs. temperature annealing τ → 0 in Gumbel-Softmax vs. hypercube grid in FSQ.',
            hooks: [
                "Went a little back to basics on discrete visual tokenizers today.\n\nWorking on masked generative transformers (like MaGNeTS), you constantly run into the core bottleneck: how gradients survive discrete quantization.\n\nMapped out the geometry of VQ-STE vs. Gumbel-Softmax vs. FSQ in one interactive guide:",
                "Why do VQ-VAE codebooks collapse at scale, and why did Finite Scalar Quantization (FSQ) replace learned codebooks in so many recent visual models?\n\nThe answer lies in the Jacobian of the Straight-Through Estimator.\n\nVisual intuition + interactive codebook sandbox:",
                "Autoregressive and masked visual models (MaskGIT / MaGNeTS) live or die by their tokenizer.\n\nWhenever I needed clarity on the Gumbel-Max trick and temperature annealing τ → 0, I went back to Jang et al.'s 2016 note — here is an interactive rebuild for modern vision:"
            ],
            replyLink: "Related to our ICML '25 paper MaGNeTS on nested token unmasking: https://arxiv.org/pdf/2502.00382"
        },
        {
            id: 'classic-cfg-geometry',
            title: 'The Geometry of Classifier-Free Guidance: Why High Scales Oversaturate & Clip Modes',
            inspiration: "Ho & Salimans (2022) Classifier-Free Diffusion Guidance",
            modernTie: 'Late-stage guidance scheduling (MaGNeTS) and interval guidance',
            sandboxIdea: '2D density plot where dragging guidance scale w from 1.0 to 12.0 shows mode sharpening vs. manifold overshoot, plus late-step guidance gating.',
            hooks: [
                "Why does cranking up Classifier-Free Guidance (w > 7) make generated images oversaturated?\n\nAnd why did we find in MaGNeTS that turning OFF guidance in early sampling steps improves efficiency without hurting quality?\n\nThe geometric intuition:",
                "Went back to the fundamentals of Classifier-Free Guidance (CFG) today.\n\nWe write s = s_uncond + w(s_cond - s_uncond) in three lines of PyTorch, but geometrically it's a power-law tilt p(x|c)^w / p(x)^(w-1) that pushes early denoising off-manifold.\n\nInteractive breakdown:",
                "A simple compute win in visual generation:\n\nYou don't need Classifier-Free Guidance in early denoising/unmasking steps. Early steps only set global layout; guidance only matters when resolving high-frequency semantics. Here's why:"
            ],
            replyLink: "More on late-stage guidance & decode-time scaling in MaGNeTS (ICML '25): https://arxiv.org/pdf/2502.00382"
        },
        {
            id: 'classic-looped-test-time',
            title: 'Weight-Tied & Looped Transformers: Adaptive Test-Time Compute in Vision',
            inspiration: "Universal Transformers & Elastic Looped Transformers (ECCV 2026)",
            modernTie: 'Elastic Looped Transformers (ECCV 2026) and MaGNeTS',
            sandboxIdea: 'Interactive token-exit heatmap showing how flat background patches converge in 2 loops while intricate regions allocate 8+ loops.',
            hooks: [
                "Why should every image patch or generation step spend the exact same FLOPs?\n\nA clear sky patch doesn't need the same transformer depth as a human hand or dense text.\n\nHow weight-tied Looped Transformers + Nested architectures unlock elastic test-time compute:",
                "In LLMs, test-time compute scaling is standard. What is the equivalent for visual generation?\n\nIn our ECCV 2026 work on Elastic Looped Transformers & ICML '25 MaGNeTS, we explored two orthogonal axes: looping depth vs. nested width:",
                "Went back to the math of weight-tied / looped transformers today.\n\nUnrolling a shared transformer block across T iterations isn't just parameter compression — it's an iterative refinement operator in latent space:"
            ],
            replyLink: "Paper (ECCV 2026): Elastic Looped Transformers for Visual Generation — https://arxiv.org/abs/2604.09168"
        }
    ];

    const ACADEMIC_RESOURCE_PLAYBOOKS = [
        {
            id: 'res-phd-sop-anatomy',
            title: 'The 5-Paragraph Anatomy of My PhD Statement of Purpose (UT Austin, EPFL, MILA, ELLIS)',
            metricsRef: 'Matches your #1 post: PhD Application Tracker (1,178 citations, 35K views)',
            hooks: [
                "With ML/CV PhD deadlines around the corner, the #1 question in my DMs is how to structure a Statement of Purpose.\n\nLast cycle I was fortunate to receive PhD offers from UT Austin, EPFL, MILA, and ELLIS.\n\nI annotated my exact UT Austin SOP paragraph-by-paragraph so you can use it as a template:",
                "Most PhD Statements of Purpose lose momentum in paragraph 1 because they start with a generic backstory instead of a research thesis.\n\nSharing the exact SOP I submitted last cycle (accepted at UT Austin, EPFL, MILA, ELLIS) with section-by-section notes:",
                "Applying for an ML / Vision PhD this cycle?\n\nTo pair with the PhD Application & Faculty Tracker I shared earlier, here is my full annotated Statement of Purpose + how I tailored faculty paragraphs:"
            ],
            replyLink: "Annotated SOP: https://sahilg06.github.io/blog_posts/phd-statement-of-purpose.html\nPhD Tracker Sheet: https://sahilg06.github.io/blog_posts/phd-application-tracker.html",
            visualTip: 'Attach a side-by-side screenshot of the annotated SOP margin notes.'
        },
        {
            id: 'res-predoc-residency-guide',
            title: 'Pre-Doctoral AI Residencies (Google DeepMind, MSR, Meta): Timeline & Prep Guide',
            metricsRef: 'Builds on your Google DeepMind AI Residency FAQ & MSR thread',
            hooks: [
                "Not ready to commit to a 5-year PhD right out of undergrad, or coming from a non-CS major?\n\nPre-Doctoral AI Residencies (Google DeepMind, MSR, Meta, AllenAI) are the best bridge into frontier ML research.\n\nHaving gone from Applied Math @ IITR → Adobe Research → Google DeepMind Residency, here is my complete FAQ:",
                "When I applied for MSR's Research Fellow program in college, my CS department HOD refused to sign my recommendation without looking at my profile because my major was Applied Math, not CS.\n\nDon't let gatekeeping stop you. Here are the AI Residency & Pre-Doc programs that judge you purely on research + code:",
                "A lot of undergrads asked about transitioning to frontier ML labs (Google DeepMind, Adobe Research) and PhD offers.\n\nPut together a zero-fluff FAQ on timelines, research coding interviews, and building a research portfolio:"
            ],
            replyLink: "Google DeepMind India Pre-Doctoral Researcher FAQ: https://docs.google.com/document/d/1xYFN5K_436zMUY5o4CYNeqAdUlZ1la-ZWUdjD0f0p3Y/edit?usp=sharing",
            visualTip: 'Include a clean timeline graphic comparing PhD deadlines vs. AI Residency windows.'
        }
    ];

    const PORTFOLIO_FOLLOWUPS = [
        {
            id: 'followup-kl-pitchfork',
            title: 'The Exact Δμ = σ√(2 log 2) ≈ 1.177σ Pitchfork Bifurcation in Reverse KL',
            metricsRef: 'Direct follow-up to your Oct 27 Forward vs. Reverse KL post (169 citations)',
            hooks: [
                "My favorite mathematical gem while building the interactive Forward vs. Reverse KL note:\n\nIf the target P(x) is a symmetric bimodal Gaussian with peak separation 2Δμ, Reverse KL doesn't gradually become mode-seeking.\n\nIt undergoes an exact pitchfork bifurcation at Δμ = σ√(2 log 2) ≈ 1.177σ. Here's why:",
                "Quick quiz on KL Divergence:\n\nSuppose P(x) is an equal mixture of two Gaussians N(-Δμ, 1) and N(+Δμ, 1). If you fit a single Gaussian Q(x) using Reverse KL, does it ALWAYS snap to one mode?\n\nNo! Below Δμ = √(2 log 2) ≈ 1.177, Reverse KL is still mode-covering (μ_Q = 0). At 1.177, the center becomes unstable:",
                "Why does RLHF (Reverse KL) collapse diversity when reward peaks are separated, while SFT (Forward KL) hedges in the middle?\n\nYou can see the exact phase transition at Δμ/σ = √(2 log 2) ≈ 1.18 in 10 seconds using the interactive slider:"
            ],
            replyLink: "Try the 'Critical Threshold (Δμ ≈ 1.18σ)' preset in the live sandbox: https://sahilg06.github.io/blog_posts/forward-vs-reverse-kl.html#interactive-sandbox",
            visualTip: 'Short GIF dragging the Peak Separation Δμ slider across 1.18 as the red Reverse KL curve snaps to one peak.'
        },
        {
            id: 'followup-moe-routing',
            title: 'Visual MoEs vs. LLM MoEs: Why Token-Choice Routing Breaks on Spatial Redundancy',
            metricsRef: 'Builds on your Aug 2026 X Article on MoEs for Visual Generative Models (212 citations)',
            hooks: [
                "In LLMs, Mixture-of-Experts (MoE) routing works naturally because discrete words carry distinct semantic roles.\n\nIn visual generation, naive top-k token routing wastes capacity on flat background patches.\n\n3 routing shifts fixing visual MoEs:",
                "If you train a standard Top-2 MoE inside a Diffusion Transformer (DiT), what do the experts specialize in?\n\nWithout timestep-aware or semantic prototype routing, experts split by noise level t or image coordinates rather than semantics.\n\nA quick synthesis:",
                "Efficiency in visual generation isn't just fewer sampling steps — it's conditional computation per token.\n\nComparing 3 ways modern vision models allocate compute:\n1. Nested dimensions (MaGNeTS)\n2. Elastic looped depth (ELT)\n3. Semantic prototype MoE routing:"
            ],
            replyLink: "Full article on MoEs for Visual Generative Models: https://x.com/vibespersecond/status/2086456634545754291",
            visualTip: '3-column diagram: Nested Width (MaGNeTS) vs. Adaptive Loop Depth (ELT) vs. Visual MoE Routing.'
        }
    ];

    let store = { profile: {}, tweets: [] };
    let filterState = {
        search: '',
        category: 'all',
        coauthor: '',
        year: 'all',
        sort: 'citations',
        limit: 20
    };
    let liveSignals = {
        hfPapers: [],
        arxivPapers: [],
        techPulse: [],
        shuffleSeed: 0
    };
    let activePostLabArch = 'all';
    let customRadarDrafts = [];

    const fmtNum = n => {
        const v = Number(n) || 0;
        if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(v);
    };

    const computeCitations = m => {
        if (!m) return 0;
        return Math.round(
            (Number(m.likes) || 0) +
            2 * (Number(m.bookmarks) || 0) +
            3 * (Number(m.reposts) || 0) +
            2 * ((Number(m.replies) || 0) + (Number(m.quotes) || 0))
        );
    };

    const showToastMsg = text => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = text;
        container.replaceChildren(toast);
        setTimeout(() => toast.remove(), 2400);
    };

    const copyText = (text, label = 'Copied') => {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => showToastMsg(label));
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); showToastMsg(label); } catch (e) {}
            ta.remove();
        }
    };

    const escapeHtml = str =>
        String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    async function loadStore() {
        try {
            const res = await fetch('./data/twitter-scholar.json?v=' + Date.now());
            if (res.ok) store = await res.json();
        } catch (err) {}

        try {
            const localRaw = localStorage.getItem(STORAGE_KEYS.LOCAL_TWEETS);
            if (localRaw) {
                const localList = JSON.parse(localRaw);
                if (Array.isArray(localList) && localList.length) {
                    const byId = new Map((store.tweets || []).map(t => [t.id, t]));
                    for (const lt of localList) {
                        if (lt && lt.id) byId.set(lt.id, lt);
                    }
                    store.tweets = Array.from(byId.values());
                }
            }
        } catch (e) {}

        for (const t of store.tweets || []) {
            t.citations = computeCitations(t.metrics);
        }
    }

    function saveLocalTweet(tweetObj) {
        let localList = [];
        try { localList = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_TWEETS) || '[]'); } catch (e) {}
        const idx = localList.findIndex(x => x.id === tweetObj.id);
        if (idx >= 0) localList[idx] = tweetObj;
        else localList.unshift(tweetObj);
        localStorage.setItem(STORAGE_KEYS.LOCAL_TWEETS, JSON.stringify(localList));

        const sIdx = store.tweets.findIndex(x => x.id === tweetObj.id);
        if (sIdx >= 0) store.tweets[sIdx] = tweetObj;
        else store.tweets.unshift(tweetObj);
    }

    function calcIndices(tweetsSubset) {
        const cites = tweetsSubset.map(t => t.citations || 0).sort((a, b) => b - a);
        const totalCitations = cites.reduce((a, b) => a + b, 0);
        let hIndex = 0;
        for (let i = 0; i < cites.length; i++) {
            if (cites[i] >= i + 1) hIndex = i + 1;
            else break;
        }
        const i100 = cites.filter(c => c >= 100).length;
        const i10 = cites.filter(c => c >= 10).length;
        const totalViews = tweetsSubset.reduce((acc, t) => acc + (Number(t.metrics?.views) || 0), 0);
        return { totalCitations, hIndex, i100, i10, totalViews };
    }

    function renderScholarSidebar() {
        const allTweets = store.tweets || [];
        const recentTweets = allTweets.filter(t => Number(t.year) >= 2026);

        const allStats = calcIndices(allTweets);
        const recStats = calcIndices(recentTweets);

        document.getElementById('stat-citations-all').textContent = allStats.totalCitations.toLocaleString();
        document.getElementById('stat-citations-recent').textContent = recStats.totalCitations.toLocaleString();
        document.getElementById('stat-hindex-all').textContent = allStats.hIndex;
        document.getElementById('stat-hindex-recent').textContent = recStats.hIndex;
        document.getElementById('stat-i100-all').textContent = allStats.i100;
        document.getElementById('stat-i100-recent').textContent = recStats.i100;
        document.getElementById('stat-i10-all').textContent = allStats.i10;
        document.getElementById('stat-i10-recent').textContent = recStats.i10;
        document.getElementById('stat-views-all').textContent = fmtNum(allStats.totalViews);
        document.getElementById('stat-views-recent').textContent = fmtNum(recStats.totalViews);

        document.getElementById('gs-indexed-count').textContent = allTweets.length;
        if (store.profile?.followers) {
            document.getElementById('gs-followers-count').textContent = Number(store.profile.followers).toLocaleString();
        }

        // Clean Google Scholar topic links under author bio
        const interestsContainer = document.getElementById('gs-interests-list');
        const categories = [
            { id: 'Efficient ML & Generative Models', label: 'Efficient Generative Models' },
            { id: 'Interactive Notes & Theory', label: 'Interactive ML Notes' },
            { id: 'Academic & PhD Resources', label: 'PhD & Academic Resources' },
            { id: 'Paper Releases & Conferences', label: 'Conferences & Papers' },
            { id: 'AI Commentary & Reflections', label: 'AI Commentary' }
        ];
        interestsContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gs-interest-link' + (filterState.category === cat.id ? ' active' : '');
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                filterState.category = filterState.category === cat.id ? 'all' : cat.id;
                switchTab('profile');
                renderScholarSidebar();
                renderPublicationsTable();
            });
            interestsContainer.appendChild(btn);
        });

        // Clean bar chart by year/half
        const periods = [
            { label: '2024', match: t => Number(t.year) <= 2024, yearFilter: '2024' },
            { label: "H1 '25", match: t => Number(t.year) === 2025 && ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes((t.month || '').slice(0, 3)), yearFilter: '2025' },
            { label: "H2 '25", match: t => Number(t.year) === 2025 && !['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes((t.month || '').slice(0, 3)), yearFilter: '2025' },
            { label: '2026', match: t => Number(t.year) >= 2026, yearFilter: '2026' }
        ];
        const periodTotals = periods.map(p => ({
            ...p,
            citations: allTweets.filter(p.match).reduce((s, t) => s + (t.citations || 0), 0)
        }));
        const maxCit = Math.max(...periodTotals.map(p => p.citations), 1);

        const barsRoot = document.getElementById('gs-impact-bars');
        barsRoot.innerHTML = '';
        periodTotals.forEach(p => {
            const col = document.createElement('button');
            col.type = 'button';
            col.className = 'gs-bar-col';
            col.title = `${p.label}: ${p.citations.toLocaleString()} citations`;
            const pct = Math.max(6, Math.round((p.citations / maxCit) * 100));
            col.innerHTML = `
                <span class="gs-bar-val">${fmtNum(p.citations)}</span>
                <span class="gs-bar-track"><span class="gs-bar-fill" style="height:${pct}%"></span></span>
                <span class="gs-bar-label">${p.label}</span>
            `;
            col.addEventListener('click', () => {
                filterState.year = filterState.year === p.yearFilter ? 'all' : p.yearFilter;
                document.getElementById('gs-year-select').value = filterState.year;
                switchTab('profile');
                renderPublicationsTable();
            });
            barsRoot.appendChild(col);
        });

        // Concise Archetypes list
        const archMap = new Map();
        allTweets.forEach(t => {
            const a = t.archetype || 'General';
            if (!archMap.has(a)) archMap.set(a, { count: 0, citations: 0 });
            const entry = archMap.get(a);
            entry.count += 1;
            entry.citations += t.citations || 0;
        });
        const archStats = Array.from(archMap.entries())
            .map(([name, s]) => ({
                name: name.replace('High-Utility Academic / Career Resource', 'Academic / PhD Resource')
                          .replace('Research Milestone & Conference Update', 'Research Milestone')
                          .replace('Technical Deep-Dive / Paper Thread', 'Paper Thread')
                          .replace('Personal Reflection & Researcher Life', 'Researcher Life')
                          .replace('Back-to-Basics Math/ML Insight', 'Interactive / Math Note'),
                avgCitations: Math.round(s.citations / s.count)
            }))
            .sort((a, b) => b.avgCitations - a.avgCitations);

        const archRoot = document.getElementById('gs-archetypes-list');
        archRoot.innerHTML = '';
        const topRecs = buildDailyRecommendations().slice(0, 4);
        topRecs.forEach(rec => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gs-side-idea-btn';
            btn.innerHTML = `
                <span class="gs-side-idea-title">${escapeHtml(rec.title)}</span>
                <span class="gs-side-idea-meta">${escapeHtml(rec.archetype)} · Est. ${escapeHtml(rec.predictedCitations)}</span>
            `;
            btn.addEventListener('click', () => {
                switchTab('postlab');
                const target = document.getElementById(rec.id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            archRoot.appendChild(btn);
        });
    }

    function renderPublicationsTable() {
        const tbody = document.getElementById('gs-tbody');
        const allTweets = store.tweets || [];

        const thCit = document.getElementById('th-sort-citations');
        const thYr = document.getElementById('th-sort-year');
        if (thCit && thYr) {
            thCit.classList.toggle('active', filterState.sort !== 'date');
            thYr.classList.toggle('active', filterState.sort === 'date');
        }

        const q = filterState.search.trim().toLowerCase();
        const filtered = allTweets.filter(t => {
            if (filterState.category !== 'all' && t.category !== filterState.category) return false;
            if (filterState.year === '2026' && Number(t.year) < 2026) return false;
            if (filterState.year === '2025' && Number(t.year) < 2025) return false;
            if (filterState.year === '2024' && Number(t.year) > 2024) return false;
            if (q) {
                const hay = `${t.title} ${t.text} ${t.category} ${t.month}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            if (filterState.sort === 'views') return (b.metrics?.views || 0) - (a.metrics?.views || 0);
            if (filterState.sort === 'likes') return (b.metrics?.likes || 0) - (a.metrics?.likes || 0);
            if (filterState.sort === 'bookmarks') return (b.metrics?.bookmarks || 0) - (a.metrics?.bookmarks || 0);
            if (filterState.sort === 'date') return String(b.created_at).localeCompare(String(a.created_at));
            return (b.citations || 0) - (a.citations || 0);
        });

        const activeBar = document.getElementById('gs-active-filter-bar');
        const activeLabel = document.getElementById('gs-active-filter-label');
        const parts = [];
        if (filterState.category !== 'all') parts.push(filterState.category);
        if (filterState.year !== 'all') parts.push(`Year: ${filterState.year}`);
        if (q) parts.push(`"${filterState.search}"`);
        if (parts.length) {
            activeBar.hidden = false;
            activeLabel.textContent = `${filtered.length} results for ${parts.join(' · ')}`;
        } else {
            activeLabel.textContent = '';
            activeBar.hidden = true;
        }

        tbody.innerHTML = '';
        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="gs-empty">No matching posts found.</td></tr>`;
            document.getElementById('gs-page-summary').textContent = '0 posts';
            document.getElementById('btn-show-more-posts').hidden = true;
            return;
        }

        const visible = filtered.slice(0, filterState.limit);
        visible.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'gs-row';
            const m = t.metrics || {};
            const repliesTotal = (m.replies || 0) + (m.quotes || 0);
            const formulaBreakdown = `${t.citations || 0} = 1×Likes(${m.likes || 0}) + 2×Bookmarks(${m.bookmarks || 0}) + 3×Reposts(${m.reposts || 0}) + 2×Replies(${repliesTotal})`;
            const cleanBody = (t.text || '').replace(/\s+/g, ' ').trim();
            const showSnippet = cleanBody && cleanBody.toLowerCase() !== (t.title || '').toLowerCase();

            tr.innerHTML = `
                <td class="gs-cell-title" data-label="Title">
                    <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="gs-post-title">${escapeHtml(t.title)}</a>
                    ${showSnippet ? `<div class="gs-gray-line">${escapeHtml(cleanBody)}</div>` : ''}
                    <div class="gs-post-venue">
                        <span>${escapeHtml(t.category)}</span>
                        <span>·</span>
                        <span>${m.likes || 0} likes</span>
                        ${m.bookmarks ? `<span>· ${m.bookmarks} bookmarks</span>` : ''}
                        ${m.reposts ? `<span>· ${m.reposts} reposts</span>` : ''}
                        <span>· ${fmtNum(m.views || 0)} views</span>
                        <span>·</span>
                        <button type="button" class="gs-inline-action" data-action="toggle-text">Read text</button>
                        <span>·</span>
                        <button type="button" class="gs-inline-action" data-action="template">Use as template</button>
                    </div>
                    <p class="gs-post-fulltext" hidden>${escapeHtml(t.text)}</p>
                </td>
                <td class="gs-cell-cited" data-label="Cited by">
                    <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="gs-cited-num gs-tooltip-trigger" data-tooltip="${escapeHtml(formulaBreakdown)}">${t.citations || 0}</a>
                </td>
                <td class="gs-cell-year" data-label="Year">
                    <span class="gs-year-text">${escapeHtml(String(t.year || ''))}</span>
                </td>
            `;

            const fullTextP = tr.querySelector('.gs-post-fulltext');
            const toggleBtn = tr.querySelector('[data-action="toggle-text"]');
            toggleBtn.addEventListener('click', () => {
                const isHidden = fullTextP.hidden;
                fullTextP.hidden = !isHidden;
                toggleBtn.textContent = isHidden ? 'Hide text' : 'Read text';
            });

            tr.querySelector('[data-action="template"]').addEventListener('click', () => {
                switchTab('scorer');
                const input = document.getElementById('scorer-draft-input');
                input.value = t.text;
                document.getElementById('scorer-opt-media').checked = !!t.has_media;
                evaluateDraft();
                input.focus();
            });

            tbody.appendChild(tr);
        });

        document.getElementById('gs-page-summary').textContent = `1–${visible.length} of ${filtered.length}`;
        document.getElementById('btn-show-more-posts').hidden = visible.length >= filtered.length;
    }

    // ==================== LIVE DAILY SIGNALS & POST LAB ====================
    async function fetchLiveSignals(isManualRefresh = false) {
        if (isManualRefresh) liveSignals.shuffleSeed += 1;

        try {
            const hfRes = await fetch('https://huggingface.co/api/daily_papers?limit=15');
            if (hfRes.ok) {
                const hfData = await hfRes.json();
                liveSignals.hfPapers = (hfData || []).map(item => {
                    const p = item.paper || item;
                    return {
                        id: p.id || '',
                        title: p.title || item.title || '',
                        summary: (p.summary || '').replace(/\s+/g, ' ').trim(),
                        upvotes: p.upvotes || item.numComments || 25,
                        url: `https://huggingface.co/papers/${p.id}`,
                        source: 'Hugging Face'
                    };
                }).filter(p => p.title);
                document.getElementById('signal-hf')?.classList.add('signal-ready');
            }
        } catch (e) {}

        try {
            const arxivQuery = encodeURIComponent('all:diffusion OR all:transformer OR all:"visual generation" OR all:"mixture of experts"');
            const arxRes = await fetch(`https://export.arxiv.org/api/query?search_query=${arxivQuery}&sortBy=submittedDate&sortOrder=descending&max_results=10`);
            if (arxRes.ok) {
                const xmlText = await arxRes.text();
                const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
                liveSignals.arxivPapers = Array.from(doc.querySelectorAll('entry')).map(ent => {
                    const idUrl = ent.querySelector('id')?.textContent?.trim() || '';
                    const shortId = idUrl.split('/abs/').pop() || '';
                    return {
                        id: shortId,
                        title: (ent.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim(),
                        summary: (ent.querySelector('summary')?.textContent || '').replace(/\s+/g, ' ').trim(),
                        url: idUrl || `https://arxiv.org/abs/${shortId}`,
                        source: 'arXiv'
                    };
                }).filter(p => p.title);
                document.getElementById('signal-arxiv')?.classList.add('signal-ready');
            }
        } catch (e) {}

        try {
            const hnRes = await fetch('https://hn.algolia.com/api/v1/search?query=AI%20OR%20LLM%20OR%20model%20OR%20GPU&tags=story&numericFilters=points>40&hitsPerPage=10');
            if (hnRes.ok) {
                const hnData = await hnRes.json();
                liveSignals.techPulse = (hnData.hits || []).map(h => ({
                    id: h.objectID,
                    title: h.title,
                    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
                    points: h.points || 0,
                    source: 'Tech Pulse'
                })).filter(h => h.title);
                document.getElementById('signal-hn')?.classList.add('signal-ready');
            }
        } catch (e) {}

        renderPostLab();
        renderLiveRadar();
        if (isManualRefresh) showToastMsg('Updated daily suggestions');
    }

    function pickRankedPaper() {
        const pool = [...liveSignals.hfPapers, ...liveSignals.arxivPapers];
        const keywords = ['diffusion', 'visual', 'image', 'video', 'token', 'moe', 'efficient', 'attention', 'flow', 'distill', 'cache', 'scaling', 'loop'];
        if (!pool.length) {
            return {
                title: 'Test-Time Compute Scaling for Diffusion & Masked Generative Transformers',
                url: 'https://arxiv.org/abs/2502.00382',
                summary: 'Allocating adaptive compute across denoising steps improves efficiency without extra parameters.',
                source: 'arXiv'
            };
        }
        const scored = pool.map(p => {
            const text = `${p.title} ${p.summary}`.toLowerCase();
            let score = (p.upvotes || 10);
            keywords.forEach(k => { if (text.includes(k)) score += 25; });
            return { ...p, _score: score };
        }).sort((a, b) => b._score - a._score);

        return scored[liveSignals.shuffleSeed % Math.min(scored.length, 6)];
    }

    function pickTechPulse() {
        if (!liveSignals.techPulse.length) {
            return {
                title: 'Why Inference Compute & Post-Training Efficiency Are Overtaking Pre-Training Scale',
                url: 'https://x.com/vibespersecond',
                points: 240,
                source: 'Tech Pulse'
            };
        }
        return liveSignals.techPulse[liveSignals.shuffleSeed % Math.min(liveSignals.techPulse.length, 6)];
    }

    function buildDailyRecommendations() {
        const seed = liveSignals.shuffleSeed;
        const classicNote = CLASSIC_ML_VAULT[seed % CLASSIC_ML_VAULT.length];
        const resourcePlay = ACADEMIC_RESOURCE_PLAYBOOKS[seed % ACADEMIC_RESOURCE_PLAYBOOKS.length];
        const portfolioPlay = PORTFOLIO_FOLLOWUPS[seed % PORTFOLIO_FOLLOWUPS.length];
        const livePaper = pickRankedPaper();
        const techStory = pickTechPulse();

        return [
            ...customRadarDrafts,
            {
                id: 'rec-interactive-' + classicNote.id,
                archKey: 'interactive',
                archetype: 'Interactive ML Note',
                title: classicNote.title,
                predictedCitations: '165–320 citations',
                whyItWorks: `Mirrors your Oct 27 Forward vs. Reverse KL post (169 citations). Connecting ${classicNote.inspiration} to ${classicNote.modernTie} drives 3× higher bookmarks.`,
                hooks: classicNote.hooks,
                replyLink: classicNote.replyLink
            },
            {
                id: 'rec-resource-' + resourcePlay.id,
                archKey: 'resource',
                archetype: 'PhD & Career Resource',
                title: resourcePlay.title,
                predictedCitations: '420–1,150 citations',
                whyItWorks: resourcePlay.metricsRef,
                hooks: resourcePlay.hooks,
                replyLink: resourcePlay.replyLink
            },
            {
                id: 'rec-paper-live',
                archKey: 'paper',
                archetype: `Live Paper (${livePaper.source})`,
                title: livePaper.title,
                predictedCitations: '110–240 citations',
                whyItWorks: `Matches your MaGNeTS (278 citations) & Visual MoE (212 citations) threads.`,
                hooks: [
                    `Reading "${livePaper.title}" today.\n\nWhat stood out to me is how closely this connects to a question we keep hitting in efficient visual generation: where should compute actually go during inference?\n\nQuick 3-point takeaway on what works (and what's still open):`,
                    `Can we get better generation quality without scaling model parameters?\n\nA fresh paper on ${livePaper.source} ("${livePaper.title}") tackles this from a clean angle.\n\nHere is the core mechanism — and how it compares to nested/looped decode-time scaling:`,
                    `Interesting new work out today: "${livePaper.title}".\n\n${livePaper.summary ? livePaper.summary.slice(0, 150) + '…' : 'Rethinks efficiency and representation scaling.'}\n\nWhy this matters if you work on generative models:`
                ],
                replyLink: `Paper: ${livePaper.url}`
            },
            {
                id: 'rec-followup-' + portfolioPlay.id,
                archKey: 'followup',
                archetype: 'Follow-Up Thread',
                title: portfolioPlay.title,
                predictedCitations: '130–260 citations',
                whyItWorks: portfolioPlay.metricsRef,
                hooks: portfolioPlay.hooks,
                replyLink: portfolioPlay.replyLink
            },
            {
                id: 'rec-quotetweet-live',
                archKey: 'quotetweet',
                archetype: 'Quick Take',
                title: techStory.title,
                predictedCitations: '65–150 citations',
                whyItWorks: `Short 2-paragraph observation grounded in real research experience.`,
                hooks: [
                    `Watching the discussion around "${techStory.title}" today.\n\nFrom the trenches of training generative models: the bottleneck is shifting from raw parameter count to knowing *which* tokens and *which* steps actually deserve FLOPs.`,
                    `Thought inspired by "${techStory.title}":\n\nThe best ML papers over the next 2 years won't be 10× larger models — they'll be classic 2016–2018 mathematical ideas revisited with modern hardware & interactive intuition.`,
                    `On "${techStory.title}":\n\nAs AI automates more boilerplate coding, two things appreciate in value for researchers: deep mathematical taste and genuine human connection.`
                ],
                replyLink: `Context: ${techStory.url}`
            }
        ];
    }

    function renderPostLab() {
        const root = document.getElementById('postlab-cards');
        const allRecs = buildDailyRecommendations();
        const visible = activePostLabArch === 'all'
            ? allRecs
            : allRecs.filter(r => r.archKey === activePostLabArch);

        document.getElementById('postlab-count-badge').textContent = String(allRecs.length);
        root.innerHTML = '';

        visible.forEach((rec, idx) => {
            const item = document.createElement('article');
            item.className = 'postlab-item';
            item.id = rec.id;
            const num = String(idx + 1).padStart(2, '0');

            item.innerHTML = `
                <h3 class="postlab-item-title">${escapeHtml(rec.title)}</h3>
                <div class="postlab-green-line">${num} · ${escapeHtml(rec.archetype)} - Est. ${escapeHtml(rec.predictedCitations)} - x.com/vibespersecond</div>
                <p class="postlab-item-why">${escapeHtml(rec.whyItWorks)}</p>

                <div class="postlab-hooks-bar">
                    <div class="postlab-hook-pills" role="group" aria-label="Hook variations">
                        <button type="button" class="gs-hook-btn active" data-hidx="0">Hook 1</button>
                        <button type="button" class="gs-hook-btn" data-hidx="1">Hook 2</button>
                        <button type="button" class="gs-hook-btn" data-hidx="2">Hook 3</button>
                    </div>
                    <span class="postlab-char" data-role="char"></span>
                </div>

                <textarea class="postlab-textarea" rows="5" data-role="main-text">${escapeHtml(rec.hooks[0] || '')}</textarea>

                <div class="postlab-reply-line">
                    <span>Reply #2 link:</span>
                    <input type="text" data-role="reply-text" value="${escapeHtml(rec.replyLink.replace(/\n+/g, ' — '))}">
                </div>

                <div class="postlab-actions-row">
                    <button type="button" class="gsc-btn-primary" data-action="post-x">Post on X ↗</button>
                    <button type="button" class="gsc-btn-secondary" data-action="copy-main">Copy text</button>
                    <button type="button" class="gs-text-btn" data-action="copy-reply">Copy reply link</button>
                    <button type="button" class="gs-text-btn" data-action="ai-rewrite">✨ AI polish</button>
                    <button type="button" class="gs-text-btn" data-action="score-draft">Score draft →</button>
                </div>
            `;

            const mainTa = item.querySelector('[data-role="main-text"]');
            const replyIn = item.querySelector('[data-role="reply-text"]');
            const charSpan = item.querySelector('[data-role="char"]');
            const updateChars = () => {
                const len = mainTa.value.length;
                charSpan.textContent = `${len} chars`;
            };
            updateChars();
            mainTa.addEventListener('input', updateChars);

            const hookBtns = item.querySelectorAll('.gs-hook-btn');
            hookBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    hookBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    mainTa.value = rec.hooks[Number(btn.dataset.hidx) || 0] || rec.hooks[0];
                    updateChars();
                });
            });

            item.querySelector('[data-action="post-x"]').addEventListener('click', () => {
                window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(mainTa.value)}`, '_blank', 'noopener');
            });
            item.querySelector('[data-action="copy-main"]').addEventListener('click', () => {
                copyText(mainTa.value, 'Copied post');
            });
            item.querySelector('[data-action="copy-reply"]').addEventListener('click', () => {
                copyText(replyIn.value, 'Copied reply link');
            });
            item.querySelector('[data-action="score-draft"]').addEventListener('click', () => {
                switchTab('scorer');
                document.getElementById('scorer-draft-input').value = mainTa.value;
                evaluateDraft();
            });
            item.querySelector('[data-action="ai-rewrite"]').addEventListener('click', async e => {
                await polishWithAI(mainTa, rec.title, e.currentTarget, updateChars);
            });

            root.appendChild(item);
        });
    }

    function renderLiveRadar() {
        const list = document.getElementById('postlab-radar-grid');
        list.innerHTML = '';

        const items = [
            ...liveSignals.hfPapers.slice(0, 3),
            ...liveSignals.arxivPapers.slice(0, 3),
            ...liveSignals.techPulse.slice(0, 3)
        ];

        if (!items.length) {
            list.innerHTML = `<p class="gs-empty">Loading live feeds…</p>`;
            return;
        }

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'postlab-radar-row';
            row.innerHTML = `
                <div class="postlab-radar-info">
                    <span class="postlab-radar-source">${escapeHtml(item.source)}</span>
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="postlab-radar-title">${escapeHtml(item.title)} ↗</a>
                </div>
                <button type="button" class="gs-inline-action">Draft post →</button>
            `;
            row.querySelector('button').addEventListener('click', () => {
                const isPaper = item.source === 'Hugging Face' || item.source === 'arXiv';
                customRadarDrafts.unshift({
                    id: 'custom-' + Date.now(),
                    archKey: isPaper ? 'paper' : 'quotetweet',
                    archetype: `Live ${item.source}`,
                    title: item.title,
                    predictedCitations: '110–230 citations',
                    whyItWorks: `Drafted from today's live ${item.source} feed in @vibespersecond's style.`,
                    hooks: [
                        `Reading "${item.title}" today.\n\n${item.summary ? item.summary.slice(0, 140) + '…' : 'Clean formulation of an important efficiency bottleneck.'}\n\nKey takeaway:`,
                        `Can we push efficiency further without sacrificing generation quality?\n\nNew on ${item.source}: "${item.title}".\n\nHere is the core mechanism in 30 seconds:`,
                        `Quick thought on "${item.title}":\n\nThe highest-leverage breakthroughs right now come from rethinking *where* we spend compute rather than scaling parameters.`
                    ],
                    replyLink: item.url
                });
                activePostLabArch = 'all';
                renderPostLab();
                document.getElementById('postlab-cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToastMsg('Added draft at top of list');
            });
            list.appendChild(row);
        });
    }

    async function polishWithAI(textarea, topicTitle, btn, onUpdate) {
        const provider = localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'gemini';
        const apiKey = (localStorage.getItem(STORAGE_KEYS.AI_KEY) || '').trim();

        if (!apiKey) {
            const current = textarea.value.trim();
            const body = current.replace(/^Went a little back to basics today\.\s*/i, '').replace(/\n\nInteractive.*$/i, '');
            textarea.value = `Went a little back to basics today.\n\n${body}\n\nInteractive note + full breakdown in reply ↓`;
            onUpdate();
            showToastMsg('Applied @vibespersecond hook cadence (set optional API key for custom LLM rewrites)');
            return;
        }

        const orig = btn.textContent;
        btn.textContent = 'Rewriting…';
        btn.disabled = true;

        const prompt = `Rewrite this X post in the voice of Sahil Goyal (@vibespersecond, ML Researcher ex-Google DeepMind, Adobe Research). Keep it concise, grounded, technical, zero hype, under 270 chars:\n\nTopic: ${topicTitle}\nDraft:\n${textarea.value}`;

        try {
            let out = '';
            if (provider === 'gemini') {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const d = await res.json();
                out = d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            } else {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
                });
                const d = await res.json();
                out = d?.choices?.[0]?.message?.content?.trim() || '';
            }
            if (out) {
                textarea.value = out;
                onUpdate();
                showToastMsg('Rewritten with AI');
            }
        } catch (e) {
            showToastMsg('Check API key in settings');
        } finally {
            btn.textContent = orig;
            btn.disabled = false;
        }
    }

    // ==================== TAB 3: DRAFT SCORER ====================
    function evaluateDraft() {
        const text = (document.getElementById('scorer-draft-input').value || '').trim();
        const hasMedia = document.getElementById('scorer-opt-media').checked;
        const replyLink = document.getElementById('scorer-opt-replylink').checked;
        const isResource = document.getElementById('scorer-opt-resource').checked;
        const primeWindow = document.getElementById('scorer-opt-primewindow').checked;

        document.getElementById('scorer-char-count').textContent = `${text.length} / 280`;

        const tl = text.toLowerCase();
        const firstLine = (text.split('\n')[0] || '').trim();

        const hasStrongHook = /\?|back to basics|applying for|whenever i|why do|can we|my first work|sharing my/i.test(firstLine) && firstLine.length >= 16;
        const hasQuantOrMath = /(\d+×|\d+%|\d+k|kl|divergence|moe|diffusion|transformer|token|phd|icml|eccv|iclr|log\s*2|sde|ode|kv|latent)/i.test(text);
        const linkStrategyGood = replyLink && !/https?:\/\//i.test(text);
        const goodStructure = text.includes('\n\n') && text.length >= 70 && text.length <= 360;

        let score = 34;
        if (hasStrongHook) score += 16;
        else if (firstLine.length > 10) score += 7;
        if (hasQuantOrMath) score += 16;
        if (hasMedia) score += 14;
        if (linkStrategyGood) score += 10;
        if (isResource) score += 8;
        if (primeWindow) score += 6;
        if (goodStructure) score += 6;
        score = Math.min(99, Math.max(15, score));

        document.getElementById('scorer-total-score').textContent = `${score}/100`;
        document.getElementById('scorer-tier-badge').textContent = score >= 82 ? 'Top 10% tier' : (score >= 68 ? 'Strong reach' : 'Baseline');

        const baseCit = Math.round(Math.pow(score / 18, 2.55) * (isResource ? 1.4 : 1.0));
        const lowCit = Math.max(12, Math.round(baseCit * 0.75));
        const highCit = Math.max(25, Math.round(baseCit * 1.45));

        document.getElementById('scorer-pred-citations').textContent = `${lowCit}–${highCit}`;
        document.getElementById('scorer-pred-views').textContent = `${fmtNum(lowCit * 24)}–${fmtNum(highCit * 32)}`;
        document.getElementById('scorer-pred-likes').textContent = `${Math.round(lowCit * 0.42)}–${Math.round(highCit * 0.48)}`;
        document.getElementById('scorer-pred-bookmarks').textContent = `${Math.round(lowCit * 0.16)}–${Math.round(highCit * 0.24)}`;

        let matchedArch = 'General Update';
        if (isResource || /phd|tracker|sop|fellowship/i.test(tl)) matchedArch = 'PhD / Academic Resource (like Oct 12 Tracker · 1,178 cit.)';
        else if (/kl|interactive|basics|note|math|sandbox/i.test(tl)) matchedArch = 'Interactive ML Note (like Oct 27 KL Post · 169 cit.)';
        else if (/icml|eccv|accepted|deepmind/i.test(tl)) matchedArch = 'Research Milestone (like May 1 ICML Post · 690 cit.)';
        else if (/magnets|moe|diffusion|token|faster/i.test(tl)) matchedArch = 'Technical Paper Thread (like Feb 9 MaGNeTS Post · 278 cit.)';
        document.getElementById('scorer-matched-arch-name').textContent = matchedArch;

        const checks = [
            { ok: hasStrongHook, text: 'Opening line hook ("Back to basics", question, or concrete milestone)' },
            { ok: hasQuantOrMath, text: 'Specific ML / mathematical terms or quantitative numbers (3×, log 2)' },
            { ok: goodStructure, text: 'Multi-paragraph spacing (2–3 short blocks separated by blank lines)' },
            { ok: linkStrategyGood, text: 'External links placed in Reply #2 rather than main post' },
            { ok: hasMedia, text: 'Custom diagram, plot, or interactive demo visual attached' }
        ];
        const checkRoot = document.getElementById('scorer-checklist');
        checkRoot.innerHTML = '';
        checks.forEach(c => {
            const li = document.createElement('li');
            li.className = c.ok ? 'check-pass' : 'check-warn';
            li.innerHTML = `<span class="check-icon">${c.ok ? '✓' : '·'}</span> <span>${c.text}</span>`;
            checkRoot.appendChild(li);
        });
    }

    function generateScorerRewrites() {
        const raw = (document.getElementById('scorer-draft-input').value || '').trim();
        const clean = raw.replace(/https?:\/\/\S+/g, '').trim() || 'adaptive compute in visual generation';
        const firstSentence = clean.split(/[\n.!?]/)[0].trim();

        const variations = [
            `Went a little back to basics today.\n\nWhenever I needed clean intuition on ${firstSentence.toLowerCase()}, I always went back to the original mathematical formulation.\n\nRebuilt the core trade-off into an interactive visual note:`,
            `Why do we still treat ${firstSentence.toLowerCase()} as fixed during generation?\n\nMaking it adaptive at inference time gives a much cleaner Pareto frontier without adding parameters.\n\nVisual breakdown ↓`,
            `${clean}\n\nPut together a visual note + interactive sandbox covering:\n1. Geometric intuition\n2. Where standard approximations break\n3. Takeaways for modern generative models ↓`
        ];

        const box = document.getElementById('scorer-rewrites-box');
        const list = document.getElementById('scorer-rewrites-list');
        box.hidden = false;
        list.innerHTML = '';
        variations.forEach((v, i) => {
            const div = document.createElement('div');
            div.className = 'scorer-rewrite-card';
            div.innerHTML = `
                <div class="scorer-rewrite-head">
                    <strong>Variation ${i + 1}</strong>
                    <button type="button" class="gs-inline-action">Use this ↑</button>
                </div>
                <p>${escapeHtml(v)}</p>
            `;
            div.querySelector('button').addEventListener('click', () => {
                document.getElementById('scorer-draft-input').value = v;
                evaluateDraft();
            });
            list.appendChild(div);
        });
    }

    async function handleAddTweetByUrl(e) {
        e.preventDefault();
        const urlInput = document.getElementById('input-tweet-url');
        const statusEl = document.getElementById('sync-url-status');
        const rawUrl = urlInput.value.trim();
        const m = rawUrl.match(/status\/(\d+)/);
        if (!m) {
            statusEl.textContent = 'Enter a valid status URL.';
            return;
        }
        const tid = m[1];
        const views = Number(document.getElementById('input-tweet-views').value) || 1200;
        const bookmarks = Number(document.getElementById('input-tweet-bookmarks').value) || 20;
        const likes = Number(document.getElementById('input-tweet-likes').value) || 40;

        let text = `Post ${tid} by @vibespersecond`;
        try {
            const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(rawUrl)}&omit_script=true`);
            if (oembedRes.ok) {
                const odata = await oembedRes.json();
                const tmp = document.createElement('div');
                tmp.innerHTML = odata.html || '';
                const pText = tmp.querySelector('p')?.textContent || '';
                if (pText) text = pText.trim();
            }
        } catch (err) {}

        const metrics = { likes, reposts: 3, replies: 2, quotes: 0, bookmarks, views };
        const newTweet = {
            id: tid,
            title: text.split('\n')[0].slice(0, 105),
            text,
            created_at: new Date().toISOString(),
            year: new Date().getFullYear(),
            month: 'Oct 2026',
            url: `https://x.com/vibespersecond/status/${tid}`,
            category: 'Interactive Notes & Theory',
            archetype: 'Interactive Classic Rebuild',
            has_media: true,
            coauthors: [],
            metrics,
            citations: computeCitations(metrics)
        };
        saveLocalTweet(newTweet);
        renderScholarSidebar();
        renderPublicationsTable();
        statusEl.textContent = `✓ Added post ${tid}`;
        urlInput.value = '';
    }

    function classifyPostText(text) {
        const tl = (text || '').toLowerCase();
        if (/kl divergence|svd|unitary|geometric|rationals|batch norm|math|gaussian|entropy|jacobian/.test(tl)) {
            return { category: 'Interactive Notes & Theory', archetype: 'Interactive Classic Rebuild' };
        }
        if (/phd|application|rf program|msr|faculty|admission|sop|mnc|department|fellowship/.test(tl)) {
            return { category: 'Academic & PhD Resources', archetype: 'High-Utility Academic / Career Resource' };
        }
        if (/icml|iclr|wacv|eccv|cvpr|neurips|accepted|presenting|poster|citations|reviewer|rebuttal|googledeepmind/.test(tl)) {
            return { category: 'Paper Releases & Conferences', archetype: 'Research Milestone & Conference Update' };
        }
        if (/magnets|moe|diffusion|token|u-vit|maskgit|kv caching|design-o-meter|veo|matformer|loop|decode|guidance|transformer/.test(tl)) {
            return { category: 'Efficient ML & Generative Models', archetype: 'Technical Deep-Dive / Paper Thread' };
        }
        return { category: 'AI Commentary & Reflections', archetype: 'Personal Reflection & Researcher Life' };
    }

    function parseCsvLine(line) {
        const res = [];
        let cur = '', inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                res.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        res.push(cur.trim());
        return res;
    }

    async function handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const statusEl = document.getElementById('sync-csv-status');
        statusEl.textContent = 'Importing posts…';
        try {
            const raw = await file.text();
            let imported = 0;
            if (file.name.endsWith('.csv')) {
                const lines = raw.split(/\r?\n/).filter(l => l.trim());
                if (lines.length > 1) {
                    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
                    const idxId = headers.findIndex(h => h.includes('id') || h.includes('permalink') || h.includes('link'));
                    const idxText = headers.findIndex(h => h.includes('text') || h.includes('post'));
                    const idxDate = headers.findIndex(h => h.includes('time') || h.includes('date'));
                    const idxImp = headers.findIndex(h => h.includes('impression') || h.includes('view'));
                    const idxLikes = headers.findIndex(h => h.includes('like'));
                    const idxRt = headers.findIndex(h => h.includes('retweet') || h.includes('repost'));
                    const idxReply = headers.findIndex(h => h.includes('repl'));
                    const idxBm = headers.findIndex(h => h.includes('bookmark'));

                    for (let r = 1; r < lines.length; r++) {
                        const cols = parseCsvLine(lines[r]);
                        const rawId = cols[idxId] || '';
                        const m = rawId.match(/(\d{15,22})/);
                        if (!m) continue;
                        const tid = m[1];
                        const text = (cols[idxText] || '').replace(/https:\/\/t\.co\/\w+/g, '').trim();
                        if (!text || text.startsWith('RT @')) continue;
                        const dt = cols[idxDate] ? new Date(cols[idxDate]) : new Date();
                        const iso = isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
                        const yr = isNaN(dt.getTime()) ? 2026 : dt.getFullYear();
                        const mo = isNaN(dt.getTime()) ? 'Oct 2026' : dt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                        const metrics = {
                            likes: Number(cols[idxLikes]) || 0,
                            reposts: Number(cols[idxRt]) || 0,
                            replies: Number(cols[idxReply]) || 0,
                            quotes: 0,
                            bookmarks: Number(cols[idxBm]) || 0,
                            views: Number(cols[idxImp]) || 0
                        };
                        const { category, archetype } = classifyPostText(text);
                        saveLocalTweet({
                            id: tid,
                            title: text.split('\n')[0].slice(0, 105),
                            text,
                            created_at: iso,
                            year: yr,
                            month: mo,
                            url: `https://x.com/vibespersecond/status/${tid}`,
                            category,
                            archetype,
                            metrics,
                            citations: computeCitations(metrics)
                        });
                        imported++;
                    }
                }
            } else {
                const jsonStr = raw.replace(/^window\.YTD\.tweets\.part\d+\s*=\s*/, '').trim();
                const parsed = JSON.parse(jsonStr);
                const list = Array.isArray(parsed) ? parsed : (parsed.tweets || []);
                list.forEach(item => {
                    const t = item.tweet || item;
                    const tid = String(t.id_str || t.id || '');
                    const text = (t.full_text || t.text || '').replace(/https:\/\/t\.co\/\w+/g, '').trim();
                    if (!tid || !text || text.startsWith('RT @')) return;
                    const dt = t.created_at ? new Date(t.created_at) : new Date();
                    const iso = isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
                    const yr = isNaN(dt.getTime()) ? 2026 : dt.getFullYear();
                    const mo = isNaN(dt.getTime()) ? 'Oct 2026' : dt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                    const m = t.metrics || {
                        likes: Number(t.favorite_count ?? t.likes ?? 0),
                        reposts: Number(t.retweet_count ?? t.reposts ?? 0),
                        replies: Number(t.reply_count ?? t.replies ?? 0),
                        quotes: Number(t.quote_count ?? 0),
                        bookmarks: Number(t.bookmark_count ?? t.bookmarks ?? 0),
                        views: Number(t.views_count ?? t.views ?? 0)
                    };
                    const { category, archetype } = classifyPostText(text);
                    saveLocalTweet({
                        id: tid,
                        title: t.title || text.split('\n')[0].slice(0, 105),
                        text,
                        created_at: iso,
                        year: yr,
                        month: mo,
                        url: `https://x.com/vibespersecond/status/${tid}`,
                        category: t.category || category,
                        archetype: t.archetype || archetype,
                        metrics: m,
                        citations: computeCitations(m)
                    });
                    imported++;
                });
            }
            renderScholarSidebar();
            renderPublicationsTable();
            statusEl.textContent = `✓ Imported ${imported} posts! Click "Export JSON" to save permanently to data/twitter-scholar.json.`;
        } catch (err) {
            statusEl.textContent = `Could not parse file: ${err.message}`;
        }
    }

    function switchTab(tabId) {
        document.querySelectorAll('.gs-tab').forEach(t => {
            const active = t.dataset.tab === tabId;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', String(active));
        });
        document.getElementById('panel-profile').hidden = tabId !== 'profile';
        document.getElementById('panel-postlab').hidden = tabId !== 'postlab';
        document.getElementById('panel-scorer').hidden = tabId !== 'scorer';
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await loadStore();
        renderScholarSidebar();
        renderPublicationsTable();

        document.getElementById('scorer-draft-input').value =
            `Went a little back to basics today.\n\nWhenever I wanted clean geometric intuition on why Flow Matching replaced classic DDPM schedules in modern image/video models, I went back to the 2022 Rectified Flow & OT notes.\n\nBuilt an interactive visual note on why straight-line trajectories make 4-step sampling work:`;
        evaluateDraft();

        document.querySelectorAll('.gs-tab').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        document.getElementById('btn-jump-postlab').addEventListener('click', () => switchTab('postlab'));

        document.getElementById('gs-search-input').addEventListener('input', e => {
            filterState.search = e.target.value;
            filterState.limit = 20;
            renderPublicationsTable();
        });
        document.getElementById('gs-sort-select').addEventListener('change', e => {
            filterState.sort = e.target.value;
            renderPublicationsTable();
        });
        const thSortCit = document.getElementById('th-sort-citations');
        const thSortYr = document.getElementById('th-sort-year');
        if (thSortCit) {
            thSortCit.addEventListener('click', () => {
                filterState.sort = 'citations';
                document.getElementById('gs-sort-select').value = 'citations';
                renderPublicationsTable();
            });
        }
        if (thSortYr) {
            thSortYr.addEventListener('click', () => {
                filterState.sort = 'date';
                document.getElementById('gs-sort-select').value = 'date';
                renderPublicationsTable();
            });
        }
        document.getElementById('gs-year-select').addEventListener('change', e => {
            filterState.year = e.target.value;
            renderPublicationsTable();
        });
        document.getElementById('btn-clear-gs-filter').addEventListener('click', () => {
            filterState = { search: '', category: 'all', coauthor: '', year: 'all', sort: filterState.sort, limit: 20 };
            document.getElementById('gs-search-input').value = '';
            document.getElementById('gs-year-select').value = 'all';
            renderScholarSidebar();
            renderPublicationsTable();
        });
        document.getElementById('btn-show-more-posts').addEventListener('click', () => {
            filterState.limit += 25;
            renderPublicationsTable();
        });

        document.getElementById('btn-refresh-signals').addEventListener('click', () => fetchLiveSignals(true));
        document.querySelectorAll('#postlab-archetype-filters .gsc-filter-pill, #postlab-archetype-filters .reading-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#postlab-archetype-filters .gsc-filter-pill, #postlab-archetype-filters .reading-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activePostLabArch = chip.dataset.arch;
                renderPostLab();
            });
        });

        ['scorer-draft-input', 'scorer-opt-media', 'scorer-opt-replylink', 'scorer-opt-resource', 'scorer-opt-primewindow'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', evaluateDraft);
            el.addEventListener('change', evaluateDraft);
        });
        document.getElementById('btn-score-optimize').addEventListener('click', generateScorerRewrites);
        document.getElementById('btn-score-post-x').addEventListener('click', () => {
            const txt = document.getElementById('scorer-draft-input').value;
            window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
        });

        const syncDrawer = document.getElementById('drawer-sync');
        const settingsDrawer = document.getElementById('drawer-settings');
        document.getElementById('btn-open-sync').addEventListener('click', () => {
            settingsDrawer.hidden = true;
            syncDrawer.hidden = !syncDrawer.hidden;
        });
        document.getElementById('btn-close-sync').addEventListener('click', () => { syncDrawer.hidden = true; });
        document.getElementById('btn-open-settings').addEventListener('click', () => {
            syncDrawer.hidden = true;
            settingsDrawer.hidden = !settingsDrawer.hidden;
        });
        document.getElementById('btn-close-settings').addEventListener('click', () => { settingsDrawer.hidden = true; });

        document.getElementById('form-add-tweet').addEventListener('submit', handleAddTweetByUrl);
        document.getElementById('input-csv-file').addEventListener('change', handleImportFile);
        document.getElementById('btn-export-json').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'twitter-scholar.json';
            a.click();
        });
        document.getElementById('btn-reset-local').addEventListener('click', async () => {
            localStorage.removeItem(STORAGE_KEYS.LOCAL_TWEETS);
            await loadStore();
            renderScholarSidebar();
            renderPublicationsTable();
            showToastMsg('Reset local cache');
        });

        const savedProvider = localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'gemini';
        const savedKey = localStorage.getItem(STORAGE_KEYS.AI_KEY) || '';
        document.getElementById('select-ai-provider').value = savedProvider;
        document.getElementById('input-ai-key').value = savedKey;
        document.getElementById('form-ai-settings').addEventListener('submit', e => {
            e.preventDefault();
            localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, document.getElementById('select-ai-provider').value);
            localStorage.setItem(STORAGE_KEYS.AI_KEY, document.getElementById('input-ai-key').value.trim());
            document.getElementById('settings-status').textContent = '✓ Saved key.';
        });
        document.getElementById('btn-clear-key').addEventListener('click', () => {
            localStorage.removeItem(STORAGE_KEYS.AI_KEY);
            document.getElementById('input-ai-key').value = '';
            document.getElementById('settings-status').textContent = 'Cleared.';
        });

        renderPostLab();
        fetchLiveSignals(false);
    });
})();
