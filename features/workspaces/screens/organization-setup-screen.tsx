import { OrganizationSetupFlow } from "@/features/workspaces/components/organization-setup-flow";
import { Screen } from "@/shared/ui/components/screen";

export default function OrganizationSetupScreen({
  mode = "initial",
  onCreated
}: {
  mode?: "additional" | "initial";
  onCreated?: () => void;
}) {
  return (
    <Screen centered keyboardSafe>
      <OrganizationSetupFlow mode={mode} onCreated={onCreated} />
    </Screen>
  );
}
