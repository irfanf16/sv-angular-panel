import {ChangeDetectorRef, Component, ElementRef, ViewChild, Input, Renderer2} from '@angular/core';
import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
  FormArray, FormControl, isFormGroup
} from "@angular/forms";
import {HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environments";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {RefreshTokenService} from "../../services/refresh-token.service";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";
import {map, Observable, of} from "rxjs";
import {CategoriesConfig} from "../../Components/constants/plan_&_packages/categories/categories"
import {DatePipe} from '@angular/common';
import {catchError} from 'rxjs/operators';
import {
  CompanyUserRequestBody,
  FeatureTypeRows,
  IServerResponse,
  CategoryFeature,
  categoryFeaturesList
} from "../../Components/interfaces/plan_&_packages/categories/categories";
import {CategoryPlan} from "../../Components/interfaces/plan_&_packages/plan-listing/plan-listing";
import {checkPermission, notEmpty} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

export class CategoriesComponent {
  // FormGroup
  public categoryForm: FormGroup;
  public packageName: FormGroup;

// string
  baseURL: string = environment.apiBASEURL;
  popupTitle: string = "";
  inputValue: string = '';

// boolean
  showSpinner: boolean = false;
  showPercentageTypeOption: boolean = true;
  showKeyBlock: boolean = false;
  showErrors: boolean = false;
  loading!: boolean;
  paginateSpinner: boolean = false;
  DataFound: boolean = false;
  DataFoundPagination: boolean = false;
  editCategoryFeature: boolean = false;

// number
  total: number = 0;
  perPage: number = 20;
  p: number = 1;
  company_id: number = 0;
  category_id: number = 0;
  doneTypingInterval: number = 500;

// string[]
  packageNameRows: string[] = [''];
  @Input('data') category_data: string[] = [];

// Observable<any>
  categories$: Observable<any> = new Observable<any>();

// any
  singleCategory: any;
  typingTimer: any;
  typingTimerfeature: any;

// object
  packageObject: object = {};

// any[]
  categoryPlans: any[] = [];

// number[]
  categoriesIdsAttachedWithPlans: number[] = [];

// number[][]
  categoriesPlans: number[][] = [];

// FeatureTypeRows
  featureTypeRows: FeatureTypeRows = {
    '0': ['']
  };

// ElementRef
  @ViewChild('AddEditPopup') AddEditPopup!: ElementRef;
  @ViewChild('closeDeletePopup') closeDeletePopup!: ElementRef;
  @ViewChild('closeAddEditPopup') closeAddEditPopup!: ElementRef;
  @ViewChild('saveCateBtn') saveCateBtn!: ElementRef;
  @ViewChild('closeProductFeatureClose') closeProductFeatureClose!: ElementRef;

  constructor(private formBuilder: FormBuilder, private appComponent: AppComponent, private breadcrumbService: BreadcrumbService, private cdr: ChangeDetectorRef, private httpClientRequest: HttpClientRequestService, private encryptDecrypt: EncryptDecryptService, private refreshToken: RefreshTokenService, private toastMessages: ToastMessagesComponent, private el: ElementRef, private datePipe: DatePipe) {

    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.categoryForm = this.formBuilder.group({
      title: ['', Validators.required],
      proration: ['', Validators.required],
      price_type: ['', Validators.required],
      discount_type: ['', Validators.required],
      description: [''],
      published: [false],
      frequency: this.formBuilder.group({
        day: [false],
        week: [false],
        month: [false],
        year: [false],
        "bi-annually": [false],
        quarterly: [false]
      }, {validator: atLeastOneCheckedValidator})

    });

    this.packageName = this.formBuilder.group({
      //Define the structure of the form group here
      features: this.formBuilder.array([
        this.formBuilder.group({
          packageName: [],
          id: [null],
          featureList: this.formBuilder.array([])
        })
      ])
    });


  }

  get formControl() {
    return this.categoryForm.controls;
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs(CategoriesConfig.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(CategoriesConfig.COMP_NAME);
    this.getCategories();
  }

  ngAfterViewInit() {
    this.AddEditPopup.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
      //reset form to its original form
      this.categoryForm.reset();
    });
  }

  addPopupTrigger() {
    this.popupTitle = "Add";
    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.enable();
    });
    // To hide the button
    this.saveCateBtn.nativeElement.style.display = 'block';
  }

  getCategories(search: string = '') {
    this.paginateSpinner = true;
    let decrypted_data: any;

    // Show the spinner
    // this.showSpinner = true;

    let URL = this.baseURL + "api/categories?page=1";
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body: { limit: number, fields: string[], search?: string } = {
      limit: this.perPage,
      fields: [
        "title",
        "description",
        "created_at",
      ]
    };

    if (notEmpty(search)) {
      body.search = search;
    }

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));

        this.paginateSpinner = false;
        this.cdr.detectChanges();
        this.categoriesIdsAttachedWithPlans = decrypted_data.products;
        let rv = decrypted_data.products;
        if (rv !== undefined) {
          rv.forEach((element: CategoryPlan) => {

            if (typeof this.categoriesPlans[element.category_id] === 'undefined') {
              this.categoriesPlans[element.category_id] = [];
            }
            if (element.plan_id != null) {
              this.categoriesPlans[element.category_id].push(element.plan_id);
            }
          });
        }
        if (decrypted_data.categories.data.length > 0) {
          console.log(decrypted_data)
          //change incoming data array to observable
          this.categories$ = of(decrypted_data.categories.data);
          this.total = decrypted_data.categories.total;
          this.DataFound = false;
          this.DataFoundPagination = true;
        } else {
          this.DataFound = true;
          this.DataFoundPagination = false;
        }
        this.paginateSpinner = false;
      },
      (error) => {
        console.log('Request failed with error', error);
        this.DataFound = true;
        this.DataFoundPagination = false;
        this.paginateSpinner = false;
      });


  }

  getPage(page: number) {
    this.loading = true;
    this.serverCall(page).subscribe({
      next: (res: any) => {
        this.categories$ = of(res.items);
        this.total = res.total;
        this.p = page;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        this.loading = false;
      }
    });
  }

  serverCall(page: number): Observable<IServerResponse> {
    this.paginateSpinner = true;
    let URL: string = "";
    URL = this.baseURL + "api/categories?page=" + page;

    let body: CompanyUserRequestBody = {
      // Following variables are optional. You can change it according to your requirements.
      "limit": this.perPage,
      "fields": [
        "title",
        "description",
        "created_at",
      ]
    };
    const headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('server call decryptedData');
        console.log(decryptedData);
        this.paginateSpinner = false;
        return {
          items: decryptedData.categories.data,
          total: decryptedData.categories.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );
  }

  saveCategory() {
    //check form is free of validations
    if (this.categoryForm.valid) {

      this.showErrors = false;
      this.showSpinner = true;
      if (this.popupTitle == "Add") {
        let URL = this.baseURL + 'api/category';
        let formData = this.categoryForm.value;
        let frequency = this.categoryForm.get('frequency')?.value;
        let temp: string[] = [];
        for (let key in frequency) {
          const value = frequency[key];
          if (value) {
            temp.push(key);
          }
        }


        formData['frequency'] = temp;
        if (formData.published === undefined || (formData.published !== undefined && formData.published === null)) {
          formData.published = 0;
        }


        let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER_POST_M);

        let method = 'POST';
        let body = formData;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
          (response) => {
            this.showSpinner = false;
            this.closeAddEditPopup.nativeElement.click();
            this.categoryForm.reset();
            this.toastMessages.showToast('', 'Category successfully created', 'success');
            this.cdr.detectChanges();
            this.getCategories();
          },
          (error) => {
            this.showSpinner = false;
          });
      } else {
        let URL = this.baseURL + 'api/category/' + this.category_id;
        let formData = this.categoryForm.value;
        let frequency = this.categoryForm.get('frequency')?.value;
        let temp: string[] = [];
        for (let key in frequency) {
          const value = frequency[key];
          if (value) {
            temp.push(key);
          }
        }

        formData['frequency'] = temp;

        let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER_POST_M);

        let method = 'PUT';
        let body = formData;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
          (response) => {
            this.showSpinner = false;
            this.closeAddEditPopup.nativeElement.click();
            this.categoryForm.reset();
            this.toastMessages.showToast('', CategoriesConfig.CATEGORY_EDIT, 'success');
            this.cdr.detectChanges();
            this.getCategories();
          },
          (error) => {

            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            this.toastMessages.showToast('', decrypted_data.message, 'error');
            this.showSpinner = false;

          });
      }
    } else {
      this.showErrors = true;
      console.log(this.categoryForm.controls)
    }

  }

  @ViewChild('blockToClone') blockToClone!: ElementRef;

  cloneHtmlBlock() {
    const originalBlock = this.blockToClone.nativeElement;

    const clonedBlock = originalBlock.cloneNode(true);

    const parentElement = originalBlock.parentElement;
    const add_more_btn = parentElement.querySelector('.add_more_1');

    if (add_more_btn && add_more_btn.parentNode) {
      const clonedTrashIcon = clonedBlock.querySelector('.delete_icon');

      if (clonedTrashIcon) {
        // Remove the class from the inner element
        clonedTrashIcon.classList.remove('d-none');
      }
      clonedTrashIcon.addEventListener('click', this.deleteBlock.bind(this));
      add_more_btn.parentNode.insertBefore(clonedBlock, add_more_btn);
    } else {
      console.error('Error: Could not find the parent element or add more button.');
    }
  }

  deleteBlock(event: any) {
    const target = event.target;
    console.log(target, target.classList)
    if (target.classList.contains('actions_icon')) {
      const blockToRemove = target.closest('.blockForRemove');
      if (blockToRemove) {
        blockToRemove.remove();
      }
    }
  }

  assignCategoryID(id: number) {
    this.category_id = id;
  }

  controlTypeChange(event: any) {
    let type = String(event.target.value);

    if (type !== "" && type === CategoriesConfig.CATEGORY_TYPE) {
      this.showPercentageTypeOption = false;
      this.categoryForm.patchValue({discount_type: ''});
      (this.categoryForm.get('frequency') as FormGroup)?.disable();
      // this.categoryForm.removeControl('frequency');
      this.cdr.detectChanges();
    } else {
      this.showPercentageTypeOption = true;
      this.categoryForm.patchValue({discount_type: ''});
      (this.categoryForm.get('frequency') as FormGroup)?.enable();
      this.cdr.detectChanges();
    }


  }

  deleteCategory() {

    // Show the spinner
    // this.showSpinner = true;

    if ((this.categoriesPlans[this.category_id] === undefined) || (this.categoriesPlans[this.category_id] !== undefined && this.categoriesPlans[this.category_id].length === 0)) {
      let URL = this.baseURL + "api/category/" + this.category_id;
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let body = "";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe(
        (response) => {
          this.cdr.detectChanges();
          console.log(response);
          this.toastMessages.showToast('', 'Category successfully deleted', 'success');
          this.closeDeletePopup.nativeElement.click();
          this.getCategories();
        },
        (error) => {
          //error() callback
          console.log('Request failed with error', error);
        });
    } else {
      this.closeDeletePopup.nativeElement.click();
      this.toastMessages.showToast('', 'Category with active plans acn not be deleted', 'error');
    }


  }

  getSingleCategory(categoryID: number) {
    if (!checkPermission(moduleIds.products, 'update')) {
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
      return;
    }

    this.popupTitle = "Edit";
    let decrypted_data: any;

    // Show the spinner
    // this.showSpinner = true;

    let URL = this.baseURL + "api/category/" + categoryID;
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body = "";
    this.showSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log(decrypted_data)

        if (decrypted_data.category != undefined || decrypted_data.category != null || decrypted_data.category != "") {
          this.singleCategory = decrypted_data.category;
          if (this.singleCategory.price_type === 'one_time') {
            this.showPercentageTypeOption = false;
          }

          // Set form values with data from singleCategory
          this.categoryForm.patchValue({
            title: this.singleCategory.title,
            proration: this.singleCategory.proration,
            price_type: this.singleCategory.price_type,
            discount_type: this.singleCategory.discount_type,
            description: this.singleCategory.description,
            published: this.singleCategory.published
          });


          // Set frequency checkboxes based on singleCategory data
          const frequencyData = this.singleCategory.frequency;
          if (frequencyData && Array.isArray(frequencyData)) {
            frequencyData.forEach((freq: string) => {
              this.categoryForm.get('frequency')?.get(freq)?.patchValue(true);
            });
          }

          this.assignCategoryID(this.singleCategory.id);
        }
        this.showSpinner = false;

        //disabled all fields if there is active plan attached with category else enable all fields
        if ((this.categoriesPlans[categoryID] !== undefined && this.categoriesPlans[categoryID].length !== 0) || (decrypted_data.attached_plans !== null || decrypted_data.attached_plans !== '')) {
          Object.keys(this.categoryForm.controls).forEach(key => {
            this.categoryForm.get(key)?.disable();
          });
          // To hide the button
          this.saveCateBtn.nativeElement.style.display = 'none';
        } else {
          Object.keys(this.categoryForm.controls).forEach(key => {
            this.categoryForm.get(key)?.enable();
          });
          // To hide the button
          this.saveCateBtn.nativeElement.style.display = 'block';
        }

        if (this.singleCategory.price_type === "one_time") {

          (this.categoryForm.get('frequency') as FormGroup)?.disable();
          console.log(this.categoryForm.controls)
        }

      },
      (error) => {
        //error() callback
        console.log('Request failed with error', error);
        this.showSpinner = false;

      });


  }


  formatDate(dateString: string | null): string {
    if (!dateString) {
      return ''; // or any other default value you want to return for null dates
    }

    const date = new Date(dateString);
    return this.datePipe.transform(date, CategoriesConfig.CATEGORY_DATE_FORMAT) || ''; // Adjust the format as per your requirement
  }

  //
  addFeatureTypeRow(parentIndex: number = 0) {
    const row = this.formBuilder.group(this.packageObject);
    //insert new row in reactive form controls
    ((this.packageName.get('features') as FormArray).at(parentIndex).get('featureList') as FormArray).push(row);

    this.featureTypeRows[parentIndex].push('');
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
    console.log(this.inputValue.toLowerCase())
    this.getCategories(this.inputValue.toLowerCase());
  }

  addPackageRow() {
    let parentIndex = this.packageNameRows.length - 1;
    const newFeature = this.formBuilder.group({
      packageName: [''],
      id: [null],
      featureList: this.formBuilder.array([
        this.formBuilder.group(this.packageObject)
      ])
    });
    (this.packageName.get('features') as FormArray).push(newFeature);

    this.packageNameRows.push('');

    // Check if the array at parentIndex exists, if not, initialize it as an empty array
    if (!this.featureTypeRows[parentIndex + 1]) {
      this.featureTypeRows[parentIndex + 1] = [];
    }
    this.featureTypeRows[parentIndex + 1].push('');


  }

  resetCategoryFeatureForm(category_id: number = 0) {

    if (!checkPermission(moduleIds.products, 'update') || checkPermission(moduleIds.products, 'update') === false) {
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
      return;
    }

    this.category_id = category_id;
    this.packageNameRows = [''];
    this.featureTypeRows['0'] = [''];

    let packageRow = this.packageName.get('features') as FormArray;

    packageRow.clear();
    packageRow.push(this.formBuilder.group({
        packageName: [''],
        id: [null],
        featureList: this.formBuilder.array([])
      })
    );

    this.PromiseFunction(category_id).then(result => {

      console.log('result test', result)

      console.log('packageRow', packageRow)
      let URL = this.baseURL + 'api/category/' + category_id + '/features';
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let body = {};
      let method = "GET";
      let data: CategoryFeature[] = [];
      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_response)
            //check if product features already exists then initiate for edit data display request
            if (decrypted_response.category_features !== undefined && decrypted_response.category_features.length > 0) {

              packageRow.clear();
              this.editCategoryFeature = true;
              data = decrypted_response.category_features;
              let index: number = 0;
              for (let key in data) {
                if (data.hasOwnProperty(key)) {
                  const currentData = data[key];

                  packageRow.push(this.formBuilder.group({
                    packageName: [currentData.title],
                    id: [currentData.id],
                    featureList: this.formBuilder.array([])
                  }));

                  if (currentData.feature_list !== undefined) {
                    let featureListIndex: number = 0;
                    let packageFeaturesList = packageRow.at(index).get('featureList') as FormArray;
                    packageFeaturesList.clear();
                    for (let listKey in currentData.feature_list) {
                      if (currentData.feature_list.hasOwnProperty(listKey)) {
                        const currentFeatureList = currentData.feature_list[listKey];
                        let object: any = {
                          featureName: currentFeatureList.feature_title,
                        };
                        this.categoryPlans.forEach((plan: any) => {
                          object['id'] = currentFeatureList.id;
                          object['plan_' + plan.product.id] = currentFeatureList.plan !== undefined && currentFeatureList.plan.includes(plan.product.id) ? true : false;
                          object['plan_input' + plan.product.id] = currentFeatureList.plan_value !== undefined ? currentFeatureList.plan_value[plan.product.id] : '';
                        });
                        //inserted plan fields form control name in reactive form array
                        packageFeaturesList.push(this.formBuilder.group(object));
                        featureListIndex++;
                      }
                    }
                  }

                  //fetch features list
                  index++;
                }
              }
            } else {
              this.editCategoryFeature = false;
              this.packageName.reset();
            }
            this.paginateSpinner = false;
          }

        },
        (error) => {
          this.paginateSpinner = false;
        });
      // Output: Promise resolved

    }).catch(error => {

      console.error(error);

    });
  }

  async PromiseFunction(category_id: number = 0): Promise<CategoryFeature[]> {
    // Simulate a long-running operation
    const result = await this.performLongRunningOperation(category_id);
    return result;//resolve(result);
  }


  performLongRunningOperation(category_id: number = 0): any[] {

    let URL = this.baseURL + 'api/local/products';
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body = {
      "metadata":
        {
          "category": String(category_id)
        }
    };
    let method = "POST";
    this.paginateSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          console.log(this.packageName.controls)

          this.categoryPlans = decrypted_response.data;
          let object: { [key: string]: boolean[] | string[] | null[] } = {
            featureName: ['']
          };
          if (decrypted_response.data !== undefined) {
            decrypted_response.data.forEach((element: any) => {
              let data = element.product;
              object['id'] = [null];
              object['plan_' + data.id] = [false];
              object['plan_input' + data.id] = [''];
            });
          }
          this.packageObject = object;

          const row = this.formBuilder.group(object);
          const featureForm = this.packageName.get('features') as FormArray;
          const featureListForm = featureForm.at(0).get('featureList') as FormArray;
          featureListForm.push(row);

          this.paginateSpinner = false;
        }

      },
      (error) => {
        this.paginateSpinner = false;
      });

    return [];

  }


  deleteFeatureRow(event: any, parent_index: number = 0, current_row: number = 0, category_block_id: number = 0, category_block_feature_id: number = 0) {
    console.log(category_block_id, category_block_feature_id)


    const featureFormArray = this.packageName.get('features') as FormArray;
    const featuresList = featureFormArray.at(parent_index).get('featureList') as FormArray;
    featuresList.removeAt(current_row);

    // Remove from Secondary Array

    if (this.featureTypeRows[parent_index]) {
      const featureArray = this.featureTypeRows[parent_index];
      featureArray.splice(current_row, 1);
    }

    if (this.category_id && category_block_feature_id) {
      let URL = this.baseURL + 'api/category/' + (this.category_id) + '/features_list/' + category_block_feature_id;
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let body = {};
      let method = "DELETE";
      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_response)


            this.paginateSpinner = false;
          }

        },
        (error) => {
          this.paginateSpinner = false;
        });
    }


  }

  deleteParentFeatureRow(parent_index: number = 0, feature_id: number = 0) {

    const featureFormArray = this.packageName.get('features') as FormArray;
    featureFormArray.removeAt(parent_index);

    if (this.category_id && feature_id) {
      let URL = this.baseURL + 'api/category/' + (this.category_id) + '/features/' + feature_id;
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let body = {};
      let method = "DELETE";
      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));

            this.paginateSpinner = false;
          }
        },
        (error) => {
          this.paginateSpinner = false;
        });
    }
  }

  featureControls() {
    const features = (this.packageName.get('features') as FormArray);
    if (features !== undefined) {
      return features.controls;
    } else {
      return [];
    }
  }

  featureListControls(index: number = 0) {
    const features = (this.packageName.get('features') as FormArray);
    if (features !== undefined) {
      return (features.at(index).get('featureList') as FormArray).controls;
    } else {
      return [];
    }


  }


  calculateTotal(parent_index: number) {

    const featureFormArray = this.packageName.get('features') as FormArray;

    const featuresList = featureFormArray.at(parent_index).get('featureList') as FormArray;

    let total = 0;

    featuresList.controls.forEach((control) => {

      total += control.value;

    });

    return total;

  }

  saveCategoryFeature() {

    // Check if the packageName property is valid
    if (this.packageName.valid) {
      let formData = this.packageName.value; // Get the form data
      let data: CategoryFeature[] = []; // Initialize an empty array to hold the category features
      let title: string = ''; // Initialize an empty string for the title
      let plans: string[] = []; // Initialize an empty array for the plans
      let planInputs: { [keyof: string]: string } = {}; // Initialize an empty array for the planInputs
      let category_features_list: categoryFeaturesList[] = []; // Initialize an empty array for the category features list

      console.log('form Data', formData) // Log the form data for debugging purposes

      // If the features property of the form data is defined
      if (formData.features !== undefined) {
        // Loop through each element in the features array
        formData.features.forEach((element: any) => {
          // Set the title to the package name of the current element
          title = element.packageName;
          // If the featureList property of the current element is defined
          if (element.featureList !== undefined) {
            // Initialize an empty array for the category features list
            category_features_list = [];
            // Loop through each element in the featureList array
            element.featureList.forEach((ele: any) => {
              // Initialize an empty array for the plans
              plans = [];
              planInputs = {};
              // Loop through each key-value pair in the current element
              Object.entries(ele).forEach(([key, value]) => {
                // Replace 'plan_' with an empty string in the key to get the updatedKey
                let updatedKey = key.replace('plan_', '');


                // If the updatedKey is not 'featureName' and the value is true
                if (String(updatedKey) !== "featureName" && value === true) {
                  // Add the updatedKey to the plans array
                  plans.push(updatedKey);
                }
                if (key.includes('plan_input') && String(key) !== "featureName" && notEmpty(value)) {
                  let updatedInputKey = key.replace('plan_input', '');
                  // Add the updatedInputKey to the plansInput array
                  planInputs[updatedInputKey] = String(value);
                }
              });
              // Add an object to the category_features_list array with the feature title and plans array
              let editObj: categoryFeaturesList = {
                feature_title: ele.featureName,
                plan: plans,
                planInputs: planInputs
              }
              if (this.editCategoryFeature) {
                editObj.id = ele.id;
              }
              category_features_list.push(editObj);

            });
          }

          // Create a final object with the title, category_id, and category_features_list array
          let finalObject: CategoryFeature = {
            title: title,
            category_id: this.category_id,
            category_features_list: category_features_list
          };
          if (this.editCategoryFeature) {
            finalObject.id = element.id;
          }

          // Add the final object to the data array
          data.push(finalObject);

        });
      }

      // return;
      let URL = this.baseURL + "api/category/" + this.category_id + "/features";
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let body = data;
      this.paginateSpinner = true;
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
        (response) => {
          let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          // console.log(decrypted_data)
          this.paginateSpinner = false;
          this.packageName.reset();
          this.closeProductFeatureClose.nativeElement.click();
          this.resetCategoryForm();

        },
        (error) => {
          console.log('Request failed with error', error);
          this.paginateSpinner = false;
        });
    } else {
      // Handle the case where the packageName property is not valid
    }
  }

  resetCategoryForm() {
    let featureFormArray = this.packageName.get('features') as FormArray;
    featureFormArray.clear();
    let object: any = {};
    this.categoryPlans.forEach((plan: any) => {
      object['featureName'] = '';
      object['id'] = null;
      object['plan_' + plan.product.id] = false;
      object['plan_input' + plan.product.id] = '';
    });

    featureFormArray.push(this.formBuilder.group({
        packageName: [],
        id: [null],
        featureList: this.formBuilder.array([
          this.formBuilder.group(object)
        ])
      })
    );
  }

  protected readonly moduleIds = moduleIds;
  protected readonly checkPermission = checkPermission;
}


export const atLeastOneCheckedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const controls = formGroup.controls;

  // Iterate through the checkboxes
  const isChecked = Object.keys(controls)
    .map(key => controls[key].value)
    .some(value => value === true);

  // Return validation result
  return isChecked ? null : {atLeastOneChecked: true};
};
