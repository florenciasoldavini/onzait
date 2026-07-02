import { AuthContext } from "@/contexts/auth";
import HomeScreen from "@/screens/home";
import { Redirect } from "expo-router";
import { useContext } from "react";

export default function PreviewRoute() {
  const { user } = useContext(AuthContext);

  if (user?.role !== "admin") {
    return <Redirect href="/projects" />;
  }

  return <HomeScreen />;
}
