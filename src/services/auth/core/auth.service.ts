import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AuthRepository } from "../repositories/auth.repository";

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) =>
    z.object({ email: z.string().email(), password: z.string().min(6) }).parse(input)
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context as any;
    if (!supabase) throw new Error("Supabase client not available in context");
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { user: auth.user, session: auth.session };
  });

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string; fullName: string }) =>
    z.object({ email: z.string().email(), password: z.string().min(8), fullName: z.string().min(2) }).parse(input)
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context as any;
    if (!supabase) throw new Error("Supabase client not available");
    const { data: auth, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) throw new Error(error.message);
    if (auth.user) {
      await AuthRepository.upsertProfile(auth.user.id, {
        full_name: data.fullName,
        email: data.email,
      });
    }
    return { user: auth.user };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) =>
    z.object({ email: z.string().email() }).parse(input)
  )
  .handler(async ({ data, context }: any) => {
    const { supabase } = context as any;
    const redirectTo = `${process.env.PUBLIC_APP_URL || "https://tindiholdings.com"}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    const { userId } = context;
    const profile = await AuthRepository.getProfileById(userId);
    const roles = await AuthRepository.getRolesForUser(userId);
    return { userId, profile, roles: roles.map((r: any) => r.role) };
  });