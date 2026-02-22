export interface Station {
  id: string
  name: string
  color: number
  zone1: number
  zone2: number
  zone3: number
  connections: string[]
}

export interface Route {
  id: string
  name: string
  color: number
  number: string
  type: string
  circularState: string
  hidden: boolean
  stations: string[]
  durations: number[]
  depots: string[]
}

interface SystemMapDataResponse {
  stations: Station[]
  routes: Route[]
}

interface ApiResponse {
  code: number
  currentTime: number
  text: string
  version: number
  data: SystemMapDataResponse
}

export interface SystemMapData {
  stationNames: string[]
  routeNames: string[]
  stationNamesAndIds: string[]
  stationNameToId: Record<string, string>
}

/**
 * Parses a raw MTR station or route name into a display-friendly English name.
 * e.g., "中文1|English 1|English X||IGNORE" becomes "English 1 English X"
 * @param rawName The raw name string from the API.
 * @returns The parsed English name.
 */
export function parseMtrName(rawName: string): string {
  // Ignore everything after "||"
  const relevantPart = rawName.split('||')[0]

  // Split by "|", filter out CJK parts, and join
  const parts = relevantPart
    .split('|')
    .filter(part => part.trim() && !/[\u4E00-\u9FA5]/.test(part))
    .map(part => part.trim())

  return parts.join(' ')
}

/**
 * 将大整数（字符串形式）转换为大写、左侧补零的十六进制字符串，长度为16（等同于Java Long.SIZE / 4）。
 * @param longValue 字符串形式的十进制大整数
 * @returns 补零后的大写十六进制字符串
 */
export function numberToPaddedHexString(longValue: string): string {
  // 由于JS无法安全处理超大整数，需用BigInt
  const value = BigInt(longValue);
  // Java Long.SIZE / 4 = 64 / 4 = 16
  const length = 16;
  let hex = value.toString(16).toUpperCase();
  // 左侧补零
  if (hex.length < length) {
    hex = '0'.repeat(length - hex.length) + hex;
  }
  return hex;
}

/**
 * Fetches station and route data from the System Map API.
 * @param baseUrl The base URL of the System Map API.
 * @returns An object containing arrays of parsed station names and route names.
 */
export async function fetchSystemMapData(baseUrl: string): Promise<SystemMapData> {
  const url = `${baseUrl}/mtr/api/map/stations-and-routes?dimension=0`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch system map data. Status: ${response.status}`)
  }

  const json: ApiResponse = await response.json()

  if (json.code !== 200) {
    throw new Error(`API returned an error: ${json.text}`)
  }

  const stationNames = json.data.stations.map(station => parseMtrName(station.name)).filter(Boolean)
  const routeNames = json.data.routes.map(route => parseMtrName(route.name)).filter(Boolean)

  const stationNameToId = json.data.stations.reduce((acc, station) => {
    acc[parseMtrName(station.name)] = station.id
    return acc
  }, {} as Record<string, string>)
  const stationNamesAndIds = [...stationNames, ...Object.values(stationNameToId)]

  return { 
    stationNames: [...new Set(stationNames)], 
    routeNames: [...new Set(routeNames)],
    stationNamesAndIds: [...new Set(stationNamesAndIds)],
    stationNameToId: stationNameToId,
  }
}
