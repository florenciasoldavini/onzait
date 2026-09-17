import { DesktopAppTopBar } from "@/shared/ui/components/desktop-app-topbar";
import { AppTopBarProvider } from "@/shared/ui/providers/app-topbar-provider";
import { useProjects } from "@/features/projects/hooks/use-projects";
import ProjectsScreen from "@/features/projects/screens/projects-screen";
import type { ProjectSummary } from "@/features/projects/types/project.types";
import { useLayoutMode } from "@/shared/hooks/use-layout-mode";
import { renderWithAppProviders } from "@/tests/support/render";
import { Platform } from "react-native";
import { fireEvent, userEvent } from "@testing-library/react-native";

jest.mock("@/features/projects/components/projects-map-lazy", () => {
  const React = jest.requireActual("react");
  const { Text, View, Pressable } = jest.requireActual("react-native");
  return {
    ProjectsMapView: ({
      onSelectProject,
      selectedProjectId,
      highlightedProjectId,
      projects,
      showMapWhenEmpty
    }: {
      projects: ProjectSummary[];
      showMapWhenEmpty?: boolean;
      onSelectProject?: (id: string) => void;
      selectedProjectId?: string | null;
      highlightedProjectId?: string | null;
    }) =>
      React.createElement(
        View,
        null,
        React.createElement(
          Text,
          null,
          projects.length || showMapWhenEmpty ? "projects-map" : "no-map"
        ),
        React.createElement(
          Text,
          null,
          `Selected: ${selectedProjectId ?? "none"}`
        ),
        React.createElement(
          Text,
          null,
          `Highlighted: ${highlightedProjectId ?? "none"}`
        ),
        projects.length
          ? React.createElement(Pressable, {
              accessibilityRole: "button",
              accessibilityLabel: "Map pin",
              onPress: () => onSelectProject?.("project-1")
            })
          : null
      )
  };
});

const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockFetchNextPage = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

jest.mock("@/features/projects/hooks/use-projects", () => ({
  useProjects: jest.fn()
}));

jest.mock("@/shared/hooks/use-layout-mode", () => ({
  useLayoutMode: jest.fn()
}));

jest.mock("@/features/projects/components/project-card", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");

  return {
    ProjectCard: ({
      onPress,
      project
    }: {
      onPress: () => void;
      project: ProjectSummary;
    }) =>
      React.createElement(
        Pressable,
        {
          accessibilityLabel: `Open ${project.name}`,
          accessibilityRole: "button",
          onPress
        },
        React.createElement(Text, null, project.name)
      )
  };
});

jest.mock("@/features/projects/components/project-card-skeleton", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");

  return {
    ProjectCardSkeleton: () =>
      React.createElement(Text, null, "project-loading")
  };
});

jest.mock("@/features/projects/components/projects-table", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text, View } = jest.requireActual("react-native");

  return {
    ProjectsTable: ({
      onOpenProject,
      projects
    }: {
      onOpenProject: (project: ProjectSummary) => void;
      projects: ProjectSummary[];
    }) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, "projects-table"),
        ...projects.map((project) =>
          React.createElement(
            Pressable,
            {
              accessibilityLabel: `Open table ${project.name}`,
              accessibilityRole: "button",
              key: project.id,
              onPress: () => onOpenProject(project)
            },
            React.createElement(Text, null, project.name)
          )
        )
      ),
    ProjectsTableSkeleton: () =>
      React.createElement(Text, null, "projects-table-loading")
  };
});

const project: ProjectSummary = {
  address: "1 Site Road",
  cover_image_path: null,
  estimated_end_date: null,
  id: "project-1",
  latitude: -34.6,
  longitude: -58.4,
  name: "River House",
  phase: "concept",
  progress_percentage: 0,
  project_type: "new_build",
  status: "planned"
};

function setLayout(mode: "compact" | "expanded" | "medium") {
  jest.mocked(useLayoutMode).mockReturnValue({
    height: 844,
    isCompact: mode === "compact",
    isExpanded: mode === "expanded",
    isMedium: mode === "medium",
    mode,
    width: mode === "compact" ? 390 : mode === "medium" ? 900 : 1440
  });
}

function mockProjectsQuery(
  overrides: Partial<ReturnType<typeof useProjects>> = {}
) {
  jest.mocked(useProjects).mockReturnValue({
    data: { pageParams: [0], pages: [{ items: [], nextOffset: null }] },
    error: null,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: mockRefetch,
    ...overrides
  } as never);
}

describe("ProjectsScreen", () => {
  beforeEach(() => {
    setLayout("medium");
    mockProjectsQuery();
  });

  it("shows an actionable query error", async () => {
    const user = userEvent.setup();
    mockProjectsQuery({
      data: undefined,
      error: new Error("provider details"),
      isError: true
    });
    const view = await renderWithAppProviders(<ProjectsScreen />);

    expect(view.getByText("Projects unavailable")).toBeOnTheScreen();
    await user.press(view.getByRole("button", { name: "Retry" }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("opens project creation from the empty state", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);

    expect(view.getByText("No projects yet")).toBeOnTheScreen();
    await user.press(view.getByRole("button", { name: "New Project" }));

    expect(mockPush).toHaveBeenCalledWith("/projects/new");
  });

  it("renders compact project cards, pagination, and the floating action", async () => {
    const user = userEvent.setup();
    setLayout("compact");
    mockProjectsQuery({
      data: {
        pageParams: [0],
        pages: [{ items: [project], nextOffset: 24 }]
      },
      hasNextPage: true
    });
    const view = await renderWithAppProviders(<ProjectsScreen />);

    await user.press(view.getByRole("button", { name: "Open River House" }));
    expect(mockPush).toHaveBeenCalledWith("/projects/project-1");

    await user.press(view.getByRole("button", { name: "Load more projects" }));
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);

    await user.press(view.getByRole("button", { name: "New project" }));
    expect(mockPush).toHaveBeenCalledWith("/projects/new");
  });

  it("uses the table and header creation action in expanded layouts", async () => {
    const user = userEvent.setup();
    setLayout("expanded");
    mockProjectsQuery({
      data: {
        pageParams: [0],
        pages: [{ items: [project], nextOffset: null }]
      }
    });
    const view = await renderWithAppProviders(<ProjectsScreen />);

    expect(view.getByText("projects-table")).toBeOnTheScreen();
    expect(
      view.queryByPlaceholderText("Search projects")
    ).not.toBeOnTheScreen();
    await user.press(
      view.getByRole("button", { name: "Open table River House" })
    );
    expect(mockPush).toHaveBeenCalledWith("/projects/project-1");

    await user.press(view.getByRole("button", { name: "New project" }));
    expect(mockPush).toHaveBeenCalledWith("/projects/new");
  });

  it("passes tablet top-bar search text to the project query", async () => {
    setLayout("medium");
    const user = userEvent.setup();
    const view = await renderWithAppProviders(
      <AppTopBarProvider>
        <DesktopAppTopBar />
        <ProjectsScreen />
      </AppTopBarProvider>
    );

    await user.type(view.getByPlaceholderText("Search projects"), "river");

    expect(useProjects).toHaveBeenLastCalledWith({
      buildingTypes: [],
      phases: [],
      projectTypes: [],
      query: "river",
      sort: "created_desc",
      statuses: []
    });
  });
});

describe("ProjectsScreen view controls", () => {
  const originalPlatform = Platform.OS;
  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalPlatform });
  });
  beforeEach(() => {
    Object.defineProperty(Platform, "OS", { value: "web" });
    setLayout("expanded");
    mockProjectsQuery({
      data: { pageParams: [0], pages: [{ items: [project], nextOffset: 24 }] },
      hasNextPage: true
    });
  });

  it("switches between desktop split, map, and list without changing filters", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    expect(await view.findByText("Loaded projects")).toBeOnTheScreen();
    expect(view.getByRole("button", { name: "Split view" })).toBeSelected();
    await user.press(
      view.getByRole("button", { name: "Show River House on map" })
    );
    expect(view.getByText("Selected: project-1")).toBeOnTheScreen();
    await user.press(view.getByRole("button", { name: "Load more projects" }));
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
    await user.press(view.getByRole("button", { name: "Map" }));
    expect(view.queryByText("Loaded projects")).not.toBeOnTheScreen();
    expect(view.getByText("projects-map")).toBeOnTheScreen();
    await user.press(view.getByRole("button", { name: "List" }));
    expect(view.getByText("projects-table")).toBeOnTheScreen();
  });

  it.each(["Split view", "Map"])(
    "keeps sort and filters available with the appropriate creation action in %s",
    async (mode) => {
      const user = userEvent.setup();
      const view = await renderWithAppProviders(<ProjectsScreen />);
      await user.press(view.getByRole("button", { name: mode }));
      await user.press(view.getByRole("button", { name: "Sort projects" }));
      await user.press(view.getByRole("button", { name: "Oldest" }));
      expect(useProjects).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: "created_asc" })
      );
      expect(view.getByRole("button", { name: "Filters" })).toBeOnTheScreen();
      if (mode === "Split view") {
        await user.press(view.getByRole("button", { name: "New project" }));
        expect(mockPush).toHaveBeenCalledWith("/projects/new");
      } else {
        expect(
          view.queryByRole("button", { name: "New project" })
        ).not.toBeOnTheScreen();
      }
    }
  );

  it("selects the matching row from the map and provides a separate open action", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    await user.press(await view.findByRole("button", { name: "Map pin" }));
    expect(
      view.getByRole("button", { name: "Show River House on map" })
    ).toBeSelected();
    await user.press(view.getByRole("button", { name: "Open River House" }));
    expect(mockPush).toHaveBeenCalledWith("/projects/project-1");
  });

  it("falls back to cards when resized and restores split on desktop", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    await view.findByText("Loaded projects");
    setLayout("compact");
    await view.rerender(<ProjectsScreen />);
    expect(
      view.queryByRole("button", { name: "Split view" })
    ).not.toBeOnTheScreen();
    expect(view.getByRole("button", { name: "List" })).toBeSelected();
    expect(
      view.getByRole("button", { name: "Open River House" })
    ).toBeOnTheScreen();
    setLayout("expanded");
    await view.rerender(<ProjectsScreen />);
    expect(await view.findByText("Loaded projects")).toBeOnTheScreen();
  });

  it("highlights a row's pin on hover and keyboard focus without selecting it", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    const row = view.getByRole("button", { name: "Show River House on map" });
    await fireEvent(row, "hoverIn");
    expect(view.getByText("Highlighted: project-1")).toBeOnTheScreen();
    expect(view.getByText("Selected: none")).toBeOnTheScreen();
    await fireEvent(row, "hoverOut");
    expect(view.getByText("Highlighted: none")).toBeOnTheScreen();
    await fireEvent(row, "focus");
    expect(view.getByText("Highlighted: project-1")).toBeOnTheScreen();
    await fireEvent(row, "blur");
    expect(view.getByText("Highlighted: none")).toBeOnTheScreen();
  });

  it("keeps the map visible without pins when the split list becomes empty", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    expect(view.getByRole("button", { name: "Map pin" })).toBeOnTheScreen();
    mockProjectsQuery();
    await view.rerender(<ProjectsScreen />);
    expect(view.getByText("No projects yet")).toBeOnTheScreen();
    expect(view.getByText("projects-map")).toBeOnTheScreen();
    expect(
      view.queryByRole("button", { name: "Map pin" })
    ).not.toBeOnTheScreen();
    expect(
      view.queryByRole("button", { name: "Load more projects" })
    ).not.toBeOnTheScreen();
  });

  it("keeps errors actionable in split mode", async () => {
    mockProjectsQuery({
      data: undefined,
      isError: true,
      error: new Error("private provider message")
    });
    const user = userEvent.setup();
    const view = await renderWithAppProviders(<ProjectsScreen />);
    await user.press(view.getByRole("button", { name: "Split view" }));
    expect(view.getByText("Projects unavailable")).toBeOnTheScreen();
    expect(view.queryByText("private provider message")).not.toBeOnTheScreen();
    await user.press(view.getByRole("button", { name: "Retry" }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it.each(["ios", "android"] as const)(
    "does not expose split view on %s even at expanded widths",
    async (platform) => {
      Object.defineProperty(Platform, "OS", { value: platform });
      const view = await renderWithAppProviders(<ProjectsScreen />);
      expect(
        view.queryByRole("button", { name: "Split view" })
      ).not.toBeOnTheScreen();
      expect(view.getByRole("button", { name: "List" })).toBeOnTheScreen();
      expect(view.getByRole("button", { name: "Map" })).toBeOnTheScreen();
    }
  );
});
