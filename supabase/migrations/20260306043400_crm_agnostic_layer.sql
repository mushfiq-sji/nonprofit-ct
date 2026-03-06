-- Migration: CRM-Agnostic Integration Layer
-- Removes HubSpot-specific columns from clients/deals/contacts tables.
-- Creates generic crm_integrations and crm_object_mappings tables to support
-- any CRM (Salesforce, Bloomerang, Neon CRM, Little Green Light, etc.)

-- ============================================================================
-- Remove HubSpot-specific columns
-- ============================================================================

ALTER TABLE public.clients
  DROP COLUMN IF EXISTS hubspot_company_id,
  DROP COLUMN IF EXISTS is_hubspot_synced,
  DROP COLUMN IF EXISTS last_hubspot_sync;

ALTER TABLE public.deals
  DROP COLUMN IF EXISTS hubspot_deal_id,
  DROP COLUMN IF EXISTS is_hubspot_synced,
  DROP COLUMN IF EXISTS last_hubspot_sync;

ALTER TABLE public.contacts
  DROP COLUMN IF EXISTS hubspot_contact_id,
  DROP COLUMN IF EXISTS is_hubspot_synced,
  DROP COLUMN IF EXISTS last_hubspot_sync;

-- ============================================================================
-- Create generic CRM integration registry
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL CHECK (crm_type IN (
    'salesforce', 'salesforce_npsp', 'bloomerang', 'neon_crm',
    'little_green_light', 'blackbaud', 'virtuous', 'donorperfect',
    'kindful', 'custom'
  )),
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',       -- API keys, org IDs (encrypted at rest via Vault)
  field_mappings JSONB DEFAULT '{}', -- How CRM fields map to local fields
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Create generic CRM object mapping table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_object_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.crm_integrations(id) ON DELETE CASCADE,
  local_table TEXT NOT NULL,        -- 'clients', 'deals', 'contacts'
  local_record_id UUID NOT NULL,
  external_crm_id TEXT NOT NULL,    -- The ID in the external CRM
  external_crm_url TEXT,            -- Deep link to the record in the CRM UI
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'synced', 'error', 'skipped'
  )),
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(integration_id, local_table, local_record_id),
  UNIQUE(integration_id, local_table, external_crm_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_object_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org CRM integrations"
  ON public.crm_integrations
  FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "Admins can manage CRM integrations"
  ON public.crm_integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view CRM mappings for their org"
  ON public.crm_object_mappings
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.crm_integrations
      WHERE organization_id = auth.uid()
    )
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_crm_object_mappings_lookup
  ON public.crm_object_mappings(integration_id, local_table, local_record_id);

CREATE INDEX IF NOT EXISTS idx_crm_object_mappings_external
  ON public.crm_object_mappings(integration_id, external_crm_id);

CREATE INDEX IF NOT EXISTS idx_crm_integrations_org
  ON public.crm_integrations(organization_id);
