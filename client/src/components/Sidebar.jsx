import { Clock3, MapPin, PlusCircle, Sparkles, Zap } from 'lucide-react';

export default function Sidebar({
  statesList,
  state,
  setState,
  districtsList,
  district,
  setDistrict,
  suggestions,
  onSuggestion,
  onOpenAdmin
}) {
  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #0d0d1f 0%, #111124 60%, #14142b 100%)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm shadow-glow overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <span className="relative z-10">IF</span>
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 70%)' }}
            />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-base">IndiaFind</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-indigo-300/60">
              All India Resource AI
            </div>
          </div>
        </div>

        {/* Glowing divider */}
        <div
          className="mt-5 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
        />
      </div>

      {/* State & Location Scope Selector */}
      <div className="px-4 pb-3 space-y-2 text-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" />
            <span>State / UT Scope</span>
          </div>
        </div>

        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setDistrict('All');
          }}
          className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white"
        >
          <option value="All">All India (28 States + 8 UTs)</option>
          {statesList.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {state !== 'All' && districtsList.length > 0 && (
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-[#14142b] border border-white/10 text-white animate-fade-in"
          >
            <option value="All">All Districts in {state}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Admin Action Button */}
      {onOpenAdmin && (
        <div className="px-4 py-2">
          <button
            onClick={() => onOpenAdmin()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold text-white transition-all shadow-glow-sm"
            style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(124,58,237,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}
          >
            <PlusCircle className="h-4 w-4 text-indigo-400" />
            <span>Add / Manage Resource</span>
          </button>
        </div>
      )}

      {/* Glowing divider */}
      <div
        className="mx-4 my-3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)' }}
      />

      {/* Smart Prompts */}
      <div className="px-4 flex-1 overflow-y-auto">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300/50">
            India AI Queries
          </span>
        </div>
        <div className="space-y-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestion(suggestion)}
              className="w-full rounded-lg px-3 py-2.5 text-left text-xs leading-relaxed transition-all group border border-white/[0.06] bg-white/[0.025] hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-white"
            >
              <span className="flex items-start gap-2">
                <Zap className="mt-0.5 h-3 w-3 shrink-0 text-brand-400 opacity-70" />
                <span>{suggestion}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Session Memory Box */}
      <div className="px-4 pb-5 mt-3">
        <div className="rounded-xl p-3.5 bg-indigo-500/5 border border-indigo-500/15">
          <div className="mb-1 flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-white">Grounded AI Memory</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            All AI recommendations are verified against actual database records. Zero hallucinated resources.
          </p>
        </div>
      </div>
    </aside>
  );
}
