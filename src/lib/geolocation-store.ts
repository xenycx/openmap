import { writable } from 'svelte/store';

export const userLocation = writable<[number, number] | null>(null);
export const geolocating = writable<boolean>(false);
export const geoError = writable<string | null>(null);

function isValidCoord(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
}

export function locateUser(): void {
  if (!navigator.geolocation) {
    geoError.set('Geolocation is not supported by your browser');
    return;
  }

  geolocating.set(true);
  geoError.set(null);
  console.log('[Geolocation] Starting location request...');

  // Try high accuracy first, fall back to low accuracy on timeout
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log('[Geolocation] High-accuracy success:', lat, lon);
      if (isValidCoord(lat, lon)) {
        userLocation.set([lon, lat]);
        geolocating.set(false);
      } else {
        console.log('[Geolocation] High-accuracy returned invalid coords, trying fallback...');
        ipFallback();
      }
    },
    (firstError) => {
      console.log('[Geolocation] High-accuracy failed:', firstError.code, firstError.message);
      // If high-accuracy failed (common on laptops), retry with low accuracy
      if (firstError.code === firstError.TIMEOUT || firstError.code === firstError.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log('[Geolocation] Low-accuracy success:', lat, lon);
            if (isValidCoord(lat, lon)) {
              userLocation.set([lon, lat]);
              geolocating.set(false);
            } else {
              console.log('[Geolocation] Low-accuracy returned invalid coords, trying fallback...');
              ipFallback();
            }
          },
          (error) => {
            console.log('[Geolocation] Low-accuracy also failed:', error.code, error.message);
            handleGeoError(error);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
        );
      } else {
        handleGeoError(firstError);
      }
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
  );
}

function handleGeoError(error: GeolocationPositionError): void {
  // If permission was explicitly denied, don't try IP fallback
  if (error.code === error.PERMISSION_DENIED) {
    console.log('[Geolocation] Permission denied, not trying IP fallback');
    geoError.set('ლოკაციის ნებართვა უარყოფილია');
    geolocating.set(false);
    return;
  }

  // For POSITION_UNAVAILABLE or TIMEOUT, try IP-based fallback
  console.log('[Geolocation] Browser geolocation failed, trying IP-based fallback...');
  ipFallback();
}

async function ipFallback(): Promise<void> {
  try {
    // Try multiple free IP geolocation APIs as fallback
    const apis = [
      'https://ipapi.co/json/',
      'https://ipwho.is/',
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) continue;
        const data = await response.json();

        const lat = data.latitude ?? data.lat;
        const lon = data.longitude ?? data.lon;

        if (typeof lat === 'number' && typeof lon === 'number' && lat !== 0 && lon !== 0) {
          console.log('[Geolocation] IP fallback success:', lat, lon, '(from', api, ')');
          userLocation.set([lon, lat]);
          geolocating.set(false);
          return;
        }
      } catch {
        continue; // Try next API
      }
    }

    // All APIs failed
    console.log('[Geolocation] All IP fallback APIs failed');
    geoError.set('ლოკაცია ვერ მოიძებნა — ჩართე Location Services');
    geolocating.set(false);
  } catch {
    geoError.set('ლოკაცია ვერ მოიძებნა');
    geolocating.set(false);
  }
}
