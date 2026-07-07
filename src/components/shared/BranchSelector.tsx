import { Building2, Check, ChevronDown, MapPin } from "lucide-react";
import { useBranch } from "@/hooks/use-branch";
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
  const { branches, branch, setBranch } = useBranch();
  if (!branch) return null;
  const isAdmin = variant === "admin";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-10 gap-2 px-3 rounded-xl ${
            isAdmin
              ? "border border-border bg-white hover:bg-section"
              : "bg-section hover:bg-section/80"
          }`}
        >
          <Building2 className="h-4 w-4 text-primary" />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Branch</div>
            <div className="text-xs font-semibold">{branch.name}</div>
          </div>
          <span className="text-xs font-semibold sm:hidden">{branch.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">Select Branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((b) => {
          const active = b.id === branch.id;
          return (
            <DropdownMenuItem key={b.id} onClick={() => setBranch(b)} className="py-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{b.name}</div>
                {b.address && (
                  <div className="text-[11px] text-muted-foreground truncate">{b.address}</div>
                )}
              </div>
              {active && <Check className="h-4 w-4 text-primary ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
