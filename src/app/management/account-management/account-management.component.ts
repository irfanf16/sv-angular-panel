import {ChangeDetectorRef, Component} from '@angular/core';

import {AppComponent} from "../../app.component";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {NgxPaginationModule} from "ngx-pagination";
import {map, Observable, of} from "rxjs";
import {CompanyDetails} from "../../Components/interfaces/management/account-management/account-management";
import {HttpHeaders} from "@angular/common/http";
import {PlansConfiguration} from "../../Components/constants/plan_&_packages/plans/plans";
import {IServerResponse} from "../../Components/interfaces/plan_&_packages/plan-listing/plan-listing";
import {catchError} from "rxjs/operators";
import {environment} from "../../../environments/environments";
import {formatTimestampToMySQL, notEmpty} from "../../util";
import {SearchAbleDropdownComponent} from "../../Components/UI/search-able-dropdown/search-able-dropdown.component";
import {UsersConfig} from "../../Components/constants/users/users";
import {BreadcrumbService} from "../../services/breadcrumb.service";

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgxPaginationModule,
    SearchAbleDropdownComponent
  ],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css'
})
export class AccountManagementComponent {
  baseURL: string = environment.apiBASEURL;
  inputValue: string = '';

  typingTimer: any;


  perPage: number = 20;
  totalCompanies: number = 0;
  companiesCurrentPage: number = 1;
  doneTypingInterval = 500;

  items: any[] = [];
  item = 'keyword';

  companies$: Observable<CompanyDetails[]> = new Observable<CompanyDetails[]>();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private appComponent: AppComponent,
    private httpClientRequest: HttpClientRequestService,
    private encryptDecrypt: EncryptDecryptService, private cdr: ChangeDetectorRef) {


    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;
  }

  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs([{ label: 'Account Management', url: '/account-management' }]);
    this.breadcrumbService.setComponentName('Account Management');
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');

    this.companies();

  }

  ngAfterViewInit(): void {
    this.items = [
      {id: 1, title: "Active", product: 'af'},
      {id: 2, title: "inActive", product: 'aaf'},
      {id: 3, title: "Trial", product: 'af'}
    ];
    this.cdr.detectChanges();
  }

  companies(search: string = '') {
    let URL = this.baseURL + "api/companies";
    let headers = new HttpHeaders({
      "Accept": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Content-Type": "application/json",
    });
    let body: { limit: number, fields: string[], search?: string } = {
      limit: this.perPage,
      fields: [
        "users.image",
        "companies.id",
        "no_of_employee",
        "title",
        "logo",
        "companies.status",
        "companies.created_at",
        "plan_staus",
        "closure_plan",
        "has_setup",
        "users.first_name",
        "users.last_name",
        "grace_period",
        "company_initial",
        "payment_status"
      ]
    };

    if (notEmpty(search)) {
      body.search = search;
    }

    let method = "POST";
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          this.companies$ = of(decrypted_response.data);
          this.totalCompanies = decrypted_response.total;

        }
      },
      (error) => {
      });
  }

  getPage(page: number) {

    this.serverCall(page, this.totalCompanies, this.perPage).subscribe({

      next: (res: any) => {
        this.totalCompanies = res.total;
        let resultData: Observable<CompanyDetails[]> = res.items.length > 0 ? of(res.items) : of([]);

        this.companiesCurrentPage = page;
        this.companies$ = resultData
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching companies:', error);
      }
    });
  }

  /**
   * Simulate an async HTTP call with a delayed observable.
   */

  serverCall(page: number, total: number, per_Page: number): Observable<IServerResponse> {

    let URL = this.baseURL + 'api/companies?page=' + page;
    let headers: HttpHeaders = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      limit: this.perPage,
      fields: [
        "users.image",
        "companies.id",
        "no_of_employee",
        "title",
        "logo",
        "companies.status",
        "companies.created_at",
        "companies.advocate_id",
        "plan_staus",
        "closure_plan",
        "has_setup",
        "users.first_name",
        "users.last_name",
        "grace_period",
        "company_initial",
        "payment_status"
      ]
    };
    let method = "POST";

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));

        return {
          items: decryptedData.data,
          total: decryptedData.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );

  }

  onKeyUp(event: any) {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      // Call your action method here
      this.onStoppedTyping();
    }, this.doneTypingInterval);

    // Update the input value
    this.inputValue = event.target.value;
  }

  onStoppedTyping() {
    console.log('this.value', this.inputValue)
    this.companies(this.inputValue);
  }

  sortPlanAccordingToCategory(value: any) {
    console.log(value)
  }

  protected readonly formatTimestampToMySQL = formatTimestampToMySQL;
}
