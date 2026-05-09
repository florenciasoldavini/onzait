export enum PaymentType {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  ONE_TIME = "one_time"
}
export interface WorkerContract {
  id: string;
  worker_id: string;
  project_id: string;
  payment_type: PaymentType;
  rate: number;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
