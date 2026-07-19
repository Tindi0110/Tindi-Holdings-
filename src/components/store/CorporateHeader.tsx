import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Globe,
  Sun,
  Moon,
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  ChevronRight,
  Cpu,
  Compass,
  Utensils,
  Shirt,
  User,
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

interface Props {
  onCartOpen: () => void;
}

export function CorporateHeader({ onCartOpen }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "fr" | "sw">("en");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { q: searchQuery } });
      setSearchQuery("");
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
          desc: "Smart Homes & IT",
          href: "/companies",
          hash: "#tech",
        },
        {
          name: "Tindi Safaris",
          icon: Compass,
          desc: "Logistics & Tourism",
          href: "/companies",
          hash: "#safaris",
        },
        {
          name: "Tindi Eats",
          icon: Utensils,
          desc: "Food & Delivery",
          href: "/companies",
          hash: "#eats",
        },
        {
          name: "Tindi Apparel",
          icon: Shirt,
          desc: "Custom Clothing",
          href: "/companies",
          hash: "#apparel",
        },
      ],
    },
    { label: "Shop", to: "/shop" },
    { label: "News", to: "/news" },
    { label: "Contact", to: "/contact" },
  ];

  const handleSubItemClick = (href: string, hash?: string) => {
    setCompaniesOpen(false);
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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3 glass"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo className={`transition-all duration-300 ${isScrolled ? "h-8" : "h-10"}`} />
          <span
            className={`font-bold tracking-tight text-foreground transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"}`}
          >
            Tindi Group
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = path === link.to || (link.to !== "/" && path.startsWith(link.to));
            if (link.subItems) {
              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}
                    >
                      {link.label} <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2">
                    {link.subItems.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <DropdownMenuItem
                          key={sub.name}
                          onClick={() => handleSubItemClick(sub.href, sub.hash)}
                          className="flex items-start gap-3 p-3 cursor-pointer rounded-md"
                        >
                          <Icon className="h-5 w-5 mt-0.5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{sub.name}</span>
                            <span className="text-xs text-muted-foreground">{sub.desc}</span>
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
                className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Main search form */}
          <form onSubmit={handleSearch} className="hidden md:block relative mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] h-9 pl-9 pr-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              placeholder="Search..."
            />
          </form>

          {/* Theme toggler */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 text-muted-foreground hover:text-primary"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-primary"
                aria-label="Language Switcher"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(langNames).map(([key, name]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setLang(key as "en" | "fr" | "sw")}
                  className="flex justify-between items-center"
                >
                  {name}
                  {lang === key && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartOpen}
            className="h-9 w-9 text-muted-foreground hover:text-primary relative"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Button>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/orders" as "/" })}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/admin" as "/" })}>
                  {isAdmin ? "Admin Dashboard" : "Dashboard"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-muted-foreground hover:text-primary">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col bg-card">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="h-16 flex items-center px-6 border-b border-border">
                <span className="font-bold text-lg text-foreground">Menu</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    if (link.subItems) {
                      return (
                        <div key={link.label} className="mt-2 text-foreground">
                          <div className="font-semibold px-2 py-2">{link.label}</div>
                          <div className="flex flex-col gap-1 pl-4 border-l border-slate-100 ml-2">
                            {link.subItems.map((sub) => (
                              <button
                                key={sub.name}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  handleSubItemClick(sub.href, sub.hash);
                                }}
                                className="text-left py-2 px-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded"
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
                        className="py-2 px-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded"
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
  );
}
