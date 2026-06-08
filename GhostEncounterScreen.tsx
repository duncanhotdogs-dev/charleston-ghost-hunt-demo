import { useEffect, useRef, useState } from 'react';

interface Props {
  onCaptured: () => void;
  onClose: () => void;
}

export default function GhostEncounterScreen({ onCaptured, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [, setPhase] = useState<'camera' | 'scan'>('camera');
  const [showDialogue, setShowDialogue] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [flashOverlay, setFlashOverlay] = useState(false);
  const [ghostVanish, setGhostVanish] = useState(false);
  const scanAnimRef = useRef<number | null>(null);
  const scanStartRef = useRef<number>(0);
  const scanDurationMs = 3000;

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    // Sequence
    const t1 = setTimeout(() => setShowDialogue(true), 500);
    const t2 = setTimeout(() => setShowAttribution(true), 2500);
    const t3 = setTimeout(() => { setPhase('scan'); setShowScan(true); }, 3200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  function startScan() {
    setScanning(true);
    scanStartRef.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - scanStartRef.current;
      const progress = Math.min(elapsed / scanDurationMs, 1);
      setScanProgress(progress);
      if (progress < 1) {
        scanAnimRef.current = requestAnimationFrame(animate);
      } else {
        completeScan();
      }
    };
    scanAnimRef.current = requestAnimationFrame(animate);
  }

  function cancelScan() {
    if (!scanning) return;
    setScanning(false);
    setScanProgress(0);
    if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
    navigator.vibrate?.(50);
  }

  function completeScan() {
    setScanning(false);
    setFlashOverlay(true);
    navigator.vibrate?.([100, 50, 200]);
    setGhostVanish(true);
    setTimeout(() => {
      setFlashOverlay(false);
      streamRef.current?.getTracks().forEach(t => t.stop());
      onCaptured();
    }, 800);
  }

  // SVG circle circumference: 2 * PI * 45 = ~283
  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference * (1 - scanProgress);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden" style={{ background: '#000' }}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />

      {/* Dark overlay for when no camera */}
      <div className="absolute inset-0" style={{ background: 'rgba(10,3,3,0.3)' }} />

      {/* Ghost entity */}
      {!ghostVanish && (
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            transition: ghostVanish ? 'transform 0.5s ease-in, opacity 0.5s ease-in' : undefined,
          }}
        >
          <div
            className="ghost-encounter"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
            }}
          >
            <GhostSVG />
          </div>
        </div>
      )}

      {/* Flash overlay */}
      {flashOverlay && (
        <div
          className="absolute inset-0 z-50 transition-opacity duration-300"
          style={{ background: 'white', opacity: flashOverlay ? 1 : 0 }}
        />
      )}

      {/* Info panel */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-6 py-6"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div className="font-cinzel text-base tracking-widest text-primary text-center mb-1">
          GARY THE GREETER
        </div>
        <div className="font-garamond italic text-bone-dim text-center text-sm mb-3">
          The Eternal Welcome
        </div>
        {showDialogue && (
          <p className="font-garamond italic text-bone text-center text-base animate-slide-up">
            "Hello."
          </p>
        )}
        {showAttribution && (
          <p
            className="font-garamond text-xs text-center mt-1 animate-slide-up"
            style={{ color: '#b8860b' }}
          >
            — Gary the Greeter, 1947
          </p>
        )}
      </div>

      {/* Scan button */}
      {showScan && (
        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -80%)' }}
        >
          <div className="relative" style={{ width: 100, height: 100 }}>
            {/* Progress ring */}
            <svg width="100" height="100" className="absolute inset-0">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="rgba(139,0,0,0.2)"
                strokeWidth="4"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#8b0000"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="scan-ring"
                style={{
                  filter: 'drop-shadow(0 0 6px #8b0000)',
                  transition: scanning ? 'none' : 'stroke-dashoffset 0.2s ease-out',
                }}
              />
            </svg>

            {/* Button */}
            <button
              onTouchStart={startScan}
              onTouchEnd={cancelScan}
              onMouseDown={startScan}
              onMouseUp={cancelScan}
              onMouseLeave={cancelScan}
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: scanning ? 'rgba(139,0,0,0.3)' : 'rgba(20,5,5,0.85)',
                border: '2px solid rgba(139,0,0,0.6)',
                boxShadow: scanning ? '0 0 30px rgba(139,0,0,0.8)' : '0 0 15px rgba(139,0,0,0.4)',
              }}
            >
              <span className="font-cinzel text-sm tracking-widest text-bone">SCAN</span>
            </button>
          </div>
          <p className="font-garamond text-xs text-bone-dim mt-2 opacity-60">Hold to scan</p>
        </div>
      )}

      {/* Close */}
      <button
        onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose(); }}
        className="absolute top-4 right-4 z-30 font-cinzel text-xs text-bone-dim opacity-50 p-2"
      >
        ✕
      </button>
    </div>
  );
}

function GhostSVG() {
  return (
    <svg width="80" height="110" viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="45" rx="30" ry="35" fill="rgba(255,255,255,0.85)" />
      <rect x="10" y="45" width="60" height="50" fill="rgba(255,255,255,0.85)" />
      <path d="M10 95 Q20 110 30 95 Q40 80 50 95 Q60 110 70 95 L70 95 L10 95Z" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="28" cy="42" rx="8" ry="10" fill="rgba(10,3,3,0.7)" />
      <ellipse cx="52" cy="42" rx="8" ry="10" fill="rgba(10,3,3,0.7)" />
      <ellipse cx="28" cy="43" rx="5" ry="6" fill="rgba(10,3,3,0.9)" />
      <ellipse cx="52" cy="43" rx="5" ry="6" fill="rgba(10,3,3,0.9)" />
      <ellipse cx="30" cy="41" rx="2" ry="2" fill="white" opacity="0.8" />
      <ellipse cx="54" cy="41" rx="2" ry="2" fill="white" opacity="0.8" />
      <path d="M32 62 Q40 68 48 62" stroke="rgba(10,3,3,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
