import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

const HUNTS = [
  { id: 'free', name: 'Free Hunt', desc: '1 Spirit Available', price: null, rarity: '1 Free Spirit', locked: false, badge: 'UNLOCKED' },
  { id: 'pirates', name: 'Pirates & Plunder', desc: '5 Spirits • 2 Legendary', price: '$4.99', rarity: null, locked: true },
  { id: 'soldiers', name: 'Fallen Soldiers', desc: '5 Spirits • 1 Legendary', price: '$4.99', rarity: null, locked: true },
  { id: 'murder', name: 'Murder & Madness', desc: '6 Spirits • 2 Legendary', price: '$4.99', rarity: null, locked: true },
  { id: 'plague', name: 'The Plague Years', desc: '5 Spirits • 1 Legendary', price: '$4.99', rarity: null, locked: true },
  { id: 'beasts', name: 'Phantom Beasts', desc: '5 Spirits • 2 Legendary', price: '$4.99', rarity: null, locked: true },
  { id: 'bundle', name: 'All Hunts Bundle', desc: 'All 6 Hunts Unlocked', price: '$12.99', rarity: null, locked: true, badge: 'BEST VALUE', strike: '$24.95', save: 'SAVE 48%', isBundle: true },
];

export default function HuntsScreen() {
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#0a0303', paddingBottom: 72 }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3"
        style={{ background: 'rgba(10,3,3,0.95)', borderBottom: '1px solid rgba(139,0,0,0.2)', backdropFilter: 'blur(4px)' }}
      >
        <h1 className="font-cinzel text-lg tracking-widest text-bone text-center">GHOST HUNTS</h1>
        <p className="font-garamond italic text-bone-dim text-xs text-center opacity-60">Choose your hunting ground</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {HUNTS.map(hunt => (
          <HuntCard
            key={hunt.id}
            hunt={hunt}
            onLockedTap={() => hunt.locked && setComingSoon(true)}
          />
        ))}
      </div>

      {/* Coming soon sheet */}
      {comingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setComingSoon(false)}
        >
          <div
            className="w-full card-gothic rounded-t-2xl p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="font-cinzel text-lg text-bone text-center mb-2 tracking-wider">COMING SOON</div>
            <div className="w-16 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, #8b0000, transparent)' }} />
            <p className="font-garamond text-sm text-bone-dim text-center leading-relaxed mb-6">
              Full launch this fall. All hunts unlock the hidden history of Charleston's most haunted streets.
            </p>
            <button
              onClick={() => setComingSoon(false)}
              className="btn-red w-full py-3 text-sm"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HuntCard({ hunt, onLockedTap }: { hunt: typeof HUNTS[0]; onLockedTap: () => void }) {
  return (
    <button
      onClick={hunt.locked ? onLockedTap : undefined}
      className="w-full text-left"
    >
      <div
        className="rounded-lg p-4"
        style={{
          background: hunt.isBundle
            ? 'linear-gradient(135deg, rgba(25,10,5,1), rgba(15,5,5,1))'
            : 'rgba(19,6,6,0.8)',
          border: hunt.isBundle
            ? '1px solid rgba(184,134,11,0.6)'
            : hunt.locked
              ? '1px solid rgba(139,0,0,0.2)'
              : '1px solid rgba(100,200,50,0.4)',
          boxShadow: hunt.isBundle ? '0 0 20px rgba(184,134,11,0.15)' : 'none',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-cinzel text-sm text-bone tracking-wide">{hunt.name}</span>
              {hunt.badge && (
                <span
                  className="font-cinzel text-[9px] px-2 py-0.5 rounded"
                  style={{
                    background: hunt.isBundle ? '#b8860b' : 'rgba(100,200,50,0.2)',
                    color: hunt.isBundle ? '#0a0303' : '#6bc43a',
                    border: hunt.isBundle ? 'none' : '1px solid rgba(100,200,50,0.4)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {hunt.badge}
                </span>
              )}
            </div>
            <div className="font-garamond text-xs text-bone-dim opacity-70">{hunt.desc}</div>
            {hunt.save && (
              <div className="font-cinzel text-[10px] mt-1" style={{ color: '#b8860b' }}>{hunt.save}</div>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            {hunt.locked ? (
              <Lock size={14} style={{ color: '#8b0000' }} />
            ) : (
              <Unlock size={14} style={{ color: '#6bc43a' }} />
            )}
            {hunt.price && (
              <div className="font-cinzel text-sm text-bone">
                {hunt.strike && (
                  <span className="text-xs line-through text-bone-dim opacity-50 mr-1">{hunt.strike}</span>
                )}
                {hunt.price}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
