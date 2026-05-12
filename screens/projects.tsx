import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  Screen,
  Section
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { FolderPlus, HardHat, MapPinned } from "lucide-react-native";
import { View } from "react-native";

const projectSnapshots = [
  {
    location: "North Block / Rosario",
    name: "Foundation Package",
    status: "Active / Crew On Site"
  },
  {
    location: "Client Review / Web",
    name: "Facade Punch List",
    status: "Waiting / Feedback"
  }
] as const;

export default function ProjectsScreen() {
  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">Projects / Workspace</AppText>
          <AppHeading variant="hero">Track job sites by project.</AppHeading>
          <AppText tone="muted">
            This is the new primary workspace entry for crews, clients, and
            project operations.
          </AppText>
        </View>

        <Section
          action={
            <AppButton
              fullWidth={false}
              icon={FolderPlus}
              iconAfter={false}
              size="sm"
            >
              New Project
            </AppButton>
          }
          description="Projects should become the anchor for tasks, photos, participants, materials, and client-facing updates."
          eyebrow="Overview"
          title="Current projects"
        >
          <View style={{ gap: atomSpacing[4] }}>
            {projectSnapshots.map((project) => (
              <AppCard key={project.name} padding="md">
                <View style={{ gap: atomSpacing[3] }}>
                  <View style={{ gap: atomSpacing[1] }}>
                    <AppText variant="eyebrow">{project.status}</AppText>
                    <AppHeading variant="card">{project.name}</AppHeading>
                  </View>
                  <View style={{ gap: atomSpacing[2] }}>
                    <View
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                        gap: atomSpacing[2]
                      }}
                    >
                      <MapPinned size={16} />
                      <AppText tone="muted" variant="bodySm">
                        {project.location}
                      </AppText>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                        gap: atomSpacing[2]
                      }}
                    >
                      <HardHat size={16} />
                      <AppText tone="muted" variant="bodySm">
                        Ready for crew, schedule, and field updates.
                      </AppText>
                    </View>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        </Section>
      </View>
    </Screen>
  );
}
