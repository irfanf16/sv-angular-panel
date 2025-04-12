import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {AppComponent} from "../app.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {HttpClientRequestService} from "../services/http-client-request.service";
import {EncryptDecryptService} from "../services/encrypt-decrypt.service";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {NgxPaginationModule} from "ngx-pagination";
import {
  SearchableMultiselectDropdownComponent
} from "../Components/UI/searchable-multiselect-dropdown/searchable-multiselect-dropdown.component";
import {checkPermission, notEmpty} from "../util";
import {HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environments";
import {PlansConfiguration} from "../Components/constants/plan_&_packages/plans/plans";
import {SpinnerComponentComponent} from "../Components/UI/spinner-component/spinner-component.component";
import {map, Observable, of} from "rxjs";
import {ToggleButtonComponent} from "../Components/UI/toggle-button/toggle-button.component";
import {IServerResponse} from "../Components/interfaces/plan_&_packages/plan-listing/plan-listing";
import {catchError} from "rxjs/operators";
import {RoleAndPermissionsConfig} from "../Components/constants/settings/role_&_permissions/role_&_permissions";
import {UsersConfig} from "../Components/constants/users/users";
import {BreadcrumbService} from "../services/breadcrumb.service";
import {ToastMessagesComponent} from "../Components/messages/toast-messages/toast-messages.component";
import {moduleIds} from "../Components/project_resources/modules";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";


interface SubPermission {
  id: number;
  name: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
interface Permission {
  id: number;
  name: string;
  description: string;
  group: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  subPermissions: SubPermission[];
}
interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}
interface User {
  id: number;
  email: string;
  activated: number; // 1 or 0, could be a boolean if needed
  superuser: number; // 1 or 0, could be a boolean if needed
  privacy_policy_accepted: number; // 1 or 0, could be a boolean if needed
  first_name: string;
  last_name: string;
  phone: string | null;
  locale: string | null;
  street: string | null;
  number: string | null;
  box: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  preferences: string | null; // Assuming it's a string, modify if it's an object
  api_token: string;
  email_verified_at: string; // Could be Date if you want to handle it as a Date object
  created_at: string; // Could be Date
  updated_at: string; // Could be Date
  roles?:any[]
}


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgxPaginationModule,
    ReactiveFormsModule,
    SearchableMultiselectDropdownComponent,
    SpinnerComponentComponent,
    ToggleButtonComponent,
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  userForm: FormGroup;

  showSpinner:boolean = false;

  baseURL: string = environment.apiBASEURL;

  roles: Role[] = [];

  inputValue: string = '';
  imageUrl: string = '';
  imageViewUrl: SafeUrl = '';

  typingTimer: any;
  typingTimerfeature: any;

  showListingSpinner:boolean = false;
  edit:boolean = false;
  hasClicked: boolean = false;

  user_id:number = 0;
  doneTypingInterval: number = 500;
  perPage: number = 20;
  totalUsers: number = 0;
  totalinActiveUsers: number = 0;
  usersCurrentPage: number = 1;
  usersCurrentInActivePage: number = 1;

  activeUsers$: Observable<User[]> = new Observable<User[]>();
  inActiveUsers$: Observable<User[]> = new Observable<User[]>();

  @ViewChild('closeBtn') closeBtn!: ElementRef;

  constructor(private sanitizer : DomSanitizer ,private toastMessages: ToastMessagesComponent ,private breadcrumbService: BreadcrumbService, private el: ElementRef,private appComponent: AppComponent, private fb: FormBuilder, private httpClientRequest: HttpClientRequestService, private encryptDecrypt: EncryptDecryptService, private cdr: ChangeDetectorRef) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.userForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      phone: [''],
      password: [''],
      password_confirmation: [''],
      street: [''],
      numberForm: [''],
      box: [''],
      postal_code: [''],
      city: [''],
      country: [''],
      locale: [''],
      roles: [''],
      device: [''],
      superuser: [false],
      activated: [false]

    });

  }

  ngOnInit(){
    this.breadcrumbService.setBreadcrumbs(UsersConfig.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(UsersConfig.COMP_NAME);
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');

    this.rolesListing();
    this.usersListing();
  }
  rolesListing(){
    let URL = this.baseURL + 'api/roles?fields[roles]=id,name&locale=fr&page=1&per_page='+1000+'&sort=name';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {};
    let method = "GET";
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          if(notEmpty(decrypted_response.data)){
            this.roles = decrypted_response.data;
            console.log(decrypted_response.data)
          }else{}

        }
      },
      (error) => {
      });
  }

  usersListing(activeFlag: string = 'active', search:string = ''){
    let URL = this.baseURL + 'api/roles_list?page='+1;
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body:{limit:number, active: number, search?: string} = {
      limit: this.perPage,
      active: activeFlag === 'active'? 1 : 0
    };

    if(notEmpty(search)){
      body.search = search;
    }
    let method = "POST";
    this.showListingSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response, activeFlag)
          if(notEmpty(decrypted_response.data)){
            if(activeFlag === "active"){
              this.updateActiveUserData(decrypted_response.data, decrypted_response.total);
            }
            else{
              this.updateInActiveUserData(decrypted_response.data, decrypted_response.total);
            }

          }
          else{
            if(activeFlag === "active") {
              this.activeUsers$ = of([]);
              this.usersCurrentPage = 1;
              this.totalUsers = 0;
              this.cdr.detectChanges();
            }else{
              this.inActiveUsers$ = of([]);
              this.usersCurrentInActivePage =1;
              this.totalinActiveUsers = 0;
              this.cdr.detectChanges();
            }
          }
        }
        this.showListingSpinner = false;
      },
      (error) => {
        this.showListingSpinner = false;
      });
  }
  addUser(){
    this.edit = false;
    this.userForm.reset();
  }
  updateActiveUserData(data:User[], total: number,updateCurrentPage: any = ''){
    this.activeUsers$ = of(data);
    this.usersCurrentPage = notEmpty(updateCurrentPage) ? parseInt(updateCurrentPage) :  1;
    this.totalUsers = total;
  }
  updateInActiveUserData(data:User[], total: number, updateCurrentPage: any = ''){
    this.inActiveUsers$ = of(data);
    this.usersCurrentInActivePage = notEmpty(updateCurrentPage) ? parseInt(updateCurrentPage) :  1;
    console.log('in Active users')
    this.totalinActiveUsers = total;
  }
  userFormSubmit(){
    if(this.userForm.valid){
      console.log(this.userForm.value)
      const formData = this.userForm.value;

      formData.activated = formData.activated ===  true ? 1 : 0;
      formData.superuser = formData.superuser ===  true ? 1 : 0;
      formData.checked_roles = [parseInt(formData.roles)];
      formData.number = formData.numberForm;
      formData.image = this.imageUrl;
      if(this.edit){
        formData.id = this.user_id;
      }
      if(!notEmpty(formData.password)){
        formData.password = null;
      }
      if(!notEmpty(formData.password_confirmation)){
        formData.password_confirmation = null;
      }

      if(formData.numberForm !== undefined){
        delete formData.numberForm;
      }
      if(formData.roles !== undefined){
        delete formData.roles;
      }
      console.log('formData', formData)
      this.showSpinner = true;
      let URL = this.baseURL +  (this.edit ? 'api/users/'+this.user_id : 'api/users');
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = formData;
      let method = this.edit ? "PUT" : "POST";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            this.userForm.reset();
            this.userForm.patchValue({
              roles: ''
            });
            this.closeBtn.nativeElement.click();
            this.usersListing('active');
            console.log(decrypted_response)
          }
          this.showSpinner = false;
          this.edit = false;
        },
        (error) => {
          this.showSpinner = false;
          this.edit =  false;
        });
    } else{
      console.log(this.userForm.errors)
    }
  }
  makeResetData(){
    this.edit = false;
  }
  async userToggleButton(isChecked: boolean, user_id: number, type: string) {
    if (!checkPermission(moduleIds.plans, 'update')) {
      if (!this.hasClicked) {
        this.hasClicked = true;
        this.toastMessages.showToast('', 'You do not have the required authorization.', 'error');

        setTimeout(() => {
          const currentClickedToggleLabel = this.el.nativeElement.querySelector("#user_" + user_id);
          currentClickedToggleLabel.click();
          this.hasClicked = false; // Reset flag
        }, 300);
      }
      return;
    }

    if (!isChecked) {
      // this.isCheckedLocked = isChecked;
      let result = await this.toastMessages.showConfirmationDialog('Yes, Deactivate it!');

      //re-active toggle button because user denied to deactivate plan
      if (!result) {
        const currentClickedToggleLabel = this.el.nativeElement.querySelector("#user_" + user_id);
        currentClickedToggleLabel.click();
        this.cdr.detectChanges();
      } else {
        this.updatePlanStatus(String(user_id), isChecked, type);
      }

    } else {
      console.log('entered in wrong area')//
      const activeTab = this.el.nativeElement.querySelector("#active-tab");
      if (!activeTab.classList.contains('active')) {
        this.updatePlanStatus(String(user_id), isChecked, type);
      }
    }
  }
  updatePlanStatus(user_id: string, isChecked: boolean, type: string) {
    let URL = this.baseURL + 'api/updateStatus';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      status: isChecked ? 1 : 0,
      id: parseInt(user_id)
    };
    let method = "POST";
    this.showListingSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          this.usersListing(type);

        }
      },
      (error) => {
        this.showListingSpinner = false;
      });
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

  clearImage() {
    this.imageUrl = '';
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
    this.imageUrl = 'data:image/png;base64,' + btoa(event.target.result);

  }

  async deleteUser(user_id:number, type:string){
    console.log('yes')
    let result = await this.toastMessages.showConfirmationDialog('Yes, Delete it!');
    if(result){
      let URL = this.baseURL + 'api/deleteUsers/'+ user_id;
      let headers = new HttpHeaders(RoleAndPermissionsConfig.Role_AND_Permissions_HEADER);
      let body = {};

      this.showListingSpinner = true;
      let method = "DELETE";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_response)
            this.usersListing(type);
          }


        },
        (error) => {

          this.showListingSpinner = false;
        });
    }
  }

  onStoppedTyping() {
    console.log('current search value', this.inputValue)
    let activeFlag = "inActive";
    const activeTab = this.el.nativeElement.querySelector("#active-tab");
    if (activeTab.classList.contains('active')) {
      activeFlag = "active"
    }
    this.usersListing(activeFlag, this.inputValue)
  }

  editUser(user_id: number){
console.log('user_id ggg',user_id)
    if(!checkPermission(moduleIds.users, 'update')){
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error');
      return;
    }

    let URL = this.baseURL + 'api/users/'+user_id;
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {};
    let base_url:string = '';

    // let activeFlag = "inActive";
    // const activeTab = this.el.nativeElement.querySelector("#active-tab");
    // if (activeTab.classList.contains('active')) {
    //   activeFlag = "active"
    // }


    this.edit =  true;
    this.user_id = user_id;
    let method = "GET";
    this.showListingSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          this.imageUrl = decrypted_response.image;//).replaceAll('//','/');
          console.log('base img url', this.imageUrl)
          this.userForm.patchValue({
            first_name: decrypted_response.first_name,
            last_name: decrypted_response.last_name,
            email: decrypted_response.email,
            phone: decrypted_response.phone,
            password: [''],
            password_confirmation: [''],
            street: decrypted_response.street,
            numberForm: decrypted_response.number,
            box: decrypted_response.box,
            postal_code: decrypted_response.postal_code,
            city: decrypted_response.city,
            country: decrypted_response.country,
            locale: decrypted_response.locale,
            roles: decrypted_response.roles,
            device: decrypted_response.device,
            superuser: decrypted_response.superuser === 1,
            activated: decrypted_response.activated === 1
          });
        }
        this.showListingSpinner = false;
      },
      (error) => {
        this.showListingSpinner = false;
      });
  }
  getPage(page: number) {

    this.serverCall(page, this.totalUsers, this.perPage).subscribe({

      next: (res: any) => {

        let resultData: User[]= res.items.length > 0 ? res.items : [];

        let activeFlag = "inActive";
        const activeTab = this.el.nativeElement.querySelector("#active-tab");
        if (activeTab.classList.contains('active')) {
          activeFlag = "active"
        }
        if(activeFlag === "active"){
          this.updateActiveUserData(resultData, res.total, page);
        }
        else{
          this.updateInActiveUserData(resultData, res.total,page);
        }

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

    let URL = this.baseURL + 'api/roles_list?page='+page;
    let headers: HttpHeaders = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "limit": this.perPage,
    };
    let method: string = "POST";

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

  protected readonly checkPermission = checkPermission;
  protected readonly moduleIds = moduleIds;
}
