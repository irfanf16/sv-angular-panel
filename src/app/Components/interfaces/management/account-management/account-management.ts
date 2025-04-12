export interface CompanyDetails {
  image: string;
  id: number;
  no_of_employee: number;
  title: string;
  logo: string;
  status: number;
  created_at: string;
  plan_status: string | null;
  closure_plan: number;
  has_setup: number;
  first_name: string;
  last_name: string;
  grace_period: number;
  company_initial: string;
  payment_status: string;
  total_users: number;
  advocate?: string;
}
