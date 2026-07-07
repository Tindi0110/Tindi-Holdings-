import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Landmark, Mail, Send, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Field } from "./login";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Tindi Group" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent! Check your email.");
  };

  return (
    <div className="min-h-screen bg-section grid place-items-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 relative overflow-hidden">
        <div className="grid place-items-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        {sent ? (
          <div className="mt-7 text-center space-y-4">
            <div className="rounded-xl bg-success/10 text-success p-4 text-sm">
              A password reset link has been sent to <b>{email}</b>.
            </div>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-card text-sm"
                  placeholder="Enter your registered email"
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
                  Send Reset Link <Send className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>
            <Link
              to="/login"
              className="w-full h-11 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </form>
        )}
        <div className="mt-8 grid place-items-center text-primary/30">
          <Lock className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
