export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  avatar: string | null;
  email: string | null;
  phone_number: string | null;
  created_at: Date;
  updated_at: Date | null;
}
