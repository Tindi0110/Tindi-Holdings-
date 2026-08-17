import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ShoppingCart,
  Menu,
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  LogOut,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { BranchSelector } from "@/components/shared/BranchSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface Props {
  onCartOpen: () => void;
}

const announcements = [
  { icon: Truck, text: "Free Shipping on orders over KES 5,000" },
  { icon: RotateCcw, text: "30-day Easy Returns" },
  { icon: Shield, text: "100% Secure Payments" },
  { icon: Headphones, text: "24/7 Support" },
];

export function StoreHeader({ onCartOpen }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: search } });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="bg-section border-b border-border">
          <div className="mx-auto max-w-screen-2xl px-6 py-2 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {announcements.map((a) => (
              <div key={a.text} className="flex items-center gap-1.5">
                <a.icon className="h-3.5 w-3.5 text-primary" />
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShopSphere</span>
          </Link>
          <div className="hidden md:block">
            <BranchSelector />
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <Link to="/shop" className="hover:text-primary">
              Shop
            </Link>
            {user && (
              <Link to="/orders" className="hover:text-primary">
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="hover:text-primary">
                Admin
              </Link>
            )}
          </nav>
          <form onSubmit={onSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-section border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search for products..."
              />
            </div>
          </form>
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCartOpen} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-conversion text-conversion-foreground text-[10px] font-semibold grid place-items-center">
                  {count}
                </span>
              )}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>
                    <Package className="h-4 w-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />{" "}
                    {isAdmin ? "Admin Dashboard" : "Admin Area"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div className="h-[105px] shrink-0 w-full pointer-events-none" />
    </>
  );
}
