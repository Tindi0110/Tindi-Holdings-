import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PaymentRepository } from "../repositories/payment.repository";

export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const order = await PaymentRepository.getOrder(data.orderId, context.userId);
    if (!order) throw new Error("Order not found");

    // Stripe checkout simulation URL
    const checkoutUrl = `https://checkout.stripe.com/pay/tindi_holdings_${order.order_number}?amount=${order.total}`;
    await PaymentRepository.updatePaymentStatus(order.id, "processing");
    return { checkoutUrl };
  });

export const getPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const order = await PaymentRepository.getOrder(data.orderId, context.userId);
    if (!order) throw new Error("Order not found");
    return { status: order.payment_status, reference: order.payment_reference };
  });

export const simulateCOD = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const order = await PaymentRepository.getOrder(data.orderId, context.userId);
    if (!order) throw new Error("Order not found");
    
    await PaymentRepository.updatePaymentStatus(order.id, "paid", `COD-${Math.floor(100000 + Math.random() * 900000)}`);
    return { success: true, message: "Cash on delivery confirmed." };
  });

export const verifyStripeSession = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string; orderId: string }) => z.object({ sessionId: z.string(), orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await PaymentRepository.updatePaymentStatus(data.orderId, "paid", `STRIPE-${data.sessionId.slice(-8).toUpperCase()}`);
    return { success: true, message: "Stripe payment verified." };
  });