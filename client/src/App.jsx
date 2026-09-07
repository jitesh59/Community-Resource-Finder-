import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Bot, Building2, CheckCircle2, Filter,
  LocateFixed, LogOut, MapPin, MessageSquareText,
  PlusCircle, Search, ShieldCheck, Sparkles
} from 'lucide-react';
import { fetchDistricts, fetchHistory, fetchResources, fetchStates, getStoredUser, sendChat, setStoredUser } from './api/client.js';
import AdminModal from './components/AdminModal.jsx';
import AuthPage from './components/AuthPage.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import FilterBar from './components/FilterBar.jsx';
import ResourceGrid from './components/ResourceGrid.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';

const suggestions = [
  'I need free medical treatment in Delhi',
  'I am a student in Karnataka looking for scholarships',
  'Find NGOs helping children in Mumbai',
  'I need legal assistance near Pune',
  'Where can I get free food near my location?',
  'I need a government hospital near PIN code 110001',
  'I am unemployed and looking for free skill-development programs in Bengaluru',
  'Emergency 24x7 blood bank near Hyderabad'
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

  // ── Hierarchical Location & Filter state ──────────────────────────────────
  const [state, setState] = useState('All');
  const [district, setDistrict] = useState('All');
  const [city, setCity] = useState('All');
  const [pincode, setPincode] = useState('');
  const [categoryId, setCategoryId] = useState('All');
  const [orgType, setOrgType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  // ── App state ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  // ── Admin modal state ──────────────────────────────────────────────────────
  const [adminOpen, setAdminOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    fetchStates()
      .then(({ states }) => setStatesList(states || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (state && state !== 'All') {
      fetchDistricts(state)
        .then(({ districts }) => setDistrictsList(districts || []))
        .catch(() => setDistrictsList([]));
    } else {
      setDistrictsList([]);
    }
  }, [state]);

  const loadAllResources = () => {
    if (!user) return;
    fetchResources({
      state,
      district,
      city,
      pincode,
      categoryId,
      orgType,
      searchQuery,
      maxDistanceKm: maxDistanceKm > 0 ? maxDistanceKm : undefined,
      userLat: location?.lat,
      userLng: location?.lng,
      sortBy
    })
      .then(({ resources }) => setResources(resources || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadAllResources();
  }, [state, district, city, pincode, categoryId, orgType, searchQuery, maxDistanceKm, sortBy, location, user]);

  useEffect(() => {
    if (!user) return;
    fetchHistory()
      .then(({ messages }) => setMessages(messages || []))
      .catch(() => {});
  }, [user]);

  const stats = useMemo(() => {
    const emergency = resources.filter((r) => r.emergency).length;
    const categories = new Set(resources.map((r) => r.categoryId)).size;
    const statesCount = new Set(resources.map((r) => r.state).filter(Boolean)).size;
    return { resources: resources.length, emergency, categories, statesCount };
  }, [resources]);

  async function handleSend(text) {
    setError('');
    setLoading(true);
    setMessages((cur) => [...cur, { role: 'user', content: text }]);
    try {
      const payload = await sendChat(
        text,
        { state, district, city, pincode },
        location
      );
      setMessages((cur) => [...cur, { role: 'assistant', content: payload.answer, resources: payload.resources }]);
      setRecommended(payload.resources || []);
    } catch (err) {
      setError(err.message);
      setMessages((cur) => [
        ...cur,
        { role: 'assistant', content: 'I could not complete that request. Please verify connection and try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError('Location permission was denied or unavailable.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function openCreateModal() {
    setEditingResource(null);
    setAdminOpen(true);
  }

  function openEditModal(res) {
    setEditingResource(res);
    setAdminOpen(true);
  }

  // ── Gate: show login if not authenticated ─────────────────────────────────
  if (!user) return <AuthPage onAuth={handleAuth} />;

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative" style={{ background: '#0d0d1f', color: '#e2e8f0' }}>
      <div className="ambient-glow" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[290px_1fr]">
        <Sidebar
          statesList={statesList}
          state={state}
          setState={setState}
          districtsList={districtsList}
          district={district}
          setDistrict={setDistrict}
          suggestions={suggestions}
          onSuggestion={handleSend}
          onOpenAdmin={openCreateModal}
        />

        <main className="flex min-w-0 flex-col">
          {/* ── Header ── */}
          <header
            className="sticky top-0 z-20 px-6 py-4 xl:px-8"
            style={{
              background: 'rgba(13,13,31,0.88)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Find Community Resources Across India
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                  <span className="gradient-text">IndiaFind</span>
                  <span className="text-white"> AI</span>
                </h1>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                {/* Admin Add Resource Button */}
                <button
                  onClick={openCreateModal}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-glow transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: '1px solid rgba(99,102,241,0.3)'
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Resource</span>
                </button>

                {/* User badge */}
                <div
                  className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)'
                  }}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-indigo-200">{user.name}</span>
                </div>

                {/* Geolocation button */}
                <button
                  onClick={detectLocation}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                  style={
                    location
                      ? {
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#34d399'
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#94a3b8'
                        }
                  }
                >
                  {location ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="hidden md:inline">Near Me Active</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="h-4 w-4" />
                      <span className="hidden md:inline">Near Me</span>
                    </>
                  )}
                </button>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* ── Filter Bar Section ── */}
          <div className="px-6 pt-5 xl:px-8">
            <FilterBar
              state={state}
              setState={setState}
              district={district}
              setDistrict={setDistrict}
              city={city}
              setCity={setCity}
              pincode={pincode}
              setPincode={setPincode}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              orgType={orgType}
              setOrgType={setOrgType}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              maxDistanceKm={maxDistanceKm}
              setMaxDistanceKm={setMaxDistanceKm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              locationCoords={location}
              detectLocation={detectLocation}
            />
          </div>

          {/* ── Stats Section ── */}
          <section className="grid gap-4 px-6 pb-4 xl:grid-cols-4 xl:px-8">
            <StatCard icon={Building2} label="Verified Resources" value={stats.resources} />
            <StatCard icon={ShieldCheck} label="24x7 Emergency" value={stats.emergency} />
            <StatCard icon={Filter} label="Categories" value={stats.categories} />
            <StatCard icon={MapPin} label="Active States/UTs" value={stats.statesCount || 36} />
          </section>

          {/* ── Error Banner ── */}
          {error && (
            <div className="mx-6 mb-2 rounded-xl px-4 py-3 text-sm xl:mx-8 animate-fade-in bg-rose-500/10 border border-rose-500/25 text-rose-400">
              {error}
            </div>
          )}

          {/* ── Main Panel Grid ── */}
          <section className="grid flex-1 gap-5 px-6 pb-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,.85fr)] xl:px-8">
            {/* AI Chat Window */}
            <div
              className="min-h-[640px] rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)'
              }}
            >
              <div
                className="flex items-center gap-2.5 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <MessageSquareText className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">Grounded AI Assistant</span>
                {loading && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs animate-pulse text-indigo-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    Searching DB...
                  </span>
                )}
              </div>
              <ChatWindow messages={messages} loading={loading} onSend={handleSend} suggestions={suggestions} />
            </div>

            {/* Recommendations & Resource Grid */}
            <aside
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)'
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.2)'
                    }}
                  >
                    <Search className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="font-semibold text-white">Verified Resources</span>
                </div>
                <span
                  className="rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc'
                  }}
                >
                  {state !== 'All' ? state : 'All India'}
                </span>
              </div>
              <ResourceGrid
                resources={recommended.length ? recommended : resources}
                onEditResource={openEditModal}
              />
            </aside>
          </section>
        </main>
      </div>

      {/* Admin Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        editingResource={editingResource}
        onRefresh={loadAllResources}
      />
    </div>
  );
}
