import {
  AppTopBarContext,
  type AppTopBarSearchConfig
} from "@/shared/ui/providers/app-topbar-context";
import { useContext, useEffect } from "react";

export function useAppTopBar() {
  const context = useContext(AppTopBarContext);

  if (!context) {
    throw new Error("useAppTopBar must be used within AppTopBarProvider.");
  }

  return context;
}

export function useAppTopBarSearch(search: AppTopBarSearchConfig | null) {
  const { setSearch } = useAppTopBar();

  useEffect(() => {
    setSearch(search);

    return () => setSearch(null);
  }, [search, setSearch]);
}
