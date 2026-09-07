import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Bot, Building2, Filter,
  LocateFixed, LogOut, MessageSquareText,
  Search, ShieldCheck, Sparkles, CheckCircle2
} from 'lucide-react';
import { fetchHistory, fetchResources, getStoredUser, sendChat, setStoredUser } from './api/client.js';
import AuthPage from './components/AuthPage.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ResourceGrid from './components/ResourceGrid.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';

const cities = ['All', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Chandigarh', 'Ludhiana', 'Phagwara'];
const suggestions = [
  'Nearest emergency hospital in Delhi',
  'Show 24/7 pharmacies in Mumbai',
  'Police help near Bengaluru',
  'Best rated banks in Hyderabad'
];

export default function App() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => getStoredUser());

  function handleAuth() {
    setUser(getStoredUser());
  }

  function handleLogout() {
    setStoredUser(null);
    setUser(null);
    setMessages([]);
    setRecommended([]);
  }

  // ── App state ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [city, setCity] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchResources({ city })
      .then(({ resources }) => setResources(resources))
      .catch((err) => setError(err.message));
  }, [city, user]);

  useEffect(() => {
    if (!user) return;
    fetchHistory().then(({ messages }) => setMessages(messages)).catch(() => {});
  }, [user]);

  const stats = useMemo(() => {
    const emergency = resources.filter((r) => r.emergency).length;
    const categories = new Set(resources.map((r) => r.categoryId)).size;
    return { resources: resources.length, emergency, categories };
  }, [resources]);

  async function handleSend(text) {
    setError('');
    setLoading(true);
    setMessages((cur) => [...cur, { role: 'user', content: text }]);
    try {
      const payload = await sendChat(text, city, location);
      setMessages((cur) => [...cur, { role: 'assistant', content: payload.answer, resources: payload.resources }]);
      setRecommended(payload.resources);
    } catch (err) {
      setError(err.message);
      setMessages((cur) => [...cur, { role: 'assistant', content: 'I could not complete that request. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) { setError('Geolocation is not available in this browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError('Location permission was denied or unavailable.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // ── Gate: show login if not authenticated ─────────────────────────────────
  if (!user) return <AuthPage onAuth={handleAuth} />;

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative" style={{ background: '#0d0d1f', color: '#e2e8f0' }}>
      <div className="ambient-glow" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar cities={cities} city={city} setCity={setCity} suggestions={suggestions} onSuggestion={handleSend} />

        <main className="flex min-w-0 flex-col">
          {/* ── Header ── */}
          <header className="sticky top-0 z-20 px-6 py-4 xl:px-8"
            style={{
              background: 'rgba(13,13,31,0.88)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: '#818cf8' }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Powered Community Resource Finder
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                  <span className="gradient-text">IndiaFind</span>
                  <span className="text-white"> AI</span>
                </h1>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                {/* User badge */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#a5b4fc' }}>
                    {user.name}
                  </span>
                </div>

                {/* Location button */}
                <button onClick={detectLocation}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200"
                  style={location ? {
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#34d399',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                  }}>
                  {location
                    ? <><CheckCircle2 className="h-4 w-4" /><span className="hidden md:inline">Active</span></>
                    : <><LocateFixed className="h-4 w-4" /><span className="hidden md:inline">Location</span></>
                  }
                </button>

                {/* Logout button */}
                <button onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'rgba(244,63,94,0.08)',
                    border: '1px solid rgba(244,63,94,0.18)',
                    color: '#fb7185',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(244,63,94,0.16)';
                    e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(244,63,94,0.18)';
                  }}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* ── Stats ── */}
          <section className="grid gap-4 px-6 py-5 xl:grid-cols-4 xl:px-8">
            <StatCard icon={Building2}   label="Resources"  value={stats.resources} />
            <StatCard icon={ShieldCheck} label="Emergency"  value={stats.emergency} />
            <StatCard icon={Filter}      label="Categories" value={stats.categories} />
            <StatCard icon={Activity}    label="Mode"       value="AI" />
          </section>

          {/* ── Error banner ── */}
          {error && (
            <div className="mx-6 mb-2 rounded-xl px-4 py-3 text-sm xl:mx-8 animate-fade-in"
              style={{
                background: 'rgba(244,63,94,0.10)',
                border: '1px solid rgba(244,63,94,0.25)',
                color: '#fb7185',
              }}>
              {error}
            </div>
          )}

          {/* ── Main panels ── */}
          <section className="grid flex-1 gap-5 px-6 pb-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] xl:px-8">
            {/* Chat */}
            <div className="min-h-[640px] rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              <div className="flex items-center gap-2.5 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <MessageSquareText className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">AI Chat</span>
                {loading && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs animate-pulse-slow" style={{ color: '#818cf8' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    Thinking…
                  </span>
                )}
              </div>
              <ChatWindow messages={messages} loading={loading} onSend={handleSend} suggestions={suggestions} />
            </div>

            {/* Recommendations */}
            <aside className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                    <Search className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="font-semibold text-white">Recommendations</span>
                </div>
                <span className="rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                  }}>
                  {city}
                </span>
              </div>
              <ResourceGrid resources={recommended.length ? recommended : resources.slice(0, 8)} />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
