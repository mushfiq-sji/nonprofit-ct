/**
 * BSP client branding — single source of truth for org identity.
 * Used as fallbacks when app_config DB values are not yet seeded.
 */

export const ORG_BRANDING = {
  name: "Bangladeshi-American Society of Professionals (BSP)",
  shortName: "BSP",
  tagline: "Community. Connection. Professional Growth.",
  logoUrl: "/bsp-logo.png",
  colors: {
    navy: "#1B2D4F",
    teal: "#3AAFA9",
    orange: "#E8922A",
  },
  contact: {
    email: "connect@bspcommunity.org",
    phone: "347-949-0096",
    location: "Bronx and Queens, New York",
  },
  websiteUrl: "https://bspcommunity.org",
} as const;
