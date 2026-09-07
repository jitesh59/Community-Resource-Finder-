import { useEffect, useState } from 'react';
import { Building, CheckCircle2, Filter, LocateFixed, MapPin, Navigation, Search, ShieldAlert, SlidersHorizontal, Sparkles } from 'lucide-react';
import { fetchDistricts, fetchPincodeInfo, fetchStates } from '../api/client.js';

export const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: '🌐' },
  { id: 'hospitals', label: 'Healthcare & Hospitals', icon: '🏥' },
  { id: 'education', label: 'Education & Schools', icon: '🎓' },
  { id: 'scholarships', label: 'Scholarships & Grants', icon: '📜' },
  { id: 'employment', label: 'Employment Jobs', icon: '💼' },
  { id: 'skill_development', label: 'Skill Development', icon: '🛠️' },
  { id: 'government_schemes', label: 'Government Schemes', icon: '🏛️' },
  { id: 'food_assistance', label: 'Food Assistance', icon: '🍲' },
  { id: 'housing', label: 'Housing & Shelter', icon: '🏠' },
  { id: 'legal_aid', label: 'Legal Aid & Rights', icon: '⚖️' },
  { id: 'women_support', label: 'Women Support & Helpline', icon: '🚺' },
  { id: 'child_support', label: 'Child Protection & Care', icon: '👶' },
  { id: 'senior_citizen_services', label: 'Senior Citizen Care', icon: '🧓' },
  { id: 'disability_support', label: 'Disability Support', icon: '♿' },
  { id: 'mental_health', label: 'Mental Health & Counseling', icon: '🧠' },
  { id: 'ngos', label: 'NGOs & Non-Profits', icon: '🤝' },
  { id: 'emergency_services', label: 'Emergency & Trauma', icon: '⚡' },
  { id: 'blood_banks', label: 'Blood Banks', icon: '🩸' },
  { id: 'financial_assistance', label: 'Financial Aid & Banking', icon: '🏦' }
];

export const ORG_TYPES = ['All', 'Government', 'NGO', 'Private', 'Trust', 'Government Autonomous'];

export default function FilterBar({
  state,
  setState,
  district,
  setDistrict,
  city,
  setCity,
  pincode,
  setPincode,
  categoryId,
  setCategoryId,
  orgType,
  setOrgType,
  searchQuery,
  setSearchQuery,
  maxDistanceKm,
  setMaxDistanceKm,
  sortBy,
  setSortBy,
  locationCoords,
  detectLocation,
  onReset
}) {
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [pinLoading, setPinLoading] = useState(false);

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

  async function handlePincodeSearch(e) {
    e.preventDefault();
    if (!pincode || pincode.length < 3) return;
    setPinLoading(true);
    try {
      const info = await fetchPincodeInfo(pincode);
      if (info && info.state) {
        setState(info.state);
        if (info.districts && info.districts.length) {
          setDistrictsList(info.districts);
        }
      }
    } catch (_err) {
      // Graceful fallback
    } finally {
      setPinLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 mb-6 space-y-4"
      style={{
        background: 'rgba(255,255,255,0.028)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)'
      }}>

      {/* Top Search Bar & Geolocation Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 opacity-70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, services, scheme, or organization name..."
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#e2e8f0'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.55)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
          />
        </div>

        {/* PIN Code Lookup Form */}
        <form onSubmit={handlePincodeSearch} className="flex items-center gap-1.5">
          <input
            type="text"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN Code"
            className="w-24 rounded-xl py-2.5 px-3 text-sm text-center font-mono outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#e2e8f0'
            }}
          />
          <button
            type="submit"
            disabled={pinLoading}
            className="rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}
          >
            {pinLoading ? '...' : 'PIN'}
          </button>
        </form>

        {/* Location Detection Button */}
        <button
          onClick={detectLocation}
          className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all"
          style={
            locationCoords
              ? {
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399'
                }
              : {
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  color: '#818cf8'
                }
          }
        >
          {locationCoords ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Near Me Active</span>
            </>
          ) : (
            <>
              <LocateFixed className="h-3.5 w-3.5" />
              <span>Find Near Me</span>
            </>
          )}
        </button>
      </div>

      {/* Hierarchical Location Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* State Selector */}
        <div>
          <label className="mb-1 block font-medium text-[11px] uppercase tracking-wider text-slate-400">State / UT</label>
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setDistrict('All');
              setCity('All');
            }}
            className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white"
          >
            <option value="All">All India (28 States + 8 UTs)</option>
            {statesList.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div>
          <label className="mb-1 block font-medium text-[11px] uppercase tracking-wider text-slate-400">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!state || state === 'All'}
            className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white disabled:opacity-50"
          >
            <option value="All">All Districts</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Org Type Selector */}
        <div>
          <label className="mb-1 block font-medium text-[11px] uppercase tracking-wider text-slate-400">Organization Type</label>
          <select
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
            className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white"
          >
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Org Types' : t}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div>
          <label className="mb-1 block font-medium text-[11px] uppercase tracking-wider text-slate-400">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white"
          >
            <option value="relevance">Most Relevant</option>
            <option value="distance">Nearest Distance</option>
            <option value="rating">Highest Rated</option>
            <option value="updated">Recently Verified</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              categoryId === cat.id
                ? 'bg-brand-500 text-white shadow-glow-sm border border-brand-400'
                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
