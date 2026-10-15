/*
 * Reading log.
 * Entries live in a Google Sheet (one row per item). The page fetches the sheet as CSV
 * on load, so adding a row in the sheet updates the site with no commit or push.
 *
 * Expected columns (matched by header name, order doesn't matter):
 *   Month | Title | Link | Type | Venue / Year | Note | Tags | Must read
 */
(function() {
    // Paste the ID from the sheet URL: docs.google.com/spreadsheets/d/<THIS PART>/edit
    // The sheet must be shared as "Anyone with the link can view".
    const SHEET_ID = '1IuOoItrK9u-fzJJAYpSkdQfOmVhJi9YDOfYBhAtn_sg';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

    const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
        'august', 'september', 'october', 'november', 'december'];
    const TYPE_LABELS = { paper: 'Paper', book: 'Book', article: 'Article', blog: 'Blog', video: 'Video', talk: 'Talk', thread: 'Thread' };

    // RFC 4180-ish CSV parser (quoted fields, escaped quotes, CRLF).
    function parseCSV(text) {
        const rows = [];
        let row = [], field = '', inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
                else if (c === '"') inQuotes = false;
                else field += c;
            } else if (c === '"') inQuotes = true;
            else if (c === ',') { row.push(field); field = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && text[i + 1] === '\n') i++;
                row.push(field); rows.push(row); row = []; field = '';
            } else field += c;
        }
        if (field || row.length) { row.push(field); rows.push(row); }
        return rows.filter(r => r.some(cell => cell.trim()));
    }

    // Accepts "2026-10", "2026-10-01", "Oct 2026", "October 2026", "10/2026", "10/1/2026", "1/10/2026".
    // Returns a sortable key (year * 12 + monthIndex) or null.
    function parseMonth(text) {
        const s = text.trim();
        let m = /^(\d{4})-(\d{1,2})/.exec(s);
        if (m) return key(+m[1], +m[2] - 1);
        m = /^([A-Za-z]{3,})\.?\s+(\d{4})$/.exec(s);
        if (m) {
            const idx = MONTHS.findIndex(name => name.startsWith(m[1].toLowerCase().slice(0, 3)));
            return idx === -1 ? null : key(+m[2], idx);
        }
        m = /^(\d{1,2})\/(\d{4})$/.exec(s);
        if (m) return key(+m[2], +m[1] - 1);
        m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
        if (m) {
            // A month typed into Sheets becomes the 1st of that month, in either
            // M/D or D/M order depending on locale. The part that isn't "1" is the month.
            const a = +m[1], b = +m[2];
            const month = a === 1 && b !== 1 ? b : a > 12 ? b : a;
            return key(+m[3], month - 1);
        }
        return null;
    }

    const key = (year, monthIdx) => (monthIdx >= 0 && monthIdx < 12 ? year * 12 + monthIdx : null);
    const monthLabel = k => {
        const name = MONTHS[k % 12];
        return `${name[0].toUpperCase()}${name.slice(1)} ${Math.floor(k / 12)}`;
    };

    function entriesFromCSV(text) {
        const [header, ...body] = parseCSV(text);
        if (!header) return [];
        const find = re => header.findIndex(h => re.test(h.trim()));
        const col = {
            month: find(/^month|^date/i),
            title: find(/^title/i),
            link: find(/^link|^url/i),
            type: find(/^type/i),
            venue: find(/venue|year/i),
            note: find(/note|takeaway|summary/i),
            tags: find(/^tags?/i),
            must: find(/must|star|favou?rite|rating/i)
        };
        const get = (r, i) => (i === -1 ? '' : (r[i] || '').trim());

        return body.map((r, row) => {
            const typeRaw = get(r, col.type).toLowerCase();
            const link = get(r, col.link);
            return {
                row,
                month: parseMonth(get(r, col.month)),
                title: get(r, col.title),
                link: /^https?:\/\//i.test(link) ? link : '',
                type: typeRaw,
                typeLabel: TYPE_LABELS[typeRaw] || (typeRaw ? typeRaw[0].toUpperCase() + typeRaw.slice(1) : ''),
                venue: get(r, col.venue),
                note: get(r, col.note),
                tags: get(r, col.tags).split(/[,;]/).map(t => t.trim()).filter(Boolean),
                must: /^(yes|y|true|1|x|★+|⭐+|✓|✔)$/i.test(get(r, col.must))
            };
        }).filter(e => e.title);
    }

    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };

    document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('reading-log');
        if (!root) return;
        const toolbar = document.getElementById('reading-toolbar');
        const search = document.getElementById('reading-search');
        const typeChips = document.getElementById('reading-types');
        const mustToggle = document.getElementById('reading-must');
        const summary = document.getElementById('reading-summary');
        const statusLine = document.getElementById('reading-status');

        let entries = [];
        const state = { type: '', tag: '', must: false };

        function renderTypeChips() {
            const counts = {};
            entries.forEach(e => { if (e.type) counts[e.type] = (counts[e.type] || 0) + 1; });
            const types = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
            const chip = (value, label, count) => {
                const b = el('button', 'reading-chip', label);
                b.type = 'button';
                if (count != null) b.append(el('span', 'reading-chip-count', String(count)));
                b.setAttribute('aria-pressed', String(state.type === value));
                b.addEventListener('click', () => { state.type = value; renderTypeChips(); render(); });
                return b;
            };
            typeChips.replaceChildren(
                chip('', 'All', entries.length),
                ...types.map(t => chip(t, entries.find(e => e.type === t).typeLabel, counts[t]))
            );
        }

        function renderEntry(e) {
            const li = el('li', 'reading-entry');
            li.append(el('span', 'reading-type', e.typeLabel || '—'));

            const body = el('div', 'reading-body');
            const titleLine = el('div', 'reading-title-line');
            let title;
            if (e.link) {
                title = el('a', 'reading-title', e.title);
                title.href = e.link;
                title.target = '_blank';
                title.rel = 'noopener noreferrer';
            } else {
                title = el('span', 'reading-title', e.title);
            }
            titleLine.append(title);
            if (e.must) titleLine.append(el('span', 'reading-must', '★ Must read'));
            body.append(titleLine);

            if (e.venue) body.append(el('div', 'reading-venue', e.venue));
            if (e.note) body.append(el('p', 'reading-note', e.note));
            if (e.tags.length) {
                const tags = el('div', 'reading-tags');
                e.tags.forEach(t => {
                    const b = el('button', 'reading-tag', `#${t}`);
                    b.type = 'button';
                    b.setAttribute('aria-pressed', String(state.tag.toLowerCase() === t.toLowerCase()));
                    b.title = `Show everything tagged ${t}`;
                    b.addEventListener('click', () => {
                        state.tag = state.tag.toLowerCase() === t.toLowerCase() ? '' : t;
                        render();
                    });
                    tags.append(b);
                });
                body.append(tags);
            }
            li.append(body);
            return li;
        }

        function render() {
            const q = search.value.trim().toLowerCase();
            const visible = entries.filter(e =>
                (!state.type || e.type === state.type) &&
                (!state.must || e.must) &&
                (!state.tag || e.tags.some(t => t.toLowerCase() === state.tag.toLowerCase())) &&
                (!q || [e.title, e.venue, e.note, e.typeLabel, ...e.tags].join(' ').toLowerCase().includes(q))
            );

            // Group by month, newest month first; within a month, newest row first.
            const groups = new Map();
            visible.forEach(e => {
                const k = e.month ?? -1;
                if (!groups.has(k)) groups.set(k, []);
                groups.get(k).push(e);
            });
            const keys = [...groups.keys()].sort((a, b) => b - a);

            const sections = keys.map(k => {
                const items = groups.get(k).sort((a, b) => b.row - a.row);
                const section = el('section', 'reading-month');
                const h = el('h2', 'reading-month-title', k === -1 ? 'Undated' : monthLabel(k));
                h.append(el('span', 'reading-month-count', `${items.length} ${items.length === 1 ? 'item' : 'items'}`));
                const ul = el('ul', 'reading-list');
                ul.append(...items.map(renderEntry));
                section.append(h, ul);
                return section;
            });

            if (!entries.length) {
                root.replaceChildren(el('p', 'reading-empty', 'Nothing logged yet. Check back soon.'));
            } else if (!visible.length) {
                root.replaceChildren(el('p', 'reading-empty', 'Nothing matches these filters.'));
            } else {
                root.replaceChildren(...sections);
            }

            const filters = [];
            if (state.tag) filters.push(`#${state.tag}`);
            if (state.must) filters.push('must reads');
            const papers = entries.filter(e => e.type === 'paper').length;
            const base = visible.length === entries.length
                ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'}${papers ? ` · ${papers} papers` : ''}`
                : `${visible.length} of ${entries.length} items`;
            summary.replaceChildren(document.createTextNode(base));
            if (state.tag) {
                const clear = el('button', 'reading-clear', `#${state.tag} ✕`);
                clear.type = 'button';
                clear.title = 'Clear tag filter';
                clear.addEventListener('click', () => { state.tag = ''; render(); });
                summary.append(document.createTextNode(' · '), clear);
            }
        }

        search.addEventListener('input', render);
        mustToggle.addEventListener('change', () => { state.must = mustToggle.checked; render(); });

        if (!SHEET_ID) {
            root.replaceChildren(el('p', 'reading-empty', 'Nothing logged yet. Check back soon.'));
            statusLine.textContent = '';
            return;
        }

        fetch(CSV_URL, { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(text => {
                if (/^\s*<!doctype html|^\s*<html/i.test(text)) throw new Error('Sheet is not publicly viewable');
                entries = entriesFromCSV(text);
                toolbar.hidden = !entries.length;
                renderTypeChips();
                render();
                statusLine.textContent = entries.length ? 'Updated live from my reading log.' : '';
            })
            .catch(err => {
                console.warn('Reading log: failed to load', err);
                root.replaceChildren(el('p', 'reading-empty', 'Couldn’t load the reading list right now. Please try again later.'));
                statusLine.textContent = '';
            });
    });
})();
