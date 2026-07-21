import { z } from 'zod';
import { WorkerContract, PaymentType } from '@/features/workers/types/worker-contract';

export const WorkerContractSchema: z.ZodType<WorkerContract> = z.object({
  id: z.string(),
  worker_id: z.string(),
  project_id: z.string(),
  payment_type: z.nativeEnum(PaymentType),
  rate: z.number(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

