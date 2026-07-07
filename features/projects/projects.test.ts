import {
  mapAddressSuggestions,
  mapResolvedAddress,
  mapStaticMapPreview
} from "@/features/projects/maps";
import { getMapsFunctionErrorMessage } from "@/features/projects/maps-errors";
import { buildProjectListQueryPlan } from "@/features/projects/query-builders";
import type { ProjectFormValues } from "@/features/projects/types";
import {
  normalizeProjectFilters,
  toCreateProjectInput,
  validateProjectForm
} from "@/features/projects/validation";
import { consumeFixedWindowRateLimit } from "@/lib/rate-limit";
import { describe, expect, it } from "vitest";

const validValues: ProjectFormValues = {
  address: {
    address: "Av. Corrientes 1234, Buenos Aires",
    latitude: -34.6037,
    longitude: -58.3816,
    placeId: "google-place-id"
  },
  building_type: "commercial",
  coverAsset: null,
  description: "Lobby renovation",
  end_date: "",
  estimated_end_date: "2026-08-01",
  estimated_start_date: "2026-07-01",
  name: "Corrientes Renovation",
  phase: "design",
  progress_percentage: "15",
  project_type: "renovation",
  start_date: "",
  status: "planned"
};

describe("project validation", () => {
  it("requires a Google-selected address with coordinates", () => {
    const result = validateProjectForm({ ...validValues, address: null });

    expect(result.values).toBeNull();
    expect(result.errors.address).toBe("Select an address from Google Maps.");
  });

  it("normalizes valid form values into create input", () => {
    const result = validateProjectForm(validValues);

    expect(result.errors).toEqual({});
    expect(result.values).not.toBeNull();

    const input = toCreateProjectInput({
      ownerId: "owner-id",
      values: result.values as ProjectFormValues & {
        address: NonNullable<ProjectFormValues["address"]>;
      }
    });

    expect(input).toMatchObject({
      address: "Av. Corrientes 1234, Buenos Aires",
      description: "Lobby renovation",
      google_place_id: "google-place-id",
      owner_id: "owner-id",
      progress_percentage: 15
    });
  });

  it("rejects invalid date ordering", () => {
    const result = validateProjectForm({
      ...validValues,
      estimated_end_date: "2026-06-01"
    });

    expect(result.errors.estimated_end_date).toBe(
      "Estimated end date must be after the start date."
    );
  });
});

describe("project filters and query planning", () => {
  it("normalizes all filter values to null", () => {
    expect(
      normalizeProjectFilters({
        phase: "all",
        projectType: "all",
        query: "  ",
        status: "all"
      })
    ).toEqual({
      buildingType: null,
      phase: null,
      projectType: null,
      query: null,
      status: null
    });
  });

  it("adds owner filtering for normal users", () => {
    const plan = buildProjectListQueryPlan({
      filters: { status: "in_progress" },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.filters).toContainEqual({
      column: "deleted_at",
      operator: "is",
      value: null
    });
    expect(plan.filters).toContainEqual({
      column: "owner_id",
      operator: "eq",
      value: "user-id"
    });
  });

  it("does not add owner filtering for admins", () => {
    const plan = buildProjectListQueryPlan({
      filters: { status: "in_progress" },
      userId: "admin-id",
      userRole: "admin"
    });

    expect(plan.filters).not.toContainEqual({
      column: "owner_id",
      operator: "eq",
      value: "admin-id"
    });
  });
});

describe("Google Maps response mapping", () => {
  it("maps autocomplete suggestions defensively", () => {
    expect(
      mapAddressSuggestions({
        suggestions: [
          { placeId: "ignored" },
          { placeId: "place-1", text: "Main St" },
          null
        ]
      })
    ).toEqual([{ placeId: "place-1", text: "Main St" }]);
  });

  it("maps resolved address coordinates", () => {
    expect(
      mapResolvedAddress({
        address: "Main St",
        latitude: -34,
        longitude: -58,
        placeId: "place-1"
      })
    ).toEqual({
      address: "Main St",
      latitude: -34,
      longitude: -58,
      placeId: "place-1"
    });
  });

  it("maps static map preview image responses", () => {
    expect(
      mapStaticMapPreview({
        attribution: "Google Maps",
        imageDataUrl: "data:image/png;base64,abc"
      })
    ).toEqual({
      attribution: "Google Maps",
      imageDataUrl: "data:image/png;base64,abc"
    });
  });
});

describe("Google Maps repository errors", () => {
  it("preserves Edge Function error payload messages", async () => {
    const error = new Error(
      "Edge Function returned a non-2xx status code"
    ) as Error & { context: Response };
    error.context = new Response(
      JSON.stringify({ error: "Google Maps is not configured." }),
      { status: 500 }
    );

    await expect(getMapsFunctionErrorMessage(error)).resolves.toBe(
      "Google Maps is not configured."
    );
  });
});

describe("rate limit helper", () => {
  it("allows requests until the fixed window limit is reached", () => {
    const store = new Map();

    expect(
      consumeFixedWindowRateLimit({
        key: "user",
        limit: 2,
        now: 1000,
        store,
        windowMs: 60_000
      }).allowed
    ).toBe(true);
    expect(
      consumeFixedWindowRateLimit({
        key: "user",
        limit: 2,
        now: 1001,
        store,
        windowMs: 60_000
      }).allowed
    ).toBe(true);
    expect(
      consumeFixedWindowRateLimit({
        key: "user",
        limit: 2,
        now: 1002,
        store,
        windowMs: 60_000
      }).allowed
    ).toBe(false);
  });
});
