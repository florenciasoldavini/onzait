import {
  useContractor,
  useContractors
} from "@/features/contractors/hooks/use-contractors";
import { getContractorDisplayName } from "@/features/contractors/schemas/contractor.schema";
import { CatalogPickerField } from "@/shared/ui/components/catalog-picker-field";
import { HardHatIcon } from "@/shared/ui/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ContractorPickerField({
  onChange,
  workspaceId,
  value
}: {
  onChange: (contractorId: string | null) => void;
  workspaceId?: string;
  value: string | null;
}) {
  const { t } = useTranslation("features/contractors");
  const [query, setQuery] = useState("");
  const contractorsQuery = useContractors({
    workspaceId,
    query,
    sort: "name_asc"
  });
  const selectedContractorQuery = useContractor(value ?? undefined);

  return (
    <CatalogPickerField
      entityName={t(($) => $["features/contractors"].picker.entity)}
      entityNamePlural={t(($) => $["features/contractors"].picker.entities)}
      getDisplayName={getContractorDisplayName}
      hasNextPage={contractorsQuery.hasNextPage}
      icon={HardHatIcon}
      isError={contractorsQuery.isError}
      isFetchingNextPage={contractorsQuery.isFetchingNextPage}
      isLoading={contractorsQuery.isLoading}
      label={t(($) => $["features/contractors"].picker.label)}
      onChange={onChange}
      onLoadMore={() => void contractorsQuery.fetchNextPage()}
      onQueryChange={setQuery}
      pages={contractorsQuery.data?.pages}
      query={query}
      selectedItemFallback={selectedContractorQuery.data}
      value={value}
    />
  );
}
