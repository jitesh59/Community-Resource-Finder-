import { useState } from 'react';
import { Bot, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { loginUser, registerUser } from '../api/client.js';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser({ email: form.email, password: form.password });
      } else {
        if (form.name.trim().length < 2) { setError('Name must be at least 2 characters.'); setLoading(false); return; }
        await registerUser({ name: form.name, email: form.email, password: form.password });
      }
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setForm({ name: '', email: '', password: '' });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0d0d1f' }}>

      {/* ── Ambient background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Auth card ── */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">

        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-white text-lg shadow-glow overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <span className="relative z-10">IF</span>
              <div className="absolute inset-0 opacity-30"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 70%)' }} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">
                <span className="gradient-text">IndiaFind</span>
                <span className="text-white"> AI</span>
              </div>
              <div className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(148,163,184,0.5)' }}>Community Resource Finder</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: '#818cf8' }}>
            <Sparkles className="h-3 w-3" />
            AI-Powered · India
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
          }}>

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-7"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }); }}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 capitalize"
                style={mode === m ? {
                  background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                } : { color: 'rgba(148,163,184,0.7)', background: 'transparent' }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
              {mode === 'login'
                ? 'Sign in to access community resources.'
                : 'Join to find hospitals, police, ATMs & more.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm animate-fade-in"
              style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.25)',
                color: '#fb7185',
              }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — only for register */}
            {mode === 'register' && (
              <div className="animate-slide-up">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(148,163,184,0.6)' }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: 'rgba(99,102,241,0.7)' }} />
                  <input
                    name="name" type="text" value={form.name} onChange={handleChange}
                    required minLength={2} placeholder="Your full name"
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#e2e8f0',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.55)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(148,163,184,0.6)' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: 'rgba(99,102,241,0.7)' }} />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#e2e8f0',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.55)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(148,163,184,0.6)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: 'rgba(99,102,241,0.7)' }} />
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  required minLength={8} placeholder="Min. 8 characters"
                  className="w-full rounded-xl py-3 pl-10 pr-11 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#e2e8f0',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.55)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <button type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity duration-150 hover:opacity-100"
                  style={{ color: 'rgba(148,163,184,0.5)' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-glow mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(148,163,184,0.55)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode}
              className="font-semibold transition-colors duration-150 hover:opacity-90"
              style={{ color: '#818cf8' }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer branding */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs"
          style={{ color: 'rgba(100,116,139,0.6)' }}>
          <Bot className="h-3.5 w-3.5" />
          Powered by OpenAI · Secure · All India Community Resources
        </div>
      </div>
    </div>
  );
}
