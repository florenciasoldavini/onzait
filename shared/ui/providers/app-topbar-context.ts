import { createContext, type Dispatch, type SetStateAction } from "react";

export interface AppTopBarSearchConfig {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export interface AppTopBarContextValue {
  search: AppTopBarSearchConfig | null;
  setSearch: Dispatch<SetStateAction<AppTopBarSearchConfig | null>>;
}

export const AppTopBarContext = createContext<AppTopBarContextValue | null>(
  null
);
