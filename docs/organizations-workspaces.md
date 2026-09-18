# Organizations and Workspaces

Purpose: product and engineering contract for operational ownership, workspace context, and organization membership
Source of truth for: organization ownership, workspace selection, member roles, and the boundary between inherited and direct project access
Update when: ownership, workspace behavior, organization roles, or invitation rules change
Last reviewed: 2026-09-16

## Model

- An organization is the legal/product owner of operational data. It may represent one independent professional, a studio, or a construction company.
- A workspace is a UI and data-grouping context owned by one organization. It determines which projects, tasks, clients, contractors, workers, and suppliers appear in the main application surfaces.
- Users do not belong to workspaces. Users belong to organizations and can therefore see every active workspace owned by those organizations.
- The schema supports multiple organizations per user and multiple workspaces per organization. The MVP creates one workspace whenever an organization is created, but this is a product limit rather than a schema constraint.
- `created_by` is immutable audit metadata. It does not confer ownership or access.

Every operational record stores `workspace_id`. Its owning organization is derived through `workspaces.organization_id`; a separate polymorphic owner or actor table is intentionally not used.

## Organization Roles

`organizations.owner_user_id` identifies the owner. Ownership is not an assignable organization role. The owner also has a required active `admin` membership that cannot be removed or demoted.

Assignable roles are:

- `admin`: manages organization settings, workspaces, members, directory deletion, and all workspace projects.
- `member`: reads all organization workspaces, creates projects, writes directory records, and receives manager-level access to organization-owned projects.

Role permissions are stored in database catalogs and enforced through `private.current_user_has_organization_permission`. Organization creation atomically creates the organization, the owner's admin membership, and the initial workspace.

## Project Access

Project access has two sources:

- Inherited organization access: organization owners/admins receive the project's owner capability set; organization members receive the manager capability set.
- Direct collaboration: an external user receives the capability set of their explicit `project_memberships` role.

Direct memberships are only for external collaborators. The database rejects a direct membership for a user who already inherits access from the owning organization. Creating an invitation for such a user returns `already_has_access` without sending email. If inherited access is gained before an invitation is accepted, acceptance expires the invitation with `access_already_inherited` and does not create a membership.

The global **Shared with me** surface lists only direct external project memberships. It sits outside workspace context because it contains projects owned by other organizations and does not pretend to provide their directory or task context.

## Workspace Selection

- The active workspace identifier is a device-local UI preference, not an authorization primitive.
- Every workspace-scoped repository requires an explicit workspace ID and RLS verifies organization access.
- Switching workspaces invalidates cached product queries so all tabs consistently show the new context.
- Users with no organization can still open organization invitations and directly shared projects.

## First-run and Invitation Flow

- A signed-in user with no workspace first checks pending organization and project invitations associated with the verified account email.
- Pending organization invitations take precedence because accepting one supplies the user's workspace context. If none exists, the first pending project invitation is shown directly.
- The organization creation form is shown only after both invitation checks complete successfully with no pending result. It does not link to separate invitation or shared-project inboxes.
- Public invitation links preview the invitation before authentication. Tokens stay in the URL fragment so they are not sent in ordinary HTTP requests or referrer URLs.
- Selecting **Accept** while signed out preserves an explicit acceptance intent through sign-in, signup, and email verification. Once authentication completes, the app returns to the invitation and accepts it automatically using the authenticated, verified email identity.
- Opening an invitation without selecting **Accept** never joins anything automatically.
- Token lookup does not replace identity checks: organization and project acceptance still require the authenticated email to match the invited email.
- Organization admins can review the active pending invitations they created and revoke access before an invitation is accepted. Invitation management is paginated and never exposes invitation tokens.

## Lifecycle

- Workspaces do not have an archive state.
- `deleted_at` means soft deletion: the row is unavailable to normal product reads and cannot be restored by the user.
- Archiving, if added to a feature later, must use a separate field and remain user-visible and reversible.
- Organization and workspace images use the consistent column name `avatar`. A workspace avatar/name may override its organization's presentation; otherwise the UI falls back to the organization values.
- Organization avatar rows store stable paths in the public `organization-avatars` bucket. Public reads allow the mark to render consistently in shared and unauthenticated surfaces, while organization-update permission is required for uploads, replacements, and deletion under `organizations/<organization-id>/avatar/`.

## MVP Boundaries

- The schema permits many organizations per user and many workspaces per organization.
- Product creation flows currently create one organization and one initial workspace at a time.
- Organization creation accepts an optional avatar before the optional member-invitation step. Organization settings separate general information from member management; expanded layouts use vertical tabs and compact layouts use segmented tabs.
- Organization invitations are persisted, discoverable by verified email, and delivered through the trusted email workflow described below.
- Ownership transfer and organization/workspace deletion are deferred.

## Organization invitation email delivery

- Creation and resend use the authenticated `organization-invitations` Edge Function and the existing Resend sender configuration.
- `prepare_organization_invitation_email` checks organization member-management permission before atomically reserving a send. A private ledger enforces a 60-second invitation cooldown, 50 attempts per actor, 100 per organization, and 1,000 total in a rolling 24-hour window. Reservations include failed sends; concurrent reservations are serialized.
- The legacy creation RPC remains available for compatibility, but only the Edge Function sends email. Product clients must use the email workflow.
- The invitation persists `language_code` (`es | en`), reused on resend, and delivery status independently of acceptance. Existing invitations start as `not_sent`; they are never retroactively labeled as emailed.
- Only the trusted server can mark provider acceptance. `sent` means Resend accepted the message, not confirmed inbox delivery. An interrupted request remains visibly unconfirmed and can be resent after the cooldown.
- Emails contain an organization-specific acceptance URL with the token in its fragment, plus a plain-text alternative. Resend rotates the token and extends expiry to seven days; acceptance still requires the verified invited address.
- Each send version has a distinct provider idempotency key and a ten-second provider timeout. Failed sends remain pending, with localized feedback and a resend action in organization settings.
- App success appears only after provider acceptance and delivery-state persistence. If persistence fails after provider acceptance, the user is told to check the inbox before resending.
- The same function, form feedback, and settings actions are shared by web, iOS, and Android. No native permission is required.

### Local organization invitation links

Organization invitation emails (new invitations and resends) use `http://localhost:8081/organization-invitations/accept` only when the authenticated request has the exact Origin `http://localhost:8081`. All other origins and native requests use the server-configured `SITE_URL`. Arbitrary client return URLs are ignored, and tokens remain in URL fragments. Local links must be opened on the computer running Expo; production links remain hosted. Existing emails are unchanged; resend to generate a local link.
