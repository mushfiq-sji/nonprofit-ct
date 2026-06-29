import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PenTool, Copy, RefreshCw, Loader2, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_GRANTS, DEMO_PROGRAMS } from "@/shared/data/nonprofitDemoData";
import { buildGrantWriterDummyDraft, simulateAgentDelay } from "@/lib/agentDummyData";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";

const WRITING_SECTIONS = [
  "Statement of Need",
  "Program Narrative",
  "Evaluation Plan",
  "Budget Justification",
  "Executive Summary",
] as const;

type WritingSection = (typeof WRITING_SECTIONS)[number];

const demoActiveGrants = DEMO_GRANTS.grants.filter((g) => g.status === "active");

export default function GrantWriterAgentDetail() {
  const [selectedGrantName, setSelectedGrantName] = useState(demoActiveGrants[0]?.name ?? "");
  const [selectedProgramIds, setSelectedProgramIds] = useState<Set<string>>(new Set());
  const [selectedSection, setSelectedSection] = useState<WritingSection>("Statement of Need");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [usedDemo, setUsedDemo] = useState(false);

  const selectedGrant = demoActiveGrants.find((g) => g.name === selectedGrantName);
  const selectedPrograms = DEMO_PROGRAMS.filter((p) => selectedProgramIds.has(p.id));
  const canGenerate = !!selectedGrant && !!selectedSection;

  const toggleProgram = (id: string) => {
    setSelectedProgramIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateDraft = useCallback(async (): Promise<{ text: string; isDemo: boolean }> => {
    if (!selectedGrant) throw new Error("No grant selected");

    const programNames = selectedPrograms.map((p) => p.name);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-grant-draft", {
        body: {
          grant: selectedGrant,
          programs: selectedPrograms,
          section: selectedSection,
        },
      });
      if (fnError) throw fnError;
      if (data?.draft) {
        return { text: data.draft as string, isDemo: false };
      }
      throw new Error("No draft received");
    } catch {
      await simulateAgentDelay();
      return {
        text: buildGrantWriterDummyDraft(selectedGrant, selectedSection, programNames),
        isDemo: true,
      };
    }
  }, [selectedGrant, selectedPrograms, selectedSection]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setDraft(null);
    try {
      const { text, isDemo } = await generateDraft();
      setDraft(text);
      setUsedDemo(isDemo);
      toast.success(isDemo ? "Demo draft generated" : "Draft generated");
    } finally {
      setLoading(false);
    }
  };

  useLiveAgentDetailBootstrap({
    run: async () => {
      if (!canGenerate) return { text: "", isDemo: false };
      setLoading(true);
      try {
        return await generateDraft();
      } finally {
        setLoading(false);
      }
    },
    apply: (payload) => {
      if (payload.text) {
        setDraft(payload.text);
        setUsedDemo(payload.isDemo);
        toast.success("Draft ready", { description: selectedSection });
      }
    },
    enabled: canGenerate,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-rose-500" />
            Grant narrative draft
          </CardTitle>
          <CardDescription>
            Draft need statements, outcomes narratives, and budget justification from your grants
            pipeline and program data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Select grant</Label>
              <Select value={selectedGrantName} onValueChange={setSelectedGrantName}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an active grant…" />
                </SelectTrigger>
                <SelectContent>
                  {demoActiveGrants.map((g) => (
                    <SelectItem key={g.name} value={g.name}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Writing section</Label>
              <Select
                value={selectedSection}
                onValueChange={(v) => setSelectedSection(v as WritingSection)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRITING_SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Programs to include</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_PROGRAMS.filter((p) => p.status === "active").map((program) => (
                <div key={program.id} className="flex items-start gap-2.5">
                  <Checkbox
                    id={`gw-${program.id}`}
                    checked={selectedProgramIds.has(program.id)}
                    onCheckedChange={() => toggleProgram(program.id)}
                    className="mt-0.5"
                  />
                  <label htmlFor={`gw-${program.id}`} className="text-sm cursor-pointer">
                    {program.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} disabled={!canGenerate || loading} className="gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <PenTool className="h-4 w-4" />
                  Generate section
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/grant-writer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open full Grant Writer
              </Link>
            </Button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            AI uses your program outcomes, budget data, and impact metrics. Demo drafts load when
            the cloud function is unavailable.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {draft && !loading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{selectedSection}</CardTitle>
            {selectedGrant && (
              <CardDescription>
                {selectedGrant.name} · {selectedGrant.funder}
                {usedDemo && " · demo draft"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border">
              {draft}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(draft);
                  toast.success("Draft copied");
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
