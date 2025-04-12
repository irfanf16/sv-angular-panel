import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
import { PlansConfiguration } from "../../Components/constants/plan_&_packages/plans/plans";
import { map, Observable, of } from "rxjs";
import { environment } from "../../../environments/environments";
import { CategoriesConfig } from "../../Components/constants/plan_&_packages/categories/categories";
import { catchError } from "rxjs/operators";
let ConfigurationComponent = class ConfigurationComponent {
    constructor(appComponent, breadcrumbService, formBuilder, httpClientRequest, encryptDecrypt) {
        this.appComponent = appComponent;
        this.breadcrumbService = breadcrumbService;
        this.formBuilder = formBuilder;
        this.httpClientRequest = httpClientRequest;
        this.encryptDecrypt = encryptDecrypt;
        // public addConfigForm: FormGroup;
        this.total = 0;
        this.perPage = 20;
        this.p = 1;
        this.DataFound = false;
        this.DataFoundPagination = false;
        this.categories$ = new Observable();
        this.baseURL = environment.apiBASEURL;
        this.appComponent.isLoginScreen = false;
        this.appComponent.showMenu = true;
        // this.addConfigForm = this.formBuilder.group({
        //   trial_plan_grace_period: ['', Validators.required],
        //   trial_plan_grace_period_value: ['', Validators.required],
        //   active_plan_grace_period: ['', Validators.required],
        //   active_plan_grace_period_value: ['', Validators.required]
        // });
    }
    ngOnInit() {
        this.breadcrumbService.setBreadcrumbs([{
                label: 'Configurations',
                url: '/configurations'
            }]);
        this.breadcrumbService.setComponentName('Configurations');
        this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');
        this.configurationListing();
    }
    configurationListing() {
        let URL = this.baseURL + 'api/settings/configurations?page=1';
        let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
        let body = {
            "limit": this.perPage
        };
        let method = "POST";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            if (response.app_data !== undefined) {
                let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                console.log('decrypted_data', decrypted_response);
                let resultData = decrypted_response.data.length > 0 ? decrypted_response.data : [];
                if (resultData.length > 0) {
                }
            }
        }, (error) => {
        });
    }
    getPage(page) {
        this.serverCall(page).subscribe({
            next: (res) => {
                this.categories$ = of(res.items);
                this.total = res.total;
                this.p = page;
            },
            error: (error) => {
                console.error('Error fetching categories:', error);
            }
        });
    }
    serverCall(page) {
        let URL = "";
        URL = this.baseURL + "api/categories?page=" + page;
        let body = {
            // Following variables are optional. You can change it according to your requirements.
            "limit": this.perPage
        };
        const headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('server call decryptedData');
            console.log(decryptedData);
            return {
                items: decryptedData.categories.data,
                total: decryptedData.categories.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            return of({ items: [], total: 0 });
        }));
    }
};
ConfigurationComponent = __decorate([
    Component({
        selector: 'app-configuration',
        templateUrl: './configuration.component.html',
        styleUrl: './configuration.component.css'
    })
], ConfigurationComponent);
export { ConfigurationComponent };
//# sourceMappingURL=configuration.component.js.map