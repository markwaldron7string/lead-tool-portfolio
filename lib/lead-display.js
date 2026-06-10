export function getScoreColor(score) {
  const n = Number(score) || 0;
  if (n >= 75) return "var(--green)";
  if (n >= 40) return "var(--amber)";
  return "var(--muted)";
}

export function formatGoogleRating(rating) {
  if (rating == null || rating === "") return "";
  const n = parseFloat(rating);
  if (Number.isNaN(n)) return String(rating);
  if (n % 1 === 0) return String(Math.round(n));
  return String(rating);
}

export function getGoogleRatingColor(rating) {
  const n = parseFloat(rating);
  if (Number.isNaN(n)) return "var(--muted)";
  if (n >= 4) return "var(--rating-high)";
  if (n >= 3) return "var(--rating-mid)";
  return "var(--rating-low)";
}

export function getFieldColor(key) {
  switch (key) {
    case "emails":
      return "var(--email-color)";
    case "linkedin_company":
    case "linkedin_personal":
      return "var(--linkedin-color)";
    case "instagram":
      return "var(--instagram-color)";
    case "city":
    case "state":
      return "var(--city-color)";
    case "website":
      return "var(--website-color)";
    default:
      return null;
  }
}

export function formatSocialLabel(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const p = u.pathname.split("/").filter(Boolean);
    return p[p.length - 1] || u.hostname;
  } catch {
    return url;
  }
}

export function formatWebsiteLabel(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
}
