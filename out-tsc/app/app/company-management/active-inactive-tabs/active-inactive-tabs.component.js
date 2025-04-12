import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, Input, ViewChild, } from "@angular/core";
import { environment } from "../../../environments/environments";
import { HttpHeaders } from "@angular/common/http";
import { debounceTime, distinctUntilChanged, map, Observable, of, Subject, Subscription, } from "rxjs";
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { Validators } from "@angular/forms";
let ActiveInactiveTabsComponent = class ActiveInactiveTabsComponent {
    constructor(datePipe, formBuilder, dataSharingService, encryptDecrypt, httpClientRequest, cdr, el) {
        this.datePipe = datePipe;
        this.formBuilder = formBuilder;
        this.dataSharingService = dataSharingService;
        this.encryptDecrypt = encryptDecrypt;
        this.httpClientRequest = httpClientRequest;
        this.cdr = cdr;
        this.el = el;
        this.companyTotalUsers = 0;
        this.ownerImage = '';
        this.companyCreatedAt = '';
        this.companyImage = '';
        this.liveImagesUrl = "https://api.staffviz.com/file/";
        this.fallbackImageUrl = 'assets/css/sprite_images/images/no-image-found.png';
        this.activeCompaniesLength = 0;
        this.inActiveCompaniesLength = 0;
        this.invitedCompaniesLength = 0;
        this.showSpinner = true;
        this.updateCompanyFlag = false;
        this.companyDetailArray = [];
        this.companies = [];
        this.companiesData = [];
        this.baseURL = environment.apiBASEURL;
        this.meals = [];
        this.company_users$ = new Observable();
        this.companyUsersSubscription = new Subscription();
        this.company_inActiveUsers$ = new Observable();
        this.p = 1;
        this.p2 = 1;
        this.total = 0;
        this.perPage = 20;
        this.paginateSpinner = false;
        this.company_id = 0;
        this.searchQuery = '';
        this.searchActiveCompanyQuery = '';
        this.active_users = 0;
        this.inActive_users = 0;
        this.base64Image = '';
        this.imageUrl = '';
        this.applyFilterImage = true;
        this.showErrors = false;
        this.company_title = "---";
        this.noDataFound = false;
        this.placeholderImageUrl = 'assets/css/sprite_images/images/no-image-found.png';
        this.noDataFoundInActiveTab = false;
        this.imageExistenceChecker = new Subject();
        this.userTextAccordingToTabView = 'Active';
        this.CompanyDetail = {};
        this.ownerName = '---';
        this.searchQuery$ = new Subject();
        this.onInputActiveCompaniesChange$ = new Subject();
        this.clickedIndex = null;
        this.company_users$ = new Observable();
        this.company_inActiveUsers$ = new Observable();
        this.onInputActiveCompaniesChange$.pipe(debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
        distinctUntilChanged() // Ignore consecutive identical values
        )
            .subscribe((query) => {
            this.onActiveCompaniesSearch(query); // Call the search function when user stops typing
        });
        this.searchQuery$.pipe(debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
        distinctUntilChanged() // Ignore consecutive identical values
        )
            .subscribe((query) => {
            this.onSearch(query); // Call the search function when user stops typing
        });
        this.editCompanyForm = this.formBuilder.group({
            title: ['', Validators.required],
            gracePeriod: ['', Validators.required],
            payment_status: ['', Validators.required],
            image: [''],
        });
    }
    onInputChange() {
        this.searchQuery$.next(this.searchQuery); // Push the search query to the observable
    }
    showToast(title = '', text = '', position = 'top-end', icon = 'success') {
        Swal.fire({ toast: true, position: position, showConfirmButton: false, timer: 8000, title: title, text: text, icon: icon });
    }
    onInputActiveCompaniesChange() {
        this.onInputActiveCompaniesChange$.next(this.searchActiveCompanyQuery); // Push the search query to the observable
    }
    ngOnInit() {
        this.dataSharingService.getSharedData().subscribe((value) => {
            if (value) {
                this.activeCompaniesLength = value.activeCompanies;
                this.inActiveCompaniesLength = value.inActiveCompaniesLength;
                this.invitedCompaniesLength = value.invitedCompaniesLength;
                this.showSpinner = value.showSpinner;
                this.companies = value.companies;
                this.companiesData = value.companies;
                this.cdr.detectChanges();
            }
            // Now you can work with the emitted value (e.g., set it to a component property)
        });
    }
    inviteOwner(company_id = 0, message = '') {
        let decrypted_data;
        let URL = this.baseURL + 'api/company/invite_owner';
        let body = {
            "company_id": company_id,
            "message": message
        };
        let headers = new HttpHeaders({
            "Access-Control-Allow-Headers": 'accept',
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let method = 'POST';
        this.showSpinner = true;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('decrypted_data', decrypted_data, response.app_data);
            if (decrypted_data.status === true) {
                console.log(decrypted_data);
            }
            this.showSpinner = false;
        }, (error) => {
            //error() callback
            console.error('Request failed with error', error);
        });
    }
    onSearch(query) {
        let status = "";
        const parentElement = this.el.nativeElement.querySelector("#in-active-users");
        console.log(parentElement);
        if (parentElement && this.hasClass(parentElement, 'active')) {
            if (this.company_id !== 0) {
                this.p2 = 1;
                this.paginateSpinner = true;
                this.noDataFound = false;
                this.noDataFoundInActiveTab = false;
                this.fetchCompanyUserApiRequest(this.company_id, null, false, query, "deactive", "inActive");
            }
        }
        else {
            // Perform the search or trigger the request here
            if (this.company_id !== 0) {
                this.p = 1;
                this.noDataFound = false;
                this.paginateSpinner = true;
                this.fetchCompanyUserApiRequest(this.company_id, null, true, query);
            }
        }
    }
    onActiveCompaniesSearch(query) {
        if (query != '' && this.companies.length > 0) {
            // @ts-ignore
            this.companies = this.companies.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
            this.cdr.detectChanges();
        }
        else {
            this.companies = this.companiesData;
            this.cdr.detectChanges();
        }
    }
    companyToggleButton(isChecked, companyId) {
        this.checked = isChecked;
        let URL = this.baseURL + "api/company/" + companyId + "/change_status";
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        if (typeof this.checked !== "undefined") {
            let decrypted_data = null;
            this.httpClientRequest.initiateHttpRequest(URL, {}, headers, "POST").subscribe((response) => {
                decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                this.dataSharingService.callFunctionEvent.emit();
                let status = isChecked ? 'activated' : 'deactivated';
                this.showToast('', 'Company successfully ' + status);
            }, (error) => {
                //error() callback
                console.error('Request failed with error', error);
            });
        }
    }
    userToggleButton(isChecked, userId) {
        this.checked = isChecked;
        let URL = this.baseURL + "api/company/" + this.company_id + "/users/change_status";
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        if (typeof this.checked !== "undefined") {
            let body = {
                "user_id": userId,
                "status": this.checked === true ? "active" : "deactive"
            };
            let decrypted_data = null;
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
                decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                // this.companyUsers(this.clickedIndex, this.company_id, this.company_title);
                if (isChecked) {
                    const elementToClick = this.el.nativeElement.querySelector('#home-tab'); // Replace 'yourElementId' with the ID of the element you want to trigger a click on
                    if (elementToClick) {
                        const event = new MouseEvent('click', { bubbles: true });
                        elementToClick.dispatchEvent(event);
                    }
                    this.cdr.detectChanges();
                }
                let status = isChecked ? 'activated' : 'deactivated';
                this.showToast('', 'User successfully ' + status);
            }, (error) => {
                console.error('Request failed with error', error);
            });
        }
    }
    hasClass(element, className) {
        return element.classList.contains(className);
    }
    formatDate(dateString) {
        const formattedDate = this.datePipe.transform(dateString, 'YYYY-MM-dd');
        return formattedDate || ''; // Handle null or undefined result
    }
    handleImageError() {
        this.companyImage = '';
    }
    companyUsers(index, company_id, title, users = 0, first_name = '', last_name = '', logo = '', created_at = '', owner_image = '') {
        this.companyCreatedAt = this.formatDate(created_at);
        this.ownerImage = owner_image;
        this.companyTotalUsers = users;
        this.ownerName = first_name + ' ' + last_name;
        this.companyImage = logo;
        this.cdr.detectChanges();
        this.noDataFound = false;
        this.paginateSpinner = true;
        this.p = 1;
        this.company_title = title;
        this.fetchCompanyUserApiRequest(company_id, null, false, "", "active", "active");
        //update company id variable this.company_id = company_id, later we will use in on search function. current active company id
        this.company_id = company_id;
        // Remove the "active" class from the previously clicked element
        if (this.clickedIndex !== null) {
            const prevElement = document.querySelector(`.user_name a:nth-child(${this.clickedIndex + 1})`);
            if (prevElement) {
                prevElement.classList.remove('active');
            }
        }
        // Add the "active" class to the newly clicked element
        this.clickedIndex = index;
        console.log(this.clickedIndex, index);
    }
    inActiveUsers() {
        if (this.company_id !== 0) {
            this.p2 = 1;
            this.paginateSpinner = true;
            this.noDataFound = false;
            this.noDataFoundInActiveTab = false;
            this.fetchCompanyUserApiRequest(this.company_id, null, false, "", "deactive", "inActive");
            this.searchQuery = "";
        }
        this.userTextAccordingToTabView = "InActive";
        // this.cdr.detectChanges();
    }
    inVitedUsers() {
        if (this.company_id !== 0) {
            this.p2 = 1;
            this.paginateSpinner = true;
            this.noDataFound = false;
            this.noDataFoundInActiveTab = false;
            this.fetchCompanyUserApiRequest(this.company_id, null, false, "", "invited", "invited");
            this.searchQuery = "";
        }
    }
    activeUsers() {
        if (this.company_id !== 0) {
            this.noDataFound = false;
            this.paginateSpinner = true;
            this.p = 1;
            this.searchQuery = "";
            this.fetchCompanyUserApiRequest(this.company_id, null, false, "", "active", "active");
        }
        this.userTextAccordingToTabView = "Active";
        // this.cdr.detectChanges();
    }
    UseUpdatedResponse(updatedResponse) {
        if (updatedResponse.data.length > 0) {
            this.company_users$ = of(updatedResponse.data);
            this.total = updatedResponse.total;
            this.showSpinner = false;
        }
        else {
            this.noDataFound = true;
            this.company_users$ = of([]);
            this.total = 0;
        }
        this.paginateSpinner = false;
        this.cdr.detectChanges();
    }
    invitedUserResponse(updatedResponse) {
        if (updatedResponse.data.length > 0) {
            this.company_users$ = of(updatedResponse.data);
            this.total = updatedResponse.total;
            this.showSpinner = false;
        }
        else {
            this.noDataFound = true;
            this.company_users$ = of([]);
            this.total = 0;
        }
        this.paginateSpinner = false;
        this.cdr.detectChanges();
    }
    updatedResponseForInActiveUsersTable(updatedResponse) {
        if (updatedResponse.data.length > 0) {
            this.company_inActiveUsers$ = of(updatedResponse.data);
            this.inActive_users = updatedResponse.total;
            this.total = updatedResponse.total;
            this.paginateSpinner = false;
            this.noDataFound = false;
        }
        else {
            this.noDataFoundInActiveTab = true;
            this.total = 0;
            this.company_inActiveUsers$ = of([]);
        }
        this.paginateSpinner = false;
        this.cdr.detectChanges();
    }
    //Current getpage code
    getPage(page) {
        this.loading = true;
        this.serverCall(page, this.total, this.perPage).subscribe({
            next: (res) => {
                this.total = res.total;
                console.log(page, res.items);
                const parentElement = this.el.nativeElement.querySelector('.active_users_list');
                if (parentElement && this.hasClass(parentElement, 'active')) {
                    this.p = page;
                    this.company_users$ = of(res.items);
                }
                else {
                    this.p2 = page;
                    this.company_inActiveUsers$ = of(res.items);
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching categories:', error);
                this.loading = false;
            }
        });
    }
    /**
     * Simulate an async HTTP call with a delayed observable.
     */
    serverCall(page, total, per_Page) {
        let company_id = this.company_id;
        let URL = "";
        let status = "";
        const parentElement = this.el.nativeElement.querySelector('.active_users_list');
        if (parentElement && this.hasClass(parentElement, 'active')) {
            status = "active";
        }
        else {
            status = "deactive";
        }
        console.log(parentElement, status);
        URL = this.baseURL + "api/company/" + company_id + "/users?page=" + page;
        let headers = new HttpHeaders({
            "Accept": "application/json",
            // "Access-Control-Allow-Headers": 'accept',
            // "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = {
            // Following variables are optional. You can change it according to your requirements.
            "limit": this.perPage,
            "status": status,
            "fields": [
                "user_id",
                "email",
                "first_name",
                "last_name",
                "phone",
                "image",
                "profile_type",
                "profile_name",
                "companies_users.status",
                "is_terminated",
                "is_employee",
                "web_tracking",
                "client_app_version"
            ]
        };
        this.paginateSpinner = true;
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            this.paginateSpinner = false;
            return {
                items: decryptedData.data,
                total: decryptedData.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            this.paginateSpinner = false;
            return of({ items: [], total: 0 });
        }));
    }
    fetchCompanyUserApiRequest(company_id, page_number = null, fromPaginateButton = false, search = "", status = "active", table_type = "") {
        let decrypted_data = {};
        let URL = "";
        if (page_number == null) {
            URL = this.baseURL + "api/company/" + company_id + "/users";
        }
        else {
            URL = this.baseURL + "api/company/" + company_id + "/users?page=" + page_number;
        }
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = {
            // Following variables are optional. You can change it according to your requirements.
            "limit": this.perPage,
            "status": status,
            "fields": [
                "user_id",
                "email",
                "first_name",
                "last_name",
                "phone",
                "image",
                "profile_type",
                "profile_name",
                "companies_users.status",
                "is_terminated",
                "is_employee",
                "web_tracking",
                "client_app_version"
            ]
        };
        if (search !== "") {
            body["search"] = search;
        }
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
            this.applyFilterImage = false;
            this.cdr.detectChanges();
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('table_type', decrypted_data);
            if (fromPaginateButton === false && decrypted_data && table_type !== "inActive") {
                this.UseUpdatedResponse(decrypted_data);
            }
            else if (table_type === "inActive") {
                this.updatedResponseForInActiveUsersTable(decrypted_data);
                this.paginateSpinner = false;
            }
            else if (table_type === "invited") {
                this.invitedUserResponse(decrypted_data);
                this.paginateSpinner = false;
            }
            //on searching
            else {
                this.paginateSpinner = false;
                this.UseUpdatedResponse(decrypted_data);
                return;
            }
            this.showSpinner = false;
        }, (error) => {
            //error() callback
            console.error('Request failed with error', error);
        });
    }
    onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = this.handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file); //readAsBinaryString(file);
        }
    }
    handleReaderLoaded(event) {
        let imageFile = 'data:image/png;base64,' + btoa(event.target.result); //this.handleReaderLoaded.bind(this);
        this.base64Image = imageFile;
        this.imageUrl = imageFile;
        this.cdr.detectChanges();
    }
    clearImage() {
        this.imageUrl = '';
    }
    editCompanySave(company) {
        //instead of fetch companies list added updated company data in this array so without reload if user try to edit same company so it he will get latest updated data
        if (this.companyDetailArray !== undefined && this.companyDetailArray[company.id] !== undefined) {
            company = this.companyDetailArray[company.id];
        }
        console.log('c data', company);
        this.CompanyDetail.company_id = company.id;
        this.CompanyDetail.company_initial = company.company_initial;
        this.imageUrl = company.logo ? this.liveImagesUrl + company.logo : '';
        this.editCompanyForm.get('title')?.patchValue(company.title);
        this.editCompanyForm.get('gracePeriod')?.patchValue(company.grace_period);
        this.editCompanyForm.get('payment_status')?.patchValue(company.payment_status);
    }
    updateCompanyDetail() {
        if (this.editCompanyForm.valid) {
            let formData = this.editCompanyForm.value;
            if (this.imageUrl !== null && this.imageUrl !== "") {
                formData.logo = this.imageUrl.trim();
            }
            let URL = this.baseURL + "api/company/company_update";
            let headers = new HttpHeaders({
                "Accept": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Content-Type": "application/json",
            });
            formData.company_initial = this.CompanyDetail.company_initial;
            formData.company_id = this.CompanyDetail.company_id;
            let body = formData;
            this.updateCompanyFlag = true;
            let decrypted_data = null;
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
                decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                console.log(decrypted_data);
                this.editCompanyForm.reset();
                this.imageUrl = "";
                this.closeBtn.nativeElement.click();
                this.updateCompanyFlag = false;
                if (this.CompanyDetail.company_id !== undefined) {
                    this.companyDetailArray[this.CompanyDetail.company_id] = decrypted_data.company;
                }
            }, (error) => {
                this.updateCompanyFlag = false;
                //error() callback
                console.error('Request failed with error', error);
            });
        }
        else {
            console.log(this.editCompanyForm.controls);
        }
    }
    get formControl() {
        return this.editCompanyForm.controls;
    }
};
__decorate([
    Input('data')
], ActiveInactiveTabsComponent.prototype, "meals", void 0);
__decorate([
    ViewChild('closeBtn')
], ActiveInactiveTabsComponent.prototype, "closeBtn", void 0);
ActiveInactiveTabsComponent = __decorate([
    Component({
        selector: 'app-active-inactive-tabs',
        templateUrl: './active-inactive-tabs.component.html',
        styleUrls: ['./active-inactive-tabs.component.css'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        styles: [`
    h1 {
      color: #DB5B33;
      font-weight: 300;
      text-align: center;
    }

    toggle-button {
      margin: 0 auto;
    }
  `]
    })
], ActiveInactiveTabsComponent);
export { ActiveInactiveTabsComponent };
//# sourceMappingURL=active-inactive-tabs.component.js.map