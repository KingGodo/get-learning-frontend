import type { UserRole } from "./types";

/**
 * Learning Hub role themes — professional, cool neutrals.
 * Distinct accents per role; shared cool gray page chrome (no loud orange/green).
 *
 * Direction (ui-design-system):
 * - ADMIN: Precision & density — graphite
 * - SCHOOL_ADMIN: Sophistication & trust — navy
 * - TEACHER: Focus & clarity — muted teal
 * - STUDENT: Calm & clarity — soft sky
 */

export type RoleThemeId = UserRole;

export type RoleTheme = {
  id: RoleThemeId;
  label: string;
  direction: string;
  brand: string;
  brandHover: string;
  brandPressed: string;
  brandDark: string;
  brandDarkHover: string;
  brandLight: string;
  brandMuted: string;
  sidebar: string;
  pageBg: string;
  ink: string;
};

const pageBg = "#f8fafc";
const ink = "#111827";

export const roleThemes: Record<UserRole, RoleTheme> = {
  ADMIN: {
    id: "ADMIN",
    label: "System admin",
    direction: "Precision & density",
    brand: "#1f2937",
    brandHover: "#111827",
    brandPressed: "#030712",
    brandDark: "#111827",
    brandDarkHover: "#030712",
    brandLight: "#f3f4f6",
    brandMuted: "#e5e7eb",
    sidebar: "#ffffff",
    pageBg,
    ink,
  },
  SCHOOL_ADMIN: {
    id: "SCHOOL_ADMIN",
    label: "School admin",
    direction: "Sophistication & trust",
    brand: "#1e40af",
    brandHover: "#1d4ed8",
    brandPressed: "#1e3a8a",
    brandDark: "#1e3a8a",
    brandDarkHover: "#172554",
    brandLight: "#eff6ff",
    brandMuted: "#dbeafe",
    sidebar: "#ffffff",
    pageBg,
    ink,
  },
  TEACHER: {
    id: "TEACHER",
    label: "Teacher",
    direction: "Focus & clarity",
    brand: "#0f766e",
    brandHover: "#0d9488",
    brandPressed: "#115e59",
    brandDark: "#134e4a",
    brandDarkHover: "#115e59",
    brandLight: "#f0fdfa",
    brandMuted: "#ccfbf1",
    sidebar: "#ffffff",
    pageBg,
    ink,
  },
  STUDENT: {
    id: "STUDENT",
    label: "Student",
    direction: "Calm & clarity",
    brand: "#0369a1",
    brandHover: "#0284c8",
    brandPressed: "#075985",
    brandDark: "#0c4a6e",
    brandDarkHover: "#075985",
    brandLight: "#f0f9ff",
    brandMuted: "#e0f2fe",
    sidebar: "#ffffff",
    pageBg,
    ink,
  },
};

/** Default / marketing chrome (unauthenticated). */
export const defaultTheme = {
  brand: "#2563eb",
  brandHover: "#1d4ed8",
  brandPressed: "#1e40af",
  brandDark: "#1e40af",
  brandDarkHover: "#1e3a8a",
  brandLight: "#eff6ff",
  brandMuted: "#dbeafe",
  pageBg: "#ffffff",
  ink,
} as const;

/** @deprecated Prefer roleThemes[role] — kept for any legacy imports */
export const theme = defaultTheme;

export function themeForRole(role: UserRole | null | undefined): RoleTheme {
  if (!role) {
    return {
      id: "ADMIN",
      label: "Learning Hub",
      direction: "Default",
      ...defaultTheme,
      sidebar: defaultTheme.brand,
    };
  }
  return roleThemes[role];
}

export function roleThemeAttribute(role: UserRole): string {
  return role.toLowerCase().replaceAll("_", "-");
}
