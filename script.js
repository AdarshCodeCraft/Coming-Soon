 // ── DB: localStorage ──────────────────────────────────────────
  const DB_KEY = 'waitlist_emails';
 
  function getEmails() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
    catch { return []; }
  }
 
  function saveEmails(list) {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  }
 
  function addEmail(email) {
    const list = getEmails();
    if (list.find(e => e.email.toLowerCase() === email.toLowerCase())) return false;
    list.unshift({ email, time: new Date().toISOString() });
    saveEmails(list);
    return true;
  }
 
  function deleteEmail(email) {
    const list = getEmails().filter(e => e.email !== email);
    saveEmails(list);
    renderList();
  }
 
  function clearAll() {
    if (!confirm('Clear all emails from the waitlist?')) return;
    saveEmails([]);
    renderList();
  }
 
  // ── RENDER ────────────────────────────────────────────────────
  function renderList() {
    const list = getEmails();
    const el = document.getElementById('emailList');
    const counter = document.getElementById('counter');
    const panelCount = document.getElementById('panelCount');
 
    counter.textContent = list.length;
    panelCount.textContent = list.length + (list.length === 1 ? ' subscriber' : ' subscribers');
 
    if (list.length === 0) {
      el.innerHTML = `<div class="empty-state"><span class="icon">📭</span>No emails yet.<br>Be the first to join!</div>`;
      return;
    }
 
    el.innerHTML = list.map((entry, i) => {
      const d = new Date(entry.time);
      const timeStr = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) + ' ' +
                      d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
      const masked = maskEmail(entry.email);
      return `
        <div class="email-item">
          <span class="email-num">${String(list.length - i).padStart(2,'0')}</span>
          <span class="email-addr" title="${entry.email}">${masked}</span>
          <span class="email-time">${timeStr}</span>
          <button class="email-delete" title="Remove" onclick="deleteEmail('${entry.email}')">×</button>
        </div>`;
    }).join('');
  }
 
  function maskEmail(email) {
    const [user, domain] = email.split('@');
    if (user.length <= 2) return email;
    return user[0] + '•'.repeat(Math.min(user.length - 2, 4)) + user[user.length-1] + '@' + domain;
  }
 
  // ── JOIN ──────────────────────────────────────────────────────
  function showMsg(id, text, dur = 3500) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.classList.add('show');
    setTimeout(() => { el.classList.remove('show'); }, dur);
  }
 
  function handleJoin() {
    const input = document.getElementById('emailInput');
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    if (!emailRegex.test(val)) {
      input.style.borderColor = 'var(--danger)';
      showMsg('errorMsg', '✕ Please enter a valid email address.');
      setTimeout(() => input.style.borderColor = '', 1200);
      return;
    }
 
    const added = addEmail(val);
    if (!added) {
      showMsg('errorMsg', '✕ This email is already on the list.');
      return;
    }
 
    input.value = '';
    input.style.borderColor = 'var(--accent)';
    setTimeout(() => input.style.borderColor = '', 1200);
    showMsg('successMsg', '✓ You\'re on the list. See you soon!');
    renderList();
  }
 
  document.getElementById('emailInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleJoin();
  });
 
  // ── EXPORT ────────────────────────────────────────────────────
  function exportCSV() {
    const list = getEmails();
    if (!list.length) return alert('No emails to export yet.');
    const csv = 'Email,Joined\n' + list.map(e => `${e.email},${new Date(e.time).toLocaleString()}`).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'waitlist.csv';
    a.click();
  }
 
  // ── TICKER ────────────────────────────────────────────────────
  const items = [
    'Fullstack Developer', 'React · Node · TypeScript',
    'UI / UX Craft', 'Open to Collaborations',
 'Built with Love in Mumbai',
 'Consumer Apps · Micro-SaaS',
  ];
  const ticker = document.getElementById('ticker');
  const doubled = [...items, ...items];
  ticker.innerHTML = doubled.map(t =>
    `<span class="ticker-item"><span class="dot">◆</span>${t}</span>`
  ).join('');
 
  // ── INIT ──────────────────────────────────────────────────────
  renderList();
 
  // Poll for changes (e.g. if opened in multiple tabs)
  window.addEventListener('storage', e => {
    if (e.key === DB_KEY) renderList();
  });