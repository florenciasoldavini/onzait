import { parseProjectTeam } from "@/features/projects/schemas/project-participant.schema";

describe("project team parsing", () => {
  it("keeps the owning organization separate from direct collaborators", () => {
    const result = parseProjectTeam({
      has_more: false,
      invitations: [],
      members: [
        {
          email: "external@example.com",
          first_name: "External",
          id: "20000000-0000-4000-8000-000000000001",
          joined_at: "2026-09-16T12:00:00.000Z",
          last_name: null,
          role_code: "viewer",
          user_id: "00000000-0000-4000-8000-000000000002"
        }
      ],
      next_page: null,
      organization: {
        avatar: null,
        id: "80000000-0000-4000-8000-000000000001",
        name: "Studio North"
      }
    });

    expect(result.organization.name).toBe("Studio North");
    expect(result.members).toHaveLength(1);
    expect(result.members[0]?.email).toBe("external@example.com");
  });
});
