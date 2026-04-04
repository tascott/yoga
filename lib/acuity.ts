/** Default scheduling URL from Acuity “Embed scheduler” (owner ref in query). */
export const ACUITY_SCHEDULE_EMBED_SRC =
  "https://app.acuityscheduling.com/schedule.php?owner=38966366&ref=embedded_csp";

const TRUSTED_HOST_SUFFIX = "acuityscheduling.com";

/** Only allows https URLs on Acuity’s hosts so CMS-stored values cannot become arbitrary iframes. */
export function resolveAcuityIframeSrc(...candidates: Array<string | null | undefined>): string {
  for (const raw of candidates) {
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "https:") continue;
      const host = url.hostname.toLowerCase();
      if (host !== TRUSTED_HOST_SUFFIX && !host.endsWith(`.${TRUSTED_HOST_SUFFIX}`)) continue;
      return url.toString();
    } catch {
      continue;
    }
  }
  return ACUITY_SCHEDULE_EMBED_SRC;
}
