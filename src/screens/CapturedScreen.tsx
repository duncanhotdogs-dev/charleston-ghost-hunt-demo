import { useEffect, useState, useMemo } from 'react';

interface Props {
  onAddToVault: () => void;
  captureDate: string;
}

export default function CapturedScreen({ onAddToVault, captureDate }: Props) {
  const [showCard, setShowCard] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCard(true), 400);
    const t2 = setTimeout(() => setShowStamp(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleShare() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 3 + Math.random() * 3,
    size: 2 + Math.random() * 3,
    dx: (Math.random() - 0.5) * 60,
  })), []);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden flex flex-col items-center" style={{ background: '#0a0303' }}>
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '0 0 4px rgba(255,255,255,0.5)',
              animation: `particle-rise ${p.dur}s ease-out ${p.delay}s infinite`,
              '--dx': `${p.dx}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* CAPTURED heading */}
      <div className="relative z-10 pt-10 pb-4 text-center">
        <h1
          className="font-cinzel font-black text-5xl tracking-widest"
          style={{
            color: '#8b0000',
            textShadow: '0 0 20px rgba(184,134,11,0.5), 0 0 40px rgba(139,0,0,0.8)',
          }}
        >
          CAPTURED
        </h1>
        <div className="w-32 h-px mx-auto mt-2" style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }} />
      </div>

      {/* Card */}
      {showCard && (
        <div className="relative z-10 flex-1 flex flex-col items-center px-6 pb-4">
          <div
            className="card-flip-container w-full max-w-xs animate-slide-up"
            onClick={() => setFlipped(f => !f)}
          >
            <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ height: 380 }}>
              {/* Front */}
              <div className="card-face card-gothic rounded-lg overflow-hidden h-full flex flex-col relative" style={{ borderRadius: 12 }}>
                {/* Stamp */}
                {showStamp && (
                  <div
                    className="absolute z-20 animate-captured-stamp"
                    style={{
                      top: '15%',
                      right: '5%',
                      transform: 'rotate(-15deg)',
                      border: '3px solid #b8860b',
                      color: '#b8860b',
                      padding: '4px 10px',
                      fontFamily: 'Cinzel, serif',
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      opacity: 0.9,
                    }}
                  >
                    CAPTURED
                  </div>
                )}

                {/* Ghost illustration */}
                <div
                  className="flex-1 flex items-center justify-center"
                  style={{ background: 'linear-gradient(to bottom, #1a0808, #0a0303)' }}
                >
                  <div style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
                    <GhostSilhouette />
                  </div>
                </div>

                {/* Card info */}
                <div className="px-4 py-4 text-center" style={{ borderTop: '1px solid rgba(139,0,0,0.3)' }}>
                  <div className="font-cinzel text-base tracking-wider text-bone mb-1">Gary the Greeter</div>
                  <div className="font-garamond italic text-bone-dim text-sm mb-2">The Eternal Welcome</div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="rarity-legendary">LEGENDARY</span>
                  </div>
                  <p className="font-garamond italic text-xs text-bone-dim opacity-80">
                    "I never did go home."
                  </p>
                </div>
              </div>

              {/* Back */}
              <div className="card-face card-back card-gothic rounded-lg overflow-hidden flex flex-col" style={{ borderRadius: 12 }}>
                <div className="flex-1 p-5 flex flex-col">
                  <div className="font-cinzel text-sm tracking-widest text-bone mb-3 text-center">WHO IS GARY?</div>
                  <div className="w-16 h-px mx-auto mb-3" style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }} />
                  <p className="font-garamond text-sm text-bone-dim leading-relaxed flex-1">
                    A Charleston tourism official who began welcoming visitors in 1947. He loved his work so completely that he never quite managed to leave. Witnesses at the Visitor Center have reported a warmly dressed gentleman who offers directions to streets that no longer exist.
                  </p>
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(139,0,0,0.2)' }}>
                    <div className="font-garamond text-xs text-bone-dim opacity-70">
                      Captured at: Charleston Visitor Center
                    </div>
                    <div className="font-garamond text-xs text-bone-dim opacity-70 mt-1">
                      {captureDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="font-garamond text-xs text-bone-dim opacity-40 mt-2">
            Tap card to {flipped ? 'flip back' : 'learn more'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col w-full max-w-xs gap-3 mt-4">
            <button onClick={onAddToVault} className="btn-red w-full py-3">
              ADD TO VAULT
            </button>
            <button
              onClick={handleShare}
              className="font-garamond tracking-wider text-bone border border-bone/20 rounded py-3 w-full text-sm"
            >
              SHARE
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded font-garamond text-sm text-bone animate-slide-up"
          style={{ background: 'rgba(20,5,5,0.95)', border: '1px solid rgba(139,0,0,0.4)' }}
        >
          Sharing coming soon
        </div>
      )}
    </div>
  );
}

function GhostSilhouette() {
  return (
    <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="45" cy="50" rx="35" ry="40" fill="rgba(255,255,255,0.15)" />
      <rect x="10" y="50" width="70" height="55" fill="rgba(255,255,255,0.15)" />
      <path d="M10 105 Q22 120 35 105 Q45 90 55 105 Q68 120 80 105 L80 105 L10 105Z" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="32" cy="48" rx="9" ry="11" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="58" cy="48" rx="9" ry="11" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="32" cy="49" rx="6" ry="7" fill="rgba(10,3,3,0.8)" />
      <ellipse cx="58" cy="49" rx="6" ry="7" fill="rgba(10,3,3,0.8)" />
      <path d="M36 72 Q45 80 54 72" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
