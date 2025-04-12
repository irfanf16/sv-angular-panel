import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {
  Body,
  Category,
  CategoryPlan,
  Feature,
  IServerResponse,
  Metadata,
  Module,
  Price,
  PrincePerUnitOrOneTimeObject,
  Tiere,
  tieredPriceObject, CompanyDetails
} from '../../Components/interfaces/plan_&_packages/plan-listing/plan-listing';

import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environments";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject , map, Observable, of, switchMap} from "rxjs";
import {catchError} from "rxjs/operators";
import {formatDate} from "@angular/common";
import {PlansConfiguration} from "../../Components/constants/plan_&_packages/plans/plans";
import {checkPermission, notEmpty} from "../../util";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {moduleIds as m_Ids} from "../../Components/project_resources/modules";



// Custom validator function to check uniqueness
@Component({
  selector: 'app-plans-listing',
  templateUrl: './plans-listing.component.html',
  styleUrls: ['./plans-listing.component.css']
})


export class PlansListingComponent {

  @ViewChild('target') target!: ElementRef;

  @Input() placement: string | undefined;

  items: any[] = [];
  item =  'keyword';
  // Strings
  tieredPriceCheck: string = "Tiered Pricing";
  oneTimeAllUsersCheck: string = "One Time(All Users)";
  baseURL: string = environment.apiBASEURL;
  discountType: string = '';
  price_type: string = '';
  planID: string = '';
  activeFlag: string = '';
  stripe_id: string = '';
  resultDataMetadataAddOns: string = '';
  inputValue: string = '';
  inputValuefeature: string = '';
  base64Image: string = '';
  imageUrl: string = '';
  categoryFilterValue: string = '';


// Booleans
  hasClicked: boolean = false;
  showErrors: boolean = false;
  displayCategoryBlock: boolean = false;
  prorationDisabled: boolean = false;
  planActiveSubscriptionAttached: boolean = false;
  tt: boolean = false;
  enableDisableUsers: boolean = false;
  controlPerUserAndOneTimeBlock: boolean = false;
  addonsTab: boolean = true;
  featuresTab: boolean = true;
  paginateSpinner: boolean = false;
  edit: boolean = false;
  submitSpinner: boolean = false;
  hideFieldsInCaseOfCategoryIsOneTimeAllUsersType: boolean = true;
  contentLoading: boolean = false;
  isDragEnabled: boolean = true;
  displayCategoryFilterClear: boolean = false;

// Numbers
  proration: number = 0;
  totalActivePlans: number = 0;
  totalInActivePlans: number = 0;
  activePlansCurrentPage: number = 1;
  inActivePlansCurrentPage: number = 1;
  p2: number = 1;
  perPage: number = 20;
  discountMinRange: number = 0;
  discountMaxRange: number = 0;
  doneTypingInterval: number = 500;
  selectedFeaturesArray: number[] = [];
  availableOptions: any[][] = [];


// Arrays
  isCheckedLocked: boolean[] = [];
  planActivePricesOrNot: boolean = false;
  categories: Category[] = [];
  features: Feature[] = [];
  featuresIdIndexed: Feature[] = [];
  categoryFrequency: string[] = [];
  inputs: { value: string, visible: boolean }[] = [{value: '', visible: false}];
  featureRows: string[] = [];
  pricesIds: string[] = [];
  Modules: Module[] = [];
  modulesIndexed: [] = [];
  moduleIds: number[] = [];
  selectedFeatures: number[] = [];
  addOns: any[] = [];
  resultDataModules: any[] = [];
  resultDataModuleFeaturesList: any[] = [];
  skills: number[] = [];
  categoriesPlans: number[][] = [];
  planIds: string[] = [];
  plansDataWithActiveSubscriptions: { [key: string]: boolean } = {};
  deletedPricesPlanIds: string[] = [];

// Objects
  multiDimensionalFrequencyObject: { [key: string]: string[] } = {
    'month': [''],
    'year': [''],
    'quarterly': [''],
    'bi-annually': ['']
  };
  public createPlanForm: FormGroup;

  planData:any[] = [];
// Observables
  activePlans$: Observable<any> = new Observable<any>();
  inActivePlans$: Observable<any> = new Observable<any>();

// Any
  typingTimer: any;
  typingTimerfeature: any;


  constructor(private appComponent: AppComponent, private breadcrumbService: BreadcrumbService, private cdr: ChangeDetectorRef, private httpClientRequest: HttpClientRequestService,
              private encryptDecrypt: EncryptDecryptService, private toastMessages: ToastMessagesComponent, private formBuilder: FormBuilder, private elementRef: ElementRef) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.createPlanForm = this.formBuilder.group({
      isallModulesSelected: [false],
      planTitle: ['', [Validators.required]],
      packageCategory: ['', [Validators.required]],
      is_popular: ['', [Validators.required]],
      trial: [''],
      trial_value: [''],
      trial_period: ['day'],
      billing_type: ['', [Validators.required]],
      category_type: ['', [Validators.required]],
      basePrice: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]+)?$')]],
      currency: ['USD$'],
      userInclude: [''],
      minUser: [''],
      maxUser: [''],
      prices: this.formBuilder.array([]),

      tiered_price: this.formBuilder.group({
        // Initialize with an empty FormGroup for each day
        day: this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]) // defining 'day' as a FormArray
        ,
        week: this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]) // defining 'day' as a FormArray
        ,
        month: this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]),
        "bi-annually": this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]) // defining 'day' as a FormArray
        ,
        quarterly: this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]) // defining 'day' as a FormArray
        ,

        year: this.formBuilder.array([
          this.formBuilder.group({
            paymentFrequency: [null],
            minRange: [null],
            maxRange: [null],
            discountType: [null],
            discount: [null],
            discountPrice: [null],
          })
        ]), // defining 'day' as a FormArray
        "bi-annuallyWiseInfinity": [null],
        quarterlyWiseInfinity: [null],
        monthWiseInfinity: [null],
        yearWiseInfinity: [null]

      }),
      modules: this.formBuilder.group({}),
      features: this.formBuilder.array([
        // this.formBuilder.group({
        //   type: [''],
        //   feature: [''],
        //   rule: ['']
        //
        // })
        //,{ validator: uniqueSkillValidator }
      ]),
      addons: this.formBuilder.array([]),
      "bi-annuallyPriceId": [null],
      quarterlyPriceId: [null],
      monthPriceId: [null],
      yearPriceId: [null],
      oneTimePriceId: [null]

    });

  }


  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs(PlansConfiguration.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(PlansConfiguration.COMP_NAME);
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/planPackages.svg');
    this.cdr.detectChanges();
    // this.createPlanForm.get('features')?.disable();
    this.planListing();
    // this.getCategories();


  }

  // New BehaviorSubject to store the reordered plans
  private sortedPlansSource = new BehaviorSubject<any[]>([]);
  sortedPlans$ = this.sortedPlansSource.asObservable(); // Expose this Observable to the template

  drop(event: CdkDragDrop<string[]>) {

      const plansCopy = [...this.planData];
      moveItemInArray(this.planData, event.previousIndex, event.currentIndex);
      this.updateSortedPlans(this.planData); // Call a method to handle the sorted data



  }
  // Method to handle what you want to do with the sorted plans
  updateSortedPlans(sortedPlans: any[]) {
    // Here, sortedPlans contains the newly sorted data
    console.log('Sorted Data:', sortedPlans);
    // You can assign it back to the observable, save it to the server, etc.
    // this.activePlans$ = of(sortedPlans);  // Updating the observable with sorted data
    const result: { stripe_id: string, index: number }[] = sortedPlans.map((product: any, index: number) => ({
      stripe_id: product.product.id,
      index: index + 1
    }));
    const conditions: string[] = sortedPlans.map((product: any, index: number) => (
      product.product.id
    ));


    console.log(result, conditions);

    let URL = this.baseURL + 'api/plans_update_plan_sorting';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body: { data_to_sorted: { stripe_id: string; index: number}[],  stripe_ids: string[], category_id: string} = {
      data_to_sorted: result,
      stripe_ids: conditions,
      category_id: String(this.categoryFilterValue)
    };

    let method = "PUT";
    this.paginateSpinner = true;

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          this.toastMessages.showToast('', 'Plan sorting updated successfully');
        }
        this.dmenu.nativeElement.classList.remove("show");
        this.paginateSpinner = false;
      },
      (error) => {
        this.paginateSpinner = false;
        this.dmenu.nativeElement.classList.remove("show");
      });
  }

  makeDataArraysEmpty() {
    this.createPlanForm.reset();
    let array: string[] = ['month', 'bi-annually', 'quarterly', 'year'];
    const grp = this.formBuilder.group({
      paymentFrequency: [null],
      minRange: [null],
      maxRange: [null],
      discountType: [null],
      discount: [null],
      discountPrice: [null],
    });

    array.forEach((element: string) => {
      (this.createPlanForm.get('tiered_price.' + element) as FormArray).clear();
      (this.createPlanForm.get('tiered_price.' + element) as FormArray).push(grp);
      this.multiDimensionalFrequencyObject[element] = [''];
    });

    (this.createPlanForm.get('features') as FormArray).clear();
    this.displayCategoryBlock = false;
    this.cdr.detectChanges();

    this.addOns = [];
    this.features = [];
    this.Modules = [];

    this.edit = false;
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

  }

  clearImage() {
    this.imageUrl = '';
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
    console.log('current search value', this.inputValue)

    const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
    this.activeFlag = "inActive";
    if (activeTab.classList.contains('active')) {
      this.activeFlag = "active"
    }

    if (this.activeFlag === 'active') {
      this.activePlansCurrentPage = 1;
      this.planListing('active', this.inputValue)
    } else {
      // Perform the search or trigger the request here
      if (this.activeFlag !== "") {
        this.inActivePlansCurrentPage = 1;
        this.planListing('inActive', this.inputValue)
      }
    }
  }

  onKeyUpModules(event: any) {
    clearTimeout(this.typingTimerfeature);
    this.typingTimerfeature = setTimeout(() => {
      // Call your action method here
      this.onStoppedTypingModules();
    }, this.doneTypingInterval);

    // Update the input value
    this.inputValuefeature = event.target.value;
  }

  onStoppedTypingModules() {

    this.fetchModules(this.inputValuefeature);
  }


  //<!-- Start Listing -->

  planListing(tabType: string = 'active', search: string = '', category_id: string = '') {
    let URL = this.baseURL + 'api/local/plans?page=1';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body: { metadata: { public: string; type: string, category ?: string }; search: string; limit: number } = {
      limit: this.perPage,
      metadata:
        {
          public: tabType === "active" ? "1" : "0",
          type: "plans"
        },
      /*"prices":
        {
          // "billing_scheme": "per_unit"
        },*/
      search: search
    };
    if(notEmpty(category_id)){
      body.metadata.category = String(category_id);
    }

    let method = "POST";
    this.paginateSpinner = true;

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));

          let resultData: any[] = decrypted_response.data.length > 0 ? decrypted_response.data : [];
          if (resultData.length > 0) {

            if(notEmpty(category_id)){
              resultData.sort((a, b) => a.sort_by - b.sort_by);
            }

            console.log('plan listing resultData', resultData);
            resultData.forEach((element: any, index: number) => {
              this.planIds.push(element.product.id);
              let priceArray = JSON.parse(element.pricesstatus);
              element.pricesstatus = priceArray.length > 0 ? priceArray.every((value: boolean) => value) : false;
              if (this.isCheckedLocked[index] === undefined) {
                this.isCheckedLocked[index] = false;
              }
              this.isCheckedLocked[index] = element.product.metadata.public === '1' ? true : false;

            });
            console.log('this.planIds', this.planIds)
            this.findIfActiveSubscriptionAttachedWithPlan(this.planIds);
          }
          console.log(resultData)
          if (tabType === "active") {
            if (decrypted_response.data.length > 0) {
              this.activePlans$ = of(resultData);
              this.planData = resultData;
              this.totalActivePlans = decrypted_response.total;
            } else {
              this.activePlans$ = of([]);
              this.planData = [];
              this.totalActivePlans = 0;
            }
            this.activePlansCurrentPage = 1;
            this.activeFlag = "active";
          } else {
            if (decrypted_response.data.length > 0) {
              this.planData = resultData;
              this.inActivePlans$ = of(resultData);
              this.totalInActivePlans = decrypted_response.total;
            } else {
              this.inActivePlans$ = of([]);
              this.planData = [];
              this.totalInActivePlans = 0;
            }

            console.log('this.inActivePlans$', resultData)
            this.inActivePlansCurrentPage = 1;
            this.activeFlag = "inActive";
          }
        }
        this.dmenu.nativeElement.classList.remove("show");
        this.paginateSpinner = false;
      },
      (error) => {
        this.paginateSpinner = false;
        this.dmenu.nativeElement.classList.remove("show");
      });
  }

  findIfActiveSubscriptionAttachedWithPlan(planIds: string[]) {
    let URLSubscription = this.baseURL + 'api/company/search/subscriptions';
    let bodySubscription = {
      plan_id: planIds
    };
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let methodSubscription = "POST";

    this.httpClientRequest.initiateHttpRequest(URLSubscription, bodySubscription, headers, methodSubscription).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          if (decrypted_response.data.length > 0) {
            decrypted_response.data.forEach((element: CompanyDetails, index: number) => {
              console.log(this.planIds.includes(String(element.plan_id)), element.plan_id)
              if (this.planIds.includes(String(element.plan_id))) {
                if (this.plansDataWithActiveSubscriptions[element.plan_id] === undefined) {
                  this.plansDataWithActiveSubscriptions[element.plan_id] = true
                } else {
                  this.plansDataWithActiveSubscriptions[element.plan_id] = true
                }
              } else {
                if (this.plansDataWithActiveSubscriptions[element.plan_id] === undefined) {
                  this.plansDataWithActiveSubscriptions[element.plan_id] = false
                } else {
                  this.plansDataWithActiveSubscriptions[element.plan_id] = false
                }
              }
            });
          }
          console.log('subscription data', this.plansDataWithActiveSubscriptions)

        }
      },
      (error) => {
      });
  }

  makeUniqueAndCountLength(arr: any[]) {
    if (arr !== undefined && arr !== null && arr.length > 0) {
      const uniqueArr = Array.from(new Set(arr));
      return uniqueArr.length;
    } else {
      return 0;
    }

  }

  getPage(page: number) {

    this.serverCall(page, this.totalActivePlans, this.perPage).subscribe({

      next: (res: any) => {
        this.totalActivePlans = res.total;
        let resultData: any[] = res.items.length > 0 ? res.items : [];
        const parentElement = this.elementRef.nativeElement.querySelector('#active-tab');

        if (parentElement && this.hasClass(parentElement, 'active')) {
          this.activePlansCurrentPage = page;
          this.activePlans$ = of(resultData);
        } else {
          this.inActivePlansCurrentPage = page;
          this.inActivePlans$ = of(resultData);
        }

        if(notEmpty(this.categoryFilterValue)){
          resultData.sort((a, b) => a.sort_by - b.sort_by);
        }

        this.planData = resultData;

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  /**
   * Simulate an async HTTP call with a delayed observable.
   */

  serverCall(page: number, total: number, per_Page: number): Observable<IServerResponse> {


    let status: string = "0";
    const parentElement = this.elementRef.nativeElement.querySelector('#active-tab');

    if (parentElement && this.hasClass(parentElement, 'active')) {
      status = "1"
    }

    let URL = this.baseURL + 'api/local/plans?page=' + page;
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "limit": this.perPage,
      "metadata":
        {
          "public": status,
          "type": "plans"
        },
      "prices":
        {
          // "billing_scheme": "per_unit"
        }
    };

    let method = "POST";

    this.paginateSpinner = true;
    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        if (decryptedData.data.length > 0) {
          this.planIds = [];
          decryptedData.data.forEach((element: any, index: number) => {
            this.planIds.push(element.product.id);
          });
        }

        this.paginateSpinner = false;
        return {
          items: decryptedData.data,
          total: decryptedData.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);

        this.paginateSpinner = false;
        return of({items: [], total: 0});
      })
    );

  }

  formatUnixTimestampToDate(unixTimestamp: number): string {
    // Convert the Unix timestamp (in seconds) to milliseconds
    const date = new Date(unixTimestamp * 1000);

    // Format the date using the formatDate function from Angular
    // The format 'yyyy-MM-dd' specifies the desired date format
    return formatDate(date, 'YYYY-MM-dd', 'en-US');
  }


  async getAddonID(addonID: string) {
    this.planID = addonID;
    let result = await this.toastMessages.showConfirmationDialog('Yes, Delete it!');
    console.log('result', result, this.planID)
    if (result) {
      this.deleteAddon();
    }
  }

  convertNumberToBoolean(value: number): boolean {
    console.log(value === 1)
    return value === 1;
  }

  async planToggleButton(isChecked: boolean, planId: string, index: number, type: string = 'Active') {
    if (!checkPermission(m_Ids.plans, 'update')) {
      if (!this.hasClicked) {
        this.hasClicked = true;
        this.toastMessages.showToast('', 'You do not have the required authorization.', 'error');

        setTimeout(() => {
          const currentClickedToggleLabel = this.elementRef.nativeElement.querySelector("#comp-" + planId);
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
        this.isCheckedLocked[index] = true;
        const currentClickedToggleLabel = this.elementRef.nativeElement.querySelector("#comp-" + planId);
        currentClickedToggleLabel.click();
        this.cdr.detectChanges();
      } else {
        this.updatePlanStatus(planId, isChecked, type);
      }

    } else {
      console.log('entered in wrong area')//
      const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
      if (!activeTab.classList.contains('active')) {
        this.updatePlanStatus(planId, isChecked, type);
      }
    }
  }

  updatePlanStatus(planId: string, isChecked: boolean, type: string) {
    let URL = this.baseURL + 'api/plans_update_product_status';
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "plan_id": planId,
      "status": Number(isChecked),
      "type": "plans"

    };
    let method = "PUT";
    this.paginateSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {

        }

        this.paginateSpinner = false;
      },
      (error) => {
        this.paginateSpinner = false;
      });
    //fetch new plan list
    this.planListing(type);
  }

  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  //delete plan and reference c,ose button of model
  @ViewChild('closeDeletePopup') closeDeletePopup!: ElementRef;
  @ViewChild('openAddModel') openAddModel!: ElementRef;
  @ViewChild('cloneFeature') cloneFeature!: ElementRef;
  @ViewChild('dmenu') dmenu!: ElementRef;
  // @ViewChild('addonsTab') addonsTab!: ElementRef;
  // @ViewChild('featuresTab') featuresTab!: ElementRef;

  deleteAddon() {

    // Show the spinner
    // this.showSpinner = true;

    if (this.planID !== "") {
      let URL = this.baseURL + "api/plans/" + this.planID;
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = "";
      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe(
        (response) => {
          this.paginateSpinner = false;

          this.toastMessages.showToast('', 'Plan successfully deleted', 'success');
          // this.closeDeletePopup.nativeElement.click();
          console.log('flag', this.activeFlag)
          this.activeFlag = "inActive";
          const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
          if (activeTab.classList.contains('active')) {
            this.activeFlag = "active"
          }
          this.planListing(this.activeFlag);
        },
        (error) => {
          //error() callback
          console.log('Request failed with error', error);


        });
    }

  }

  @ViewChild('modalClose') modalClose!: ElementRef;


  getPlanDataForEdit(planId: string, StoppingEdit: string = '') {

    if (!checkPermission(m_Ids.plans, 'update')) {
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error');
      return;
    }
    console.log('plan id ff', planId, StoppingEdit)
    if (StoppingEdit == "1") {
      this.toastMessages.errorToast('', 'Please deactivate plan before editing');
      return;
    }

    if (planId !== "") {

      this.edit = true;

      //initiate categories and after getting single plan data select that category in
      this.openAddModel.nativeElement.click();


      // setTimeout(() => {
      let URL = this.baseURL + 'api/local/product/' + planId;
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = {};
      let method = "GET";

      let URLSubscription = this.baseURL + 'api/company/search/subscriptions';
      let bodySubscription = {plan_id: planId};
      let methodSubscription = "POST";

      this.submitSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (resp) => {
          if (resp.app_data !== undefined) {
            let decrypted_resp = JSON.parse(this.encryptDecrypt.decrypt(resp.app_data));

            this.httpClientRequest.initiateHttpRequest(URLSubscription, bodySubscription, headers, methodSubscription).subscribe(
              (response) => {
                if (response.app_data !== undefined) {
                  let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                  console.log('edit data decrypted', decrypted_response);
                  this.planActiveSubscriptionAttached = decrypted_response.data.length > 0 ? true : false;
                  this.selectedCategoriesInEditMode(decrypted_resp);
                }
                this.submitSpinner = false;
              },
              (error) => {
              });
            //open first tab after save/edit plan
            this.planDetail.nativeElement.click();
          }
          this.submitSpinner = false;
        },
        (error) => {
          this.submitSpinner = false;
        });
    }
  }

  selectedCategoriesInEditMode(decrypted_response: any = null) {

    if (decrypted_response !== null && decrypted_response.product !== undefined) {
      this.createPlanForm.get('packageCategory')?.patchValue(decrypted_response.product.metadata.category);

      const elementToClick = this.elementRef.nativeElement.querySelector('#packageCategory'); // Replace 'yourElementId' with the ID of the element you want to trigger a click on
      if (elementToClick) {
        const event = new MouseEvent('change', {bubbles: true});
        elementToClick.dispatchEvent(event);
      }




      let resultData = decrypted_response.product;

      let name = resultData.name;
      let category = resultData.metadata.category;
      let base_price = resultData.metadata.base_price;
      let minUser = resultData.metadata.minimum_users;
      let maxUser = resultData.metadata.maximum_users;
      let billing_type = resultData.metadata.proration;
      let trial = resultData.metadata.trial;
      let trial_value = resultData.metadata.trial_value;
      let trial_period = resultData.metadata.trial_period_value;
      let userInclude = resultData.metadata.trial_users;
      let is_popular = resultData.metadata.is_popular;
      let base: number = parseInt(base_price);
      let planImage = resultData.images["0"];
      let rangeValidateBasePrice: number = 0;
      if (planImage !== "" && planImage) {
        this.imageUrl = planImage;
      }

      if (decrypted_response.product.prices !== undefined) {
        decrypted_response.product.prices = decrypted_response.product.prices.sort((a: any, b: any) => {

          const getOrder = (interval: any, intervalCount: any) => {
            if (interval === 'month' && intervalCount === 1) return 0;
            if (interval === 'month' && intervalCount === 3) return 1;
            if (interval === 'month' && intervalCount === 6) return 2;
            if (interval === 'year' && intervalCount === 1) return 3;

            return 4; // default order
          };
          return getOrder(a.recurring.interval, a.recurring.interval_count) - getOrder(b.recurring.interval, b.recurring.interval_count);
        });

        this.planActivePricesOrNot = decrypted_response.product.prices.every((price: any) => price.active);
        console.log('this.planActivePricesOrNot', this.planActivePricesOrNot)

      }


      console.log('resultData.prices', decrypted_response.product.prices)

      const fetchPricesIds = (prices: Price[]): string[] => {
        return prices.map((price: Price) => price.id);
      };
      this.pricesIds = fetchPricesIds(resultData.prices);
console.log("this.discountType",this.discountType)
      if (this.discountType === "percentage") {
        this.discountMaxRange = 100;
        rangeValidateBasePrice = 100;
      } else {
        this.discountMaxRange = base_price;
        rangeValidateBasePrice = base_price;
      }

      //trigger dispatch event
      // const elementToClick = this.elementRef.nativeElement.querySelector('#packageCategory'); // Replace 'yourElementId' with the ID of the element you want to trigger a click on
      // if (elementToClick) {
      //   const event = new MouseEvent('change', {bubbles: true});
      //   elementToClick.dispatchEvent(event);
      // }
      //
      // this.createPlanForm.get('packageCategory')?.patchValue(category);
      console.log('resultData', resultData);


      //set all fields value for edit preview
      this.createPlanForm.patchValue({
        planTitle: name,
        basePrice: base_price,
        minUser: minUser,
        maxUser: maxUser,
        billing_type: billing_type,
        trial: trial,
        trial_value: trial_value,
        trial_period: trial_period,
        userInclude: userInclude,
        is_popular: is_popular
      });




      let controlsToDisable: string[] = ['planTitle', 'basePrice', 'minUser', 'maxUser', 'billing_type', 'trial', 'trial_value', 'trial_period', 'userInclude', 'is_popular', 'packageCategory'];
      this.disableFieldsForActiveSubscription(controlsToDisable, this.createPlanForm);

      if (this.planActiveSubscriptionAttached) {
        //disable file upload too
        let fileUpload = this.elementRef.nativeElement.querySelector('.ch_file');
        fileUpload.classList.add('no_event');
      } else {
        //disable file upload too
        let fileUpload = this.elementRef.nativeElement.querySelector('.ch_file');
        if (fileUpload) {
          fileUpload.classList.remove('no_event');
        }
      }

      if (this.price_type === "Per User Price" || this.price_type === "One Time") {
        const prices = decrypted_response.product.prices
        console.log('ppppp', prices)

        if (prices !== undefined && prices.length > 0) {
          const pricesArray = this.createPlanForm.get('prices') as FormArray;

          prices.forEach((element: any, index: number) => {
            console.log('elementData', element)
            //because bi-annually and quarterly replaced with months due to stripe limitations acceptance as month billing
            let dbInterval: string = element.recurring.interval;
            let frequency: string = dbInterval;
            let frequencyForPriceId: string = dbInterval;
            let dbIntervalCount: number = element.recurring.interval_count;

            if (this.price_type !== "One Time") {
              if (dbIntervalCount === 3 && dbInterval === 'month') {
                frequency = 'quarterly_discount';
                frequencyForPriceId = 'quarterly';
              } else if (dbIntervalCount === 6 && dbInterval === 'month') {
                frequency = 'bi-annually_discount';
                frequencyForPriceId = 'bi-annually';
              } else {
                frequency = frequency + '_discount';
              }
            } else {
              frequency = 'one_time_discount';
            }


            // let discountPriceKey = (this.price_type === "One Time" ? 'one_time_discount' : element.recurring.interval + '_discountedPrice');
            pricesArray.at(index).get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);
console.log( element.active === true ? element.metadata[frequency] : '', this.discountMinRange, rangeValidateBasePrice)
            pricesArray.at(index).patchValue({
              discount: element.active === true ? parseInt(element.metadata[frequency]) : '',
              discountPrice: element.active === true ? element.unit_amount / 100 : '',
              // discountPrice: element.metadata[discountPriceKey],
            });

            //if plan attached with active subscriptions then disable all form fields user can't edit them
            if (this.planActiveSubscriptionAttached) {
              pricesArray.at(index).get('discount')?.disable();
            } else {
              pricesArray.at(index).get('discount')?.enable();
            }
            console.log(pricesArray.at(index).get('discount')?.value)
            pricesArray?.updateValueAndValidity();

            if (this.price_type === "One Time") {
              this.createPlanForm.patchValue({oneTimePriceId: element.id});
            } else {
              this.createPlanForm.patchValue({[frequencyForPriceId + 'PriceId']: element.id});
            }
          });
        }
      } else if (this.price_type === this.tieredPriceCheck || this.price_type === this.oneTimeAllUsersCheck) {

        const prices = decrypted_response.product.prices

        if (prices !== undefined && prices.length > 0) {
          const pricesArray = this.createPlanForm.get('tiered_price') as FormGroup;

          let freqIndex = '';
          let upperIndex: number = 0;
          let minRangeValue: number = 0;
          prices.forEach((element: any, index: number) => {


            //because bi-annually and quarterly replaced with months due to stripe limitations acceptance as month billing
            let dbInterval: string = element.recurring.interval;
            let frequency: string = dbInterval;
            let dbIntervalCount: number = element.recurring.interval_count;


            if (dbIntervalCount === 3 && dbInterval === 'month') {
              frequency = 'quarterly';
            } else if (dbIntervalCount === 6 && dbInterval === 'month') {
              frequency = 'bi-annually';
            }

            let freqEdit: string = frequency;
            if (freqEdit === 'monthly' || freqEdit === 'yearly') {
              freqEdit = freqEdit.replaceAll('ly', '');
            }

            const frequencyArray = pricesArray?.get(freqEdit) as FormArray;
            // const frequencyArray = pricesArray?.get(element.recurring.interval) as FormArray;
            let setValueObject: object = {};
            // if (freqIndex !== '' && freqIndex !== element.recurring.interval) {
            if (freqIndex !== '' && freqIndex !== frequency) {
              upperIndex = 0;
              minRangeValue = 0;
            }

            //set id for edit purpose
            // this.createPlanForm.patchValue({[element.recurring.interval+'PriceId']: element.id});
            this.createPlanForm.patchValue({[freqEdit + 'PriceId']: element.id});

            if (element.tiers !== undefined && element.tiers.length > 0) {

              //clear array before creating rows for edited plan
              element.tiers.forEach((ele: any, ind: number) => {

                if (ele.up_to !== null) {
                  //insert new index in frequency Array so on edit all rows will be created if multiple tiered
                  if (upperIndex !== 0) {
                    this.multiDimensionalFrequencyObject[freqEdit].push('');

                    // this.multiDimensionalFrequencyObject[element.recurring.interval].push('');

                    let object: object = {};
                    if (this.price_type === this.tieredPriceCheck) {
                      object = {
                        // paymentFrequency: [element.recurring.interval.toLowerCase()],
                        paymentFrequency: [frequency.toLowerCase()],
                        minRange: [(this.planActiveSubscriptionAttached ? {
                          value: '',
                          disable: true
                        } : ''), [Validators.required]],
                        maxRange: [(this.planActiveSubscriptionAttached ? {
                          value: '',
                          disable: true
                        } : ''), [Validators.required]],
                        discountType: [(this.planActiveSubscriptionAttached ? {
                          value: this.discountType,
                          disable: true
                        } : this.discountType)],
                        discount: [(this.planActiveSubscriptionAttached ? {
                          value: '',
                          disable: true
                        } : ''), [Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]],
                        discountPrice: [(this.planActiveSubscriptionAttached ? {value: '', disable: true} : '')],
                      };
                    }

                    const perUserOrOneTimePriceArray = this.formBuilder.group(object);
                    // const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + element.recurring.interval) as FormArray;
                    const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + frequency) as FormArray;

                    // Push the perUserOrOneTimePriceArray FormGroup into tieredPricesFormArray
                    tieredPricesFormArray.push(perUserOrOneTimePriceArray);

                    this.cdr.detectChanges();

                  }
                  console.log('final tets ', ele)
                  let setValueObject: object = {};
                  if (this.price_type === this.tieredPriceCheck) {
                    setValueObject = {
                      discount: element.active === true ? element.metadata[ele.up_to] : '',
                      discountType: element.metadata[ele.up_to + '_discountType'],
                      discountPrice: element.active === true ? (ele.flat_amount / 100) : '',
                      maxRange: ele.up_to,
                      minRange: minRangeValue + 1
                    };
                  }
                  const control = frequencyArray.at(upperIndex);

                  if (control !== undefined) {
                    control.patchValue(setValueObject);
                    //disable all fields if plan attached with active subscription
                    let controlsToDisable: string[] = ['discount', 'discountType', 'discountPrice', 'maxRange', 'minRange'];
                    this.disableFieldsForActiveSubscription(controlsToDisable, control);
                  }

                  minRangeValue = ele.up_to;
                } else {
                  if (this.price_type === this.tieredPriceCheck) {
                    let keyIndex = frequency + 'WiseInfinity';
                    // let keyIndex = element.recurring.interval + 'WiseInfinity';

                    pricesArray.patchValue({[keyIndex]: element.active === true ? (ele.flat_amount / 100) : ''});
                  } else {
                    // const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + element.recurring.interval) as FormArray;
                    const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + frequency) as FormArray;


                    // Push the perUserOrOneTimePriceArray FormGroup into tieredPricesFormArray
                    tieredPricesFormArray.at(0).get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, 100)]);

                    setValueObject = {
                      discount: element.active === true ? element.metadata['inf'] : '',
                      discountType: element.metadata['inf_discountType'],
                      discountPrice: element.active === true ? (ele.flat_amount / 100) : ''
                    };
                    frequencyArray.at(0).patchValue(setValueObject);

                    //disable all fields if plan attached with active subscription
                    let controlsToDisable: string[] = ['discount', 'discountType', 'discountPrice', 'maxRange', 'minRange'];
                    this.disableFieldsForActiveSubscription(controlsToDisable, frequencyArray.at(0));
                  }
                }

              });
            }
            freqIndex = frequency;
            // freqIndex = element.recurring.interval;
            upperIndex = upperIndex + 1;
          });
        }
      }
      //end check price type and select  values according to it's type
      this.resultDataModules = resultData.modules;
      this.resultDataModuleFeaturesList = resultData.module_features_list;
      this.resultDataMetadataAddOns = resultData.metadata.addons;

      setTimeout(() => {
        const fileUpload: HTMLElement | null = this.elementRef.nativeElement.querySelector('.ch_file');
        if (fileUpload) {
          fileUpload.classList.remove('no_event');
        }
      }, 300);
      console.log('local id', resultData.id)
      //set stripe id
      this.stripe_id = resultData.id;
      // this.prices = resultData.prices;

    }
  }

  disableFieldsForActiveSubscription(controls: string[], FormElement: any) {
    controls.forEach(controlField => {
      if (this.planActiveSubscriptionAttached) {
        FormElement.get(controlField)?.disable();
      } else {
        FormElement.get(controlField)?.enable();
      }
    });
  }

  selectedAddOnsInEditMode() {
    const addOnsFormArray = this.createPlanForm.get('addons') as FormArray;
    if (this.resultDataMetadataAddOns !== undefined && this.resultDataMetadataAddOns !== null) {
      let selectedAddOns = this.resultDataMetadataAddOns.split(',');
      this.addOns.forEach((element: any, index: number) => {
        if (selectedAddOns.includes(String(element.product.id))) {
          const control = addOnsFormArray.at(index);
          control.patchValue({
            [element.product.id]: true
          });

        }
      });
    }
    if (this.planActiveSubscriptionAttached) {
      addOnsFormArray?.disable();
      // this.submitPlanBtn.nativeElement.style.display = 'none';
    } else {
      addOnsFormArray?.enable();
      // this.submitPlanBtn.nativeElement.style.display = 'block';
    }

  }

  selectedFeaturesInEditMode() {

    const featuresFormArray = this.createPlanForm?.get('features') as FormArray;

    let ind: number = 0;
    this.featureRows = [];
    // featuresFormArray.clear();
    if (this.resultDataModuleFeaturesList !== undefined && this.resultDataModuleFeaturesList.length > 0) {

      this.features.forEach((element: any, index: number) => {

        if (this.resultDataModuleFeaturesList.includes(String(element.id))) {

          const control = featuresFormArray.at(ind);

          let type: string = 'Info';
          //key == 2
          if (element.type === 2) {
            type = 'Key';
          }

          let featureDetail: Feature = this.featuresIdIndexed[element.id];


          this.featureRows.push('');
          if (this.inputs[ind] === undefined) {
            this.inputs.push({value: '', visible: true});
          }

          featuresFormArray.push(
            this.formBuilder.group(
              {
                type: type,
                feature: element.id,
                rule: featureDetail.rule
              })
          );


          if (element.type === 1) {
            this.toggleVisibility(ind, false);
          } else {
            this.toggleVisibility(ind, true);
          }

          //add feature id in array that these features added
          this.selectedFeaturesArray[ind] = parseInt(element.id);

          ind = ind + 1;
        }

      });

      this.getAvailableOptions(undefined);

      if (this.planActiveSubscriptionAttached) {
        featuresFormArray?.disable();
      } else {
        featuresFormArray?.enable();
      }
    }
  }

  selectedModulesInEditMode() {

    if (this.resultDataModules !== undefined && this.resultDataModules.length > 0) {
      let titleArray: string[] = [];

      for (const index in this.modulesIndexed) {
        if (Object.prototype.hasOwnProperty.call(this.modulesIndexed, index)) {
          const obj: any = this.modulesIndexed[index];
          if (this.resultDataModules.includes(String(obj.id))) {
            let title = obj.title.toLowerCase().replaceAll(' ', '_');
            titleArray.push(title);
          }
        }
      }
      this.selectModulesInEditOption(true, titleArray);
    }
  }

  disableSingleFieldWithActiveSubscription(control: any, fieldName: any) {
    switch (this.planActiveSubscriptionAttached) {
      case true:
        control.get(fieldName)?.disable();
        break;
      default:
        control.get(fieldName)?.enable();
        break;
    }
  }

  selectModulesInEditOption(flag: boolean, titleArrays: string[]) {

    const Modules = this.createPlanForm.get('modules') as FormGroup;
    Object.keys(Modules.controls).forEach(controlName => {

      //isChecked denoted value of parent module if it is selected then mark all modules selected
      const child2ndModule = Modules.get(controlName) as FormGroup;
      if (titleArrays.includes(controlName)) {
        child2ndModule.patchValue({[controlName]: flag});
        //disable fields if plan have active subscriptions
        this.disableSingleFieldWithActiveSubscription(child2ndModule, controlName);

      } else {
        this.disableSingleFieldWithActiveSubscription(child2ndModule, controlName);
      }


      if (child2ndModule.controls !== undefined && Object.keys(child2ndModule.controls).length > 0) {
        Object.keys(child2ndModule.controls).forEach(control2ndName => {

          //isChecked denoted value of parent module if it is selected then mark all modules selected
          const childModule = child2ndModule.get(control2ndName) as FormGroup;
          if (titleArrays.includes(control2ndName)) {
            childModule.patchValue({[control2ndName]: flag});
            //disable fields if plan have active subscriptions
            this.disableSingleFieldWithActiveSubscription(childModule, control2ndName);
          } else {
            this.disableSingleFieldWithActiveSubscription(child2ndModule, controlName);
          }


          //third level module selection
          if (childModule.controls !== undefined && Object.keys(childModule.controls).length > 0) {
            Object.keys(childModule.controls).forEach(subControlName => {

              //isChecked denoted value of parent module if it is selected then mark all modules selected
              const childThirdModule = childModule.get(subControlName) as FormGroup;
              if (titleArrays.includes(subControlName)) {
                childThirdModule.patchValue({[subControlName]: flag});
                //disable fields if plan have active subscriptions
                this.disableSingleFieldWithActiveSubscription(childThirdModule, subControlName);
              } else {
                this.disableSingleFieldWithActiveSubscription(child2ndModule, controlName);
              }


              if (childThirdModule.controls !== undefined && Object.keys(childThirdModule.controls).length > 0) {
                Object.keys(childThirdModule.controls).forEach(lastControlName => {

                  if (lastControlName !== subControlName) {
                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                    const childFourthModule = childThirdModule.get(lastControlName) as FormGroup;
                    if (titleArrays.includes(lastControlName)) {
                      childFourthModule.patchValue({[lastControlName]: flag});
                      //disable fields if plan have active subscriptions
                      this.disableSingleFieldWithActiveSubscription(childFourthModule, lastControlName);
                    } else {
                      this.disableSingleFieldWithActiveSubscription(child2ndModule, controlName);
                    }

                  }

                });
              }

            });
          }
        });
      }
    });

    if (this.planActiveSubscriptionAttached) {
      console.log('entered')
      this.createPlanForm.get('isallModulesSelected')?.disable();
    } else {
      this.createPlanForm.get('isallModulesSelected')?.enable();
    }

    this.cdr.detectChanges();

  }

  //<!-- End Listing -->

  @ViewChild('tabGroup') tabGroup!: ElementRef;
  @ViewChild('submitPlanBtn') submitPlanBtn!: ElementRef;

  moveToNextTab(tabId: string, trigger_request: string = '') {

    //trigger request according to specific tab id passed
    if (trigger_request === 'attached_modules_tab') {
      this.buttonClicked(tabId);
      this.fetchModules();
      this.featuresTab = false;
    } else if (trigger_request == "fetchFeatures") {

      this.fetchFeatures();
      this.buttonClicked(tabId);
      this.addonsTab = false;
    } else if (trigger_request === "getAddons") {

      this.buttonClicked(tabId);
      this.getAddons();
    }

    //trigger previous tab button
    if (trigger_request === '') {
      this.buttonClicked(tabId);
    }

  }

  buttonClicked(tabId: string) {
    if (tabId !== '' && tabId !== null) {
      const tabButton = this.elementRef.nativeElement.querySelector(`#${tabId}`);
      if (tabButton) {
        tabButton.click();
      }
    }

  }

  fetchModules(search: string = '') {
    if (!this.Modules.length) {
      let URL = '';
      if (search) {
        URL = this.baseURL + 'api/modules?search=' + search;
      } else {
        URL = this.baseURL + 'api/modules';
      }

      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);

      let body = {};
      let method = "GET";
      this.submitSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          let modules = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          if (modules.length > 0) {

            this.Modules = modules;

            this.addModulesInFOrmControls(modules)
            //edit plan true and moduleIndexed  have modules
            setTimeout(() => {
              if (this.edit == true) {
                this.selectedModulesInEditMode();
              } else {
                let titleArray = ['download_client', 'profile_and_permissions', 'general_settings', 'configurations', 'company_settings', 'organization', 'display_settings', 'off_days_calendar'];
                this.selectModulesInEditOption(true, titleArray)
              }
            }, 100);
          }
          this.submitSpinner = false;
        },
        (error) => {
          this.submitSpinner = false;
        });
    }
  }

  addModulesInFOrmControls(modules: any) {

    const modulesArray = this.createPlanForm.get('modules') as FormGroup;

    // Define a recursive function to search for children
    const findChildrenRecursive = (modules: any, path: string = ''): void => {


      for (const child of modules) {

        const specialChars = `/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;`

        const isSpecialCharsPresent = specialChars.split('').some(char => child.title.includes(char));
        let child_title: string = '';
        if (isSpecialCharsPresent) {
          child.title = child.title.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' ');
          child_title = child.title.replaceAll(' ', '_').toLowerCase();
        } else {
          child_title = child.title.replaceAll(' ', '_').toLowerCase();
        }

        // @ts-ignore
        this.modulesIndexed[child_title] = child;


        if (child.children !== undefined && child.children.length == 0) {

          // @ts-ignore
          this.modulesIndexed[child_title] = child;

          if (path !== '') {
            let route = `${path}`;
            const moduleFormGroup = this.formBuilder.group({
              [child_title]: false // Use module name as the key and initialize with default value
            });
            (modulesArray?.get(route) as FormGroup).addControl(child_title, moduleFormGroup);
          } else {
            const moduleFormGroup = this.formBuilder.group({
              [child_title]: false // Use module name as the key and initialize with default value
            });
            modulesArray.addControl(child.title.replaceAll(' ', '_').toLowerCase(), moduleFormGroup);

          }

        } else if (child.children !== undefined && child.children.length > 0) {

          if (path !== '') {
            let route = `${path}`;
            const moduleFormGroup = this.formBuilder.group({
              [child_title]: false // Use module name as the key and initialize with default value
            });
            (modulesArray?.get(route) as FormGroup).addControl(child_title, moduleFormGroup);
          } else {
            const moduleFormGroup = this.formBuilder.group({
              [child_title]: false // Use module name as the key and initialize with default value
            });
            modulesArray.addControl(child_title, moduleFormGroup);
          }


          // controlArray.push(this.formBuilder.group({
          //   module:  new FormControl(false)}
          // ));
          child.children.forEach((element: Module) => {
            let element_title = element.title.replaceAll(' ', '_').toLowerCase();

            // @ts-ignore
            this.modulesIndexed[element_title] = element;

            if (path !== '') {

              let route = `${path}.${child_title}`;

              const moduleFormGroup = this.formBuilder.group({
                [element_title]: false // Use module name as the key and initialize with default value
              });
              (modulesArray?.get(route) as FormGroup).addControl(element_title, moduleFormGroup);
            } else {


              const moduleFormGroup = this.formBuilder.group({
                [element_title]: false // Use module name as the key and initialize with default value
              });
              (modulesArray?.get(child_title) as FormGroup).addControl(element_title, moduleFormGroup);

              // @ts-ignore
              this.modulesIndexed[child_title] = child;


            }

            if (element.children !== undefined && element.children.length > 0) {
              //check if element have children itself then insert in reactive form
              findChildrenRecursive(element.children, child_title + '.' + element_title);
            }
          });


        }
      }
      // Return an empty array if no matching children are found
    }

    // Start the search from the top-level children
    return findChildrenRecursive(modules);
  }

  updateParentAndChildControls(formGroup: FormGroup, controlName: string, isChecked: boolean): void {
    // Update parent control
    const parentControl = formGroup.get(controlName);
    if (parentControl) {
      parentControl.setValue(isChecked);
    }

    // Update child controls
    const childControls = formGroup.controls[controlName] as FormGroup;
    if (childControls) {
      Object.keys(childControls.controls).forEach(key => {
        this.updateParentAndChildControls(childControls, key, isChecked);
      });
    }
  }

  get formControl() {
    return this.createPlanForm.controls;
  }

  getCategories() {

    let decrypted_data: any;
    //if fields already disabled then before new plan addition we need to enable all fields again
    if (!this.edit) {
      this.planActiveSubscriptionAttached = false;
      let controlsToDisable: string[] = ['planTitle', 'basePrice', 'minUser', 'maxUser', 'billing_type', 'trial', 'trial_value', 'trial_period', 'userInclude', 'is_popular', 'packageCategory'];
      this.disableFieldsForActiveSubscription(controlsToDisable, this.createPlanForm);

      // Enable file upload too
      const fileUpload: HTMLElement | null = this.elementRef.nativeElement.querySelector('.ch_file');
      if (fileUpload) {
        fileUpload.classList.remove('no_event');
      }
    }

    // Show the spinner
    // this.showSpinner = true;

    let URL = this.baseURL + "api/categories";
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body = {
      "limit": 1000,
      "fields": [
        "title",
        "description",
        "created_at",
      ]
    };
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('categories', decrypted_data)
        let rv = decrypted_data.products;
        if (rv !== undefined) {
          rv.forEach((element: CategoryPlan) => {

            if (typeof this.categoriesPlans[element.category_id] === 'undefined') {
              this.categoriesPlans[element.category_id] = [];
            }
            if (element.is_popular != null) {
              this.categoriesPlans[element.category_id].push(element.is_popular);
            }
          });
        }

        console.log('all categories decrypted_data:', this.categoriesPlans);
        if (decrypted_data.categories !== undefined) {
          let categories: Category[] = decrypted_data.categories.data;
          this.categories = categories;
          this.items = categories;
          console.log(this.items)
          // this.createPlanForm.reset();

          //edit plan true and moduleIndexed  have modules
          setTimeout(() => {

            if (this.edit) {
              this.selectedCategoriesInEditMode();
            }
            const _temp = this.elementRef.nativeElement.querySelector('.offcanvas-backdrop');
            if(notEmpty(_temp)){
              _temp.addEventListener('click', (event: any) => {
                this.createPlanForm.reset();
                let array: string[] = ['month', 'bi-annually', 'quarterly', 'year'];
                const grp = this.formBuilder.group({
                  paymentFrequency: [null],
                  minRange: [null],
                  maxRange: [null],
                  discountType: [null],
                  discount: [null],
                  discountPrice: [null],
                });
                array.forEach((element: string) => {
                  (this.createPlanForm.get('tiered_price.' + element) as FormArray).clear();
                  (this.createPlanForm.get('tiered_price.' + element) as FormArray).push(grp);
                  this.multiDimensionalFrequencyObject[element] = [''];
                });
                this.displayCategoryBlock = false;
                this.cdr.detectChanges();

                (this.createPlanForm.get('features') as FormArray).clear();


                this.addOns = [];
                this.features = [];
                this.Modules = [];

                this.edit = false;

              });
            }


          }, 100);
        }

      },
      (error) => {
        //error() callback
        console.log('Request failed with error', error);

      });
  }

  selectedCategory(event: any) {
    let selected_category = event.target.value;
    console.log('selected_category',selected_category)
    let basePrice = this.createPlanForm.get('basePrice')?.value;
    const order = ["month", "quarterly", "bi-annually", "year"];


    console.log('basePrice', basePrice)
    if (selected_category) {

      //set category after form reset, because we need to clear validations if category change detected
      const pricesFormArray = this.createPlanForm.get('prices') as FormArray;

      pricesFormArray.clear();


      this.displayCategoryBlock = true;

      this.categories.forEach((element: Category) => {


        if (parseInt(selected_category) === element.id) {
          console.log('element', element.frequency)
          element.frequency = element.frequency.sort((a: any, b: any) => order.indexOf(a) - order.indexOf(b));
          element.frequency = element.frequency.map((item) => {
            if (item === "month" || item === "year") {
              return item + "ly";
            }
            return item;
          });
          this.categoryFrequency = element.frequency
          this.proration = element.proration;

          if (element.discount_type === "fixed") {
            this.discountType = "amount";
            this.discountMaxRange = basePrice;

          } else {
            this.discountType = element.discount_type;
            this.discountMaxRange = 100;
            basePrice = 100;
          }
          console.log('rangeValidateBasePrice16', basePrice)


          if (element.price_type == "per_unit") {

            // pricesFormArray.reset();
            this.price_type = 'Per User Price';

            this.createPlanForm.get('prices')?.enable();
            this.createPlanForm.get('tiered_price')?.disable();

            //if multiple payment frequencies (e.g day, week, monthly) then add each row form control in prices array
            element.frequency.forEach((ele: string, index: number) => {
              pricesFormArray.removeAt(index);
              const perUserOrOneTimePriceArray = this.formBuilder.group({
                paymentFrequency: [ele !== null && ele !== '' ? (ele[0].toUpperCase() + ele.slice(1)) : ''],
                discountType: [this.discountType !== null && this.discountType !== '' ? (this.discountType[0].toUpperCase() + this.discountType.slice(1)) : ''],
                discount: ['', [Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, basePrice)]],
                discountPrice: ['']
              });
              pricesFormArray.push(perUserOrOneTimePriceArray);
            });

            this.controlPerUserAndOneTimeBlock = true;
          } else if (element.price_type == "one_time") {


            this.createPlanForm.get('prices')?.enable();
            this.createPlanForm.get('tiered_price')?.disable();

            //if multiple payment frequencies (e.g day, week, monthly) then add each row form control in prices array
            let object = {
              discountType: [this.discountType !== null && this.discountType !== '' ? (this.discountType[0].toUpperCase() + this.discountType.slice(1)) : ''],
              discount: ['', [Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, basePrice)]],
              discountPrice: ['']
            };
            const perUserOrOneTimePriceArray = this.formBuilder.group(object);
            pricesFormArray.push(perUserOrOneTimePriceArray);
            this.price_type = "One Time";

            this.controlPerUserAndOneTimeBlock = true;

          } else if (element.price_type == "tiers" || element.price_type === "one_time_all_users") {


            //in case of if category is "one_time_all_users" then category type title be "One Time(All Users)"
            if (element.price_type === "one_time_all_users") {
              this.price_type = this.oneTimeAllUsersCheck;
              this.hideFieldsInCaseOfCategoryIsOneTimeAllUsersType = false;
            } else {
              this.price_type = this.tieredPriceCheck;
              this.hideFieldsInCaseOfCategoryIsOneTimeAllUsersType = true;
            }


            this.createPlanForm.get('prices')?.disable();
            this.createPlanForm.get('tiered_price')?.enable();

            //if multiple payment frequencies (e.g day, week, monthly) then add each row form control in prices array
            const tieredPriceFormArray = this.createPlanForm.get('tiered_price') as FormGroup;

            element.frequency.forEach((ele: string, index: number) => {


              let freqTiered: string = ele;
              if (ele === 'monthly' || ele === 'yearly') {
                freqTiered = ele.replaceAll('ly', '');
              }

              if (element.price_type !== "one_time_all_users") {


                //set required validation for infinity user price field
                tieredPriceFormArray.get(freqTiered + 'WiseInfinity')?.setValidators(Validators.required);
              }

              const frequencyArray = tieredPriceFormArray.get(freqTiered) as FormArray;
              console.log('frequencyArray', frequencyArray, freqTiered, this.categoryFrequency)
              frequencyArray.at(0).patchValue({
                paymentFrequency: ele,
                discountType: this.discountType,
                discount: '',
                discountPrice: ''
              });

              //in case of if category is "one_time_all_users" then display will be like tiered price but some fields and their validations will be hidden
              if (element.price_type !== "one_time_all_users") {
                frequencyArray?.at(0)?.get('minRange')?.setValidators(Validators.required);
                frequencyArray?.at(0)?.get('maxRange')?.setValidators(Validators.required);
              }

              frequencyArray?.at(0)?.get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, basePrice)]);
            });
            this.controlPerUserAndOneTimeBlock = false;

          }

          let updatedObject: { category_type: string, billing_type?: number, trial?: number } = {
            category_type: this.price_type
          };

          if (!this.edit) {
            // After this.category_type is assigned a value
            updatedObject.trial = 1;
            updatedObject.billing_type = this.proration
          }

          this.createPlanForm.patchValue(updatedObject);


          this.prorationDisabled = true;

          this.clearInputFields();
          this.cdr.detectChanges();
        }
      });

    }
  }

  clearInputFields() {
    const inputFields = this.elementRef.nativeElement.querySelectorAll('.clear');
    inputFields.forEach((input: HTMLInputElement) => {
      input.value = '';
    });
  }

  controlPriceDiscount(event: any, id: string, basePriceId: string, frequency: string = '', index: number = 0) {
    console.log(frequency)
    if (frequency === 'monthly' || frequency === 'yearly') {
      frequency = frequency.replaceAll('ly', '');
    }

    let discountPercentageValue = event.target.value;
    let discountedPriceSelector = this.elementRef.nativeElement.querySelector('#' + id);
    let basePriceSelector = this.elementRef.nativeElement.querySelector('#' + basePriceId);
    let discountedPrice: number = 0;
    let basePrice: number = this.createPlanForm.get('basePrice')?.value;
    let rangeValidateBasePrice: number = 0;

    if (discountPercentageValue) {
      if (basePriceSelector.value !== null && basePriceSelector.value !== "") {
        if (this.discountType === "percentage") {
          rangeValidateBasePrice = 100;
          this.discountMaxRange = 100;
          discountedPrice = basePriceSelector.value - (basePriceSelector.value * discountPercentageValue / 100);
          discountedPriceSelector.value = discountedPrice;
        } else if (this.discountType === "amount") {
          discountedPrice = basePriceSelector.value - discountPercentageValue;
          discountedPriceSelector.value = discountedPrice;
          rangeValidateBasePrice = basePrice;
        }
        //"quarterly", "bi-annually", "year"
        switch (frequency) {
          case "quarterly":
            discountedPrice = discountedPrice * 3;
            break;
          case "bi-annually":
            discountedPrice = discountedPrice * 6;
            break;
          case "year":
            discountedPrice = discountedPrice * 12;
            break;
        }

        console.log('discountedPrice', discountedPrice, 'freq', frequency)

        //set discountPrice value in reactive forms because other way angular won't identify it
        if (this.price_type === this.tieredPriceCheck || this.price_type === this.oneTimeAllUsersCheck) {
          const tieredPriceFormArray = this.createPlanForm.get('tiered_price') as FormGroup;
          if (index !== undefined) {
            const FrequencyFormArray = tieredPriceFormArray.get(frequency) as FormArray;
            FrequencyFormArray.at(index)?.get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);
            FrequencyFormArray.at(index)?.get('discount')?.updateValueAndValidity();
            FrequencyFormArray.at(index)?.patchValue({
              discountPrice: this.formatDiscountedPrice(discountedPrice),
              discount: discountPercentageValue
            });

          }
        } else {
          const PriceFormArray = this.createPlanForm.get('prices') as FormArray;
          if (index !== undefined) {
            PriceFormArray.at(index)?.get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);
            PriceFormArray.at(index)?.get('discount')?.updateValueAndValidity();
            PriceFormArray.at(index)?.patchValue({
              discountPrice: this.formatDiscountedPrice(discountedPrice),
              discount: discountPercentageValue
            });
          }
        }
      } else {
        event.target.value = '';
        this.toastMessages.showToast('', 'Please enter base price first', 'error')
      }
    } else {
      //set discountPrice value in reactive forms because other way angular won't identify it
      if (this.price_type === this.tieredPriceCheck || this.price_type === this.oneTimeAllUsersCheck) {
        const tieredPriceFormArray = this.createPlanForm.get('tiered_price') as FormGroup;
        if (index !== undefined) {
          const FrequencyFormArray = tieredPriceFormArray.get(frequency) as FormArray;
          FrequencyFormArray.at(index)?.get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);
          FrequencyFormArray.at(index)?.get('discount')?.updateValueAndValidity();
          FrequencyFormArray.at(index)?.patchValue({discountPrice: '', discount: ''});
        }
      } else {
        const PriceFormArray = this.createPlanForm.get('prices') as FormArray;
        if (index !== undefined) {
          PriceFormArray.at(index)?.get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);
          PriceFormArray.at(index)?.get('discount')?.updateValueAndValidity();
          PriceFormArray.at(index)?.patchValue({discountPrice: '', discount: ''})
        }
      }
    }


  }

  // Function to format the price if it's a float (i.e., contains decimal points)
  formatDiscountedPrice(price: any): any {
    if (price != null && price !== '' && typeof price === 'number' && price !== Math.floor(price)) {
      return price.toFixed(2);
    }
    return price;
  }


  controlUserCheckbox(event: any) {
    this.enableDisableUsers = event.target.checked;
    if (this.enableDisableUsers === false) {
      //clear field values if users checkbox unchecked
      this.createPlanForm.patchValue({
        minUser: '',
        maxUser: '',
        userInclude: ''
      });
    }
  }

  cloneRow(frequency: string) {
    let freq: string = frequency;
    if (frequency === 'monthly' || frequency === 'yearly') {
      freq = frequency.replaceAll('ly', '');
    }
    if (this.multiDimensionalFrequencyObject[freq] !== undefined) {
      console.log(frequency)

      let index = this.multiDimensionalFrequencyObject[freq].length;
      //decrement by 1 because array start from  0 index
      let maxNumberId = frequency + 'maxRange_' + (index - 1);
      let maxNumberSelector = this.elementRef.nativeElement.querySelector("#" + maxNumberId);
      console.log('id', maxNumberSelector)
      let basePrice: number = this.createPlanForm.get('basePrice')?.value;
      let rangeValidateBasePrice: number = 0;
      //check discount type is amount or percentage
      if (this.discountType === "percentage") {
        rangeValidateBasePrice = 100;
        this.discountMaxRange = 100;
      } else {
        this.discountMaxRange = basePrice;
        rangeValidateBasePrice = basePrice;
      }
      console.log('rangeValidateBasePrice1', rangeValidateBasePrice)

      if (maxNumberSelector.value !== undefined && maxNumberSelector.value !== "") {
        this.multiDimensionalFrequencyObject[freq].push('');
        const perUserOrOneTimePriceArray = this.formBuilder.group({
          //understand this point, if price type of selected category is "one time" then there will be no frequency like in category creation
          paymentFrequency: [this.price_type === "One Time" ? null : frequency.toLowerCase()],
          minRange: ['', [Validators.required]],
          maxRange: ['', [Validators.required]],
          discountType: [this.discountType],
          discount: ['', [Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]],
          discountPrice: [''],
        });
        const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + freq) as FormArray;

        // Push the perUserOrOneTimePriceArray FormGroup into tieredPricesFormArray
        tieredPricesFormArray.push(perUserOrOneTimePriceArray);
        setTimeout(() => {


          // Retrieve the index of the newly pushed FormGroup
          const newIndex = tieredPricesFormArray.length - 1;

          const newMinRangeControl = tieredPricesFormArray?.at(newIndex)?.get('minRange');

          // Check if newMinRangeControl is not null before accessing the value
          if (newMinRangeControl !== null && newMinRangeControl !== undefined) {

            //assign discount type selection value
            tieredPricesFormArray?.at(newIndex)?.patchValue({discountType: ''});


            const previousFormGroup = tieredPricesFormArray?.at(newIndex - 1);
            const maxRangeControl = previousFormGroup?.get('maxRange');

            // Check if previousFormGroup and maxRangeControl are not null before accessing the value
            if (previousFormGroup !== null && maxRangeControl !== null) {
              const maxRangeValue = maxRangeControl.value;

              //set Previous row maxRange minimum value
              previousFormGroup.setValidators(Validators.min(maxRangeValue));

              //assign new row maxRange filed minimum value
              const newMaxRangeInput = tieredPricesFormArray?.at(newIndex)?.get('maxRange');
              if (newMaxRangeInput !== null && newMaxRangeInput !== undefined)
                newMaxRangeInput.setValidators(Validators.min(maxRangeValue + 1))

              //assign new row minRange minimum value
              newMinRangeControl.setValidators(Validators.min(maxRangeValue + 1));
              // Set the new value for minRange (incrementing maxRange by 1)
              newMinRangeControl.patchValue(maxRangeValue + 1);
            }
          }
        }, 300);
      } else {
        this.toastMessages.showToast('', 'Please enter range values first', 'error');
      }


    }

  }

  isAllModulesSelected(event: any) {
    let checked = event.target.checked;
    let modules = this.elementRef.nativeElement.querySelector('.module-list-box');
    let inputs = modules.querySelectorAll('input[type="checkbox"]');
    if (checked === true) {
      this.selectDeselectAll(true);
      inputs.forEach((ele: any) => {
        ele.checked = true;
      });
      // Trigger change detection
      //
    } else {
      this.selectDeselectAll(false);
      inputs.forEach((ele: any) => {
        ele.checked = false;
      });
    }

  }

  selectDeselectAll(flag: boolean) {

    const Modules = this.createPlanForm.get('modules') as FormGroup;
    Object.keys(Modules.controls).forEach(controlName => {


      //isChecked denoted value of parent module if it is selected then mark all modules selected
      const child2ndModule = Modules.get(controlName) as FormGroup;
      child2ndModule.patchValue({[controlName]: flag});


      if (child2ndModule.controls !== undefined && Object.keys(child2ndModule.controls).length > 0) {
        Object.keys(child2ndModule.controls).forEach(control2ndName => {

          //isChecked denoted value of parent module if it is selected then mark all modules selected
          const childModule = child2ndModule.get(control2ndName) as FormGroup;
          childModule.patchValue({[control2ndName]: flag});


          //third level module selection
          if (childModule.controls !== undefined && Object.keys(childModule.controls).length > 0) {
            Object.keys(childModule.controls).forEach(subControlName => {

              //isChecked denoted value of parent module if it is selected then mark all modules selected
              const childThirdModule = childModule.get(subControlName) as FormGroup;
              childThirdModule.patchValue({[subControlName]: flag})


              if (childThirdModule.controls !== undefined && Object.keys(childThirdModule.controls).length > 0) {
                Object.keys(childThirdModule.controls).forEach(lastControlName => {

                  if (lastControlName !== subControlName) {
                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                    const childFourthModule = childThirdModule.get(lastControlName) as FormGroup;
                    childFourthModule.patchValue({[lastControlName]: flag});

                  }

                });
              }

            });
          }
        });
      }
    });
    this.cdr.detectChanges();

  }

  fetchFeatures() {
    if (!this.features.length) {
      // Code for feature fetching
      let URL = this.baseURL + "api/features?limit=1000";
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = '';
      this.submitSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
        (response) => {
          let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          if (decrypted_data.features !== undefined && decrypted_data.features.data !== undefined) {
            if (this.edit == true) {
              const featuresFormArray = this.createPlanForm?.get('features') as FormArray;
              this.featureRows = [];
              featuresFormArray.clear();
            }
            this.features = decrypted_data.features.data;

            this.features.forEach((element: Feature) => {
              this.skills.push(element.id);
              this.featuresIdIndexed[element.id] = element;
            });
            if(!this.edit){
              this.getAvailableOptions(0);
            }


            //edit plan true so show selected features in plan creation
            setTimeout(() => {
              if (this.edit == true) {
                this.selectedFeaturesInEditMode();
              }
            }, 100)

          }
          this.submitSpinner = false;
        },
        (error) => {
          this.submitSpinner = false;
        });
    }
  }

  makeArrayUnique(array: any[]): any[] {
    return Array.from(new Set(array));
  }

  controlFeatureSelection(event: any, index: number) {
    let selected_feature = event.target.value;
    if (selected_feature) {
      if (this.featuresIdIndexed[selected_feature] !== undefined) {
        const featuresFormArray = this.createPlanForm?.get('features') as FormArray;
        const control = featuresFormArray.at(index);
        let featureDetail: Feature = this.featuresIdIndexed[selected_feature];
        let featureType = featureDetail.type;
        let type: string = 'Info';
        if (featureType === 2) {
          type = 'Key';
          this.toggleVisibility(index, true);
        } else {
          this.toggleVisibility(index, false);
        }

        control.patchValue({
          type: type,
          rule: featureDetail.feature_label
        });

        if (this.selectedFeatures[index] === undefined) {
          this.selectedFeatures[index] = selected_feature;
        } else {
          this.selectedFeatures[index] = selected_feature;
        }

        // Remove all selections first
        this.selectedFeaturesArray[index] = 0;

        if (selected_feature) {
          this.selectedFeaturesArray[index] = parseInt(selected_feature);
          this.getAvailableOptions(index);
          console.log('this.selectedFeaturesArray', this.selectedFeaturesArray)
        }

        this.cdr.detectChanges();
      }

    }
  }

// Function to dynamically add an input
  addInput() {
    this.inputs.push({value: '', visible: false}); // Add input with initial visibility as true
  }

  // Function to toggle visibility of an input
  toggleVisibility(index: number, flag: boolean) {
    this.inputs[index].visible = flag;
  }

  cloneFeatureRow() {
    this.featureRows.push('');
    this.addInput();
    const featuresFormArray = this.createPlanForm?.get('features') as FormArray;
    const length = featuresFormArray.length;
    if (length >= 0) {

      const value: number = parseInt(featuresFormArray?.at(length - 1)?.get('feature')?.value);
      console.log(length, value, notEmpty(value), String(value) === '')
      if (length === 0) {
        const featureRow = this.formBuilder.group({
          type: [''],
          feature: [''],//, [uniqueSkillValidator(this.selectedFeatures)]
          rule: ['']
        });
        featuresFormArray.push(featureRow);

      } else if (notEmpty(value) && length > 0) {
        const featureRow = this.formBuilder.group({
          type: [''],
          feature: [''],//, [uniqueSkillValidator(this.selectedFeatures)]
          rule: ['']
        });
        featuresFormArray.push(featureRow);
      } else {
        this.toastMessages.showToast('Select feature before adding new row');
      }

      if (length > 0) {
        this.getAvailableOptions(length);
      }
    }
  }

  getAddons() {

    if (!this.addOns.length) {
      let URL = this.baseURL + "api/local/plans";
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = {
        "limit": 1000,
        "active": true,
        "metadata":
          {
            "type": "addons"
          }
      };
      this.submitSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
        (response) => {
          let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_data)
          if (decrypted_data.data !== undefined) {
            this.addOns = decrypted_data.data;
            const addOnsFormArray = this.createPlanForm.get('addons') as FormArray;

            this.addOns.forEach((element: any, index: number) => {
              const addOnBlock = this.formBuilder.group({
                [element.product.id]: new FormControl(false)
              })
              addOnsFormArray.push(addOnBlock);
            });

            //edit plan true so show selected addOns in plan creation
            setTimeout(() => {
              if (this.edit == true) {
                this.selectedAddOnsInEditMode();
              }
            }, 100);
          }
          this.submitSpinner = false;
        },
        (error) => {
          this.submitSpinner = false;
        });
    }
  }

  @ViewChild('planDetail') planDetail!: ElementRef;

  submitCreatePlanForm() {

    if (this.createPlanForm.valid) {


      let formData = this.createPlanForm.value;
      let addonIds: string[] = []
      let modules = formData.modules;
      let addons = formData.addons;

      // Iterate over the array
      for (const obj of addons) {
        // Iterate over the properties of each object
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            // console.log('Key:', key, ', Value:', value);
            if (value == true) {
              addonIds.push(key);
            }
          }
        }
      }

      const featureValues: number[] = [];

      if (formData.features !== undefined) {
        // Iterate over the array
        for (const obj of formData.features) {
          // Access the 'feature' property of each object and push it to the 'featureValues' array
          const featureValue = parseInt(obj.feature);
          featureValues.push(featureValue);
        }
      }

      console.log('all modules',modules)
      this.moduleIds = [];
      //fetch selected modules ids and assign it to global module ids variable
      this.traverseObject(modules);

      let prices: object[] = [];
      if (formData.prices !== undefined && formData.prices.length > 0) {
        if (this.price_type !== this.tieredPriceCheck) {

          formData.prices.forEach((element: any) => {
            let discountLabel = 'one_time_discount';
            let discountType = 'one_time_discountedPrice';
            let f: string = element.paymentFrequency.toLowerCase();
            if (this.price_type !== 'One Time') {

              if (f === 'monthly' || f === 'yearly') {
                f = f.replaceAll('ly', '');
              }
              discountLabel = f.replaceAll(' ', '_') + '_discount';
              discountType = f.replaceAll(' ', '_') + '_discountedPrice';
            }


            let object: PrincePerUnitOrOneTimeObject = {
              "nickname": "api",
              "currency": "usd",
              "unit_amount": element.discountPrice,
              "active": "true",
              "billing_scheme": "per_unit",
              "metadata": {
                [discountLabel]: element.discount,
                [discountType]: element.unit_amount
              }
            }
            console.log('deletedPricesPlanIds', this.deletedPricesPlanIds, this.stripe_id)
            //in case of edit I need to send each price oid for update in stripe otherwise it will add as new price
            if (this.edit && !this.deletedPricesPlanIds.includes(this.stripe_id) && this.planActivePricesOrNot === true) {

              if (this.price_type === "One Time") {
                object.id = this.createPlanForm.get('oneTimePriceId')?.value;
              } else {
                object.id = this.createPlanForm.get(f + 'PriceId')?.value;
              }

            }

            if (this.price_type !== "One Time") {
              let one_time_freq = element.paymentFrequency.toLowerCase();
              if (one_time_freq === 'monthly' || one_time_freq === 'yearly') {
                one_time_freq = one_time_freq.replaceAll('ly', '');
              }
              object.recurring = one_time_freq;// day, month, week, year
            }
            prices.push(object);
          });
        }
      }

      let lastIndex: number = 0;
      if ((this.price_type == this.oneTimeAllUsersCheck || this.price_type === this.tieredPriceCheck) && this.categoryFrequency.length > 0) {

        console.log('this.categoryFrequency', this.categoryFrequency, formData)
        this.categoryFrequency.forEach((frequency: string, indexNumber: number) => {

          if (frequency === 'monthly' || frequency === 'yearly') {
            frequency = frequency.replaceAll('ly', '');
          }

          if (formData.tiered_price[frequency] !== undefined) {
            formData.tiered_price[frequency].forEach((frequencyDetails: any, index: number) => {

              let freq = frequencyDetails.paymentFrequency.toLowerCase();
              //replace monthly to month and yearly to year
              if (freq === 'monthly' || freq === 'yearly') {
                frequencyDetails.paymentFrequency = freq.replaceAll('ly', '');
              }

              const tieredPriceObject: tieredPriceObject = {
                nickname: `api Price ${freq}`,
                currency: "usd",
                unit_amount: frequencyDetails.discountPrice, // if billing_scheme is not tiered.
                recurring: frequencyDetails.paymentFrequency.toLowerCase(), // day, month, week, year
                active: true, // Changed to boolean
                billing_scheme: "tiered",
                tiers: [] as Tiere[],
                tiers_mode: "graduated",
                metadata: {} as Metadata
              };
              console.log('deletedPricesPlanIds', this.deletedPricesPlanIds, this.stripe_id)
              // In case of edit, send each price ID for update in Stripe; otherwise, it will add as a new price
              if (this.edit && !this.deletedPricesPlanIds.includes(this.stripe_id) && this.planActivePricesOrNot === true) {
                // const paymentFrequency = frequencyDetails.paymentFrequency.toLowerCase();
                tieredPriceObject.id = this.createPlanForm.get(`${freq}PriceId`)?.value ?? null;
              }

              let key: string = '';
              //upto users price not required in "one_time_all_users"
              if (this.price_type !== this.oneTimeAllUsersCheck) {
                let tiere: Tiere = {
                  "flat_amount": frequencyDetails.discountPrice,
                  "up_to": frequencyDetails.maxRange
                };
                tieredPriceObject["tiers"].push(tiere);
                //insert discount for users range
                key = frequencyDetails.maxRange;
              } else {
                key = 'inf';
              }


              let frequencyKey: string = key;
              if (frequencyKey === 'monthly' || frequencyKey === 'yearly') {
                frequencyKey = frequencyKey.slice(0, -2);
              }

              tieredPriceObject.metadata[frequencyKey] = frequencyDetails.discount;
              tieredPriceObject.metadata[`${frequencyKey}_discountType`] = frequencyDetails.discountType;

              let infinityUserValue: any = null;
              if (this.price_type === this.oneTimeAllUsersCheck) {
                infinityUserValue = frequencyDetails.discountPrice;
              } else {
                infinityUserValue = formData.tiered_price[frequency + 'WiseInfinity'];
              }

              if ((indexNumber == 0 || lastIndex !== indexNumber) && infinityUserValue !== "") {
                tieredPriceObject["tiers"].push({
                  "flat_amount": infinityUserValue,
                  "up_to": "inf"
                });
              }
              console.log('tieredPriceObject', tieredPriceObject)

              prices.push(tieredPriceObject);
            });
          }

          lastIndex = indexNumber;
        });

      }

      let activeTab = this.elementRef.nativeElement.querySelector('#active-tab');

      let periodValue: number = formData.trial_value;
      // console.log(this.categoriesPlans[formData.packageCategory] , this.categoriesPlans[formData.packageCategory].length, formData.is_popular)
      // return;
      let body: Body = {
        "name": formData.planTitle,

        "active": true, // boolean
        "description": '',
        "metadata": {
          "type": "plans", //["addons", "plans"]
          "public": activeTab.classList.contains('active') ? 1 : 0,
          "is_popular": String(formData.is_popular) === "1" ? 1 : 0,
          // "trial_period_days": 3,
          "base_price": formData.basePrice, // required if type = plans,
          "trial": formData.trial,
          "trial_period_value": formData.trial_period,
          "trial_period_days": periodValue,
          "trial_value": periodValue,
          "trial_user_value": formData.trial_value,
          "trial_users": formData.userInclude,
          "category": formData.packageCategory,
          "proration": formData.billing_type
        },
        "addons": addonIds,
        "module_features_list": this.makeArrayUnique(featureValues),
        "modules": this.makeArrayUnique(this.moduleIds),
        "features": [],
        "prices": prices
      }

      // console.log(body, prices, this.createPlanForm.value)
      // return;
      if (this.imageUrl !== undefined && this.imageUrl !== null && this.imageUrl !== "") {
        body.image = this.imageUrl;
      }


      if (formData.minUser !== undefined && formData.minUser !== '') {
        (body.metadata as Metadata)['minimum_users'] = formData.minUser;
      } else {
        (body.metadata as Metadata)['minimum_users'] = null;
      }

      if (formData.maxUser !== undefined && formData.maxUser !== '') {
        (body.metadata as Metadata)['maximum_users'] = formData.maxUser;
      } else {
        (body.metadata as Metadata)['maximum_users'] = null;
      }

      if (this.edit) {
        body.stripe_id = this.stripe_id;
      }
      console.log(body)
      // return;

      this.submitSpinner = true;
      let URL = this.baseURL + (!this.edit ? 'api/plans' : 'api/plans/' + this.stripe_id);
      let method = !this.edit ? 'POST' : 'PUT';
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);

      if (!this.contentLoading) {

        this.contentLoading = true;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method)
          .subscribe({
            next: (response) => {


              this.toastMessages.showToast('', 'Plan successfully added');
              this.submitSpinner = false;
              this.createPlanForm.reset();

              //close modal after plan creation
              this.modalClose.nativeElement.click();
              //open first tab after save/edit plan
              this.planDetail.nativeElement.click();

              this.edit = false;
              //make sure request sent only one time not twice and send only if first request response received
              this.contentLoading = false;

              this.displayCategoryBlock = false;

              const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
              //update plan listing
              this.planListing(activeTab.classList.contains('active') ? 'active' : 'inActive');
            },
            error: (error) => {
              this.submitSpinner = false;
              //make sure request sent only one time not twice and send only if first request response received
              this.contentLoading = false;
            }

          });
      }

    } else {
      this.showErrors = true;
      console.log(this.createPlanForm.controls)
    }

  }

  traverseObject(obj: any) {

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') {
          // If the value is an object, recursively call traverseObject
          this.traverseObject(obj[key]);
        } else {
          // If the value is not an object, you can access the key-value pair
          console.log('Key:', key, ', Value:', obj[key]);
          if (obj[key] == true) {

            // @ts-ignore
            if (this.modulesIndexed[key] !== undefined && this.modulesIndexed[key].id !== undefined) {
              // @ts-ignore
              this.moduleIds.push(this.modulesIndexed[key].id)
            }
          }
        }
      }
    }
    console.log( ' this.moduleIds',this.makeArrayUnique(this.moduleIds))
  }

  deleteRow(frequency: string, index: number) {
    const tieredPricesFormArray = this.createPlanForm.get('tiered_price.' + frequency) as FormArray;
    tieredPricesFormArray.removeAt(index);

    this.multiDimensionalFrequencyObject[frequency].splice(index, 1);
  }

  controlBasePriceChange(event: any) {
    let basePrice = event.target.value;
    let rangeValidateBasePrice: number = 0;

    if (this.discountType === "percentage") {
      this.discountMaxRange = 100;
      rangeValidateBasePrice = 100;
      this.cdr.detectChanges();
    } else {
      this.discountMaxRange = basePrice;
      rangeValidateBasePrice = basePrice;
      this.cdr.detectChanges();
    }
    console.log('basePrice', basePrice, rangeValidateBasePrice)

    let formData = this.createPlanForm.value;
    if (this.price_type === this.tieredPriceCheck || this.price_type === this.oneTimeAllUsersCheck) {
      const tiered_price = formData.tiered_price;
      if (tiered_price !== undefined) {

        for (let key in tiered_price) {
          console.log('keyIndex', key)
          if (tiered_price.hasOwnProperty(key)) {
            let freqArray = tiered_price[key];
            let index: number = 0;
            const freqFormArray = this.createPlanForm.get('tiered_price.' + key) as FormArray;
            for (let freqKey in freqArray) {
              if (freqArray.hasOwnProperty(freqKey)) {

                let currentData = freqArray[freqKey];
                if (currentData.paymentFrequency !== null && currentData.paymentFrequency !== "" && currentData.discount !== null && currentData.discount !== "") {

                  let discountedPrice: number = 0;
                  if (this.discountType === "percentage") {
                    discountedPrice = basePrice - (basePrice * currentData.discount / 100);

                  } else if (this.discountType === "amount") {
                    discountedPrice = basePrice - currentData.discount;
                  }

                  freqFormArray.at(index).get('discount')?.clearValidators();

                  freqFormArray.at(index).get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);

                  freqFormArray.at(index).get('discount')?.updateValueAndValidity();

                  let tiered_freq = currentData.paymentFrequency;
                  if (tiered_freq === 'yearly') {
                    tiered_freq = tiered_freq.replaceAll('ly', '');
                  }
                  switch (tiered_freq) {
                    case "quarterly":
                      discountedPrice = discountedPrice * 3;
                      break;
                    case "bi-annually":
                      discountedPrice = discountedPrice * 6;
                      break;
                    case "year":
                      discountedPrice = discountedPrice * 12;
                      break;
                  }
                  console.log('tiered', discountedPrice, index, freqKey, currentData)

                  freqFormArray.at(index).patchValue({discountPrice: this.formatDiscountedPrice(discountedPrice)})

                }
                index++;
              }

            }
          }
        }

      }
    } else if (this.price_type === "Per User Price" || this.price_type === "One Time") {
      const prices = formData.prices;
      if (prices !== undefined) {
        const freqFormArray = this.createPlanForm.get('prices') as FormArray;
        let index: number = 0;
        for (let key in prices) {
          console.log('test index', key)
          if (prices.hasOwnProperty(key)) {
            let freqArray = prices[key];

            if (freqArray.discount !== undefined && freqArray.discount !== null && freqArray.discount !== "") {
              let discount = freqArray.discount;
              if (discount !== null) {

                let discountedPrice: number = freqArray.discountPrice;
                if (this.discountType === "percentage") {
                  discountedPrice = basePrice - (basePrice * discount / 100);

                } else if (this.discountType === "amount") {
                  discountedPrice = basePrice - discount;
                }

                // freqFormArray.at(index).get('discount')?.setValidators([rangeValidator(this.discountMinRange, basePrice)]);
                // freqFormArray.at(index).get('discount')?.updateValueAndValidity();
                freqFormArray.at(index).get('discount')?.clearValidators();

                freqFormArray.at(index).get('discount')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$'), rangeValidator(this.discountMinRange, rangeValidateBasePrice)]);

                freqFormArray.at(index).get('discount')?.updateValueAndValidity();
                let freq = this.categoryFrequency[index];
                if (freq === 'yearly') {
                  freq = freq.replaceAll('ly', '');
                }
                switch (freq) {
                  case "quarterly":
                    discountedPrice = discountedPrice * 3;
                    break;
                  case "bi-annually":
                    discountedPrice = discountedPrice * 6;
                    break;
                  case "year":
                    discountedPrice = discountedPrice * 12;
                    break;
                }
                console.log(this.categoryFrequency[index], discountedPrice)
                freqFormArray.at(index).patchValue({discountPrice: this.formatDiscountedPrice(discountedPrice)});
              }
              index++;
            }
          }
        }

      }
    }

    this.cdr.detectChanges();
  }

  controlTrialChange(event: any) {
    let trial_value = event.target.value;
    let trial_period = this.createPlanForm.get('trial_period');
    let trial_val = this.createPlanForm.get('trial_value');
    if (trial_value && trial_value === "0") {
      trial_period?.setValue('');
      trial_val?.setValue('');
      trial_period?.disable();
      trial_val?.disable()
    } else {
      trial_period?.setValue('month');
      trial_val?.setValue(1);
      trial_period?.enable();
      trial_val?.enable()
    }
  }

  controlMostPopular(event: any) {
    let value = event.target.value;
    let cat_id = this.createPlanForm.get('packageCategory')?.value;

    let alreadyPopularPlanAttached: boolean = this.categoriesPlans[cat_id] !== undefined && this.categoriesPlans[cat_id].length !== 0;
    console.log('alreadyPopularPlanAttached', cat_id, alreadyPopularPlanAttached)
    if (value === "1" && alreadyPopularPlanAttached) {
      this.createPlanForm.get('is_popular')?.setValidators([Validators.required, popularPlanValidator(alreadyPopularPlanAttached)]);
      // this.createPlanForm.patchValue({is_popular:0});

    } else {
      alreadyPopularPlanAttached = false;
      // this.createPlanForm.patchValue({is_popular:1});
      this.createPlanForm.get('is_popular')?.clearValidators();
      this.createPlanForm.get('is_popular')?.setValidators(Validators.required);
    }
    this.createPlanForm.get('is_popular')?.updateValueAndValidity();
  }

  deletePrices() {

    if (this.edit && this.pricesIds !== null && this.pricesIds.length > 0) {

      let URL = this.baseURL + 'api/prices/' + this.pricesIds.join(',') + '/' + this.stripe_id;
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = {};
      let method = "DELETE";
      //initialize spinner
      this.submitSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          let data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          this.toastMessages.showToast('success', 'Prices deleted you can edit existing prices values');
          this.deletedPricesPlanIds.push(this.stripe_id);

          console.log(data);

          if (this.price_type === "Per User Price" || this.price_type === "One Time") {
            const prices = data.price;
            console.log('ppppp', prices)

            if (prices !== undefined && prices.length > 0) {
              const pricesArray = this.createPlanForm.get('prices') as FormArray;
              console.log('inner Prices', prices)
              prices.forEach((element: any, index: number) => {
                console.log('elementData', element)

                pricesArray.at(index).patchValue({
                  discount: '',
                  discountPrice: '',
                });
              });
            }
          } else if (this.price_type === this.tieredPriceCheck || this.price_type === this.oneTimeAllUsersCheck) {

            const prices = data.price;

            if (prices !== undefined && prices.length > 0) {
              const pricesArray = this.createPlanForm.get('tiered_price') as FormGroup;

              let freqIndex = '';
              let upperIndex: number = 0;
              prices.forEach((element: any, index: number) => {


                //because bi-annually and quarterly replaced with months due to stripe limitations acceptance as month billing
                let dbInterval: string = element.recurring.interval;
                let frequency: string = dbInterval;
                let dbIntervalCount: number = element.recurring.interval_count;


                if (dbIntervalCount === 3 && dbInterval === 'month') {
                  frequency = 'quarterly';
                } else if (dbIntervalCount === 6 && dbInterval === 'month') {
                  frequency = 'bi-annually';
                }

                let freqEdit: string = frequency;
                if (freqEdit === 'monthly' || freqEdit === 'yearly') {
                  freqEdit = freqEdit.replaceAll('ly', '');
                }

                const frequencyArray = pricesArray?.get(freqEdit) as FormArray;
                // const frequencyArray = pricesArray?.get(element.recurring.interval) as FormArray;
                let setValueObject: object = {};

                if (element.tiers !== undefined && element.tiers.length > 0) {

                  //clear array before creating rows for edited plan
                  element.tiers.forEach((ele: any, ind: number) => {

                    if (ele.up_to !== null) {
                      //insert new index in frequency Array so on edit all rows will be created if multiple tiered
                      let setValueObject: object = {};
                      if (this.price_type === this.tieredPriceCheck) {
                        setValueObject = {
                          discount: '',
                          discountPrice: '',
                        };
                      }
                      const control = frequencyArray.at(upperIndex);
                      if (control !== undefined) {
                        control.patchValue(setValueObject);
                      }
                    } else {
                      if (this.price_type === this.tieredPriceCheck) {
                        let keyIndex = frequency + 'WiseInfinity';
                        // let keyIndex = element.recurring.interval + 'WiseInfinity';

                        pricesArray.patchValue({[keyIndex]: ''});
                      } else {
                        // Push the perUserOrOneTimePriceArray FormGroup into tieredPricesFormArray
                        setValueObject = {
                          discount: '',
                          discountPrice: ''
                        };
                        frequencyArray.at(0).patchValue(setValueObject);
                      }
                    }

                  });
                }
                freqIndex = frequency;
                // freqIndex = element.recurring.interval;
                upperIndex = upperIndex + 1;
              });
            }
          }
          this.submitSpinner = false;
        },
        (error) => {
          this.submitSpinner = false;
        }
      );
    }

  }

  clonePlan(plan_id: string) {
    if (plan_id !== "") {

      this.edit = true;

      // setTimeout(() => {
      let URL = this.baseURL + 'api/local/product/' + plan_id;
      let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
      let body = {};
      let method = "GET";

      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (resp) => {
          if (resp.app_data !== undefined) {
            let decrypted_resp = JSON.parse(this.encryptDecrypt.decrypt(resp.app_data));
            let resultData = decrypted_resp.product;

            interface Product {
              id: number;
              stripe_id: string;
              product: {
                id: string;
                // ... other properties ...
                prices: {
                  id: string;
                  // ... other properties ...
                }[];
              };
            }

            console.log('resultData', resultData)
            const clonedProduct = {...resultData};

            const indexes: string[] = ["id", "marketing_features", "livemode", "default_price", "created", "attributes", "object", "package_dimensions", "stripe_id", "updated", "shippable",
              "statement_descriptor", "tax_code", "unit_label", "url", "updated"];

            indexes.forEach((ele: string) => {
              console.log(`Property: ${ele}, Value:`, clonedProduct[ele]);
              if (clonedProduct[ele] !== undefined) {
                delete clonedProduct[ele];
                console.log(`Deleted property: ${ele}`);
              } else {
                console.log(`Property ${ele} does not exist`);
              }
            });

            let prices: any = [];
            if (clonedProduct.name !== undefined) {
              clonedProduct.name = clonedProduct.name + " Cloned";
            }

            if (clonedProduct && clonedProduct.prices) {
              const categoryType: string = this.getProductById(this.categories, clonedProduct.metadata.category);
              clonedProduct.prices.forEach((price: any) => {
                if (price.id) {
                  delete price.id;
                }
                // if (price.unit_amount) {
                //   price.unit_amount = price.unit_amount/100;
                // }
                if (price.product) {
                  delete price.product;
                }
                if (price.billing_scheme == "per_unit") {

                  if (parseInt(price.recurring.interval_count) === 3) {
                    price.recurring.interval = "quarterly";
                  } else if (parseInt(price.recurring.interval_count) === 6) {
                    price.recurring.interval = "bi-annually";
                  }
                  prices.push({
                    nickname: price.nickname,
                    currency: price.currency,
                    unit_amount: (price.unit_amount / 100),
                    recurring: price.recurring.interval,
                    // month, year, bi-annually, quarterly
                    active: "true",
                    metadata: price.metadata,
                    billing_scheme: "per_unit"
                  });
                } else {
                  let tiers: { flat_amount: number, up_to: string | number }[] = [];
                  if (price.tiers.length > 0) {
                    /*
                      flat_amount: 14850
                      flat_amount_decimal: "14850"
                      unit_amount: null
                      unit_amount_decimal: null
                      up_to: 5
                     */
                    price.tiers.forEach((element: any) => {
                      tiers.push({
                        flat_amount: (element.flat_amount / 100),
                        up_to: element.up_to != null ? element.up_to : 'inf'
                      })
                    });
                  }

                  prices.push({
                    nickname: "api Price 3",
                    currency: "usd",
                    // unit_amount: 13, // if billing_scheme is not tiered.
                    recurring: "month", // day, month, week, year
                    active: "true",
                    billing_scheme: "tiered",
                    tiers: tiers,
                    metadata: price.metadata,
                    tiers_mode: "graduated"
                  })

                }


              });
              const addons = clonedProduct.metadata.addons;


              if ( clonedProduct.metadata.is_popular !== undefined ) {
                clonedProduct.metadata.is_popular = 0
              }

              if (addons !== undefined && addons !== null && addons !== "") {
                clonedProduct.addons = addons.split(',');
                delete clonedProduct.metadata.addons;
              }
              clonedProduct.prices = prices;
              console.log('clonedProduct', clonedProduct)

              //initialize request for saving data
              let URL1 = this.baseURL + 'api/plans';
              let method1 = 'POST';

              this.httpClientRequest.initiateHttpRequest(URL1, clonedProduct, headers, method1)
                .subscribe({
                  next: (response) => {


                    this.toastMessages.showToast('', 'Plan successfully added');
                    this.submitSpinner = false;
                    this.createPlanForm.reset();

                    //close modal after plan creation
                    this.modalClose.nativeElement.click();
                    //open first tab after save/edit plan
                    this.planDetail.nativeElement.click();

                    this.edit = false;
                    //make sure request sent only one time not twice and send only if first request response received

                    this.displayCategoryBlock = false;

                    const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
                    //update plan listing
                    this.planListing(activeTab.classList.contains('active') ? 'active' : 'inActive');
                  },
                  error: (error) => {
                    this.paginateSpinner = false;
                    //make sure request sent only one time not twice and send only if first request response received
                    this.contentLoading = false;
                  }

                });
            }
          }
          // this.paginateSpinner = false;
        },
        (error) => {
          this.paginateSpinner = false;
        });
    }
  }

  getAvailableOptions(index: number | undefined) {
    if (index !== undefined && index === 0) {
      const selectedFeatureIds = this.selectedFeaturesArray.filter((_, i) => i !== index);
      this.availableOptions[index] = this.features.filter((option: any) => !selectedFeatureIds.includes(option.id) || (this.createPlanForm.get('features') as FormArray)?.at(index).get('feature')?.value === option.id);
    }
    // console.log(index, selectedFeatureIds, this.availableOptions[index])


    let length = (this.createPlanForm.get('features') as FormArray).length;
    // Loop through each dropdown to update its available options
    for (let i = 0; i < length; i++) {
      this.availableOptions[i] = this.getFilteredOptionsForDropdown(i);
    }
  }

  deleteFeature(index: number){
    console.log(index, notEmpty(index))
    if(notEmpty(index)){
      const control = this.createPlanForm.get('features') as FormArray;
      console.log(control)
      control.removeAt(index);
      // Mark for update after all removals
      control.updateValueAndValidity();

      this.selectedFeaturesArray.splice(index, 1);
      //because
      this.getAvailableOptions(undefined);
    }
  }

  getFilteredOptionsForDropdown(index: number): any[] {
    // Get all selected feature IDs except the one at the current index
    const selectedFeatureIds = this.selectedFeaturesArray;//.filter((_, i) => i !== index);

    // Return available options for this dropdown (availableOptions[index])
    return this.features.filter((option: any) =>
      // Exclude options that have been selected in other dropdowns,
      // or include if it's the current selected feature for this dropdown
      !selectedFeatureIds.includes(option.id) || this.selectedFeaturesArray[index] === option.id
    );
  }

  getProductById(products: Category[], categoryId: number): string {
    const product: Category | undefined = products.find(product => product.id === categoryId);
    return String(product?.price_type);
  }

  featuresFunction(): FormArray {
    return this.createPlanForm.get('features') as FormArray;
  }

  controlSorting(){
    console.log(this.dmenu.nativeElement.classList)
    setTimeout(() =>{
      if(!this.dmenu.nativeElement.classList.contains('show') && this.dmenu.nativeElement.classList.contains("search-dropdown__dropdown__search") === false){
        this.dmenu.nativeElement.classList.add("show");
        this.dmenu.nativeElement.classList.add("m-top");//.style.marginTop = "40px";
      }else{
        // this.dmenu.nativeElement.classList.remove("show");
        // this.dmenu.nativeElement.classList.remove("m-top");//.style.marginTop = "10px";
      }

    }, 0);
  }

  sortPlanAccordingToCategory(objectDetails:any){
    console.log(objectDetails, notEmpty(objectDetails.productId))
    this.categoryFilterValue = objectDetails.id;
    if(notEmpty(objectDetails.id)){
      console.log('clicked')
      // setTimeout(() => {this.dmenu.nativeElement.classList.remove("show")}, 110);
      this.isDragEnabled = false;
      let tab:string = '';
      const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");

      if (activeTab.classList.contains('active')) {tab = 'active';} else {tab = 'inActive'; }
      this.displayCategoryFilterClear = true;
      this.planListing(tab,'',objectDetails.id);

    }
  }
  clearCategoryFilter(){
    const activeTab = this.elementRef.nativeElement.querySelector("#active-tab");
    this.activeFlag = "inActive";
    if (activeTab.classList.contains('active')) {
      this.activeFlag = "active"
    }
    this.displayCategoryFilterClear = false;
    this.planListing(this.activeFlag, '','')
    this.dmenu.nativeElement.classList.remove("show");
  }

  protected readonly String = String;
  protected readonly checkPermission = checkPermission;
  protected readonly m_Ids = m_Ids;
}

export function rangeValidator(min: number, max: number) {
  console.log(min, max)
  return (control: AbstractControl) => {
    if (parseInt(control.value) !== null && parseInt(control.value) !== undefined) {
      if (parseInt(control.value) < min || parseInt(control.value) > max) {
        return {rangeError: true};
      }
    }
    return null;
  };
}

export function popularPlanValidator(flag: boolean) {

  return (control: AbstractControl) => {

    if (flag) {

      return {already: true};

    }

    return null;

  };

}
