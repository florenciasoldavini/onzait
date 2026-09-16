import {
  getContractorRow,
  insertContractorRow,
  listContractorRows,
  softDeleteContractorRow,
  updateContractorRow
} from "@/features/contractors/repositories/contractors.repository";
import type {
  ContractorFilters,
  CreateContractorInput,
  UpdateContractorInput
} from "@/features/contractors/types/contractor";
import type { OffsetPageRequest } from "@/shared/utils/pagination";

export function listContractors({
  filters,
  offset,
  pageSize,
  workspaceId
}: {
  filters?: ContractorFilters;
  workspaceId: string;
} & OffsetPageRequest) {
  return listContractorRows({
    filters,
    offset,
    pageSize,
    workspaceId
  });
}

export function getContractor(contractorId: string) {
  return getContractorRow(contractorId);
}

export function createContractor(
  input: CreateContractorInput,
  workspaceId: string
) {
  return insertContractorRow(input, workspaceId);
}

export function updateContractor(
  contractorId: string,
  input: UpdateContractorInput
) {
  return updateContractorRow(contractorId, input);
}

export function softDeleteContractor(contractorId: string) {
  return softDeleteContractorRow(contractorId);
}
