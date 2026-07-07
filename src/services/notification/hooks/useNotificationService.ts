import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications, getUnreadCount, markAsRead, markAllRead, sendNotification, deleteNotification } from "../core/notification.service";
import { toast } from "sonner";

export function useNotifications() {
  return useQuery({ queryKey: ["notifications", "list"], queryFn: () => getMyNotifications() });
}

export function useUnreadCount() {
  return useQuery({ queryKey: ["notifications", "unread-count"], queryFn: () => getUnreadCount() });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All marked as read");
    }
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) => sendNotification({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
}