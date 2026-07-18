import { beforeEach, describe, expect, it, vi } from "vitest";

import { uploadProjectCover } from "@/features/projects/services/projects.service";

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  getProjectRow: vi.fn(),
  removeProjectCoverObject: vi.fn(),
  replaceProjectCoverPath: vi.fn(),
  uploadProjectCoverObject: vi.fn()
}));

vi.mock(
  "@/features/projects/repositories/project-covers.repository",
  () => ({
    createProjectCoverSignedUrl: vi.fn(),
    removeProjectCoverObject: mocks.removeProjectCoverObject,
    uploadProjectCoverObject: mocks.uploadProjectCoverObject
  })
);

vi.mock("@/features/projects/repositories/projects.repository", () => ({
  getProjectRow: mocks.getProjectRow,
  insertProjectRow: vi.fn(),
  listProjectRows: vi.fn(),
  replaceProjectCoverPath: mocks.replaceProjectCoverPath,
  softDeleteProjectRow: vi.fn(),
  updateProjectRow: vi.fn()
}));

vi.mock("@/lib/sentry", () => ({
  Sentry: { captureException: mocks.captureException }
}));

const asset = { uri: "file:///cover.jpg" };

describe("project cover replacement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProjectRow.mockResolvedValue({
      cover_image_path: "projects/project-id/cover/old.jpg",
      id: "project-id"
    });
    mocks.uploadProjectCoverObject.mockResolvedValue(
      "projects/project-id/cover/new.jpg"
    );
    mocks.replaceProjectCoverPath.mockResolvedValue({ id: "project-id" });
  });

  it("removes the new cover when the database reference switch fails", async () => {
    mocks.replaceProjectCoverPath.mockRejectedValue(
      new Error("concurrent update")
    );

    await expect(
      uploadProjectCover({ asset, projectId: "project-id" })
    ).rejects.toThrow("concurrent update");
    expect(mocks.removeProjectCoverObject).toHaveBeenCalledWith({
      path: "projects/project-id/cover/new.jpg",
      projectId: "project-id"
    });
  });

  it("conditionally switches the reference before deleting the old cover", async () => {
    await uploadProjectCover({ asset, projectId: "project-id" });

    expect(mocks.replaceProjectCoverPath).toHaveBeenCalledWith({
      expectedCurrentPath: "projects/project-id/cover/old.jpg",
      newPath: "projects/project-id/cover/new.jpg",
      projectId: "project-id"
    });
    expect(mocks.removeProjectCoverObject).toHaveBeenCalledWith({
      path: "projects/project-id/cover/old.jpg",
      projectId: "project-id"
    });
  });

  it("keeps the new reference when old-object cleanup fails", async () => {
    mocks.removeProjectCoverObject.mockRejectedValue(
      new Error("cleanup failed")
    );

    await expect(
      uploadProjectCover({ asset, projectId: "project-id" })
    ).resolves.toBe("projects/project-id/cover/new.jpg");
    expect(mocks.captureException).toHaveBeenCalledOnce();
  });

  it("does not upload when the project is unavailable", async () => {
    mocks.getProjectRow.mockResolvedValue(null);

    await expect(
      uploadProjectCover({ asset, projectId: "missing" })
    ).rejects.toThrow("Project not found.");
    expect(mocks.uploadProjectCoverObject).not.toHaveBeenCalled();
  });
});
