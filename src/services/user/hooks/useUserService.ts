import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile, listAdminUsers, assignRole } from "../core/user.service";
import { toast } from "sonner";

export function useMyProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => getMyProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { full_name?: string; avatar_url?: string }) =>
      updateMyProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminUsers(filter?: { search?: string; branchId?: string }) {
  return useQuery({
    queryKey: ["admin", "users", filter],
    queryFn: () => listAdminUsers({ data: filter ?? {} }),
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; role: string }) => assignRole({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role updated!");
    },
  });
}