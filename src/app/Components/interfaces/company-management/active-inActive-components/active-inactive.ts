export interface InvoiceItem {
  id: string;
  object: string;
  amount: number;
  amount_excluding_tax: number;
  currency: string;
  description: string;
  discount_amounts: any[];
  discountable: boolean;
  discounts: any[];
  invoice: string;
  livemode: boolean;
  metadata: {
    trial_users: string;
    minimum_users: string;
    type: string;
    trial: string;
    price_id: string;
    public: string;
    is_popular: string;
    base_price: string;
    category: string;
    proration: string;
    module_features_list: string;
    plan_id: string;
    modules: string;
    company_id: string;
  };
  period: {
    start: number;
    end: number;
  };
  plan: {
    id: string;
    object: string;
    active: boolean;
    aggregate_usage: string | null;
    amount: number;
    amount_decimal: string;
    billing_scheme: string;
    created: number;
    currency: string;
    interval: string;
    interval_count: number;
    livemode: boolean;
    metadata: {
      month_discount: string;
    };
    meter: string | null;
    nickname: string;
    product: string;
    tiers_mode: string | null;
    transform_usage: string | null;
    trial_period_days: number | null;
    usage_type: string;
  };
  price: {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: number | null;
    livemode: boolean;
    lookup_key: string | null;
    metadata: {
      month_discount: string;
    };
    nickname: string;
    product: string;
    recurring: {
      aggregate_usage: string | null;
      interval: string;
      interval_count: number;
      meter: string | null;
      trial_period_days: number | null;
      usage_type: string;
    };
    tax_behavior: string;
    tiers_mode: string | null;
    transform_quantity: string | null;
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
  };
  proration: boolean;
  proration_details: {
    credited_items: string | null;
  };
  quantity: number;
  subscription: string;
  subscription_item: string;
  tax_amounts: any[];
  tax_rates: any[];
  type: string;
  unit_amount_excluding_tax: string;
}

export interface Invoice {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  account_tax_ids: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  application: string | null;
  application_fee_amount: string | null;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  automatic_tax: {
    enabled: boolean;
    liability: string | null;
    status: string | null;
  };
  automatically_finalizes_at: string | null;
  billing_reason: string;
  charge: string | null;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: string | null;
  customer: string;
  customer_address: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_shipping: string | null;
  customer_tax_exempt: string;
  customer_tax_ids: any[];
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discount: string | null;
  discounts: any[];
  due_date: number;
  effective_at: number;
  ending_balance: number;
  footer: string | null;
  from_invoice: string | null;
  hosted_invoice_url: string;
  invoice_pdf: string;
  issuer: {
    type: string;
  };
  last_finalization_error: string | null;
  latest_revision: string | null;
  lines: {
    object: string;
    data: InvoiceItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  livemode: boolean;
  metadata: any[];
  next_payment_attempt: string | null;
  number: string;
  on_behalf_of: string | null;
  paid: boolean;
  paid_out_of_band: boolean;
  payment_intent: string | null;
  payment_settings: {
    default_mandate: string | null;
    payment_method_options: string | null;
    payment_method_types: string | null;
  };
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote: string | null;
  receipt_number: string | null;
  rendering: string | null;
  rendering_options: string | null;
  shipping_cost: string | null;
  shipping_details: string | null;
  starting_balance: number;
  statement_descriptor: string | null;
  status: string;
  status_transitions: {
    finalized_at: number;
    marked_uncollectible_at: string | null;
    paid_at: number;
    voided_at: string | null;
  };
  subscription: string;
  subscription_details: {
    metadata: {
      trial_users: string;
      minimum_users: string;
      type: string;
      trial: string;
      price_id: string;
      public: string;
      is_popular: string;
      base_price: string;
      category: string;
      proration: string;
      module_features_list: string;
      plan_id: string;
      modules: string;
      company_id: string;
    };
  };
  subtotal: number;
  subtotal_excluding_tax: number;
  tax: string | null;
  test_clock: string | null;
  total: number;
  total_discount_amounts: any[];
  total_excluding_tax: number;
  total_tax_amounts: any[];
  transfer_data: string | null;
  webhooks_delivered_at: string | null;
}

export interface invoiceSubscription {
  id: number;
  invoice_id: string;
  stripe_customer_id: string;
  subscription_id: string;
  status: string;
  invoice: Invoice;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface TimeStampsAmount {
  amount_paid: number;
  amount_due: number;
  paid_at?: number | null;
}

export interface companySubscription {
  id: string;
  object: string;
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    enabled: boolean;
    liability: string | null;
  };
  billing_cycle_anchor: number;
  billing_cycle_anchor_config: string | null;
  billing_thresholds: string | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  collection_method: string;
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: Array<any>; // Replace with appropriate type if known
  description: string | null;
  discount: string | null; // Replace with appropriate type if known
  discounts: Array<any>; // Replace with appropriate type if known
  ended_at: number | null;
  invoice_settings: {
    account_tax_ids: string | null;
    issuer: {
      type: string;
    };
  };
  items: {
    object: string;
    data: SubscriptionItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice: string;
  livemode: boolean;
  metadata: {
    addons: string;
    base_price: string;
    category: string;
    company_id: string;
    is_popular: string;
    minimum_users: string;
    module_features_list: string;
    modules: string;
    plan_id: string;
    price_id: string;
    proration: string;
    public: string;
    trial: string;
    trial_users: string;
    type: string;
  };
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: {
    behavior: string;
    resumes_at: number | null;
  };
  payment_settings: {
    payment_method_options: string | null;
    payment_method_types: string | null;
    save_default_payment_method: string;
  };
  pending_invoice_item_interval: string | null;
  pending_setup_intent: string | null;
  pending_update: string | null;
  plan: string | null; // Replace with appropriate type if known
  quantity: number | null;
  schedule: string | null; // Replace with appropriate type if known
  start_date: number;
  status: string;
  test_clock: string | null;
  transfer_data: string | null; // Replace with appropriate type if known
  trial_end: number | null;
  trial_settings: {
    end_behavior: {
      missing_payment_method: string;
    };
  };
  trial_start: number | null;
}

interface SubscriptionItem {
  id: string;
  object: string;
  billing_thresholds: string | null;
  created: number;
  discounts: Array<any>; // Replace with appropriate type if known
  metadata: Array<any>; // Replace with appropriate type if known
  plan: Plan;
  price: Price;
  quantity: number;
  subscription: string;
  tax_rates: Array<any>; // Replace with appropriate type if known
}

interface Plan {
  id: string;
  object: string;
  active: boolean;
  aggregate_usage: string | null;
  amount: number;
  amount_decimal: string;
  billing_scheme: string;
  created: number;
  currency: string;
  interval: string;
  interval_count: number;
  livemode: boolean;
  metadata: {
    month_discount: string;
  };
  meter: string | null;
  nickname: string | null;
  product: string;
  tiers_mode: string | null;
  transform_usage: string | null;
  trial_period_days: number | null;
  usage_type: string;
}

interface Price {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: string | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Array<any>; // Replace with appropriate type if known
  nickname: string | null;
  product: string;
  recurring: {
    aggregate_usage: string | null;
    interval: string;
    interval_count: number;
    meter: string | null;
    trial_period_days: number | null;
    usage_type: string;
  };
  tax_behavior: string;
  tiers_mode: string | null;
  transform_quantity: string | null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}



