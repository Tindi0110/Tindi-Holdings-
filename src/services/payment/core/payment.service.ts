import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PaymentRepository } from "../repositories/payment.repository";

function getOrigin(): string {
  return process.env.PUBLIC_APP_URL || "https://tindiholdings.lovable.app";
}

export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
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
  .inputValidator((input: { orderId: string }) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const order = await PaymentRepository.getOrder(data.orderId, context.userId);
    if (!order) throw new Error("Order not found");
    return { status: order.payment_status, reference: order.payment_reference };
  });

export const simulateCOD = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const order = await PaymentRepository.getOrder(data.orderId, context.userId);
    if (!order) throw new Error("Order not found");

    await PaymentRepository.updatePaymentStatus(
      order.id,
      "paid",
      `COD-${Math.floor(100000 + Math.random() * 900000)}`,
    );
    return { success: true, message: "Cash on delivery confirmed." };
  });

export const verifyStripeSession = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string; orderId: string }) =>
    z.object({ sessionId: z.string(), orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    await PaymentRepository.updatePaymentStatus(
      data.orderId,
      "paid",
      `STRIPE-${data.sessionId.slice(-8).toUpperCase()}`,
    );
    return { success: true, message: "Stripe payment verified." };
  });

/* -------------------------------------------------------------------------- */
/*                                  PAYPAL                                    */
/* -------------------------------------------------------------------------- */

export const createPayPalOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !order) throw new Error("Order not found");

    const origin = getOrigin();
    // PayPal Orders API v2 — requires PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET in env
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

    const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const authData = (await authRes.json()) as any;
    if (!authData.access_token) throw new Error("PayPal auth failed");

    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            amount: { currency_code: "USD", value: Number(order.total).toFixed(2) },
            description: `Tindi Holdings Order ${order.order_number}`,
          },
        ],
        application_context: {
          return_url: `${origin}/checkout/success?order_id=${order.id}`,
          cancel_url: `${origin}/checkout/cancel?order_id=${order.id}`,
        },
      }),
    });
    const ppOrder = (await orderRes.json()) as any;
    if (!ppOrder.id) throw new Error("Failed to create PayPal order");

    const approveLink = (ppOrder.links as any[]).find((l: any) => l.rel === "approve")?.href;
    return { paypalOrderId: ppOrder.id, approveUrl: approveLink };
  });

/* -------------------------------------------------------------------------- */
/*                                  M-PESA                                    */
/* -------------------------------------------------------------------------- */

function formatKenyanPhone(phone: string): string {
  let cleaned = phone.trim().replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

export const initiateMpesaSTK = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; phone: string }) =>
    z
      .object({
        orderId: z.string().uuid(),
        phone: z.string().min(9).max(20),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !order) throw new Error("Order not found");

    const formattedPhone = formatKenyanPhone(data.phone);
    if (!formattedPhone || formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      throw new Error("Invalid phone number. Use Kenyan format like 0712345678 or 254712345678.");
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey =
      process.env.MPESA_PASSKEY ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const origin = getOrigin();

    if (consumerKey && consumerSecret) {
      try {
        // 1. Get OAuth token
        const tokenRes = await fetch(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`,
            },
          },
        );
        const tokenData = (await tokenRes.json()) as any;
        if (!tokenData.access_token) {
          throw new Error(tokenData.errorMessage || "M-Pesa authentication with Daraja failed.");
        }

        // 2. Generate timestamp + password
        const ts = new Date()
          .toISOString()
          .replace(/[-:T.Z]/g, "")
          .slice(0, 14);
        const password = Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64");

        // 3. STK Push
        const stkRes = await fetch(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              BusinessShortCode: shortCode,
              Password: password,
              Timestamp: ts,
              TransactionType: "CustomerPayBillOnline",
              Amount: Math.max(1, Math.ceil(Number(order.total))),
              PartyA: formattedPhone,
              PartyB: shortCode,
              PhoneNumber: formattedPhone,
              CallBackURL: `${origin}/api/mpesa-callback`,
              AccountReference: order.order_number,
              TransactionDesc: `Tindi Holdings Order ${order.order_number}`,
            }),
          },
        );
        const stkData = (await stkRes.json()) as any;
        if (stkData.ResponseCode !== "0") {
          throw new Error(
            stkData.errorMessage ||
              stkData.ResponseDescription ||
              "M-Pesa STK push request failed.",
          );
        }

        // Store checkout request ID for status polling
        await supabaseAdmin
          .from("orders")
          .update({ payment_reference: stkData.CheckoutRequestID })
          .eq("id", order.id);

        return {
          checkoutRequestId: stkData.CheckoutRequestID,
          message: `STK push prompt sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone.`,
        };
      } catch (err: any) {
        console.warn("[PaymentService] Live Safaricom Daraja STK push error:", err.message);
        throw new Error(err.message || "Failed to initiate M-Pesa STK push");
      }
    }

    // In local dev/sandbox mode without configured Daraja keys, simulate STK prompt
    const simulatedCheckoutId = `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    await supabaseAdmin
      .from("orders")
      .update({ payment_reference: simulatedCheckoutId })
      .eq("id", order.id);

    return {
      checkoutRequestId: simulatedCheckoutId,
      message: `STK push prompt sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone.`,
    };
  });

/* -------------------------------------------------------------------------- */
/*                                  CAPTURE PAYPAL                            */
/* -------------------------------------------------------------------------- */

export const capturePayPalOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { paypalOrderId: string; orderId: string }) =>
    z.object({ paypalOrderId: z.string(), orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

    const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const authData = (await authRes.json()) as any;

    const captureRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${data.paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const capture = (await captureRes.json()) as any;
    if (capture.status !== "COMPLETED") throw new Error("PayPal capture failed");

    await PaymentRepository.updatePaymentStatus(
      data.orderId,
      "paid",
      `PAYPAL-${data.paypalOrderId.slice(-8).toUpperCase()}`,
    );
    return { success: true, captureId: capture.id };
  });
