import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/lib/cart.functions";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(),
    enabled: !!user,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });
  const add = useMutation({
    mutationFn: (vars: { productId: string; quantity?: number }) => addToCart({ data: vars }),
    onSuccess: () => {
      invalidate();
      toast.success("Added to cart");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: (vars: { id?: string; cartItemId?: string; quantity: number }) => {
      const cartItemId = vars.cartItemId || vars.id!;
      return updateCartItem({ data: { cartItemId, quantity: vars.quantity } });
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (idOrPayload: string | { id?: string; cartItemId?: string }) => {
      const cartItemId =
        typeof idOrPayload === "string"
          ? idOrPayload
          : idOrPayload.cartItemId || idOrPayload.id!;
      return removeCartItem({ data: { cartItemId } });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Item removed from cart");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const clear = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
  const items = q.data ?? [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, count, isLoading: q.isLoading, add, update, remove, clear };
}
