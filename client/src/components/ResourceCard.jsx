import { CheckCircle2, Edit3, ExternalLink, Globe, Mail, MapPin, Navigation, Phone, ShieldCheck, Star } from 'lucide-react';

function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm > 100000) return null;
  return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
}

export default function ResourceCard({ resource, onEdit }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resource.name} ${resource.addr} ${resource.city} ${resource.state || ''}`)}`;
  const distance = formatDistance(resource.distanceKm);

  return (
    <article
      className="relative overflow-hidden rounded-2xl transition-all duration-250 group cursor-default flex flex-col justify-between"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.38)';
        e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(168,85,247,0.6), transparent)' }}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.18)'
            }}
          >
            {resource.icon || '📍'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold leading-tight text-white text-sm">{resource.name}</h3>
              {resource.verificationStatus === 'Verified' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              {resource.category} {resource.orgType ? `· ${resource.orgType}` : ''}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(resource)}
              className="text-slate-500 hover:text-indigo-400 p-1 rounded-lg transition-colors"
              title="Edit Resource"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Location & Address */}
        <div className="text-xs text-slate-300 space-y-1">
          <p className="flex items-start gap-1.5 leading-relaxed">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <span>
              {resource.addr}
              {resource.district ? `, ${resource.district}` : ''}
              {resource.state ? `, ${resource.state}` : ''}
              {resource.pincode ? ` - ${resource.pincode}` : ''}
            </span>
          </p>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {resource.emergency && (
            <span className="badge-emergency rounded-md px-2 py-0.5 text-[10px] font-semibold">
              ⚡ 24/7 Emergency
            </span>
          )}
          {resource.hours && (
            <span className="badge-hours rounded-md px-2 py-0.5 text-[10px] font-semibold">
              {resource.hours}
            </span>
          )}
          {distance && (
            <span className="badge-distance rounded-md px-2 py-0.5 text-[10px] font-semibold">
              📍 {distance}
            </span>
          )}
        </div>

        {/* Available Services Tags */}
        {Array.isArray(resource.availableServices) && resource.availableServices.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.availableServices.slice(0, 3).map((srv) => (
              <span key={srv} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/15">
                {srv}
              </span>
            ))}
          </div>
        )}

        {/* Eligibility note */}
        {resource.eligibility && (
          <p className="text-[11px] text-slate-400 italic">
            <strong className="text-slate-300 font-medium">Eligibility:</strong> {resource.eligibility}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          {resource.rating || 4.5}
          <span className="text-[11px] font-normal text-slate-500">({resource.reviews || 40})</span>
        </div>

        <div className="flex items-center gap-2">
          {resource.phone && (
            <a
              href={`tel:${String(resource.phone).replace(/[^0-9+]/g, '')}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              title="Call Phone"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {resource.website && (
            <a
              href={resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all"
              title="Visit Website"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/22 text-indigo-400 hover:bg-indigo-500/20 transition-all"
            title="Get Directions"
          >
            <Navigation className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
