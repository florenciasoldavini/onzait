import { AuthContext } from "@/features/auth/provider";
import { useContext } from "react";

export const useAuth = () => useContext(AuthContext);
