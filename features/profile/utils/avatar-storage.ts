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

export function getProfileAvatarStoragePath({
  bucket,
  reference,
  userId
}: {
  bucket: string;
  reference: string | null | undefined;
  userId?: string;
}) {
  const normalizedReference = reference?.trim();

  if (!normalizedReference) {
    return null;
  }

  if (isProfileAvatarPath(normalizedReference, userId)) {
    return normalizedReference;
  }

  try {
    const pathname = new URL(normalizedReference).pathname;
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`
    ];
    const marker = markers.find((candidate) => pathname.includes(candidate));

    if (!marker) {
      return null;
    }

    const path = decodeURIComponent(
      pathname.slice(pathname.indexOf(marker) + marker.length)
    );

    return isProfileAvatarPath(path, userId) ? path : null;
  } catch {
    return null;
  }
}

export function isExternalProfileAvatarUrl(reference: string) {
  try {
    const url = new URL(reference);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
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

function isProfileAvatarPath(path: string, userId?: string) {
  const [usersSegment, ownerId, avatarSegment, fileName, ...rest] =
    path.split("/");

  return (
    usersSegment === "users" &&
    Boolean(ownerId) &&
    (!userId || ownerId === userId) &&
    avatarSegment === "avatar" &&
    Boolean(fileName) &&
    fileName !== "." &&
    fileName !== ".." &&
    rest.length === 0
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
