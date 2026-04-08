import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Plug, Loader2, Cloud, Zap, Settings } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  detail?: string;
  lastSync?: string;
  stats?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "salesforce", name: "Salesforce", icon: "☁️", connected: true, detail: "Primary CRM · 1,847 records", lastSync: "47 minutes ago", stats: "23 staff users · 1,847 donors · 4 active campaigns" },
  { id: "stripe", name: "Stripe", icon: "💳", connected: true, detail: "Payment Processor · Q1: $487,000 processed", lastSync: "2 hours ago", stats: "847 transactions this month · $142,340 April" },
  { id: "bloomerang", name: "Bloomerang", icon: "🌸", connected: false },
  { id: "quickbooks", name: "QuickBooks Online", icon: "📗", connected: false },
  { id: "mailchimp", name: "Mailchimp", icon: "📧", connected: false },
  { id: "eventbrite", name: "Eventbrite", icon: "🎫", connected: false },
  { id: "neon", name: "Neon CRM", icon: "🔵", connected: false },
  { id: "paypal", name: "PayPal", icon: "🅿️", connected: false },
  { id: "virtuous", name: "Virtuous", icon: "💚", connected: false },
  { id: "hubspot", name: "HubSpot", icon: "🟠", connected: false },
];

const SYNC_LOG = [
  { time: "Today 10:14am", records: "1,847", changes: "3 added, 0 errors ✓" },
  { time: "Today 6:14am", records: "1,844", changes: "1 added, 0 errors ✓" },
  { time: "Yesterday 10:14pm", records: "1,843", changes: "0 changes ✓" },
  { time: "Yesterday 6:14pm", records: "1,843", changes: "2 added, 0 errors ✓" },
  { time: "Yesterday 2:14pm", records: "1,841", changes: "5 updated, 0 errors ✓" },
];

export default function IntegrationCenterPage() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [settingsModal, setSettingsModal] = useState(false);
  const [syncLogDrawer, setSyncLogDrawer] = useState(false);

  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length;

  const handleSync = (id: string, name: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      if (id === "salesforce") {
        toast.success("✓ Salesforce sync complete — 1,847 records updated · 3 new records added");
      } else {
        toast.success(`✓ ${name} sync complete — 847 transactions verified`);
      }
    }, 2000);
  };

  const handleRequestSetup = (name: string) => {
    setConnectModal(null);
    toast.success("✓ Setup request sent — your team will be in touch within 24 hours");
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connected Systems</h1>
        <p className="text-sm text-muted-foreground">
          Brightside Foundation is connected to {connectedCount} of {INTEGRATIONS.length} available integrations
        </p>
        <div className="mt-3">
          <Progress value={(connectedCount / INTEGRATIONS.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integ) => (
          <Card key={integ.id} className={`border shadow-sm ${!integ.connected ? "opacity-75" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-2xl">{integ.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{integ.name}</h3>
                    {integ.connected ? (
                      <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>
                    )}
                  </div>
                  {integ.detail && <p className="text-xs text-muted-foreground mt-1">{integ.detail}</p>}
                  {integ.lastSync && <p className="text-xs text-muted-foreground mt-1">Last synced: {integ.lastSync}</p>}
                  {integ.stats && <p className="text-xs text-muted-foreground mt-1">{integ.stats}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {integ.connected ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleSync(integ.id, integ.name)} disabled={syncing === integ.id}>
                      {syncing === integ.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                      Sync Now
                    </Button>
                    {integ.id === "salesforce" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setSettingsModal(true)}>
                          <Settings className="h-3.5 w-3.5 mr-1.5" /> Settings
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSyncLogDrawer(true)}>Sync Log</Button>
                      </>
                    )}
                    {integ.id === "stripe" && (
                      <Button size="sm" variant="outline" onClick={() => navigate("/reconciliation")}>View Transactions</Button>
                    )}
                  </>
                ) : (
                  <Button size="sm" onClick={() => setConnectModal(integ.name)}>
                    <Plug className="h-3.5 w-3.5 mr-1.5" /> Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connect Modal */}
      <Dialog open={!!connectModal} onOpenChange={() => setConnectModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect {connectModal}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This integration is available in your plan. Your implementation team will complete the setup.
            </p>
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input defaultValue="admin@brightsideFdn.org" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectModal(null)}>Cancel</Button>
            <Button onClick={() => handleRequestSetup(connectModal!)}>Request Setup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salesforce Settings Modal */}
      <Dialog open={settingsModal} onOpenChange={setSettingsModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salesforce Connection Settings</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <p><span className="text-muted-foreground">Connected account:</span> salesforce.brightsideFdn.org</p>
            <p><span className="text-muted-foreground">Sync frequency:</span> Every 4 hours</p>
            <p><span className="text-muted-foreground">Sync direction:</span> Bidirectional</p>
            <p><span className="text-muted-foreground">Objects synced:</span> Contacts, Opportunities, Campaigns, Tasks</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSettingsModal(false); toast("This action is disabled in demo mode"); }}>Disconnect</Button>
            <Button onClick={() => { setSettingsModal(false); toast.success("Settings saved"); }}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Log Drawer */}
      <Sheet open={syncLogDrawer} onOpenChange={setSyncLogDrawer}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Salesforce Sync Log</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-3">
            {SYNC_LOG.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{entry.time}</p>
                  <p className="text-muted-foreground">{entry.records} records · {entry.changes}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
