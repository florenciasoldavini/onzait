import OrganizationSetupScreen from "@/features/workspaces/screens/organization-setup-screen";
import { useRouter } from "expo-router";

export default function CreateOrganizationRoute() {
  const router = useRouter();

  return (
    <OrganizationSetupScreen
      mode="additional"
      onCreated={() => router.replace("/projects" as never)}
    />
  );
}
