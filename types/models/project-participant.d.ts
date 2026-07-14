export enum ProjectRole {
  CREATOR = "creator",
  SITE_MANAGER = "site_manager",
  PROJECT_MANAGER = "project_manager",
  ARCHITECT = "architect",
  ENGINEER = "engineer",
  DESIGNER = "designer"
}
export interface ProjectParticipant {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: Date;
  updated_at: Date | null;
}
