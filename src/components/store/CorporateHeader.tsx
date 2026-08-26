import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Globe,
  Sun,
  Moon,
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  Cpu,
  Compass,
  Utensils,
  Shirt,
  User,
  Package,
  LayoutDashboard,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/catalog.functions";

interface Props {
  onCartOpen?: () => void;
}

export function CorporateHeader({ onCartOpen }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [internalCartOpen, setInternalCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "fr" | "sw">("en");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchProducts } = useQuery({
    queryKey: ["products", "search", searchQuery],
    queryFn: () => listProducts({ data: { limit: 100 } }),
    enabled: searchQuery.trim().length > 1,
  });

  const matchingResults = (searchProducts ?? [])
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { q: searchQuery } });
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen();
    } else {
      setInternalCartOpen(true);
    }
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    {
      label: "Our Companies",
      to: "/companies",
      subItems: [
        {
          name: "Tindi Tech",
          icon: Cpu,
          desc: "Smart Homes & IT Solutions",
          href: "/companies",
          hash: "#tech",
        },
        {
          name: "Tindi Safaris",
          icon: Compass,
          desc: "Luxury Logistics & Tourism",
          href: "/companies",
          hash: "#safaris",
        },
        {
          name: "Tindi Eats",
          icon: Utensils,
          desc: "Gourmet Hospitality & Dining",
          href: "/companies",
          hash: "#eats",
        },
        {
          name: "Tindi Apparel",
          icon: Shirt,
          desc: "Sustainable Fashion & Tailoring",
          href: "/companies",
          hash: "#apparel",
        },
      ],
    },
    { label: "Shop", to: "/shop" },
    { label: "Contact", to: "/contact" },
  ];

  const handleSubItemClick = (href: string, hash?: string) => {
    navigate({ to: href as never });
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.substring(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const langNames = {
    en: "English",
    fr: "Français",
    sw: "Kiswahili",
  };

  return (
    <>
      {/* Pinned Solid Classic Header — No Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-card border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <Logo className="h-8 w-auto transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display font-black tracking-tight text-foreground text-lg leading-tight">
                Tindi Group
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary hidden sm:block">
                Holdings & Enterprises
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = path === link.to || (link.to !== "/" && path.startsWith(link.to));

              if (link.subItems) {
                return (
                  <DropdownMenu key={link.label}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors outline-none cursor-pointer ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 p-2 bg-card border border-border shadow-xl rounded-xl">
                      <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Subsidiaries & Ventures
                      </div>
                      <DropdownMenuSeparator />
                      {link.subItems.map((sub) => {
                        const Icon = sub.icon;
                        return (
                          <DropdownMenuItem
                            key={sub.name}
                            onClick={() => handleSubItemClick(sub.href, sub.hash)}
                            className="flex items-start gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-muted focus:bg-muted transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">{sub.name}</span>
                              <span className="text-[11px] text-muted-foreground">{sub.desc}</span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.to as never}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Input with Auto-complete */}
            <div ref={searchContainerRef} className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  className="w-[180px] lg:w-[220px] focus:w-[260px] h-9 pl-9 pr-7 rounded-xl bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-muted-foreground text-foreground"
                  placeholder="Search products..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </form>

              {/* Live Search Popup */}
              {searchOpen && searchQuery.trim().length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[280px]">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Search Results
                    </div>
                    {matchingResults.length === 0 ? (
                      <div className="p-4 text-xs text-muted-foreground text-center">
                        No matching products found
                      </div>
                    ) : (
                      matchingResults.map((p) => (
                        <Link
                          key={p.id}
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted/80 border border-border/60 overflow-hidden shrink-0 grid place-items-center">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">
                              {p.name}
                            </div>
                            <div className="text-[11px] font-black text-primary mt-0.5">
                              KES {Number(p.price).toLocaleString("en-KE")}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70"
                  aria-label="Language Switcher"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl rounded-xl">
                {Object.entries(langNames).map(([key, name]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setLang(key as "en" | "fr" | "sw")}
                    className="flex justify-between items-center text-xs font-semibold cursor-pointer"
                  >
                    <span>{name}</span>
                    {lang === key && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCartClick}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70 relative cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black grid place-items-center shadow-sm">
                  {count}
                </span>
              )}
            </Button>

            {/* User Account / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70 cursor-pointer"
                    aria-label="User Menu"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-xl rounded-xl">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{user.email}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isAdmin ? "Administrator" : "Verified Customer"}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/orders" as "/" })}
                    className="cursor-pointer text-xs font-semibold py-2"
                  >
                    <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/admin" as "/" })}
                    className="cursor-pointer text-xs font-semibold py-2"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer text-xs font-bold py-2 focus:text-destructive"
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2 text-destructive" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 rounded-xl text-xs font-bold text-foreground hover:text-primary hover:bg-muted/70"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70"
                  aria-label="Toggle Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 flex flex-col bg-card border-l border-border">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Logo className="h-6 w-auto" />
                    <span className="font-display font-black text-sm tracking-tight text-foreground">
                      Tindi Group
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      placeholder="Search products..."
                    />
                  </form>

                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      if (link.subItems) {
                        return (
                          <div key={link.label} className="py-2">
                            <div className="font-black text-xs uppercase tracking-wider text-foreground px-2 py-1">
                              {link.label}
                            </div>
                            <div className="flex flex-col gap-1 pl-3 mt-1 border-l-2 border-primary/20 ml-2">
                              {link.subItems.map((sub) => (
                                <button
                                  key={sub.name}
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleSubItemClick(sub.href, sub.hash);
                                  }}
                                  className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-muted/70 rounded-lg transition-colors"
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={link.label}
                          to={link.to as "/"}
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-muted/70 rounded-xl transition-colors"
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content jump behind fixed header */}
      <div className="h-16 shrink-0 w-full pointer-events-none" aria-hidden="true" />

      {/* Cart Popup Dialog */}
      {!onCartOpen && (
        <CartDrawer
          open={internalCartOpen}
          onOpenChange={setInternalCartOpen}
        />
      )}
    </>
  );
}
