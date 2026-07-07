import { createServerFn } from "@tanstack/react-start";
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

/* ÔöÇÔöÇÔöÇ Sales ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getSalesReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, total, created_at, payment_method, shipping_name, user_id, branches(name)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const rows = orders ?? [];
    const totalRevenue = rows.reduce((s, o) => s + Number(o.total), 0);
    const completedRevenue = rows
      .filter((o) => o.status === "completed" || o.status === "delivered")
      .reduce((s, o) => s + Number(o.total), 0);

    return { orders: rows, totalRevenue, completedRevenue };
  });

/* ÔöÇÔöÇÔöÇ Inventory ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getInventoryReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock, is_active, categories(name)")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);

    const rows = products ?? [];
    const totalProducts = rows.length;
    const outOfStock = rows.filter((p) => (p.stock ?? 0) === 0).length;
    const lowStock = rows.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10,
    ).length;
    const totalStockValue = rows.reduce(
      (s, p) => s + Number(p.price) * (p.stock ?? 0),
      0,
    );

    return { products: rows, totalProducts, outOfStock, lowStock, totalStockValue };
  });

/* ÔöÇÔöÇÔöÇ Customers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getCustomersReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, username, created_at, branches(name)")
      .order("created_at", { ascending: false });
    if (pErr) throw new Error(pErr.message);

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("user_id, total, status");

    const rows = (profiles ?? []).map((p) => {
      const userOrders = (orders ?? []).filter((o) => o.user_id === p.id);
      return {
        ...p,
        orderCount: userOrders.length,
        totalSpend: userOrders.reduce((s, o) => s + Number(o.total), 0),
      };
    });

    return { customers: rows, total: rows.length };
  });

/* ÔöÇÔöÇÔöÇ Branches ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getBranchesReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: branches, error: bErr } = await supabaseAdmin
      .from("branches")
      .select("*")
      .order("name", { ascending: true });
    if (bErr) throw new Error(bErr.message);

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("branch_id, total, status");

    const { data: staff } = await supabaseAdmin
      .from("profiles")
      .select("branch_id");

    const rows = (branches ?? []).map((b) => {
      const bOrders = (orders ?? []).filter((o) => o.branch_id === b.id);
      const completedOrders = bOrders.filter(
        (o) => o.status === "completed" || o.status === "delivered",
      );
      return {
        ...b,
        orders: bOrders.length,
        revenue: bOrders.reduce((s, o) => s + Number(o.total), 0),
        completionRate:
          bOrders.length > 0
            ? Math.round((completedOrders.length / bOrders.length) * 100)
            : 0,
        staff: (staff ?? []).filter((s) => s.branch_id === b.id).length,
      };
    });

    return { branches: rows };
  });

/* ÔöÇÔöÇÔöÇ Financial ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getFinancialReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, total, status, payment_method, payment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const rows = orders ?? [];
    const totalGross = rows.reduce((s, o) => s + Number(o.total), 0);
    const paid = rows
      .filter((o) => o.payment_status === "paid")
      .reduce((s, o) => s + Number(o.total), 0);
    const pending = rows
      .filter((o) => o.payment_status !== "paid")
      .reduce((s, o) => s + Number(o.total), 0);

    return { orders: rows, totalGross, paid, pending };
  });

/* ÔöÇÔöÇÔöÇ Sales Analytics (detailed) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getSalesAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const now = Date.now();
    const d30 = new Date(now - 30 * 86400000).toISOString();
    const d60 = new Date(now - 60 * 86400000).toISOString();
    const d14 = new Date(now - 14 * 86400000).toISOString();

    const [{ data: current }, { data: prev }, { data: recentOrders }] = await Promise.all([
      supabaseAdmin.from("orders").select("total, status, payment_method, created_at").gte("created_at", d30),
      supabaseAdmin.from("orders").select("total").gte("created_at", d60).lt("created_at", d30),
      supabaseAdmin
        .from("orders")
        .select("id, order_number, status, total, created_at, payment_method, shipping_name")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const currentRevenue = (current ?? []).reduce((s, o) => s + Number(o.total), 0);
    const prevRevenue = (prev ?? []).reduce((s, o) => s + Number(o.total), 0);
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const avgOrderValue = (current ?? []).length > 0 ? currentRevenue / (current ?? []).length : 0;

    // Daily series (14 days)
    const byDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      byDay[d] = 0;
    }
    const { data: d14Orders } = await supabaseAdmin
      .from("orders").select("total, created_at").gte("created_at", d14);
    (d14Orders ?? []).forEach((o) => {
      const k = new Date(o.created_at as string).toISOString().slice(0, 10);
      if (k in byDay) byDay[k] += Number(o.total);
    });
    const salesSeries = Object.entries(byDay).map(([date, revenue]) => ({
      date: date.slice(5),
      revenue: Math.round(revenue),
    }));

    // Payment method counts
    const pmMap: Record<string, number> = {};
    (current ?? []).forEach((o) => {
      const m = o.payment_method ?? "unknown";
      pmMap[m] = (pmMap[m] ?? 0) + 1;
    });
    const paymentMethods = Object.entries(pmMap).map(([method, count]) => ({ method, count }));

    // Status breakdown
    const statusMap: Record<string, number> = {};
    (current ?? []).forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    return {
      currentRevenue,
      prevRevenue,
      revenueGrowth,
      avgOrderValue,
      currentOrderCount: (current ?? []).length,
      salesSeries,
      paymentMethods,
      statusBreakdown,
      recentOrders: recentOrders ?? [],
    };
  });

/* ÔöÇÔöÇÔöÇ Customer Analytics (detailed) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getCustomerAnalyticsDetailed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [{ data: profiles }, { data: orders }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, username, created_at, branches(name)")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("orders").select("user_id, total"),
    ]);

    const customerIds = new Set((orders ?? []).map((o) => o.user_id));
    const newThisMonth = (profiles ?? []).filter((p) => p.created_at >= firstOfMonth).length;

    const monthlyMap: Record<string, number> = {};
    (profiles ?? []).forEach((p) => {
      const m = new Date(p.created_at as string).toISOString().slice(0, 7);
      monthlyMap[m] = (monthlyMap[m] ?? 0) + 1;
    });
    const monthlyGrowth = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({ month: month.slice(5), count }));

    return {
      totalCustomers: (profiles ?? []).length,
      newThisMonth,
      customersWithOrders: customerIds.size,
      totalOrders: (orders ?? []).length,
      monthlyGrowth,
      recentCustomers: (profiles ?? []).slice(0, 20),
    };
  });

/* ÔöÇÔöÇÔöÇ Product Analytics ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getProductAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [{ data: products }, { data: orderItems }] = await Promise.all([
      supabaseAdmin.from("products").select("id, name, price, stock, is_active, categories(name)"),
      supabaseAdmin.from("order_items").select("product_id, quantity, price"),
    ]);

    const rows = products ?? [];
    const items = orderItems ?? [];

    const unitsSoldMap: Record<string, { units: number; revenue: number }> = {};
    items.forEach((i) => {
      if (!unitsSoldMap[i.product_id]) unitsSoldMap[i.product_id] = { units: 0, revenue: 0 };
      unitsSoldMap[i.product_id].units += i.quantity ?? 1;
      unitsSoldMap[i.product_id].revenue += Number(i.price) * (i.quantity ?? 1);
    });

    const topSellers = rows
      .map((p) => ({
        ...p,
        unitsSold: unitsSoldMap[p.id]?.units ?? 0,
        revenueGenerated: unitsSoldMap[p.id]?.revenue ?? 0,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 20);

    // Category breakdown
    const catMap: Record<string, { count: number; revenue: number }> = {};
    rows.forEach((p) => {
      const cat = (p.categories as any)?.name ?? "Uncategorised";
      if (!catMap[cat]) catMap[cat] = { count: 0, revenue: 0 };
      catMap[cat].count += 1;
      catMap[cat].revenue += unitsSoldMap[p.id]?.revenue ?? 0;
    });
    const categoryBreakdown = Object.entries(catMap).map(([category, v]) => ({ category, ...v }));

    return {
      totalProducts: rows.length,
      activeProducts: rows.filter((p) => p.is_active).length,
      outOfStock: rows.filter((p) => (p.stock ?? 0) === 0).length,
      lowStockCount: rows.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10).length,
      lowStock: rows.filter((p) => (p.stock ?? 0) < 10).slice(0, 10),
      topSellers,
      categoryBreakdown,
    };
  });

/* ÔöÇÔöÇÔöÇ Branch Analytics (detailed) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getBranchAnalyticsDetailed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [{ data: branches }, { data: orders }, { data: staff }] = await Promise.all([
      supabaseAdmin.from("branches").select("*").order("name"),
      supabaseAdmin.from("orders").select("branch_id, total, status"),
      supabaseAdmin.from("profiles").select("branch_id"),
    ]);

    const rows = (branches ?? []).map((b) => {
      const bOrders = (orders ?? []).filter((o) => o.branch_id === b.id);
      const completed = bOrders.filter((o) => ["completed", "delivered"].includes(o.status));
      return {
        ...b,
        orders: bOrders.length,
        revenue: bOrders.reduce((s, o) => s + Number(o.total), 0),
        conversionRate: bOrders.length > 0 ? Math.round((completed.length / bOrders.length) * 100) : 0,
        staffCount: (staff ?? []).filter((s) => s.branch_id === b.id).length,
      };
    });

    return {
      branches: rows,
      totalRevenue: rows.reduce((s, b) => s + b.revenue, 0),
      totalOrders: rows.reduce((s, b) => s + b.orders, 0),
    };
  });

/* ÔöÇÔöÇÔöÇ Revenue Analytics ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getRevenueAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total, payment_status, created_at")
      .order("created_at", { ascending: true });

    const rows = orders ?? [];
    const totalRevenue = rows.reduce((s, o) => s + Number(o.total), 0);
    const paidRevenue = rows.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0);

    const monthlyMap: Record<string, number> = {};
    rows.forEach((o) => {
      const m = new Date(o.created_at as string).toISOString().slice(0, 7);
      monthlyMap[m] = (monthlyMap[m] ?? 0) + Number(o.total);
    });
    const monthlySeries = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, revenue]) => ({ month: month.slice(5), revenue: Math.round(revenue) }));

    const avgMonthlyRevenue = monthlySeries.length > 0
      ? monthlySeries.reduce((s, m) => s + m.revenue, 0) / monthlySeries.length
      : 0;

    return { totalRevenue, paidRevenue, avgMonthlyRevenue, totalOrders: rows.length, monthlySeries };
  });

/* ÔöÇÔöÇÔöÇ Conversion Analytics ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export const getConversionAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const [{ data: orders }, { data: profiles }] = await Promise.all([
      supabaseAdmin.from("orders").select("id, status, payment_status, user_id"),
      supabaseAdmin.from("profiles").select("id"),
    ]);

    const rows = orders ?? [];
    const totalOrders = rows.length;
    const completedOrders = rows.filter((o) => ["completed", "delivered"].includes(o.status)).length;
    const cancelledOrders = rows.filter((o) => o.status === "cancelled").length;
    const pendingOrders = rows.filter((o) => o.status === "pending").length;
    const paidOrders = rows.filter((o) => o.payment_status === "paid").length;
    const totalCustomers = (profiles ?? []).length;
    const uniqueOrderCustomers = new Set(rows.map((o) => o.user_id).filter(Boolean)).size;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      cancellationRate: totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0,
      paymentRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
      totalCustomers,
      ordersPerCustomer: uniqueOrderCustomers > 0 ? (totalOrders / uniqueOrderCustomers).toFixed(2) : "0.00",
    };
  });

