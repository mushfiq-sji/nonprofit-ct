/**
 * Integration Catalog (static, no DB migration required)
 *
 * Drives the admin Integration Hub. Connection status for any catalog entry
 * is layered on by matching `slug` against `organization_integrations.provider_id`
 * in DB (where it exists) — entries with no DB row simply render as "Not Configured".
 */

import {
  Brain,
  Sparkles,
  Cloud,
  Video,
  Mail,
  Users,
  Kanban,
  Calendar,
  CreditCard,
  Receipt,
  MessageSquare,
  FileText,
  Briefcase,
  Heart,
  Building2,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

export type CatalogAuthType = 'oauth2' | 'api_key' | 'service_account' | 'basic';

export interface CatalogProvider {
  slug: string;
  name: string;
  description: string;
  authType: CatalogAuthType;
  icon: LucideIcon;
  badge?: 'Popular' | 'Beta' | 'New' | 'Recommended';
  comingSoon?: boolean;
  docsUrl?: string;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind color token, e.g. "text-blue-600"
  providers: CatalogProvider[];
}

export const INTEGRATION_CATALOG: CatalogCategory[] = [
  {
    slug: 'crm-partners',
    name: 'CRM Partners',
    description: 'Sync donors, members, and contacts from your system of record.',
    icon: Users,
    accent: 'text-blue-600',
    providers: [
      { slug: 'salesforce-npsp', name: 'Salesforce NPSP', description: 'Nonprofit Success Pack — donors, gifts, households.', authType: 'oauth2', icon: Users, badge: 'Popular' },
      { slug: 'bloomerang', name: 'Bloomerang', description: 'Donor database tailored to small & mid-size nonprofits.', authType: 'api_key', icon: Heart, badge: 'Recommended' },
      { slug: 'blackbaud-raiser-edge', name: 'Blackbaud Raiser\'s Edge NXT', description: 'Enterprise fundraising CRM.', authType: 'oauth2', icon: Users },
      { slug: 'neon-crm', name: 'Neon CRM', description: 'All-in-one nonprofit CRM and fundraising.', authType: 'api_key', icon: Users },
      { slug: 'virtuous', name: 'Virtuous', description: 'Responsive fundraising CRM.', authType: 'oauth2', icon: Heart },
      { slug: 'donorperfect', name: 'DonorPerfect', description: 'Donor management & online giving.', authType: 'api_key', icon: Heart },
      { slug: 'kindful', name: 'Kindful', description: 'Bloomerang-owned donor CRM.', authType: 'api_key', icon: Heart },
      { slug: 'little-green-light', name: 'Little Green Light', description: 'Lightweight donor management.', authType: 'api_key', icon: Heart },
      { slug: 'hubspot', name: 'HubSpot', description: 'Contacts, pipelines, marketing automation.', authType: 'oauth2', icon: Briefcase, badge: 'Popular' },
      { slug: 'salesforce', name: 'Salesforce', description: 'Standard Sales/Service Cloud.', authType: 'oauth2', icon: Users },
    ],
  },
  {
    slug: 'payment-accounting',
    name: 'Payment & Accounting',
    description: 'Process donations, reconcile gifts, and sync to the books.',
    icon: CreditCard,
    accent: 'text-emerald-600',
    providers: [
      { slug: 'stripe', name: 'Stripe', description: 'Card, ACH, and recurring donation processing.', authType: 'oauth2', icon: CreditCard, badge: 'Popular' },
      { slug: 'paypal', name: 'PayPal', description: 'Online donations and giving forms.', authType: 'oauth2', icon: CreditCard },
      { slug: 'square', name: 'Square', description: 'In-person and event payments.', authType: 'oauth2', icon: CreditCard },
      { slug: 'donorbox', name: 'Donorbox', description: 'Embeddable donation forms.', authType: 'api_key', icon: Heart },
      { slug: 'givebutter', name: 'Givebutter', description: 'Donations, events, and peer-to-peer fundraising.', authType: 'api_key', icon: Heart, badge: 'New' },
      { slug: 'classy', name: 'Classy', description: 'Online fundraising platform.', authType: 'oauth2', icon: Heart },
      { slug: 'quickbooks', name: 'QuickBooks Online', description: 'Sync donations, expenses, and reconcile gifts.', authType: 'oauth2', icon: Receipt, badge: 'Recommended' },
      { slug: 'xero', name: 'Xero', description: 'Cloud accounting and fund tracking.', authType: 'oauth2', icon: Receipt },
      { slug: 'sage-intacct', name: 'Sage Intacct', description: 'Fund accounting for mid-size nonprofits.', authType: 'oauth2', icon: Receipt },
      { slug: 'plaid', name: 'Plaid', description: 'Bank reconciliation and verification.', authType: 'api_key', icon: Building2 },
    ],
  },
  {
    slug: 'events-engagement',
    name: 'Events & Engagement',
    description: 'Event registration, ticketing, and supporter engagement.',
    icon: Calendar,
    accent: 'text-purple-600',
    providers: [
      { slug: 'eventbrite', name: 'Eventbrite', description: 'Event registration and ticketing.', authType: 'oauth2', icon: Calendar, badge: 'Popular' },
      { slug: 'cvent', name: 'Cvent', description: 'Enterprise event management.', authType: 'oauth2', icon: Calendar },
      { slug: 'whova', name: 'Whova', description: 'Event app and attendee engagement.', authType: 'api_key', icon: Calendar },
      { slug: 'givebutter-events', name: 'Givebutter Events', description: 'Free event ticketing for nonprofits.', authType: 'api_key', icon: Calendar },
      { slug: 'classy-events', name: 'Classy Events', description: 'Galas and peer-to-peer events.', authType: 'oauth2', icon: Calendar },
      { slug: 'mobilize', name: 'Mobilize', description: 'Volunteer and event mobilization.', authType: 'oauth2', icon: Users },
      { slug: 'volunteer-match', name: 'VolunteerMatch', description: 'Find and post volunteer opportunities.', authType: 'api_key', icon: Users },
      { slug: 'galabid', name: 'GalaBid', description: 'Mobile bidding and silent auctions.', authType: 'api_key', icon: Megaphone, comingSoon: true },
    ],
  },
  {
    slug: 'communication',
    name: 'Communication',
    description: 'Email, SMS, and team messaging for staff and supporters.',
    icon: MessageSquare,
    accent: 'text-amber-600',
    providers: [
      { slug: 'sendgrid', name: 'SendGrid', description: 'Transactional and broadcast email.', authType: 'api_key', icon: Mail, badge: 'Popular' },
      { slug: 'resend', name: 'Resend', description: 'Modern transactional email API.', authType: 'api_key', icon: Mail },
      { slug: 'mailgun', name: 'Mailgun', description: 'Email delivery and validation.', authType: 'api_key', icon: Mail },
      { slug: 'postmark', name: 'Postmark', description: 'Reliable transactional email.', authType: 'api_key', icon: Mail },
      { slug: 'amazon-ses', name: 'Amazon SES', description: 'High-volume email at low cost.', authType: 'api_key', icon: Cloud },
      { slug: 'twilio', name: 'Twilio', description: 'SMS and voice for supporter outreach.', authType: 'api_key', icon: MessageSquare },
      { slug: 'slack', name: 'Slack', description: 'Internal alerts and agent notifications.', authType: 'oauth2', icon: MessageSquare, badge: 'Popular' },
      { slug: 'discord', name: 'Discord', description: 'Community channels for supporters.', authType: 'oauth2', icon: MessageSquare },
    ],
  },
  {
    slug: 'google-workspace',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, Drive, Meet, and Sheets for your team.',
    icon: Cloud,
    accent: 'text-red-600',
    providers: [
      { slug: 'google-workspace', name: 'Workspace SSO', description: 'Sign in & directory sync.', authType: 'oauth2', icon: Cloud, badge: 'Recommended' },
      { slug: 'gmail', name: 'Gmail', description: 'Send and log email from staff inboxes.', authType: 'oauth2', icon: Mail },
      { slug: 'google-calendar', name: 'Google Calendar', description: 'Sync meetings and events.', authType: 'oauth2', icon: Calendar },
      { slug: 'google-drive', name: 'Google Drive', description: 'Attach files to grants, board packs, knowledge.', authType: 'oauth2', icon: Cloud },
      { slug: 'google-meet', name: 'Google Meet', description: 'Create and join meetings.', authType: 'oauth2', icon: Video },
      { slug: 'google-sheets', name: 'Google Sheets', description: 'Import/export rosters and reports.', authType: 'oauth2', icon: FileText },
      { slug: 'google-docs', name: 'Google Docs', description: 'Generate grant drafts and board memos.', authType: 'oauth2', icon: FileText },
    ],
  },
  {
    slug: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Outlook, Teams, OneDrive, SharePoint, and Excel.',
    icon: Cloud,
    accent: 'text-sky-600',
    providers: [
      { slug: 'microsoft-365', name: 'Microsoft 365 SSO', description: 'Azure AD sign-in & directory.', authType: 'oauth2', icon: Cloud, badge: 'Recommended' },
      { slug: 'outlook', name: 'Outlook', description: 'Email send/log from staff mailboxes.', authType: 'oauth2', icon: Mail },
      { slug: 'microsoft-calendar', name: 'Outlook Calendar', description: 'Sync meetings and events.', authType: 'oauth2', icon: Calendar },
      { slug: 'microsoft-teams', name: 'Microsoft Teams', description: 'Meetings, chat, channel posting.', authType: 'oauth2', icon: Users },
      { slug: 'onedrive', name: 'OneDrive', description: 'File attachments for knowledge & grants.', authType: 'oauth2', icon: Cloud },
      { slug: 'sharepoint', name: 'SharePoint', description: 'Document libraries and team sites.', authType: 'oauth2', icon: Cloud },
      { slug: 'excel', name: 'Excel Online', description: 'Spreadsheet import/export.', authType: 'oauth2', icon: FileText },
    ],
  },
  {
    slug: 'zoom',
    name: 'Zoom',
    description: 'Meetings, webinars, and recording for board & program calls.',
    icon: Video,
    accent: 'text-blue-500',
    providers: [
      { slug: 'zoom', name: 'Zoom Meetings', description: 'Create meetings, sync recordings & transcripts.', authType: 'oauth2', icon: Video, badge: 'Popular' },
      { slug: 'zoom-webinars', name: 'Zoom Webinars', description: 'Donor briefings and community events.', authType: 'oauth2', icon: Video },
      { slug: 'zoom-events', name: 'Zoom Events', description: 'Multi-session conferences and galas.', authType: 'oauth2', icon: Calendar, comingSoon: true },
      { slug: 'zoom-phone', name: 'Zoom Phone', description: 'Cloud phone for staff lines.', authType: 'oauth2', icon: MessageSquare, comingSoon: true },
    ],
  },
  {
    slug: 'mailchimp',
    name: 'Mailchimp',
    description: 'Newsletters, audiences, and campaign analytics.',
    icon: Megaphone,
    accent: 'text-yellow-600',
    providers: [
      { slug: 'mailchimp', name: 'Mailchimp Marketing', description: 'Audiences, campaigns, and automations.', authType: 'oauth2', icon: Megaphone, badge: 'Popular' },
      { slug: 'mailchimp-transactional', name: 'Mailchimp Transactional (Mandrill)', description: 'Receipts and acknowledgment emails.', authType: 'api_key', icon: Mail },
      { slug: 'mailchimp-events', name: 'Mailchimp Events', description: 'Email-driven event RSVPs.', authType: 'oauth2', icon: Calendar, comingSoon: true },
    ],
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Tasks, docs, and project management for staff teams.',
    icon: Kanban,
    accent: 'text-indigo-600',
    providers: [
      { slug: 'asana', name: 'Asana', description: 'Tasks, projects, and workflows.', authType: 'oauth2', icon: Kanban },
      { slug: 'monday', name: 'Monday.com', description: 'Work OS for ops and programs.', authType: 'oauth2', icon: Kanban },
      { slug: 'trello', name: 'Trello', description: 'Lightweight kanban boards.', authType: 'oauth2', icon: Kanban },
      { slug: 'clickup', name: 'ClickUp', description: 'Docs, tasks, and goals.', authType: 'oauth2', icon: Kanban },
      { slug: 'notion', name: 'Notion', description: 'Docs, wikis, and knowledge base.', authType: 'oauth2', icon: FileText, badge: 'Popular' },
      { slug: 'airtable', name: 'Airtable', description: 'Spreadsheet-database for programs.', authType: 'oauth2', icon: FileText },
      { slug: 'linear', name: 'Linear', description: 'Issue tracking for product/eng teams.', authType: 'oauth2', icon: Kanban },
      { slug: 'jira', name: 'Jira', description: 'Project tracking and sprints.', authType: 'oauth2', icon: Kanban },
      { slug: 'dropbox', name: 'Dropbox', description: 'File storage and sharing.', authType: 'oauth2', icon: Cloud },
      { slug: 'box', name: 'Box', description: 'Secure document collaboration.', authType: 'oauth2', icon: Cloud },
    ],
  },
];

export function getCatalogProviderBySlug(slug: string): CatalogProvider | undefined {
  for (const cat of INTEGRATION_CATALOG) {
    const p = cat.providers.find((x) => x.slug === slug);
    if (p) return p;
  }
  return undefined;
}

export function flattenCatalog(): CatalogProvider[] {
  return INTEGRATION_CATALOG.flatMap((c) => c.providers);
}
