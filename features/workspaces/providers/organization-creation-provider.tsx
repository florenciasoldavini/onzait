import { OrganizationCreationContext } from "@/features/workspaces/providers/organization-creation-context";
import { OrganizationSetupDialog } from "@/features/workspaces/components/organization-setup-dialog";
import { lazy, Suspense, useCallback, useState, type ReactNode } from "react";
import { ActivityIndicator } from "react-native";

const OrganizationSetupFlow = lazy(() =>
  import("@/features/workspaces/components/organization-setup-flow").then(
    (module) => ({ default: module.OrganizationSetupFlow })
  )
);

export function OrganizationCreationProvider({
  children,
  onCreated
}: {
  children: ReactNode;
  onCreated: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const open = useCallback(() => setIsCreating(true), []);
  const close = () => setIsCreating(false);
  return (
    <OrganizationCreationContext.Provider value={open}>
      {children}
      {isCreating ? (
        <Suspense
          fallback={
            <OrganizationSetupDialog canCancel onCancel={close}>
              <ActivityIndicator />
            </OrganizationSetupDialog>
          }
        >
          <OrganizationSetupFlow
            mode="additional"
            onCancel={close}
            onCreated={() => {
              close();
              onCreated();
            }}
          />
        </Suspense>
      ) : null}
    </OrganizationCreationContext.Provider>
  );
}
