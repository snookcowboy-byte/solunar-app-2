import { LocationData } from '../types';

// Fast built-in coordinate dictionary for instant offline resolution of popular ZIPs & world cities
const PRELOADED_LOCATIONS: Record<string, { name: string; lat: number; lon: number; country: string }> = {
  // Key US ZIP codes
  '90210': { name: 'Beverly Hills, CA', lat: 34.0901, lon: -118.4065, country: 'USA' },
  '33901': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  '33907': { name: 'Fort Myers, FL 33907', lat: 26.5626, lon: -81.8687, country: 'USA' },
  '33908': { name: 'Fort Myers, FL 33908', lat: 26.5050, lon: -81.8900, country: 'USA' },
  '33919': { name: 'Fort Myers, FL 33919', lat: 26.5490, lon: -81.9010, country: 'USA' },
  '33931': { name: 'Fort Myers Beach, FL 33931', lat: 26.4520, lon: -81.9481, country: 'USA' },
  '10001': { name: 'New York, NY', lat: 40.7501, lon: -73.9996, country: 'USA' },
  '33101': { name: 'Miami, FL', lat: 25.7743, lon: -80.1937, country: 'USA' },
  '94102': { name: 'San Francisco, CA', lat: 37.7786, lon: -122.4212, country: 'USA' },
  '98101': { name: 'Seattle, WA', lat: 47.6101, lon: -122.3344, country: 'USA' },
  '60601': { name: 'Chicago, IL', lat: 41.8853, lon: -87.6225, country: 'USA' },
  '78701': { name: 'Austin, TX', lat: 30.2711, lon: -97.7437, country: 'USA' },
  '02108': { name: 'Boston, MA', lat: 42.3588, lon: -71.0638, country: 'USA' },
  '80202': { name: 'Denver, CO', lat: 39.7541, lon: -104.9978, country: 'USA' },
  '96815': { name: 'Honolulu, HI', lat: 21.2762, lon: -157.8222, country: 'USA' },
  '99501': { name: 'Anchorage, AK', lat: 61.2181, lon: -149.9003, country: 'USA' },
  '92101': { name: 'San Diego, CA', lat: 32.7157, lon: -117.1611, country: 'USA' },
  '70112': { name: 'New Orleans, LA', lat: 29.9546, lon: -90.0751, country: 'USA' },
  '97201': { name: 'Portland, OR', lat: 45.5118, lon: -122.6843, country: 'USA' },
  '85001': { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.0740, country: 'USA' },

  // World Cities and US coastal towns
  'ft meyers': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'ft meyers fl': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'fort myers': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'fort myers fl': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'ft myers': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'ft myers fl': { name: 'Fort Myers, FL', lat: 26.6406, lon: -81.8723, country: 'USA' },
  'fort myers beach': { name: 'Fort Myers Beach, FL', lat: 26.4520, lon: -81.9481, country: 'USA' },
  'ft myers beach': { name: 'Fort Myers Beach, FL', lat: 26.4520, lon: -81.9481, country: 'USA' },
  'naples': { name: 'Naples, FL', lat: 26.1420, lon: -81.7948, country: 'USA' },
  'tampa': { name: 'Tampa, FL', lat: 27.9506, lon: -82.4572, country: 'USA' },
  'st petersburg': { name: 'St. Petersburg, FL', lat: 27.7676, lon: -82.6403, country: 'USA' },
  'key west': { name: 'Key West, FL', lat: 24.5551, lon: -81.7800, country: 'USA' },
  'miami': { name: 'Miami, FL', lat: 25.7617, lon: -80.1918, country: 'USA' },
  'los angeles': { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437, country: 'USA' },
  'new york': { name: 'New York, NY', lat: 40.7128, lon: -74.0060, country: 'USA' },
  'london': { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  'paris': { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  'tokyo': { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'sydney': { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'singapore': { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  'dubai': { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'toronto': { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada' },
  'honolulu': { name: 'Honolulu, HI', lat: 21.3069, lon: -157.8583, country: 'USA' },
  'vancouver': { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada' },
  'reykjavik': { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, country: 'Iceland' },
  'cape town': { name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'South Africa' },
  'auckland': { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand' },
};

export function estimateTimezoneOffsetHours(lon: number, lat?: number): number {
  // Check North America daylight savings offsets (summer / autumn)
  if (lat && lat >= 24 && lat <= 50) {
    if (lon >= -85 && lon <= -65) return -4; // US Eastern (EDT, Fort Myers/Miami/NY)
    if (lon >= -103 && lon < -85) return -5; // US Central (CDT, Chicago/Austin)
    if (lon >= -114 && lon < -103) return -6; // US Mountain (MDT, Denver)
    if (lon >= -125 && lon < -114) return -7; // US Pacific (PDT, LA/SF/Seattle)
    if (lon >= -170 && lon < -130) return -8; // Alaska (AKDT)
  }
  if (lat && lat >= 18 && lat <= 23 && lon >= -162 && lon <= -154) {
    return -10; // Hawaii (HST)
  }
  // Fallback to geographical meridian estimate
  return Math.round(lon / 15);
}

/**
 * Resolves a human-friendly string (ZIP code, City, or Name) into coordinates.
 * Faithful to python LunarMetabolicTideEngine.resolve_location while providing
 * instant cached lookups and graceful live Nominatim fallback.
 */
export async function resolveLocation(inputString: string): Promise<{ success: boolean; data?: LocationData; error?: string }> {
  const trimmed = inputString.trim();
  if (!trimmed) {
    return { success: false, error: 'Please enter a valid ZIP code or City name.' };
  }

  const normalized = trimmed.toLowerCase();

  // 1. Instant check in preloaded dictionary
  if (PRELOADED_LOCATIONS[normalized]) {
    const loc = PRELOADED_LOCATIONS[normalized];
    return {
      success: true,
      data: {
        input: trimmed,
        resolvedName: loc.name,
        latitude: loc.lat,
        longitude: loc.lon,
        country: loc.country,
        timezoneOffsetHours: estimateTimezoneOffsetHours(loc.lon, loc.lat),
      }
    };
  }

  // 2. Direct coordinate parse (e.g. "25.76, -80.19")
  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const coordMatch = trimmed.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return {
        success: true,
        data: {
          input: trimmed,
          resolvedName: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          latitude: lat,
          longitude: lon,
          timezoneOffsetHours: estimateTimezoneOffsetHours(lon, lat),
        }
      };
    }
  }

  // 3. Online OpenStreetMap Nominatim request (coarse approximate geolocation)
  try {
    const query = encodeURIComponent(trimmed);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        // Extract generic, safe city/region name like Python app.py
        const address = item.address || {};
        const city = address.city || address.town || address.village || address.municipality || address.county || item.display_name.split(',')[0];
        const stateOrCountry = address.state || address.country || '';
        const safeName = stateOrCountry ? `${city}, ${stateOrCountry}` : city;

        return {
          success: true,
          data: {
            input: trimmed,
            resolvedName: safeName,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: address.country,
            timezoneOffsetHours: estimateTimezoneOffsetHours(parseFloat(item.lon), parseFloat(item.lat)),
          }
        };
      }
    }
  } catch {
    // Network or timeout failure
  }

  // 4. Fallback: If it's a 5-digit US ZIP, approximate sensible latitude/longitude
  const zipMatch = trimmed.match(/^(\d{5})$/);
  if (zipMatch) {
    const zipNum = parseInt(zipMatch[1], 10);
    // Rough geographic interpolation across US ZIP zones
    let approxLat = 38.0;
    let approxLon = -97.0;
    let approxRegion = `US ZIP Zone ${Math.floor(zipNum / 10000)}`;

    if (zipNum < 10000) { approxLat = 42.0; approxLon = -71.5; approxRegion = 'New England Zone'; }
    else if (zipNum < 20000) { approxLat = 40.8; approxLon = -74.0; approxRegion = 'NY/NJ Zone'; }
    else if (zipNum < 30000) { approxLat = 38.5; approxLon = -77.5; approxRegion = 'Mid-Atlantic Zone'; }
    else if (zipNum < 40000) { approxLat = 32.5; approxLon = -83.5; approxRegion = 'Southeast Zone'; }
    else if (zipNum < 50000) { approxLat = 40.0; approxLon = -83.0; approxRegion = 'Ohio/Great Lakes Zone'; }
    else if (zipNum < 60000) { approxLat = 44.0; approxLon = -90.0; approxRegion = 'Upper Midwest Zone'; }
    else if (zipNum < 70000) { approxLat = 39.0; approxLon = -90.5; approxRegion = 'Central Plains Zone'; }
    else if (zipNum < 80000) { approxLat = 31.0; approxLon = -97.0; approxRegion = 'Texas/South Central Zone'; }
    else if (zipNum < 90000) { approxLat = 39.5; approxLon = -106.0; approxRegion = 'Mountain West Zone'; }
    else { approxLat = 36.0; approxLon = -119.5; approxRegion = 'Pacific West Zone'; }

    return {
      success: true,
      data: {
        input: trimmed,
        resolvedName: `ZIP ${trimmed} (${approxRegion})`,
        latitude: approxLat,
        longitude: approxLon,
        country: 'USA',
        timezoneOffsetHours: estimateTimezoneOffsetHours(approxLon, approxLat),
      }
    };
  }

  return {
    success: false,
    error: `Location "${trimmed}" not found. Try a ZIP (e.g. 90210, 33101) or City (e.g. Miami, London, Tokyo).`
  };
}
