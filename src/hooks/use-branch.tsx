import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBranches } from "@/lib/catalog.functions";

export type Branch = { id: string; name: string; address?: string | null; phone?: string | null };

interface Ctx {
  branches: Branch[];
  branch: Branch | null; // null represents "All Enterprise Branches"
  setBranch: (b: Branch | null) => void;
  isAllBranches: boolean;
  selectedBranchId: string | null; // UUID or null (null = all)
  selectedBranch: Branch | null; // alias for branch
}

const C = createContext<Ctx | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
  const branches = data ?? [];

  const [branchId, setBranchId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("tindi.selected_branch");
    return stored && stored !== "all" ? stored : null;
  });

  const branch = branchId ? (branches.find((b) => b.id === branchId) ?? null) : null;

  const setBranch = (b: Branch | null) => {
    if (!b) {
      setBranchId(null);
      localStorage.setItem("tindi.selected_branch", "all");
    } else {
      setBranchId(b.id);
      localStorage.setItem("tindi.selected_branch", b.id);
    }
  };

  return (
    <C.Provider
      value={{
        branches,
        branch,
        setBranch,
        isAllBranches: branch === null,
        selectedBranchId: branch?.id ?? null,
        selectedBranch: branch,
      }}
    >
      {children}
    </C.Provider>
  );
}

export function useBranch() {
  const v = useContext(C);
  if (!v) throw new Error("useBranch must be used within BranchProvider");
  return v;
}
