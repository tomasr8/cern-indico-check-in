export const redirectUri = `${window.location.origin}/auth/redirect`;
export const discoveryEndpoint = '.well-known/oauth-authorization-server';

interface QRCodeServerData {
  baseUrl: string;
  clientId: string;
  scope: string;
}

export interface QRCodeEventData {
  eventId: number;
  regformId: number;
  title: string;
  date: string;
  regformTitle: string;
  server: QRCodeServerData;
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

export function validateEventData(data: unknown): data is QRCodeEventData {
  if (!isRecord(data)) {
    return false;
  }

  const {eventId, regformId, title, regformTitle, date} = data;
  if (!Number.isInteger(eventId) || !Number.isInteger(regformId)) {
    return false;
  }
  if (typeof title !== 'string' || typeof regformTitle !== 'string') {
    return false;
  }
  if (typeof date !== 'string' || new Date(date).toString() === 'Invalid Date') {
    return false;
  }

  const server = data?.server ?? {};
  if (!isRecord(server)) {
    return false;
  }

  const {baseUrl, clientId, scope} = server;
  if (typeof baseUrl !== 'string') {
    return false;
  }
  try {
    new URL(baseUrl);
  } catch {
    return false;
  }
  if (typeof clientId !== 'string' || typeof scope !== 'string') {
    return false;
  }
  return true;
}

export interface QRCodeParticipantData {
  serverUrl: string;
  checkinSecret?: string;
  i?: [string, string, string]; // new format only
}

/**
 * Parses the data from a QR code.
 *
 * There are currently two formats:
 * 1. The old, deprecated format
 * 2. The new, more compact format
 *
 * We support the old format for now, so that QR codes generated on
 * an older version of Indico (<3.3) can still be read.
 */
export function parseQRCodeParticipantData(
  data: QRCodeParticipantData
): QRCodeParticipantData | null {
  if (typeof data !== 'object') {
    return null;
  }

  let serverUrl;
  let checkinSecret;
  const isNewFormat = Array.isArray(data.i);

  if (isNewFormat) {
    // more compact format
    [, serverUrl, checkinSecret] = data.i!;
  } else {
    ({checkinSecret, serverUrl} = data);
  }

  if (typeof checkinSecret !== 'string') {
    return null;
  }

  if (isNewFormat) {
    checkinSecret = decodeCheckinSecret(checkinSecret);
  }

  if (typeof serverUrl !== 'string') {
    return null;
  }

  try {
    new URL(serverUrl);
  } catch {
    serverUrl = `https://${serverUrl}`;
    try {
      new URL(serverUrl);
    } catch {
      return null;
    }
  }

  return {checkinSecret, serverUrl};
}

function decodeCheckinSecret(base64String: string): string {
  const bytes = atob(base64String)
    .split('')
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'));

  return [
    bytes.slice(0, 4),
    bytes.slice(4, 6),
    bytes.slice(6, 8),
    bytes.slice(8, 10),
    bytes.slice(10),
  ]
    .map(p => p.join(''))
    .join('-');
}
