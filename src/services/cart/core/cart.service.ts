import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CartRepository } from "../repositories/cart.repository";

export const getCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => CartRepository.findByUserId(context.userId));

export const getCartSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    const items = (await CartRepository.findByUserId(context.userId)) as any[];
    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.products?.price ?? 0) * it.quantity,
      0,
    );
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
    return { items, subtotal, itemCount };
  });

export const addToCart = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    const { userId } = context;
    // Check stock
    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", data.productId)
      .single();
    if (!prod || prod.stock < data.quantity) throw new Error("Insufficient stock available");
    // Upsert cart item
    const existing = await CartRepository.findItem(userId, data.productId);
    if (existing) {
      await CartRepository.updateItem(existing.id, existing.quantity + data.quantity);
    } else {
      await CartRepository.insertItem(userId, data.productId, data.quantity);
    }
    return { success: true };
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .inputValidator((input: any) => {
    const raw = typeof input === "string" ? { cartItemId: input } : input;
    const cartItemId = raw?.cartItemId || raw?.id;
    return z.object({ cartItemId: z.string().uuid() }).parse({ cartItemId });
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }: any) => {
    await CartRepository.deleteItem(data.cartItemId);
    return { success: true };
  });

export const updateCartQuantity = createServerFn({ method: "POST" })
  .inputValidator((input: any) => {
    const cartItemId = input?.cartItemId || input?.id;
    return z
      .object({
        cartItemId: z.string().uuid(),
        quantity: z.number().int().min(0),
      })
      .parse({ cartItemId, quantity: input?.quantity });
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }: any) => {
    if (data.quantity <= 0) {
      await CartRepository.deleteItem(data.cartItemId);
    } else {
      await CartRepository.updateItem(data.cartItemId, data.quantity);
    }
    return { success: true };
  });

export const clearCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await CartRepository.clearByUserId(context.userId);
    return { success: true };
  });
