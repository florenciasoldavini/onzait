import { z } from 'zod';
import { ProjectParticipant, ProjectRole } from '@/features/projects/types/project-participant';

export const ProjectParticipantSchema: z.ZodType<ProjectParticipant> = z.object({
  id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  role: z.nativeEnum(ProjectRole),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

