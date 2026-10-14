/*
 * PhD application tracker.
 * Renders the Google Sheet as a native, theme-aware table. The HTML ships with a
 * saved copy of the rows; on load we fetch the live sheet (gviz CSV endpoint, which
 * sends CORS headers) and re-render. If the fetch fails, the saved copy stays.
 */
(function() {
    const SHEET_ID = '1llQBIyTo3iMFS36X_fprqkX7S0FsempB9PFjSnvvFr8';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const DAY_MS = 86400000;
    const SOON_DAYS = 21; // highlight deadlines this close
    // The sheet's dates are for a single application cycle and won't be updated, so they
    // are pinned to it rather than treated as recurring. Aug–Dec dates fall in CYCLE_YEAR,
    // Jan–Jul dates in the following year. Once every deadline has passed, the page
    // switches to an archive view (no countdowns).
    const CYCLE_YEAR = 2026;
    const CYCLE_START_MONTH = 7; // August

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

    // Map columns by header text so reordering or adding columns in the sheet doesn't break the page.
    function rowsFromCSV(text) {
        const [header, ...body] = parseCSV(text);
        if (!header) return [];
        const find = (re, fallback) => {
            const idx = header.findIndex(h => re.test(h));
            return idx === -1 ? fallback : idx;
        };
        const col = {
            inst: find(/universit|institution/i, 0),
            prog: find(/program/i, 1),
            deadline: find(/application deadline|^deadline/i, 2),
            faculty: find(/faculty/i, 3),
            lor: find(/recommendation|letter|lor/i, 4)
        };
        return body.map(r => ({
            inst: (r[col.inst] || '').trim(),
            prog: (r[col.prog] || '').trim(),
            deadline: (r[col.deadline] || '').trim(),
            faculty: (r[col.faculty] || '').split(';').map(s => s.trim()).filter(Boolean),
            lor: (r[col.lor] || '').trim()
        })).filter(r => r.inst || r.prog);
    }

    function rowsFromTable(tbody) {
        return [...tbody.querySelectorAll('tr')].map(tr => ({
            inst: tr.querySelector('.tracker-inst')?.textContent.trim() || '',
            prog: tr.querySelector('.tracker-program')?.textContent.trim() || '',
            deadline: tr.querySelector('.tracker-date')?.textContent.trim() || '',
            faculty: [...tr.querySelectorAll('.tracker-faculty li')].map(li => li.textContent.trim()),
            lor: tr.querySelector('.tracker-lor')?.textContent.trim() || ''
        }));
    }

    // "31 Oct" / "Oct 31" -> { month, day }. Returns null for anything else.
    function parseDayMonth(text) {
        let m = /(\d{1,2})\s*([A-Za-z]{3})/.exec(text);
        if (m) return toMD(m[2], m[1]);
        m = /([A-Za-z]{3})[a-z]*\.?\s*(\d{1,2})/.exec(text);
        return m ? toMD(m[1], m[2]) : null;
    }

    function toMD(mon, day) {
        const month = MONTHS.indexOf(mon.toLowerCase());
        return month === -1 ? null : { month, day: Number(day) };
    }

    // Pin a "31 Oct"-style deadline to its actual date in the tracked cycle.
    function cycleDate(md) {
        if (!md) return null;
        const year = md.month >= CYCLE_START_MONTH ? CYCLE_YEAR : CYCLE_YEAR + 1;
        return new Date(year, md.month, md.day);
    }

    function deadlineStatus(date, today) {
        if (!date) return null;
        const days = Math.round((date - today) / DAY_MS);
        if (days < 0) return { label: 'Passed', cls: 'is-passed', days: null };
        if (days === 0) return { label: 'Today', cls: 'is-soon', days: 0 };
        return {
            label: days === 1 ? 'Tomorrow' : `in ${days} days`,
            cls: days <= SOON_DAYS ? 'is-soon' : '',
            days
        };
    }

    const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // "Oct–Dec 2026", or "Nov 2026 – Jan 2027" when the cycle crosses a year.
    function rangeLabel(dates) {
        const first = dates[0], last = dates[dates.length - 1];
        const m = d => SHORT_MONTHS[d.getMonth()];
        if (first.getFullYear() !== last.getFullYear()) {
            return `${m(first)} ${first.getFullYear()} – ${m(last)} ${last.getFullYear()}`;
        }
        return first.getMonth() === last.getMonth()
            ? `${m(first)} ${first.getFullYear()}`
            : `${m(first)}–${m(last)} ${last.getFullYear()}`;
    }

    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };

    // In archive mode (whole cycle over) rows render plainly: greying out every
    // row would just make the page look broken.
    function renderRow(r, today, archived) {
        const tr = document.createElement('tr');
        const status = archived ? null : deadlineStatus(cycleDate(parseDayMonth(r.deadline)), today);
        if (status?.cls === 'is-passed') tr.classList.add('is-passed');

        const dateTd = el('td');
        dateTd.dataset.label = 'Deadline';
        dateTd.append(el('span', 'tracker-date', r.deadline || '—'));
        if (status) dateTd.append(el('span', `tracker-countdown ${status.cls}`.trim(), status.label));

        const progTd = el('td');
        progTd.dataset.label = 'Program';
        progTd.append(el('strong', 'tracker-inst', r.inst), el('span', 'tracker-program', r.prog));

        const facTd = el('td');
        facTd.dataset.label = 'Faculty shortlist';
        const ul = el('ul', 'tracker-faculty');
        r.faculty.forEach(name => {
            const li = el('li');
            const a = el('a', null, name);
            a.href = `https://scholar.google.com/citations?view_op=search_authors&mauthors=${encodeURIComponent(name)}`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.title = `Search ${name} on Google Scholar`;
            li.append(a);
            ul.append(li);
        });
        facTd.append(ul);

        const lorTd = el('td');
        lorTd.dataset.label = 'Letters due';
        let lorCls = 'tracker-lor';
        if (/verify|check|\?/i.test(r.lor)) lorCls += ' is-flagged';
        else if (/not needed|n\/a|none/i.test(r.lor)) lorCls += ' is-muted';
        lorTd.append(el('span', lorCls, r.lor || '—'));

        tr.append(dateTd, progTd, facTd, lorTd);
        return tr;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('tracker-body');
        if (!tbody) return;
        const toolbar = document.querySelector('.tracker-toolbar');
        const filterInput = document.getElementById('tracker-filter');
        const sortSelect = document.getElementById('tracker-sort');
        const summary = document.getElementById('tracker-summary');
        const statusLine = document.getElementById('tracker-status');

        let rows = rowsFromTable(tbody);
        toolbar.hidden = false;

        function render() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const q = filterInput.value.trim().toLowerCase();

            // Cycle state is computed over all rows, not just the filtered ones.
            const dated = rows
                .map(r => ({ r, date: cycleDate(parseDayMonth(r.deadline)) }))
                .filter(x => x.date)
                .sort((a, b) => a.date - b.date);
            const archived = dated.length > 0 && dated.every(x => x.date < today);
            const upcoming = archived ? null : dated.find(x => x.date >= today);

            const visible = rows
                .filter(r => !q || [r.inst, r.prog, r.lor, ...r.faculty].join(' ').toLowerCase().includes(q))
                .map((r, i) => ({ r, i, date: cycleDate(parseDayMonth(r.deadline)) }))
                .sort((a, b) => sortSelect.value === 'name'
                    ? a.r.inst.localeCompare(b.r.inst)
                    : ((a.date ?? Infinity) - (b.date ?? Infinity)) || (a.i - b.i));

            tbody.replaceChildren(...visible.map(({ r }) => renderRow(r, today, archived)));

            if (!visible.length) {
                const tr = el('tr', 'tracker-empty');
                const td = el('td', null, `No programs match “${filterInput.value.trim()}”.`);
                td.colSpan = 4;
                tr.append(td);
                tbody.append(tr);
            }

            const count = q ? `${visible.length} of ${rows.length} programs` : `${rows.length} programs`;
            summary.classList.toggle('is-archived', archived);
            if (archived) {
                const range = rangeLabel(dated.map(x => x.date));
                summary.textContent = `${count} · All deadlines here (${range}) have passed, so the dates below are for reference only. Check each program’s page for current deadlines.`;
            } else if (upcoming) {
                const s = deadlineStatus(upcoming.date, today);
                const sameDay = dated.filter(x => +x.date === +upcoming.date).length;
                const who = (upcoming.r.inst || upcoming.r.prog) + (sameDay > 1 ? ` + ${sameDay - 1} more` : '');
                summary.textContent = `${count} · next deadline ${s.label.toLowerCase()} (${who})`;
            } else {
                summary.textContent = count;
            }
        }

        filterInput.addEventListener('input', render);
        sortSelect.addEventListener('change', render);
        render();

        fetch(CSV_URL, { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(text => {
                const live = rowsFromCSV(text);
                if (!live.length) throw new Error('Empty sheet');
                rows = live;
                render();
                const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                statusLine.textContent = `Live from Google Sheets · synced at ${time}.`;
                statusLine.classList.add('is-live');
            })
            .catch(err => {
                console.warn('Tracker: using saved copy', err);
                statusLine.textContent = 'Couldn’t reach Google Sheets, so this is the saved copy from October 2026.';
            });
    });
})();
