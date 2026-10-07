export type OrganizationRole = "admin" | "member";

export interface WorkspaceSummary {
  avatar: string | null;
  display_avatar: string | null;
  display_name: string;
  id: string;
  name: string | null;
  organization_avatar: string | null;
  organization_id: string;
  organization_name: string;
  owner_user_id: string;
  role_code: OrganizationRole;
}

export interface WorkspacePage {
  has_more: boolean;
  items: WorkspaceSummary[];
  next_offset: number | null;
}

export interface CreateOrganizationInput {
  avatar?: string | null;
  name: string;
}

export interface UpdateOrganizationInput {
  avatar: string | null;
  name: string;
}

export interface CreateOrganizationResult {
  organization: {
    avatar: string | null;
    id: string;
    name: string;
    owner_user_id: string;
  };
  workspace: {
    avatar: string | null;
    id: string;
    name: string | null;
    organization_id: string;
  };
}
