import { __decorate } from "tslib";
import { APP_INITIALIZER, forwardRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompanyManagementComponent } from './company-management/company-management.component';
import { OverviewComponent } from './company-management/overview/overview.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { authFactory, AuthService } from "./services/auth.service";
import { AccountStatusPartialComponent } from './account-status-partial-component/account-status-partial-component';
import { SvgIconComponentComponent } from './svg-icon-component/svg-icon-component.component';
import { DatePipe, NgOptimizedImage } from "@angular/common";
import { SidebarComponent } from "./Components/UI/sidebar/sidebar.component";
import { ActiveInactiveTabsComponent } from './company-management/active-inactive-tabs/active-inactive-tabs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToggleButtonComponent } from './Components/UI/toggle-button/toggle-button.component';
import { SpinnerComponentComponent } from './Components/UI/spinner-component/spinner-component.component';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from "ngx-pagination";
import { ToastMessagesComponent } from './Components/messages/toast-messages/toast-messages.component';
import { PlansListingComponent } from './plan_and_packages/plans-listing/plans-listing.component';
import { FeaturesComponent } from './plan_and_packages/features/features.component';
import { BreadcrumbComponent } from './Components/breadcrumb/breadcrumb.component';
import { AddOnsComponent } from './plan_and_packages/add-ons/add-ons.component';
import { CategoriesComponent } from './plan_and_packages/categories/categories.component';
import { FallbackImgDirective } from "./Components/directives/fallback-img.directive";
import { SubModulesRecursiveComponent } from './plan_and_packages/plans-listing/sub-modules-recursive/sub-modules-recursive.component';
import { LimitTextDirective } from "./Components/directives/limit-text-directive.directive";
import { EditorModule } from "@tinymce/tinymce-angular";
import { EmailsComponent } from "./settings/emails/emails.component";
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ConfigurationComponent } from "./settings/configuration/configuration.component";
import { NgxCountriesDropdownModule } from "ngx-countries-dropdown";
import { CouponComponent } from "./plan_and_packages/coupon/coupon.component";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { SearchAbleDropdownComponent } from "./Components/UI/search-able-dropdown/search-able-dropdown.component";
// import {OwlMomentDateTimeModule} from "@danielmoncada/angular-datetime-picker-moment-adapter";
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [
            AppComponent,
            FallbackImgDirective,
            CompanyManagementComponent,
            OverviewComponent,
            AuthComponent,
            LoginComponent,
            AccountStatusPartialComponent,
            SvgIconComponentComponent,
            SidebarComponent,
            ActiveInactiveTabsComponent,
            ToggleButtonComponent,
            SpinnerComponentComponent,
            ToastMessagesComponent,
            PlansListingComponent,
            FeaturesComponent,
            BreadcrumbComponent,
            AddOnsComponent,
            CategoriesComponent,
            SubModulesRecursiveComponent,
            LimitTextDirective,
            EmailsComponent,
            ConfigurationComponent,
            CouponComponent,
            SearchAbleDropdownComponent
        ],
        imports: [
            BrowserModule,
            AppRoutingModule,
            NgbModule,
            FormsModule,
            HttpClientModule,
            NgOptimizedImage,
            BrowserAnimationsModule,
            ReactiveFormsModule,
            CommonModule,
            NgxPaginationModule,
            EditorModule,
            CKEditorModule,
            NgxCountriesDropdownModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule
        ],
        providers: [
            {
                provide: APP_INITIALIZER,
                useFactory: authFactory,
                multi: true,
                deps: [AuthService],
            },
            {
                provide: ToastMessagesComponent
            },
            {
                provide: DatePipe
            },
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => SearchAbleDropdownComponent),
                multi: true
            }
            // { provide: LocationStrategy, useClass: HashLocationStrategy }
        ],
        exports: [
            SpinnerComponentComponent
        ],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map