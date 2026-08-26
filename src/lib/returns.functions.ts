import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export type ReturnStatus =
  | "requested"
  | "approved"
  | "pickup_scheduled"
  | "in_transit"
  | "received"
  | "inspecting"
  | "refunded"
  | "rejected"
  | "cancelled";

export type ReturnReasonCategory =
  | "defective"
  | "damaged_on_delivery"
  | "wrong_item"
  | "not_as_described"
  | "missing_parts"
  | "changed_mind";

const initiateReturnSchema = z.object({
  orderId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      productName: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ),
  reasonCategory: z.enum([
    "defective",
    "damaged_on_delivery",
    "wrong_item",
    "not_as_described",
    "missing_parts",
    "changed_mind",
  ]),
  reasonTitle: z.string().min(3),
  reasonDetails: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  pickupMethod: z.enum(["express_pickup", "drop_off"]).default("express_pickup"),
  pickupAddress: z.string().optional(),
  dropoffBranchName: z.string().optional(),
  refundMethod: z.enum(["mpesa", "store_credit", "bank_transfer", "original_payment"]).default("mpesa"),
  refundPhone: z.string().optional(),
  refundAccountName: z.string().optional(),
  refundBankName: z.string().optional(),
  refundAccountNumber: z.string().optional(),
});

// 1. Customer Initiates a Return Request (Jumia Style)
export const initiateReturnRequest = createServerFn({ method: "POST" })
  .inputValidator((input: any) => initiateReturnSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Fetch order details & verify ownership
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("*, profiles:user_id(full_name, email, phone)")
      .eq("id", data.orderId)
      .single();

    if (orderErr || !order) {
      throw new Error("Order not found or access denied");
    }

    if (order.user_id !== userId) {
      throw new Error("Unauthorized: you do not own this order");
    }

    // Check return window eligibility (14 days from order creation/delivery)
    const orderDate = new Date(order.created_at).getTime();
    const daysSinceOrder = (Date.now() - orderDate) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 14) {
      throw new Error("Return window expired: returns must be initiated within 14 days of delivery");
    }

    // Check if return already requested for this order
    const { data: existingReturn } = await supabaseAdmin
      .from("return_requests")
      .select("id, return_number, status")
      .eq("order_id", data.orderId)
      .neq("status", "cancelled")
      .neq("status", "rejected")
      .maybeSingle();

    if (existingReturn) {
      throw new Error(`A return request (${existingReturn.return_number}) is already active for this order.`);
    }

    // Calculate total refund amount for returned items
    const refundAmount = data.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const returnNumber = `RMA-${dateStr}-${randomSuffix}`;
    const waybillNumber = `WAY-RET-${dateStr}-${randomSuffix}`;

    const profileData = order.profiles as any;
    const customerName = order.shipping_name || profileData?.full_name || "Valued Customer";
    const customerPhone = data.refundPhone || order.shipping_phone || profileData?.phone || "";
    const customerEmail = profileData?.email || "";

    const returnPayload = {
      return_number: returnNumber,
      order_id: data.orderId,
      order_number: order.order_number,
      user_id: userId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      branch_id: order.branch_id,
      status: "requested" as ReturnStatus,
      reason_category: data.reasonCategory,
      reason_title: data.reasonTitle,
      reason_details: data.reasonDetails || "",
      images: data.images || [],
      items: data.items,
      pickup_method: data.pickupMethod,
      pickup_address: data.pickupAddress || `${order.shipping_address}, ${order.shipping_city}`,
      dropoff_branch_name: data.dropoffBranchName || "Nairobi Westlands Hub",
      refund_method: data.refundMethod,
      refund_phone: customerPhone,
      refund_account_name: data.refundAccountName || null,
      refund_bank_name: data.refundBankName || null,
      refund_account_number: data.refundAccountNumber || null,
      refund_amount: refundAmount > 0 ? refundAmount : Number(order.total),
      waybill_number: waybillNumber,
      tracking_number: `TRK-RET-${dateStr}-${randomSuffix}`,
    };

    const { data: createdReturn, error: insertErr } = await supabaseAdmin
      .from("return_requests")
      .insert(returnPayload)
      .select()
      .single();

    if (insertErr || !createdReturn) {
      // Fallback: in case return_requests table is created via returns fallback
      const { data: fallbackReturn, error: fbErr } = await supabaseAdmin
        .from("returns")
        .insert({
          rma_number: returnNumber,
          order_number: order.order_number,
          customer_name: customerName,
          product_name: data.items.map((i) => i.productName).join(", "),
          amount: refundAmount > 0 ? refundAmount : Number(order.total),
          reason: `[${data.reasonCategory}] ${data.reasonTitle}: ${data.reasonDetails || ""}`,
          refund_method: data.refundMethod === "mpesa" ? "M-Pesa" : data.refundMethod,
          resolution_type: "refund",
          status: "pending_inspection",
        })
        .select()
        .single();

      if (fbErr) throw new Error(insertErr?.message || fbErr.message);

      return {
        returnId: fallbackReturn.id,
        returnNumber,
        status: "requested",
        refundAmount: fallbackReturn.amount,
        waybillNumber,
      };
    }

    // Insert timeline event
    try {
      await supabaseAdmin.from("return_events").insert({
        return_id: createdReturn.id,
        status: "requested",
        title: "Return Request Received",
        description: `Customer submitted return request for ${data.items.length} item(s). Reason: ${data.reasonTitle}. Verification pending.`,
        location: "Customer Online Portal",
        actor_name: "Customer (Online)",
      });
    } catch (e) {
      // ignore
    }

    // Create Admin notification
    try {
      await supabaseAdmin.from("notifications").insert({
        title: "New Return Request (RMA)",
        message: `${customerName} initiated return ${returnNumber} for Order #${order.order_number} (KES ${refundAmount.toLocaleString()})`,
        type: "info",
      });
    } catch (e) {
      // ignore
    }

    return {
      returnId: createdReturn.id,
      returnNumber,
      status: createdReturn.status,
      refundAmount: createdReturn.refund_amount,
      waybillNumber,
    };
  });

// 2. List Customer's Returns
export const listMyReturns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: requests, error } = await supabaseAdmin
      .from("return_requests")
      .select("*, return_events(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback from returns table
      const { data: fbData } = await supabaseAdmin
        .from("returns")
        .select("*")
        .order("created_at", { ascending: false });

      return (fbData ?? []).map((r) => ({
        id: r.id,
        return_number: r.rma_number || `RMA-${r.id.slice(0, 8)}`,
        order_number: r.order_number || "ORD-RECENT",
        customer_name: r.customer_name,
        reason_title: r.reason,
        reason_category: "defective",
        status: r.status === "refund_issued" ? "refunded" : r.status === "pending_inspection" ? "inspecting" : "requested",
        refund_amount: r.amount,
        refund_method: r.refund_method || "M-Pesa",
        items: [{ productName: r.product_name || "Returned Item", quantity: 1, unitPrice: r.amount }],
        created_at: r.created_at,
        return_events: [],
      }));
    }

    return requests ?? [];
  });

// 3. Get Single Return Request Details
export const getReturnDetails = createServerFn({ method: "POST" })
  .inputValidator((input: { returnNumber?: string; returnId?: string }) =>
    z
      .object({
        returnNumber: z.string().optional(),
        returnId: z.string().optional(),
      })
      .parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { userId } = context;

    let query = supabaseAdmin
      .from("return_requests")
      .select("*, return_events(*), orders(*)")
      .order("created_at", { referencedTable: "return_events", ascending: true });

    if (data.returnId) {
      query = query.eq("id", data.returnId);
    } else if (data.returnNumber) {
      query = query.eq("return_number", data.returnNumber);
    } else {
      throw new Error("returnId or returnNumber is required");
    }

    const { data: ret, error } = await query.maybeSingle();

    if (error || !ret) throw new Error("Return record not found");

    // Check authorization: Owner or Admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole && ret.user_id !== userId) {
      throw new Error("Unauthorized access to return details");
    }

    return ret;
  });

// 4. Admin: List All Return Requests with Filters
export const listAdminReturns = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      status?: string;
      search?: string;
      branchId?: string;
      dateRange?: { from?: string; to?: string };
    }) =>
      z
        .object({
          status: z.string().optional(),
          search: z.string().optional(),
          branchId: z.string().uuid().optional(),
          dateRange: z.object({ from: z.string().optional(), to: z.string().optional() }).optional(),
        })
        .parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);

    let query = supabaseAdmin
      .from("return_requests")
      .select("*, return_events(*)")
      .order("created_at", { ascending: false });

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    if (data.branchId) {
      query = query.eq("branch_id", data.branchId);
    }

    if (data.dateRange?.from) {
      query = query.gte("created_at", data.dateRange.from);
    }
    if (data.dateRange?.to) {
      query = query.lte("created_at", data.dateRange.to);
    }

    const { data: returnsData, error } = await query;

    if (error) {
      // Fallback from returns table
      const { data: legacy } = await supabaseAdmin
        .from("returns")
        .select("*")
        .order("created_at", { ascending: false });

      const mapped = (legacy ?? []).map((r) => ({
        id: r.id,
        return_number: r.rma_number || `RMA-${r.id.slice(0, 8)}`,
        order_number: r.order_number || "N/A",
        customer_name: r.customer_name,
        customer_phone: "254700000000",
        customer_email: "customer@tindiholdings.co.ke",
        reason_title: r.reason,
        reason_category: "defective",
        status: r.status === "refund_issued" ? "refunded" : "requested",
        refund_amount: r.amount,
        refund_method: r.refund_method || "M-Pesa",
        items: [{ productName: r.product_name, quantity: 1, unitPrice: r.amount }],
        created_at: r.created_at,
        updated_at: r.updated_at || r.created_at,
        return_events: [],
      }));

      return mapped;
    }

    let results = returnsData ?? [];
    if (data.search) {
      const s = data.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.return_number?.toLowerCase().includes(s) ||
          r.order_number?.toLowerCase().includes(s) ||
          r.customer_name?.toLowerCase().includes(s) ||
          r.customer_phone?.toLowerCase().includes(s) ||
          r.reason_title?.toLowerCase().includes(s)
      );
    }

    return results;
  });

// 5. Admin: Update Return Request Lifecycle State
export const adminUpdateReturnStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      returnId: string;
      status: ReturnStatus;
      adminNotes?: string;
      rejectionReason?: string;
      inspectionNotes?: string;
      inspectionPassed?: boolean;
      refundReference?: string;
      voucherCode?: string;
    }) =>
      z
        .object({
          returnId: z.string().uuid(),
          status: z.enum([
            "requested",
            "approved",
            "pickup_scheduled",
            "in_transit",
            "received",
            "inspecting",
            "refunded",
            "rejected",
            "cancelled",
          ]),
          adminNotes: z.string().optional(),
          rejectionReason: z.string().optional(),
          inspectionNotes: z.string().optional(),
          inspectionPassed: z.boolean().optional(),
          refundReference: z.string().optional(),
          voucherCode: z.string().optional(),
        })
        .parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);

    const updatePayload: any = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };

    if (data.adminNotes !== undefined) updatePayload.admin_notes = data.adminNotes;
    if (data.rejectionReason !== undefined) updatePayload.rejection_reason = data.rejectionReason;
    if (data.inspectionNotes !== undefined) updatePayload.inspection_notes = data.inspectionNotes;
    if (data.inspectionPassed !== undefined) updatePayload.inspection_passed = data.inspectionPassed;
    if (data.refundReference !== undefined) updatePayload.refund_reference = data.refundReference;
    if (data.voucherCode !== undefined) updatePayload.voucher_code = data.voucherCode;

    const { data: updated, error } = await supabaseAdmin
      .from("return_requests")
      .update(updatePayload)
      .eq("id", data.returnId)
      .select()
      .single();

    if (error) {
      // Also update legacy returns table if present
      await supabaseAdmin
        .from("returns")
        .update({
          status: data.status === "refunded" ? "refund_issued" : data.status,
          staff_notes: data.adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.returnId);
    }

    // Insert timeline event
    let eventTitle = "Return Status Updated";
    let eventDescription = `Return status changed to ${data.status.replace(/_/g, " ")}.`;

    switch (data.status) {
      case "approved":
        eventTitle = "Return Request Approved";
        eventDescription =
          "Return request authorized. Dispatch scheduled for courier pickup / drop-off station verification.";
        break;
      case "pickup_scheduled":
        eventTitle = "Courier Pickup Scheduled";
        eventDescription = "Tindi Express logistics rider assigned to collect the package.";
        break;
      case "in_transit":
        eventTitle = "Package In Transit to Central Hub";
        eventDescription = "Item collected and traveling to Central Inspection Warehouse.";
        break;
      case "received":
        eventTitle = "Item Received at Warehouse";
        eventDescription = "Package arrived at Tindi Central Fulfillment & Inspection Facility.";
        break;
      case "inspecting":
        eventTitle = "Quality Control Inspection in Progress";
        eventDescription = data.inspectionNotes || "Staff inspecting condition, seal, and accessories.";
        break;
      case "refunded":
        eventTitle = "Refund Issued Successfully";
        eventDescription = `Disbursement processed via ${updated?.refund_method?.toUpperCase() || "M-PESA"}. Reference: ${data.refundReference || "N/A"}.`;
        break;
      case "rejected":
        eventTitle = "Return Request Declined";
        eventDescription = data.rejectionReason || "Item did not meet return policy criteria.";
        break;
    }

    try {
      await supabaseAdmin.from("return_events").insert({
        return_id: data.returnId,
        status: data.status,
        title: eventTitle,
        description: eventDescription,
        location: "Tindi Central Operations Hub",
        actor_name: "Admin Fulfillment Team",
      });
    } catch (e) {
      // ignore
    }

    return { success: true, return: updated };
  });

// 6. Get Jumia-Style Order Tracking Progression & Telemetry
export const getOrderTrackingDetails = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { orderNumber?: string; orderId?: string; email?: string; phone?: string }) =>
      z
        .object({
          orderNumber: z.string().optional(),
          orderId: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
        })
        .parse(input)
  )
  .handler(async ({ data }) => {
    let query = supabaseAdmin.from("orders").select("*, order_items(*), branches(*)");

    if (data.orderId) {
      query = query.eq("id", data.orderId);
    } else if (data.orderNumber) {
      query = query.eq("order_number", data.orderNumber);
    } else {
      throw new Error("Order number or ID is required");
    }

    const { data: order, error } = await query.maybeSingle();
    if (error || !order) throw new Error("Order not found with provided identifiers");

    // Optional verification if email or phone is passed
    if (data.email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .maybeSingle();

      if (profile && profile.email.toLowerCase() !== data.email.toLowerCase()) {
        throw new Error("Order does not match the provided email address");
      }
    }

    // Check if return exists for this order
    const { data: activeReturn } = await supabaseAdmin
      .from("return_requests")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle();

    // Generate Jumia-style 5-stage tracking progression
    const placedDate = new Date(order.created_at);
    const dateFormatted = placedDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const statusNorm = order.status.toLowerCase();

    // Map stages: 1. Placed, 2. Processing/Packed, 3. Dispatched, 4. Out for Delivery, 5. Delivered
    let currentStep = 1;
    if (statusNorm === "processing") currentStep = 2;
    else if (statusNorm === "shipped" || statusNorm === "dispatched") currentStep = 3;
    else if (statusNorm === "delivered" || statusNorm === "completed") currentStep = 5;
    else if (statusNorm === "cancelled") currentStep = 0;

    const stages = [
      {
        step: 1,
        title: "Order Placed",
        description: "Payment confirmed & order logged in executive queue",
        timestamp: placedDate.toLocaleString(),
        completed: currentStep >= 1 && currentStep !== 0,
        active: currentStep === 1,
      },
      {
        step: 2,
        title: "Order Processing & Packed",
        description: "Items picked and packaged at Central Fulfillment Facility",
        timestamp: currentStep >= 2 ? new Date(placedDate.getTime() + 3600000 * 2).toLocaleString() : "Pending",
        completed: currentStep >= 2,
        active: currentStep === 2,
      },
      {
        step: 3,
        title: "Dispatched & In Transit",
        description: "Handed over to Tindi Express Logistics courier vehicle",
        timestamp: currentStep >= 3 ? new Date(placedDate.getTime() + 3600000 * 5).toLocaleString() : "Pending",
        completed: currentStep >= 3,
        active: currentStep === 3,
      },
      {
        step: 4,
        title: "Out for Delivery",
        description: "Rider dispatched for last-mile doorstep delivery",
        timestamp: currentStep >= 4 ? new Date(placedDate.getTime() + 3600000 * 7).toLocaleString() : "Pending",
        completed: currentStep >= 4,
        active: currentStep === 4,
      },
      {
        step: 5,
        title: "Delivered & Completed",
        description: "Package received & verified. 14-Day Return Window Active",
        timestamp: currentStep >= 5 ? new Date(placedDate.getTime() + 3600000 * 9).toLocaleString() : "Pending",
        completed: currentStep >= 5,
        active: currentStep === 5,
      },
    ];

    // Build timeline checkpoint events
    const timeline = [
      {
        title: "Order Received & Verified",
        location: "Nairobi Central Online Hub",
        time: placedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: dateFormatted,
        completed: true,
      },
    ];

    if (currentStep >= 2) {
      timeline.push({
        title: "Quality Check & Package Sealed",
        location: "Mombasa Road Fulfillment Center, Bay 4",
        time: "11:30 AM",
        date: dateFormatted,
        completed: true,
      });
    }

    if (currentStep >= 3) {
      timeline.push({
        title: "Assigned to Express Delivery Route",
        location: "Westlands Regional Dispatch Hub",
        time: "01:15 PM",
        date: dateFormatted,
        completed: true,
      });
    }

    if (currentStep >= 4) {
      timeline.push({
        title: "Out with Courier Rider for Doorstep Drop",
        location: `${order.shipping_city || "Nairobi"} Metro Sector`,
        time: "02:45 PM",
        date: dateFormatted,
        completed: true,
      });
    }

    if (currentStep >= 5) {
      timeline.push({
        title: "Successfully Handed to Consignee & Signed",
        location: `${order.shipping_address || "Customer Address"}, ${order.shipping_city || "Nairobi"}`,
        time: "03:30 PM",
        date: dateFormatted,
        completed: true,
      });
    }

    // Check return eligibility
    const daysSince = (Date.now() - placedDate.getTime()) / (1000 * 60 * 60 * 24);
    const returnEligible = (statusNorm === "delivered" || statusNorm === "completed") && daysSince <= 14;

    return {
      order,
      stages,
      currentStep,
      timeline: timeline.reverse(),
      returnEligible,
      daysRemainingInReturnWindow: returnEligible ? Math.max(0, Math.ceil(14 - daysSince)) : 0,
      activeReturn,
      courier: {
        carrier: "Tindi Express Logistics",
        trackingCode: `TRK-${order.order_number.replace(/[^0-9]/g, "") || "99281"}`,
        driverName: "Dennis Kamau",
        driverPhone: "+254 712 345 678",
        estimatedArrival: "Same Day (1-3 Hours from dispatch)",
      },
    };
  });
