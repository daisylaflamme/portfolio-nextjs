/**
 * Display overrides for known company/role slugs.
 * Add new entries here when a slug needs custom capitalization or punctuation.
 */
export const companyLabels = {
  "vertex-pharmaceuticals": "Vertex Pharmaceuticals",
  "unitedhealth-group": "UnitedHealth Group",
  "united-health-group": "United Health Group",
  "centerwell": "CenterWell",
  "centerwell-home-health": "Centerwell Home Health",
};

export const roleLabels = {
  "principal-engineer-vaida-user-experience":
    "Principal Engineer, VaiDA User Experience",
  "senior-frontend-engineer": "Senior Frontend Engineer",
  "senior-user-interface-design-engineer":
    "Senior User Interface Design Engineer",
};

/** Word-level overrides applied during title-case fallback. */
const wordOverrides = {
  ui: "UI",
  ux: "UX",
  ai: "AI",
  vaida: "VaiDA",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

/**
 * Decode, normalize separators, and title-case a URL slug.
 * @param {string | null | undefined} value
 * @returns {string}
 */
function slugToTitleCase(value) {
  if (value == null || value === "") return "";

  let decoded = String(value);
  try {
    decoded = decodeURIComponent(decoded.replace(/\+/g, " "));
  } catch {
    // Keep the raw value if decoding fails (malformed %).
  }

  return decoded
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (wordOverrides[lower]) return wordOverrides[lower];
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * @param {string | null | undefined} slug
 * @returns {string}
 */
export function formatCompanyName(slug) {
  if (slug == null || slug === "") return "";

  let normalized = String(slug);
  try {
    normalized = decodeURIComponent(normalized.replace(/\+/g, " "));
  } catch {
    // Keep raw slug.
  }

  const key = normalized.trim().toLowerCase().replace(/\s+/g, "-");
  if (companyLabels[key]) return companyLabels[key];

  return slugToTitleCase(normalized);
}

/**
 * @param {string | null | undefined} slug
 * @returns {string}
 */
export function formatRoleName(slug) {
  if (slug == null || slug === "") return "";

  let normalized = String(slug);
  try {
    normalized = decodeURIComponent(normalized.replace(/\+/g, " "));
  } catch {
    // Keep raw slug.
  }

  const key = normalized.trim().toLowerCase().replace(/\s+/g, "-");
  if (roleLabels[key]) return roleLabels[key];

  return slugToTitleCase(normalized);
}

/**
 * @param {string | null | undefined} companySlug
 * @returns {string}
 */
export function formatWelcomeMessage(companySlug) {
  const companyName = formatCompanyName(companySlug);
  if (!companyName) return "";
  return `Welcome, ${companyName} Team`;
}

/**
 * @param {string | null | undefined} roleSlug
 * @returns {string}
 */
export function formatRoleSubtitle(roleSlug) {
  const roleName = formatRoleName(roleSlug);
  if (!roleName) return "";
  return `${roleName} Portfolio`;
}

const PERSONALIZATION_STORAGE_KEY = "portfolio-personalization";

/**
 * @typedef {{ company: string, role: string }} PersonalizationSlugs
 */

/**
 * Persist home-page company/role slugs for the browser tab session.
 * @param {{ company?: string | null, role?: string | null }} slugs
 */
export function savePersonalizationSlugs(slugs) {
  if (typeof window === "undefined") return;

  const company = slugs.company?.trim() || "";
  const role = slugs.role?.trim() || "";
  if (!company && !role) return;

  try {
    const existing = readPersonalizationSlugs();
    const next = {
      company: company || existing.company || "",
      role: role || existing.role || "",
    };
    sessionStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode storage failures.
  }
}

/**
 * @returns {PersonalizationSlugs}
 */
export function readPersonalizationSlugs() {
  if (typeof window === "undefined") return { company: "", role: "" };

  try {
    const raw = sessionStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!raw) return { company: "", role: "" };
    const parsed = JSON.parse(raw);
    return {
      company: typeof parsed?.company === "string" ? parsed.company : "",
      role: typeof parsed?.role === "string" ? parsed.role : "",
    };
  } catch {
    return { company: "", role: "" };
  }
}
