import { __decorate } from "tslib";
import { Component } from '@angular/core';
let BreadcrumbComponent = class BreadcrumbComponent {
    constructor(breadcrumbService, cdr) {
        this.breadcrumbService = breadcrumbService;
        this.cdr = cdr;
        this.breadcrumbs = [];
        this.componentName = '';
        this.componentIcon = '';
        this.componentIconFlag = true;
    }
    ngOnInit() {
        this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
            this.breadcrumbs = breadcrumbs;
            this.cdr.detectChanges();
        });
        this.breadcrumbService.componentName$.subscribe(componentName => {
            this.componentName = componentName;
            this.cdr.detectChanges();
        });
        this.breadcrumbService.componentIcon$.subscribe(componentIcon => {
            this.componentIcon = componentIcon;
            this.cdr.detectChanges();
        });
    }
};
BreadcrumbComponent = __decorate([
    Component({
        selector: 'app-breadcrumb',
        templateUrl: './breadcrumb.component.html',
        styleUrls: ['./breadcrumb.component.css']
    })
], BreadcrumbComponent);
export { BreadcrumbComponent };
//# sourceMappingURL=breadcrumb.component.js.map