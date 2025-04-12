import {ChangeDetectorRef, Component, ElementRef} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {NgxPaginationModule} from "ngx-pagination";
import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {environment} from "../../../environments/environments";
import {ClosedAccountsConfig} from "../../Components/constants/settings/closed accounts/closed_accounts";
import {map, Observable, of} from "rxjs";
import { HttpHeaders } from "@angular/common/http";
import {PlansConfiguration} from "../../Components/constants/plan_&_packages/plans/plans";
import {IServerResponse} from "../../Components/interfaces/plan_&_packages/plan-listing/plan-listing";
import {catchError} from "rxjs/operators";
import {checkPermission} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";

export interface CompanyPlan {
  id: number;
  company_id: number;
  plan_type: string | null;
  filter: number;
  reason: string;
  message: string;
  closing_time: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}


@Component({
  selector: 'app-closed-accounts',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgxPaginationModule,
    NgClass
  ],
  templateUrl: './closed-accounts.component.html',
  styleUrl: './closed-accounts.component.css'
})
export class ClosedAccountsComponent {

  baseURL: string = environment.apiBASEURL;


  companiesData: any[] = [];

  perPage: number = 20;
  filter:number = 0;
  selectedItem: number | null = -1;
  totalClosedAccounts: number = 0;
  closedAccountsCurrentPage: number = 1;

  activeClosedAccounts$: Observable<CompanyPlan[]> = new Observable<CompanyPlan[]>();

  constructor(private appComponent: AppComponent, private breadcrumbService: BreadcrumbService, private cdr: ChangeDetectorRef, private httpClientRequest: HttpClientRequestService
              , private encryptDecrypt: EncryptDecryptService) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;
  }

  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs(ClosedAccountsConfig.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(ClosedAccountsConfig.COMP_NAME);
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/planPackages.svg');
    this.cdr.detectChanges();

    this.closedAccountsListing();


  }

  getPage(page: number) {

    this.serverCall(page, this.totalClosedAccounts, this.perPage).subscribe({

      next: (res: any) => {
        this.totalClosedAccounts = res.total;
        let resultData: Observable<CompanyPlan[]>= res.items.length > 0 ? of(res.items) : of([]);

        this.closedAccountsCurrentPage = page;
        this.activeClosedAccounts$ = resultData
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching talkToSales:', error);
      }
    });
  }

  /**
   * Simulate an async HTTP call with a delayed observable.
   */

  serverCall(page: number, total: number, per_Page: number): Observable<IServerResponse> {

    let URL = this.baseURL + 'api/close_accounts?page=1';
    let headers: HttpHeaders = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body: {limit: number, filter?: number} = {
      "limit": this.perPage,
    };
    if(this.filter > -1){
      body.filter = this.filter;
    }

    let method = "POST";

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        this.companiesData = decryptedData.companyDetail;
        console.log(decryptedData.closedAccounts.data)
        return {
          items: decryptedData.closedAccounts.data,
          total: decryptedData.closedAccounts.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );

  }

  closedAccountsListing(filter: number = -1){
    let URL = this.baseURL + 'api/close_accounts?page=1';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body: {limit: number, filter?: number} = {
      "limit": this.perPage,
    };

    if(filter > -1){
      body.filter = filter;
      this.filter = filter;
      this.selectedItem = filter;
    }

    let method = "POST";
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response.closedAccounts.data)
          const companiesRecords = decrypted_response.closedAccounts.data;
          if(companiesRecords.length > 0){
            this.activeClosedAccounts$ = of(decrypted_response.closedAccounts.data)
            this.totalClosedAccounts = decrypted_response.closedAccounts.total;
          }
          else{
            this.activeClosedAccounts$ = of([])
            this.totalClosedAccounts = 0;
          }


          this.companiesData = decrypted_response.companyDetail;
          console.log(decrypted_response)
        }
      },
      (error) => {
      });
  }

  protected readonly checkPermission = checkPermission;
  protected readonly moduleIds = moduleIds;
}
