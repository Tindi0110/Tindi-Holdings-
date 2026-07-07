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
    mutationFn: (vars: { id: string; quantity: number }) => updateCartItem({ data: vars }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeCartItem({ data: { id } }),
    onSuccess: invalidate,
  });
  const clear = useMutation({ mutationFn: () => clearCart(), onSuccess: invalidate });
  const items = q.data ?? [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, count, isLoading: q.isLoading, add, update, remove, clear };
}
