import {
  getWorkerRow,
  insertWorkerRow,
  listWorkerRows,
  softDeleteWorkerRow,
  updateWorkerRow
} from "@/features/workers/repositories/workers.repository";
import type {
  CreateWorkerInput,
  UpdateWorkerInput,
  WorkerFilters
} from "@/features/workers/types/worker";
import type { OffsetPageRequest } from "@/shared/utils/pagination";

export function listWorkers({
  filters,
  offset,
  pageSize,
  workspaceId
}: {
  filters?: WorkerFilters;
  workspaceId: string;
} & OffsetPageRequest) {
  return listWorkerRows({
    filters,
    offset,
    pageSize,
    workspaceId
  });
}

export function getWorker(workerId: string) {
  return getWorkerRow(workerId);
}

export function createWorker(input: CreateWorkerInput, workspaceId: string) {
  return insertWorkerRow(input, workspaceId);
}

export function updateWorker(workerId: string, input: UpdateWorkerInput) {
  return updateWorkerRow(workerId, input);
}

export function softDeleteWorker(workerId: string) {
  return softDeleteWorkerRow(workerId);
}
