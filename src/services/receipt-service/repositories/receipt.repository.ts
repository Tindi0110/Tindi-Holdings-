import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DocumentPayload, ReceiptSettings, BuilderConfig, ReceiptStatus, DocumentType } from "../interfaces/types";

export class ReceiptRepository {
  // 1. Create Document Entry
  static async insertDocument(receiptPayload: any) {
    const { data, error } = await supabaseAdmin
      .from("receipts")
      .insert(receiptPayload)
      .select("id")
      .single();

    if (error) throw new Error(`[ReceiptRepository] Failed to insert document: ${error.message}`);
    return data.id;
  }

  // 2. Bulk Insert Items
  static async insertItems(items: any[]) {
    const { error } = await supabaseAdmin
      .from("receipt_items")
      .insert(items);

    if (error) throw new Error(`[ReceiptRepository] Failed to insert receipt items: ${error.message}`);
  }

  // 3. Find specific document details
  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("receipts")
      .select("*, branches(*), receipt_items(*)")
      .eq("id", id)
      .single();

    if (error) throw new Error(`[ReceiptRepository] Document not found: ${error.message}`);
    return data;
  }

  // 4. Find document by receipt number (public search/verification)
  static async findByNumber(receiptNumber: string) {
    const { data, error } = await supabaseAdmin
      .from("receipts")
      .select("*, branches(*)")
      .eq("receipt_number", receiptNumber)
      .maybeSingle();

    if (error) throw new Error(`[ReceiptRepository] Database error fetching document: ${error.message}`);
    return data;
  }

  // 5. Update receipt status
  static async updateStatus(id: string, status: ReceiptStatus, watermark?: string) {
    const payload: any = { status };
    if (watermark) payload.watermark = watermark;

    const { error } = await supabaseAdmin
      .from("receipts")
      .update(payload)
      .eq("id", id);

    if (error) throw new Error(`[ReceiptRepository] Failed to update status: ${error.message}`);
  }

  // 6. Log Receipt Action (Immutable Audit Trail)
  static async logAction(actionLog: {
    receipt_id: string;
    action: string;
    user_id?: string;
    ip_address?: string;
    device?: string;
    browser?: string;
    os?: string;
    details?: any;
  }) {
    const { error } = await supabaseAdmin
      .from("receipt_actions")
      .insert(actionLog);

    if (error) throw new Error(`[ReceiptRepository] Failed to log action: ${error.message}`);
  }

  // 7. Get user receipts
  static async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("receipts")
      .select("*, branches(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`[ReceiptRepository] Failed to fetch customer receipts: ${error.message}`);
    return data ?? [];
  }

  // 8. Search admin documents with dynamic filters
  static async queryAdminReceipts(filters: {
    branchId?: string;
    status?: string;
    documentType?: string;
    dateRange?: { from?: string; to?: string };
    amountRange?: { min?: number; max?: number };
    sortField?: string;
    sortOrder?: "asc" | "desc";
  }) {
    let query = supabaseAdmin
      .from("receipts")
      .select("*, branches(name), profiles(full_name, email), receipt_actions(*)");

    if (filters.branchId) {
      query = query.eq("branch_id", filters.branchId);
    }
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.documentType && filters.documentType !== "all") {
      query = query.eq("document_type", filters.documentType);
    }
    if (filters.dateRange?.from) {
      query = query.gte("created_at", filters.dateRange.from);
    }
    if (filters.dateRange?.to) {
      query = query.lte("created_at", filters.dateRange.to);
    }
    if (filters.amountRange?.min !== undefined) {
      query = query.gte("amount_paid", filters.amountRange.min);
    }
    if (filters.amountRange?.max !== undefined) {
      query = query.lte("amount_paid", filters.amountRange.max);
    }

    const field = filters.sortField || "created_at";
    const order = filters.sortOrder || "desc";
    query = query.order(field, { ascending: order === "asc" });

    const { data, error } = await query;
    if (error) throw new Error(`[ReceiptRepository] Admin query failed: ${error.message}`);
    return data ?? [];
  }

  // 9. Process Refund linked record
  static async insertRefund(refundPayload: {
    refund_number: string;
    original_receipt_id: string;
    refund_amount: number;
    refund_reason: string;
    staff_id?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from("refund_receipts")
      .insert(refundPayload)
      .select("id")
      .single();

    if (error) throw new Error(`[ReceiptRepository] Failed to insert refund entry: ${error.message}`);
    return data.id;
  }

  // 10. Get settings (Global vs Branch Specific)
  static async getBrandingSettings(branchId: string | null) {
    const { data, error } = await supabaseAdmin
      .from("receipt_settings")
      .select("*")
      .eq("branch_id", branchId as any)
      .maybeSingle();

    if (error) throw new Error(`[ReceiptRepository] Failed to fetch settings: ${error.message}`);
    return data;
  }

  // 11. Update settings
  static async upsertBrandingSettings(settings: ReceiptSettings) {
    const { error } = await supabaseAdmin
      .from("receipt_settings")
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: "branch_id" });

    if (error) throw new Error(`[ReceiptRepository] Failed to update settings: ${error.message}`);
  }

  // 12. Get Visual Layout Config
  static async getBuilderConfig(branchId: string | null) {
    const { data, error } = await supabaseAdmin
      .from("receipt_builder_config")
      .select("*")
      .eq("branch_id", branchId as any)
      .maybeSingle();

    if (error) throw new Error(`[ReceiptRepository] Failed to fetch builder config: ${error.message}`);
    return data;
  }

  // 13. Update Visual Layout Config
  static async upsertBuilderConfig(config: BuilderConfig) {
    const { error } = await supabaseAdmin
      .from("receipt_builder_config")
      .upsert({
        ...config,
        updated_at: new Date().toISOString()
      }, { onConflict: "branch_id" });

    if (error) throw new Error(`[ReceiptRepository] Failed to save builder configuration: ${error.message}`);
  }

  // 14. Bulk Operations
  static async bulkArchive(ids: string[]) {
    const { error } = await supabaseAdmin
      .from("receipts")
      .update({ is_archived: true, status: "archived" as any })
      .in("id", ids);
    if (error) throw new Error(error.message);
  }

  static async bulkDelete(ids: string[]) {
    const { error } = await supabaseAdmin
      .from("receipts")
      .delete()
      .in("id", ids);
    if (error) throw new Error(error.message);
  }
}
