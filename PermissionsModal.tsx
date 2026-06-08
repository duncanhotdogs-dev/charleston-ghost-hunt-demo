import React, { useState } from 'react';
import { MapPin, Camera, Compass } from 'lucide-react';

interface Props {
  onComplete: (results: { location: boolean; camera: boolean; compass: boolean }) => void;
}

export default function PermissionsModal({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  async function grantAll() {
    setLoading(true);
    const results = { location: false, camera: false, compass: false };

    // 1. GPS
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => { results.location = true; resolve(); },
          () => resolve(),
          { timeout: 8000 }
        );
      });
    } catch { /* silent */ }

    // 2. Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      results.camera = true;
      stream.getTracks().forEach(t => t.stop());
    } catch { /* silent */ }

    // 3. Compass (iOS)
    try {
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DOE.requestPermission === 'function') {
        const state = await DOE.requestPermission();
        results.compass = state === 'granted';
      } else {
        results.compass = true;
      }
    } catch { results.compass = true; }

    onComplete(results);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#0a0303' }}>
      {/* Fog layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 animate-fog-1" style={{ background: 'radial-gradient(ellipse 120% 60% at 50% 80%, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 animate-fog-2" style={{ background: 'radial-gradient(ellipse 100% 50% at 30% 60%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto px-6 text-center">
        {/* Skull icon */}
        <div className="mb-6 flex justify-center animate-skul-glow">
          <SkullSVG size={48} />
        </div>

        <h1 className="font-cinzel text-2xl tracking-[0.2em] text-bone mb-2 uppercase">Before You Hunt</h1>
        <div className="w-24 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, #8b0000, transparent)' }} />
        <p className="font-garamond text-bone-dim text-base mb-8 leading-relaxed">
          Charleston Ghost Hunt requires access to three things to work properly.
        </p>

        <div className="space-y-4 mb-8">
          <PermissionRow
            icon={<MapPin size={20} className="text-primary" />}
            label="Location"
            purpose="To detect nearby spirits"
          />
          <PermissionRow
            icon={<Camera size={20} className="text-primary" />}
            label="Camera"
            purpose="To reveal ghosts in the real world"
          />
          <PermissionRow
            icon={<Compass size={20} className="text-primary" />}
            label="Compass"
            purpose="To track ghost positions as you move"
          />
        </div>

        <button
          onClick={grantAll}
          disabled={loading}
          className="btn-red w-full text-base py-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="font-cinzel tracking-widest">REQUESTING...</span>
          ) : (
            <span className="font-cinzel tracking-widest">GRANT ALL PERMISSIONS</span>
          )}
        </button>

        <p className="font-garamond text-xs text-bone-dim mt-4 opacity-60">
          Permissions may be requested in sequence
        </p>
      </div>
    </div>
  );
}

function PermissionRow({ icon, label, purpose }: { icon: React.ReactNode; label: string; purpose: string }) {
  return (
    <div className="card-gothic rounded p-3 flex items-center gap-4 text-left">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-cinzel text-sm text-bone tracking-wider">{label}</div>
        <div className="font-garamond text-xs text-bone-dim">{purpose}</div>
      </div>
    </div>
  );
}

export function SkullSVG({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="32" cy="28" rx="20" ry="22" fill="#8b0000" />
      <ellipse cx="32" cy="28" rx="18" ry="20" fill="#1a0505" />
      <ellipse cx="23" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9" />
      <ellipse cx="41" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9" />
      <ellipse cx="23" cy="28" rx="4" ry="5" fill="#0a0303" />
      <ellipse cx="41" cy="28" rx="4" ry="5" fill="#0a0303" />
      <rect x="26" y="44" width="4" height="8" rx="1" fill="#8b0000" />
      <rect x="34" y="44" width="4" height="8" rx="1" fill="#8b0000" />
      <rect x="24" y="44" width="16" height="3" rx="1" fill="#8b0000" />
      <path d="M32 36 L28 44 L36 44 Z" fill="#8b0000" />
    </svg>
  );
}
