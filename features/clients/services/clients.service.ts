import {
  countClientProjectRows,
  getClientRow,
  insertClientRow,
  listClientRows,
  softDeleteClientRow,
  updateClientRow
} from "@/features/clients/repositories/clients.repository";
import type {
  ClientFilters,
  CreateClientInput,
  UpdateClientInput
} from "@/features/clients/types/client";
import type { OffsetPageRequest } from "@/shared/utils/pagination";

export function listClients({
  filters,
  offset,
  pageSize,
  workspaceId
}: {
  filters?: ClientFilters;
  workspaceId: string;
} & OffsetPageRequest) {
  return listClientRows({
    filters,
    offset,
    pageSize,
    workspaceId
  });
}

export function getClient(clientId: string) {
  return getClientRow(clientId);
}

export function createClient(input: CreateClientInput, workspaceId: string) {
  return insertClientRow(input, workspaceId);
}

export function updateClient(clientId: string, input: UpdateClientInput) {
  return updateClientRow(clientId, input);
}

export function countClientProjects(clientId: string) {
  return countClientProjectRows(clientId);
}

export function softDeleteClient(clientId: string) {
  return softDeleteClientRow(clientId);
}
