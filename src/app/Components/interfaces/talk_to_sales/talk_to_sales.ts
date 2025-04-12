export interface TalkToSale {
  id: number;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
  number_of_employees?: number | null;
  status: string;
  email_sent: number;
  last_email_time?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

