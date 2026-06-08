/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0303',
        'bg-panel': '#0f0505',
        'bg-card': '#130606',
        primary: '#8b0000',
        'primary-light': '#a50000',
        secondary: '#b8860b',
        'secondary-light': '#d4a017',
        bone: '#f5f0e8',
        'bone-dim': '#c8bfb0',
        mist: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        garamond: ['EB Garamond', 'serif'],
      },
      keyframes: {
        fogDrift1: {
          '0%, 100%': { transform: 'translateX(-5%) translateY(0)' },
          '50%': { transform: 'translateX(5%) translateY(-3%)' },
        },
        fogDrift2: {
          '0%, 100%': { transform: 'translateX(3%) translateY(2%)' },
          '50%': { transform: 'translateX(-4%) translateY(-2%)' },
        },
        fogDrift3: {
          '0%, 100%': { transform: 'translateX(-2%) translateY(1%)' },
          '50%': { transform: 'translateX(6%) translateY(3%)' },
        },
        skulGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px #8b0000) drop-shadow(0 0 20px #8b0000)' },
          '50%': { filter: 'drop-shadow(0 0 15px #8b0000) drop-shadow(0 0 40px #a50000)' },
        },
        radarSweep: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ghostFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-10px) translateX(10px)' },
          '75%': { transform: 'translateY(-5px) translateX(-10px)' },
        },
        ghostDrift: {
          '0%': { left: '-10%' },
          '100%': { left: '110%' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(var(--dx))', opacity: '0' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.05)' },
        },
        screenPulse: {
          '0%, 100%': { filter: 'brightness(1.0)' },
          '50%': { filter: 'brightness(1.05)' },
        },
        screenPulseStrong: {
          '0%, 100%': { filter: 'brightness(1.0)' },
          '50%': { filter: 'brightness(1.08)' },
        },
        capturedStamp: {
          '0%': { transform: 'rotate(-15deg) scale(2)', opacity: '0' },
          '60%': { transform: 'rotate(-15deg) scale(0.95)', opacity: '1' },
          '100%': { transform: 'rotate(-15deg) scale(1)', opacity: '1' },
        },
        vialShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        ghostRelease: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(3) translate(var(--gx), var(--gy))', opacity: '0' },
        },
        notifySlideDown: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scan-progress': {
          from: { strokeDashoffset: '283' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fog-1': 'fogDrift1 18s ease-in-out infinite',
        'fog-2': 'fogDrift2 25s ease-in-out infinite',
        'fog-3': 'fogDrift3 20s ease-in-out infinite',
        'skul-glow': 'skulGlow 2.5s ease-in-out infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'ghost-float': 'ghostFloat 2s ease-in-out infinite',
        'ghost-drift': 'ghostDrift 8s linear infinite',
        'pulse-red': 'pulseRed 3s ease-in-out infinite',
        'screen-pulse': 'screenPulse 3s ease-in-out infinite',
        'screen-pulse-strong': 'screenPulseStrong 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'captured-stamp': 'capturedStamp 0.5s ease-out forwards',
        'vial-shake': 'vialShake 1.5s ease-in-out forwards',
        'notify-slide': 'notifySlideDown 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
