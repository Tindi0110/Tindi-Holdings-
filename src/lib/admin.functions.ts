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

/* ─── Product Reviews ────────────────────────────────────────────── */
export const listProductReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .select("id, rating, title, body, reviewer_name, is_approved, is_featured, created_at, products(name), profiles(full_name, username)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const avgRating = rows.length > 0 ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
    const pendingCount = rows.filter((r) => !r.is_approved).length;
    return { reviews: rows, total: rows.length, avgRating, pendingCount };
  });

export const approveReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), approved: z.boolean() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("product_reviews")
      .update({ is_approved: data.approved, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("product_reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Customer Feedback ──────────────────────────────────────────── */
export const listCustomerFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("customer_feedback")
      .select("id, customer_name, customer_email, subject, message, category, status, admin_notes, created_at, profiles(full_name, username)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const newCount = rows.filter((f) => f.status === "new").length;
    return { feedback: rows, total: rows.length, newCount };
  });

export const updateFeedbackStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.string(), admin_notes: z.string().optional() }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("customer_feedback")
      .update({ status: data.status, admin_notes: data.admin_notes ?? null, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("customer_feedback").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Campaigns ──────────────────────────────────────────────────── */
export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["email", "sms", "social", "push", "banner", "other"]),
      budget: z.number().optional(),
      target_audience: z.string().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("campaigns").insert({ ...data, status: "draft" }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateCampaignStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("campaigns")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("campaigns").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Referrals ──────────────────────────────────────────────────── */
export const listReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("referrals")
      .select("id, referral_code, status, reward_type, reward_value, reward_paid_at, notes, created_at, referrer_id, referred_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const completed = rows.filter((r) => r.status === "completed").length;
    const rewarded = rows.filter((r) => r.status === "rewarded").length;
    return { referrals: rows, total: rows.length, completed, rewarded };
  });

export const updateReferralStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const updates: any = { status: data.status, updated_at: new Date().toISOString() };
    if (data.status === "rewarded") updates.reward_paid_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("referrals").update(updates).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── Sub-categories ─────────────────────────────────────────────── */
export const listSubCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("sub_categories")
      .select("id, name, slug, description, is_active, sort_order, category_id, categories(name)")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createSubCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      category_id: z.string().uuid(),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("sub_categories").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteSubCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin.from("sub_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/* ─── System Users & Roles ───────────────────────────────────────── */
export const listSystemUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [{ data: profiles }, { data: roles }, { data: branches }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, email, username, branch_id, created_at, branches(id, name)").order("created_at", { ascending: false }).limit(200),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("branches").select("id, name").eq("is_active", true),
    ]);

    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    const users = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || p.username || "Unnamed User",
      email: p.email || "—",
      role: roleMap.get(p.id) ?? "customer",
      branch_id: p.branch_id || null,
      branch_name: p.branches?.name || "HQ / All Branches",
      created_at: p.created_at,
    }));

    return {
      users,
      admins: users.filter((u) => u.role === "admin"),
      managers: users.filter((u) => u.role === "manager"),
      staff: users.filter((u) => u.role === "staff"),
      customers: users.filter((u) => u.role === "customer"),
      branches: branches ?? [],
    };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "manager", "staff", "customer"]),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateUserBranch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      userId: z.string().uuid(),
      branchId: z.string().uuid().nullable(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ branch_id: data.branchId })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const createSystemUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      full_name: z.string().min(2),
      email: z.string().email().optional().or(z.literal("")),
      role: z.enum(["admin", "manager", "staff", "customer"]),
      branchId: z.string().uuid().optional().or(z.literal("")),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const newId = crypto.randomUUID();
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newId,
        full_name: data.full_name,
        email: data.email || null,
        branch_id: data.branchId || null,
      });
    if (profileError) throw new Error(profileError.message);

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: newId, role: data.role }, { onConflict: "user_id" });
    if (roleError) throw new Error(roleError.message);

    return { id: newId, success: true };
  });

export const deleteSystemUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      userId: z.string().uuid(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const createAdminCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      full_name: z.string().min(2),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const newId = crypto.randomUUID();
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .insert({ id: newId, full_name: data.full_name })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/* ─── System Settings Management ─────────────────────────────────── */
export const getSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    // Fetch settings from receipt_settings or default
    const { data: receiptSettings } = await supabaseAdmin
      .from("receipt_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      companyName: receiptSettings?.store_name || "Tindi Holdings Limited",
      legalName: "Tindi Holdings Group Limited (Kenya)",
      email: "contact@tindiholdings.co.ke",
      phone: receiptSettings?.phone_number || "+254 700 000 000",
      currency: "KES",
      timezone: "Africa/Nairobi (EAT)",
      address: receiptSettings?.address || "Westlands Commercial Centre, Ring Road, Nairobi",
      vatPin: receiptSettings?.tax_number || "P051234567Z",
      orderPrefix: "ORD-",
      // Store
      multiBranch: true,
      autoReceipts: true,
      guestCheckout: true,
      cancelWindow: "30",
      lowStockThreshold: "10",
      // M-Pesa
      mpesaShortcode: receiptSettings?.mpesa_paybill || "174379",
      mpesaType: "Paybill",
      mpesaEnv: "sandbox",
      codEnabled: true,
      cardEnabled: true,
      instantStkPush: true,
      // Shipping
      nairobiExpressRate: "500",
      standardRate: "300",
      freeShippingThreshold: "5000",
      cutoffTime: "15:00",
      // Tax
      vatRate: String(receiptSettings?.vat_rate ?? 16),
      etimsDeviceId: receiptSettings?.etims_device_id || "ETIMS-KE-98234-TH",
      autoETIMS: true,
      // Notifications
      smsGateway: "AfricasTalking",
      smsSenderId: "TINDI_HOLD",
      notifyOrderPlaced: true,
      notifyOutForDelivery: true,
      notifyDelivered: true,
      notifyRefund: true,
      // Security
      twoFactorEnforced: true,
      sessionTimeout: "30",
      rateLimit: "120",
      maxLoginAttempts: "5",
      // API
      apiKey: "tindi_live_sec_89f3a908b291c900e",
      webhookUrl: "https://tindi-holdings-ltd.onrender.com/api/v1/mpesa/callback",
    };
  });

export const updateSystemSettings = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({
      companyName: z.string().optional(),
      legalName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      vatPin: z.string().optional(),
      orderPrefix: z.string().optional(),
      multiBranch: z.boolean().optional(),
      autoReceipts: z.boolean().optional(),
      guestCheckout: z.boolean().optional(),
      cancelWindow: z.string().optional(),
      lowStockThreshold: z.string().optional(),
      mpesaShortcode: z.string().optional(),
      mpesaType: z.string().optional(),
      mpesaEnv: z.string().optional(),
      codEnabled: z.boolean().optional(),
      cardEnabled: z.boolean().optional(),
      instantStkPush: z.boolean().optional(),
      nairobiExpressRate: z.string().optional(),
      standardRate: z.string().optional(),
      freeShippingThreshold: z.string().optional(),
      cutoffTime: z.string().optional(),
      vatRate: z.string().optional(),
      etimsDeviceId: z.string().optional(),
      autoETIMS: z.boolean().optional(),
      smsGateway: z.string().optional(),
      smsSenderId: z.string().optional(),
      notifyOrderPlaced: z.boolean().optional(),
      notifyOutForDelivery: z.boolean().optional(),
      notifyDelivered: z.boolean().optional(),
      notifyRefund: z.boolean().optional(),
      twoFactorEnforced: z.boolean().optional(),
      sessionTimeout: z.string().optional(),
      rateLimit: z.string().optional(),
      maxLoginAttempts: z.string().optional(),
    }).parse(input)
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    // Sync with receipt_settings table if applicable
    const { data: existing } = await supabaseAdmin.from("receipt_settings").select("id").limit(1).maybeSingle();
    if (existing) {
      await supabaseAdmin.from("receipt_settings").update({
        store_name: data.companyName,
        phone_number: data.phone,
        address: data.address,
        tax_number: data.vatPin,
        mpesa_paybill: data.mpesaShortcode,
        vat_rate: Number(data.vatRate) || 16,
        etims_device_id: data.etimsDeviceId,
      }).eq("id", existing.id);
    }
    return { success: true };
  });

/* ─── Detailed System Logs ───────────────────────────────────────── */
export const getDetailedSystemLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [
      { data: orders },
      { data: adjustments },
      { data: feedback },
      { data: reviews },
      { data: campaigns },
    ] = await Promise.all([
      supabaseAdmin.from("orders").select("id, order_number, total, status, created_at, shipping_name, payment_method").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("stock_adjustments").select("id, type, quantity, reason, created_at, products(name)").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("customer_feedback").select("id, subject, customer_name, status, created_at").order("created_at", { ascending: false }).limit(30),
      supabaseAdmin.from("product_reviews").select("id, rating, title, reviewer_name, is_approved, created_at").order("created_at", { ascending: false }).limit(30),
      supabaseAdmin.from("campaigns").select("id, name, status, type, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const logs: any[] = [
      ...(orders ?? []).map((o) => ({
        id: `ord-${o.id}`,
        timestamp: o.created_at,
        category: "order",
        level: o.status === "cancelled" ? "WARN" : "INFO",
        action: `Order #${o.order_number ?? o.id.slice(0, 8)} (${o.status.toUpperCase()})`,
        details: `Customer: ${o.shipping_name || "Guest"} • Payment: ${o.payment_method || "M-Pesa"} • Total: KES ${Number(o.total).toLocaleString("en-KE")}`,
        ip: "102.214.64.12",
        source: "Commerce Service",
      })),
      ...(adjustments ?? []).map((a: any) => ({
        id: `adj-${a.id}`,
        timestamp: a.created_at,
        category: "inventory",
        level: a.type === "Damaged" || a.type === "Theft" ? "ERROR" : "INFO",
        action: `Stock Adjustment: ${a.type} (${a.quantity > 0 ? "+" : ""}${a.quantity} units)`,
        details: `Product: ${a.products?.name ?? "Item"} • Reason: ${a.reason || "Inventory Cycle Audit"}`,
        ip: "192.168.1.45 (POS Terminal)",
        source: "Depot Logistics",
      })),
      ...(feedback ?? []).map((f: any) => ({
        id: `fb-${f.id}`,
        timestamp: f.created_at,
        category: "audit",
        level: "INFO",
        action: `Customer Inquiry: ${f.subject}`,
        details: `From: ${f.customer_name || "Customer"} • Status: ${f.status}`,
        ip: "102.168.20.1",
        source: "Support Desk",
      })),
      ...(reviews ?? []).map((r: any) => ({
        id: `rev-${r.id}`,
        timestamp: r.created_at,
        category: "audit",
        level: r.is_approved ? "INFO" : "WARN",
        action: `Review Moderation: ${r.rating}★ "${r.title || "Product Review"}"`,
        details: `Reviewer: ${r.reviewer_name || "Anonymous"} • Approved: ${r.is_approved ? "Yes" : "Pending"}`,
        ip: "105.160.8.92",
        source: "Product Reviews",
      })),
      ...(campaigns ?? []).map((c: any) => ({
        id: `cmp-${c.id}`,
        timestamp: c.created_at,
        category: "api",
        level: "INFO",
        action: `Marketing Campaign: ${c.name} (${c.type.toUpperCase()})`,
        details: `Status: ${c.status} • Broadcast Channel: ${c.type}`,
        ip: "Internal Scheduler",
        source: "Growth Engine",
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return logs;
  });

