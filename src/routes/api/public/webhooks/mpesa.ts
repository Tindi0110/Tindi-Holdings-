import { createFileRoute } from "@tanstack/react-router";

/**
 * M-Pesa STK Push callback.
 * Safaricom posts the payment result here after the user enters their PIN.
 * No signature verification is available from Daraja, so we match on
 * CheckoutRequestID stored on the order.
 */
export const Route = createFileRoute("/api/public/webhooks/mpesa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            Body?: {
              stkCallback?: {
                CheckoutRequestID?: string;
                ResultCode?: number;
                ResultDesc?: string;
                CallbackMetadata?: { Item?: Array<{ Name: string; Value?: string | number }> };
              };
            };
          };
          const cb = body.Body?.stkCallback;
          const checkoutId = cb?.CheckoutRequestID;
          if (!checkoutId) return new Response("ok");

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          if (cb?.ResultCode === 0) {
            const receipt = cb.CallbackMetadata?.Item?.find(
              (i) => i.Name === "MpesaReceiptNumber",
            )?.Value;
            await supabaseAdmin
              .from("orders")
              .update({
                payment_status: "paid",
                status: "processing",
                payment_reference: receipt ? String(receipt) : checkoutId,
              })
              .eq("payment_reference", checkoutId);
          } else {
            await supabaseAdmin
              .from("orders")
              .update({ payment_status: "failed" })
              .eq("payment_reference", checkoutId);
          }
          return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("M-Pesa callback error", e);
          return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Error" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
