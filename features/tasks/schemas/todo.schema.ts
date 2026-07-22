import { z } from 'zod';
import { Todo } from '@/features/tasks/types/todo';

export const TodoSchema: z.ZodType<Todo> = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  is_done: z.boolean(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

