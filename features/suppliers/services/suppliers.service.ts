import {
  getSupplierRow,
  insertSupplierRow,
  listSupplierRows,
  softDeleteSupplierRow,
  updateSupplierRow
} from "@/features/suppliers/repositories/suppliers.repository";
import type {
  CreateSupplierInput,
  SupplierFilters,
  UpdateSupplierInput
} from "@/features/suppliers/types/supplier";
import type { OffsetPageRequest } from "@/shared/utils/pagination";

export function listSuppliers({
  filters,
  offset,
  pageSize,
  workspaceId
}: {
  filters?: SupplierFilters;
  workspaceId: string;
} & OffsetPageRequest) {
  return listSupplierRows({
    filters,
    offset,
    pageSize,
    workspaceId
  });
}

export function getSupplier(supplierId: string) {
  return getSupplierRow(supplierId);
}

export function createSupplier(
  input: CreateSupplierInput,
  workspaceId: string
) {
  return insertSupplierRow(input, workspaceId);
}

export function updateSupplier(supplierId: string, input: UpdateSupplierInput) {
  return updateSupplierRow(supplierId, input);
}

export function softDeleteSupplier(supplierId: string) {
  return softDeleteSupplierRow(supplierId);
}
