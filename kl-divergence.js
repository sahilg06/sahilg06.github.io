/*
 * Interactive visualizations for "Forward vs. Reverse KL Divergence".
 * Renders:
 *   1. The 5-stage progression strip (Delta mu = 0, 2.5, 5.0, 5.62, 10.0)
 *   2. The interactive KL playground (density view + pointwise KL integrand view)
 * Automatically adapts to light/dark theme toggles.
 */
(function () {
    'use strict';

    // 261-point Simpson quadrature on standard normal z in [-6.5, 6.5]
    const QUAD_N = 261;
    const QUAD_Z = new Float64Array(QUAD_N);
    const QUAD_W = new Float64Array(QUAD_N);
    (function initQuadrature() {
        const dz = 13.0 / (QUAD_N - 1);
        const invSqrt2Pi = 1 / Math.sqrt(2 * Math.PI);
        for (let i = 0; i < QUAD_N; i++) {
            const z = -6.5 + i * dz;
            QUAD_Z[i] = z;
            const coeff = (i === 0 || i === QUAD_N - 1) ? 1 : (i % 2 === 1 ? 4 : 2);
            QUAD_W[i] = (dz / 3) * coeff * Math.exp(-0.5 * z * z) * invSqrt2Pi;
        }
    })();

    function normalPdf(x, mu, sigma) {
        const z = (x - mu) / sigma;
        return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
    }

    function normalLogPdf(x, mu, sigma) {
        const z = (x - mu) / sigma;
        return -0.5 * Math.log(2 * Math.PI) - Math.log(sigma) - 0.5 * z * z;
    }

    function mixturePdf(x, mu1, mu2, sigma, pi1) {
        return pi1 * normalPdf(x, mu1, sigma) + (1 - pi1) * normalPdf(x, mu2, sigma);
    }

    function mixtureLogPdf(x, mu1, mu2, sigma, pi1) {
        const a = Math.log(pi1) + normalLogPdf(x, mu1, sigma);
        const b = Math.log(1 - pi1) + normalLogPdf(x, mu2, sigma);
        const m = Math.max(a, b);
        return m + Math.log(Math.exp(a - m) + Math.exp(b - m));
    }

    // Exact closed-form Moment Matching solution for Forward KL: argmin_q KL(p || q)
    function solveForwardKL(mu1, mu2, sigma, pi1) {
        const pi2 = 1 - pi1;
        const mu = pi1 * mu1 + pi2 * mu2;
        const variance = sigma * sigma + pi1 * pi2 * (mu2 - mu1) * (mu2 - mu1);
        const std = Math.sqrt(variance);

        // Compute KL(p || q_fwd) = -H(p) - E_p[log q_fwd]
        // Since E_p[log q_fwd] = -0.5 * log(2 * pi * e * variance) when moments match!
        let negEntropyP = 0;
        for (let i = 0; i < QUAD_N; i++) {
            const x1 = mu1 + sigma * QUAD_Z[i];
            const x2 = mu2 + sigma * QUAD_Z[i];
            negEntropyP += QUAD_W[i] * (
                pi1 * mixtureLogPdf(x1, mu1, mu2, sigma, pi1) +
                pi2 * mixtureLogPdf(x2, mu1, mu2, sigma, pi1)
            );
        }
        const negCrossEntropy = 0.5 * Math.log(2 * Math.PI * Math.E * variance);
        const kl = Math.max(0, negEntropyP + negCrossEntropy);
        return { mu, sigma: std, kl };
    }

    function evalReverseKL(muQ, sigmaQ, mu1, mu2, sigma, pi1) {
        const entropyQ = 0.5 * Math.log(2 * Math.PI * Math.E * sigmaQ * sigmaQ);
        let expLogP = 0;
        for (let i = 0; i < QUAD_N; i++) {
            expLogP += QUAD_W[i] * mixtureLogPdf(muQ + sigmaQ * QUAD_Z[i], mu1, mu2, sigma, pi1);
        }
        return -entropyQ - expLogP;
    }

    function minimizeReverseKLFromSeed(mu0, sigma0, mu1, mu2, sigma, pi1) {
        let mu = mu0;
        let logS = Math.log(Math.max(0.1, sigma0));
        const eps = 1e-4;

        for (let iter = 0; iter < 90; iter++) {
            const s = Math.exp(logS);
            const f0 = evalReverseKL(mu, s, mu1, mu2, sigma, pi1);
            const fMuP = evalReverseKL(mu + eps, s, mu1, mu2, sigma, pi1);
            const fMuM = evalReverseKL(mu - eps, s, mu1, mu2, sigma, pi1);
            const fLSP = evalReverseKL(mu, Math.exp(logS + eps), mu1, mu2, sigma, pi1);
            const fLSM = evalReverseKL(mu, Math.exp(logS - eps), mu1, mu2, sigma, pi1);

            const gMu = (fMuP - fMuM) / (2 * eps);
            const gLS = (fLSP - fLSM) / (2 * eps);
            const norm = Math.hypot(gMu, gLS);
            if (norm < 1e-6) break;

            // Use positive-definite curvature only when convex; fall back to gradient step if near saddle
            const hMuRaw = (fMuP - 2 * f0 + fMuM) / (eps * eps);
            const hLSRaw = (fLSP - 2 * f0 + fLSM) / (eps * eps);
            const dMu = hMuRaw > 0.05 ? -gMu / hMuRaw : -0.6 * gMu;
            const dLS = hLSRaw > 0.05 ? -gLS / hLSRaw : -0.6 * gLS;

            const clampMu = Math.max(-1.2, Math.min(1.2, dMu));
            const clampLS = Math.max(-0.5, Math.min(0.5, dLS));
            const gradDot = gMu * clampMu + gLS * clampLS;

            let step = 1.0;
            while (step > 1e-4) {
                const nMu = mu + step * clampMu;
                const nLS = Math.max(Math.log(0.15), Math.min(Math.log(15), logS + step * clampLS));
                if (evalReverseKL(nMu, Math.exp(nLS), mu1, mu2, sigma, pi1) < f0 + 1e-4 * step * gradDot) {
                    mu = nMu;
                    logS = nLS;
                    break;
                }
                step *= 0.5;
            }
        }
        const finalSigma = Math.exp(logS);
        const finalKL = Math.max(0, evalReverseKL(mu, finalSigma, mu1, mu2, sigma, pi1));
        return { mu, sigma: finalSigma, kl: finalKL };
    }

    function solveReverseKL(mu1, mu2, sigma, pi1) {
        const fwd = solveForwardKL(mu1, mu2, sigma, pi1);
        const candidates = [
            minimizeReverseKLFromSeed(mu2 - 0.02 * sigma, sigma, mu1, mu2, sigma, pi1),
            minimizeReverseKLFromSeed(mu1 + 0.02 * sigma, sigma, mu1, mu2, sigma, pi1),
            minimizeReverseKLFromSeed(fwd.mu, fwd.sigma * 0.85, mu1, mu2, sigma, pi1)
        ];
        // Break exact symmetry ties (e.g. pi1 = 0.5) in favor of the right mode (mu2) to match Panels 3 & 4
        candidates.sort((a, b) => {
            if (Math.abs(a.kl - b.kl) < 1e-7) return b.mu - a.mu;
            return a.kl - b.kl;
        });
        const best = candidates[0];
        // Check if there is a distinct secondary local minimum (e.g. mode-locked vs middle, or the other mode)
        const alt = candidates.find(c => Math.abs(c.mu - best.mu) > 0.25 * sigma);
        return { ...best, alt: alt || null };
    }

    function getThemePalette() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            isDark,
            bg: isDark ? '#1b1b1b' : '#fafafa',
            grid: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            axis: isDark ? '#555555' : '#cccccc',
            text: isDark ? '#dddddd' : '#202124',
            muted: isDark ? '#9e9e9e' : '#5f6368',
            target: isDark ? '#f0f0f0' : '#202124',
            targetFill: isDark ? 'rgba(240,240,240,0.09)' : 'rgba(32,33,36,0.07)',
            forward: isDark ? '#60a5fa' : '#1d4ed8',
            forwardFill: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(29,78,216,0.08)',
            reverse: isDark ? '#ef9aa5' : '#8d1b2a',
            reverseFill: isDark ? 'rgba(239,154,165,0.14)' : 'rgba(141,27,42,0.10)'
        };
    }

    function setupCanvas(canvas, cssWidth, cssHeight) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    }

    // Draw the 4-panel progression strip
    function renderStrip() {
        const container = document.getElementById('kl-strip-grid');
        if (!container) return;
        const palette = getThemePalette();
        const stages = [
            { dmu: 0.0, title: 'Δμ = 0 (Single Mode)', note: 'Exact match: Forward = Reverse = p(x)' },
            { dmu: 2.5, title: 'Δμ = 2.5 (Shallow Valley)', note: 'Two peaks, but Reverse KL still sits in the middle!' },
            { dmu: 5.0, title: 'Δμ = 5.0 (Near Threshold)', note: 'Bridging costs 0.48 nats < log 2 (0.69); mode minima form' },
            { dmu: 8.5, title: 'Δμ = 8.5 (Deep Zero Valley)', note: 'Reverse KL snaps to one mode; Forward KL stretches wide' }
        ];

        const canvases = container.querySelectorAll('canvas[data-stage]');
        canvases.forEach((canvas, idx) => {
            const st = stages[idx];
            if (!st) return;
            const rect = canvas.getBoundingClientRect();
            const W = Math.max(200, rect.width || 230);
            const H = 155;
            const ctx = setupCanvas(canvas, W, H);

            const mu1 = 0, mu2 = st.dmu, sigma = 1.0, pi1 = 0.5;
            const fwd = solveForwardKL(mu1, mu2, sigma, pi1);
            const rev = solveReverseKL(mu1, mu2, sigma, pi1);

            const xMin = -3.8;
            const xMax = 12.3;
            const yMax = 0.44;
            const pad = { l: 10, r: 10, t: 12, b: 22 };
            const plotW = W - pad.l - pad.r;
            const plotH = H - pad.t - pad.b;

            const xToPx = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
            const yToPx = y => pad.t + plotH - (Math.min(y, yMax) / yMax) * plotH;

            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, W, H);

            // Baseline
            const y0 = yToPx(0);
            ctx.strokeStyle = palette.axis;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad.l, y0);
            ctx.lineTo(W - pad.r, y0);
            ctx.stroke();

            // X ticks
            ctx.fillStyle = palette.muted;
            ctx.font = '10px Roboto, sans-serif';
            ctx.textAlign = 'center';
            [0, 5, 10].forEach(xv => {
                const px = xToPx(xv);
                ctx.fillText(String(xv), px, H - 6);
            });

            const steps = 220;
            const drawCurve = (fn, stroke, fill, dash, width) => {
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const x = xMin + (i / steps) * (xMax - xMin);
                    const px = xToPx(x);
                    const py = yToPx(fn(x));
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                if (fill) {
                    ctx.save();
                    ctx.lineTo(xToPx(xMax), y0);
                    ctx.lineTo(xToPx(xMin), y0);
                    ctx.closePath();
                    ctx.fillStyle = fill;
                    ctx.fill();
                    ctx.restore();
                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const x = xMin + (i / steps) * (xMax - xMin);
                        const px = xToPx(x);
                        const py = yToPx(fn(x));
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                }
                ctx.strokeStyle = stroke;
                ctx.lineWidth = width || 1.8;
                ctx.setLineDash(dash || []);
                ctx.stroke();
                ctx.setLineDash([]);
            };

            // Target p(x)
            drawCurve(x => mixturePdf(x, mu1, mu2, sigma, pi1), palette.target, palette.targetFill, [], 1.8);
            // Forward KL q*(x)
            drawCurve(x => normalPdf(x, fwd.mu, fwd.sigma), palette.forward, null, [5, 4], 2.0);
            // If dmu === 5.0, also faintly show the emerging mode-seeking local minimum
            if (st.dmu === 5.0 && rev.alt) {
                drawCurve(x => normalPdf(x, rev.alt.mu, rev.alt.sigma), palette.reverse, null, [2, 3], 1.1);
            }
            // Reverse KL q*(x)
            drawCurve(x => normalPdf(x, rev.mu, rev.sigma), palette.reverse, null, [], 2.1);
        });
    }

    // Interactive Playground
    function initPlayground() {
        const canvas = document.getElementById('kl-playground-canvas');
        if (!canvas) return;

        const dmuSlider = document.getElementById('kl-slider-dmu');
        const piSlider = document.getElementById('kl-slider-pi');
        const sigmaSlider = document.getElementById('kl-slider-sigma');
        const dmuVal = document.getElementById('kl-val-dmu');
        const piVal = document.getElementById('kl-val-pi');
        const sigmaVal = document.getElementById('kl-val-sigma');
        const viewButtons = document.querySelectorAll('[data-kl-view]');
        const presetButtons = document.querySelectorAll('[data-kl-preset]');

        const metricFwdParams = document.getElementById('kl-metric-fwd-params');
        const metricFwdKL = document.getElementById('kl-metric-fwd-kl');
        const metricRevParams = document.getElementById('kl-metric-rev-params');
        const metricRevKL = document.getElementById('kl-metric-rev-kl');
        const regimeBanner = document.getElementById('kl-regime-banner');

        let currentView = 'density'; // 'density' or 'integrand'

        function renderPlayground() {
            const dmu = parseFloat(dmuSlider.value);
            const pi1 = parseFloat(piSlider.value);
            const sigma = parseFloat(sigmaSlider.value);

            dmuVal.textContent = dmu.toFixed(1);
            piVal.textContent = pi1.toFixed(2);
            sigmaVal.textContent = sigma.toFixed(2);

            const mu1 = 0.0;
            const mu2 = dmu;
            const mid = 0.5 * dmu;

            const fwd = solveForwardKL(mu1, mu2, sigma, pi1);
            const rev = solveReverseKL(mu1, mu2, sigma, pi1);

            metricFwdParams.textContent = `μ = ${fwd.mu.toFixed(2)}, σ = ${fwd.sigma.toFixed(2)}`;
            metricFwdKL.textContent = `${fwd.kl.toFixed(3)} nats`;
            metricRevParams.textContent = `μ = ${rev.mu.toFixed(2)}, σ = ${rev.sigma.toFixed(2)}`;
            metricRevKL.textContent = `${rev.kl.toFixed(3)} nats`;

            // Explain current regime in plain language
            const valleyDensity = mixturePdf(mid, mu1, mu2, sigma, pi1);
            const peakDensity = Math.max(mixturePdf(mu1, mu1, mu2, sigma, pi1), mixturePdf(mu2, mu1, mu2, sigma, pi1));
            const valleyRatio = valleyDensity / peakDensity;

            let regimeHtml = '';
            if (dmu < 0.05) {
                regimeHtml = '<strong>Single-mode regime:</strong> The target is a single Gaussian at <em>x = 0</em>, so both Forward and Reverse KL recover <em>p(x)</em> with 0 KL divergence.';
            } else if (Math.abs(rev.mu - fwd.mu) < 0.12 * sigma && Math.abs(pi1 - 0.5) < 0.03) {
                regimeHtml = `<strong>Mass-bridging regime (valley at x = ${mid.toFixed(2)} is ${(valleyRatio * 100).toFixed(0)}% of peak):</strong> Even though <em>p(x)</em> has two peaks when Δμ > ${(2 * sigma).toFixed(1)}, bridging the shallow valley (${rev.kl.toFixed(2)} nats) still costs less than the mode-locked fit. Both Forward and Reverse KL stay centered at μ = ${mid.toFixed(2)}!`;
            } else if (valleyRatio > 0.15) {
                const heavierMode = pi1 >= 0.5 ? `left mode (x = 0, π₁ = ${pi1.toFixed(2)})` : `right mode (x = ${dmu.toFixed(1)}, π₂ = ${(1 - pi1).toFixed(2)})`;
                regimeHtml = `<strong>Overlapping / shallow-valley regime (midpoint density is ${(valleyRatio * 100).toFixed(0)}% of peak):</strong> The components still overlap substantially, so Reverse KL leans toward the heavier ${heavierMode} (μ = ${rev.mu.toFixed(2)}, σ = ${rev.sigma.toFixed(2)}) while Forward KL matches the overall mean and variance (μ = ${fwd.mu.toFixed(2)}, σ = ${fwd.sigma.toFixed(2)}).`;
            } else {
                const isLeft = Math.abs(rev.mu - mu1) < Math.abs(rev.mu - mu2);
                const lockedMode = isLeft ? `left mode (x = 0)` : `right mode (x = ${dmu.toFixed(1)})`;
                const modeWeight = isLeft ? pi1 : (1 - pi1);
                const tieNote = Math.abs(pi1 - 0.5) < 0.01 ? ' (with π₁ = 0.5, both modes are tied as global minima)' : '';
                regimeHtml = `<strong>Zero-forcing / mode-seeking regime (valley at x = ${mid.toFixed(2)} is ${(valleyRatio * 100).toFixed(1)}% of peak):</strong> The valley is near zero. Forward KL stretches across both modes (μ = ${fwd.mu.toFixed(2)}, σ = ${fwd.sigma.toFixed(2)}), while Reverse KL locks onto the ${lockedMode} (paying ≈ −log(${modeWeight.toFixed(2)}) = ${(-Math.log(modeWeight)).toFixed(2)} nats)${tieNote}.`;
            }

            if (currentView === 'integrand') {
                regimeHtml += ' <br><strong>Pointwise KL Integrand view:</strong> Plots <em>p(x) log(p(x)/q(x))</em> (blue) and <em>q(x) log(q(x)/p(x))</em> (red) at each point <em>x</em>. The curve dips below zero wherever the denominator density exceeds the numerator, but the <strong>total signed area</strong> under each curve is always ≥ 0 and equals the total KL divergence.';
            }
            regimeBanner.innerHTML = regimeHtml;

            const palette = getThemePalette();
            const rect = canvas.getBoundingClientRect();
            const W = Math.max(300, rect.width || 720);
            const H = window.innerWidth < 600 ? 250 : 300;
            const ctx = setupCanvas(canvas, W, H);

            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, W, H);

            const pad = { l: 42, r: 18, t: 20, b: 32 };
            const plotW = W - pad.l - pad.r;
            const plotH = H - pad.t - pad.b;
            const xMin = -3.8;
            const xMax = 13.8;
            const xToPx = x => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;

            const steps = 360;

            if (currentView === 'density') {
                const yMax = Math.max(0.46, peakDensity * 1.12, normalPdf(rev.mu, rev.mu, rev.sigma) * 1.1);
                const yToPx = y => pad.t + plotH - (Math.min(Math.max(y, 0), yMax) / yMax) * plotH;
                const y0 = yToPx(0);

                // Horizontal grid lines
                ctx.strokeStyle = palette.grid;
                ctx.lineWidth = 1;
                [0.1, 0.2, 0.3, 0.4].forEach(yv => {
                    if (yv > yMax) return;
                    const py = yToPx(yv);
                    ctx.beginPath();
                    ctx.moveTo(pad.l, py);
                    ctx.lineTo(W - pad.r, py);
                    ctx.stroke();

                    ctx.fillStyle = palette.muted;
                    ctx.font = '11px Roboto, sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillText(yv.toFixed(1), pad.l - 7, py + 4);
                });

                // Baseline & X-axis ticks
                ctx.strokeStyle = palette.axis;
                ctx.beginPath();
                ctx.moveTo(pad.l, y0);
                ctx.lineTo(W - pad.r, y0);
                ctx.stroke();

                ctx.fillStyle = palette.muted;
                ctx.font = '11px Roboto, sans-serif';
                ctx.textAlign = 'center';
                [-2, 0, 2, 4, 6, 8, 10, 12].forEach(xv => {
                    const px = xToPx(xv);
                    ctx.fillText(String(xv), px, H - 10);
                });

                const drawDensity = (fn, stroke, fill, dash, width) => {
                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const x = xMin + (i / steps) * (xMax - xMin);
                        const px = xToPx(x);
                        const py = yToPx(fn(x));
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    if (fill) {
                        ctx.save();
                        ctx.lineTo(xToPx(xMax), y0);
                        ctx.lineTo(xToPx(xMin), y0);
                        ctx.closePath();
                        ctx.fillStyle = fill;
                        ctx.fill();
                        ctx.restore();
                        ctx.beginPath();
                        for (let i = 0; i <= steps; i++) {
                            const x = xMin + (i / steps) * (xMax - xMin);
                            const px = xToPx(x);
                            const py = yToPx(fn(x));
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                    }
                    ctx.strokeStyle = stroke;
                    ctx.lineWidth = width;
                    ctx.setLineDash(dash || []);
                    ctx.stroke();
                    ctx.setLineDash([]);
                };

                drawDensity(x => mixturePdf(x, mu1, mu2, sigma, pi1), palette.target, palette.targetFill, [], 2.2);
                drawDensity(x => normalPdf(x, fwd.mu, fwd.sigma), palette.forward, palette.forwardFill, [6, 4], 2.2);
                if (rev.alt && Math.abs(pi1 - 0.5) < 0.08 && dmu >= 4.65 * sigma && dmu < 5.60 * sigma) {
                    // Show emerging mode-locked local minimum in the pre-jump window (matching Panel 3)
                    drawDensity(x => normalPdf(x, rev.alt.mu, rev.alt.sigma), palette.reverse, null, [2, 4], 1.2);
                }
                drawDensity(x => normalPdf(x, rev.mu, rev.sigma), palette.reverse, palette.reverseFill, [], 2.4);
            } else {
                // Pointwise KL Integrand view:
                // Forward integrand: p(x) * log(p(x) / q_fwd(x))
                // Reverse integrand: q_rev(x) * log(q_rev(x) / p(x))
                const fwdIntegrand = x => {
                    const px = mixturePdf(x, mu1, mu2, sigma, pi1);
                    if (px < 1e-12) return 0;
                    return px * (mixtureLogPdf(x, mu1, mu2, sigma, pi1) - normalLogPdf(x, fwd.mu, fwd.sigma));
                };
                const revIntegrand = x => {
                    const qx = normalPdf(x, rev.mu, rev.sigma);
                    if (qx < 1e-12) return 0;
                    return qx * (normalLogPdf(x, rev.mu, rev.sigma) - mixtureLogPdf(x, mu1, mu2, sigma, pi1));
                };

                let yMin = -0.12, yMax = 0.28;
                for (let i = 0; i <= steps; i++) {
                    const x = xMin + (i / steps) * (xMax - xMin);
                    const vf = fwdIntegrand(x);
                    const vr = revIntegrand(x);
                    if (vf < yMin) yMin = vf;
                    if (vr < yMin) yMin = vr;
                    if (vf > yMax) yMax = vf;
                    if (vr > yMax) yMax = vr;
                }
                yMin *= 1.12;
                yMax *= 1.12;

                const yToPx = y => pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
                const y0 = yToPx(0);

                ctx.strokeStyle = palette.axis;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(pad.l, y0);
                ctx.lineTo(W - pad.r, y0);
                ctx.stroke();

                ctx.fillStyle = palette.muted;
                ctx.font = '11px Roboto, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('0.0', pad.l - 7, y0 + 4);
                ctx.textAlign = 'center';
                [-2, 0, 2, 4, 6, 8, 10, 12].forEach(xv => {
                    ctx.fillText(String(xv), xToPx(xv), H - 10);
                });

                const drawIntegrand = (fn, stroke, fill, dash) => {
                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const x = xMin + (i / steps) * (xMax - xMin);
                        const px = xToPx(x);
                        const py = yToPx(fn(x));
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.save();
                    ctx.lineTo(xToPx(xMax), y0);
                    ctx.lineTo(xToPx(xMin), y0);
                    ctx.closePath();
                    ctx.fillStyle = fill;
                    ctx.fill();
                    ctx.restore();

                    ctx.beginPath();
                    for (let i = 0; i <= steps; i++) {
                        const x = xMin + (i / steps) * (xMax - xMin);
                        const px = xToPx(x);
                        const py = yToPx(fn(x));
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.strokeStyle = stroke;
                    ctx.lineWidth = 2.2;
                    ctx.setLineDash(dash || []);
                    ctx.stroke();
                    ctx.setLineDash([]);
                };

                drawIntegrand(fwdIntegrand, palette.forward, palette.forwardFill, [6, 4]);
                drawIntegrand(revIntegrand, palette.reverse, palette.reverseFill, []);
            }
        }

        [dmuSlider, piSlider, sigmaSlider].forEach(el => {
            el.addEventListener('input', () => {
                presetButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
                renderPlayground();
            });
        });

        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                currentView = btn.dataset.klView;
                viewButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
                renderPlayground();
            });
        });

        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const [dmu, pi, sig] = btn.dataset.klPreset.split(',').map(Number);
                dmuSlider.value = String(dmu);
                piSlider.value = String(pi);
                sigmaSlider.value = String(sig);
                presetButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
                renderPlayground();
            });
        });

        return renderPlayground;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const renderPlayground = initPlayground();
        const redrawAll = () => {
            renderStrip();
            if (renderPlayground) renderPlayground();
        };
        redrawAll();

        window.addEventListener('resize', redrawAll);
        const observer = new MutationObserver(redrawAll);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    });
})();
