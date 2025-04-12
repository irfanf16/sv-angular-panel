import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { NavigationEnd } from "@angular/router";
import { BehaviorSubject, distinctUntilChanged, filter, map } from "rxjs";
let BreadcrumbService = class BreadcrumbService {
    constructor(router, activatedRoute) {
        this.router = router;
        this.activatedRoute = activatedRoute;
        this.breadcrumbsSubject = new BehaviorSubject([]);
        this.breadcrumbs$ = this.breadcrumbsSubject.asObservable();
        this.componentNameSubject = new BehaviorSubject('');
        this.componentName$ = this.componentNameSubject.asObservable();
        this.componentIconSubject = new BehaviorSubject('');
        this.componentIcon$ = this.componentIconSubject.asObservable();
        this.router.events.pipe(filter(event => event instanceof NavigationEnd), distinctUntilChanged(), map(() => this.buildBreadCrumb(this.activatedRoute.root))).subscribe(breadcrumbs => {
            this.breadcrumbsSubject.next(breadcrumbs);
        });
    }
    setBreadcrumbs(breadcrumbs) {
        this.breadcrumbsSubject.next(breadcrumbs);
    }
    setComponentName(componentName) {
        this.componentNameSubject.next(componentName);
    }
    setComponentIcon(componentIcon) {
        this.componentIconSubject.next(componentIcon);
    }
    buildBreadCrumb(route, url = '', breadcrumbs = []) {
        const label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data['breadcrumb'] : 'Home';
        const path = route.routeConfig ? route.routeConfig.path : '';
        const nextUrl = `${url}${path}/`;
        const newBreadcrumbs = [...breadcrumbs, { label: label, url: nextUrl }];
        if (route.firstChild) {
            return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
        }
        return newBreadcrumbs;
    }
};
BreadcrumbService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], BreadcrumbService);
export { BreadcrumbService };
//# sourceMappingURL=breadcrumb.service.js.map