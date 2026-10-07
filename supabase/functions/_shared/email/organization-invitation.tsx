import * as React from "react";
import { render } from "react-email";
import { ProjectInvitationEmail } from "./project-invitation.tsx";
import { createEmailTranslator, formatEmailDate } from "./localization.ts";

export async function buildOrganizationInvitationEmail(input: {
  acceptUrl: string;
  expiresAt: string;
  inviterName: string;
  language: unknown;
  organizationName: string;
  roleCode: string;
}) {
  const { language, t } = await createEmailTranslator(input.language);
  const roleName = t(`organizationInvitation.roles.${input.roleCode}`, {
    defaultValue: input.roleCode,
  });
  const values = {
    inviterName: input.inviterName,
    organizationName: input.organizationName,
    roleName,
  };
  const strings = {
    cta: t("organizationInvitation.cta"),
    eyebrow: t("organizationInvitation.eyebrow"),
    expires: t("organizationInvitation.expires", {
      expiresAt: formatEmailDate(input.expiresAt, language),
    }),
    fallbackLink: t("common.fallbackLink"),
    footer: t("organizationInvitation.footer", values),
    heading: t("organizationInvitation.heading", values),
    paragraph: t("organizationInvitation.paragraph", values),
    preview: t("organizationInvitation.preview", values),
  };

  return {
    html: await render(
      <ProjectInvitationEmail
        acceptUrl={input.acceptUrl}
        language={language}
        strings={strings}
      />,
    ),
    text: [
      strings.heading,
      strings.paragraph,
      strings.expires,
      strings.cta,
      input.acceptUrl,
      strings.footer,
    ].join("\n\n"),
    subject: t("organizationInvitation.subject", values),
  };
}
