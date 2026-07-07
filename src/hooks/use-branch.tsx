import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBranches } from "@/lib/catalog.functions";

type Branch = { id: string; name: string; address?: string | null; phone?: string | null };
interface Ctx {
  branches: Branch[];
  branch: Branch | null;
  setBranch: (b: Branch) => void;
}
const C = createContext<Ctx | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
  const branches = data ?? [];
  const [branchId, setBranchId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("shopsphere.branch") : null,
  );
  useEffect(() => {
    if (!branchId && branches.length) {
      const id = branches[0].id;
      setBranchId(id);
      localStorage.setItem("shopsphere.branch", id);
    }
  }, [branchId, branches]);
  const branch = branches.find((b) => b.id === branchId) ?? branches[0] ?? null;
  return (
    <C.Provider
      value={{
        branches,
        branch,
        setBranch: (b) => {
          setBranchId(b.id);
          localStorage.setItem("shopsphere.branch", b.id);
        },
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
