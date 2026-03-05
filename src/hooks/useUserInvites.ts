import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserInvite {
  id: string;
  email: string;
  role: string;
  invited_by: string | null;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

// Fetch all pending invites
export function useUserInvites() {
  return useQuery({
    queryKey: ["user_invites"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_invites")
        .select("*")
        .is("used_at", null)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as UserInvite[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Create a new invite
export function useCreateUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { email: string; role: string }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", params.email)
        .single();

      if (existingProfile) throw new Error("User with this email already exists");

      const { data: existingInvite } = await (supabase as any)
        .from("user_invites")
        .select("id")
        .eq("email", params.email)
        .is("used_at", null)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (existingInvite) throw new Error("An active invitation for this email already exists");

      const { data, error } = await (supabase as any)
        .from("user_invites")
        .insert([{
          email: params.email,
          role: params.role,
          invited_by: currentUser.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as UserInvite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (error: any) => {
      console.error("Error creating invite:", error);
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

// Delete an invite
export function useDeleteUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await (supabase as any)
        .from("user_invites")
        .delete()
        .eq("id", inviteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success("Invitation revoked");
    },
    onError: (error: any) => {
      console.error("Error deleting invite:", error);
      toast.error("Failed to revoke invitation");
    },
  });
}

// Resend an invite
export function useResendUserInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data: invite, error: fetchError } = await (supabase as any)
        .from("user_invites")
        .select("*")
        .eq("id", inviteId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await (supabase as any)
        .from("user_invites")
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          token: crypto.randomUUID(),
        })
        .eq("id", inviteId);

      if (updateError) throw updateError;
      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_invites"] });
      toast.success("Invitation resent");
    },
    onError: (error: any) => {
      console.error("Error resending invite:", error);
      toast.error("Failed to resend invitation");
    },
  });
}
