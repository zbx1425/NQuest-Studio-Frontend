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
    .filter((part) => part.trim() && !/[\u4E00-\u9FA5]/.test(part))
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

  const stationNameToId = json.data.stations.reduce(
    (acc, station) => {
      acc[parseMtrName(station.name)] = station.id;
      return acc;
    },
    {} as Record<string, string>
  );

  const stationIdToName: Record<string, string> = {};
  for (const [name, id] of Object.entries(stationNameToId)) {
    stationIdToName[id] = name;
  }

  const stationNamesAndIds = [
    ...new Set(Object.values(stationNameToId)),
  ];

  return {
    stationNames: [...new Set(stationNames)],
    routeNames: [...new Set(routeNames)],
    stationNamesAndIds: [...new Set(stationNamesAndIds)],
    stationNameToId,
    stationIdToName,
  };
}
