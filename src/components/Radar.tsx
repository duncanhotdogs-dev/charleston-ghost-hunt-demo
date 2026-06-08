import { useEffect, useRef } from 'react';

interface Props {
  playerLat: number;
  playerLng: number;
  compassHeading: number;
  garyLat: number;
  garyLng: number;
  distanceMeters: number;
  active: boolean;
}

export default function Radar({ playerLat, playerLng, compassHeading, garyLat, garyLng, distanceMeters, active }: Props) {
  // Calculate Gary's position on radar
  const bearing = (() => {
    const dLng = ((garyLng - playerLng) * Math.PI) / 180;
    const lat1 = (playerLat * Math.PI) / 180;
    const lat2 = (garyLat * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const b = (Math.atan2(y, x) * 180) / Math.PI;
    return (b + 360) % 360;
  })();

  const relBearing = ((bearing - compassHeading + 360) % 360) * (Math.PI / 180);
  const maxDisplayDist = 200; // beyond this Gary is at radar edge
  const normalized = Math.min(distanceMeters / maxDisplayDist, 1);
  const radarRadius = 50; // half of 100px
  const dotX = 60 + Math.sin(relBearing) * normalized * radarRadius;
  const dotY = 60 - Math.cos(relBearing) * normalized * radarRadius;

  const pulseInterval = distanceMeters < 8 ? 300 : distanceMeters < 45 ? 800 : 2000;
  const pulseRef = useRef<boolean>(true);

  useEffect(() => {
    const id = setInterval(() => { pulseRef.current = !pulseRef.current; }, pulseInterval);
    return () => clearInterval(id);
  }, [pulseInterval]);

  if (!active) return null;

  return (
    <div
      className="fixed z-20 select-none"
      style={{ bottom: 72, left: 12 }}
    >
      <div
        className="relative"
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: '#000',
          border: '2px solid rgba(0,255,0,0.4)',
          boxShadow: '0 0 15px rgba(0,255,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Concentric rings */}
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full"
            style={{
              width: `${pct * 2}%`,
              height: `${pct * 2}%`,
              top: `${50 - pct}%`,
              left: `${50 - pct}%`,
              border: '1px solid rgba(0,255,0,0.2)',
            }}
          />
        ))}

        {/* Center crosshairs */}
        <div className="absolute" style={{ top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,255,0,0.15)', transform: 'translateY(-50%)' }} />
        <div className="absolute" style={{ left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,255,0,0.15)', transform: 'translateX(-50%)' }} />

        {/* Sweep line */}
        <div
          className="absolute animate-radar-sweep"
          style={{
            width: '50%',
            height: 1,
            top: '50%',
            left: '50%',
            transformOrigin: '0% 50%',
            background: 'linear-gradient(to right, rgba(0,255,0,0.9), transparent)',
          }}
        />

        {/* Center dot */}
        <div
          className="absolute"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00ff00',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 6px #00ff00',
          }}
        />

        {/* Gary dot */}
        <GaryDot x={dotX} y={dotY} distanceMeters={distanceMeters} />
      </div>

      <div
        className="text-center mt-1 font-cinzel"
        style={{ fontSize: 9, color: 'rgba(0,255,0,0.7)', letterSpacing: '0.15em' }}
      >
        RADAR
      </div>
    </div>
  );
}

function GaryDot({ x, y, distanceMeters }: { x: number; y: number; distanceMeters: number }) {
  const pulseSpeed = distanceMeters < 8 ? '0.3s' : distanceMeters < 45 ? '0.8s' : '2s';

  return (
    <div
      className="absolute"
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#ff2200',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 8px #ff2200',
        animation: `pulseRed ${pulseSpeed} ease-in-out infinite`,
      }}
    />
  );
}
