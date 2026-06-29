/**
 * Integration Hub — Revamped (catalog-driven)
 *
 * No DB migration / no schema change. Categories and providers are sourced
 * from `src/lib/integrationCatalog.ts`. Connection status is layered on top
 * by joining against `organization_integrations` via the provider slug.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { useOrganizationIntegrations } from '@/hooks/useIntegrations';
import {
  INTEGRATION_CATALOG,
  type CatalogCategory,
  type CatalogProvider,
} from '@/lib/integrationCatalog';
import { getAuthTypeLabel } from '@/lib/integration-utils';

type ConnectedMap = Record<string, 'connected' | 'error' | 'testing' | 'disconnected'>;

function useConnectedStatusBySlug(): { map: ConnectedMap; isLoading: boolean } {
  const { data, isLoading } = useOrganizationIntegrations();
  const map: ConnectedMap = {};
  (data ?? []).forEach((row) => {
    const slug = row.provider?.slug;
    if (!slug) return;
    map[slug] = (row.connection_status as ConnectedMap[string]) ?? 'disconnected';
  });
  return { map, isLoading };
}

function statusBadge(status: ConnectedMap[string] | undefined, comingSoon?: boolean) {
  if (comingSoon) return { variant: 'outline' as const, label: 'Coming Soon', icon: Circle };
  switch (status) {
    case 'connected':
      return { variant: 'default' as const, label: 'Connected', icon: CheckCircle2 };
    case 'error':
      return { variant: 'destructive' as const, label: 'Error', icon: Circle };
    case 'testing':
      return { variant: 'outline' as const, label: 'Testing…', icon: Loader2 };
    default:
      return { variant: 'secondary' as const, label: 'Not Configured', icon: Circle };
  }
}

function CatalogCard({
  provider,
  status,
  onClick,
}: {
  provider: CatalogProvider;
  status: ConnectedMap[string] | undefined;
  onClick: () => void;
}) {
  const Icon = provider.icon;
  const s = statusBadge(status, provider.comingSoon);
  const StatusIcon = s.icon;
  const connected = status === 'connected';

  return (
    <Card
      className={`border-2 transition-all duration-200 cursor-pointer ${
        provider.comingSoon
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={() => !provider.comingSoon && onClick()}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg border p-3 bg-muted/50">
            <Icon className="h-8 w-8" />
          </div>

          <div className="w-full">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <p className="font-semibold">{provider.name}</p>
              {provider.badge && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {provider.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {provider.description}
            </p>
          </div>

          <Badge variant={s.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {s.label}
          </Badge>

          <p className="text-xs text-muted-foreground">
            {getAuthTypeLabel(provider.authType)}
          </p>

          <Button
            variant={connected ? 'outline' : 'default'}
            size="sm"
            className="w-full"
            disabled={provider.comingSoon}
            onClick={(e) => {
              e.stopPropagation();
              if (!provider.comingSoon) onClick();
            }}
          >
            {provider.comingSoon
              ? 'Coming Soon'
              : connected
                ? 'Configure'
                : provider.authType === 'oauth2'
                  ? 'Connect'
                  : 'Configure'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function matchesQuery(p: CatalogProvider, q: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(s) ||
    p.slug.toLowerCase().includes(s) ||
    p.description.toLowerCase().includes(s)
  );
}

export default function Integrations() {
  const navigate = useNavigate();
  const { map: statusMap, isLoading: statusLoading } = useConnectedStatusBySlug();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expanded, setExpanded] = useState<string[]>(
    INTEGRATION_CATALOG.map((c) => c.slug)
  );

  const toggle = (slug: string) =>
    setExpanded((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  const groups = useMemo(() => {
    return INTEGRATION_CATALOG
      .filter((cat) => filterCategory === 'all' || cat.slug === filterCategory)
      .map((cat) => {
        const providers = cat.providers.filter((p) => matchesQuery(p, searchQuery));
        const connected = providers.filter((p) => statusMap[p.slug] === 'connected').length;
        return { cat, providers, connected };
      })
      .filter((g) => g.providers.length > 0);
  }, [filterCategory, searchQuery, statusMap]);

  const totals = useMemo(() => {
    const all = INTEGRATION_CATALOG.flatMap((c) => c.providers);
    return {
      categories: INTEGRATION_CATALOG.length,
      available: all.filter((p) => !p.comingSoon).length,
      comingSoon: all.filter((p) => p.comingSoon).length,
      connected: all.filter((p) => statusMap[p.slug] === 'connected').length,
    };
  }, [statusMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect your CRM, payments, calendars, and communication tools — no code required.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/integrations/analytics')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Connected', value: statusLoading ? '—' : totals.connected, accent: 'text-emerald-600' },
          { label: 'Available', value: totals.available, accent: 'text-blue-600' },
          { label: 'Coming Soon', value: totals.comingSoon, accent: 'text-amber-600' },
          { label: 'Categories', value: totals.categories, accent: 'text-purple-600' },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="py-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold ${k.accent}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search 70+ integrations (Salesforce, Stripe, Zoom, Mailchimp…)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INTEGRATION_CATALOG.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('all')}
        >
          All
        </Button>
        {INTEGRATION_CATALOG.map((c) => {
          const Icon = c.icon;
          const active = filterCategory === c.slug;
          return (
            <Button
              key={c.slug}
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => setFilterCategory(c.slug)}
              className="gap-1"
            >
              <Icon className="h-3.5 w-3.5" />
              {c.name}
            </Button>
          );
        })}
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No integrations match your search.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {groups.map(({ cat, providers, connected }) => {
          const Icon = cat.icon;
          const isOpen = expanded.includes(cat.slug);
          return (
            <Collapsible key={cat.slug} open={isOpen} onOpenChange={() => toggle(cat.slug)}>
              <Card>
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        />
                        <Icon className={`h-5 w-5 ${cat.accent}`} />
                        <CardTitle>{cat.name}</CardTitle>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {providers.length} provider{providers.length !== 1 ? 's' : ''}
                        {connected > 0 && ` · ${connected} connected`}
                      </div>
                    </div>
                    <CardDescription className="ml-11">{cat.description}</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {providers.map((p) => (
                        <CatalogCard
                          key={p.slug}
                          provider={p}
                          status={statusMap[p.slug]}
                          onClick={() => navigate(`/admin/integrations/${p.slug}`)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Help */}
      {!searchQuery && filterCategory === 'all' && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Don't see what you need?</h3>
                <p className="text-sm text-muted-foreground">
                  All providers in the catalog use the same secure config pattern. Click any card
                  to set up credentials. Coming-soon items are tracked on the roadmap — request a
                  provider from <span className="font-medium">Admin → Feedback</span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
