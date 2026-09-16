import {
  AppTopBarContext,
  type AppTopBarSearchConfig
} from "@/shared/ui/providers/app-topbar-context";
import { useMemo, useState, type ReactNode } from "react";

export function AppTopBarProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<AppTopBarSearchConfig | null>(null);
  const value = useMemo(() => ({ search, setSearch }), [search]);

  return (
    <AppTopBarContext.Provider value={value}>
      {children}
    </AppTopBarContext.Provider>
  );
}
