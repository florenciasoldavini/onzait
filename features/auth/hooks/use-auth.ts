import { AuthContext } from "@/features/auth/providers/auth-provider";
import { useContext } from "react";

export const useAuth = () => useContext(AuthContext);
