import { lazy } from "react";

export const ProjectsMapView = lazy(async () => {
  const module = await import(
    "@/features/projects/components/projects-map-view"
  );
  return { default: module.ProjectsMapView };
});
