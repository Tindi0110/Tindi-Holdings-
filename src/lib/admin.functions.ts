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

export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString();
    const sixtyDaysAgo  = new Date(now - 60 * 86400000).toISOString();

    const [
      { count: ordersCount },
      { count: customersCount },
      { count: productsCount },
      { data: pending },
      { data: lowStock },
      { data: revenueRows },
      { data: prevRevenueRows },
      { count: prevOrdersCount },
      { count: prevCustomersCount },
      { data: recentOrders },
    ] = await Promise.all([
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("orders").select("id", { count: "exact" }).eq("status", "pending"),
      supabaseAdmin.from("products").select("id, name, stock").lt("stock", 10).eq("is_active", true).order("stock", { ascending: true }).limit(8),
      // current 30-day window
      supabaseAdmin.from("orders").select("total, created_at, status").gte("created_at", thirtyDaysAgo),
      // previous 30-day window (30-60 days ago)
      supabaseAdmin.from("orders").select("total").gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
      // previous period order count
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
      // previous period customer signups
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
      // recent orders for dashboard list
      supabaseAdmin.from("orders").select("id, order_number, status, total, created_at, payment_method, payment_status, shipping_name, user_id").order("created_at", { ascending: false }).limit(10),
    ]);

    const totalRevenue = (revenueRows ?? []).reduce((s, r) => s + Number(r.total), 0);
    const prevRevenue  = (prevRevenueRows ?? []).reduce((s, r) => s + Number(r.total), 0);

    // 7-day daily sales series
    const byDay7: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      byDay7[d.toISOString().slice(0, 10)] = 0;
    }
    (revenueRows ?? []).forEach((r) => {
      const k = new Date(r.created_at as string).toISOString().slice(0, 10);
      if (k in byDay7) byDay7[k] += Number(r.total);
    });
    const salesSeries = Object.entries(byDay7).map(([d, v]) => ({ d: d.slice(5), v: Math.round(v) }));

    // 30-day daily sales series
    const byDay30: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      byDay30[d.toISOString().slice(0, 10)] = 0;
    }
    (revenueRows ?? []).forEach((r) => {
      const k = new Date(r.created_at as string).toISOString().slice(0, 10);
      if (k in byDay30) byDay30[k] += Number(r.total);
    });
    const salesSeries30 = Object.entries(byDay30).map(([d, v]) => ({ d: d.slice(5), v: Math.round(v) }));

    return {
      totalRevenue,
      ordersCount:          ordersCount ?? 0,
      customersCount:       customersCount ?? 0,
      productsCount:        productsCount ?? 0,
      pendingCount:         pending?.length ?? 0,
      lowStockCount:        lowStock?.length ?? 0,
      lowStock:             lowStock ?? [],
      recentOrders:         recentOrders ?? [],
      salesSeries,
      salesSeries30,
      prevRevenue,
      prevOrdersCount:      prevOrdersCount ?? 0,
      prevCustomersCount:   prevCustomersCount ?? 0,
    };
  });


export const getBranchAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: branches, error: bErr } = await supabaseAdmin
      .from("branches")
      .select("id, name")
      .eq("is_active", true);
    if (bErr) throw new Error(bErr.message);

    const { data: orders, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("branch_id, total, created_at")
      .not("branch_id", "is", null);
    if (oErr) throw new Error(oErr.message);

    const branchPerf = (branches ?? []).map((b) => {
      const bOrders = (orders ?? []).filter((o) => o.branch_id === b.id);
      const totalRevenue = bOrders.reduce((s, o) => s + Number(o.total), 0);
      return {
        id: b.id,
        name: b.name,
        revenue: totalRevenue,
        orders: bOrders.length,
      };
    });

    return branchPerf;
  });

export const getCustomerAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, created_at, user_roles(role)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const customerGrowth = (profiles as { created_at: string }[] | null)?.reduce(
      (acc: Record<string, number>, p) => {
        const date = new Date(p.created_at).toISOString().slice(0, 7); // YYYY-MM
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {},
    );

    return {
      total: profiles?.length ?? 0,
      recent: profiles?.slice(0, 10) ?? [],
      growth: Object.entries(customerGrowth || {}).map(([month, count]) => ({ month, count })),
    };
  });

export const getSystemActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [orders, products] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id, order_number, shipping_name, created_at, total")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("products")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const events = [
      ...(orders.data ?? []).map((o) => ({
        id: o.id,
        type: "order" as const,
        label: `Order ${o.order_number} placed by ${o.shipping_name || "Guest"}`,
        time: o.created_at,
        value: `KES ${Number(o.total).toLocaleString("en-KE")}`,
      })),
      ...(products.data ?? []).map((p) => ({
        id: p.id,
        type: "product" as const,
        label: `New product added: ${p.name}`,
        time: p.created_at,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return events.slice(0, 15);
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; full_name?: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    // Be careful with delete, maybe just deactivate?
    // For now, literal "delete" as requested for dashboard icons
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, total, created_at, payment_method, payment_status, shipping_name, user_id",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, price, stock, is_active, image_url, categories(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "lowercase, numbers and hyphens only"),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  stock: z.number().int().min(0),
  is_active: z.boolean().default(true),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof productSchema>) => productSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("products").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminBranches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("branches").select("*").order("created_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const branchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const upsertBranch = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof branchSchema>) => branchSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("branches").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("branches").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteBranch = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("branches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return { roles: (data ?? []).map((r) => r.role) };
  });

export const getAdminConsoleState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    const hasAdmin = (admins?.length ?? 0) > 0;
    const isCurrentUserAdmin = (admins ?? []).some((a) => a.user_id === context.userId);
    return { hasAdmin, isCurrentUserAdmin };
  });

export const grantSelfAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Allow the first user, or any user when no admin exists, to claim admin.
    // Useful for bootstrapping the dashboard.
    const { data: existingAdmins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1);
    if (existingAdmins && existingAdmins.length > 0) {
      throw new Error("An admin already exists. Ask an existing admin to grant access.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Stock ─────────────────────────────────────────────── */
export const updateProductStock = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; stock: number }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("products")
      .update({ stock: data.stock })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Categories ─────────────────────────────────────────── */
export const upsertCategory = createServerFn({ method: "POST" })
  .inputValidator((input: { id?: string; name: string; slug: string; icon?: string; sort_order?: number }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("categories").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("categories").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Support Tickets ───────────────────────────────────── */
export const listSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: tickets, error } = await supabaseAdmin
      .from("support_tickets")
      .select("*, support_messages(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    
    return (tickets ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      subsidiary: t.subsidiary,
      channel: t.channel,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: new Date(t.created_at).toLocaleString(),
      messages: (t.support_messages ?? [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          id: m.id,
          sender: m.sender,
          message: m.message,
          createdAt: new Date(m.created_at).toLocaleString(),
        })),
    }));
  });

export const updateSupportTicketStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["Open", "In_Progress", "Resolved"]) }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("support_tickets")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const replyToSupportTicket = createServerFn({ method: "POST" })
  .inputValidator((input: { ticketId: string; message: string }) =>
    z.object({ ticketId: z.string().uuid(), message: z.string().min(1) }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error: msgErr } = await supabaseAdmin
      .from("support_messages")
      .insert({
        ticket_id: data.ticketId,
        sender: "admin",
        message: data.message,
      });
    if (msgErr) throw new Error(msgErr.message);

    const { data: ticket } = await supabaseAdmin
      .from("support_tickets")
      .select("status")
      .eq("id", data.ticketId)
      .maybeSingle();

    if (ticket && ticket.status === "Open") {
      await supabaseAdmin
        .from("support_tickets")
        .update({ status: "In_Progress" })
        .eq("id", data.ticketId);
    }
    return { success: true };
  });

/* ─── Inventory Transfers ───────────────────────────────── */
export const listStockTransfers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: transfers, error } = await supabaseAdmin
      .from("stock_transfers")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (transfers ?? []).map((t: any) => ({
      id: t.id,
      product: t.products?.name ?? "Unknown Product",
      qty: t.quantity,
      source: t.source_branch_id ? "Branch Warehouse" : "Main Warehouse",
      target: "Branch Outlet",
      date: t.created_at,
      status: t.status,
    }));
  });

export const createStockTransfer = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({
      product_id: z.string().uuid(),
      target_branch_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("stock_transfers")
      .insert({
        product_id: data.product_id,
        target_branch_id: data.target_branch_id,
        quantity: data.quantity,
        status: "Pending",
      });
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Inventory Adjustments ─────────────────────────────── */
export const listStockAdjustments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: adjustments, error } = await supabaseAdmin
      .from("stock_adjustments")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (adjustments ?? []).map((a: any) => ({
      id: a.id,
      product: a.products?.name ?? "Unknown Product",
      qty: a.quantity,
      type: a.type,
      reason: a.reason,
      date: a.created_at,
    }));
  });

export const createStockAdjustment = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int(),
      type: z.string(),
      reason: z.string(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    
    // Create adjustment
    const { error: adjErr } = await supabaseAdmin
      .from("stock_adjustments")
      .insert({
        product_id: data.product_id,
        quantity: data.quantity,
        type: data.type,
        reason: data.reason,
      });
    if (adjErr) throw new Error(adjErr.message);

    // Apply adjustment directly to product stock in database
    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", data.product_id)
      .maybeSingle();

    if (prod) {
      await supabaseAdmin
        .from("products")
        .update({ stock: Math.max(0, (prod.stock ?? 0) + data.quantity) })
        .eq("id", data.product_id);
    }

    return { success: true };
  });

/* ─── Coupons (Growth & Marketing) ───────────────────────── */
export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return coupons ?? [];
  });

export const createCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({
      code: z.string().min(3),
      discount_type: z.enum(["percentage", "fixed"]),
      value: z.number().positive(),
      min_spend: z.number().optional(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        value: data.value,
        min_spend: data.min_spend,
      });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Staff Management (Profiles Assignment) ──────────────── */
export const listAllUserProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, branch_id, staff_role");
    if (error) throw new Error(error.message);
    return profiles ?? [];
  });

export const assignStaffMember = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({
      profileId: z.string().uuid(),
      branchId: z.string().uuid().nullable(),
      role: z.string().nullable(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        branch_id: data.branchId,
        staff_role: data.role,
      })
      .eq("id", data.profileId);
    if (error) throw new Error(error.message);
    return { success: true };
  });


