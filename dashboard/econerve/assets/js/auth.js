// ============================================================
// EcoNerve – Authentication Module
// Handles login, signup, logout, session persistence,
// and user-friendly Firebase error mapping.
// ============================================================

/* ── Toast helper ─────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast-msg">${msg}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ── Firebase error → friendly message ───────────────────── */
function friendlyError(code) {
  const map = {
    'auth/user-not-found':       'No account found with that email.',
    'auth/wrong-password':       'Invalid email or password.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/too-many-requests':    'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':   'Invalid email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

/* ── Sign Up ──────────────────────────────────────────────── */
function handleSignup(e) {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirmPassword').value;

  if (!fullName) { showToast('Please enter your full name.', 'error'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  if (password !== confirm) { showToast('Passwords do not match.', 'error'); return; }

  const btn = document.getElementById('authBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      const uid = cred.user.uid;
      return db.ref(`users/${uid}`).set({ fullName, email, createdAt: Date.now() });
    })
    .then(() => {
      showToast('Account created! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    })
    .catch(err => {
      btn.disabled = false;
      btn.textContent = 'Create Account';
      showToast(friendlyError(err.code), 'error');
    });
}

/* ── Log In ───────────────────────────────────────────────── */
function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }

  const btn = document.getElementById('authBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showToast('Welcome back!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    })
    .catch(err => {
      btn.disabled = false;
      btn.textContent = 'Sign In';
      showToast(friendlyError(err.code), 'error');
    });
}

/* ── Logout ───────────────────────────────────────────────── */
function handleLogout() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}

/* ── Route guard – call on every protected page ──────────── */
function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      callback(user);
    }
  });
}

/* ── Redirect logged-in users away from auth pages ─────── */
function redirectIfAuthed() {
  auth.onAuthStateChanged(user => {
    if (user) window.location.href = 'dashboard.html';
  });
}
