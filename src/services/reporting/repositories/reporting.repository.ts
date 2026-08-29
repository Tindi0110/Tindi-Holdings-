import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class ReportingRepository {
  static async fetchAllMetrics() {
    const { data: orders } = await supabaseAdmin.from("orders").select("total, status, created_at");
    const { count: customers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });
    const { count: products } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true });
    const { count: lowStock } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock", 10);

    const todayStr = new Date().toISOString().slice(0, 10);
    const orderList = orders ?? [];

    const totalRevenue = orderList
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orderList.length;
    const todayOrders = orderList.filter((o) => o.created_at.slice(0, 10) === todayStr).length;
    const todayRevenue = orderList
      .filter((o) => o.created_at.slice(0, 10) === todayStr && o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total), 0);
    const pendingOrders = orderList.filter((o) => o.status === "pending").length;
    const cancelledOrders = orderList.filter((o) => o.status === "cancelled").length;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customers ?? 0,
      totalProducts: products ?? 0,
      todayRevenue,
      todayOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      refundRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
      pendingOrders,
      lowStockCount: lowStock ?? 0,
    };
  }

  static async fetchDailyRevenue() {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total, created_at, status")
      .order("created_at");
    if (error) throw new Error(error.message);

    const groups: Record<string, { revenue: number; orders: number }> = {};
    for (const o of data ?? []) {
      const date = o.created_at.slice(0, 10);
      if (!groups[date]) groups[date] = { revenue: 0, orders: 0 };
      groups[date].orders++;
      if (o.status !== "cancelled") {
        groups[date].revenue += Number(o.total);
      }
    }

    return Object.keys(groups).map((date) => ({
      date,
      revenue: groups[date].revenue,
      orders: groups[date].orders,
    }));
  }

  static async fetchBranchRevenue() {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total, status, branches(name)");
    if (error) throw new Error(error.message);

    const groups: Record<string, { revenue: number; orders: number }> = {};
    for (const o of data ?? []) {
      const name = (o as any).branches?.name || "Global Store";
      if (!groups[name]) groups[name] = { revenue: 0, orders: 0 };
      groups[name].orders++;
      if (o.status !== "cancelled") {
        groups[name].revenue += Number(o.total);
      }
    }

    return Object.keys(groups).map((branchName) => ({
      branchName,
      revenue: groups[branchName].revenue,
      orders: groups[branchName].orders,
    }));
  }

  static async fetchTopProducts() {
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, unit_price");
    if (error) throw new Error(error.message);

    const groups: Record<string, { totalSold: number; revenue: number }> = {};
    for (const it of data ?? []) {
      const name = it.product_name;
      if (!groups[name]) groups[name] = { totalSold: 0, revenue: 0 };
      groups[name].totalSold += it.quantity;
      groups[name].revenue += it.quantity * Number(it.unit_price);
    }

    return Object.keys(groups)
      .map((productName) => ({
        productName,
        totalSold: groups[productName].totalSold,
        revenue: groups[productName].revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}
