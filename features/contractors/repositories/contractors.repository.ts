import { buildContractorListQueryPlan } from "@/features/contractors/repositories/contractor-list-query";
import type {
  Contractor,
  ContractorFilters,
  ContractorSummary,
  CreateContractorInput,
  UpdateContractorInput
} from "@/features/contractors/types/contractor";
import {
  requireSupabase,
  toRepositoryError
} from "@/infrastructure/supabase/repository";
import {
  getOffsetPageRange,
  toPaginatedResult,
  type OffsetPageRequest
} from "@/shared/utils/pagination";

const CONTRACTOR_SUMMARY_COLUMNS = [
  "email",
  "first_name",
  "id",
  "last_name",
  "created_by",
  "phone_number",
  "workspace_id"
].join(",");

export async function listContractorRows({
  filters,
  offset,
  pageSize,
  workspaceId
}: {
  filters?: ContractorFilters;
  workspaceId: string;
} & OffsetPageRequest) {
  const client = requireSupabase();
  const plan = buildContractorListQueryPlan({ filters, workspaceId });
  const range = getOffsetPageRange({ offset, pageSize });
  let query = client.from("contractors").select(CONTRACTOR_SUMMARY_COLUMNS);

  for (const filter of plan.filters) {
    if (filter.operator === "eq") {
      query = query.eq(filter.column, filter.value as string);
    } else if (filter.operator === "is") {
      query = query.is(filter.column, filter.value);
    } else {
      query = query.or(filter.value as string);
    }
  }

  for (const order of plan.orders) {
    query = query.order(order.column, { ascending: order.ascending });
  }

  const { data, error } = await query.range(range.from, range.to);

  if (error) {
    throw toRepositoryError(error);
  }

  return toPaginatedResult(
    (data ?? []) as unknown as ContractorSummary[],
    range
  );
}

export async function getContractorRow(contractorId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contractors")
    .select("*")
    .eq("id", contractorId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw toRepositoryError(error);
  }

  return data ? (data as Contractor) : null;
}

export async function insertContractorRow(
  input: CreateContractorInput,
  workspaceId: string
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contractors")
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single();

  if (error) {
    throw toRepositoryError(error);
  }

  return data as Contractor;
}

export async function updateContractorRow(
  contractorId: string,
  input: UpdateContractorInput
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contractors")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", contractorId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw toRepositoryError(error);
  }

  return data as Contractor;
}

export async function softDeleteContractorRow(contractorId: string) {
  const client = requireSupabase();
  const { error } = await client
    .from("contractors")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", contractorId)
    .is("deleted_at", null);

  if (error) {
    throw toRepositoryError(error);
  }
}
