// Device & Browser Fingerprinting Service for Single-Device Enforcement
// Generates a persistent, deterministic hardware & browser identifier

export const getDeviceFingerprint = () => {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server-env',
      deviceLabel: 'Server Terminal',
      browser: 'Unknown',
      os: 'Unknown',
      resolution: 'Unknown',
    };
  }

  // 1. Persistent Unique Client Token
  let clientToken = localStorage.getItem('mrs_nashwa_device_token');
  if (!clientToken) {
    clientToken = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem('mrs_nashwa_device_token', clientToken);
  }

  const ua = navigator.userAgent || '';
  let browser = 'Web Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'MacBook / macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android Device';
  else if (ua.includes('Linux')) os = 'Linux';

  const screenRes =
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'Standard';

  const deviceLabel = `${os} • ${browser} (${screenRes})`;

  // Simple hash for stable deviceId
  const rawId = `${clientToken}_${os}_${browser}`;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const deviceId = `DEV-${Math.abs(hash).toString(36).toUpperCase()}-${clientToken.slice(-4).toUpperCase()}`;

  return {
    deviceId,
    deviceLabel,
    browser,
    os,
    resolution: screenRes,
    boundAt: new Date().toISOString(),
  };
};

export default getDeviceFingerprint;
