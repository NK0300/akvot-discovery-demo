/**
 * Discovery URL safety — https-only + block private/link-local/metadata hosts.
 * Complements Core SSRF gate; used when normalizing provenance URLs.
 * Additive harden 2026-09-20: suffix TLD traps (.localhost/.local/.internal),
 * full private IPv4 ranges (incl. 172.16–31, CGNAT), reject raw IPs entirely.
 */

/**
 * @param {string} hostname
 * @returns {boolean} true if host must be rejected
 */
export function isBlockedDiscoveryHost(hostname) {
  const h = String(hostname || '')
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[|\]$/g, '');
  if (!h) return true;

  // Exact / suffix traps (Node resolves *.localhost → loopback)
  if (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h === 'metadata' ||
    h === 'metadata.google.internal' ||
    h.startsWith('metadata.google') ||
    h === 'kubernetes.default' ||
    h === 'kubernetes.default.svc'
  ) {
    return true;
  }

  // IPv6 / bracket forms — reject all raw IPv6 (no public provenance via literal)
  if (h.includes(':')) return true;

  // IPv4 literal (after URL parser normalization of hex/decimal/short forms)
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = m.slice(1).map(Number);
    if (a.some((n) => n > 255)) return true;
    const [A, B] = a;
    if (A === 10) return true;
    if (A === 127) return true;
    if (A === 0) return true;
    if (A === 169 && B === 254) return true; // link-local / cloud metadata
    if (A === 172 && B >= 16 && B <= 31) return true;
    if (A === 192 && B === 168) return true;
    if (A === 100 && B >= 64 && B <= 127) return true; // CGNAT
    if (A >= 224) return true; // multicast / reserved
    return true; // reject ALL raw IPv4 for provenance (cite-or-drop public hostnames only)
  }

  // Single-label / weird numeric hosts that Node may still resolve as IPs
  if (/^\d+$/.test(h)) return true; // decimal IP as hostname leftover
  if (/^0x[0-9a-f]+$/i.test(h)) return true;

  return false;
}

/**
 * @param {string} url
 * @returns {{ ok: boolean, reason?: string, canonical?: string }}
 */
export function assertSafePublicHttpsUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return { ok: false, reason: 'empty' };
  let u;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  // Explicit dangerous schemes (defense in depth; protocol check below also fails them)
  const proto = u.protocol.toLowerCase();
  if (proto === 'javascript:' || proto === 'data:' || proto === 'file:' || proto === 'blob:') {
    return { ok: false, reason: 'dangerous_scheme' };
  }
  if (proto !== 'https:') return { ok: false, reason: 'scheme_not_https' };
  if (u.username || u.password) return { ok: false, reason: 'userinfo_forbidden' };
  const host = u.hostname.toLowerCase();
  if (isBlockedDiscoveryHost(host)) return { ok: false, reason: 'blocked_host' };
  return { ok: true, canonical: u.toString() };
}

export default { assertSafePublicHttpsUrl, isBlockedDiscoveryHost };
