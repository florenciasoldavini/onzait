export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  phone_number: string | null;
  address: string | null;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  opening_hours: string[];
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
}
