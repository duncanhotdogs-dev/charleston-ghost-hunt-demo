import { useEffect, useState } from 'react';

export function useCompass() {
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const alpha = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ?? e.alpha ?? 0;
      setHeading(alpha);
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  return heading;
}
