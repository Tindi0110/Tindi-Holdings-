import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signUp, resetPassword, getCurrentUser } from "../core/auth.service";
import { toast } from "sonner";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: () => getCurrentUser(),
    retry: false,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) => signIn({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Signed in successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (payload: { email: string; password: string; fullName: string }) =>
      signUp({ data: payload }),
    onSuccess: () => toast.success("Account created! Check your email to confirm."),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { email: string }) => resetPassword({ data: payload }),
    onSuccess: () => toast.success("Password reset link sent!"),
    onError: (err: Error) => toast.error(err.message),
  });
}
