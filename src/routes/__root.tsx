import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useIsMutating,
} from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/use-auth";
import { BranchProvider } from "@/hooks/use-branch";
import { Toaster } from "@/components/ui/sonner";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CursorFollower } from "@/components/CursorFollower";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tindiholdings — Premium Multi-Branch Commerce" },
      { name: "description", content: "Tindiholdings is a premium multi-branch e-commerce platform offering innovative solutions across diverse industries." },
      { name: "keywords", content: "e-commerce, multi-branch, technology, logistics, hospitality, fashion, innovation" },
      { name: "author", content: "Tindi Holdings Team" },
      { property: "og:title", content: "Tindiholdings — Premium Multi-Branch Commerce" },
      { property: "og:description", content: "Tindiholdings provides cutting‑edge multi‑branch commerce solutions for various sectors." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://tindi-holdings.example.com" },
      { property: "og:site_name", content: "Tindi Holdings" },
      { name: "twitter:title", content: "Tindiholdings — Premium Multi-Branch Commerce" },
      { name: "twitter:description", content: "Explore Tindi Holdings' integrated platforms for tech, logistics, hospitality, and fashion." },
      { name: "twitter:site", content: "@TindiHoldings" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/a9937d1c-00de-490d-b461-11d6f069b44d" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/a9937d1c-00de-490d-b461-11d6f069b44d" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RootApp />
    </QueryClientProvider>
  );
}

import { ReactLenis } from "lenis/react";

function RootApp() {
  // Disable Lenis smooth scroll on admin pages — they use a fixed sidebar
  // layout where Lenis root mode intercepts touchpad events and prevents the
  // sidebar nav from scrolling natively.
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith("/admin"),
  });

  const inner = (
    <AuthProvider>
      <BranchProvider>
        <CursorFollower />
        <ScrollProgress />
        <Outlet />
        <Toaster richColors position="top-right" />
      </BranchProvider>
    </AuthProvider>
  );

  if (isAdmin) return inner;

  return <ReactLenis root>{inner}</ReactLenis>;
}
