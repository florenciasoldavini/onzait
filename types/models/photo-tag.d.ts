export interface PhotoTag {
  id: string;
  photo_id: string;
  tag_id: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
