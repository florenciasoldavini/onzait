export type ProjectRole =
  | "creator" // Dueño o creador del proyecto
  | "site_manager" // Jefe de obra, encargado de la gestión diaria en el sitio
  | "project_manager" // Responsable de la planificación y seguimiento global
  | "architect" // Arquitecto o diseñador
  | "engineer" // Ingeniero o técnico
  | "designer"; // Diseñador o artista

export interface ProjectParticipant {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: Date;
  updated_at: Date | null;
}
