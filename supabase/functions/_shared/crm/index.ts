import type { CrmProviderSlug, CrmContact, CrmIntegrationConfig, SyncResult } from "./types.ts";

const CRM_SLUGS: CrmProviderSlug[] = [
  "salesforce-npsp",
  "blackbaud-raiser-edge",
  "bloomerang",
  "neon-crm",
  "virtuous",
  "donorperfect",
  "hubspot-nonprofit",
  "kindful",
  "hubspot",
  "salesforce",
];

export type { CrmContact, CrmIntegrationConfig, SyncResult, CrmProviderSlug };

export function isCrmProviderSlug(slug: string): slug is CrmProviderSlug {
  return (CRM_SLUGS as string[]).includes(slug);
}

export async function fetchCrmContacts(
  _slug: CrmProviderSlug,
  _config: CrmIntegrationConfig,
  _since?: number
): Promise<CrmContact[]> {
  // No CRM adapters implemented yet — add adapters here as needed
  return [];
}

export async function pushCrmContact(
  slug: CrmProviderSlug,
  _config: CrmIntegrationConfig,
  _contact: CrmContact
): Promise<SyncResult> {
  // No CRM adapters implemented yet — add adapters here as needed
  return { success: false, processed: 0, message: `No adapter for ${slug}` };
}
