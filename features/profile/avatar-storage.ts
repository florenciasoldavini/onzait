export type ProfileAvatarAssetMetadata = {
  fileName?: string | null;
  mimeType?: string | null;
};

export function buildProfileAvatarPath({
  asset,
  userId,
  uuid = createRandomId()
}: {
  asset: ProfileAvatarAssetMetadata;
  userId: string;
  uuid?: string;
}) {
  return `users/${userId}/avatar/${uuid}.${getAvatarExtension(asset)}`;
}

export function getProfileAvatarPathFromPublicUrl({
  bucket,
  publicUrl,
  userId
}: {
  bucket: string;
  publicUrl: string | null | undefined;
  userId: string;
}) {
  if (!publicUrl) {
    return null;
  }

  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const pathname = new URL(publicUrl).pathname;
    const markerIndex = pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    const path = decodeURIComponent(
      pathname.slice(markerIndex + marker.length)
    );

    return path.startsWith(`users/${userId}/avatar/`) ? path : null;
  } catch {
    return null;
  }
}

export function getMimeTypeFromExtension(extension: string) {
  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "heic") {
    return "image/heic";
  }

  if (extension === "heif") {
    return "image/heif";
  }

  return "image/jpeg";
}

function createRandomId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function getAvatarExtension(asset: ProfileAvatarAssetMetadata) {
  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();

  if (
    fileExtension &&
    ["heic", "heif", "jpeg", "jpg", "png", "webp"].includes(fileExtension)
  ) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }

  if (asset.mimeType?.includes("png")) {
    return "png";
  }

  if (asset.mimeType?.includes("webp")) {
    return "webp";
  }

  if (asset.mimeType?.includes("heic")) {
    return "heic";
  }

  if (asset.mimeType?.includes("heif")) {
    return "heif";
  }

  return "jpg";
}
