export interface User {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  avatar: string | null;
  email: string;
  phone_number: string | null;
  role: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
