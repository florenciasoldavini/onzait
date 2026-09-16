export type OrganizationAvatarAssetMetadata = {
  fileName?: string | null;
  mimeType?: string | null;
};

export function buildOrganizationAvatarPath({
  asset,
  organizationId,
  uuid = createRandomId()
}: {
  asset: OrganizationAvatarAssetMetadata;
  organizationId: string;
  uuid?: string;
}) {
  return `organizations/${organizationId}/avatar/${uuid}.${getAvatarExtension(asset)}`;
}

export function isOrganizationAvatarPath(
  path: string,
  organizationId?: string
) {
  const [organizations, ownerId, avatar, fileName, ...rest] = path.split("/");

  return (
    organizations === "organizations" &&
    Boolean(ownerId) &&
    (!organizationId || ownerId === organizationId) &&
    avatar === "avatar" &&
    Boolean(fileName) &&
    fileName !== "." &&
    fileName !== ".." &&
    rest.length === 0
  );
}

export function getOrganizationAvatarMimeType(extension: string) {
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  return "image/jpeg";
}

function getAvatarExtension(asset: OrganizationAvatarAssetMetadata) {
  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();

  if (
    fileExtension &&
    ["heic", "heif", "jpeg", "jpg", "png", "webp"].includes(fileExtension)
  ) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }

  if (asset.mimeType?.includes("png")) return "png";
  if (asset.mimeType?.includes("webp")) return "webp";
  if (asset.mimeType?.includes("heic")) return "heic";
  if (asset.mimeType?.includes("heif")) return "heif";
  return "jpg";
}

function createRandomId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
