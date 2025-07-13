export interface Todo {
  id: string;
  user_id: string;
  name: string;
  is_done: boolean;
  created_at: Date;
  updated_at: Date | null;
}
