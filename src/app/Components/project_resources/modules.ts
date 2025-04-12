export const moduleIds = {
  company_management: "company_management",
  plan_packages: "plan_packages",
  products: "products",
  features: "features",
  addons: "addons",
  plans: "plans",
  coupons: "coupons",
  settings: "settings",
  closed_accounts: "closed_accounts",
  configurations: "configurations",
  emails: "emails",
  permissions: "permissions",
  talk_to_sales: "talk_to_sales",
  account_management: "account_management",
  users: "users",
  security: "security"
};
export const modules: {title: string, id: string, url?: string,icon?: string, children?: {title: string, id: string,url?: string, icon?: string }[]}[]   = [
  { title: "Company Management", id: moduleIds.company_management , url: "/company-management", icon: "management"},
  {
    title: "Plan & Packages",
    id: moduleIds.plan_packages,
    icon: "plan_&_package",
    children: [
      { title: "Products", id: moduleIds.products, url: "/categories",icon: "products" },
      { title: "Features", id: moduleIds.features, url:"/features",icon: "features" },
      { title: "Add-ons", id: moduleIds.addons, url: "/add-ons", icon: "addons" },
      { title: "Plans", id: moduleIds.plans, url: "/plans-packages", icon: "plans"  },
      { title: "Coupons", id: moduleIds.coupons, url: "/coupons", icon: "coupons" }
    ]
  },
  {
    title: "Settings",
    id: moduleIds.settings,
    icon: "settings",
    children: [
      { title: "Closed Accounts", id: moduleIds.closed_accounts, url: "/closed-accounts", icon: "closed_acccounts" },
      { title: "Configurations", id: moduleIds.configurations, url: "/configurations", icon: "configuration" },
      { title: "Emails", id: moduleIds.emails,url: "/emails",icon: "email" },
      { title: "Calendar", id: moduleIds.account_management, url: "/calendar", icon: "calendar" }
    ]
  },
  {
    title: 'Security',
    id: moduleIds.security,
    icon: "",
    children: [
      { title: "Users", id: moduleIds.users, url: "/users",icon: "" },
      { title: "Roles & Permissions", id: moduleIds.permissions, url: "/permissions" , icon: "role_&_permissions"},
      { title: "Account Management", id: moduleIds.account_management, url: "/account-management", icon: "account_management" },

    ]
  },
  { title: "Talk to Sales", id: moduleIds.talk_to_sales, url: "/talk-to-sales", icon: "information" },


];

