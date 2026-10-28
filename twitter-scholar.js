/**
 * X Scholar (@vibespersecond) — Google Scholar Profile, Live Daily Post Lab & Draft Scorer
 * Designed for sahilg06.github.io
 */
(function () {
    const STORAGE_KEYS = {
        LOCAL_TWEETS: 'xscholar_local_tweets_v1',
        AI_PROVIDER: 'xscholar_ai_provider_v1',
        AI_KEY: 'xscholar_ai_key_v1',
    };

    // Classic ML notes & evergreen high-engagement themes tailored to @vibespersecond
    const CLASSIC_ML_VAULT = [
        {
            id: 'classic-flow-matching',
            title: 'Flow Matching vs. Diffusion SDEs: Why Straight-Line Optimal Transport Beats Curved Denoising Paths',
            inspiration: "Lipman et al. (2022) & Liu et al. (Rectified Flow) classic notes",
            modernTie: 'Flux, SD3, Veo-style video generators, and few-step distillation',
            mathHook: 'In DDPM, trajectories curve because score matching targets marginal Gaussians. In Rectified Flow / Flow Matching, conditioning on (x_0, x_1) pairs yields straight vector fields v_t(x) = x_1 - x_0 — making 1-step Euler exact when paths do not cross.',
            sandboxIdea: 'Interactive 2D particle flow canvas comparing curved VP-SDE trajectories vs. straight Conditional Optimal Transport paths as step count N drops from 50 → 2.',
            hooks: [
                "Went back to basics today.\n\nWhenever I wanted clean geometric intuition on why Flow Matching replaced classic DDPM schedules in modern image/video models, I went back to the 2022 Rectified Flow & OT notes.\n\nBuilt an interactive visual note on why straight-line trajectories change everything for 4-step sampling:",
                "Why do DDPM trajectories curve in latent space while Flow Matching paths stay straight?\n\nIt comes down to a single conditioning trick in the transport ODE — and what happens when two trajectories intersect at t ∈ (0,1).\n\nInteractive visual breakdown + live NFE step slider:",
                "Can you get high-fidelity generation in 4 Euler steps without distillation?\n\nOnly if your probability flow ODE has zero curvature. Here is the exact geometry separating Score-Based Diffusion from Optimal Transport Flow Matching (with a live interactive sandbox):"
            ],
            replyLink: "Interactive note + live 2D particle flow playground: https://sahilg06.github.io/blog.html\n\nCovers:\n1. Curved DDPM score fields vs. straight OT vector fields\n2. Why crossing paths force reflow\n3. Connection to modern visual generation at scale"
        },
        {
            id: 'classic-gumbel-vq',
            title: 'Discrete Visual Tokenizers: Gumbel-Softmax, Straight-Through Estimators & FSQ Geometry',
            inspiration: "Jang et al. (2016) Gumbel-Softmax note & Mentzer et al. Finite Scalar Quantization (FSQ)",
            modernTie: 'MaskGIT, MaGNeTS, LlamaGen, and autoregressive vs. masked visual generation',
            mathHook: 'When quantizing continuous latents z into discrete tokens, argmax has zero gradient everywhere. Straight-Through Estimators copy ∂L/∂z_q → ∂L/∂z_e, breaking when codebook commitment drifts; FSQ sidesteps codebook collapse entirely by bounding each channel.',
            sandboxIdea: 'Interactive 2D codebook commitment visualizer showing dead codes in VQ-VAE vs. temperature annealing τ → 0 in Gumbel-Softmax vs. hypercube grid in FSQ.',
            hooks: [
                "Went a little back to basics on discrete visual tokenizers today.\n\nWorking on masked generative transformers (like MaGNeTS), you constantly run into the core bottleneck: how gradients survive discrete quantization.\n\nMapped out the geometry of VQ-STE vs. Gumbel-Softmax vs. FSQ in one interactive guide:",
                "Why do VQ-VAE codebooks collapse at scale, and why did Finite Scalar Quantization (FSQ) replace learned codebooks in so many recent visual models?\n\nThe answer lies in the Jacobian of the Straight-Through Estimator.\n\nVisual intuition + interactive codebook sandbox:",
                "Autoregressive and masked visual models (MaskGIT / MaGNeTS) live or die by their tokenizer.\n\nWhenever I needed clarity on the Gumbel-Max trick and temperature annealing τ → 0, I went back to Jang et al.'s 2016 note — here is an interactive rebuild for modern vision:"
            ],
            replyLink: "Thread & visual notes on discrete tokenizers and masked generation: https://sahilg06.github.io/research.html\n\nRelated to our ICML '25 paper MaGNeTS on nested token unmasking: https://arxiv.org/pdf/2502.00382"
        },
        {
            id: 'classic-cfg-geometry',
            title: 'The Geometry of Classifier-Free Guidance (CFG): Why High Guidance Scales Oversaturate & Clip Modes',
            inspiration: "Ho & Salimans (2022) Classifier-Free Diffusion Guidance & interval guidance notes",
            modernTie: 'Late-stage guidance scheduling (like in MaGNeTS), CFG-rescale, and autoguidance',
            mathHook: 'CFG extrapolates scores along s_CFG(x, c) = s(x, ∅) + w·(s(x, c) - s(x, ∅)), which corresponds to sampling from p(x)^(1-w) p(x|c)^w. At early high-noise steps, this pushes trajectories outside the data manifold; applying guidance only in final steps preserves diversity and cuts compute by ~40%.',
            sandboxIdea: 'Interactive 2D density & trajectory plot where dragging guidance scale w from 1.0 to 12.0 shows mode sharpening vs. manifold overshoot, plus late-step guidance gating.',
            hooks: [
                "Why does cranking up Classifier-Free Guidance (w > 7) make generated images oversaturated and plastic-looking?\n\nAnd why did we find in MaGNeTS that turning OFF guidance in early sampling steps actually improves efficiency without hurting quality?\n\nThe geometric intuition:",
                "Went back to the fundamentals of Classifier-Free Guidance (CFG) today.\n\nWe write s = s_uncond + w(s_cond - s_uncond) in three lines of PyTorch, but geometrically it's a power-law tilt p(x|c)^w / p(x)^(w-1) that pushes early denoising off-manifold.\n\nInteractive breakdown:",
                "A simple compute win in visual generation that still surprises people:\n\nYou don't need Classifier-Free Guidance in the early denoising/unmasking steps.\n\nEarly steps only set global layout; guidance only matters when resolving high-frequency semantics. Here's why (with math + plots):"
            ],
            replyLink: "More on late-stage guidance & decode-time scaling in our ICML 2025 paper MaGNeTS: https://arxiv.org/pdf/2502.00382"
        },
        {
            id: 'classic-looped-test-time',
            title: 'Weight-Tied & Looped Transformers: Trading Parameters for Adaptive Test-Time Compute in Vision',
            inspiration: "Universal Transformers (Dehghani et al.) & Elastic Looped Transformers (ECCV 2026)",
            modernTie: 'Elastic Looped Transformers (ECCV 2026), adaptive test-time compute, and MatFormer / MaGNeTS',
            mathHook: 'Instead of fixed depth L with distinct weights W_1...W_L, looping a shared block f_θ(h, t) acts like unrolling an implicit fixed-point or ODE solver in representation space — letting easy tokens exit early and hard visual regions loop deeper.',
            sandboxIdea: 'Interactive token-exit heatmap showing how flat background patches converge in 2 loops while intricate faces/text allocate 8+ loops at inference time.',
            hooks: [
                "Why should every image patch or generation step spend the exact same FLOPs?\n\nA clear blue sky patch doesn't need the same transformer depth as a human hand or dense text.\n\nHow weight-tied Looped Transformers + Nested architectures unlock elastic test-time compute in visual generation:",
                "In LLMs, test-time compute scaling (thinking longer on harder prompts) is standard.\n\nWhat is the equivalent for visual generation?\n\nIn our ECCV 2026 work on Elastic Looped Transformers & ICML '25 MaGNeTS, we explored two orthogonal axes: looping depth vs. nested width:",
                "Went back to the core math of weight-tied / looped transformers today.\n\nUnrolling a shared transformer block across T iterations isn't just parameter compression — it's an iterative refinement operator in latent space. Here is how it makes visual generation computationally elastic:"
            ],
            replyLink: "Paper (ECCV 2026): Elastic Looped Transformers for Visual Generation — https://arxiv.org/abs/2604.09168\nProject & writing: https://sahilg06.github.io/research.html"
        }
    ];

    const ACADEMIC_RESOURCE_PLAYBOOKS = [
        {
            id: 'res-phd-sop-anatomy',
            title: 'The Exact 5-Paragraph Anatomy of my PhD Statement of Purpose (UT Austin, EPFL, MILA, ELLIS)',
            metricsRef: 'Matches your #1 all-time archetype: PhD Application Tracker (450 likes, 310 bookmarks, 35K views)',
            hooks: [
                "With ML/CV PhD deadlines around the corner (Oct 31 – Dec 15), the #1 question in my DMs is how to structure a Statement of Purpose.\n\nLast cycle I was fortunate to receive PhD offers from UT Austin, EPFL, MILA, and ELLIS.\n\nI annotated my exact UT Austin SOP paragraph-by-paragraph so you can use it as a template:",
                "Most PhD Statements of Purpose fail in paragraph 1 because they start with a childhood story instead of a research thesis.\n\nSharing the exact SOP I submitted last cycle (accepted at UT Austin, EPFL, MILA, ELLIS) — broken down with margin notes on what every section needs to do:",
                "Applying for an ML / Vision PhD this cycle?\n\nTo pair with the PhD Application & Faculty Tracker I shared earlier, here is my full annotated Statement of Purpose + the checklist I used to tailor faculty paragraphs in 15 minutes per school:"
            ],
            replyLink: "Full annotated SOP + section-by-section breakdown: https://sahilg06.github.io/blog_posts/phd-statement-of-purpose.html\n\nCompanion PhD Program & Faculty Tracker (Google Sheet): https://sahilg06.github.io/blog_posts/phd-application-tracker.html",
            visualTip: 'Attach a 2-panel screenshot showing the annotated SOP callout boxes side-by-side with the UT Austin / EPFL / MILA offer highlights.'
        },
        {
            id: 'res-predoc-residency-guide',
            title: 'Pre-Doctoral AI Residencies (Google DeepMind, MSR, Meta, Adobe): Timeline, Interview Prep & Cold-Email Playbook',
            metricsRef: 'Leverages your Google DeepMind AI Residency + Adobe Research background &MSR RF thread',
            hooks: [
                "Not ready to commit to a 5-year PhD right out of undergrad, or coming from a non-CS major?\n\nPre-Doctoral AI Residencies (Google DeepMind, MSR, Meta, AllenAI) are the highest-leverage bridge into frontier ML research.\n\nHaving gone from Applied Math @ IITR → Adobe Research → Google DeepMind Residency, here is my complete FAQ & prep guide:",
                "Remember when my college CS department HOD refused to sign my MSR Research Fellow recommendation without looking at my profile because my degree said Applied Math, not CS?\n\nDon't let gatekeeping stop you. Here are all the AI Residency & Pre-Doc programs open right now that judge you purely on research taste + code:",
                "A lot of folks asked about transitioning from undergrad in India to frontier ML labs (Google DeepMind Veo/Gemini, Adobe Research) and top PhD offers.\n\nPut together a zero-fluff FAQ on timelines, research coding rounds, and how to turn a workshop paper into a top-tier ICML/ECCV submission:"
            ],
            replyLink: "Google DeepMind India Pre-Doctoral Researcher FAQ doc: https://docs.google.com/document/d/1xYFN5K_436zMUY5o4CYNeqAdUlZ1la-ZWUdjD0f0p3Y/edit?usp=sharing\n\nMore resources on my site: https://sahilg06.github.io/blog.html",
            visualTip: 'Include a clean timeline graphic comparing PhD application deadlines (Nov–Dec) vs. AI Residency / Pre-Doc application windows (Oct–Feb).'
        }
    ];

    const PORTFOLIO_FOLLOWUPS = [
        {
            id: 'followup-kl-pitchfork',
            title: 'Follow-Up Thread: The Exact Δμ = σ√(2 log 2) ≈ 1.177σ Pitchfork Bifurcation in Reverse KL',
            metricsRef: 'Direct high-retention follow-up to your Oct 27 Forward vs. Reverse KL post (62 likes, 25 bookmarks)',
            hooks: [
                "My favorite mathematical gem while building the interactive Forward vs. Reverse KL note yesterday:\n\nIf the target distribution is a symmetric bimodal Gaussian with peak separation 2Δμ, Reverse KL doesn't gradually become mode-seeking.\n\nIt undergoes an exact pitchfork bifurcation at Δμ = σ√(2 log 2) ≈ 1.177σ. Here's why:",
                "Quick quiz on KL Divergence:\n\nSuppose P(x) is an equal mixture of two Gaussians N(-Δμ, 1) and N(+Δμ, 1). If you fit a single Gaussian Q(x) using Reverse KL, does it ALWAYS snap to one mode?\n\nNo! Below Δμ = √(2 log 2) ≈ 1.177, Reverse KL is still mode-covering (μ_Q = 0). At 1.177, the center becomes unstable:",
                "Why does RLHF (Reverse KL) collapse diversity when the reward landscape has separated peaks, while SFT (Forward KL) hedges in the middle?\n\nYou can actually see the exact phase transition at Δμ/σ = √(2 log 2) ≈ 1.18 in 10 seconds using the interactive slider I built:"
            ],
            replyLink: "Try the 'Critical Threshold (Δμ ≈ 1.18σ)' preset in the live sandbox here: https://sahilg06.github.io/blog_posts/forward-vs-reverse-kl.html#interactive-sandbox",
            visualTip: 'Record a 8-second screen capture dragging the Peak Separation Δμ slider across 1.18 in your KL playground as the red Reverse KL curve suddenly snaps from the center to one peak.'
        },
        {
            id: 'followup-moe-routing',
            title: 'Visual MoEs vs. LLM MoEs: Why Token-Choice Routing Breaks on Spatial Redundancy',
            metricsRef: 'Builds on your Aug 2026 X Article on MoEs for Visual Generative Models (59 likes, 42 bookmarks)',
            hooks: [
                "In LLMs, Mixture-of-Experts (MoE) routing works out of the box because discrete text tokens carry distinct semantic roles.\n\nIn visual generation (diffusion / masked transformers), naive top-k token routing wastes 60% of expert capacity on flat background patches.\n\n3 routing shifts fixing visual MoEs:",
                "If you train a standard Top-2 MoE inside a Diffusion Transformer (DiT), what do the experts actually specialize in?\n\nSpoiler: Without batch-level or timestep-aware routing, experts split by noise level t or image coordinates rather than semantics.\n\nA quick synthesis of how visual MoE routing is evolving:",
                "Efficiency in visual generation isn't just fewer sampling steps — it's conditional computation per token.\n\nComparing 3 ways modern vision models allocate compute dynamically:\n1. Nested dimensions (MaGNeTS)\n2. Elastic looped depth (ELT)\n3. Semantic prototype MoE routing:"
            ],
            replyLink: "Full deep-dive article on MoEs for Visual Generative Models: https://x.com/vibespersecond/status/2086456634545754291\n\nAll efficient visual generation papers: https://sahilg06.github.io/research.html",
            visualTip: 'Attach a 3-column comparison diagram: (1) Nested Width (MaGNeTS), (2) Adaptive Loop Depth (ELT), (3) Expert Routing (Visual MoE).'
        }
    ];

    // State
    let store = { profile: {}, tweets: [] };
    let filterState = {
        search: '',
        category: 'all',
        coauthor: '',
        year: 'all',
        sort: 'citations',
        limit: 25
    };
    let liveSignals = {
        hfPapers: [],
        arxivPapers: [],
        techPulse: [],
        loadedAt: null,
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
        setTimeout(() => toast.remove(), 2600);
    };

    const copyText = (text, label = 'Copied to clipboard') => {
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

    // Load tweets from data/twitter-scholar.json + localStorage
    async function loadStore() {
        try {
            const res = await fetch('./data/twitter-scholar.json?v=' + Date.now());
            if (res.ok) {
                store = await res.json();
            }
        } catch (err) {
            console.warn('Could not load data/twitter-scholar.json:', err);
        }

        // Merge local additions
        try {
            const localRaw = localStorage.getItem(STORAGE_KEYS.LOCAL_TWEETS);
            if (localRaw) {
                const localList = JSON.parse(localRaw);
                if (Array.isArray(localList) && localList.length) {
                    const byId = new Map((store.tweets || []).map(t => [t.id, t]));
                    for (const lt of localList) {
                        if (lt && lt.id) {
                            byId.set(lt.id, lt);
                        }
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
        try {
            localList = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_TWEETS) || '[]');
        } catch (e) {}
        const idx = localList.findIndex(x => x.id === tweetObj.id);
        if (idx >= 0) localList[idx] = tweetObj;
        else localList.unshift(tweetObj);
        localStorage.setItem(STORAGE_KEYS.LOCAL_TWEETS, JSON.stringify(localList));

        const sIdx = store.tweets.findIndex(x => x.id === tweetObj.id);
        if (sIdx >= 0) store.tweets[sIdx] = tweetObj;
        else store.tweets.unshift(tweetObj);
    }

    // Compute Scholar Indices (Citations, h-index, i100-index, i10-index, Views)
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

    // Render Sidebar Stats, Bar Chart, Archetypes, and Co-authors
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

        // Render Interest Pills in Author Header
        const interestsContainer = document.getElementById('gs-interests-list');
        const categories = [
            'Efficient ML & Generative Models',
            'Interactive Notes & Theory',
            'Academic & PhD Resources',
            'Paper Releases & Conferences',
            'AI Commentary & Reflections'
        ];
        interestsContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gs-interest-tag' + (filterState.category === cat ? ' active' : '');
            btn.textContent = cat;
            btn.addEventListener('click', () => {
                filterState.category = filterState.category === cat ? 'all' : cat;
                renderCategoryChips();
                renderScholarSidebar();
                renderPublicationsTable();
            });
            interestsContainer.appendChild(btn);
        });

        // Render Impact Trajectory Bar Chart by Year/Half
        const periods = [
            { label: '2024', match: t => Number(t.year) <= 2024, yearFilter: '2024' },
            { label: "H1 '25", match: t => Number(t.year) === 2025 && /^[A-Za-z]{3}/.test(t.month || '') && ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes((t.month || '').slice(0, 3)), yearFilter: '2025' },
            { label: "H2 '25", match: t => Number(t.year) === 2025 && !['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes((t.month || '').slice(0, 3)), yearFilter: '2025' },
            { label: '2026', match: t => Number(t.year) >= 2026, yearFilter: '2026' }
        ];
        const periodTotals = periods.map(p => ({
            ...p,
            citations: allTweets.filter(p.match).reduce((s, t) => s + (t.citations || 0), 0),
            count: allTweets.filter(p.match).length
        }));
        const maxCit = Math.max(...periodTotals.map(p => p.citations), 1);

        const barsRoot = document.getElementById('gs-impact-bars');
        barsRoot.innerHTML = '';
        periodTotals.forEach(p => {
            const col = document.createElement('button');
            col.type = 'button';
            col.className = 'gs-bar-col';
            col.title = `${p.label}: ${p.citations.toLocaleString()} citations across ${p.count} posts`;
            const pct = Math.max(8, Math.round((p.citations / maxCit) * 100));
            col.innerHTML = `
                <span class="gs-bar-val">${fmtNum(p.citations)}</span>
                <span class="gs-bar-track"><span class="gs-bar-fill" style="height:${pct}%"></span></span>
                <span class="gs-bar-label">${p.label}</span>
            `;
            col.addEventListener('click', () => {
                filterState.year = filterState.year === p.yearFilter ? 'all' : p.yearFilter;
                document.getElementById('gs-year-select').value = filterState.year;
                renderPublicationsTable();
            });
            barsRoot.appendChild(col);
        });

        // Winning Archetypes Empirical List
        const archMap = new Map();
        allTweets.forEach(t => {
            const a = t.archetype || 'General Update';
            if (!archMap.has(a)) archMap.set(a, { count: 0, citations: 0, views: 0 });
            const entry = archMap.get(a);
            entry.count += 1;
            entry.citations += t.citations || 0;
            entry.views += Number(t.metrics?.views) || 0;
        });
        const archStats = Array.from(archMap.entries())
            .map(([name, s]) => ({
                name,
                count: s.count,
                avgCitations: Math.round(s.citations / s.count),
                totalCitations: s.citations
            }))
            .sort((a, b) => b.avgCitations - a.avgCitations);

        const archRoot = document.getElementById('gs-archetypes-list');
        archRoot.innerHTML = '';
        archStats.slice(0, 5).forEach(a => {
            const item = document.createElement('div');
            item.className = 'gs-arch-item';
            item.innerHTML = `
                <div class="gs-arch-top">
                    <strong>${a.name}</strong>
                    <span class="gs-arch-score">${a.avgCitations} avg cit.</span>
                </div>
                <div class="gs-arch-meta">${a.count} posts · ${a.totalCitations.toLocaleString()} total citations</div>
            `;
            archRoot.appendChild(item);
        });

        // Co-authors Sidebar
        const coMap = new Map();
        allTweets.forEach(t => {
            (t.coauthors || []).forEach(c => {
                if (!coMap.has(c)) coMap.set(c, { count: 0, citations: 0 });
                const entry = coMap.get(c);
                entry.count += 1;
                entry.citations += t.citations || 0;
            });
        });
        const coList = Array.from(coMap.entries())
            .map(([handle, s]) => ({ handle, ...s }))
            .sort((a, b) => b.citations - a.citations || b.count - a.count)
            .slice(0, 10);

        const coRoot = document.getElementById('gs-coauthors-list');
        coRoot.innerHTML = '';
        coList.forEach(c => {
            const li = document.createElement('li');
            const isActive = filterState.coauthor === c.handle;
            li.innerHTML = `
                <button type="button" class="gs-coauthor-btn ${isActive ? 'active' : ''}">
                    <span class="gs-coauthor-handle">${c.handle}</span>
                    <span class="gs-coauthor-meta">${c.count} post${c.count > 1 ? 's' : ''} · ${c.citations} cit.</span>
                </button>
            `;
            li.querySelector('button').addEventListener('click', () => {
                filterState.coauthor = filterState.coauthor === c.handle ? '' : c.handle;
                renderScholarSidebar();
                renderPublicationsTable();
            });
            coRoot.appendChild(li);
        });
    }

    function renderCategoryChips() {
        const root = document.getElementById('gs-category-chips');
        const allTweets = store.tweets || [];
        const cats = [
            { id: 'all', label: `All (${allTweets.length})` },
            { id: 'Efficient ML & Generative Models', label: 'Efficient ML & Gen Models' },
            { id: 'Interactive Notes & Theory', label: 'Interactive Notes & Theory' },
            { id: 'Academic & PhD Resources', label: 'PhD & Career Resources' },
            { id: 'Paper Releases & Conferences', label: 'Conferences & Papers' },
            { id: 'AI Commentary & Reflections', label: 'AI Commentary & Life' }
        ];
        root.innerHTML = '';
        cats.forEach(c => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'reading-chip' + (filterState.category === c.id ? ' active' : '');
            btn.textContent = c.label;
            btn.addEventListener('click', () => {
                filterState.category = c.id;
                renderCategoryChips();
                renderScholarSidebar();
                renderPublicationsTable();
            });
            root.appendChild(btn);
        });
    }

    function renderPublicationsTable() {
        const tbody = document.getElementById('gs-tbody');
        const allTweets = store.tweets || [];

        const q = filterState.search.trim().toLowerCase();
        let filtered = allTweets.filter(t => {
            if (filterState.category !== 'all' && t.category !== filterState.category) return false;
            if (filterState.coauthor && !(t.coauthors || []).includes(filterState.coauthor)) return false;
            if (filterState.year === '2026' && Number(t.year) < 2026) return false;
            if (filterState.year === '2025' && Number(t.year) < 2025) return false;
            if (filterState.year === '2024' && Number(t.year) > 2024) return false;
            if (q) {
                const hay = `${t.title} ${t.text} ${t.category} ${t.archetype} ${(t.coauthors || []).join(' ')} ${t.month}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            if (filterState.sort === 'views') return (b.metrics?.views || 0) - (a.metrics?.views || 0);
            if (filterState.sort === 'likes') return (b.metrics?.likes || 0) - (a.metrics?.likes || 0);
            if (filterState.sort === 'bookmarks') return (b.metrics?.bookmarks || 0) - (a.metrics?.bookmarks || 0);
            if (filterState.sort === 'date') return String(b.created_at).localeCompare(String(a.created_at));
            return (b.citations || 0) - (a.citations || 0);
        });

        // Active filter banner
        const activeBar = document.getElementById('gs-active-filter-bar');
        const activeLabel = document.getElementById('gs-active-filter-label');
        const activeParts = [];
        if (filterState.category !== 'all') activeParts.push(`Topic: ${filterState.category}`);
        if (filterState.coauthor) activeParts.push(`Co-author: ${filterState.coauthor}`);
        if (filterState.year !== 'all') activeParts.push(`Year: ${filterState.year}`);
        if (q) activeParts.push(`Query: "${filterState.search}"`);
        if (activeParts.length) {
            activeBar.hidden = false;
            activeLabel.textContent = `Filtering (${filtered.length} posts) — ` + activeParts.join(' · ');
        } else {
            activeBar.hidden = true;
        }

        tbody.innerHTML = '';
        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="gs-empty">No matching posts found. Try clearing filters.</td></tr>`;
            document.getElementById('gs-page-summary').textContent = '0 posts';
            document.getElementById('btn-show-more-posts').hidden = true;
            return;
        }

        const visible = filtered.slice(0, filterState.limit);
        visible.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'gs-row';
            const coStr = (t.coauthors && t.coauthors.length) ? `, ${t.coauthors.join(', ')}` : '';
            const m = t.metrics || {};
            const pinnedBadge = t.pinned ? `<span class="gs-badge gs-badge-pinned">★ Pinned</span>` : '';
            const catBadge = `<span class="gs-badge">${t.category}</span>`;

            tr.innerHTML = `
                <td class="gs-cell-title" data-label="Post">
                    <div class="gs-post-badges">${pinnedBadge}${catBadge}<span class="gs-arch-label">${t.archetype || ''}</span></div>
                    <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="gs-post-title">${escapeHtml(t.title)}</a>
                    <div class="gs-post-authors">S Goyal (@vibespersecond)${escapeHtml(coStr)} · <span>X / Twitter</span></div>
                    <p class="gs-post-snippet">${escapeHtml(t.text)}</p>
                    <div class="gs-post-metrics-bar">
                        <span>♥ ${m.likes || 0} Likes</span>
                        <span>🔖 ${m.bookmarks || 0} Bookmarks</span>
                        <span>↻ ${m.reposts || 0} Reposts</span>
                        <span>💬 ${m.replies || 0} Replies</span>
                        <span>👁 ${fmtNum(m.views || 0)} Views</span>
                        <button type="button" class="gs-template-btn" data-tid="${t.id}">Analyze &amp; Use as Template →</button>
                    </div>
                </td>
                <td class="gs-cell-cited" data-label="Cited by">
                    <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="gs-cited-num" title="Likes (${m.likes || 0}) + 2×Bookmarks (${m.bookmarks || 0}) + 3×Reposts (${m.reposts || 0}) + 2×Replies (${m.replies || 0})">${t.citations || 0}</a>
                    <span class="gs-cited-views">${fmtNum(m.views || 0)} views</span>
                </td>
                <td class="gs-cell-year" data-label="Date">
                    <span class="gs-year-text">${escapeHtml(t.month || String(t.year))}</span>
                </td>
            `;

            tr.querySelector('.gs-template-btn').addEventListener('click', () => {
                sendTweetToScorer(t);
            });

            tbody.appendChild(tr);
        });

        document.getElementById('gs-page-summary').textContent = `Showing 1–${visible.length} of ${filtered.length} indexed posts`;
        const moreBtn = document.getElementById('btn-show-more-posts');
        moreBtn.hidden = visible.length >= filtered.length;
    }

    function sendTweetToScorer(t) {
        switchTab('scorer');
        const input = document.getElementById('scorer-draft-input');
        input.value = t.text;
        document.getElementById('scorer-opt-media').checked = !!t.has_media;
        evaluateDraft();
        input.focus();
        showToastMsg('Loaded tweet into Draft Scorer');
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ==================== LIVE DAILY SIGNALS & POST LAB ====================
    async function fetchLiveSignals(isManualRefresh = false) {
        if (isManualRefresh) {
            liveSignals.shuffleSeed += 1;
        }
        const hfBadge = document.getElementById('signal-hf');
        const arxivBadge = document.getElementById('signal-arxiv');
        const hnBadge = document.getElementById('signal-hn');

        // 1. Fetch Hugging Face Daily Papers
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
                        arxivUrl: `https://arxiv.org/abs/${p.id}`,
                        source: 'Hugging Face Daily Papers'
                    };
                }).filter(p => p.title);
                hfBadge.classList.add('signal-ready');
            }
        } catch (e) {
            console.warn('HF fetch fallback:', e);
        }

        // 2. Fetch arXiv cs.CV / cs.LG recent efficient / generative papers
        try {
            const arxivQuery = encodeURIComponent('all:diffusion OR all:transformer OR all:"visual generation" OR all:"mixture of experts"');
            const arxivUrl = `https://export.arxiv.org/api/query?search_query=${arxivQuery}&sortBy=submittedDate&sortOrder=descending&max_results=12`;
            const arxRes = await fetch(arxivUrl);
            if (arxRes.ok) {
                const xmlText = await arxRes.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(xmlText, 'application/xml');
                const entries = Array.from(doc.querySelectorAll('entry'));
                liveSignals.arxivPapers = entries.map(ent => {
                    const idUrl = ent.querySelector('id')?.textContent?.trim() || '';
                    const shortId = idUrl.split('/abs/').pop() || '';
                    return {
                        id: shortId,
                        title: (ent.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim(),
                        summary: (ent.querySelector('summary')?.textContent || '').replace(/\s+/g, ' ').trim(),
                        url: idUrl || `https://arxiv.org/abs/${shortId}`,
                        source: 'arXiv Live (cs.CV / cs.LG)'
                    };
                }).filter(p => p.title);
                arxivBadge.classList.add('signal-ready');
            }
        } catch (e) {
            console.warn('arXiv fetch fallback:', e);
        }

        // 3. Fetch Hacker News Algolia AI / ML Frontpage Pulse
        try {
            const hnRes = await fetch('https://hn.algolia.com/api/v1/search?query=AI%20OR%20LLM%20OR%20model%20OR%20GPU&tags=story&numericFilters=points>40&hitsPerPage=12');
            if (hnRes.ok) {
                const hnData = await hnRes.json();
                liveSignals.techPulse = (hnData.hits || []).map(h => ({
                    id: h.objectID,
                    title: h.title,
                    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
                    points: h.points || 0,
                    comments: h.num_comments || 0,
                    source: 'AI & Tech Pulse'
                })).filter(h => h.title);
                hnBadge.classList.add('signal-ready');
            }
        } catch (e) {
            console.warn('HN fetch fallback:', e);
        }

        renderPostLab();
        renderLiveRadar();
        if (isManualRefresh) {
            showToastMsg('Refreshed live papers & rotated daily hooks!');
        }
    }

    function pickRankedPaper() {
        const pool = [...liveSignals.hfPapers, ...liveSignals.arxivPapers];
        const keywords = ['diffusion', 'visual', 'image', 'video', 'token', 'moe', 'efficient', 'attention', 'flow', 'distill', 'cache', 'scaling', 'loop', 'latent'];
        if (!pool.length) {
            return {
                title: 'Test-Time Compute Scaling for Diffusion & Masked Generative Transformers',
                url: 'https://arxiv.org/abs/2502.00382',
                summary: 'Allocating adaptive compute across denoising/unmasking steps and token density significantly improves Pareto efficiency without increasing parameter count.',
                source: 'arXiv / Visual Generation Spotlight'
            };
        }
        const scored = pool.map(p => {
            const text = `${p.title} ${p.summary}`.toLowerCase();
            let score = (p.upvotes || 10);
            keywords.forEach(k => {
                if (text.includes(k)) score += 25;
            });
            return { ...p, _score: score };
        }).sort((a, b) => b._score - a._score);

        const idx = liveSignals.shuffleSeed % Math.min(scored.length, 6);
        return scored[idx];
    }

    function pickTechPulse() {
        if (!liveSignals.techPulse.length) {
            return {
                title: 'Why Inference Compute & Post-Training Efficiency Are Overtaking Pre-Training Scale',
                url: 'https://x.com/vibespersecond',
                points: 240,
                comments: 112,
                source: 'AI & Tech Pulse'
            };
        }
        const idx = liveSignals.shuffleSeed % Math.min(liveSignals.techPulse.length, 6);
        return liveSignals.techPulse[idx];
    }

    function buildDailyRecommendations() {
        const seed = liveSignals.shuffleSeed;
        const classicNote = CLASSIC_ML_VAULT[seed % CLASSIC_ML_VAULT.length];
        const resourcePlay = ACADEMIC_RESOURCE_PLAYBOOKS[seed % ACADEMIC_RESOURCE_PLAYBOOKS.length];
        const portfolioPlay = PORTFOLIO_FOLLOWUPS[seed % PORTFOLIO_FOLLOWUPS.length];
        const livePaper = pickRankedPaper();
        const techStory = pickTechPulse();

        const recs = [
            ...customRadarDrafts,
            {
                id: 'rec-interactive-' + classicNote.id,
                archKey: 'interactive',
                rankLabel: '#1 Highest Bookmark-to-Like Velocity',
                archetype: 'Interactive Classic Rebuild ("Back to Basics")',
                title: classicNote.title,
                predictedCitations: '165 – 320 Citations',
                predictedViews: '4.5K – 14K Views',
                whyItWorks: `Directly mirrors your Oct 27 Forward vs. Reverse KL hit (62 likes, 25 bookmarks, 15 reposts in <24h). Taking a foundational note (${classicNote.inspiration}) and connecting it to ${classicNote.modernTie} drives 3.2× higher bookmark rates among ML researchers.`,
                sourceLabel: classicNote.inspiration,
                sourceUrl: 'https://sahilg06.github.io/blog_posts/forward-vs-reverse-kl.html',
                visualBlueprint: classicNote.sandboxIdea,
                hooks: classicNote.hooks,
                replyLink: classicNote.replyLink
            },
            {
                id: 'rec-resource-' + resourcePlay.id,
                archKey: 'resource',
                rankLabel: '#2 Highest Viral Ceiling (30K+ Views Archetype)',
                archetype: 'High-Utility Academic / PhD Resource',
                title: resourcePlay.title,
                predictedCitations: '420 – 1,150 Citations',
                predictedViews: '18K – 40K Views',
                whyItWorks: `${resourcePlay.metricsRef}. Oct–Nov is peak PhD & Pre-Doc application season; concrete templates + authentic insider lessons from your UT Austin / EPFL / MILA / DeepMind journey get heavily bookmarked and shared in lab Slack channels.`,
                sourceLabel: 'sahilg06.github.io Resource Vault',
                sourceUrl: 'https://sahilg06.github.io/blog_posts/phd-statement-of-purpose.html',
                visualBlueprint: resourcePlay.visualTip,
                hooks: resourcePlay.hooks,
                replyLink: resourcePlay.replyLink
            },
            {
                id: 'rec-paper-live',
                archKey: 'paper',
                rankLabel: '#3 Live Research Spotlight (Today’s Feed)',
                archetype: 'Technical Deep-Dive / Paper Connection',
                title: `Live Paper Breakdown: "${livePaper.title}"`,
                predictedCitations: '110 – 240 Citations',
                predictedViews: '3.5K – 9.5K Views',
                whyItWorks: `Matches your MaGNeTS (278 citations) & MoE Routing (212 citations) threads. Posting a concise architectural take on a fresh paper within 24h of release — and connecting it to your own work on decode-time scaling / looped transformers — attracts co-author reposts.`,
                sourceLabel: `${livePaper.source}`,
                sourceUrl: livePaper.url,
                visualBlueprint: 'Crop the main architecture figure + Pareto frontier plot from the paper side-by-side, highlighting the key bottleneck in red.',
                hooks: [
                    `Reading "${livePaper.title}" today.\n\nWhat stood out to me is how closely this connects to a question we keep hitting in efficient visual generation: where should compute actually go during inference?\n\nQuick 3-point takeaway on what works (and what's still open):`,
                    `Can we get better generation quality without scaling model parameters?\n\nA fresh paper on ${livePaper.source} ("${livePaper.title}") tackles this from a neat angle.\n\nHere is the core mechanism in plain English — and how it compares to nested/looped decode-time scaling:`,
                    `Interesting new work out today: "${livePaper.title}".\n\n${livePaper.summary ? livePaper.summary.slice(0, 155) + '…' : 'Rethinks efficiency and representation scaling.'}\n\nWhy this matters if you work on generative models or vision transformers:`
                ],
                replyLink: `Paper link: ${livePaper.url}\n\nRelated work from our group on decode-time scaling (MaGNeTS, ICML '25): https://arxiv.org/pdf/2502.00382 & Elastic Looped Transformers (ECCV '26): https://arxiv.org/abs/2604.09168`
            },
            {
                id: 'rec-followup-' + portfolioPlay.id,
                archKey: 'followup',
                rankLabel: '#4 Compounding Thread Follow-Up',
                archetype: 'Portfolio Cross-Pollination & Math Gem',
                title: portfolioPlay.title,
                predictedCitations: '130 – 260 Citations',
                predictedViews: '3.8K – 11K Views',
                whyItWorks: `${portfolioPlay.metricsRef}. On X, following up a successful technical post 24–48h later with the single most surprising mathematical detail or visual edge-case captures a second wave of readers who missed post #1.`,
                sourceLabel: 'sahilg06.github.io Interactive Blog',
                sourceUrl: 'https://sahilg06.github.io/blog_posts/forward-vs-reverse-kl.html',
                visualBlueprint: portfolioPlay.visualTip,
                hooks: portfolioPlay.hooks,
                replyLink: portfolioPlay.replyLink
            },
            {
                id: 'rec-quotetweet-live',
                archKey: 'quotetweet',
                rankLabel: '#5 Fast Reply Velocity / Industry Pulse',
                archetype: 'Timely AI & Tech Reflection',
                title: `Sharp Researcher Take on Today’s Tech Pulse: "${techStory.title}"`,
                predictedCitations: '65 – 150 Citations',
                predictedViews: '2.0K – 6.5K Views',
                whyItWorks: `Matches your concise human/industry reflections (like your Oct 27 quote-tweet on @paraschopra & conference reflections at 59+ likes). Short 2-sentence observations grounded in real lab experience spark high reply-to-view ratios.`,
                sourceLabel: `${techStory.source} (${techStory.points || 100}+ pts)`,
                sourceUrl: techStory.url,
                visualBlueprint: 'No link in the main post — keep it pure 2–3 lines of text or quote-tweet a major discussion thread directly.',
                hooks: [
                    `Everyone is talking about "${techStory.title}" today.\n\nFrom the trenches of training generative models: the bottleneck is shifting from raw compute to knowing *which* tokens and *which* steps actually deserve FLOPs.`,
                    `Hot take inspired by today's discussion on "${techStory.title}":\n\nThe best ML papers over the next 2 years won't be 10× larger models — they'll be 2016–2018 mathematical ideas revisited with modern hardware & interactive intuition.`,
                    `Watching the conversation around "${techStory.title}".\n\nAs AI automates more boilerplate coding and literature synthesis, two things appreciate in value for researchers: deep mathematical taste and genuine human connection.`
                ],
                replyLink: `Context / discussion link: ${techStory.url}`
            }
        ];

        return recs;
    }

    function renderPostLab() {
        const root = document.getElementById('postlab-cards');
        const allRecs = buildDailyRecommendations();
        const visible = activePostLabArch === 'all'
            ? allRecs
            : allRecs.filter(r => r.archKey === activePostLabArch);

        document.getElementById('postlab-count-badge').textContent = `${allRecs.length} Today`;
        root.innerHTML = '';

        visible.forEach((rec, idx) => {
            const card = document.createElement('article');
            card.className = 'postlab-card';
            const defaultHook = rec.hooks[0] || '';

            card.innerHTML = `
                <div class="postlab-card-top">
                    <div class="postlab-card-badges">
                        <span class="postlab-rank-badge">${escapeHtml(rec.rankLabel)}</span>
                        <span class="postlab-arch-badge">${escapeHtml(rec.archetype)}</span>
                    </div>
                    <div class="postlab-pred-pills">
                        <span class="postlab-pred-cit" title="Predicted Weighted Citations">📈 ${escapeHtml(rec.predictedCitations)}</span>
                        <span class="postlab-pred-views">👁 ${escapeHtml(rec.predictedViews)}</span>
                    </div>
                </div>

                <h3 class="postlab-card-title">${escapeHtml(rec.title)}</h3>

                <p class="postlab-why">
                    <strong>Why this works for @vibespersecond:</strong> ${escapeHtml(rec.whyItWorks)}
                </p>

                <div class="postlab-source-row">
                    <span>Signal source: <a href="${escapeHtml(rec.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(rec.sourceLabel)} ↗</a></span>
                </div>

                <div class="postlab-hook-switcher" role="group" aria-label="Select hook angle">
                    <span class="postlab-hook-label">Hook Angle:</span>
                    <button type="button" class="reading-chip active" data-hidx="0">Angle A (Story / Back-to-Basics)</button>
                    <button type="button" class="reading-chip" data-hidx="1">Angle B (Math / Mechanism)</button>
                    <button type="button" class="reading-chip" data-hidx="2">Angle C (Question / Punchy)</button>
                </div>

                <div class="postlab-composer-grid">
                    <div class="postlab-composer-col">
                        <label class="postlab-label">
                            <span>Main Post (No external link in Tweet #1 for +2.1× X reach)</span>
                            <span class="postlab-char" data-role="char"></span>
                        </label>
                        <textarea class="postlab-textarea" rows="5" data-role="main-text">${escapeHtml(defaultHook)}</textarea>
                    </div>
                    <div class="postlab-composer-col">
                        <label class="postlab-label">
                            <span>Reply #2 (Drop blog / paper / sheet link here)</span>
                        </label>
                        <textarea class="postlab-textarea postlab-textarea-reply" rows="5" data-role="reply-text">${escapeHtml(rec.replyLink)}</textarea>
                    </div>
                </div>

                <div class="postlab-visual-tip">
                    <strong>🎨 Visual / Interactive Asset Tip:</strong> ${escapeHtml(rec.visualBlueprint)}
                </div>

                <div class="postlab-card-actions">
                    <button type="button" class="xscholar-btn-primary" data-action="post-x">Post on X ↗</button>
                    <button type="button" class="xscholar-btn-ghost" data-action="copy-main">Copy Post #1</button>
                    <button type="button" class="xscholar-btn-ghost" data-action="copy-reply">Copy Reply #2</button>
                    <button type="button" class="xscholar-btn-ghost" data-action="ai-rewrite">✨ AI Voice Polish</button>
                    <button type="button" class="xscholar-btn-ghost" data-action="score-draft">Test in Scorer →</button>
                </div>
            `;

            const mainTa = card.querySelector('[data-role="main-text"]');
            const replyTa = card.querySelector('[data-role="reply-text"]');
            const charSpan = card.querySelector('[data-role="char"]');
            const updateChars = () => {
                const len = mainTa.value.length;
                charSpan.textContent = `${len} chars`;
                charSpan.style.color = len > 280 ? 'var(--color-accent)' : 'var(--color-text-muted)';
            };
            updateChars();
            mainTa.addEventListener('input', updateChars);

            // Hook switcher buttons
            const hookBtns = card.querySelectorAll('.postlab-hook-switcher .reading-chip');
            hookBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    hookBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const hIdx = Number(btn.dataset.hidx) || 0;
                    mainTa.value = rec.hooks[hIdx] || rec.hooks[0];
                    updateChars();
                });
            });

            // Actions
            card.querySelector('[data-action="post-x"]').addEventListener('click', () => {
                const url = `https://x.com/intent/tweet?text=${encodeURIComponent(mainTa.value)}`;
                window.open(url, '_blank', 'noopener');
            });
            card.querySelector('[data-action="copy-main"]').addEventListener('click', () => {
                copyText(mainTa.value, 'Copied Main Post #1');
            });
            card.querySelector('[data-action="copy-reply"]').addEventListener('click', () => {
                copyText(replyTa.value, 'Copied Reply #2 (Link)');
            });
            card.querySelector('[data-action="score-draft"]').addEventListener('click', () => {
                switchTab('scorer');
                document.getElementById('scorer-draft-input').value = mainTa.value;
                evaluateDraft();
            });
            card.querySelector('[data-action="ai-rewrite"]').addEventListener('click', async e => {
                const btn = e.currentTarget;
                await polishWithAI(mainTa, rec.title, btn, updateChars);
            });

            root.appendChild(card);
        });
    }

    function renderLiveRadar() {
        const grid = document.getElementById('postlab-radar-grid');
        grid.innerHTML = '';

        const items = [
            ...liveSignals.hfPapers.slice(0, 4),
            ...liveSignals.arxivPapers.slice(0, 4),
            ...liveSignals.techPulse.slice(0, 4)
        ];

        if (!items.length) {
            grid.innerHTML = `<p class="gs-empty">Live feeds loading or offline — using built-in research signal vault above.</p>`;
            return;
        }

        items.slice(0, 9).forEach(item => {
            const box = document.createElement('div');
            box.className = 'postlab-radar-item';
            box.innerHTML = `
                <div class="postlab-radar-meta">
                    <span class="gs-badge">${escapeHtml(item.source)}</span>
                    ${item.upvotes ? `<span>▲ ${item.upvotes}</span>` : ''}
                    ${item.points ? `<span>▲ ${item.points} pts</span>` : ''}
                </div>
                <h4><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)} ↗</a></h4>
                ${item.summary ? `<p>${escapeHtml(item.summary.slice(0, 140))}…</p>` : ''}
                <button type="button" class="gs-template-btn">Draft Post in My Voice →</button>
            `;
            box.querySelector('button').addEventListener('click', () => {
                createCustomRadarDraft(item);
            });
            grid.appendChild(box);
        });
    }

    function createCustomRadarDraft(item) {
        const isPaper = item.source.includes('Hugging Face') || item.source.includes('arXiv');
        const newRec = {
            id: 'custom-' + Date.now(),
            archKey: isPaper ? 'paper' : 'quotetweet',
            rankLabel: '★ Custom Live Radar Draft',
            archetype: isPaper ? 'Live Paper Breakdown' : 'Timely AI / Tech Take',
            title: item.title,
            predictedCitations: isPaper ? '120 – 250 Citations' : '75 – 160 Citations',
            predictedViews: isPaper ? '3.5K – 9.0K Views' : '2.2K – 6.0K Views',
            whyItWorks: `Generated directly from today's ${item.source} feed, structured around @vibespersecond's concise research commentary style.`,
            sourceLabel: item.source,
            sourceUrl: item.url,
            visualBlueprint: isPaper
                ? 'Include the paper’s teaser diagram or key table alongside your 1-sentence intuition.'
                : 'Quote-tweet or post as a crisp 2-paragraph observation.',
            hooks: [
                `Reading "${item.title}" today.\n\n${item.summary ? item.summary.slice(0, 145) + '…' : 'Really clean formulation of a problem we see all the time in efficient ML.'}\n\nWhat stood out to me most:`,
                `Can we push efficiency further without sacrificing generation quality?\n\nNew on ${item.source}: "${item.title}".\n\nHere is the core idea in 30 seconds — and how it connects to adaptive/nested compute:`,
                `Quick thought on "${item.title}":\n\nThe most underrated breakthroughs right now come from rethinking *where* we spend compute rather than just scaling parameters.`
            ],
            replyLink: `Link: ${item.url}`
        };
        customRadarDrafts.unshift(newRec);
        activePostLabArch = 'all';
        renderPostLab();
        document.getElementById('postlab-cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToastMsg('Generated custom draft card at top of Post Lab!');
    }

    // Optional LLM Rewrite in @vibespersecond's voice
    async function polishWithAI(textarea, topicTitle, btn, onUpdate) {
        const provider = localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'gemini';
        const apiKey = (localStorage.getItem(STORAGE_KEYS.AI_KEY) || '').trim();

        if (!apiKey) {
            // Smart zero-key local voice synthesizer
            const current = textarea.value.trim();
            const prefixOptions = [
                "Went a little back to basics today.\n\n",
                "Something I kept thinking about while reading papers today:\n\n",
                "Quick intuition note for anyone working on generative models / efficient ML:\n\n"
            ];
            const suffixOptions = [
                "\n\nInteractive visual + full breakdown in reply ↓",
                "\n\nCurious how others training vision/multimodal models are seeing this in practice.",
                "\n\nPut together a clean visual note + math walkthrough below ↓"
            ];
            const p = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
            const s = suffixOptions[Math.floor(Math.random() * suffixOptions.length)];
            const body = current.replace(/^Went a little back to basics today\.\s*/i, '').replace(/\n\nInteractive.*$/i, '');
            textarea.value = `${p}${body}${s}`;
            onUpdate();
            showToastMsg('Applied @vibespersecond signature hook & thread cadence! (Add an API key in ⚙ AI Key for custom LLM rewrites)');
            return;
        }

        const origText = btn.textContent;
        btn.textContent = '✨ Rewriting…';
        btn.disabled = true;

        const systemPrompt = `You are writing an X (Twitter) post for Sahil Goyal (@vibespersecond), an ML Researcher (ex-Google DeepMind on Veo/Gemini, Adobe Research, IIT Roorkee Applied Math Gold Medalist, working on efficient generative models, MaGNeTS ICML'25, Elastic Looped Transformers ECCV'26).
Style rules from his highest-performing posts:
1. Clear, grounded, intellectually curious, zero cringe hype or generic AI bro clichés.
2. Starts with a crisp hook ("Went a little back to basics today.", "Applying for a PhD in ML/CV this cycle?", "Can we generate high-quality images/videos 3× faster without extra parameters?").
3. Uses concrete technical terms (Forward vs. Reverse KL, decode-time scaling, KV caching, nested transformers, mode-seeking).
4. Keep under 275 characters if possible. Return ONLY the rewritten tweet text.`;

        try {
            let rewritten = '';
            if (provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\nTopic: ${topicTitle}\nCurrent draft:\n${textarea.value}` }] }]
                    })
                });
                const data = await res.json();
                rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            } else {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: `Topic: ${topicTitle}\nCurrent draft:\n${textarea.value}` }
                        ]
                    })
                });
                const data = await res.json();
                rewritten = data?.choices?.[0]?.message?.content?.trim() || '';
            }

            if (rewritten) {
                textarea.value = rewritten;
                onUpdate();
                showToastMsg('Rewritten with ' + (provider === 'gemini' ? 'Gemini' : 'OpenAI'));
            } else {
                showToastMsg('Could not parse LLM response — check API key in ⚙ AI Key');
            }
        } catch (err) {
            showToastMsg('API call failed — check your key in ⚙ AI Key');
        } finally {
            btn.textContent = origText;
            btn.disabled = false;
        }
    }

    // ==================== TAB 3: DRAFT SCORER & SIMULATOR ====================
    function evaluateDraft() {
        const text = (document.getElementById('scorer-draft-input').value || '').trim();
        const hasMedia = document.getElementById('scorer-opt-media').checked;
        const replyLink = document.getElementById('scorer-opt-replylink').checked;
        const isResource = document.getElementById('scorer-opt-resource').checked;
        const primeWindow = document.getElementById('scorer-opt-primewindow').checked;

        const charCount = document.getElementById('scorer-char-count');
        charCount.textContent = `${text.length} / 280 chars`;
        charCount.style.color = text.length > 280 ? 'var(--color-accent)' : 'var(--color-text-muted)';

        const tl = text.toLowerCase();
        const firstLine = (text.split('\n')[0] || '').trim();

        // 6-Axis evaluation based on @vibespersecond's historical data
        const hasStrongHook = /\?|back to basics|applying for|whenever i|why do|can we|my first work|sharing my/i.test(firstLine) && firstLine.length >= 18 && firstLine.length <= 120;
        const hasQuantOrMath = /(\d+×|\d+%|\d+k|kl|divergence|moe|diffusion|transformer|token|phd|icml|eccv|iclr|log\s*2|sde|ode|kv|latent)/i.test(text);
        const hasInlineUrl = /https?:\/\//i.test(text);
        const linkStrategyGood = replyLink && !hasInlineUrl;
        const goodStructure = text.includes('\n\n') && text.length >= 70 && text.length <= 360;

        let score = 32;
        if (hasStrongHook) score += 16;
        else if (firstLine.length > 10) score += 7;

        if (hasQuantOrMath) score += 16;
        if (hasMedia) score += 14;
        if (linkStrategyGood) score += 10;
        if (isResource) score += 10;
        if (primeWindow) score += 6;
        if (goodStructure) score += 6;
        score = Math.min(99, Math.max(15, score));

        document.getElementById('scorer-total-score').innerHTML = `${score}<span>/100</span>`;
        const tierBadge = document.getElementById('scorer-tier-badge');
        if (score >= 85) {
            tierBadge.textContent = 'Top 5% Viral / High-Bookmark Tier';
        } else if (score >= 70) {
            tierBadge.textContent = 'Top 15% High-Engagement Tier';
        } else if (score >= 55) {
            tierBadge.textContent = 'Solid Baseline Reach';
        } else {
            tierBadge.textContent = 'Needs Hook / Asset Boost';
        }

        const baseCit = Math.round(Math.pow(score / 18, 2.55) * (isResource ? 1.45 : 1.0));
        const lowCit = Math.max(12, Math.round(baseCit * 0.75));
        const highCit = Math.max(25, Math.round(baseCit * 1.45));
        const lowViews = Math.round(lowCit * 24);
        const highViews = Math.round(highCit * 32);
        const lowLikes = Math.max(5, Math.round(lowCit * 0.42));
        const highLikes = Math.max(12, Math.round(highCit * 0.48));
        const lowBm = Math.max(1, Math.round(lowCit * (isResource ? 0.24 : 0.14)));
        const highBm = Math.max(4, Math.round(highCit * (isResource ? 0.28 : 0.18)));

        document.getElementById('scorer-pred-citations').textContent = `${lowCit} – ${highCit}`;
        document.getElementById('scorer-pred-views').textContent = `${fmtNum(lowViews)} – ${fmtNum(highViews)}`;
        document.getElementById('scorer-pred-likes').textContent = `${lowLikes} – ${highLikes}`;
        document.getElementById('scorer-pred-bookmarks').textContent = `${lowBm} – ${highBm}`;

        // Matched archetype
        let matchedArch = 'Personal Reflection / Quick Update';
        if (isResource || /phd|tracker|sop|fellowship|application/i.test(tl)) {
            matchedArch = 'High-Utility Academic Tracker (like Oct 12 PhD Post · 1,178 cit.)';
        } else if (/kl|interactive|basics|note|math|sandbox|geometry/i.test(tl)) {
            matchedArch = 'Interactive Classic Rebuild (like Oct 27 KL Post · 169 cit.)';
        } else if (/icml|eccv|accepted|deepmind|paper|presenting/i.test(tl)) {
            matchedArch = 'Research Milestone + Visual (like May 1 ICML Post · 690 cit.)';
        } else if (/magnets|moe|diffusion|token|faster|decode/i.test(tl)) {
            matchedArch = 'Technical Paper Deep-Dive (like Feb 9 MaGNeTS Post · 278 cit.)';
        }
        document.getElementById('scorer-matched-arch-name').textContent = matchedArch;

        const checks = [
            {
                ok: hasStrongHook,
                label: 'First-Line Hook Curiosity',
                detail: hasStrongHook
                    ? 'Strong opening hook ("Back to basics", question, or concrete milestone).'
                    : 'Tip: Start with a sharp question, a "Went back to basics today" framing, or a concrete metric (e.g. "3× faster without extra parameters").'
            },
            {
                ok: hasQuantOrMath,
                label: 'Technical / Quantitative Anchors',
                detail: hasQuantOrMath
                    ? 'Includes specific ML/math anchors that trigger researcher bookmarks.'
                    : 'Tip: Mention a concrete mechanism, threshold (like log 2), speedup (3×), or conference/model name.'
            },
            {
                ok: goodStructure,
                label: 'Scannable Multi-Paragraph Cadence',
                detail: goodStructure
                    ? 'Clean whitespace and multi-line rhythm matching your top posts.'
                    : 'Tip: Break into 2–3 short paragraphs separated by blank lines (120–260 chars total).'
            },
            {
                ok: linkStrategyGood,
                label: 'X Algorithm Link Placement',
                detail: linkStrategyGood
                    ? 'No external URL in main post — keeping links in Reply #2 avoids X feed throttling.'
                    : 'Tip: Move external URLs (blog/arXiv/Sheets) to Reply #2 so X does not penalize the main tweet.'
            },
            {
                ok: hasMedia,
                label: 'Visual / Interactive Demo Attachment',
                detail: hasMedia
                    ? 'Visual attachment enabled (+2.4× average citations on @vibespersecond).'
                    : 'Tip: Attach a custom plot, interactive blog GIF, or annotated figure.'
            },
            {
                ok: primeWindow,
                label: 'Prime Follower Activity Window',
                detail: primeWindow
                    ? 'Aligned with your top decile window (2:00–4:30 PM IST / 08:30–11:00 UTC).'
                    : 'Tip: Schedule for 2:00–4:30 PM IST (Europe + India + US East morning) or 8:30 PM IST.'
            }
        ];

        const checkRoot = document.getElementById('scorer-checklist');
        checkRoot.innerHTML = '';
        checks.forEach(c => {
            const li = document.createElement('li');
            li.className = c.ok ? 'check-pass' : 'check-warn';
            li.innerHTML = `
                <span class="check-icon">${c.ok ? '✓' : '△'}</span>
                <div>
                    <strong>${c.label}</strong>
                    <p>${c.detail}</p>
                </div>
            `;
            checkRoot.appendChild(li);
        });
    }

    function generateScorerRewrites() {
        const raw = (document.getElementById('scorer-draft-input').value || '').trim();
        const clean = raw.replace(/https?:\/\/\S+/g, '').trim() || 'exploring how adaptive compute and clean mathematical intuition improve visual generation';
        const firstSentence = clean.split(/[\n.!?]/)[0].trim();

        const variations = [
            {
                label: 'Variation 1 — "Back to Basics" Interactive Note Framing',
                text: `Went a little back to basics today.\n\nWhenever I needed clean intuition on ${firstSentence.toLowerCase()}, I always went back to the original mathematical formulation.\n\nRebuilt the core trade-off into an interactive visual note grounded in modern generative models:`
            },
            {
                label: 'Variation 2 — Quantitative / Question Hook (MaGNeTS Style)',
                text: `Why do we still treat ${firstSentence.toLowerCase()} as a fixed hyperparameter in visual generation?\n\nBy making it adaptive at inference time, you get a much cleaner Pareto frontier without adding parameters.\n\nKey intuition + visual breakdown ↓`
            },
            {
                label: 'Variation 3 — High-Bookmark Researcher Resource / Synthesis',
                text: `${clean}\n\nPut together a concise visual cheat-sheet + interactive sandbox covering:\n1. Geometric intuition\n2. Where standard approximations break\n3. Practical takeaways for training & inference ↓`
            }
        ];

        const box = document.getElementById('scorer-rewrites-box');
        const list = document.getElementById('scorer-rewrites-list');
        box.hidden = false;
        list.innerHTML = '';

        variations.forEach(v => {
            const item = document.createElement('div');
            item.className = 'scorer-rewrite-card';
            item.innerHTML = `
                <div class="scorer-rewrite-head">
                    <strong>${escapeHtml(v.label)}</strong>
                    <button type="button" class="gs-template-btn">Use This Draft ↑</button>
                </div>
                <p>${escapeHtml(v.text)}</p>
            `;
            item.querySelector('button').addEventListener('click', () => {
                document.getElementById('scorer-draft-input').value = v.text;
                evaluateDraft();
                showToastMsg('Loaded variation into editor');
            });
            list.appendChild(item);
        });
    }

    // ==================== SYNC / IMPORT HANDLERS ====================
    async function handleAddTweetByUrl(e) {
        e.preventDefault();
        const urlInput = document.getElementById('input-tweet-url');
        const statusEl = document.getElementById('sync-url-status');
        const rawUrl = urlInput.value.trim();
        const m = rawUrl.match(/status\/(\d+)/);
        if (!m) {
            statusEl.textContent = 'Please enter a valid X post URL containing /status/<id>.';
            return;
        }
        const tid = m[1];
        statusEl.textContent = `Fetching tweet ${tid}…`;

        const viewsOverride = Number(document.getElementById('input-tweet-views').value) || 0;
        const bmOverride = Number(document.getElementById('input-tweet-bookmarks').value) || 0;
        const likesOverride = Number(document.getElementById('input-tweet-likes').value) || 0;

        let text = '';
        let createdIso = new Date().toISOString();
        let likes = likesOverride || 25;
        let reposts = 2;
        let replies = 1;

        // Try oEmbed via publish.twitter.com (supports CORS/JSON) or syndication
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

        if (!text) {
            text = `Post ${tid} by @vibespersecond (${rawUrl})`;
        }

        const dt = new Date(createdIso);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthStr = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
        const bookmarks = bmOverride || Math.round(likes * 0.2);
        const views = viewsOverride || Math.max(likes * 30, 500);

        const metrics = { likes, reposts, replies, quotes: 0, bookmarks, views };
        const newTweet = {
            id: tid,
            title: text.split('\n')[0].slice(0, 105),
            text,
            created_at: createdIso,
            year: dt.getFullYear(),
            month: monthStr,
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
        renderCategoryChips();
        renderPublicationsTable();
        statusEl.textContent = `✓ Indexed post ${tid} (${newTweet.citations} citations)!`;
        urlInput.value = '';
    }

    function parseAnalyticsCSV(csvText) {
        const rows = [];
        let row = [], field = '', inQ = false;
        for (let i = 0; i < csvText.length; i++) {
            const c = csvText[i];
            if (inQ) {
                if (c === '"' && csvText[i + 1] === '"') { field += '"'; i++; }
                else if (c === '"') inQ = false;
                else field += c;
            } else if (c === '"') inQ = true;
            else if (c === ',') { row.push(field); field = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && csvText[i + 1] === '\n') i++;
                row.push(field); rows.push(row); row = []; field = '';
            } else field += c;
        }
        if (field || row.length) { row.push(field); rows.push(row); }
        return rows.filter(r => r.some(x => x.trim()));
    }

    function handleCSVImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const statusEl = document.getElementById('sync-csv-status');
        const reader = new FileReader();
        reader.onload = () => {
            const content = String(reader.result || '');
            let imported = 0;
            try {
                if (file.name.endsWith('.json') || file.name.endsWith('.js')) {
                    const jsonStr = content.replace(/^window\.YTD\.tweets\.part\d+\s*=\s*/, '');
                    const parsed = JSON.parse(jsonStr);
                    const arr = Array.isArray(parsed) ? parsed : (parsed.tweets || []);
                    arr.forEach(item => {
                        const t = item.tweet || item;
                        const tid = t.id_str || t.id;
                        if (!tid) return;
                        const likes = Number(t.favorite_count ?? t.metrics?.likes ?? 0);
                        const reposts = Number(t.retweet_count ?? t.metrics?.reposts ?? 0);
                        const replies = Number(t.reply_count ?? t.metrics?.replies ?? 0);
                        const bookmarks = Number(t.metrics?.bookmarks ?? Math.round(likes * 0.15));
                        const views = Number(t.metrics?.views ?? Math.max(likes * 28, 200));
                        const rawText = (t.full_text || t.text || '').replace(/https:\/\/t\.co\/\w+/g, '').trim();
                        const metrics = { likes, reposts, replies, quotes: 0, bookmarks, views };
                        saveLocalTweet({
                            id: String(tid),
                            title: t.title || rawText.split('\n')[0].slice(0, 105) || 'Post on X',
                            text: rawText,
                            created_at: t.created_at || new Date().toISOString(),
                            year: Number(t.year) || 2026,
                            month: t.month || 'Oct 2026',
                            url: `https://x.com/vibespersecond/status/${tid}`,
                            category: t.category || 'Efficient ML & Generative Models',
                            archetype: t.archetype || 'Technical Deep-Dive / Paper Thread',
                            has_media: true,
                            coauthors: t.coauthors || [],
                            metrics,
                            citations: computeCitations(metrics)
                        });
                        imported++;
                    });
                } else {
                    const [header, ...body] = parseAnalyticsCSV(content);
                    const findCol = re => header.findIndex(h => re.test(h.trim()));
                    const colId = findCol(/tweet id|^id$/i);
                    const colText = findCol(/tweet text|text|post text/i);
                    const colTime = findCol(/time|date|created/i);
                    const colImp = findCol(/impressions|views/i);
                    const colLikes = findCol(/likes/i);
                    const colRt = findCol(/retweets|reposts/i);
                    const colRep = findCol(/replies/i);
                    const colBm = findCol(/bookmarks/i);

                    body.forEach(r => {
                        const tid = (r[colId] || '').trim();
                        const txt = (r[colText] || '').trim();
                        if (!tid || !txt) return;
                        const likes = Number(r[colLikes] || 0);
                        const reposts = Number(r[colRt] || 0);
                        const replies = Number(r[colRep] || 0);
                        const views = Number(r[colImp] || likes * 28);
                        const bookmarks = colBm >= 0 ? Number(r[colBm] || 0) : Math.round(likes * 0.15);
                        const timeStr = (r[colTime] || '').trim();
                        const dt = timeStr ? new Date(timeStr) : new Date();
                        const year = isNaN(dt.getFullYear()) ? 2026 : dt.getFullYear();
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = isNaN(dt.getMonth()) ? 'Oct 2026' : `${months[dt.getMonth()]} ${year}`;
                        const metrics = { likes, reposts, replies, quotes: 0, bookmarks, views };
                        saveLocalTweet({
                            id: tid,
                            title: txt.split('\n')[0].slice(0, 105),
                            text: txt,
                            created_at: isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString(),
                            year,
                            month,
                            url: `https://x.com/vibespersecond/status/${tid}`,
                            category: 'Efficient ML & Generative Models',
                            archetype: 'Technical Deep-Dive / Paper Thread',
                            has_media: false,
                            coauthors: [],
                            metrics,
                            citations: computeCitations(metrics)
                        });
                        imported++;
                    });
                }
                renderScholarSidebar();
                renderCategoryChips();
                renderPublicationsTable();
                statusEl.textContent = `✓ Imported / updated ${imported} posts!`;
            } catch (err) {
                statusEl.textContent = `Error parsing file: ${err.message}`;
            }
        };
        reader.readAsText(file);
    }

    function switchTab(tabId) {
        const tabs = document.querySelectorAll('.xscholar-tab');
        tabs.forEach(t => {
            const active = t.dataset.tab === tabId;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', String(active));
        });
        document.getElementById('panel-profile').hidden = tabId !== 'profile';
        document.getElementById('panel-postlab').hidden = tabId !== 'postlab';
        document.getElementById('panel-scorer').hidden = tabId !== 'scorer';
    }

    // Initialize everything on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', async () => {
        await loadStore();
        renderCategoryChips();
        renderScholarSidebar();
        renderPublicationsTable();

        // Pre-populate Draft Scorer with an inspiring default draft
        const defaultDraft = `Went a little back to basics today.\n\nWhenever I wanted clean geometric intuition on why Flow Matching replaced classic DDPM schedules in modern image/video models, I went back to the 2022 Rectified Flow & OT notes.\n\nBuilt an interactive visual note on why straight-line trajectories make 4-step sampling work:`;
        document.getElementById('scorer-draft-input').value = defaultDraft;
        evaluateDraft();

        // Tab switching
        document.querySelectorAll('.xscholar-tab').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        document.getElementById('btn-jump-postlab').addEventListener('click', () => switchTab('postlab'));

        // Search & Filters on Scholar Profile
        document.getElementById('gs-search-input').addEventListener('input', e => {
            filterState.search = e.target.value;
            filterState.limit = 25;
            renderPublicationsTable();
        });
        document.getElementById('gs-sort-select').addEventListener('change', e => {
            filterState.sort = e.target.value;
            renderPublicationsTable();
        });
        document.getElementById('gs-year-select').addEventListener('change', e => {
            filterState.year = e.target.value;
            renderPublicationsTable();
        });
        document.getElementById('btn-clear-gs-filter').addEventListener('click', () => {
            filterState = { search: '', category: 'all', coauthor: '', year: 'all', sort: filterState.sort, limit: 25 };
            document.getElementById('gs-search-input').value = '';
            document.getElementById('gs-year-select').value = 'all';
            renderCategoryChips();
            renderScholarSidebar();
            renderPublicationsTable();
        });
        document.getElementById('btn-show-more-posts').addEventListener('click', () => {
            filterState.limit += 30;
            renderPublicationsTable();
        });

        // Post Lab Controls
        document.getElementById('btn-refresh-signals').addEventListener('click', () => {
            fetchLiveSignals(true);
        });
        document.querySelectorAll('#postlab-archetype-filters .reading-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#postlab-archetype-filters .reading-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activePostLabArch = chip.dataset.arch;
                renderPostLab();
            });
        });

        // Scorer listeners
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

        // Drawers (Sync & AI Settings)
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

        // Sync form & CSV
        document.getElementById('form-add-tweet').addEventListener('submit', handleAddTweetByUrl);
        document.getElementById('input-csv-file').addEventListener('change', handleCSVImport);
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
            showToastMsg('Cleared browser cache additions');
        });

        // AI Settings form
        const savedProvider = localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'gemini';
        const savedKey = localStorage.getItem(STORAGE_KEYS.AI_KEY) || '';
        document.getElementById('select-ai-provider').value = savedProvider;
        document.getElementById('input-ai-key').value = savedKey;
        document.getElementById('form-ai-settings').addEventListener('submit', e => {
            e.preventDefault();
            localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, document.getElementById('select-ai-provider').value);
            localStorage.setItem(STORAGE_KEYS.AI_KEY, document.getElementById('input-ai-key').value.trim());
            document.getElementById('settings-status').textContent = '✓ Saved key in browser localStorage.';
            showToastMsg('Saved AI key in browser');
        });
        document.getElementById('btn-clear-key').addEventListener('click', () => {
            localStorage.removeItem(STORAGE_KEYS.AI_KEY);
            document.getElementById('input-ai-key').value = '';
            document.getElementById('settings-status').textContent = 'Cleared API key.';
        });

        // Render Post Lab immediately and fetch live feeds in background
        renderPostLab();
        fetchLiveSignals(false);
    });
})();
