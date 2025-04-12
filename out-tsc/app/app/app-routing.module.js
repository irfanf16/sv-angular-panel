import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompanyManagementComponent } from "./company-management/company-management.component";
import { LoginComponent } from "./auth/login/login.component";
import { loginResolver } from "./services/login.resolver";
import { AuthGuard } from "./guards/authorize.guard";
import { PlansListingComponent } from "./plan_and_packages/plans-listing/plans-listing.component";
import { FeaturesComponent } from "./plan_and_packages/features/features.component";
import { AddOnsComponent } from "./plan_and_packages/add-ons/add-ons.component";
import { CategoriesComponent } from "./plan_and_packages/categories/categories.component";
import { ConfigurationComponent } from "./settings/configuration/configuration.component";
import { EmailsComponent } from "./settings/emails/emails.component";
import { CouponComponent } from "./plan_and_packages/coupon/coupon.component";
import { TalkToSalesComponent } from "./Components/talk-to-sales/talk-to-sales.component";
const routes = [
    {
        component: CompanyManagementComponent,
        path: 'company-management',
        canActivate: [AuthGuard]
    },
    {
        component: PlansListingComponent,
        path: 'plans-packages',
        canActivate: [AuthGuard]
    },
    {
        component: FeaturesComponent,
        path: 'features',
        canActivate: [AuthGuard]
    },
    {
        component: AddOnsComponent,
        path: 'add-ons',
        canActivate: [AuthGuard]
    },
    {
        component: CouponComponent,
        path: 'coupons',
        canActivate: [AuthGuard]
    },
    {
        component: CategoriesComponent,
        path: 'categories',
        canActivate: [AuthGuard]
    },
    {
        component: ConfigurationComponent,
        path: 'configurations',
        canActivate: [AuthGuard]
    },
    {
        component: EmailsComponent,
        path: 'emails',
        canActivate: [AuthGuard]
    },
    {
        component: TalkToSalesComponent,
        path: 'talk-to-sales',
        canActivate: [AuthGuard]
    },
    {
        component: LoginComponent,
        path: '',
        resolve: {
            loginResolver: loginResolver
        },
    },
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [
            RouterModule.forRoot(routes)
        ],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map