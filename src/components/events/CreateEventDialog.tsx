import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildEventSlug } from "@/lib/eventSlug";
import { useCreateNonprofitEvent } from "@/hooks/useNonprofitEvents";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  event_time: z.string().optional(),
  location: z.string().min(3, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
  registration_url: z.union([z.literal(""), z.string().url("Enter a valid URL")]).optional(),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

interface CreateEventDialogProps {
  open: boolean;
  userId: string | undefined;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventDialog({ open, userId, onOpenChange }: CreateEventDialogProps) {
  const createEvent = useCreateNonprofitEvent();

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      date: "",
      event_time: "",
      location: "",
      capacity: 100,
      description: "",
      registration_url: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) form.reset();
  };

  const onSubmit = async (data: CreateEventForm) => {
    const eventId = crypto.randomUUID();
    await createEvent.mutateAsync({
      id: eventId,
      title: data.title,
      date: data.date,
      event_time: data.event_time?.trim() || null,
      location: data.location,
      capacity: data.capacity,
      description: data.description?.trim() || null,
      registration_url: data.registration_url?.trim() || null,
      status: "Upcoming",
      page_layout: "classic",
      created_by: userId ?? null,
      slug: buildEventSlug(data.title, eventId),
      is_public: false,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-title">Event Title</Label>
            <Input id="create-ev-title" placeholder="Annual Fundraising Gala" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-date">Date</Label>
            <Input id="create-ev-date" type="date" {...form.register("date")} />
            {form.formState.errors.date && (
              <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-time">Time (optional)</Label>
            <Input id="create-ev-time" type="time" {...form.register("event_time")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-location">Location</Label>
            <Input id="create-ev-location" placeholder="Venue name or address" {...form.register("location")} />
            {form.formState.errors.location && (
              <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-capacity">Capacity</Label>
            <Input id="create-ev-capacity" type="number" min={1} {...form.register("capacity")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-desc">Description (optional)</Label>
            <Textarea id="create-ev-desc" placeholder="Describe your event…" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-ev-registration-url">Registration link (optional)</Label>
            <Input
              id="create-ev-registration-url"
              type="url"
              placeholder="https://example.com/register"
              {...form.register("registration_url")}
            />
            {form.formState.errors.registration_url && (
              <p className="text-xs text-destructive">{form.formState.errors.registration_url.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
