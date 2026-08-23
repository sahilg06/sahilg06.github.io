(function() {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', savedTheme || 'light');

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('theme-toggle');

        const syncToggle = () => {
            if (!toggle) return;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            toggle.textContent = isDark ? '☀' : '☾';
            toggle.setAttribute('aria-pressed', String(isDark));
            toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
        };

        syncToggle();
        toggle?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            syncToggle();
        });

        const activeLink = document.querySelector('.navblock_text a.active');
        activeLink?.setAttribute('aria-current', 'page');

        const copyButtons = document.querySelectorAll('.email-copy-btn');
        if (!copyButtons.length) return;

        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);

        const showToast = email => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = `Copied ${email}`;
            toastContainer.replaceChildren(toast);
            setTimeout(() => toast.remove(), 2200);
        };

        const fallbackCopy = (text, callback) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                callback();
            } catch (error) {
                console.error('Copy failed', error);
            }
            textarea.remove();
        };

        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const email = button.dataset.email;
                const onSuccess = () => showToast(email);
                if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(email).then(onSuccess).catch(() => fallbackCopy(email, onSuccess));
                } else {
                    fallbackCopy(email, onSuccess);
                }
            });
        });
    });
})();
