import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CompanyManagementComponent} from "./company-management/company-management.component";
import {LoginComponent} from "./auth/login/login.component";
import {loginResolver} from "./services/login.resolver";
import {AuthGuard} from "./guards/authorize.guard";
import {PlansListingComponent} from "./plan_and_packages/plans-listing/plans-listing.component";
import {FeaturesComponent} from "./plan_and_packages/features/features.component";
import {AddOnsComponent} from "./plan_and_packages/add-ons/add-ons.component";
import {CategoriesComponent} from "./plan_and_packages/categories/categories.component";
import {ConfigurationComponent} from "./settings/configuration/configuration.component";
import {EmailsComponent} from "./settings/emails/emails.component";
import {CouponComponent} from "./plan_and_packages/coupon/coupon.component";
import {TalkToSalesComponent} from "./Components/talk-to-sales/talk-to-sales.component";
import {ClosedAccountsComponent} from "./settings/closed-accounts/closed-accounts.component";
import {AccountManagementComponent} from "./management/account-management/account-management.component";
import {PermissionsComponent} from "./settings/permissions/permissions.component";
import {moduleIds} from "./Components/project_resources/modules";
import {permissionResolver} from "./services/resolvers/permission.resolver";
import {NotAllowedComponent} from "./settings/not-allowed/not-allowed.component";
import {UsersComponent} from "./users/users.component";
import {CalendarComponent} from "./settings/calendar/calendar.component";

const routes: Routes = [
  {
    component:CompanyManagementComponent,
    path: 'company-management',
    canActivate:[AuthGuard]
  },
  {
    component:PlansListingComponent,
    path: 'plans-packages',
    canActivate:[AuthGuard]
  },
  {
    component:FeaturesComponent,
    path: 'features',
    canActivate:[AuthGuard]
  },
  {
    component:AddOnsComponent,
    path: 'add-ons',
    canActivate:[AuthGuard]
  },
  {
    component:CouponComponent,
    path: 'coupons',
    canActivate:[AuthGuard]
  },
  {
    component:CategoriesComponent,
    path: 'categories',
    canActivate:[AuthGuard]
  },
  {
    component:ClosedAccountsComponent,
    path: 'closed-accounts',
    canActivate:[AuthGuard]
  },
  {
    component:ConfigurationComponent,
    path: 'configurations',
    canActivate:[AuthGuard]
  },
  {
    component:CalendarComponent,
    path: 'calendar',
    canActivate:[AuthGuard]
  },
  {
    component:EmailsComponent,
    path: 'emails',
    canActivate:[AuthGuard]
  },
  {
    component:TalkToSalesComponent,
    path: 'talk-to-sales',
    canActivate:[AuthGuard]
  },
  {
    component:AccountManagementComponent,
    path: 'account-management',
    canActivate:[AuthGuard]
  },
  {
    component:UsersComponent,
    path: 'users',
    canActivate:[AuthGuard]
  },
  {
    component:NotAllowedComponent,
    path: 'not-allowed',
    canActivate:[AuthGuard]
  },
  {
    component:PermissionsComponent,
    path: 'permissions',
    canActivate:[AuthGuard],
    data: {
      id:moduleIds.permissions
    },
    resolve: {
      permissionResolver: permissionResolver
    },
  },

  {
    component:LoginComponent,
    path: '',
    resolve: {
      loginResolver: loginResolver
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
