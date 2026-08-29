import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  getCartSummary,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../core/cart.service";
import { toast } from "sonner";

export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: () => getCart() });
}

export function useCartSummary() {
  return useQuery({ queryKey: ["cart", "summary"], queryFn: () => getCartSummary() });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity?: number }) =>
      addToCart({ data: { productId: data.productId, quantity: data.quantity ?? 1 } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => removeFromCart({ data: { cartItemId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { cartItemId: string; quantity: number }) => updateCartQuantity({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}
