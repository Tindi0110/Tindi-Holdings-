import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ShippingRepository } from "../repositories/shipping.repository";
import { DeliveryStatus } from "../interfaces/types";

export const getShippingMethods = createServerFn({ method: "GET" }).handler(async () => {
  return [
    {
      id: "tindi-standard",
      name: "Tindi Standard Delivery",
      provider: "Tindi Express",
      estimated_days: 3,
      price: 200,
    },
    {
      id: "tindi-express",
      name: "Tindi Express Delivery",
      provider: "Tindi Express",
      estimated_days: 1,
      price: 500,
    },
  ];
});

export const getOrderTracking = createServerFn({ method: "POST" })
  .inputValidator((input: { orderNumber: string; email: string }) =>
    z.object({ orderNumber: z.string(), email: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    const order = await ShippingRepository.getOrderByNumber(data.orderNumber);
    if (!order) throw new Error("Order not found.");

    const ownerEmail = (order as any).profiles?.email;
    if (ownerEmail !== data.email)
      throw new Error("Verification failed: Email does not match order owner.");

    const events = [
      {
        id: "1",
        order_id: order.id,
        status: "awaiting_pickup" as DeliveryStatus,
        location: "Nairobi Central Warehouse",
        description: "Order picked and packed. Awaiting carrier pickup.",
        timestamp: new Date(order.created_at).toISOString(),
      },
    ];

    if (order.status === "shipped" || order.status === "delivered") {
      events.push({
        id: "2",
        order_id: order.id,
        status: "in_transit" as DeliveryStatus,
        location: "Mombasa Road Hub",
        description: "In transit to delivery branch.",
        timestamp: new Date(new Date(order.created_at).getTime() + 36000000).toISOString(),
      });
    }

    if (order.status === "delivered") {
      events.push({
        id: "3",
        order_id: order.id,
        status: "delivered" as DeliveryStatus,
        location: "Customer Residence",
        description: "Package signed for and delivered.",
        timestamp: new Date(new Date(order.created_at).getTime() + 72000000).toISOString(),
      });
    }

    let deliveryStatus: DeliveryStatus = "awaiting_pickup";
    if (order.status === "shipped") deliveryStatus = "in_transit";
    else if (order.status === "delivered") deliveryStatus = "delivered";
    else if (order.status === "cancelled") deliveryStatus = "returned";

    return {
      order_number: order.order_number,
      current_status: deliveryStatus,
      events,
      tracking_number: `TND-${order.order_number.replace("ORD-", "")}`,
      courier: "Tindi Express",
    };
  });

export const updateDeliveryStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; status: string }) =>
    z.object({ orderId: z.string().uuid(), status: z.string() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    // Admin check
    const { supabase, userId } = context;
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Forbidden: Admin privileges required.");

    await ShippingRepository.updateOrderStatus(data.orderId, data.status);
    return { success: true };
  });
