import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { OrderRepository } from "../repositories/order.repository";
import { OrderStatus } from "../interfaces/types";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

const checkoutSchema = z.object({
  shipping_name: z.string().min(1).max(120),
  shipping_address: z.string().min(1).max(300),
  shipping_city: z.string().min(1).max(120),
  shipping_zip: z.string().min(1).max(20),
  shipping_phone: z.string().min(1).max(40),
  payment_method: z.enum(["cod", "stripe", "paypal", "mpesa"]).default("cod"),
  payment_phone: z.string().max(40).optional().nullable(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: any) => checkoutSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    const { data: items, error: cartErr } = await supabase
      .from("cart_items")
      .select("quantity, product_id, products(id, name, price, stock)")
      .eq("user_id", userId);
    if (cartErr) throw new Error(cartErr.message);
    if (!items || items.length === 0) throw new Error("Cart is empty");

    let subtotal = 0;
    for (const it of items) {
      const p = it.products as any;
      if (!p) continue;
      subtotal += Number(p.price) * it.quantity;
    }
    const shipping = subtotal >= 5000 ? 0 : 200;
    const tax = Math.round(subtotal * 0.16 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const { data: profile } = await supabase
      .from("profiles")
      .select("branch_id")
      .eq("id", userId)
      .maybeSingle();
    const order = await OrderRepository.insert({
      user_id: userId,
      branch_id: profile?.branch_id ?? null,
      status: "pending",
      subtotal,
      shipping,
      tax,
      total,
      ...data,
      payment_status: "pending",
    });

    const orderItems = items
      .map((it: any) => {
        const p = it.products as any;
        if (!p) return null;
        return {
          order_id: order.id,
          product_id: p.id,
          product_name: p.name,
          quantity: it.quantity,
          unit_price: p.price,
        };
      })
      .filter(Boolean);
    await OrderRepository.insertItems(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", userId);

    // Auto-generate receipt
    try {
      const { createReceipt } = await import("@/lib/receipts.functions");
      await createReceipt({ data: { orderId: order.id } });
    } catch (e: any) {
      console.error("[OrderService] Receipt generation failed:", e.message);
    }

    return { orderId: order.id, orderNumber: order.order_number };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => OrderRepository.findByUserId(context.userId));

export const getMyOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => OrderRepository.findById(data.id, context.userId));

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({ orderNumber: z.string(), email: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    const order = await OrderRepository.findByOrderNumber(data.orderNumber);
    if (!order) throw new Error("Order not found.");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", order.user_id)
      .single();
    if (profile?.email !== data.email) throw new Error("Order not found for this email.");
    return order;
  });

export const listAdminOrders = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        status: z.string().optional(),
        branchId: z.string().uuid().optional(),
        search: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    return OrderRepository.findAll(data);
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    await OrderRepository.updateStatus(data.id, data.status as OrderStatus);
    return { success: true };
  });
