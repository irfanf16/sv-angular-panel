export interface IServerResponse {
  items: string[];
  total: number;
}
export interface FeaturePlans {
  feature_id: number;
  stripe_id: string;
}
export interface CompanyUserRequestBody {
  limit: number;
  fields: string[];
  search?: string; // Optional property
}

export interface Rules {
  key: string,
  title: string,
  "values": string[] | string
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

export interface Children {
  "children": Module[],
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
      },
      {
        "key": string,
        "title": string,
        "values": string[]
      },
      {
        "key": string,
        "title": string,
        "values": string
      }
    ]
  }
}

export interface moduleNode {
  id: number;
  children: moduleNode[];
}

export interface SubModule {
  [index: number]: Module[];
}
