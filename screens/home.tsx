import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  Screen,
  Section,
  TextAreaField,
  TextField
} from "@/components/atoms";
import { atomPalette, atomSpacing } from "@/components/atoms/theme";
import {
  ArrowRightIcon,
  AtSignIcon,
  BellIcon,
  LockIcon,
  PlusIcon,
  TrashIcon
} from "@/components/icons";
import { useState } from "react";
import { View } from "react-native";

const buttonVariants = [
  {
    icon: ArrowRightIcon,
    label: "Primary",
    variant: "primary"
  },
  {
    icon: PlusIcon,
    label: "Secondary",
    variant: "secondary"
  },
  {
    icon: BellIcon,
    label: "Ghost",
    variant: "ghost"
  },
  {
    icon: TrashIcon,
    label: "Destructive",
    variant: "destructive"
  }
] as const;

export default function HomeScreen() {
  const [email, setEmail] = useState("architect@onzait.com");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState(
    "Use this preview to validate spacing, hierarchy, controls, and field behavior before applying atoms across product screens."
  );

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">Onzait / Components Preview</AppText>
          <AppHeading variant="hero">
            Step 4 starts here: the atom layer now has a live preview surface.
          </AppHeading>
          <AppText tone="muted">
            This tab replaces the old design-system moodboard with real,
            reusable UI atoms wired to the shared token system.
          </AppText>
        </View>

        <Section
          description="Core reading styles should feel structured, technical, and consistent across auth, dashboards, and detail views."
          eyebrow="Typography"
          title="Text and heading hierarchy"
        >
          <View style={{ gap: atomSpacing[4] }}>
            <AppText variant="eyebrow">Eyebrow / Structural Meta</AppText>
            <AppHeading variant="title">
              Title scale for major sections
            </AppHeading>
            <AppHeading variant="section">
              Section heading for cards and modules
            </AppHeading>
            <AppText>
              Body text carries the default reading rhythm. It should stay calm,
              roomy, and legible across mobile and web.
            </AppText>
            <AppText tone="muted" variant="bodySm">
              Smaller supporting copy handles helper text, supporting notes, and
              lower-emphasis explanations.
            </AppText>
            <AppText tone="accent" variant="meta">
              Meta / Accent / Token-aware
            </AppText>
          </View>
        </Section>

        <Section
          description="Buttons are normalized around the shared control heights, radius, and semantic action colors."
          eyebrow="Actions"
          title="Button variants"
        >
          <View style={{ gap: atomSpacing[4] }}>
            {buttonVariants.map((button) => (
              <AppButton
                icon={button.icon}
                key={button.label}
                variant={button.variant}
              >
                {button.label}
              </AppButton>
            ))}
          </View>
        </Section>

        <Section
          description="Inputs, labels, helper states, and error states now share a common language instead of each screen restyling them."
          eyebrow="Fields"
          title="Form controls"
        >
          <View style={{ gap: atomSpacing[4] }}>
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email Address"
              leftIcon={AtSignIcon}
              onChangeText={setEmail}
              placeholder="architect@onzait.com"
              type="text"
              value={email}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="password"
              helperText="This preview keeps the field live so we can check spacing and placeholder behavior."
              label="Password"
              leftIcon={LockIcon}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              type="password"
              value={password}
            />
            <TextAreaField
              helperText="Textarea is ready for notes, descriptions, and longer authored content."
              label="Site Notes"
              onChangeText={setNote}
              placeholder="Add a field note for the crew..."
              value={note}
            />
          </View>
        </Section>

        <Section
          description="Cards and sections are the main surface primitives for grouping information without introducing screen-specific wrappers too early."
          eyebrow="Surfaces"
          title="Card language"
        >
          <View style={{ gap: atomSpacing[4] }}>
            <AppCard padding="md">
              <View style={{ gap: atomSpacing[2] }}>
                <AppText variant="eyebrow">Default Surface</AppText>
                <AppHeading variant="card">Operational summary</AppHeading>
                <AppText tone="muted">
                  Use this for standard panels, summaries, and content blocks.
                </AppText>
              </View>
            </AppCard>

            <AppCard padding="md" tone="muted">
              <View style={{ gap: atomSpacing[2] }}>
                <AppText variant="eyebrow">Muted Surface</AppText>
                <AppHeading variant="card">
                  Secondary or contextual content
                </AppHeading>
                <AppText tone="muted">
                  This is useful for supporting information and lower-emphasis
                  groupings.
                </AppText>
              </View>
            </AppCard>

            <AppCard
              padding="md"
              tone="inverse"
              style={{ borderColor: atomPalette.text }}
            >
              <View style={{ gap: atomSpacing[2] }}>
                <AppText tone="inverse" variant="eyebrow">
                  Inverse Surface
                </AppText>
                <AppHeading tone="inverse" variant="card">
                  Contrast-ready panel
                </AppHeading>
                <AppText tone="inverse">
                  This helps test strong hierarchy moments without drifting away
                  from the shared type scale.
                </AppText>
              </View>
            </AppCard>
          </View>
        </Section>
      </View>
    </Screen>
  );
}
