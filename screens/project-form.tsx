import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  Screen,
  SelectField,
  SkeletonBlock,
  TextAreaField,
  TextField
} from "@/components/atoms";
import { atomPalette, atomSpacing } from "@/components/atoms/theme";
import { Spinner } from "@/components/ui/spinner";
import { AuthContext } from "@/contexts/auth";
import {
  PROJECT_BUILDING_TYPE_LABELS,
  PROJECT_BUILDING_TYPES,
  PROJECT_PHASE_LABELS,
  PROJECT_PHASES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES
} from "@/features/projects/constants";
import {
  useAddressAutocomplete,
  useCreateProject,
  useProject,
  useResolveAddress,
  useUpdateProject,
  useUploadProjectCover
} from "@/features/projects/hooks";
import type {
  Project,
  ProjectFormValues,
  ResolvedProjectAddress
} from "@/features/projects/types";
import {
  type ProjectFormErrors,
  toCreateProjectInput,
  toUpdateProjectInput,
  validateProjectForm
} from "@/features/projects/validation";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ImagePlus, MapPinned, Save } from "lucide-react-native";
import { useContext, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";

const defaultValues: ProjectFormValues = {
  address: null,
  building_type: "residential",
  coverAsset: null,
  description: "",
  end_date: "",
  estimated_end_date: "",
  estimated_start_date: "",
  name: "",
  phase: "concept",
  progress_percentage: "0",
  project_type: "new_build",
  start_date: "",
  status: "planned"
};

export function ProjectFormScreen({
  mode,
  projectId
}: {
  mode: "create" | "edit";
  projectId?: string;
}) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [values, setValues] = useState<ProjectFormValues>(defaultValues);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const projectQuery = useProject(mode === "edit" ? projectId : undefined);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(projectId ?? "");
  const uploadMutation = useUploadProjectCover(projectId);
  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;

  useEffect(() => {
    if (mode === "edit" && projectQuery.data) {
      setValues(getValuesFromProject(projectQuery.data));
    }
  }, [mode, projectQuery.data]);

  const setField = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setFormError("You must be signed in to save projects.");
      return;
    }

    const result = validateProjectForm(values);
    setErrors(result.errors);

    if (!result.values || !result.values.address) {
      setFormError("Review the highlighted fields before saving.");
      return;
    }

    setFormError(null);

    try {
      if (mode === "create") {
        const project = await createMutation.mutateAsync(
          toCreateProjectInput({
            ownerId: user.id,
            values: result.values as Omit<ProjectFormValues, "coverAsset"> & {
              address: ResolvedProjectAddress;
            }
          })
        );

        if (values.coverAsset) {
          await uploadMutation.mutateAsync({
            asset: values.coverAsset,
            projectId: project.id
          });
        }

        router.replace(`/projects/${project.id}` as never);
        return;
      }

      if (!projectId) {
        throw new Error("Missing project id.");
      }

      await updateMutation.mutateAsync(
        toUpdateProjectInput(
          result.values as Omit<ProjectFormValues, "coverAsset"> & {
            address: ResolvedProjectAddress;
          }
        )
      );

      if (values.coverAsset) {
        await uploadMutation.mutateAsync({ asset: values.coverAsset });
      }

      router.replace(`/projects/${projectId}` as never);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Project could not be saved."
      );
    }
  };

  if (mode === "edit" && projectQuery.isLoading) {
    return (
      <Screen>
        <View style={{ gap: atomSpacing[5] }}>
          <SkeletonBlock height={36} width="50%" />
          <SkeletonBlock height={220} />
          <SkeletonBlock height={320} />
        </View>
      </Screen>
    );
  }

  if (mode === "edit" && !projectQuery.data) {
    return (
      <Screen centered>
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[4] }}>
            <AppHeading variant="section">Project not found</AppHeading>
            <AppText tone="muted">
              This project may have been removed or you may not have access.
            </AppText>
            <AppButton onPress={() => router.replace("/projects" as never)}>
              Back to projects
            </AppButton>
          </View>
        </AppCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">
            Projects / {mode === "create" ? "New" : "Edit"}
          </AppText>
          <AppHeading variant="hero">
            {mode === "create"
              ? "Create a project."
              : "Update project details."}
          </AppHeading>
          <AppText tone="muted">
            Projects anchor site tasks, uploads, location, and future
            client-facing work.
          </AppText>
        </View>

        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[5] }}>
            <CoverPicker
              currentUrl={projectQuery.data?.cover_image_url ?? null}
              onChange={(asset) => setField("coverAsset", asset)}
              value={values.coverAsset ?? null}
            />

            <TextField
              errorText={errors.name}
              label="Project Name"
              onChangeText={(text) => setField("name", text)}
              placeholder="Foundation Package"
              value={values.name}
            />

            <TextAreaField
              errorText={errors.description}
              label="Description"
              onChangeText={(text) => setField("description", text)}
              placeholder="Scope, crew notes, client context..."
              value={values.description}
            />

            <AddressField
              errorText={errors.address}
              onChange={(address) => setField("address", address)}
              value={values.address}
            />

            <SelectField
              label="Status"
              onChange={(value) => setField("status", value)}
              options={PROJECT_STATUSES.map((value) => ({
                label: PROJECT_STATUS_LABELS[value],
                value
              }))}
              value={values.status}
            />

            <SelectField
              label="Phase"
              onChange={(value) => setField("phase", value)}
              options={PROJECT_PHASES.map((value) => ({
                label: PROJECT_PHASE_LABELS[value],
                value
              }))}
              value={values.phase}
            />

            <SelectField
              label="Project Type"
              onChange={(value) => setField("project_type", value)}
              options={PROJECT_TYPES.map((value) => ({
                label: PROJECT_TYPE_LABELS[value],
                value
              }))}
              value={values.project_type}
            />

            <SelectField
              label="Building Type"
              onChange={(value) => setField("building_type", value)}
              options={PROJECT_BUILDING_TYPES.map((value) => ({
                label: PROJECT_BUILDING_TYPE_LABELS[value],
                value
              }))}
              value={values.building_type}
            />

            <TextField
              errorText={errors.progress_percentage}
              keyboardType="number-pad"
              label="Progress Percentage"
              onChangeText={(text) => setField("progress_percentage", text)}
              placeholder="0"
              value={values.progress_percentage}
            />

            <View style={{ gap: atomSpacing[4] }}>
              <View style={{ flexDirection: "row", gap: atomSpacing[3] }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    errorText={errors.estimated_start_date}
                    label="Estimated Start"
                    onChangeText={(text) =>
                      setField("estimated_start_date", text)
                    }
                    placeholder="YYYY-MM-DD"
                    value={values.estimated_start_date}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    errorText={errors.estimated_end_date}
                    label="Estimated End"
                    onChangeText={(text) =>
                      setField("estimated_end_date", text)
                    }
                    placeholder="YYYY-MM-DD"
                    value={values.estimated_end_date}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: atomSpacing[3] }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    errorText={errors.start_date}
                    label="Actual Start"
                    onChangeText={(text) => setField("start_date", text)}
                    placeholder="YYYY-MM-DD"
                    value={values.start_date}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    errorText={errors.end_date}
                    label="Actual End"
                    onChangeText={(text) => setField("end_date", text)}
                    placeholder="YYYY-MM-DD"
                    value={values.end_date}
                  />
                </View>
              </View>
            </View>

            {formError ? (
              <AppText selectable tone="danger">
                {formError}
              </AppText>
            ) : null}

            <View style={{ flexDirection: "row", gap: atomSpacing[3] }}>
              <View style={{ flex: 1 }}>
                <AppButton
                  isDisabled={isSubmitting}
                  onPress={() => router.back()}
                  color="neutral"
                  variant="bordered"
                >
                  Cancel
                </AppButton>
              </View>
              <View style={{ flex: 1 }}>
                <AppButton
                  icon={Save}
                  loading={isSubmitting}
                  onPress={handleSubmit}
                >
                  {mode === "create" ? "Create" : "Save"}
                </AppButton>
              </View>
            </View>
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}

function AddressField({
  errorText,
  onChange,
  value
}: {
  errorText?: string | null;
  onChange: (address: ResolvedProjectAddress | null) => void;
  value: ResolvedProjectAddress | null;
}) {
  const [query, setQuery] = useState(value?.address ?? "");
  const [sessionToken, setSessionToken] = useState(() => createSessionToken());
  const suggestionsQuery = useAddressAutocomplete(query, sessionToken);
  const resolveMutation = useResolveAddress();
  const suggestions = suggestionsQuery.data ?? [];

  useEffect(() => {
    if (value?.address && value.address !== query) {
      setQuery(value.address);
    }
  }, [query, value]);

  const handleSuggestionPress = async (placeId: string) => {
    const resolved = await resolveMutation.mutateAsync({
      placeId,
      sessionToken
    });
    onChange(resolved);
    setQuery(resolved.address);
    setSessionToken(createSessionToken());
  };

  return (
    <View style={{ gap: atomSpacing[3] }}>
      <TextField
        errorText={errorText}
        label="Project Address"
        leftIcon={MapPinned}
        onChangeText={(text) => {
          setQuery(text);
          onChange(null);
        }}
        placeholder="Search with Google Maps"
        rightSlot={
          suggestionsQuery.isFetching || resolveMutation.isPending ? (
            <Spinner color={atomPalette.accent} size="small" />
          ) : null
        }
        value={query}
      />

      {suggestions.length > 0 ? (
        <AppCard padding="sm" tone="muted">
          <View style={{ gap: atomSpacing[2] }}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.placeId}
                onPress={() => {
                  void handleSuggestionPress(suggestion.placeId);
                }}
                style={({ pressed }) =>
                  [
                    {
                      borderRadius: 10,
                      opacity: pressed ? 0.72 : 1,
                      padding: atomSpacing[3]
                    },
                    Platform.OS === "web"
                      ? ({ cursor: "pointer" } as ViewStyle)
                      : null
                  ] as ViewStyle[]
                }
              >
                <AppText>{suggestion.text}</AppText>
              </Pressable>
            ))}
            <AppText tone="subtle" variant="caption">
              Address suggestions by Google Maps
            </AppText>
          </View>
        </AppCard>
      ) : null}

      {value ? (
        <AppText tone="success" variant="bodySm">
          Coordinates selected from Google Maps: {value.latitude.toFixed(5)},{" "}
          {value.longitude.toFixed(5)}
        </AppText>
      ) : null}
    </View>
  );
}

function CoverPicker({
  currentUrl,
  onChange,
  value
}: {
  currentUrl: string | null;
  onChange: (asset: ProjectFormValues["coverAsset"]) => void;
  value: ProjectFormValues["coverAsset"];
}) {
  const previewUri = value?.uri ?? currentUrl;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    onChange({
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      uri: asset.uri
    });
  };

  return (
    <View style={{ gap: atomSpacing[3] }}>
      <AppText tone="subtle" variant="formLabel">
        Cover Image
      </AppText>
      <Pressable
        accessibilityLabel="Choose project cover image"
        accessibilityRole="button"
        onPress={() => {
          void pickImage();
        }}
        style={StyleSheet.flatten([
          projectFormStyles.coverPicker,
          Platform.OS === "web" ? projectFormStyles.webCursor : null
        ])}
      >
        {previewUri ? (
          <Image
            contentFit="cover"
            source={{ uri: previewUri }}
            style={{ height: "100%", width: "100%" }}
          />
        ) : (
          <View style={{ alignItems: "center", gap: atomSpacing[2] }}>
            <ImagePlus color={atomPalette.textMuted} size={24} />
            <AppText tone="muted">Choose a cover image</AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const projectFormStyles = StyleSheet.create({
  coverPicker: {
    alignItems: "center",
    backgroundColor: atomPalette.surfaceLow,
    borderColor: atomPalette.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    height: 132,
    justifyContent: "center",
    overflow: "hidden"
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});

function getValuesFromProject(project: Project): ProjectFormValues {
  return {
    address: {
      address: project.address,
      latitude: project.latitude,
      longitude: project.longitude,
      placeId: project.google_place_id
    },
    building_type: project.building_type,
    coverAsset: null,
    description: project.description ?? "",
    end_date: project.end_date ?? "",
    estimated_end_date: project.estimated_end_date ?? "",
    estimated_start_date: project.estimated_start_date ?? "",
    name: project.name,
    phase: project.phase,
    progress_percentage: String(project.progress_percentage),
    project_type: project.project_type,
    start_date: project.start_date ?? "",
    status: project.status
  };
}

function createSessionToken() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
