import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { haversineDistance } from '../utils/haversine';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCompass } from '../hooks/useCompass';
import Radar from '../components/Radar';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

const GARY = { lat: 32.7833, lng: -79.9407 };
const CHARLESTON_CENTER: [number, number] = [-79.9311, 32.7765];
const ALERT_RADIUS_M = 45;
const CAPTURE_RADIUS_M = 6;

// Ids for every nav-related Mapbox layer / source — kept in one place so
// the purge loop and individual removes stay in sync.
const NAV_LAYERS  = ['gary-radius-fill', 'gary-radius-stroke', 'nav-line-layer'];
const NAV_SOURCES = ['gary-radius', 'nav-line'];

// Completely remove nav layers/sources if they somehow exist already.
function purgeNavAssets(map: mapboxgl.Map) {
  NAV_LAYERS.forEach(id  => { try { if (map.getLayer(id))   map.removeLayer(id);   } catch (_) {} });
  NAV_SOURCES.forEach(id => { try { if (map.getSource(id))  map.removeSource(id);  } catch (_) {} });
}

// Build a GeoJSON polygon approximating a metre-radius circle.
function makeCirclePolygon(lng: number, lat: number, radiusM: number, steps = 64) {
  const latR = radiusM / 110540;
  const lngR = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    coords.push([lng + lngR * Math.cos(a), lat + latR * Math.sin(a)]);
  }
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
    properties: {},
  };
}

function makeLineFeature(from: [number, number], to: [number, number]) {
  return {
    type: 'Feature' as const,
    geometry: { type: 'LineString' as const, coordinates: [from, to] },
    properties: {},
  };
}

interface Props {
  locationGranted: boolean;
  onCapture: () => void;
  releaseGhosts: boolean;
  onReleaseAnimationDone: () => void;
  garyCaptured: boolean;
}

type Zone = 'none' | 'outer' | 'inner';

export default function MapScreen({
  locationGranted, onCapture, releaseGhosts, onReleaseAnimationDone, garyCaptured,
}: Props) {
  const mapContainer   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<mapboxgl.Map | null>(null);
  const mapReadyRef    = useRef(false);
  const playerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  // True only while the nav assets actually exist on the map.
  const navActiveRef   = useRef(false);

  const [navMode,      setNavMode]      = useState(false);
  const navModeRef = useRef(false);

  const [zone,         setZone]         = useState<Zone>('none');
  const prevZoneRef = useRef<Zone>('none');

  const [distance,     setDistance]     = useState<number | null>(null);
  const distanceRef = useRef<number | null>(null);

  const [showCapture,  setShowCapture]  = useState(false);
  const [showGarySheet, setShowGarySheet] = useState(false);
  const [sheetDistFt,  setSheetDistFt]  = useState<number | null>(null);

  const { position, error: geoError } = useGeolocation(locationGranted);
  const compassHeading = useCompass();

  // Mirror state into refs so effects always read fresh values.
  useEffect(() => { navModeRef.current  = navMode;   }, [navMode]);
  useEffect(() => { distanceRef.current = distance;  }, [distance]);

  // ── Build the map ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: CHARLESTON_CENTER,
      zoom: 12,
      interactive: true,
    });
    mapRef.current = map;

    map.on('load', () => {
      // Safety net: if any stale circle/radius assets exist from a prior
      // render cycle (e.g. React StrictMode double-mount), wipe them now.
      purgeNavAssets(map);

      mapReadyRef.current = true;

      // ── ONLY Gary's skull marker. No circle, no line, nothing else. ──
      addGaryMarker(map);
    });

    return () => {
      map.remove();
      mapRef.current    = null;
      mapReadyRef.current = false;
      navActiveRef.current = false;
    };
  }, []);

  // ── Gary skull marker — NO pulsing ring div, just the SVG ──────────────────
  function addGaryMarker(map: mapboxgl.Map) {
    // A plain wrapper — no background circle, no CSS ring.
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:52px;height:52px;cursor:pointer;position:relative;';

    wrap.innerHTML = `
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none"
        style="filter:drop-shadow(0 0 10px #8b0000) drop-shadow(0 0 22px #8b0000);display:block;">
        <ellipse cx="32" cy="28" rx="20" ry="22" fill="#8b0000"/>
        <ellipse cx="32" cy="28" rx="18" ry="20" fill="#1a0505"/>
        <ellipse cx="23" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9"/>
        <ellipse cx="41" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9"/>
        <ellipse cx="23" cy="28" rx="4" ry="5" fill="#0a0303"/>
        <ellipse cx="41" cy="28" rx="4" ry="5" fill="#0a0303"/>
        <rect x="26" y="44" width="4" height="8" rx="1" fill="#8b0000"/>
        <rect x="34" y="44" width="4" height="8" rx="1" fill="#8b0000"/>
        <rect x="24" y="44" width="16" height="3" rx="1" fill="#8b0000"/>
        <path d="M32 36 L28 44 L36 44 Z" fill="#8b0000"/>
      </svg>
    `;

    const onTap = (e: Event) => { e.stopPropagation(); setShowGarySheet(true); };
    wrap.addEventListener('click', onTap);
    wrap.addEventListener('touchend', (e) => { e.preventDefault(); onTap(e); }, { passive: false });

    new mapboxgl.Marker({ element: wrap, anchor: 'center' })
      .setLngLat([GARY.lng, GARY.lat])
      .addTo(map);
  }

  // ── Add nav layers (only called after START HUNT) ───────────────────────────
  function addNavLayers(map: mapboxgl.Map, playerLng: number, playerLat: number) {
    // Always purge first — guarantees no duplicate source/layer error.
    purgeNavAssets(map);

    // Gary 45-metre alert radius — GeoJSON polygon so it's geographically exact.
    map.addSource('gary-radius', {
      type: 'geojson',
      data: makeCirclePolygon(GARY.lng, GARY.lat, ALERT_RADIUS_M),
    });
    map.addLayer({
      id: 'gary-radius-fill',
      type: 'fill',
      source: 'gary-radius',
      paint: {
        'fill-color': 'rgba(139,0,0,0.15)',
        'fill-opacity': 1,
      },
    });
    map.addLayer({
      id: 'gary-radius-stroke',
      type: 'line',
      source: 'gary-radius',
      paint: {
        'line-color': 'rgba(139,0,0,0.8)',
        'line-width': 2,
        'line-dasharray': [3, 2],
      },
    });

    // Dashed red navigation line from player to Gary.
    map.addSource('nav-line', {
      type: 'geojson',
      data: makeLineFeature([playerLng, playerLat], [GARY.lng, GARY.lat]),
    });
    map.addLayer({
      id: 'nav-line-layer',
      type: 'line',
      source: 'nav-line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#8b0000',
        'line-width': 2.5,
        'line-opacity': 0.7,
        'line-dasharray': [3, 4],
      },
    });

    navActiveRef.current = true;
  }

  // ── Remove all nav layers and sources (cancel / release) ───────────────────
  function removeNavLayers(map: mapboxgl.Map) {
    purgeNavAssets(map);
    navActiveRef.current = false;
  }

  // ── Update the dashed line endpoint as player moves ─────────────────────────
  function updateLine(map: mapboxgl.Map, playerLng: number, playerLat: number) {
    if (!navActiveRef.current) return;
    const src = map.getSource('nav-line') as mapboxgl.GeoJSONSource | undefined;
    src?.setData(makeLineFeature([playerLng, playerLat], [GARY.lng, GARY.lat]));
  }

  // ── Lantern player marker ───────────────────────────────────────────────────
  function buildLanternEl(): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = 'width:28px;height:40px;pointer-events:none;';
    el.innerHTML = `
      <svg width="28" height="40" viewBox="0 0 28 40" fill="none"
        style="filter:drop-shadow(0 0 6px rgba(255,160,0,0.85));">
        <path d="M9 13 Q14 7 19 13" stroke="#b8860b" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="8" y="12" width="12" height="4" rx="1.5" fill="#b8860b"/>
        <rect x="7" y="16" width="14" height="16" rx="3" fill="rgba(255,140,0,0.12)" stroke="#b8860b" stroke-width="1.5"/>
        <line x1="14" y1="16" x2="14" y2="32" stroke="#b8860b" stroke-width="0.8" opacity="0.5"/>
        <ellipse cx="14" cy="26" rx="4.5" ry="6" fill="#ff7700" opacity="0.85"/>
        <ellipse cx="14" cy="27" rx="2.8" ry="4" fill="#ffd000" opacity="0.95"/>
        <ellipse cx="14" cy="22" rx="1.5" ry="2.5" fill="#fff8c0" opacity="0.8"/>
        <rect x="5" y="32" width="18" height="4" rx="2" fill="#b8860b"/>
      </svg>
    `;
    return el;
  }

  // ── START HUNT ──────────────────────────────────────────────────────────────
  const startNavMode = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    setShowGarySheet(false);
    setNavMode(true);
    navModeRef.current = true;

    const playerLng = position?.lng ?? CHARLESTON_CENTER[0];
    const playerLat = position?.lat ?? CHARLESTON_CENTER[1];

    addNavLayers(map, playerLng, playerLat);

    map.fitBounds(
      [[Math.min(playerLng, GARY.lng), Math.min(playerLat, GARY.lat)],
       [Math.max(playerLng, GARY.lng), Math.max(playerLat, GARY.lat)]],
      { padding: 80, duration: 1200 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  // ── CANCEL NAVIGATION ───────────────────────────────────────────────────────
  const cancelNavMode = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    navigator.vibrate?.(0);
    removeNavLayers(map);

    setNavMode(false);
    navModeRef.current = false;
    setZone('none');
    prevZoneRef.current = 'none';
    setShowCapture(false);

    map.flyTo({ center: CHARLESTON_CENTER, zoom: 12, duration: 1000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GPS position updates ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    if (!playerMarkerRef.current) {
      playerMarkerRef.current = new mapboxgl.Marker({ element: buildLanternEl(), anchor: 'bottom' })
        .setLngLat([position.lng, position.lat])
        .addTo(map);
    } else {
      playerMarkerRef.current.setLngLat([position.lng, position.lat]);
    }

    const dist = haversineDistance(position.lat, position.lng, GARY.lat, GARY.lng);
    setDistance(dist);

    if (!navModeRef.current) return;

    updateLine(map, position.lng, position.lat);

    map.fitBounds(
      [[Math.min(position.lng, GARY.lng), Math.min(position.lat, GARY.lat)],
       [Math.max(position.lng, GARY.lng), Math.max(position.lat, GARY.lat)]],
      { padding: 80, duration: 800, maxZoom: 17 }
    );

    const newZone: Zone = dist <= CAPTURE_RADIUS_M ? 'inner' : dist <= ALERT_RADIUS_M ? 'outer' : 'none';
    if (prevZoneRef.current === 'none' && newZone === 'outer') navigator.vibrate?.(300);
    prevZoneRef.current = newZone;
    setZone(newZone);
    setShowCapture(newZone === 'inner');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  // ── Interval vibration ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!navMode || distance === null) return;
    navigator.vibrate?.(0);
    const feet = distance * 3.28084;
    let ms: number, pat: number | number[];
    if      (feet <= 20)  { ms = 600;  pat = [500, 100, 500, 100, 500]; }
    else if (feet <= 50)  { ms = 2000; pat = [300, 100, 300]; }
    else if (feet <= 100) { ms = 4000; pat = [200, 100]; }
    else return;
    const id = setInterval(() => navigator.vibrate?.(pat), ms);
    return () => { clearInterval(id); navigator.vibrate?.(0); };
  }, [navMode, distance === null ? null : Math.floor((distance * 3.28084) / 15)]);

  // ── Sheet distance — refresh every 5 s ─────────────────────────────────────
  useEffect(() => {
    if (!showGarySheet) { setSheetDistFt(null); return; }
    const refresh = () => {
      const d = distanceRef.current;
      setSheetDistFt(d !== null ? Math.round(d * 3.28084) : null);
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [showGarySheet]);

  // ── Release-ghosts animation ────────────────────────────────────────────────
  useEffect(() => {
    if (!releaseGhosts || !mapContainer.current) return;
    const map = mapRef.current;
    if (map) removeNavLayers(map);
    navigator.vibrate?.(0);
    setNavMode(false);
    navModeRef.current = false;
    setZone('none');
    prevZoneRef.current = 'none';
    setShowCapture(false);

    const container = mapContainer.current;
    const ghosts: HTMLDivElement[] = [];
    for (let i = 0; i < 6; i++) {
      const g = document.createElement('div');
      const angle = (i / 6) * 2 * Math.PI;
      g.style.cssText = `position:absolute;font-size:24px;left:50%;top:50%;
        transform:translate(-50%,-50%);z-index:100;pointer-events:none;
        transition:transform 1.5s ease-out,opacity 1.5s ease-out;`;
      g.textContent = '👻';
      container.appendChild(g);
      ghosts.push(g);
      setTimeout(() => {
        g.style.transform = `translate(calc(-50% + ${Math.cos(angle) * 200}px),calc(-50% + ${Math.sin(angle) * 200}px)) scale(2)`;
        g.style.opacity = '0';
      }, 50);
    }
    setTimeout(() => { ghosts.forEach(g => g.remove()); onReleaseAnimationDone(); }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseGhosts]);

  return (
    <div className="fixed inset-0" style={{ paddingBottom: 56 }}>
      <div ref={mapContainer} className="absolute inset-0" />

      {/* ── Top bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(10,3,3,0.85)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(139,0,0,0.2)' }}
      >
        <div style={{ width: 80 }}>
          {navMode && (
            <button
              onClick={cancelNavMode}
              className="font-cinzel text-[10px] tracking-wider px-2 py-1 rounded"
              style={{ background: 'rgba(80,0,0,0.9)', color: '#f5f0e8', border: '1px solid rgba(139,0,0,0.5)' }}
            >
              ✕ CANCEL
            </button>
          )}
        </div>

        <span className="font-cinzel text-xs tracking-widest text-bone" style={{ letterSpacing: '0.2em' }}>
          CHARLESTON GHOST HUNT
        </span>

        <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: position && !geoError ? '#22c55e' : '#b8860b',
              boxShadow: `0 0 6px ${position && !geoError ? '#22c55e' : '#b8860b'}`,
            }}
          />
        </div>
      </div>

      {/* ── Demo banner ── */}
      {(!locationGranted || geoError) && (
        <div
          className="absolute left-0 right-0 z-10 text-center py-1 font-cinzel text-xs tracking-wider"
          style={{ top: 40, background: 'rgba(184,134,11,0.92)', color: '#0a0303' }}
        >
          Location denied — Demo mode active
        </div>
      )}

      {/* ── Proximity notification ── */}
      {navMode && zone !== 'none' && (
        <div
          className="absolute left-0 right-0 z-10 text-center py-2 px-4 font-cinzel text-xs tracking-wider animate-notify-slide"
          style={{
            top: 40,
            background: zone === 'inner' ? 'rgba(139,0,0,0.95)' : 'rgba(184,134,11,0.92)',
            color: zone === 'inner' ? '#f5f0e8' : '#0a0303',
          }}
        >
          {zone === 'inner' ? '⚡ GARY IS HERE — TAP TO CAPTURE' : '⚠ GHOST NEARBY — Be on the lookout'}
        </div>
      )}

      {/* ── Radar (nav mode only) ── */}
      {navMode && (
        <Radar
          playerLat={position?.lat ?? CHARLESTON_CENTER[1]}
          playerLng={position?.lng ?? CHARLESTON_CENTER[0]}
          compassHeading={compassHeading}
          garyLat={GARY.lat}
          garyLng={GARY.lng}
          distanceMeters={distance ?? 999}
          active
        />
      )}

      {/* ── CAPTURE button ── */}
      {navMode && showCapture && !garyCaptured && (
        <div className="absolute left-0 right-0 z-20 flex flex-col items-center" style={{ bottom: 72 + 20 }}>
          <button
            onClick={onCapture}
            className="btn-red text-base py-4 px-10"
            style={{ boxShadow: '0 0 40px rgba(139,0,0,0.8), 0 0 80px rgba(139,0,0,0.4)', animation: 'skulGlow 1.5s ease-in-out infinite' }}
          >
            CAPTURE GHOST
          </button>
          <button onClick={onCapture} className="font-garamond text-xs text-bone-dim mt-2 opacity-40">
            Can't trigger? Tap here
          </button>
        </div>
      )}

      {/* ── Pre-nav hint ── */}
      {!navMode && !showGarySheet && (
        <div className="absolute left-0 right-0 z-10 flex justify-center" style={{ bottom: 72 + 16 }}>
          <div
            className="font-garamond italic text-bone-dim text-sm px-4 py-2 rounded"
            style={{ background: 'rgba(10,3,3,0.75)', border: '1px solid rgba(139,0,0,0.25)' }}
          >
            Tap Gary's skull to begin
          </div>
        </div>
      )}

      {/* ── Gary bottom-sheet ── */}
      {showGarySheet && (
        <>
          <div
            className="absolute inset-0 z-20"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowGarySheet(false)}
          />
          <div
            className="absolute left-0 right-0 z-30 animate-slide-up"
            style={{
              bottom: 56,
              background: '#130606',
              border: '1px solid rgba(139,0,0,0.45)',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -8px 40px rgba(139,0,0,0.25)',
              padding: '24px 24px 32px',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(139,0,0,0.4)' }} />

            <div className="flex justify-center mb-3">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" style={{ filter: 'drop-shadow(0 0 10px #8b0000)' }}>
                <ellipse cx="32" cy="28" rx="20" ry="22" fill="#8b0000"/>
                <ellipse cx="32" cy="28" rx="18" ry="20" fill="#1a0505"/>
                <ellipse cx="23" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9"/>
                <ellipse cx="41" cy="28" rx="6" ry="7" fill="#8b0000" opacity="0.9"/>
                <ellipse cx="23" cy="28" rx="4" ry="5" fill="#0a0303"/>
                <ellipse cx="41" cy="28" rx="4" ry="5" fill="#0a0303"/>
                <rect x="26" y="44" width="4" height="8" rx="1" fill="#8b0000"/>
                <rect x="34" y="44" width="4" height="8" rx="1" fill="#8b0000"/>
                <rect x="24" y="44" width="16" height="3" rx="1" fill="#8b0000"/>
                <path d="M32 36 L28 44 L36 44 Z" fill="#8b0000"/>
              </svg>
            </div>

            <h2 className="font-cinzel text-xl text-bone text-center mb-1 tracking-wider">Gary the Greeter</h2>
            <p className="font-garamond italic text-center text-sm mb-3" style={{ color: '#b8860b' }}>
              The Eternal Welcome
            </p>
            <div className="w-20 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, #8b0000, transparent)' }} />

            <div className="text-center mb-4">
              {sheetDistFt !== null ? (
                <p className="font-garamond text-base text-bone">
                  Gary is{' '}
                  <span className="font-cinzel text-xl" style={{ color: '#f5f0e8' }}>
                    {sheetDistFt.toLocaleString()}
                  </span>
                  {' '}feet away
                </p>
              ) : (
                <p className="font-garamond italic text-bone-dim text-sm opacity-60">Calculating distance...</p>
              )}
            </div>

            <div className="flex justify-center mb-5">
              <span className="rarity-legendary">LEGENDARY</span>
            </div>

            <button
              onClick={startNavMode}
              className="btn-red w-full py-4 text-base"
              style={{ boxShadow: '0 0 25px rgba(139,0,0,0.55)' }}
            >
              START HUNT — NAVIGATE TO GARY
            </button>

            <button
              onClick={() => setShowGarySheet(false)}
              className="w-full mt-3 font-garamond text-xs text-center py-2 opacity-40 text-bone-dim"
            >
              Dismiss
            </button>
          </div>
        </>
      )}
    </div>
  );
}
