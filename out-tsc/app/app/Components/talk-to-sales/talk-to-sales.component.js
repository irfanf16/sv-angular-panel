import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { NgxPaginationModule } from "ngx-pagination";
import { TalkToSalesConfig } from "../constants/talk_to_sales/talk_to_sales";
import { HttpHeaders } from "@angular/common/http";
import { PlansConfiguration } from "../constants/plan_&_packages/plans/plans";
import { map, Observable, of } from "rxjs";
import { environment } from "../../../environments/environments";
import { catchError } from "rxjs/operators";
let TalkToSalesComponent = class TalkToSalesComponent {
    constructor(appComponent, cdr, breadcrumbService, httpClientRequest, encryptDecrypt, el) {
        this.appComponent = appComponent;
        this.cdr = cdr;
        this.breadcrumbService = breadcrumbService;
        this.httpClientRequest = httpClientRequest;
        this.encryptDecrypt = encryptDecrypt;
        this.el = el;
        this.baseURL = environment.apiBASEURL;
        this.perPage = 20;
        this.totalTalkToSales = 0;
        this.TalkToSalesCurrentPage = 1;
        this.activeTalkToSales$ = new Observable();
        this.appComponent.isLoginScreen = false;
        this.appComponent.showMenu = true;
    }
    ngOnInit() {
        this.breadcrumbService.setBreadcrumbs(TalkToSalesConfig.BREAD_CRUMBS);
        this.breadcrumbService.setComponentName(TalkToSalesConfig.COMP_NAME);
        this.breadcrumbService.setComponentIcon('assets/css/sprite_images/planPackages.svg');
        this.cdr.detectChanges();
        // this.createPlanForm.get('features')?.disable();
        this.talkToSalesListing();
    }
    talkToSalesListing() {
        let URL = this.baseURL + 'api/talk_to_sales?page=1';
        let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
        let body = {
            "limit": this.perPage,
        };
        let method = "GET";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            if (response.app_data !== undefined) {
                let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                this.activeTalkToSales$ = of(decrypted_response.data);
                this.totalTalkToSales = decrypted_response.total;
                console.log(decrypted_response);
            }
        }, (error) => {
        });
    }
    getPage(page) {
        this.serverCall(page, this.totalTalkToSales, this.perPage).subscribe({
            next: (res) => {
                this.totalTalkToSales = res.total;
                let resultData = res.items.length > 0 ? of(res.items) : of([]);
                this.TalkToSalesCurrentPage = page;
                this.activeTalkToSales$ = resultData;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching talkToSales:', error);
            }
        });
    }
    /**
     * Simulate an async HTTP call with a delayed observable.
     */
    serverCall(page, total, per_Page) {
        let URL = this.baseURL + 'api/talk_to_sales?page=1';
        let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
        let body = {
            "limit": this.perPage,
        };
        let method = "GET";
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            return {
                items: decryptedData.data,
                total: decryptedData.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            return of({ items: [], total: 0 });
        }));
    }
};
TalkToSalesComponent = __decorate([
    Component({
        selector: 'app-talk-to-sales',
        standalone: true,
        imports: [
            AsyncPipe,
            NgForOf,
            NgIf,
            NgxPaginationModule
        ],
        templateUrl: './talk-to-sales.component.html',
        styleUrl: './talk-to-sales.component.css'
    })
], TalkToSalesComponent);
export { TalkToSalesComponent };
//# sourceMappingURL=talk-to-sales.component.js.map