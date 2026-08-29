import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Landmark,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Field, GoogleIcon } from "./login";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listBranches } from "@/lib/catalog.functions";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — Tindi Holdings Ltd" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [branchId, setBranchId] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, username, branch_id: branchId || null },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — welcome!");
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-section grid place-items-center p-6">
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="grid place-items-center text-center">
          <Link to="/" className="mb-4">
            <Logo className="h-16 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Register a new account</p>
        </div>
        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <Field label="Select Branch">
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full h-11 pl-9 pr-9 rounded-lg border border-border bg-card text-sm appearance-none"
              >
                <option value="">Choose your branch (optional)</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-border text-sm"
                  placeholder="Enter full name"
                />
              </div>
            </Field>
            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-border text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </Field>
          </div>
          <Field label="Username" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-lg border border-border text-sm"
                placeholder="Choose username"
              />
            </div>
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-9 rounded-lg border border-border text-sm"
                placeholder="Create password (8+ chars)"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-lg border border-border text-sm"
                placeholder="Confirm password"
              />
            </div>
          </Field>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Register <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={onGoogle}
            className="w-full h-11 rounded-lg border border-border bg-card text-sm font-medium hover:bg-section flex items-center justify-center gap-2"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <p className="text-center text-sm text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
