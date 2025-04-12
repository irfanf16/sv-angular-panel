export interface Price {
  id: string;
  // Add other price properties as needed
}
export interface CompanyDetails {
  id: number;
  title: string;
  emp_code_format: string;
  company_initial: string;
  no_of_employee: number;
  super_admin_id: number;
  logo: string | null;
  screen_capture_duration: number;
  screen_capture_image_size: string | null;
  timezone: string | null;
  status: number;
  instance_id: number;
  created_at: string;
  updated_at: string;
  plan_staus: string;
  plan_expiry: string;
  subscription_id: string;
  plan_id: string;
  formation_type: string;
  has_setup: number;
  price_id: string;
  payment_status: string | null;
  grace_period: string | null;
  plan_old_status: string | null;
  grace_period_start_date: string | null;
  company_admin_emails: string | null;
  data_deletion: number;
  grace_period_start: string | null;
  closure_plan: number;
  grace_period_name: string | null;
}

export interface Module {
  "children"?: Module[],
  "id": number,
  "title": string,
  "description": string,
  "url": string,
  "icon": string,
  "parent_module_id": number,
  "module_order": number,
  "module_type": number,
  "deleted_at": string,
  "created_at": string,
  "updated_at": string,
  "rules": {
    "info": [
      {
        "key": string,
        "title": string,
        "values": string
      }
    ],
    "implementation": [
      {
        "key": string,
        "title": string,
        "values": string[]
      }
    ]
  }
}

export interface Category {
  id: number,
  title: string,
  description: string,
  published:number,
  proration: number,
  price_type: string,
  discount_type: string,
  frequency: string[],
  created_at: string,
  updated_at: string,
  deleted_at: string | null
}

export interface Feature {
  id: number,
  module_features_id: number,
  type: number,
  rule: string | null,
  feature_key: string,
  feature_value: string,
  feature_label: string,
  status: string,
  content: string,
  image: string,
  parent_module_id: string,
  sub_module_id: string,
  created_at: string,
  updated_at: string
}

export interface Tiere {
  flat_amount: number,
  up_to: number | string
}
export interface tieredPriceObject {
  id?:string,
  nickname: string,
  currency: string,
  unit_amount: string
  recurring: string,
  active: string | boolean,
  billing_scheme: string,
  tiers: Tiere[],
  tiers_mode: string,
  metadata: Metadata
}
export interface CategoryPlan {

  category_id: number;
  is_popular?: number;
  plan_id?: number;

  // add other properties as needed

}
export interface PrincePerUnitOrOneTimeObject {
  id?:string,
  nickname: string,
  "currency": string,
  "unit_amount": string,
  "active": string | boolean,
  "billing_scheme": string,
  "metadata": object,
  recurring?: string
}
export interface IServerResponse {
  items: string[];
  total: number;
}

export interface Metadata {
  type: string,
  public: number,
  base_price: string, // required if type = plans,
  trial: string,
  trial_period_days: number,
  trial_value: string | number,
  trial_users: number,
  category: number,
  proration: number,
  minimum_users?: number | null,
  maximum_users?: number | null
}

export interface Metadata {
  [key: string]: any;
}

export interface Body{
  stripe_id ?: string,
  image?: string,
  name: string,
  active: boolean, // boolean
  description: string,
  metadata: Metadata,
  addons: string[],
  module_features_list: any[],
  modules: any[],
  features: any[],
  prices: any[]
}
