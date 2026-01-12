/*
  PreAuthHero.jsx
  - Adds a dark modern hero and a modal auth card with Login/Sign Up tabs.
  - Keeps existing input names/IDs so backend hooks remain compatible.
  - Where to add backend calls: this component uses `login()` and `register()` from `useAuth()` (do not modify post-login files).
  - DO NOT MODIFY POST-LOGIN FILES
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PreAuthHero.css';

const PreAuthHero = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // form state (keep ids/names same as project to preserve hooks)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [emailSignup, setEmailSignup] = useState('');
  const [passwordSignup, setPasswordSignup] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // theme state (persisted) - 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('tanishq-theme');
      if (saved) return saved;
      // default to OS preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (err) {
      return 'dark';
    }
  });

  // apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('tanishq-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('tanishq-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Accessibility helpers
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // open modal and select tab
  const openModal = (tab = 'login') => {
    setActiveTab(tab);
    setModalOpen(true);
    setTimeout(() => {
      const el = document.querySelector('.modal-card .panel.active .input');
      if (el) el.focus();
    }, 80);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Focus trap for accessibility: trap focus inside modal when open and restore focus on close
  useEffect(() => {
    if (!modalOpen) return;

    const modalEl = document.querySelector('.modal-card');
    const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = modalEl.querySelectorAll(focusableSelector);
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    const prevActive = document.activeElement;

    // prevent background scroll
    document.body.style.overflow = 'hidden';

    function onKey(e) {
      if (e.key === 'Tab') {
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    }

    document.addEventListener('keydown', onKey);

    // focus first
    setTimeout(() => { firstEl && firstEl.focus(); }, 60);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // restore focus
      try { prevActive && prevActive.focus(); } catch (err) {}
    };
  }, [modalOpen]);

  // submit handlers use existing context methods so backend wiring remains intact
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return toast.error('Enter a valid email');
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await login(email, password); // existing project method — preserves behavior
      toast.success('Logged in');
      closeModal();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    if (!isValidEmail(emailSignup)) return toast.error('Enter a valid email');
    if (!passwordSignup || passwordSignup.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwordSignup !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await register(name, emailSignup, passwordSignup); // existing project method
      toast.success('Account created');
      closeModal();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="topbar" role="banner">
        <div className="container topbar-inner">
          <div className="brand">
           {/* Wordmark: AIMate with subtitle */}
           <div className="app-wordmark" aria-hidden="false">
            <div className="app-name">AIMate</div>
            <div className="app-subtitle">AI Productivity Assistant</div>
           </div>
          </div>
          <nav className="nav" aria-label="Primary">
           <button className="link-btn" onClick={() => openModal('login')}>Login</button>
           <button className="link-cta" onClick={() => openModal('signup')}>Sign Up</button>
           <button id="theme-toggle" className="theme-toggle" onClick={toggleTheme} aria-pressed={theme === 'light'} aria-label="Toggle theme">
            {theme === 'light' ? '🌞' : '�'}
           </button>
          </nav>
        </div>
      </header>

      <main className="hero login-hero">
        <div className="container hero-inner">
          <section className="hero-left" aria-labelledby="hero-headline">
            <div className="badge">New · AI-boosted</div>
            <h1 id="hero-headline" className="headline">
              Build faster.<br />
              Focus smarter.<br />
              Ship more.
            </h1>
            <p className="sub">A lightweight AI productivity assistant for teams — tasks, meetings, and insights in one place.</p>

            <ul className="features" aria-hidden="true">
              <li>Automated meeting notes</li>
              <li>Smart expense summaries</li>
              <li>Actionable task suggestions</li>
            </ul>

            <div className="cta-wrap">
              <button id="cta-get-started" className="cta-circle" onClick={() => openModal('signup')} aria-haspopup="dialog" aria-controls="auth-modal">
                Get Started
                <span className="cta-ring" aria-hidden="true"></span>
              </button>
            </div>
          </section>

          <aside className="hero-right" aria-hidden="true">
            <svg className="illustration" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative illustration placeholder">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#06b6d4" stopOpacity="0.12" />
                  <stop offset="1" stopColor="#60a5fa" stopOpacity="0.12" />
                </linearGradient>
                <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="14" />
                </filter>
              </defs>
              <rect x="20" y="40" width="360" height="260" rx="20" fill="rgba(255,255,255,0.03)" />
              <g filter="url(#f1)">
                <circle cx="480" cy="60" r="64" fill="#06b6d4" fillOpacity="0.10" />
                <circle cx="520" cy="320" r="96" fill="#60a5fa" fillOpacity="0.06" />
              </g>
              <g transform="translate(60,70)">
                <rect x="0" y="0" width="220" height="140" rx="12" fill="#0f172a" opacity="0.75" />
                <rect x="12" y="16" width="196" height="40" rx="8" fill="#111827" />
                <rect x="12" y="70" width="170" height="12" rx="6" fill="#1f2937" />
                <rect x="12" y="92" width="120" height="12" rx="6" fill="#1f2937" />
              </g>
            </svg>
          </aside>
        </div>
      </main>

      {/* Modal */}
      <div id="auth-modal" className="modal" role="dialog" aria-modal="true" aria-hidden={!modalOpen} aria-labelledby="auth-title">
        <div className="modal-backdrop" onClick={closeModal} data-dismiss="true"></div>
        <div className="modal-card" role="document">
          <header className="modal-head">
            <div>
              <div className="modal-badge">Welcome</div>
              <h2 id="auth-title" className="modal-title">{activeTab === 'login' ? 'Sign in to TANISHQ' : 'Create your account'}</h2>
            </div>
            <button className="modal-close" aria-label="Close" onClick={closeModal}>&times;</button>
          </header>

          <div className="tabs" role="tablist" aria-label="Authentication tabs">
            <button role="tab" aria-selected={activeTab === 'login'} aria-controls="tab-login-panel" id="tab-login" className={`tab ${activeTab === 'login' ? 'active': ''}`} onClick={() => setActiveTab('login')}>Login</button>
            <button role="tab" aria-selected={activeTab === 'signup'} aria-controls="tab-signup-panel" id="tab-signup" className={`tab ${activeTab === 'signup' ? 'active': ''}`} onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>

          <div className="tab-panels">
            <form id="tab-login-panel" className={`panel ${activeTab === 'login' ? 'active' : ''}`} onSubmit={handleLogin} autoComplete="on" noValidate>
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" name="email" type="email" className="input" required aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div id="email-help" className="hint">We'll only use this for sign in.</div>

              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" name="password" type="password" className="input" required minLength={6} aria-required="true" value={password} onChange={(e) => setPassword(e.target.value)} />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{loading ? 'Logging in...' : 'Login'}</button>
                <button type="button" className="btn btn-ghost" id="forgot-btn">Forgot?</button>
              </div>
            </form>

            <form id="tab-signup-panel" className={`panel ${activeTab === 'signup' ? 'active' : ''}`} onSubmit={handleRegister} autoComplete="on" noValidate>
              <label htmlFor="name" className="form-label">Name</label>
              <input id="name" name="name" type="text" className="input" required aria-required="true" value={name} onChange={(e) => setName(e.target.value)} />

              <label htmlFor="email-signup" className="form-label">Email</label>
              <input id="email-signup" name="email" type="email" className="input" required aria-required="true" value={emailSignup} onChange={(e) => setEmailSignup(e.target.value)} />

              <label htmlFor="password-signup" className="form-label">Password</label>
              <input id="password-signup" name="password" type="password" className="input" required minLength={6} aria-required="true" value={passwordSignup} onChange={(e) => setPasswordSignup(e.target.value)} />

              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="input" required minLength={6} aria-required="true" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{loading ? 'Creating...' : 'Create account'}</button>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreAuthHero;
