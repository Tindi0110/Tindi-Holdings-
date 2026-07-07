import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ReturnsRepository } from "../repositories/returns.repository";

export const requestReturn = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    receiptId: z.string().uuid(),
    reason: z.string().min(1),
    amount: z.number().positive(),
    description: z.string()
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refundNumber = `REF-${dateStr}-${randomSuffix}`;

    const ret = await ReturnsRepository.insertReturn({
      refund_number: refundNumber,
      original_receipt_id: data.receiptId,
      refund_amount: data.amount,
      refund_reason: `${data.reason}: ${data.description}`,
      staff_id: null
    });

    // Update original receipt status to 'refunded'
    const { ReceiptService } = await import("../receipt-service/core/receipt.service");
    await ReceiptService.refundDocument(data.receiptId, data.amount, data.reason, context.userId);

    return ret;
  });

export const getMyReturns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    return ReturnsRepository.findByUserId(context.userId);
  });

export const getAdminReturns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    // Admin check
    const { data: roleData } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!roleData) throw new Error("Forbidden: Admin privileges required.");

    return ReturnsRepository.findAll();
  });