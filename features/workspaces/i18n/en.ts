export default {
  avatar: {
    accessibilityLabel: "Choose organization avatar",
    creationWarning:
      "The organization was created, but its avatar couldn't be uploaded. You can add it later under General settings.",
    denied:
      "Photo access is disabled. Enable it in your device settings, then try again.",
    error: "We couldn't open your photos. Try again.",
    hint: "Optional · JPG, PNG or WebP up to 5 MB",
    label: "Organization avatar",
    permission: "Allow photo access to choose an organization avatar.",
    previewLabel: "Organization avatar preview"
  },
  invitations: {
    accept: "Join organization",
    decline: "Decline",
    incomplete: "Open the complete link from your invitation.",
    invalid: "This invitation is invalid or no longer available.",
    invalidStatus: "This invitation is {{status}}.",
    invitedBy: "{{inviter}} invited you.",
    joinTitle: "Join {{organization}}",
    loadError: "We couldn't check your invitations. Try again.",
    respondError: "We couldn't respond to this invitation. Try again.",
    role: "Organization role: {{role}}",
    title: "Organization invitations",
    unavailable: "Invitation unavailable"
  },
  invitationStatuses: {
    accepted: "already accepted",
    declined: "declined",
    expired: "expired",
    pending: "pending",
    revoked: "revoked"
  },
  members: {
    alreadyMember: "This person is already an organization member.",
    changeRole: "Change {{name}}'s role",
    closeInvite: "Close invite member dialog",
    current: "Members",
    email: "Email address",
    emailInvalid: "Enter a valid email address.",
    emailRequired: "Enter an email address.",
    emailTooLong: "The email address is too long.",
    invite: "Send invitation",
    inviteAction: "Invite member",
    inviteDescription:
      "They'll receive an invitation to join this organization and access its workspaces.",
    inviteError: "We couldn't create this organization invitation.",
    inviteTitle: "Invite a colleague",
    joined: "Joined",
    loadError: "We couldn't load organization members.",
    loadMore: "Load more",
    name: "Name",
    noMembers: "There are no organization members yet.",
    noSearchResults: "No members or invitations match your search.",
    remove: "Remove",
    removeDescription:
      "{{name}} will immediately lose access to this organization's workspaces and owned data.",
    removeError: "We couldn't remove this organization member. Try again.",
    removeLabel: "Remove {{name}}",
    removeTitle: "Remove organization member?",
    role: "Organization role",
    roleError: "We couldn't change this member's role. Try again.",
    roleShort: "Role",
    search: "Search members",
    summary: "{{active}} active · {{pending}} pending",
    title: "Organization members",
    unavailable: "Members unavailable",
    you: "You"
  },
  pendingInvitations: {
    description: "Invitations that have not yet been accepted.",
    details: "{{role}} · Expires {{date}}",
    empty: "There are no pending invitations.",
    expires: "Expires {{date}}",
    invitedBy: "Invited by {{name}}",
    loadError: "We couldn't load pending invitations. Try again.",
    loadMore: "Load more invitations",
    pending: "Pending",
    revoke: "Revoke",
    revokeDescription:
      "{{email}} will no longer be able to join this organization with the current invitation.",
    revokeError: "We couldn't revoke this invitation. Try again.",
    revokeLabel: "Revoke invitation for {{email}}",
    revokeTitle: "Revoke invitation?",
    sentLabel: "Invitation sent",
    title: "Pending invitations",
    unavailable: "Invitations unavailable"
  },
  roles: {
    admin: "Admin",
    member: "Member",
    owner: "Owner"
  },
  settings: {
    description: "Manage your organization details and access.",
    general: "General",
    generalDescription: "Organization name and avatar",
    generalTitle: "Organization information",
    members: "Members",
    membersDescription: "Invitations, members and roles",
    save: "Save organization",
    saved: "Organization updated.",
    saveError: "We couldn't update the organization. Try again.",
    title: "Organization settings"
  },
  setup: {
    additionalDescription:
      "Create a separate organization with its own workspace, projects, and directory.",
    additionalSubmit: "Create organization",
    additionalTitle: "Create a new organization",
    description:
      "Create the practice or company that will own your projects, directory, and tasks. You can invite your colleagues afterward.",
    error: "We could not create your practice or company. Try again.",
    finish: "Finish setup",
    invitationSent: "Invitation sent to {{email}}.",
    inviteDescription:
      "Invite colleagues to {{organization}} now, or skip this step and add them later from organization settings.",
    inviteTitle: "Invite your team",
    nameLabel: "Practice or company name",
    namePlaceholder: "Studio North",
    next: "Continue",
    skip: "Skip for now",
    step: "Step {{current}} of {{total}}",
    submit: "Create workspace",
    title: "Set up your practice or company",
    validation: {
      nameRequired: "Enter a practice or company name.",
      nameTooLong: "The practice or company name is too long.",
      nameTooShort: "The practice or company name is too short."
    }
  },
  switcher: {
    accessibilityLabel: "Current workspace",
    createOrganization: "Create new organization",
    label: "Workspace",
    manageDescription: "Name, avatar & members",
    organizationSettings: "Organization settings",
    projectCount_one: "{{count}} project",
    projectCount_many: "{{count}} projects",
    projectCount_other: "{{count}} projects",
    projectCountError: "Count unavailable · Reopen to retry",
    projectCountLoading: "Loading projects…",
    sharedWithMe: "Shared with me",
    yourWorkspaces: "Your workspaces"
  }
} as const;
