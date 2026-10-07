import { createContext } from "react";

export const OrganizationCreationContext = createContext<(() => void) | null>(
  null
);
