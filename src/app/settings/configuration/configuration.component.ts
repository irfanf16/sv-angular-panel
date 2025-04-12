import {Component} from '@angular/core';
import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import {PlansConfiguration} from "../../Components/constants/plan_&_packages/plans/plans";
import {map, Observable, of} from "rxjs";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {environment} from "../../../environments/environments";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {Config} from "../../Components/interfaces/settings/configurations/configuration";
import {
  CompanyUserRequestBody,
  IServerResponse
} from "../../Components/interfaces/plan_&_packages/categories/categories";
import {CategoriesConfig} from "../../Components/constants/plan_&_packages/categories/categories";
import {catchError} from "rxjs/operators";


@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})

export class ConfigurationComponent {
  // public addConfigForm: FormGroup;

  total: number = 0;
  perPage: number = 20;
  p: number = 1;
  DataFound: boolean = false;
  DataFoundPagination: boolean = false;



  categories$: Observable<Config[]> = new Observable<Config[]>();

  baseURL: string = environment.apiBASEURL;

  constructor(private appComponent: AppComponent, private breadcrumbService: BreadcrumbService, private formBuilder: FormBuilder, private httpClientRequest: HttpClientRequestService,
              private encryptDecrypt: EncryptDecryptService) {
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

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
console.log('decrypted_data', decrypted_response)
          let resultData: any[] = decrypted_response.data.length > 0 ? decrypted_response.data : [];
          if (resultData.length > 0) {
            this.DataFound = true;
            this.categories$ = of(resultData);
            this.total = decrypted_response.total;
            console.log(resultData)
          }
          else{
            this.categories$ = of([]);
            this.total = 0;
            this.DataFound = false;
          }
        }
      },
      (error) => {

      });

  }

  getPage(page: number) {

    this.serverCall(page).subscribe({
      next: (res: any) => {
        this.categories$ = of(res.items);
        this.total = res.total;
        this.p = page;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  serverCall( page: number): Observable<IServerResponse> {

    let URL: string = "";
    URL = this.baseURL + 'api/settings/configurations?page=' + page;

    let body = {
      // Following variables are optional. You can change it according to your requirements.
      "limit": this.perPage
    };
    const headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('server call decryptedData');
        console.log(decryptedData);
        return {
          items: decryptedData.categories.data,
          total: decryptedData.categories.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({ items: [], total: 0 });
      })
    );
  }

}

