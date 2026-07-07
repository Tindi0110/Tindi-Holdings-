import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyReceipts,
  getReceiptDetails,
  logReceiptAction,
  emailReceipt,
  getReceiptAnalytics,
  getReceiptSettings,
  updateReceiptSettings,
  refundReceipt,
  bulkAction,
} from "@/lib/receipts.functions";
import { toast } from "sonner";

export function useReceiptService(activeReceiptId?: string | null) {
  const queryClient = useQueryClient();

  // Queries
  const useMyReceipts = () =>
    useQuery({
      queryKey: ["my-receipts"],
      queryFn: () => listMyReceipts(),
    });

  const useDetails = (id?: string | null) =>
    useQuery({
      queryKey: ["receipt-details", id],
      queryFn: () => getReceiptDetails({ data: { id: id! } }),
      enabled: !!id,
    });

  const useAnalytics = (isAdmin: boolean) =>
    useQuery({
      queryKey: ["admin", "receipt-analytics"],
      queryFn: () => getReceiptAnalytics(),
      enabled: isAdmin,
    });

  const useSettings = () =>
    useQuery({
      queryKey: ["admin", "receipt-settings"],
      queryFn: () => getReceiptSettings(),
    });

  // Mutations
  const logAction = useMutation({
    mutationFn: (vars: { id: string; action: string; metadata?: any }) =>
      logReceiptAction({
        data: {
          receiptId: vars.id,
          action: vars.action,
          metadata: {
            ...vars.metadata,
            userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
            ipAddress: "127.0.0.1",
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-receipts"] });
      if (activeReceiptId) {
        queryClient.invalidateQueries({ queryKey: ["receipt-details", activeReceiptId] });
      }
    },
  });

  const sendEmail = useMutation({
    mutationFn: (vars: { id: string; email: string }) =>
      emailReceipt({ data: { receiptId: vars.id, email: vars.email } }),
    onSuccess: () => {
      toast.success("Receipt successfully queued for email dispatch!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to dispatch email. Failure logged.");
    },
  });

  const updateSettings = useMutation({
    mutationFn: (vars: any) => updateReceiptSettings({ data: vars }),
    onSuccess: () => {
      toast.success("Branding configurations saved!");
      queryClient.invalidateQueries({ queryKey: ["admin", "receipt-settings"] });
    },
  });

  const processRefund = useMutation({
    mutationFn: (vars: { id: string; amount: number; reason: string }) =>
      refundReceipt({ data: { receiptId: vars.id, amount: vars.amount, reason: vars.reason } }),
    onSuccess: () => {
      toast.success("Refund voucher generated!");
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const triggerBulk = useMutation({
    mutationFn: (vars: { ids: string[]; action: "archive" | "delete" | "email" }) =>
      bulkAction({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(`Bulk operations completed: ${vars.action}`);
      queryClient.invalidateQueries();
    },
  });

  return {
    useMyReceipts,
    useDetails,
    useAnalytics,
    useSettings,
    logAction,
    sendEmail,
    updateSettings,
    processRefund,
    triggerBulk,
  };
}
export type ReceiptServiceHook = ReturnType<typeof useReceiptService>;
