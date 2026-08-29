import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProducts,
  getProductBySlug,
  listFeaturedProducts,
  listCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../core/product.service";
import { ProductFilter } from "../interfaces/types";
import { toast } from "sonner";

export function useProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: ["products", filter],
    queryFn: () => listProducts({ data: filter ?? {} }),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({ queryKey: ["products", "featured"], queryFn: () => listFeaturedProducts() });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => searchProducts({ data: { query } }),
    enabled: query.length > 1,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createProduct({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateProduct({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
