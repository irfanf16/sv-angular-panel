import {ChangeDetectorRef, Component, ElementRef} from '@angular/core';
import {AppComponent} from "../../app.component";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {NgxPaginationModule} from "ngx-pagination";
import {TalkToSalesConfig} from "../constants/settings/talk_to_sales/talk_to_sales";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import { HttpHeaders } from "@angular/common/http";
import {PlansConfiguration} from "../constants/plan_&_packages/plans/plans";
import {map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environments";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {TalkToSale} from "../interfaces/talk_to_sales/talk_to_sales"
import {IServerResponse} from "../interfaces/plan_&_packages/plan-listing/plan-listing";
import {catchError} from "rxjs/operators";


@Component({
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
export class TalkToSalesComponent {
  baseURL: string = environment.apiBASEURL;

  perPage: number = 20;
  totalTalkToSales: number = 0;
  TalkToSalesCurrentPage: number = 1;


  activeTalkToSales$: Observable<TalkToSale[]> = new Observable<TalkToSale[]>();

  constructor(private appComponent: AppComponent, private cdr: ChangeDetectorRef, private breadcrumbService: BreadcrumbService, private httpClientRequest: HttpClientRequestService,
              private encryptDecrypt: EncryptDecryptService, private el: ElementRef) {
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

  talkToSalesListing(){
    let URL = this.baseURL + 'api/talk_to_sales?page=1';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "limit": this.perPage,
    };
    let method = "GET";
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          this.activeTalkToSales$ = of(decrypted_response.data)
          this.totalTalkToSales = decrypted_response.total;
          console.log(decrypted_response)
        }
      },
      (error) => {
      });
  }

  getPage(page: number) {

    this.serverCall(page, this.totalTalkToSales, this.perPage).subscribe({

      next: (res: any) => {
        this.totalTalkToSales = res.total;
        let resultData: Observable<TalkToSale[]>= res.items.length > 0 ? of(res.items) : of([]);

        this.TalkToSalesCurrentPage = page;
        this.activeTalkToSales$ = resultData
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

    let URL = this.baseURL + 'api/talk_to_sales?page=1';
    let headers: HttpHeaders = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "limit": this.perPage,
    };
    let method = "GET";

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

}
