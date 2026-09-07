import { Clock3, MapPin, Sparkles, Zap } from 'lucide-react';

export default function Sidebar({ cities, city, setCity, suggestions, onSuggestion }) {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #0d0d1f 0%, #111124 60%, #14142b 100%)' }}>

      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm shadow-glow overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <span className="relative z-10">IF</span>
            <div className="absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 70%)' }} />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight">IndiaFind</div>
            <div className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'rgba(165,180,252,0.6)' }}>AI Console</div>
          </div>
        </div>

        {/* Glowing divider */}
        <div className="mt-5 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />
      </div>

      {/* ── City Scope ── */}
      <div className="px-4 pb-2">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" style={{ color: '#6366f1' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(165,180,252,0.5)' }}>City Scope</span>
        </div>
        <div className="space-y-1">
          {cities.map((item) => (
            <button
              key={item}
              onClick={() => setCity(item)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200
                ${city === item
                  ? 'text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              style={city === item ? {
                background: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(124,58,237,0.25))',
                border: '1px solid rgba(99,102,241,0.35)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
              }}
            >
              <span className="flex items-center gap-2">
                {city === item && (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                )}
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Glowing divider */}
      <div className="mx-4 my-4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)' }} />

      {/* ── Smart Prompts ── */}
      <div className="px-4 flex-1">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(165,180,252,0.5)' }}>Smart Prompts</span>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestion(suggestion)}
              className="w-full rounded-lg px-3 py-3 text-left text-xs leading-relaxed transition-all duration-200 group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(203,213,225,0.75)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = 'rgba(203,213,225,0.75)';
              }}
            >
              <span className="flex items-start gap-2">
                <Zap className="mt-0.5 h-3 w-3 shrink-0 text-brand-400 opacity-70" />
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Session Memory ── */}
      <div className="px-4 pb-6 mt-4">
        <div className="rounded-xl p-4"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
          <div className="mb-2 flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-white">Session Memory</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.75)' }}>
            Conversations are stored by browser session and reused for context-aware responses.
          </p>
        </div>
      </div>
    </aside>
  );
}
