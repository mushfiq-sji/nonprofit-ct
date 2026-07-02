import { cn } from "@/lib/utils";
import { EVENT_PAGE_LAYOUTS, type EventPageLayoutId } from "@/lib/eventPageLayouts";

export function LayoutPreviewMockup({ layoutId }: { layoutId: EventPageLayoutId }) {
  if (layoutId === "split") {
    return (
      <div className="rounded-md border bg-muted/40 p-2 space-y-1.5">
        <div className="h-14 rounded bg-gradient-to-r from-[#1B2D4F]/80 to-[#4A7BA7]/60 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2/3 rounded bg-white/30" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-background/80" />
          <div className="h-7 rounded bg-background/80" />
          <div className="h-7 rounded bg-background/80" />
        </div>
        <div className="h-6 rounded bg-[#1B2D4F]/70" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-5 rounded bg-background/60" />
          <div className="h-5 rounded bg-background/80 border" />
        </div>
        <div className="h-4 rounded bg-muted" />
        <div className="h-3 rounded bg-[#152340]/80" />
      </div>
    );
  }

  if (layoutId === "minimal") {
    return (
      <div className="rounded-md border bg-[#FAF8F5] p-2 space-y-1.5 text-center">
        <div className="mx-auto h-2 w-1/3 rounded bg-foreground/15" />
        <div className="mx-auto h-5 w-full rounded bg-muted" />
        <div className="mx-auto h-2 w-1/2 rounded bg-foreground/10" />
        <div className="mx-auto h-4 w-20 rounded-full bg-[#1B2D4F]/80" />
        <div className="space-y-1 pt-1">
          <div className="h-3 w-full rounded border bg-white" />
          <div className="h-3 w-full rounded border bg-white" />
          <div className="h-3 w-full rounded border bg-white" />
        </div>
        <div className="h-4 rounded bg-white border" />
        <div className="mx-auto h-3 w-16 rounded bg-[#1B2D4F]/70" />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white p-2 space-y-1.5">
      <div className="h-8 rounded bg-[#1B2D4F]/90 p-1.5">
        <div className="grid grid-cols-2 gap-1.5 items-center h-full">
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-white/30" />
            <div className="h-1.5 w-3/4 rounded bg-white/20" />
          </div>
          <div className="aspect-[4/3] rounded bg-white/20" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-1 col-span-2">
          <div className="h-2 w-full rounded bg-foreground/10" />
          <div className="h-2 w-4/5 rounded bg-foreground/10" />
          <div className="h-2 w-3/5 rounded bg-foreground/10" />
        </div>
      </div>
      <div className="h-5 rounded bg-[#E8F4FC]" />
      <div className="h-4 rounded border bg-[#FAF8F5]" />
      <div className="h-3 rounded bg-[#1B2D4F]/80" />
    </div>
  );
}

interface LayoutPickerGridProps {
  onSelectLayout: (layoutId: EventPageLayoutId) => void;
  selectedLayout?: EventPageLayoutId | null;
}

export function LayoutPickerGrid({ onSelectLayout, selectedLayout }: LayoutPickerGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {EVENT_PAGE_LAYOUTS.map((layout) => (
        <button
          key={layout.id}
          type="button"
          onClick={() => onSelectLayout(layout.id)}
          className={cn(
            "rounded-lg border p-3 text-left transition-all",
            "hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedLayout === layout.id && "border-primary ring-2 ring-primary/20",
          )}
        >
          <LayoutPreviewMockup layoutId={layout.id} />
          <p className="mt-3 text-sm font-semibold">{layout.label}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">{layout.description}</p>
        </button>
      ))}
    </div>
  );
}
