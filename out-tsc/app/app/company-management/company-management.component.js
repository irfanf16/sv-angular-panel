import { __decorate } from "tslib";
import { Component } from '@angular/core';
let CompanyManagementComponent = class CompanyManagementComponent {
    // Show the spinner
    constructor(appComponent) {
        this.appComponent = appComponent;
        this.appComponent.isLoginScreen = false;
        this.appComponent.showMenu = true;
    }
};
CompanyManagementComponent = __decorate([
    Component({
        selector: 'app-company-management',
        templateUrl: './company-management.component.html',
        styleUrls: ['./company-management.component.css']
    })
], CompanyManagementComponent);
export { CompanyManagementComponent };
//# sourceMappingURL=company-management.component.js.map