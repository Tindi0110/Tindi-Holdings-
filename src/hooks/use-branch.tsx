import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBranches } from "@/lib/catalog.functions";

export type Branch = { id: string; name: string; address?: string | null; phone?: string | null };

interface Ctx {
  branches: Branch[];
  branch: Branch | null; // null represents "All Enterprise Branches"
  setBranch: (b: Branch | null) => void;
  isAllBranches: boolean;
}

const C = createContext<Ctx | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
  const branches = data ?? [];
  
  const [branchId, setBranchId] = useState<string | null>(() => {
    if (typeof window === "undefined") return "all";
    return localStorage.getItem("tindi.selected_branch") || "all";
  });

  const branch = branchId === "all" || !branchId
    ? null
    : branches.find((b) => b.id === branchId) ?? null;

  const setBranch = (b: Branch | null) => {
    if (!b) {
      setBranchId("all");
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
