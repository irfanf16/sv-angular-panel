export interface IServerResponse {
  items: string[];
  total: number;
}
export interface FeatureTypeRows {
  [index: string]: string[];
}

export interface CompanyUserRequestBody {
  limit: number;
  fields: string[];
  search?: string; // Optional property
}

export interface CategoryFeature {
  id?: number,
  title: string,
  category_id: number,
  category_features_list: categoryFeaturesList [],
  feature_list?: CategoryFeatureEdit[]
}

export interface categoryFeaturesList{
  id?: number,
  feature_title: string,
  plan: string[],
  planInputs?: {[keyof : string]: string}
}

export interface CategoryFeatureEdit{
  id: number,
  category_feature_id: number,
  category_id: number,
  feature_title: string,
  plan: string[],
  plan_value?: {[keyof : string]: string},
  created_at: string,
  updated_at: string,
  deleted_at: null
}
