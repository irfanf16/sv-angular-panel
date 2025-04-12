export interface Permission {
  id: number;
  name: string;
  description: string;
  group: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  subPermissions: SubPermission[];
}

export interface SubPermission {
  id: number;
  name: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: number;
  name: string;
  role_type?:{id: number, role_id: number, role_type: number},
  permissions: Permission[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

export interface Module {
  title: string;
  id: string;
  children?: Module[];
}

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionsModel {
  [key: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;  // Using string to represent the ISO date format
  updated_at: string;  // Using string to represent the ISO date format
}

export interface Modules {
  [key: string]: Permission | Modules; // Index signature allows string keys with either Permission or nested Modules
}


