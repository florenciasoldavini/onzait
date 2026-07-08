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
  progress_percentage: 15,
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
      values: result.values as ProjectFormValues & {
        address: NonNullable<ProjectFormValues["address"]>;
      }
    });

    expect(input).toMatchObject({
      address: "Av. Corrientes 1234, Buenos Aires",
      description: "Lobby renovation",
      google_place_id: "google-place-id",
      progress_percentage: 15
    });
    expect(input).not.toHaveProperty("owner_id");
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
      buildingTypes: null,
      phases: null,
      projectTypes: null,
      query: null,
      sort: "created_desc",
      statuses: null
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

  it("plans multi-select category filters", () => {
    const plan = buildProjectListQueryPlan({
      filters: {
        phases: ["design", "construction"],
        projectTypes: ["new_build", "renovation"],
        statuses: ["planned", "in_progress"]
      },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.filters).toContainEqual({
      column: "status",
      operator: "in",
      value: ["planned", "in_progress"]
    });
    expect(plan.filters).toContainEqual({
      column: "phase",
      operator: "in",
      value: ["design", "construction"]
    });
    expect(plan.filters).toContainEqual({
      column: "project_type",
      operator: "in",
      value: ["new_build", "renovation"]
    });
  });

  it("sorts by newest creation by default", () => {
    const plan = buildProjectListQueryPlan({
      filters: {},
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.order).toEqual({
      ascending: false,
      column: "created_at"
    });
  });

  it("sorts alphabetically when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "name_asc" },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.order).toEqual({
      ascending: true,
      column: "name"
    });
  });

  it("sorts descending when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "name_desc" },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.order).toEqual({
      ascending: false,
      column: "name"
    });
  });

  it("sorts creation ascending when requested", () => {
    const plan = buildProjectListQueryPlan({
      filters: { sort: "created_asc" },
      userId: "user-id",
      userRole: "user"
    });

    expect(plan.order).toEqual({
      ascending: true,
      column: "created_at"
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
