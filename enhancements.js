/**
 * Dr. Joe SAT Platform — Enhancements Module
 * Adds: Scratchpad, Audit Logging, Email Verification, In-App Notifications
 * Loaded after renderer.js
 */

// ============================================================
// SECTION 1: SCRATCHPAD (Floating Notepad during Exam)
// ============================================================

(function initScratchpad() {
    const SCRATCH_KEY = 'dsat_scratchpad_text';

    function createScratchpadOverlay() {
        if (document.getElementById('scratchpad-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'scratchpad-overlay';
        overlay.innerHTML = `
            <div id="scratchpad-panel" style="
                position:fixed; bottom:80px; right:20px; width:320px; height:280px;
                background:#1e293b; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.5);
                display:flex; flex-direction:column; z-index:9000;
                border:1px solid rgba(99,102,241,0.4);
                resize:both; overflow:hidden;
            ">
                <div id="scratchpad-header" style="
                    padding:8px 12px; background:rgba(99,102,241,0.2);
                    border-radius:12px 12px 0 0; cursor:move;
                    display:flex; align-items:center; justify-content:space-between;
                    border-bottom:1px solid rgba(99,102,241,0.3);
                ">
                    <span style="color:#a5b4fc; font-size:12px; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Scratch Pad
                    </span>
                    <div style="display:flex; gap:6px;">
                        <button onclick="window.clearScratchpad()" title="Clear" style="
                            background:none; border:none; cursor:pointer; color:#94a3b8; padding:2px;
                            font-size:10px; border-radius:4px;
                        " onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">Clear</button>
                        <button onclick="window.toggleScratchpad(false)" style="
                            background:none; border:none; cursor:pointer; color:#94a3b8; font-size:16px; padding:0 2px;
                        " onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#94a3b8'">✕</button>
                    </div>
                </div>
                <textarea id="scratchpad-text" placeholder="Write notes, work out problems, jot formulas…" style="
                    flex:1; background:transparent; border:none; outline:none; resize:none;
                    color:#e2e8f0; font-size:13px; line-height:1.6; padding:10px 12px;
                    font-family: 'Courier New', monospace;
                "></textarea>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.style.display = 'none';

        // Restore saved text
        const saved = localStorage.getItem(SCRATCH_KEY) || '';
        document.getElementById('scratchpad-text').value = saved;

        // Auto-save on input
        document.getElementById('scratchpad-text').addEventListener('input', function() {
            localStorage.setItem(SCRATCH_KEY, this.value);
        });

        // Make it draggable
        makeDraggable(document.getElementById('scratchpad-panel'), document.getElementById('scratchpad-header'));
    }

    function makeDraggable(el, handle) {
        let startX, startY, startLeft, startTop, dragging = false;

        handle.addEventListener('mousedown', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            dragging = true;
            const rect = el.getBoundingClientRect();
            startX = e.clientX; startY = e.clientY;
            startLeft = rect.left; startTop = rect.top;
            el.style.right = 'auto'; el.style.bottom = 'auto';
            el.style.left = rect.left + 'px'; el.style.top = rect.top + 'px';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            const maxX = window.innerWidth - el.offsetWidth;
            const maxY = window.innerHeight - el.offsetHeight;
            el.style.left = Math.max(0, Math.min(startLeft + dx, maxX)) + 'px';
            el.style.top = Math.max(0, Math.min(startTop + dy, maxY)) + 'px';
        });

        document.addEventListener('mouseup', function() { dragging = false; });
    }

    window.toggleScratchpad = function(forceOpen) {
        createScratchpadOverlay();
        const overlay = document.getElementById('scratchpad-overlay');
        const btn = document.getElementById('scratchpad-btn');
        const isOpen = overlay.style.display !== 'none';
        const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;
        overlay.style.display = shouldOpen ? 'block' : 'none';
        if (btn) {
            btn.style.background = shouldOpen ? '#4f46e5' : '';
        }
        if (shouldOpen) {
            setTimeout(() => { const t = document.getElementById('scratchpad-text'); if (t) t.focus(); }, 50);
        }
    };

    window.clearScratchpad = function() {
        if (confirm('Clear all scratch pad notes?')) {
            const t = document.getElementById('scratchpad-text');
            if (t) t.value = '';
            localStorage.removeItem(SCRATCH_KEY);
        }
    };

    // Inject scratchpad button into exam toolbar after calc button
    function injectScratchpadButton() {
        const calcBtn = document.getElementById('calc-button');
        if (calcBtn && !document.getElementById('scratchpad-btn')) {
            const btn = document.createElement('button');
            btn.id = 'scratchpad-btn';
            btn.title = 'Scratch Pad';
            btn.onclick = function() { window.toggleScratchpad(); };
            btn.style.cssText = `
                background:#374151; color:#e2e8f0; border:none; border-radius:8px;
                padding:0 12px; height:36px; font-size:12px; font-weight:600;
                cursor:pointer; display:flex; align-items:center; gap:5px;
                transition:background 0.15s;
            `;
            btn.onmouseover = function() { if (this.style.background !== '#4f46e5') this.style.background = '#4b5563'; };
            btn.onmouseout = function() { if (this.style.background !== '#4f46e5') this.style.background = '#374151'; };
            btn.innerHTML = `
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Notes
            `;
            calcBtn.parentNode.insertBefore(btn, calcBtn.nextSibling);
        }
    }

    // Watch for exam stage changes to inject button
    const _origRender = window.renderQuestion || null;
    const scratchObserver = new MutationObserver(function() {
        if (document.getElementById('calc-button') && !document.getElementById('scratchpad-btn')) {
            injectScratchpadButton();
        }
    });
    scratchObserver.observe(document.body, { childList: true, subtree: true });
})();


// ============================================================
// SECTION 2: AUDIT LOGGING (writes to Firestore audit_logs)
// ============================================================

window.logAuditEvent = async function(action, details) {
    try {
        // Access Firebase via the already-imported module in renderer.js
        if (!window._db || !window._userId) return;
        // Use dynamic import fallback
        const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        await addDoc(collection(window._db, 'audit_logs'), {
            timestamp: new Date(),
            action,
            actor: window._userId,
            actorName: window.state?.studentName || 'unknown',
            actorRole: window.state?.role || 'unknown',
            details: typeof details === 'object' ? JSON.stringify(details) : String(details),
            sessionId: window._sessionId || 'n/a'
        });
    } catch (e) { /* silent — never block the UI for audit logging */ }
};

// Generate a session ID for this browser session
window._sessionId = (Date.now().toString(36) + Math.random().toString(36).substr(2, 8)).toUpperCase();

// Patch logSystemEvent to also write to audit_logs for staff actions
const _staffActions = ['Create User', 'Delete User', 'Edit User', 'Assign Test', 'Bulk Import',
    'Save Question', 'Delete Question', 'Create Test', 'Save Quiz'];

(function patchSystemLog() {
    const _origLog = window.logSystemEvent;
    if (_origLog) {
        window.logSystemEvent = async function(action, details, level) {
            if (_origLog) await _origLog(action, details, level);
            if (_staffActions.some(a => action && action.startsWith(a))) {
                window.logAuditEvent(action, details);
            }
        };
    }
})();


// ============================================================
// SECTION 3: EMAIL VERIFICATION BANNER
// ============================================================

window.showEmailVerificationBanner = function() {
    if (document.getElementById('email-verify-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'email-verify-banner';
    banner.style.cssText = `
        position:fixed; top:0; left:0; right:0; z-index:99999;
        background:linear-gradient(90deg,#d97706,#f59e0b);
        color:#fff; padding:10px 16px;
        display:flex; align-items:center; justify-content:space-between;
        font-size:13px; font-weight:500; box-shadow:0 2px 8px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
        <span>⚠️ Your email is not verified. Please verify to unlock all features.</span>
        <div style="display:flex;gap:8px;align-items:center;">
            <button id="resend-verify-btn" onclick="window.sendVerificationEmail()" style="
                background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4);
                color:#fff; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;
            ">Resend Email</button>
            <button onclick="document.getElementById('email-verify-banner').remove()" style="
                background:none; border:none; color:#fff; cursor:pointer; font-size:18px; padding:0 4px;
            ">✕</button>
        </div>
    `;
    document.body.appendChild(banner);
};

window.sendVerificationEmail = async function() {
    const btn = document.getElementById('resend-verify-btn');
    try {
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        const { sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
        const auth = window._auth;
        if (auth && auth.currentUser && !auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser);
            if (window.showSuccess) window.showSuccess('Verification email sent! Check your inbox.');
            if (btn) { btn.textContent = 'Sent ✓'; }
            setTimeout(() => { if (btn) { btn.disabled = false; btn.textContent = 'Resend Email'; } }, 30000);
        } else {
            if (window.showInfo) window.showInfo('Email already verified.');
            const banner = document.getElementById('email-verify-banner');
            if (banner) banner.remove();
        }
    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Resend Email'; }
        if (window.showError) window.showError('Failed to send verification email: ' + e.message);
    }
};

// Hook into auth state changes to show banner if needed
(function checkEmailVerification() {
    const interval = setInterval(function() {
        const auth = window._auth;
        if (!auth) return;
        clearInterval(interval);
        auth.onAuthStateChanged(function(user) {
            if (user && !user.emailVerified) {
                // Only show for students (not blocking, just informational banner)
                setTimeout(function() {
                    if (window.state && window.state.role === 'student') {
                        window.showEmailVerificationBanner();
                    }
                }, 2000);
            }
        });
    }, 1000);
})();


// ============================================================
// SECTION 4: IN-APP NOTIFICATION BELL
// ============================================================

window.DrJoeNotifications = {
    _loaded: false,
    _count: 0,
    _items: [],

    async load() {
        if (!window._db || !window._userId) return;
        try {
            const { collection, query, where, orderBy, limit, getDocs, updateDoc, doc }
                = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            const q = query(
                collection(window._db, 'notifications'),
                where('recipientId', '==', window._userId),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snap = await getDocs(q);
            this._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            this._count = this._items.filter(n => !n.read).length;
            this._loaded = true;
            this._updateBell();
        } catch (e) { /* silent if collection doesn't exist yet */ }
    },

    _updateBell() {
        const badge = document.getElementById('notif-badge');
        const bell = document.getElementById('global-notif-btn');
        if (!badge || !bell) return;
        if (this._count > 0) {
            badge.textContent = this._count > 99 ? '99+' : this._count;
            badge.style.display = 'flex';
            bell.classList.add('text-amber-500');
            bell.classList.remove('text-gray-600', 'dark:text-gray-400');
        } else {
            badge.style.display = 'none';
            bell.classList.remove('text-amber-500');
            bell.classList.add('text-gray-600', 'dark:text-gray-400');
        }
    },

    async markAllRead() {
        if (!window._db || !window._userId) return;
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            const unread = this._items.filter(n => !n.read);
            for (const n of unread) {
                await updateDoc(doc(window._db, 'notifications', n.id), { read: true });
                n.read = true;
            }
            this._count = 0;
            this._updateBell();
            document.querySelectorAll('.notif-unread-dot').forEach(d => d.remove());
        } catch (e) { /* silent */ }
    },

    open() {
        this.load().then(() => this._showPanel());
    },

    _showPanel() {
        let panel = document.getElementById('notif-panel');
        const isDark = document.documentElement.classList.contains('dark');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notif-panel';
            panel.style.cssText = `
                position:fixed; top:52px; right:12px; width:320px; max-height:400px;
                background:${isDark ? '#1e293b' : '#ffffff'};
                border:1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#e5e7eb'};
                border-radius:12px;
                box-shadow:0 12px 40px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'};
                z-index:50000; display:flex; flex-direction:column; overflow:hidden;
            `;
            document.body.appendChild(panel);
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && e.target.id !== 'global-notif-btn') {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            }, true);
        }

        const items = this._items;
        const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        const textColor = isDark ? '#e2e8f0' : '#1f2937';
        const mutedColor = isDark ? '#64748b' : '#6b7280';
        const unreadBg = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)';
        const listHTML = items.length === 0
            ? `<div style="padding:24px;text-align:center;${mutedColor};font-size:13px;">No notifications yet</div>`
            : items.map(n => `
                <div style="padding:10px 14px;border-bottom:1px solid ${borderColor};display:flex;gap:10px;align-items:flex-start;${!n.read ? 'background:' + unreadBg + ';' : ''}">
                    ${!n.read ? '<span class="notif-unread-dot" style="width:6px;height:6px;border-radius:50%;background:#6366f1;flex-shrink:0;margin-top:5px;"></span>' : '<span style="width:6px;flex-shrink:0;"></span>'}
                    <div style="flex:1;">
                        <div style="color:${textColor};font-size:12px;font-weight:${n.read ? '400' : '600'};line-height:1.4;">${n.message || n.title || 'Notification'}</div>
                        <div style="color:${mutedColor};font-size:11px;margin-top:3px;">${n.timestamp ? new Date(n.timestamp.seconds ? n.timestamp.seconds * 1000 : n.timestamp).toLocaleString() : ''}</div>
                    </div>
                </div>`).join('');

        const headerBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        const headerColor = isDark ? '#a5b4fc' : '#4f46e5';
        panel.innerHTML = `
            <div style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${headerBorder};">
                <span style="color:${headerColor};font-weight:600;font-size:13px;">🔔 Notifications</span>
                <button onclick="window.DrJoeNotifications.markAllRead()" style="background:none;border:none;color:#6366f1;font-size:11px;cursor:pointer;font-weight:600;">Mark all read</button>
            </div>
            <div style="overflow-y:auto;flex:1;background:${isDark ? '#1e293b' : '#ffffff'};color:${textColor};">${listHTML}</div>
        `;
        this._updateBell();
    }
};

// Notification bell is defined in the HTML header (global-notif-btn)


// ============================================================
// SECTION 5: EXAM TIMER WARNING
// ============================================================

(function enhanceTimerWarning() {
    const _origTick = window.tickTimer;
    window._timerWarningShown = false;

    // Patch: add pulse animation at 5 min remaining
    const timerObserver = new MutationObserver(function() {
        const timerEl = document.getElementById('timer-display') || document.getElementById('exam-timer');
        if (!timerEl) return;
        const txt = timerEl.textContent || '';
        const match = txt.match(/(\d+):(\d+)/);
        if (!match) return;
        const mins = parseInt(match[1], 10), secs = parseInt(match[2], 10);
        const total = mins * 60 + secs;
        if (total <= 300 && total > 0) {
            timerEl.style.color = total <= 60 ? '#ef4444' : '#f59e0b';
            if (!window._timerWarningShown && total <= 300) {
                window._timerWarningShown = true;
                if (window.showToast) window.showToast('⏰ 5 minutes remaining!', 'warning');
            }
            if (total <= 60 && !window._timer1minShown) {
                window._timer1minShown = true;
                if (window.showToast) window.showToast('🚨 1 minute left!', 'error');
            }
        } else {
            timerEl.style.color = '';
            window._timerWarningShown = false;
            window._timer1minShown = false;
        }
    });
    timerObserver.observe(document.body, { subtree: true, characterData: true, childList: true });
})();


// ============================================================
// SECTION 6: KEYBOARD SHORTCUTS HELP PANEL
// ============================================================

window.showKeyboardShortcuts = function() {
    const shortcuts = [
        ['←  /  →', 'Previous / Next question'],
        ['Alt + F', 'Flag / Unflag current question'],
        ['Alt + C', 'Open / Close calculator'],
        ['Alt + R', 'Open reference sheet'],
        ['Alt + N', 'Open scratch pad'],
        ['Alt + M', 'Open question map'],
        ['1, 2, 3, 4', 'Select answer choice A/B/C/D'],
        ['Escape', 'Close any open overlay'],
    ];
    const html = shortcuts.map(([k, d]) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <kbd style="background:rgba(99,102,241,0.2);color:#a5b4fc;border:1px solid rgba(99,102,241,0.4);
                border-radius:5px;padding:2px 8px;font-size:12px;font-family:monospace;">${k}</kbd>
            <span style="color:#94a3b8;font-size:12px;margin-left:16px;">${d}</span>
        </div>`).join('');

    const modal = document.createElement('div');
    modal.style.cssText = `
        position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);
        display:flex;align-items:center;justify-content:center;
    `;
    modal.innerHTML = `
        <div style="background:#1e293b;border:1px solid rgba(99,102,241,0.3);border-radius:16px;
            padding:24px;width:380px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <span style="color:#a5b4fc;font-weight:700;font-size:15px;">⌨️ Keyboard Shortcuts</span>
                <button onclick="this.closest('[style*=inset]').remove()"
                    style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>
            </div>
            ${html}
            <p style="color:#475569;font-size:11px;margin-top:14px;text-align:center;">
                Press <kbd style="background:rgba(99,102,241,0.2);color:#a5b4fc;border:1px solid rgba(99,102,241,0.4);border-radius:4px;padding:1px 6px;font-size:11px;">Alt+H</kbd> anytime to see this
            </p>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};

// Alt+N → scratchpad, Alt+H → help
document.addEventListener('keydown', function(e) {
    if (!e.altKey) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); window.toggleScratchpad && window.toggleScratchpad(); }
    if (e.key === 'h' || e.key === 'H') { e.preventDefault(); window.showKeyboardShortcuts && window.showKeyboardShortcuts(); }
});


// ============================================================
// SECTION 7: EXPOSE DB + AUTH FOR AUDIT / NOTIFICATIONS
// ============================================================

// Capture db/auth refs from renderer.js
setTimeout(function() {
    if (!window._db && window.db) window._db = window.db;
    if (!window._auth && window.auth) window._auth = window.auth;
    if (!window._userId) {
        Object.defineProperty(window, '_userId', {
            get: function() { return this.__userId; },
            set: function(v) {
                this.__userId = v;
                if (v) setTimeout(function() { if (window.DrJoeNotifications) window.DrJoeNotifications.load(); }, 1500);
            },
            configurable: true
        });
    }
}, 1000);

console.log('[Dr. Joe Enhancements] Module loaded ✓ — Scratchpad | Audit | Notifications | Timer | Shortcuts');
