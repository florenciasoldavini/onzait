import { OrganizationCreationContext } from "@/features/workspaces/providers/organization-creation-context";
import { useContext } from "react";

export function useOrganizationCreation() {
  const open = useContext(OrganizationCreationContext);
  if (!open)
    throw new Error(
      "Organization creation requires OrganizationCreationProvider."
    );
  return open;
}
