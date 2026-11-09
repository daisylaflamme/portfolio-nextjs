/**
 * Display overrides for known company/role slugs.
 * Add new entries here when a slug needs custom capitalization or punctuation.
 */
export const companyLabels: Record<string, string> = {
  "vertex-pharmaceuticals": "Vertex Pharmaceuticals",
  "unitedhealth-group": "UnitedHealth Group",
  "united-health-group": "United Health Group",
  "centerwell": "CenterWell",
  "centerwell-home-health": "Centerwell Home Health",
};

export const roleLabels: Record<string, string> = {
  "principal-engineer-vaida-user-experience":
    "Principal Engineer, VaiDA User Experience",
  "senior-frontend-engineer": "Senior Frontend Engineer",
  "senior-user-interface-design-engineer":
    "Senior User Interface Design Engineer",
};

/** Word-level overrides applied during title-case fallback. */
const wordOverrides: Record<string, string> = {
  ui: "UI",
  ux: "UX",
  ai: "AI",
  vaida: "VaiDA",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

type Slug = string | null | undefined;

/** Decode, normalize separators, and title-case a URL slug. */
function slugToTitleCase(value: Slug): string {
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

export function formatCompanyName(slug: Slug): string {
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

export function formatRoleName(slug: Slug): string {
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

export function formatWelcomeMessage(companySlug: Slug): string {
  const companyName = formatCompanyName(companySlug);
  if (!companyName) return "";
  return `Welcome, ${companyName} Team`;
}

export function formatRoleSubtitle(roleSlug: Slug): string {
  const roleName = formatRoleName(roleSlug);
  if (!roleName) return "";
  return `${roleName} Portfolio`;
}

const PERSONALIZATION_STORAGE_KEY = "portfolio-personalization";

export interface PersonalizationSlugs {
  company: string;
  role: string;
}

/** Persist home-page company/role slugs for the browser tab session. */
export function savePersonalizationSlugs(slugs: { company?: Slug; role?: Slug }): void {
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

export function readPersonalizationSlugs(): PersonalizationSlugs {
  if (typeof window === "undefined") return { company: "", role: "" };

  try {
    const raw = sessionStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!raw) return { company: "", role: "" };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { company: "", role: "" };
    const { company, role } = parsed as Partial<Record<"company" | "role", unknown>>;
    return {
      company: typeof company === "string" ? company : "",
      role: typeof role === "string" ? role : "",
    };
  } catch {
    return { company: "", role: "" };
  }
}
