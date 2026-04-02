/* ============================================================
   KANJI-DŌ — app.js
   Gère : navigation, filtres, liste, flashcards, QCM,
          orthographe, mémoire, score global
   ============================================================ */

// ── STATE ──────────────────────────────────────────────────
let currentLecon = 'all';
let currentView  = 'list';
let totalScore   = 0;

function getFiltered() {
  if (currentLecon === 'all') return [...KANJI_DATA];
  return KANJI_DATA.filter(k => k.lecon === Number(currentLecon));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addScore(pts) {
  totalScore += pts;
  document.getElementById('total-score').textContent = totalScore;
}

// ── NAVIGATION ─────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + currentView).classList.add('active');
    initView(currentView);
  });
});

document.querySelectorAll('.lecon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lecon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLecon = btn.dataset.lecon;
    initView(currentView);
  });
});

function initView(view) {
  if (view === 'list')        renderList();
  if (view === 'flashcards')  initFlashcards();
  if (view === 'qcm')         initQCM();
  if (view === 'orthographe') initOrth();
  if (view === 'memoire')     initMemoire();
}

// ── LISTE ──────────────────────────────────────────────────
function renderList(filter = '') {
  const grid = document.getElementById('kanji-grid');
  let data = getFiltered();
  if (filter) {
    const f = filter.toLowerCase();
    data = data.filter(k =>
      k.kanji.includes(f) ||
      k.meaning.toLowerCase().includes(f) ||
      k.on.some(r => r.toLowerCase().includes(f)) ||
      k.kun.some(r => r.includes(f))
    );
  }
  grid.innerHTML = data.map(k => `
    <div class="kanji-card" data-kanji="${k.kanji}">
      <span class="kc-lecon">L${k.lecon}</span>
      <div class="kc-char">${k.kanji}</div>
      <div class="kc-on">${k.on.join(' · ') || '—'}</div>
      <div class="kc-kun">${k.kun.join(' · ') || '—'}</div>
      <div class="kc-meaning">${k.meaning}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.kanji-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.kanji));
  });
}

document.getElementById('search-input').addEventListener('input', e => {
  renderList(e.target.value);
});

// ── MODAL ──────────────────────────────────────────────────
function openModal(char) {
  const k = KANJI_DATA.find(x => x.kanji === char);
  if (!k) return;
  document.getElementById('modal-kanji').textContent = k.kanji;
  document.getElementById('modal-on').textContent = k.on.join(', ') || '—';
  document.getElementById('modal-kun').textContent = k.kun.join(', ') || '—';
  document.getElementById('modal-meaning').textContent = k.meaning;
  document.getElementById('modal-lecon').textContent = 'Leçon ' + k.lecon;
  document.getElementById('kanji-modal').classList.remove('hidden');
}
document.querySelector('.modal-close').addEventListener('click', () => {
  document.getElementById('kanji-modal').classList.add('hidden');
});
document.querySelector('.modal-backdrop').addEventListener('click', () => {
  document.getElementById('kanji-modal').classList.add('hidden');
});

// ── FLASHCARDS ─────────────────────────────────────────────
let fcDeck = [], fcIndex = 0, fcFlipped = false;

function initFlashcards() {
  fcDeck = shuffle(getFiltered());
  fcIndex = 0;
  fcFlipped = false;
  document.getElementById('flashcard').classList.remove('flipped');
  document.getElementById('fc-actions').style.display = 'none';
  renderFC();
}

function renderFC() {
  const total = fcDeck.length;
  if (fcIndex >= total) {
    document.getElementById('fc-kanji').textContent = '✓';
    document.getElementById('fc-hint').textContent = 'Terminé !';
    document.getElementById('fc-actions').style.display = 'none';
    document.getElementById('fc-progress').style.width = '100%';
    document.getElementById('fc-counter').textContent = total + ' / ' + total;
    return;
  }
  const k = fcDeck[fcIndex];
  document.getElementById('fc-kanji').textContent = k.kanji;
  document.getElementById('fc-hint').textContent = 'Cliquez pour révéler';
  document.getElementById('fc-progress').style.width = (fcIndex / total * 100) + '%';
  document.getElementById('fc-counter').textContent = (fcIndex + 1) + ' / ' + total;

  // Back
  const onEl = document.getElementById('fc-on');
  const kunEl = document.getElementById('fc-kun');
  onEl.innerHTML = `<span class="label">On'yomi</span><span class="vals">${k.on.join(' · ') || '—'}</span>`;
  kunEl.innerHTML = `<span class="label">Kun'yomi</span><span class="vals">${k.kun.join(' · ') || '—'}</span>`;
  document.getElementById('fc-meaning').textContent = k.meaning;
  document.getElementById('fc-lecon').textContent = 'Leçon ' + k.lecon;
}

document.getElementById('flashcard').addEventListener('click', () => {
  if (fcIndex >= fcDeck.length) return;
  fcFlipped = !fcFlipped;
  document.getElementById('flashcard').classList.toggle('flipped', fcFlipped);
  document.getElementById('fc-actions').style.display = fcFlipped ? 'flex' : 'none';
});

document.getElementById('fc-right').addEventListener('click', () => {
  addScore(2);
  fcIndex++;
  fcFlipped = false;
  document.getElementById('flashcard').classList.remove('flipped');
  document.getElementById('fc-actions').style.display = 'none';
  renderFC();
});

document.getElementById('fc-wrong').addEventListener('click', () => {
  // Push card to end of deck to retry
  fcDeck.push(fcDeck[fcIndex]);
  fcDeck.splice(fcIndex, 1);
  // keep index, but it's now pointing to next card
  fcFlipped = false;
  document.getElementById('flashcard').classList.remove('flipped');
  document.getElementById('fc-actions').style.display = 'none';
  renderFC();
});

document.getElementById('fc-restart').addEventListener('click', initFlashcards);

// ── QCM ────────────────────────────────────────────────────
let qcmDeck = [], qcmIndex = 0, qcmScore = 0;
const QCM_TYPES = [
  { prompt: "Quelle est la lecture on'yomi ?", key: 'on' },
  { prompt: "Quelle est la lecture kun'yomi ?", key: 'kun' },
  { prompt: "Quel est le sens de ce kanji ?",   key: 'meaning' },
];

function initQCM() {
  qcmDeck = shuffle(getFiltered().filter(k => k.on.length > 0 || k.kun.length > 0));
  qcmIndex = 0;
  qcmScore = 0;
  document.getElementById('qcm-score').textContent = '0 pts';
  document.getElementById('qcm-next').classList.add('hidden');
  document.getElementById('qcm-feedback').classList.add('hidden');
  renderQCM();
}

function renderQCM() {
  const total = qcmDeck.length;
  if (qcmIndex >= total) {
    document.getElementById('qcm-kanji').textContent = '✓';
    document.getElementById('qcm-prompt').textContent = 'Terminé ! Score : ' + qcmScore + ' pts';
    document.getElementById('qcm-choices').innerHTML = '';
    document.getElementById('qcm-progress').style.width = '100%';
    document.getElementById('qcm-counter').textContent = total + ' / ' + total;
    return;
  }

  const k = qcmDeck[qcmIndex];
  // Pick a question type that has data
  const validTypes = QCM_TYPES.filter(t =>
    t.key === 'meaning' || (Array.isArray(k[t.key]) && k[t.key].length > 0)
  );
  const type = validTypes[Math.floor(Math.random() * validTypes.length)];

  document.getElementById('qcm-kanji').textContent = k.kanji;
  document.getElementById('qcm-prompt').textContent = type.prompt;
  document.getElementById('qcm-progress').style.width = (qcmIndex / total * 100) + '%';
  document.getElementById('qcm-counter').textContent = (qcmIndex + 1) + ' / ' + total;
  document.getElementById('qcm-feedback').classList.add('hidden');
  document.getElementById('qcm-next').classList.add('hidden');

  // Correct answer
  let correct;
  if (type.key === 'meaning') {
    correct = k.meaning;
  } else {
    correct = k[type.key][0];
  }

  // Wrong answers from pool
  const pool = KANJI_DATA.filter(x => x.kanji !== k.kanji);
  let wrongs = shuffle(pool).slice(0, 3).map(x => {
    if (type.key === 'meaning') return x.meaning;
    const arr = x[type.key];
    return arr && arr.length > 0 ? arr[0] : x.meaning;
  });
  // Remove duplicates
  wrongs = [...new Set(wrongs)].slice(0, 3);
  while (wrongs.length < 3) wrongs.push('—');

  const choices = shuffle([correct, ...wrongs]);

  const choicesEl = document.getElementById('qcm-choices');
  choicesEl.innerHTML = choices.map(c => `
    <button class="choice-btn" data-val="${c}">${c}</button>
  `).join('');

  choicesEl.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.val;
      const isCorrect = chosen === correct;
      choicesEl.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.val === correct) b.classList.add('correct');
        else if (b === btn && !isCorrect) b.classList.add('wrong');
      });

      const feedback = document.getElementById('qcm-feedback');
      if (isCorrect) {
        feedback.textContent = '✓ Correct !';
        feedback.className = 'qcm-feedback correct';
        qcmScore += 5;
        addScore(5);
        document.getElementById('qcm-score').textContent = qcmScore + ' pts';
      } else {
        feedback.textContent = '✗ Incorrect. Réponse : ' + correct;
        feedback.className = 'qcm-feedback wrong';
      }
      feedback.classList.remove('hidden');
      document.getElementById('qcm-next').classList.remove('hidden');
    });
  });
}

document.getElementById('qcm-next').addEventListener('click', () => {
  qcmIndex++;
  renderQCM();
});
document.getElementById('qcm-restart').addEventListener('click', initQCM);

// ── ORTHOGRAPHE ────────────────────────────────────────────
let orthDeck = [], orthIndex = 0, orthScore = 0;

function initOrth() {
  orthDeck = shuffle(getFiltered());
  orthIndex = 0;
  orthScore = 0;
  document.getElementById('orth-score').textContent = '0 pts';
  document.getElementById('orth-next').classList.add('hidden');
  document.getElementById('orth-feedback').classList.add('hidden');
  document.getElementById('orth-answer').classList.add('hidden');
  document.getElementById('orth-input').value = '';
  renderOrth();
}

function renderOrth() {
  const total = orthDeck.length;
  if (orthIndex >= total) {
    document.getElementById('orth-kanji').textContent = '✓';
    document.getElementById('orth-prompt').textContent = 'Terminé ! Score : ' + orthScore + ' pts';
    document.getElementById('orth-input').disabled = true;
    document.getElementById('orth-progress').style.width = '100%';
    document.getElementById('orth-counter').textContent = total + ' / ' + total;
    return;
  }
  const k = orthDeck[orthIndex];
  document.getElementById('orth-kanji').textContent = k.kanji;
  document.getElementById('orth-prompt').textContent = 'Donnez une lecture (on\'yomi, kun\'yomi ou sens)';
  document.getElementById('orth-progress').style.width = (orthIndex / total * 100) + '%';
  document.getElementById('orth-counter').textContent = (orthIndex + 1) + ' / ' + total;
  document.getElementById('orth-input').value = '';
  document.getElementById('orth-input').disabled = false;
  document.getElementById('orth-input').focus();
  document.getElementById('orth-feedback').classList.add('hidden');
  document.getElementById('orth-answer').classList.add('hidden');
  document.getElementById('orth-next').classList.add('hidden');
}

function checkOrth() {
  const k = orthDeck[orthIndex];
  const input = document.getElementById('orth-input').value.trim().toLowerCase();
  if (!input) return;

  const allAccepted = [
    ...k.on.map(r => r.toLowerCase()),
    ...k.kun.map(r => r.toLowerCase()),
    ...k.meaning.toLowerCase().split(',').map(s => s.trim()),
    k.meaning.toLowerCase(),
  ];

  const isCorrect = allAccepted.some(a => input === a || a.includes(input) || input.includes(a));

  const feedback = document.getElementById('orth-feedback');
  const answer   = document.getElementById('orth-answer');
  document.getElementById('orth-input').disabled = true;

  if (isCorrect) {
    feedback.textContent = '✓ Correct !';
    feedback.className = 'orth-feedback correct';
    orthScore += 3;
    addScore(3);
    document.getElementById('orth-score').textContent = orthScore + ' pts';
  } else {
    feedback.textContent = '✗ Incorrect';
    feedback.className = 'orth-feedback wrong';
    answer.textContent = 'On\'yomi : ' + (k.on.join(', ') || '—') +
                         '　Kun\'yomi : ' + (k.kun.join(', ') || '—') +
                         '　Sens : ' + k.meaning;
    answer.classList.remove('hidden');
  }
  feedback.classList.remove('hidden');
  document.getElementById('orth-next').classList.remove('hidden');
}

document.getElementById('orth-valider').addEventListener('click', checkOrth);
document.getElementById('orth-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkOrth();
});
document.getElementById('orth-next').addEventListener('click', () => {
  orthIndex++;
  renderOrth();
});
document.getElementById('orth-restart').addEventListener('click', initOrth);

// ── MÉMOIRE ────────────────────────────────────────────────
let memCards = [], memRevealed = [], memMatched = 0, memMoves = 0, memTimer = 0, memInterval = null;

function initMemoire() {
  clearInterval(memInterval);
  memTimer = 0; memMoves = 0; memMatched = 0;
  document.getElementById('mem-timer').textContent = '0s';
  document.getElementById('mem-moves').textContent = '0 coups';

  const pool = shuffle(getFiltered()).slice(0, 8);
  // Each kanji gets 2 cards: one showing kanji, one showing meaning
  const pairs = [];
  pool.forEach(k => {
    pairs.push({ id: k.kanji + '_k', pairId: k.kanji, display: k.kanji,     type: 'kanji'   });
    pairs.push({ id: k.kanji + '_m', pairId: k.kanji, display: k.meaning.split(',')[0].trim(), type: 'meaning' });
  });
  memCards = shuffle(pairs);
  memRevealed = [];

  const grid = document.getElementById('mem-grid');
  grid.innerHTML = memCards.map((c, i) => `
    <div class="mem-card" data-index="${i}" data-pair="${c.pairId}" data-display="${c.display}">
      ${c.display}
    </div>
  `).join('');

  grid.querySelectorAll('.mem-card').forEach(card => {
    card.addEventListener('click', () => flipMemCard(card));
  });

  document.getElementById('mem-pairs').textContent = '0 / ' + pool.length + ' paires';

  memInterval = setInterval(() => {
    memTimer++;
    document.getElementById('mem-timer').textContent = memTimer + 's';
  }, 1000);
}

function flipMemCard(card) {
  if (card.classList.contains('revealed') || card.classList.contains('matched')) return;
  if (memRevealed.length >= 2) return;

  card.classList.add('revealed');
  memRevealed.push(card);

  if (memRevealed.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves + ' coups';
    const [a, b] = memRevealed;
    if (a.dataset.pair === b.dataset.pair && a !== b) {
      // Match!
      a.classList.remove('revealed'); b.classList.remove('revealed');
      a.classList.add('matched');     b.classList.add('matched');
      memMatched++;
      const total = memCards.length / 2;
      document.getElementById('mem-pairs').textContent = memMatched + ' / ' + total + ' paires';
      addScore(10);
      memRevealed = [];
      if (memMatched === total) {
        clearInterval(memInterval);
        setTimeout(() => alert(`🎉 Bravo ! ${total} paires trouvées en ${memMoves} coups et ${memTimer}s !`), 200);
      }
    } else {
      // No match
      setTimeout(() => {
        a.classList.remove('revealed'); b.classList.remove('revealed');
        a.classList.add('shake');       b.classList.add('shake');
        setTimeout(() => { a.classList.remove('shake'); b.classList.remove('shake'); }, 400);
        memRevealed = [];
      }, 900);
    }
  }
}

document.getElementById('mem-restart').addEventListener('click', initMemoire);

// ── INIT ───────────────────────────────────────────────────
renderList();
