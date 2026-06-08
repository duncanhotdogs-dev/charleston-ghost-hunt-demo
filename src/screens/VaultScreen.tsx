import { useState, useEffect, useRef } from 'react';

interface Props {
  garyCaptured: boolean;
  onReleaseAll: () => void;
  justCaptured: boolean;
}

export default function VaultScreen({ garyCaptured, onReleaseAll, justCaptured }: Props) {
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedVial, setSelectedVial] = useState<string | null>(null);
  const [garyShaking, setGaryShaking] = useState(false);
  const justCapturedRef = useRef(justCaptured);

  useEffect(() => {
    if (justCaptured && garyCaptured && !justCapturedRef.current) {
      setGaryShaking(true);
      playTone();
      setTimeout(() => setGaryShaking(false), 1600);
    }
    justCapturedRef.current = justCaptured;
  }, []);

  // Play a brief high-pitched tone via Web Audio API
  function playTone() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* silent */ }
  }

  const totalSlots = 20;

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#080202', paddingBottom: 72 }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,2,2,0.95)', borderBottom: '1px solid rgba(139,0,0,0.2)', backdropFilter: 'blur(4px)' }}
      >
        <div>
          <div className="font-cinzel text-base tracking-widest text-bone">SPIRIT VAULT</div>
          <div className="font-garamond text-xs text-bone-dim opacity-60">
            {garyCaptured ? 1 : 0} / {totalSlots} captured
          </div>
        </div>
        <button
          onClick={() => setShowReleaseModal(true)}
          className="font-garamond text-xs"
          style={{ color: '#b8860b', opacity: 0.7 }}
        >
          ☽ RELEASE ALL
        </button>
      </div>

      {/* Shelf decorations */}
      <div className="px-4 py-4">
        <div className="font-garamond italic text-xs text-bone-dim text-center mb-4 opacity-50">
          The laboratory of lost souls
        </div>

        {/* Vials grid */}
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: totalSlots }, (_, i) => {
            const isGary = i === 0 && garyCaptured;
            return (
              <VialSlot
                key={i}
                isGary={isGary}
                isShaking={isGary && garyShaking}
                onClick={isGary ? () => setSelectedVial('gary') : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Gary detail overlay */}
      {selectedVial === 'gary' && (
        <GaryDetailOverlay onClose={() => setSelectedVial(null)} />
      )}

      {/* Release modal */}
      {showReleaseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          <div className="card-gothic rounded-lg p-6 w-full max-w-sm text-center">
            <h2 className="font-cinzel text-xl text-bone mb-2 tracking-wider">RELEASE THE SPIRITS?</h2>
            <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, #8b0000, transparent)' }} />
            <p className="font-garamond text-bone-dim text-sm mb-6 leading-relaxed">
              All captured ghosts will escape back to their haunting grounds. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReleaseModal(false); onReleaseAll(); }}
                className="btn-red flex-1 py-3 text-sm"
              >
                YES, RELEASE THEM
              </button>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="flex-1 py-3 text-sm font-cinzel tracking-wider text-bone-dim rounded"
                style={{ border: '1px solid rgba(100,80,80,0.4)' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VialSlot({ isGary, isShaking, onClick }: { isGary: boolean; isShaking?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!isGary}
      className="flex flex-col items-center gap-1"
      style={{ cursor: isGary ? 'pointer' : 'default' }}
    >
      <div
        className={`relative flex items-center justify-center ${isShaking ? 'animate-vial-shake' : ''}`}
        style={{
          width: 56,
          height: 80,
          borderRadius: '40% 40% 20% 20% / 50% 50% 20% 20%',
          background: isGary
            ? 'radial-gradient(ellipse at 40% 30%, rgba(100,180,60,0.3), transparent 60%), linear-gradient(to bottom, rgba(20,8,8,0.95), rgba(10,3,3,1))'
            : 'linear-gradient(to bottom, rgba(20,8,8,0.6), rgba(10,3,3,0.6))',
          border: isGary ? '1px solid rgba(100,200,50,0.5)' : '1px solid rgba(100,80,80,0.2)',
          boxShadow: isGary ? '0 0 15px rgba(80,160,40,0.3), inset 0 0 20px rgba(100,200,50,0.1)' : 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isGary ? (
          <>
            {/* Inner glow */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 60%, rgba(100,200,50,0.2) 0%, transparent 70%)',
                animation: 'pulseRed 3s ease-in-out infinite',
              }}
            />
            {/* Ghost inside vial */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full pb-2">
              <MiniGhost />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span style={{ fontSize: 18, opacity: 0.15, color: '#888' }}>?</span>
          </div>
        )}

        {/* Vial neck */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 20,
            height: 8,
            background: isGary ? 'rgba(80,150,40,0.3)' : 'rgba(50,30,30,0.4)',
            border: isGary ? '1px solid rgba(100,200,50,0.4)' : '1px solid rgba(80,60,60,0.3)',
            borderRadius: '3px 3px 0 0',
          }}
        />
      </div>
      {isGary && (
        <span className="font-cinzel text-bone" style={{ fontSize: 8, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.2 }}>
          Gary
        </span>
      )}
    </button>
  );
}

function MiniGhost() {
  return (
    <div style={{ animation: 'ghostFloat 2s ease-in-out infinite' }}>
      <svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="11" cy="12" rx="9" ry="11" fill="rgba(255,255,255,0.7)" />
        <rect x="2" y="12" width="18" height="14" fill="rgba(255,255,255,0.7)" />
        <path d="M2 26 Q5.5 30 9 26 Q11 22 13 26 Q16.5 30 20 26 L20 26 L2 26Z" fill="rgba(255,255,255,0.7)" />
        <ellipse cx="8" cy="12" rx="3" ry="3.5" fill="rgba(10,3,3,0.7)" />
        <ellipse cx="14" cy="12" rx="3" ry="3.5" fill="rgba(10,3,3,0.7)" />
      </svg>
    </div>
  );
}

function GaryDetailOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(3px)' }}
    >
      {/* Enlarged vial behind */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none"
        style={{ transform: 'translateX(-50%) scale(2.5)', transformOrigin: 'top center' }}
      >
        <VialSlot isGary isShaking={false} />
      </div>

      {/* Detail panel */}
      <div
        className="relative z-10 w-full card-gothic rounded-t-2xl p-6 animate-slide-up"
        style={{ maxHeight: '75vh', overflowY: 'auto' }}
      >
        {/* Portrait area */}
        <div
          className="w-20 h-24 mx-auto mb-4 flex items-center justify-center rounded"
          style={{
            background: 'rgba(30,15,15,0.8)',
            border: '2px solid rgba(184,134,11,0.4)',
            filter: 'sepia(0.3)',
            boxShadow: '0 0 15px rgba(184,134,11,0.2)',
          }}
        >
          <svg width="40" height="55" viewBox="0 0 40 55" fill="none">
            <ellipse cx="20" cy="20" rx="14" ry="16" fill="rgba(255,255,255,0.2)" />
            <rect x="6" y="20" width="28" height="25" fill="rgba(255,255,255,0.2)" />
            <path d="M6 45 Q12 55 20 45 Q28 55 34 45 L34 45 L6 45Z" fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>

        <div className="font-cinzel text-lg tracking-wider text-bone text-center mb-1">GARY THE GREETER</div>
        <div className="font-garamond italic text-bone-dim text-sm text-center mb-2">The Eternal Welcome</div>
        <div className="flex justify-center mb-4">
          <span className="rarity-legendary">LEGENDARY</span>
        </div>

        <p className="font-garamond text-sm text-bone-dim leading-relaxed mb-4">
          A Charleston tourism official who began welcoming visitors in 1947. He loved his work so completely he never managed to leave. He has been spotted offering directions to streets that no longer exist and recommending restaurants that closed in 1963.
        </p>

        <button
          onClick={onClose}
          className="font-cinzel text-xs tracking-widest text-bone-dim w-full py-3 text-center"
          style={{ border: '1px solid rgba(139,0,0,0.3)', borderRadius: 4 }}
        >
          ← RETURN TO VAULT
        </button>
      </div>
    </div>
  );
}
