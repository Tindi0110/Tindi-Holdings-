import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { grantSelfAdmin, getAdminConsoleState } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Server,
  Database,
  Activity,
  Loader2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: AdminLayout,
  errorComponent: AdminErrorBoundary,
});

function AdminErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-6 p-6 text-navy-foreground">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 grid place-items-center">
          <ShieldAlert className="h-9 w-9 text-red-400" />
        </div>
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-black tracking-tight text-navy-foreground mb-2">
          Dashboard Error
        </h2>
        <p className="text-sm text-navy-foreground/60 leading-relaxed">
          An unexpected error occurred while loading this administrative module. Your data is safe.
        </p>
        {error?.message && (
          <div className="mt-4 px-4 py-3 bg-red-950/40 border border-red-800/30 rounded-xl text-left">
            <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold uppercase tracking-wider transition-all"
        >
          Retry Module
        </button>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="h-11 px-6 rounded-xl border border-navy-hover hover:border-navy-foreground/30 text-navy-foreground/70 hover:text-navy-foreground text-sm font-bold uppercase tracking-wider transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { loading, user, setRoles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: consoleState,
    isLoading: isCheckingState,
    refetch,
  } = useQuery({
    queryKey: ["admin", "consoleState"],
    queryFn: () => getAdminConsoleState(),
    enabled: !!user,
  });

  const claim = useMutation({
    mutationFn: () => grantSelfAdmin(),
    onSuccess: async () => {
      setRoles(["admin"]);
      await queryClient.invalidateQueries();
      await refetch();
      toast.success("Master administrative privileges initialized successfully");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to initialize administrator role");
    },
  });

  if (loading || !user || isCheckingState) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4 text-navy-foreground">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <Lock className="h-5 w-5 text-blue-400 absolute" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-navy-foreground/50 animate-pulse">
          Verifying administrative token...
        </p>
      </div>
    );
  }

  // If current user is already an admin, render the inner dashboard
  if (consoleState?.isCurrentUserAdmin) {
    return <Outlet />;
  }

  const hasAdmin = consoleState?.hasAdmin ?? false;

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glass box */}
      <div className="w-full max-w-lg bg-navy-hover/80 border border-navy-foreground/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-navy border border-navy-foreground/10 flex items-center justify-center text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.25em] text-navy-foreground/50 uppercase">
              Tindi Holdings Ltd
            </h1>
            <p className="text-sm font-extrabold text-navy-foreground">Secure Command Center</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/80 border border-navy-foreground/10 text-[10px] font-bold text-navy-foreground/80">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>Active</span>
          </div>
        </div>

        {/* Diagnostic checks */}
        <div className="bg-navy/80 border border-navy-foreground/8 rounded-2xl p-5 mb-8 space-y-3.5">
          <h2 className="text-[10px] font-black tracking-widest text-navy-foreground/40 uppercase">
            Diagnostic Status
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-foreground/60 flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-navy-foreground/30" /> Database Link
              </span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Synced
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-foreground/60 flex items-center gap-2">
                <Key className="h-3.5 w-3.5 text-navy-foreground/30" /> Session Node
              </span>
              <span
                className="font-bold text-navy-foreground/90 truncate max-w-[200px]"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-foreground/60 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-navy-foreground/30" /> Console Privilege
              </span>
              {hasAdmin ? (
                <span className="font-bold text-rose-500 flex items-center gap-1 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  <ShieldAlert className="h-3.5 w-3.5" /> Restricted
                </span>
              ) : (
                <span className="font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  <ShieldAlert className="h-3.5 w-3.5" /> Unclaimed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Context-based bootstrapper */}
        {!hasAdmin ? (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                ⚠️ Master Console Bootstrapping Required
              </h3>
              <p className="text-xs text-navy-foreground/60 leading-relaxed font-medium">
                No administrator role has been claimed for this workspace. You are eligible to
                initialize the primary master console keys for this session.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                onClick={() => claim.mutate()}
                disabled={claim.isPending}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/20 border-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {claim.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Bootstrapping console...</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    <span>Claim Primary Admin Console</span>
                    <ChevronRight className="h-4 w-4 opacity-70 ml-0.5" />
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/" })}
                className="w-full h-11 text-navy-foreground/50 hover:text-navy-foreground hover:bg-navy-hover/80 rounded-xl flex items-center justify-center gap-2 transition-colors border-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Storefront</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-2xl border border-rose-500/20">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                🔒 Console Lockout Initiated
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                This administrator workspace has already been claimed and initialized by a primary
                administrator. Your current account credentials lack permission to configure or
                access this environment.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] text-navy-foreground/40 font-bold uppercase text-center leading-normal">
                To obtain admin credentials, contact the system owner or primary administrator.
              </div>
              <Button
                onClick={() => navigate({ to: "/" })}
                className="w-full h-12 bg-navy hover:bg-navy-hover text-navy-foreground font-extrabold rounded-xl border border-navy-foreground/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Storefront</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
