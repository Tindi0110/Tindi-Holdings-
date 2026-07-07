import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CartCheckoutRepository } from "../repositories/checkout.repository";

export const calculateTotals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    const items = await CartCheckoutRepository.getCartForCheckout(context.userId);
    let subtotal = 0;
    for (const it of items) {
      const p = it.products as any;
      if (!p) continue;
      subtotal += Number(p.price) * it.quantity;
    }
    const shipping = subtotal >= 5000 ? 0 : 200;
    const tax = Math.round(subtotal * 0.16 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    return { subtotal, shipping, tax, discount: 0, total, currency: "KES" };
  });

export const getShippingOptions = createServerFn({ method: "GET" })
  .handler(async () => {
    return [
      { id: "std", name: "Standard Shipping", description: "Standard courier delivery (3-5 business days)", price: 200, estimated_days: 5 },
      { id: "exp", name: "Express Shipping", description: "Fast priority delivery (1-2 business days)", price: 500, estimated_days: 2 },
      { id: "free", name: "Free Shipping", description: "Aparts of orders over KES 5000 (3-5 business days)", price: 0, estimated_days: 5 }
    ];
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => z.object({ code: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    if (code === "TINDI10") {
      return { valid: true, code, discount_type: "percentage" as const, discount_value: 10, message: "10% discount applied!" };
    }
    if (code === "TINDI20") {
      return { valid: true, code, discount_type: "percentage" as const, discount_value: 20, message: "20% discount applied!" };
    }
    return { valid: false, code, discount_type: "fixed" as const, discount_value: 0, message: "Invalid coupon code." };
  });

export const initiateCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    shipping_name: z.string().min(1),
    shipping_address: z.string().min(1),
    shipping_city: z.string().min(1),
    shipping_zip: z.string().min(1),
    shipping_phone: z.string().min(1),
    payment_method: z.enum(["cod", "stripe", "paypal", "mpesa"]),
    payment_phone: z.string().optional().nullable(),
    coupon_code: z.string().optional()
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const { userId, supabase } = context;
    const items = await CartCheckoutRepository.getCartForCheckout(userId);
    if (items.length === 0) throw new Error("Cart is empty");

    let subtotal = 0;
    for (const it of items) {
      const p = it.products as any;
      if (!p) continue;
      subtotal += Number(p.price) * it.quantity;
    }

    let discount = 0;
    if (data.coupon_code) {
      const code = data.coupon_code.toUpperCase();
      if (code === "TINDI10") discount = Math.round(subtotal * 0.1 * 100) / 100;
      else if (code === "TINDI20") discount = Math.round(subtotal * 0.2 * 100) / 100;
    }

    const shipping = subtotal >= 5000 ? 0 : 200;
    const tax = Math.round((subtotal - discount) * 0.16 * 100) / 100;
    const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    const { data: profile } = await supabase.from("profiles").select("branch_id").eq("id", userId).maybeSingle();
    const order = await CartCheckoutRepository.insertOrder({
      user_id: userId,
      branch_id: profile?.branch_id ?? null,
      status: "pending",
      subtotal,
      shipping,
      tax,
      total,
      shipping_name: data.shipping_name,
      shipping_address: data.shipping_address,
      shipping_city: data.shipping_city,
      shipping_zip: data.shipping_zip,
      shipping_phone: data.shipping_phone,
      payment_method: data.payment_method,
      payment_status: "pending",
      payment_phone: data.payment_phone || null
    });

    const orderItems = items.map((it: any) => {
      const p = it.products as any;
      return {
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        quantity: it.quantity,
        unit_price: p.price
      };
    });
    await CartCheckoutRepository.insertOrderItems(orderItems);
    await CartCheckoutRepository.clearCart(userId);

    // Auto-generate receipt via ReceiptService
    try {
      const { ReceiptService } = await import("../receipt-service/core/receipt.service");
      await ReceiptService.createDocument({
        order_id: order.id,
        document_type: "sales_receipt",
        amount_paid: total,
        branch_id: profile?.branch_id ?? null,
        user_id: userId,
        currency: "KES",
        tax_amount: tax,
        discount_amount: discount,
        payment_method: data.payment_method,
        items: items.map((it: any) => ({
          product_id: it.products.id,
          product_name: it.products.name,
          quantity: it.quantity,
          unit_price: it.products.price,
          stock_before: it.products.stock,
          stock_remaining: Math.max(0, it.products.stock - it.quantity),
          warehouse: "Primary Warehouse"
        }))
      });
    } catch (e: any) {
      console.error("[CheckoutService] Receipt creation error:", e.message);
    }

    return { orderId: order.id, orderNumber: order.order_number };
  });