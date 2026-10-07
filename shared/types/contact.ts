export interface PersonName {
  first_name: string;
  last_name: string | null;
}

export interface PersonContactDetails extends PersonName {
  email: string | null;
  phone_number: string | null;
}

export interface OwnedPersonContactRecord extends PersonContactDetails {
  created_at: string;
  deleted_at: string | null;
  id: string;
  created_by: string;
  updated_at: string | null;
  workspace_id: string;
}

export type PersonContactSummary = Pick<
  OwnedPersonContactRecord,
  | "created_by"
  | "email"
  | "first_name"
  | "id"
  | "last_name"
  | "phone_number"
  | "workspace_id"
>;

export interface PersonContactFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface PersonContactInput {
  email: string | null;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
}
