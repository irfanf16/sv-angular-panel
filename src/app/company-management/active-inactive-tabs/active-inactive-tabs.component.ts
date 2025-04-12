import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2, ViewChild,
} from "@angular/core";
import {DataSharingService} from "../../services/data-sharing.service";
import {environment} from "../../../environments/environments";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";
import { HttpHeaders} from "@angular/common/http";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  Subject,
  Subscription,
} from "rxjs";
import Swal, {SweetAlertIcon} from 'sweetalert2';
import {DatePipe, formatDate} from "@angular/common";
import {catchError} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {checkPermission, formatUnixTimestampToDate, notEmpty} from "../../util";
import {
  companySubscription,
  invoiceSubscription, TimeStampsAmount
} from "../../Components/interfaces/company-management/active-inActive-components/active-inactive";
import {moduleIds} from "../../Components/project_resources/modules";

declare var bootstrap: any; // Ensure Bootstrap is available

interface IServerResponse {
  items: string[];
  total: number;
}

interface CompanyUserRequestBody {
  limit: number;
  status: string;
  fields: string[];
  search?: string; // Optional property
}

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  image: string | null;
  profile_type: string;
  profile_name: string;
  status: string;
  is_terminated: number;
  is_employee: number;
  web_tracking: number;
  client_app_version: string | null;
}

interface Company {
  image: string;
  id: number;
  no_of_employee: number;
  title: string;
  logo: string;
  status: number;
  created_at: string;
  has_setup: number;
  first_name: string;
  last_name: string;
  total_users: number;
  grace_period: number | string;
  company_initial: string;
  payment_status: number;
}


@Component({
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


export class ActiveInactiveTabsComponent {


  // company delete popup
  selectedCompany: any;

  // @ts-ignore
  checked: boolean;
  companyTotalUsers: number = 0;

  ownerImage: string = '';

  companyCreatedAt: string = '';
  companyImage: string = '';
  liveImagesUrl: string = "https://api.staffviz.com/file/";
  fallbackImageUrl: string = 'assets/css/sprite_images/images/no-image-found.png';
  activeCompaniesLength: number = 0;
  inActiveCompaniesLength: number = 0;
  invitedCompaniesLength: number = 0;

  showSpinner: boolean = true;
  updateCompanyFlag: boolean = false;

  companyDetailArray: { [index: number]: Company } = [];
  companies: any = [];
  companiesData: any = [];
  baseURL: string = environment.apiBASEURL;
  @Input('data') meals: string[] = [];

  company_users$: Observable<any> = new Observable<any>();
  private companyUsersSubscription: Subscription = new Subscription();

  subscriptionDetails: {
    plan_subscription_date : string | null,
    trial_start_date: string | null,
    trial_end_date: string | null,
    last_invoice_amount?: number | null,
    last_payment_date?: string | null,
    amount_paid: number | null,
    current_invoice_payment_amount: number | null,
    current_invoice_payment_due_date: string | null,
    timeStampsAmount: { [timestamp: string]: TimeStampsAmount },
    timeStamps: number[]
  } = {
    plan_subscription_date : null,
    trial_start_date: null,
    trial_end_date: null,
    amount_paid: null,
    current_invoice_payment_amount: null,
    current_invoice_payment_due_date: null,
    timeStampsAmount: {},
    timeStamps: []
  };

  company_inActiveUsers$: Observable<any> = new Observable<any>();
  p: number = 1;
  p2: number = 1;
  total: number = 0;
  loading!: boolean;

  perPage: number = 20;

  paginateSpinner: boolean = false;

  company_id: number = 0;
  searchQuery: string = '';
  searchActiveCompanyQuery: string = '';

  active_users: number = 0;
  inActive_users: number = 0;
  base64Image: string = '';
  imageUrl: string = '';

  applyFilterImage: boolean = true;
  showErrors: boolean = false;
  company_title: string = "---";

  noDataFound: boolean = false;
  placeholderImageUrl: string = 'assets/css/sprite_images/images/no-image-found.png';
  noDataFoundInActiveTab: boolean = false;
  private imageExistenceChecker = new Subject<string>();
  userTextAccordingToTabView: string = 'Active';

  CompanyDetail: {
    company_initial?: string,
    title?: string,
    company_id?: number,
    gracePeriod?: number | string,
    logo?: string
  } = {};

  ownerName: string = '---';
  private searchQuery$ = new Subject<string>();
  private onInputActiveCompaniesChange$ = new Subject<string>();

  public editCompanyForm!: FormGroup;

  constructor(
    private datePipe: DatePipe, private formBuilder: FormBuilder,
    private dataSharingService: DataSharingService,
    private encryptDecrypt: EncryptDecryptService,
    private httpClientRequest: HttpClientRequestService,
    private cdr: ChangeDetectorRef,
    private toastMessages: ToastMessagesComponent,
    private el: ElementRef) {

    this.company_users$ = new Observable<any>();
    this.company_inActiveUsers$ = new Observable<any>();

    this.onInputActiveCompaniesChange$.pipe(
      debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
      distinctUntilChanged() // Ignore consecutive identical values
    )
      .subscribe((query) => {
        this.onActiveCompaniesSearch(query); // Call the search function when user stops typing
      });

    this.searchQuery$.pipe(
      debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
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

  showToast(title: any = '', text: any = '', position: any = 'top-end', icon: SweetAlertIcon = 'success') {
    Swal.fire({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: 8000,
      title: title,
      text: text,
      icon: icon
    });
  }

  onInputActiveCompaniesChange() {
    this.onInputActiveCompaniesChange$.next(this.searchActiveCompanyQuery); // Push the search query to the observable
  }

  ngOnInit() {
    this.dataSharingService.getSharedData().subscribe((value) => {
      console.log('value.showSpinner',value)
      if (value) {
        this.activeCompaniesLength = value.activeCompanies;
        this.inActiveCompaniesLength = value.inActiveCompaniesLength;
        this.invitedCompaniesLength = value.invitedCompaniesLength;
        this.showSpinner = value.showSpinner;
        this.companies = value.companies
        this.companiesData = value.companies
        this.cdr.detectChanges();
      }else{
        this.showSpinner = false;
        this.paginateSpinner = false;
      }
      // Now you can work with the emitted value (e.g., set it to a component property)
    });
  }


  inviteOwner(company_id = 0, message = '') {
    let decrypted_data: any;


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
    let method = 'POST'
    this.showSpinner = true;

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('decrypted_data', decrypted_data, response.app_data);

        if (decrypted_data.status === true) {
          console.log(decrypted_data);
        }

        this.showSpinner = false;
      },
      (error) => {
        //error() callback
        console.error('Request failed with error', error);

      });


  }

  onSearch(query: string) {

    let status: string = "";
    const parentElement = this.el.nativeElement.querySelector("#in-active-users");
    console.log(parentElement)
    if (parentElement && this.hasClass(parentElement, 'active')) {
      if (this.company_id !== 0) {
        this.p2 = 1;
        this.paginateSpinner = true;
        this.noDataFound = false;
        this.noDataFoundInActiveTab = false;
        this.fetchCompanyUserApiRequest(this.company_id, null, false, query, "deactive", "inActive");
      }
    } else {
      // Perform the search or trigger the request here
      if (this.company_id !== 0) {
        this.p = 1;
        this.noDataFound = false;
        this.paginateSpinner = true;
        this.fetchCompanyUserApiRequest(this.company_id, null, true, query);
      }
    }
  }

  onActiveCompaniesSearch(query: string) {
    if (query != '' && this.companies.length > 0) {
      // @ts-ignore
      this.companies = this.companies.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      this.cdr.detectChanges();

    } else {
      this.companies = this.companiesData;
      this.cdr.detectChanges();
    }
  }

  companyToggleButton(isChecked: boolean, companyId: number) {
    console.log('toggle button')
    this.checked = isChecked;
    let URL = this.baseURL + "api/company/" + companyId + "/change_status";
    let headers = new HttpHeaders({
      "Accept": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Content-Type": "application/json",
    });
    if (typeof this.checked !== "undefined") {

      let decrypted_data: any = null
      this.httpClientRequest.initiateHttpRequest(URL, {}, headers, "POST").subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          this.dataSharingService.callFunctionEvent.emit();

          let status = isChecked ? 'activated' : 'deactivated';
          this.showToast('', 'Company successfully ' + status);

        },
        (error) => {
          //error() callback
          console.error('Request failed with error', error);


        });
    }

  }

 async companyDelete( company: Company) {

    console.log('company', company)
    this.selectedCompany = company;
    let result = await this.toastMessages.showConfirmationDialog('Yes, Delete it!');
    console.log('result', result)
    if (result) {
      console.log('Company deleted:', this.selectedCompany);

      let URL = this.baseURL + "api/deleteCompany/" + this.selectedCompany.id;
      console.log('URL', URL)
      // return false;
      let headers = new HttpHeaders({
        "Accept": "application/json",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });

        let decrypted_data: any = null
        this.httpClientRequest.initiateHttpRequest(URL, {}, headers, "GET").subscribe(
          (response) => {

            // decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            // console.log('decrypted_data', decrypted_data);

            this.dataSharingService.callFunctionEvent.emit();

            let companyTitle =   this.selectedCompany.title;
            this.showToast('', 'Company ' + companyTitle+' successfully deleted');

          },
          (error) => {
            //error() callback
            console.error('Request failed with error', error);
          });
    }

  }



  userToggleButton(isChecked: boolean, userId: number) {
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
      }
      let decrypted_data: any = null;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          // this.companyUsers(this.clickedIndex, this.company_id, this.company_title);

          if (isChecked) {
            const elementToClick = this.el.nativeElement.querySelector('#home-tab'); // Replace 'yourElementId' with the ID of the element you want to trigger a click on
            if (elementToClick) {
              const event = new MouseEvent('click', {bubbles: true});
              elementToClick.dispatchEvent(event);
            }
            this.cdr.detectChanges();
          }


          let status = isChecked ? 'activated' : 'deactivated';
          this.showToast('', 'User successfully ' + status);
        },
        (error) => {
          console.error('Request failed with error', error);

        });
    }

  }

  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  clickedIndex: number | null = null;

  formatDate(dateString: string): string {
    const formattedDate = this.datePipe.transform(dateString, 'YYYY-MM-dd');
    return formattedDate || ''; // Handle null or undefined result
  }

  handleImageError() {
    this.companyImage = '';
  }


  companyUsers(index: number | null, company_id: number, title: string, users: number = 0, first_name: string = '', last_name: string = '', logo: string = '', created_at: string = '', owner_image: string = ''): void {
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
    console.log(this.clickedIndex, index)
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

  UseUpdatedResponse(updatedResponse: any) {
    if (updatedResponse.companyData.data.length > 0) {
      this.company_users$ = of(updatedResponse.companyData.data);
      this.total = updatedResponse.companyData.total;
      this.showSpinner = false;
    } else {
      this.noDataFound = true;
      this.company_users$ = of([]);
      this.total = 0;
    }
    this.paginateSpinner = false;
    this.cdr.detectChanges();
  }

  invitedUserResponse(updatedResponse: any) {
    if (updatedResponse.companyData.data.length > 0) {
      this.company_users$ = of(updatedResponse.companyData.data);
      this.total = updatedResponse.companyData.total;
      this.showSpinner = false;
    } else {
      this.noDataFound = true;
      this.company_users$ = of([]);
      this.total = 0;
    }
    this.paginateSpinner = false;
    this.cdr.detectChanges();
  }

  updatedResponseForInActiveUsersTable(updatedResponse: any) {
    if (updatedResponse.companyData.data.length > 0) {

      this.company_inActiveUsers$ = of(updatedResponse.companyData.data);
      this.inActive_users = updatedResponse.companyData.total;
      this.total = updatedResponse.companyData.total;
      this.paginateSpinner = false;
      this.noDataFound = false;
    } else {
      this.noDataFoundInActiveTab = true;
      this.total = 0;
      this.company_inActiveUsers$ = of([]);
    }

    this.paginateSpinner = false;
    this.cdr.detectChanges();
  }

  //Current getpage code
  getPage(page: number) {
    this.loading = true;

    this.serverCall(page, this.total, this.perPage).subscribe({

      next: (res: any) => {
        this.total = res.total;
        console.log(page, res.items)
        const parentElement = this.el.nativeElement.querySelector('.active_users_list');
        if (parentElement && this.hasClass(parentElement, 'active')) {
          this.p = page;
          this.company_users$ = of(res.items);
        } else {
          this.p2 = page;
          this.company_inActiveUsers$ = of(res.items);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Simulate an async HTTP call with a delayed observable.
   */

  serverCall(page: number, total: number, per_Page: number): Observable<IServerResponse> {

    let company_id = this.company_id
    let URL: string = "";
    let status: string = "";
    const parentElement = this.el.nativeElement.querySelector('.active_users_list');

    if (parentElement && this.hasClass(parentElement, 'active')) {
      status = "active"
    } else {
      status = "deactive"
    }
    console.log(parentElement, status)
    URL = this.baseURL + "api/company/" + company_id + "/users?page=" + page;

    let headers = new HttpHeaders({
      "Accept": "application/json",
      // "Access-Control-Allow-Headers": 'accept',
      // "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Origin": '*',
      "Content-Type": "application/json",
    });
    let body: CompanyUserRequestBody = {
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
    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        this.paginateSpinner = false;
        return {
          items: decryptedData.companyData.data,
          total: decryptedData.companyData.total
        };
      }),
      catchError(error => {
        this.paginateSpinner = false;
        console.error('Request failed with error', error);

        this.paginateSpinner = false;
        return of({items: [], total: 0});
      })
    );

  }

  fetchCompanyUserApiRequest(company_id: number, page_number: any = null, fromPaginateButton: boolean = false, search: string = "", status: string = "active", table_type: string = "") {
    let decrypted_data: object | any = {};
    let URL: string = "";


    if (page_number == null) {
      URL = this.baseURL + "api/company/" + company_id + "/users";
    } else {
      URL = this.baseURL + "api/company/" + company_id + "/users?page=" + page_number;
    }

    let headers = new HttpHeaders({
      "Accept": "application/json",
      "Access-Control-Allow-Origin": '*',
      "Content-Type": "application/json",
    });

    let body: CompanyUserRequestBody = {
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
      body["search"] = search
    }

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
      (response) => {
        this.applyFilterImage = false;
        this.cdr.detectChanges();

        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('table_type', decrypted_data)
        const companySubscription: companySubscription = decrypted_data.companySubscription;
        const companyInvoices: invoiceSubscription[] = decrypted_data.invoices;

        if(companySubscription !== null){
          if(notEmpty(companySubscription.start_date)){
            this.subscriptionDetails.plan_subscription_date = formatUnixTimestampToDate(companySubscription.start_date);
          }

          if(notEmpty(companySubscription.trial_start)){
            this.subscriptionDetails.trial_start_date = formatUnixTimestampToDate(companySubscription.trial_start);
          }

          if(notEmpty(companySubscription.start_date)){
            this.subscriptionDetails.trial_end_date = formatUnixTimestampToDate(companySubscription.trial_end);
          }
        }
        else{
            this.subscriptionDetails.plan_subscription_date = null;
            this.subscriptionDetails.trial_start_date = null;
            this.subscriptionDetails.trial_end_date = null;
        }

        if (notEmpty(companyInvoices)) {
          companyInvoices.forEach((element: invoiceSubscription) => {
            if (element.status === "paid") {


              if (element.invoice.amount_paid !== null) {
                this.subscriptionDetails.amount_paid = (this.subscriptionDetails.amount_paid ?? 0) + element.invoice.amount_paid;
              }

              this.subscriptionDetails.timeStampsAmount[String(element.invoice.created)] = {
                  amount_paid: element.invoice.amount_paid,
                  amount_due: element.invoice.amount_due,
                  paid_at: element.invoice.status_transitions.paid_at
              };

              //enter each created at for finding recent latest and oldest(last paid) invoice date
              this.subscriptionDetails.timeStamps.push(element.invoice.created);


            } else if (element.status === "draft") {
              if(notEmpty(element.invoice.due_date)){
                this.subscriptionDetails.current_invoice_payment_due_date =  formatUnixTimestampToDate(element.invoice.due_date);
              }
              this.subscriptionDetails.current_invoice_payment_amount =  element.invoice.amount_due;
            }

          });

          if(this.subscriptionDetails.timeStamps.length > 0){
            // Find the earliest (oldest) timestamp
            const oldestInvoice = String(Math.min(...this.subscriptionDetails.timeStamps));
            const lastInvoice = this.subscriptionDetails.timeStampsAmount[oldestInvoice];
            this.subscriptionDetails.last_invoice_amount = lastInvoice.amount_paid;

            if(notEmpty(lastInvoice.paid_at)){
              this.subscriptionDetails.last_payment_date = formatUnixTimestampToDate(lastInvoice.paid_at);
            }
            console.log(lastInvoice)
          }
          else{
            this.subscriptionDetails.last_invoice_amount = null;
            this.subscriptionDetails.last_payment_date = null;
          }

          console.log(this.subscriptionDetails)
        }
        else{
          this.subscriptionDetails.amount_paid = null;
          this.subscriptionDetails.current_invoice_payment_amount =  null;
          this.subscriptionDetails.current_invoice_payment_due_date = null;
          this.subscriptionDetails.last_invoice_amount = null;
          this.subscriptionDetails.last_payment_date = null;
        }
        //

        if (!fromPaginateButton && decrypted_data && table_type !== "inActive") {
          this.UseUpdatedResponse(decrypted_data);
        } else if (table_type === "inActive") {
          this.updatedResponseForInActiveUsersTable(decrypted_data);
          this.paginateSpinner = false;
        } else if (table_type === "invited") {
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
      },
      (error) => {
        this.showSpinner = false;
        this.paginateSpinner = false;
        //error() callback
        console.error('Request failed with error', error);
      });
  }


  onFileChange(event: any) {

    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);//readAsBinaryString(file);
    }
  }

  handleReaderLoaded(event: any) {
    let imageFile = 'data:image/png;base64,' + btoa(event.target.result)//this.handleReaderLoaded.bind(this);
    this.base64Image = imageFile;
    this.imageUrl = imageFile;
    this.cdr.detectChanges();

  }

  clearImage() {
    this.imageUrl = '';
  }

  editCompanySave(company: Company) {
    //instead of fetch companies list added updated company data in this array so without reload if user try to edit same company so it he will get latest updated data
    if (this.companyDetailArray !== undefined && this.companyDetailArray[company.id] !== undefined) {
      company = this.companyDetailArray[company.id];
    }
    console.log('c data', company)
    this.CompanyDetail.company_id = company.id;
    this.CompanyDetail.company_initial = company.company_initial;
    this.imageUrl = company.logo ? this.liveImagesUrl + company.logo : '';

    this.editCompanyForm.get('title')?.patchValue(company.title);
    this.editCompanyForm.get('gracePeriod')?.patchValue(company.grace_period);
    this.editCompanyForm.get('payment_status')?.patchValue(company.payment_status);
  }

  @ViewChild('closeBtn') closeBtn!: ElementRef;

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
      let decrypted_data: any = null
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_data)
          this.editCompanyForm.reset();
          this.imageUrl = "";
          this.closeBtn.nativeElement.click();
          this.updateCompanyFlag = false;
          if (this.CompanyDetail.company_id !== undefined) {
            this.companyDetailArray[this.CompanyDetail.company_id] = decrypted_data.company;
          }
        },
        (error) => {
          this.updateCompanyFlag = false;
          //error() callback
          console.error('Request failed with error', error);
        });
    } else {
      console.log(this.editCompanyForm.controls)
    }


  }


  get formControl() {
    return this.editCompanyForm.controls;
  }


    protected readonly moduleIds = moduleIds;
    protected readonly checkPermission = checkPermission;
}





