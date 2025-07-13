export interface Worker {
  id: string;
  user_id: string;
  contractor_id: string;
  first_name: string;
  last_name: string | null;
  avatar: string | null;
  phone_number: string | null;
  email: string | null;
  created_at: Date;
  updated_at: Date | null;
}
