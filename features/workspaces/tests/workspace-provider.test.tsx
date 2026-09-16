import { AuthContext } from "@/features/auth/providers/auth-context";
import type { User } from "@/features/auth/types/auth.types";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { WorkspaceProvider } from "@/features/workspaces/providers/workspace-provider";
import {
  getPreferredWorkspaceId,
  listMyWorkspaces,
  savePreferredWorkspaceId
} from "@/features/workspaces/services/workspaces.service";
import type { Session } from "@supabase/supabase-js";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { renderWithAppProviders as render } from "@/tests/support/render";

jest.mock("@/features/workspaces/services/workspaces.service", () => ({
  getPreferredWorkspaceId: jest.fn(),
  listMyWorkspaces: jest.fn(),
  savePreferredWorkspaceId: jest.fn()
}));

jest.mock("@/infrastructure/monitoring/sentry", () => ({
  Sentry: { captureException: jest.fn() }
}));

const user: User = {
  avatar: null,
  created_at: new Date("2026-09-01T12:00:00.000Z"),
  deleted_at: null,
  email: "owner@example.com",
  first_name: "Site",
  id: "user-1",
  last_name: "Owner",
  phone_number: null,
  role: "user",
  updated_at: null,
  welcome_email_sent_at: new Date("2026-09-01T12:01:00.000Z")
};
const session = {
  access_token: "initial-token",
  user: { id: user.id }
} as Session;
const workspace = {
  avatar: null,
  display_avatar: null,
  display_name: "Studio North",
  id: "workspace-1",
  name: null,
  organization_avatar: null,
  organization_id: "organization-1",
  organization_name: "Studio North",
  owner_user_id: user.id,
  role_code: "admin" as const
};

function WorkspaceProbe() {
  const { activeWorkspaceId, isLoading } = useWorkspace();
  return (
    <>
      <Text>{isLoading ? "loading" : "ready"}</Text>
      <Text>{activeWorkspaceId ?? "no-workspace"}</Text>
    </>
  );
}

function Harness() {
  const [currentSession, setCurrentSession] = useState(session);
  return (
    <AuthContext.Provider
      value={{
        authError: null,
        createUser: async () => user,
        isLoading: false,
        logOut: async () => {},
        session: currentSession,
        updateUserProfile: async () => user,
        user
      }}
    >
      <WorkspaceProvider>
        <WorkspaceProbe />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setCurrentSession({
              ...currentSession,
              access_token: "refreshed-token"
            })
          }
        >
          <Text>Refresh token</Text>
        </Pressable>
      </WorkspaceProvider>
    </AuthContext.Provider>
  );
}

describe("WorkspaceProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(listMyWorkspaces).mockResolvedValue({
      has_more: false,
      items: [workspace],
      next_offset: null
    });
    jest.mocked(getPreferredWorkspaceId).mockResolvedValue(workspace.id);
    jest.mocked(savePreferredWorkspaceId).mockResolvedValue(undefined);
  });

  it("does not reload workspaces when the same user's token changes", async () => {
    await act(async () => {
      render(<Harness />);
    });

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeOnTheScreen();
      expect(screen.getByText(workspace.id)).toBeOnTheScreen();
    });
    expect(listMyWorkspaces).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole("button", { name: "Refresh token" }));

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeOnTheScreen();
      expect(screen.getByText(workspace.id)).toBeOnTheScreen();
    });
    expect(listMyWorkspaces).toHaveBeenCalledTimes(1);
  });
});
