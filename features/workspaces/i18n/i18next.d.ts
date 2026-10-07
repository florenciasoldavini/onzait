import "i18next";
import type en from "@/features/workspaces/i18n/en";

declare module "i18next" {
  interface ResourceNamespaceMap {
    "features/workspaces": typeof en;
  }
}

export {};
