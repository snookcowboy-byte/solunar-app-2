import { TideData, UnitSystem } from '../types';

export interface NOAAStation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  waterBody: string;
}

export const NOAA_STATIONS: NOAAStation[] = [
  {
    id: '8725520',
    name: 'Fort Myers (Caloosahatchee River)',
    state: 'FL',
    lat: 26.6478,
    lon: -81.8711,
    waterBody: 'Caloosahatchee River / Gulf of Mexico',
  },
  {
    id: '8725110',
    name: 'Fort Myers Beach',
    state: 'FL',
    lat: 26.4520,
    lon: -81.9481,
    waterBody: 'San Carlos Bay / Gulf of Mexico',
  },
  {
    id: '8725577',
    name: 'Cape Coral Bridge',
    state: 'FL',
    lat: 26.5667,
    lon: -81.9333,
    waterBody: 'Caloosahatchee River',
  },
  {
    id: '8726520',
    name: 'St. Petersburg',
    state: 'FL',
    lat: 27.7603,
    lon: -82.6269,
    waterBody: 'Tampa Bay',
  },
  {
    id: '8726724',
    name: 'Clearwater Beach',
    state: 'FL',
    lat: 27.9783,
    lon: -82.8317,
    waterBody: 'Gulf of Mexico',
  },
  {
    id: '8724580',
    name: 'Key West',
    state: 'FL',
    lat: 24.5508,
    lon: -81.8081,
    waterBody: 'Florida Straits / Gulf',
  },
  {
    id: '8723214',
    name: 'Virginia Key (Miami)',
    state: 'FL',
    lat: 25.7314,
    lon: -80.1619,
    waterBody: 'Biscayne Bay / Atlantic Ocean',
  },
  {
    id: '8722670',
    name: 'Lake Worth Pier (West Palm Beach)',
    state: 'FL',
    lat: 26.6133,
    lon: -80.0333,
    waterBody: 'Atlantic Ocean',
  },
  {
    id: '8720030',
    name: 'Fernandina Beach',
    state: 'FL',
    lat: 30.6717,
    lon: -81.4650,
    waterBody: 'Amelia River / Atlantic Ocean',
  },
  {
    id: '8729108',
    name: 'Panama City',
    state: 'FL',
    lat: 30.1522,
    lon: -85.6669,
    waterBody: 'St. Andrews Bay / Gulf',
  },
  {
    id: '8729840',
    name: 'Pensacola',
    state: 'FL',
    lat: 30.4044,
    lon: -87.2111,
    waterBody: 'Pensacola Bay / Gulf',
  },
  {
    id: '8771450',
    name: 'Galveston Pier 21',
    state: 'TX',
    lat: 29.3100,
    lon: -94.7933,
    waterBody: 'Galveston Bay / Gulf',
  },
  {
    id: '8518750',
    name: 'The Battery',
    state: 'NY',
    lat: 40.7006,
    lon: -74.0142,
    waterBody: 'New York Harbor / Atlantic',
  },
  {
    id: '8443970',
    name: 'Boston',
    state: 'MA',
    lat: 42.3539,
    lon: -71.0503,
    waterBody: 'Boston Harbor',
  },
  {
    id: '9414290',
    name: 'San Francisco',
    state: 'CA',
    lat: 37.8067,
    lon: -122.4650,
    waterBody: 'San Francisco Bay / Pacific',
  },
  {
    id: '9410170',
    name: 'San Diego',
    state: 'CA',
    lat: 32.7142,
    lon: -117.1736,
    waterBody: 'San Diego Bay',
  },
  {
    id: '9447130',
    name: 'Seattle',
    state: 'WA',
    lat: 47.6019,
    lon: -122.3392,
    waterBody: 'Puget Sound',
  },
];

/**
 * Calculates distance in kilometers between two coordinates using Haversine formula
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest NOAA tide station within a reasonable distance (~220 km)
 */
export function findNearestNOAAStation(lat: number, lon: number): NOAAStation | null {
  let nearest: NOAAStation | null = null;
  let minDistance = Infinity;

  for (const station of NOAA_STATIONS) {
    const dist = getDistanceKm(lat, lon, station.lat, station.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  // If closest station is within 220km, return it; otherwise null
  if (nearest && minDistance <= 220) {
    return nearest;
  }
  return null;
}

interface NOAAPrediction {
  t: string; // "YYYY-MM-DD HH:MM"
  v: string; // height value
  type?: 'H' | 'L'; // High or Low tide
}

/**
 * Fetches real official NOAA CO-OPS predictions and live water level gauge readings.
 * Supports CORS directly from the official open API (api.tidesandcurrents.noaa.gov).
 */
export async function fetchNOAATideData(
  station: NOAAStation,
  isMetric: boolean,
  currentDate: Date = new Date()
): Promise<TideData | null> {
  const units = isMetric ? 'metric' : 'english';
  const unitLabel = isMetric ? 'meters' : 'feet';

  // Format YYYYMMDD for NOAA API
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Fetch hourly predictions, hilo milestones, and latest live observed water level
    const [hourlyRes, hiloRes, waterLevelRes] = await Promise.allSettled([
      fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&end_date=${dateStr}&station=${station.id}&product=predictions&datum=MLLW&time_zone=lst_ldt&units=${units}&interval=60&format=json`,
        { signal: controller.signal }
      ),
      fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&end_date=${dateStr}&station=${station.id}&product=predictions&datum=MLLW&time_zone=lst_ldt&units=${units}&interval=hilo&format=json`,
        { signal: controller.signal }
      ),
      fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=${station.id}&product=water_level&datum=MLLW&time_zone=lst_ldt&units=${units}&format=json`,
        { signal: controller.signal }
      ),
    ]);

    clearTimeout(timeoutId);

    if (hourlyRes.status !== 'fulfilled' || !hourlyRes.value.ok) {
      return null;
    }

    const hourlyData = await hourlyRes.value.json();
    if (!hourlyData || !Array.isArray(hourlyData.predictions) || hourlyData.predictions.length === 0) {
      return null;
    }

    const predictions: NOAAPrediction[] = hourlyData.predictions;

    // Check Hi/Lo milestones
    let hiloPredictions: NOAAPrediction[] = [];
    if (hiloRes.status === 'fulfilled' && hiloRes.value.ok) {
      const hiloData = await hiloRes.value.json();
      if (hiloData && Array.isArray(hiloData.predictions)) {
        hiloPredictions = hiloData.predictions;
      }
    }

    // Check latest verified water level sensor
    let observedWaterLevel: number | undefined = undefined;
    let observedWaterLevelHour: number | undefined = undefined;
    if (waterLevelRes.status === 'fulfilled' && waterLevelRes.value.ok) {
      try {
        const wlData = await waterLevelRes.value.json();
        if (wlData && Array.isArray(wlData.data) && wlData.data.length > 0) {
          const val = parseFloat(wlData.data[0].v);
          if (!isNaN(val)) {
            observedWaterLevel = Math.round(val * 100) / 100;
          }
          if (wlData.data[0].t) {
            const timePart = wlData.data[0].t.split(' ')[1];
            if (timePart) {
              const [gh, gm] = timePart.split(':').map(Number);
              if (!isNaN(gh) && !isNaN(gm)) {
                observedWaterLevelHour = gh + gm / 60;
              }
            }
          }
        }
      } catch {
        // Optional water level parse ignore
      }
    }

    const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
    const currentHourFloat = currentDate.getHours() + currentDate.getMinutes() / 60;

    // Build 24-hour wave points from NOAA hourly predictions
    const hourlyWavePoints = predictions.map((p) => {
      const parts = p.t.split(' ')[1].split(':');
      const hour = parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
      const height = parseFloat(p.v);
      const displayHours = parseInt(parts[0], 10) % 12 === 0 ? 12 : parseInt(parts[0], 10) % 12;
      const period = parseInt(parts[0], 10) >= 12 ? 'PM' : 'AM';
      return {
        hour,
        timeLabel: `${displayHours}:${parts[1]} ${period}`,
        height: Math.round(height * 100) / 100,
        isPast: hour < currentHourFloat,
      };
    });

    // Find predicted water level by interpolating between nearest hourly predictions for currentDate
    let predictedHeight = 1.5;
    const prevPoint = [...hourlyWavePoints].reverse().find((p) => p.hour <= currentHourFloat);
    const nextPoint = hourlyWavePoints.find((p) => p.hour > currentHourFloat);

    if (prevPoint && nextPoint && nextPoint.hour !== prevPoint.hour) {
      const ratio = (currentHourFloat - prevPoint.hour) / (nextPoint.hour - prevPoint.hour);
      predictedHeight = prevPoint.height + ratio * (nextPoint.height - prevPoint.height);
    } else if (prevPoint) {
      predictedHeight = prevPoint.height;
    } else if (nextPoint) {
      predictedHeight = nextPoint.height;
    }
    predictedHeight = Math.round(predictedHeight * 100) / 100;

    // Use live gauge reading if close in time (within ~1.5h of active simulated time), otherwise use predicted height for this hour
    let currentHeight = predictedHeight;
    if (observedWaterLevel !== undefined) {
      if (observedWaterLevelHour === undefined || Math.abs(currentHourFloat - observedWaterLevelHour) <= 1.5) {
        currentHeight = observedWaterLevel;
      }
    }
    currentHeight = Math.round(currentHeight * 100) / 100;

    // Determine next milestone (High Tide vs Low Tide)
    let nextEventType: 'High Tide' | 'Low Tide' = 'High Tide';
    let nextEventTime = '05:30 PM';
    let minutesToNextEvent = 120;
    let isRising = true;

    if (hiloPredictions.length > 0) {
      // Find upcoming high or low
      const upcoming = hiloPredictions.find((item) => {
        const [h, m] = item.t.split(' ')[1].split(':').map(Number);
        const itemMinutes = h * 60 + m;
        return itemMinutes >= nowMinutes;
      });

      if (upcoming) {
        const [h, m] = upcoming.t.split(' ')[1].split(':').map(Number);
        const itemMinutes = h * 60 + m;
        minutesToNextEvent = Math.max(0, itemMinutes - nowMinutes);
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const period = h >= 12 ? 'PM' : 'AM';
        nextEventTime = `${displayH}:${String(m).padStart(2, '0')} ${period} (${upcoming.v} ${unitLabel})`;
        nextEventType = upcoming.type === 'H' ? 'High Tide' : 'Low Tide';
        isRising = upcoming.type === 'H';
      } else {
        // Next day's first milestone
        const first = hiloPredictions[0];
        const [h, m] = first.t.split(' ')[1].split(':').map(Number);
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const period = h >= 12 ? 'PM' : 'AM';
        nextEventTime = `Tomorrow ${displayH}:${String(m).padStart(2, '0')} ${period}`;
        nextEventType = first.type === 'H' ? 'High Tide' : 'Low Tide';
        isRising = first.type === 'H';
        minutesToNextEvent = 1440 - nowMinutes + (h * 60 + m);
      }
    } else {
      // Determine rising or falling from hourly points
      const prevPoint = [...hourlyWavePoints].reverse().find((p) => p.hour <= currentHourFloat);
      const nextPoint = hourlyWavePoints.find((p) => p.hour > currentHourFloat);
      if (prevPoint && nextPoint) {
        isRising = nextPoint.height >= prevPoint.height;
        nextEventType = isRising ? 'High Tide' : 'Low Tide';
      }
    }

    return {
      currentHeight,
      unit: unitLabel,
      rawHeightMeters: isMetric ? currentHeight : Number((currentHeight / 3.28084).toFixed(2)),
      nextEventType,
      nextEventTime,
      minutesToNextEvent,
      tidePhaseRad: 0,
      isRising,
      tideCategory: 'Normal Intermediate Tide',
      hourlyWavePoints,
      stationName: `NOAA Station ${station.id} – ${station.name}`,
      stationId: station.id,
      source: 'NOAA Verified Prediction & Sensor Gauge',
      observedWaterLevel,
    };
  } catch {
    return null;
  }
}
