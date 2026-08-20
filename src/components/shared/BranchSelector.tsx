import { Building2, Check, ChevronDown, MapPin, Globe } from "lucide-react";
import { useBranch, type Branch } from "@/hooks/use-branch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  variant?: "store" | "admin";
}

export function BranchSelector({ variant = "store" }: Props) {
  const { branches, branch, setBranch, isAllBranches } = useBranch();
  const isAdmin = variant === "admin";

  const displayName = isAllBranches ? "All Enterprise Branches" : branch?.name ?? "Select Branch";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-10 gap-2 px-3 rounded-xl cursor-pointer ${
            isAdmin
              ? "border border-border bg-card hover:bg-muted/40 shadow-xs"
              : "bg-muted/40 hover:bg-muted"
          }`}
        >
          {isAllBranches ? (
            <Globe className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Building2 className="h-4 w-4 text-primary shrink-0" />
          )}
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
              {isAdmin ? "Location Context" : "Store Branch"}
            </div>
            <div className="text-xs font-bold text-foreground truncate max-w-[140px]">{displayName}</div>
          </div>
          <span className="text-xs font-bold sm:hidden">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-card border-border rounded-2xl p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-wider text-muted-foreground px-2.5 py-1.5">
          Select Location Scope
        </DropdownMenuLabel>
        
        {/* All Branches option */}
        <DropdownMenuItem
          onClick={() => setBranch(null)}
          className="py-2.5 px-2.5 rounded-xl cursor-pointer font-bold text-xs"
        >
          <Globe className="h-4 w-4 text-primary mr-2" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-wider text-foreground">All Enterprise Branches</div>
            <div className="text-[10px] text-muted-foreground">Consolidated Multi-Location View</div>
          </div>
          {isAllBranches && <Check className="h-4 w-4 text-primary ml-2 shrink-0" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {branches.map((b) => {
          const active = !isAllBranches && b.id === branch?.id;
          return (
            <DropdownMenuItem
              key={b.id}
              onClick={() => setBranch(b)}
              className="py-2.5 px-2.5 rounded-xl cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-foreground">{b.name}</div>
                {b.address && (
                  <div className="text-[10px] text-muted-foreground truncate">{b.address}</div>
                )}
              </div>
              {active && <Check className="h-4 w-4 text-primary ml-2 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
