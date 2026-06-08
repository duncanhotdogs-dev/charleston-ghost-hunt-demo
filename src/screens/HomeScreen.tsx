import { SkullSVG } from '../components/PermissionsModal';

interface Props {
  onBeginHunt: () => void;
  onSignIn: () => void;
}

export default function HomeScreen({ onBeginHunt, onSignIn }: Props) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0303' }}
    >
      {/* Fog layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 animate-fog-1"
          style={{
            background: 'radial-gradient(ellipse 150% 60% at 20% 80%, rgba(255,255,255,0.02) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 animate-fog-2"
          style={{
            background: 'radial-gradient(ellipse 120% 50% at 80% 40%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 animate-fog-3"
          style={{
            background: 'radial-gradient(ellipse 100% 70% at 50% 60%, rgba(255,255,255,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Skull */}
        <div className="mb-6 animate-skul-glow">
          <SkullSVG size={56} />
        </div>

        {/* Title */}
        <div
          className="font-cinzel text-sm tracking-[0.5em] text-bone-dim mb-1 uppercase"
          style={{ letterSpacing: '0.5em' }}
        >
          CHARLESTON
        </div>

        {/* Main title */}
        <h1
          className="font-cinzel font-black text-6xl leading-none mb-3 text-glow-red"
          style={{
            color: '#8b0000',
            textShadow: '0 0 20px rgba(184,134,11,0.3), 0 0 40px rgba(139,0,0,0.8), 0 0 80px rgba(139,0,0,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          GHOST
          <br />
          HUNT
        </h1>

        {/* Divider */}
        <div
          className="w-32 h-px my-4"
          style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }}
        />

        {/* Tagline */}
        <p className="font-garamond italic text-bone text-lg mb-10 opacity-80">
          Hunt the spirits of the Holy City
        </p>

        {/* CTA Button */}
        <button
          onClick={onBeginHunt}
          className="btn-red text-lg py-4 px-10 w-full max-w-xs"
          style={{
            boxShadow: '0 0 30px rgba(139,0,0,0.6), 0 0 60px rgba(139,0,0,0.3)',
          }}
        >
          BEGIN THE HUNT
        </button>

        {/* Sign In link */}
        <button
          onClick={onSignIn}
          className="font-garamond text-sm text-bone-dim mt-6 opacity-50 hover:opacity-80 transition-opacity underline underline-offset-2"
        >
          Sign In
        </button>
      </div>

      {/* Bottom ornament */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 opacity-20">
        <div className="w-16 h-px" style={{ background: '#8b0000' }} />
        <div className="font-cinzel text-[10px] text-primary tracking-[0.3em]">DEMO EDITION</div>
        <div className="w-16 h-px" style={{ background: '#8b0000' }} />
      </div>
    </div>
  );
}
