export interface CoordinateFormat {
  decimal: string;
  dms: string;
  withDirection: string;
  fullLabel: string;
}

const DECIMAL_PLACES = 6;

const padZero = (num: number, length: number = 2): string => {
  return String(Math.abs(Math.floor(num))).padStart(length, '0');
};

const padSeconds = (seconds: number): string => {
  const absSec = Math.abs(seconds);
  const intPart = Math.floor(absSec);
  const decPart = (absSec - intPart).toFixed(2).slice(1);
  return `${String(intPart).padStart(2, '0')}${decPart}`;
};

export const formatLatitude = (lat: number): CoordinateFormat => {
  const direction = lat >= 0 ? 'N' : 'S';

  const decimal = padCoordinate(lat, true);
  const absDecimal = padCoordinate(Math.abs(lat), true);

  const absLat = Math.abs(lat);
  const degrees = Math.floor(absLat);
  const minutesFloat = (absLat - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  const degStr = padZero(degrees, 2);
  const dms = `${degStr}°${padZero(minutes)}'${padSeconds(seconds)}"${direction}`;
  const withDirection = `${absDecimal}° ${direction}`;
  const fullLabel = `纬度: ${withDirection}`;

  return {
    decimal,
    dms,
    withDirection,
    fullLabel,
  };
};

export const formatLongitude = (lng: number): CoordinateFormat => {
  const direction = lng >= 0 ? 'E' : 'W';

  const decimal = padCoordinate(lng, false);
  const absDecimal = padCoordinate(Math.abs(lng), false);

  const absLng = Math.abs(lng);
  const degrees = Math.floor(absLng);
  const minutesFloat = (absLng - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  const degStr = padZero(degrees, 3);
  const dms = `${degStr}°${padZero(minutes)}'${padSeconds(seconds)}"${direction}`;
  const withDirection = `${absDecimal}° ${direction}`;
  const fullLabel = `经度: ${withDirection}`;

  return {
    decimal,
    dms,
    withDirection,
    fullLabel,
  };
};

export const formatCoordinates = (
  lat: number,
  lng: number,
  options: { showDms?: boolean; showDirection?: boolean } = {}
) => {
  const { showDms = false, showDirection = true } = options;
  const latFmt = formatLatitude(lat);
  const lngFmt = formatLongitude(lng);

  return {
    lat: showDms ? latFmt.dms : (showDirection ? latFmt.withDirection : latFmt.decimal),
    lng: showDms ? lngFmt.dms : (showDirection ? lngFmt.withDirection : lngFmt.decimal),
    latDecimal: latFmt.decimal,
    lngDecimal: lngFmt.decimal,
    latDms: latFmt.dms,
    lngDms: lngFmt.dms,
  };
};

export const padCoordinate = (value: number, isLat: boolean = false): string => {
  const fixed = Math.abs(value).toFixed(DECIMAL_PLACES);
  const intPart = fixed.split('.')[0];
  const targetLength = isLat ? 2 : 3;
  const paddedInt = intPart.padStart(targetLength, '0');
  const result = `${value >= 0 ? '' : '-'}${paddedInt}.${fixed.split('.')[1]}`;
  return result;
};
