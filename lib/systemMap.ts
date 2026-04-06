import type { SystemMapData } from "./types";

interface Station {
  id: string;
  name: string;
  color: number;
  zone1: number;
  zone2: number;
  zone3: number;
  connections: string[];
}

interface Route {
  id: string;
  name: string;
  color: number;
  number: string;
  type: string;
  circularState: string;
  hidden: boolean;
  stations: string[];
  durations: number[];
  depots: string[];
}

interface SystemMapApiResponse {
  code: number;
  currentTime: number;
  text: string;
  version: number;
  data: {
    stations: Station[];
    routes: Route[];
  };
}

export function parseMtrName(rawName: string): string {
  const relevantPart = rawName.split("||")[0];
  const parts = relevantPart
    .split("|")
    .filter((part) => part.trim() && !/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(part))
    .map((part) => part.trim());
  return parts.join(" ");
}

export async function fetchSystemMapData(
  baseUrl: string
): Promise<SystemMapData> {
  const url = `${baseUrl}/mtr/api/map/stations-and-routes?dimension=0`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch system map data. Status: ${response.status}`
    );
  }

  const json: SystemMapApiResponse = await response.json();

  if (json.code !== 200) {
    throw new Error(`API returned an error: ${json.text}`);
  }

  const stationNames = json.data.stations
    .map((s) => parseMtrName(s.name))
    .filter(Boolean);
  const routeNames = json.data.routes
    .map((r) => parseMtrName(r.name))
    .filter(Boolean);

  const stationIdToFullName = new Map<string, string>();
  const stationIdToName: Record<string, string> = {};
  const stationNameToId: Record<string, string> = {};

  for (const station of json.data.stations) {
    const mtrName = parseMtrName(station.name);
    stationIdToFullName.set(station.id, station.name);
    if (stationNameToId.hasOwnProperty(mtrName)) {
      // Well we have a duplicate, use full name instead of just mtrName
      // Also re-connect the previous entry
      const prevStationId = stationNameToId[mtrName];
      stationIdToName[prevStationId] = stationIdToFullName.get(prevStationId)!;
      stationIdToName[station.id] = station.name;
      stationNameToId[stationIdToFullName.get(prevStationId)!] = prevStationId;
      stationNameToId[station.name] = station.id;
    } else {
      stationIdToName[station.id] = mtrName;
      stationNameToId[parseMtrName(station.name)] = station.id;
    }
  }

  return {
    stationNames: [...new Set(stationNames)],
    routeNames: [...new Set(routeNames)],
    stationIds: [...Object.keys(stationIdToName)],
    stationNameToId,
    stationIdToName,
  };
}
