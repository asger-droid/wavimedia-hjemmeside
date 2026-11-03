// Sends a custom event to the Meta Pixel, if it has loaded. Never throws, so a blocked pixel can't break a page.
export function track(event: string, params?: Record<string, string | number>) {
  try { const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq; if (typeof fbq === 'function') fbq('trackCustom', event, params ?? {}); } catch { /* ignore */ }
}
