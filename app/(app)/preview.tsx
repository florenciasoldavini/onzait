import { useAuth } from "@/features/auth/use-auth";
import HomeScreen from "@/features/home/screens/home-screen";
import { Redirect } from "expo-router";

export default function PreviewRoute() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Redirect href="/projects" />;
  }

  return <HomeScreen />;
}
