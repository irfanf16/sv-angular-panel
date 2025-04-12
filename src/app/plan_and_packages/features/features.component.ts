import {ChangeDetectorRef, Component, ElementRef, ViewChild, Input} from '@angular/core';
import {AppComponent} from "../../app.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {HttpHeaders} from "@angular/common/http";
import {RefreshTokenService} from "../../services/refresh-token.service";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {environment} from "../../../environments/environments";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {debounceTime, distinctUntilChanged, firstValueFrom, map, Observable, of, Subject} from "rxjs";
import {catchError} from 'rxjs/operators';
import {
  IServerResponse,
  Rules,
  Module,
  moduleNode,
  FeaturePlans
} from "../../Components/interfaces/plan_&_packages/features/features";
import {FeaturesConfig} from "../../Components/constants/plan_&_packages/features/features";
import {checkPermission, notEmpty} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {

// boolean variables to control UI elements and states
  showSpinner: boolean = false; // Indicates if the spinner should be shown
  showErrors: boolean = false; // Indicates if errors should be displayed
  showFeatureImage: boolean = false; // Indicates if the feature image should be shown
  subModulesDisplay: boolean = false; // Indicates if submodules should be displayed
  featureValueDisplay: boolean = false; // Indicates if feature values should be displayed
  subSubModulesDisplay: boolean = false; // Indicates if sub-sub-modules should be displayed
  fourthModulesDisplay: boolean = false; // Indicates if fourth-level modules should be displayed
  displayKeyOption: boolean = true; // Indicates if key options should be displayed
  showInfoBlock: boolean = false; // Indicates if the info block should be shown
  showKeyBlock: boolean = false; // Indicates if the key block should be shown
  loading!: boolean; // Indicates if the application is in a loading state
  offcanvasOpen = false; // Indicates if the off-canvas menu is open
  paginateSpinner: boolean = false; // Indicates if the pagination spinner should be shown
  DataFound: boolean = false; // Indicates if data was found
  DataFoundPagination: boolean = false; // Indicates if data was found during pagination
  editTrue: boolean = false; // Indicates if the edit mode is active
  featureAttachedWithActivePlan: boolean = false;

// number variables for pagination and identification
  index: number = 0; // Current index
  perPage: number = 20; // Items per page
  total: number = 0; // Total number of items
  p: number = 1; // Current page number
  company_id: number = 0; // Company ID
  feature_id: number = 0; // Feature ID
  moduleEditType: number = 0; // Type of module being edited
  featureEditID: number = 0; // ID of the feature being edited
  doneTypingInterval = 1000; // Interval for typing debounce in milliseconds

// string variables for URLs and user input
  baseURL: string = environment.apiBASEURL; // Base URL for API
  popupTitle: string = ""; // Title for popup dialogs
  imageUrl: string = ''; // URL for images
  searchQuery: string = ''; // Search query input by the user
  inputValue: string = ''; // General input value


// string[] arrays for storing multiple string values
  featuresCount: number[] = []; // Array to store feature counts
  base64Image: string[] = []; // Array to store base64 encoded images
  typeRows: string[] = ['']; // Array to store type rows
  @Input('data') feature_data: string[] = []; // Input data for features

// any type variables for dynamic data
  keyValues: any = []; // Array to store key values
  rules: any = {}; // Object to store rules
  Modules: any[] = []; // Array to store modules
  GlobalFilteredModules: any[] | undefined = []; // Array to store globally filtered modules
  featureKeyDetails: any[] = []; // Array to store feature key details

// FormGroup for managing form controls
  public featuresForm: FormGroup; // Form group for features

// Module[] arrays for storing module data
  subModules: Module[] | undefined = []; // Array to store sub-modules
  subSubModules: Module[] | undefined = []; // Array to store sub-sub-modules
  FourthLevelModules: Module[] | undefined = []; // Array to store fourth-level modules
//Record is here used to define an object type where the keys are of a specific type and the values are of another type.
  featurePlans: Record<number, FeaturePlans[]> = {};

// Observable for reactive programming
  features$: Observable<any> = new Observable<any>(); // Observable for features

// Subject for managing streams of data
  private searchQuery$ = new Subject<string>(); // Subject for search queries

// any type variable for timers
  typingTimer: any; // Timer for typing debounce

// ElementRef for accessing DOM elements
  @ViewChild('closeDeletePopup') closeDeletePopup!: ElementRef; // Reference to close delete popup element
  @ViewChild('moduleSelect') moduleSelect!: ElementRef; // Reference to module select element
  @ViewChild('subModuleSelect') subModuleSelect!: ElementRef; // Reference to sub-module select element
  @ViewChild('thirdModuleSelect') thirdModuleSelect!: ElementRef; // Reference to third module select element
  @ViewChild('fourModuleSelect') fourModuleSelect!: ElementRef; // Reference to fourth module select element
  @ViewChild('typeSelect') typeSelect!: ElementRef; // Reference to type select element
  @ViewChild('RuleDropdown') RuleDropdown!: ElementRef; // Reference to rule dropdown element
  @ViewChild('valueDropdown') valueDropdown!: ElementRef; // Reference to value dropdown element
  @ViewChild('AddEditPopup') AddEditPopup!: ElementRef; // Reference to add/edit popup element

  constructor(private appComponent: AppComponent, private breadcrumbService: BreadcrumbService,
              private cdr: ChangeDetectorRef, private refreshToken: RefreshTokenService, private httpClientRequest: HttpClientRequestService,
              private toastMessages: ToastMessagesComponent, private encryptDecrypt: EncryptDecryptService, private elementRef: ElementRef,
              private sanitizer: DomSanitizer, private formBuilder: FormBuilder
  ) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.featuresForm = this.formBuilder.group({
      module: ['', [Validators.required]],
      sub_module: [''],
      third_module: [''],
      fourth_module: [''],
      module_type: ['', [Validators.required]],
      module_features_list: this.formBuilder.array([]),

    });

    this.searchQuery$.pipe(
      debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
      distinctUntilChanged() // Ignore consecutive identical values
    )
      .subscribe((query) => {
        this.onSearch(query); // Call the search function when user stops typing
      });

  }

  onSearch(query: string) {
    console.log(query)
  }

  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs(FeaturesConfig.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(FeaturesConfig.COMP_NAME);
    this.getFeatures();
  }

  ngAfterViewInit() {
    this.AddEditPopup.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
      //reset form to its original form
      this.clearImage();
      this.featuresForm.reset();
    });
  }

  @ViewChild('closeModelBtn') closeModelBtn!: ElementRef;

  clearImage() {
    this.imageUrl = '';
    this.base64Image[this.index] = '';
    this.base64Image = [''];
  }

  closePopupForm() {
    this.closeModelBtn.nativeElement.click();
    //reset form to its original form
    this.featuresForm.reset();
    this.imageUrl = "";
    //close model after created successfully
  }

  submitFeature() {
    if (this.featuresForm.valid) {
      this.showErrors = false;
      this.showSpinner = true;
      let formData = this.featuresForm.value;
      let subModule: number = 0;
      let parentModule: number = 0;
      console.log(formData)

      if (formData.fourth_module !== undefined && formData.fourth_module !== null && formData.fourth_module !== "") {
        subModule = formData.fourth_module;
        parentModule = formData.third_module;
      } else if (formData.third_module !== undefined && formData.third_module !== null && formData.third_module !== "") {
        subModule = formData.third_module;
        parentModule = formData.sub_module;
      } else if (formData.sub_module !== undefined && formData.sub_module !== null && formData.sub_module !== "") {
        subModule = formData.sub_module;
        parentModule = formData.module;
      } else {
        parentModule = 0;
        subModule = formData.module;
      }

      let module_features_list: object = {};
      console.log('Path image: ' + this.base64Image);
      if (formData.module_features_list !== undefined && formData.module_features_list.length > 0) {
        formData.module_features_list.forEach((element: any, index: number) => {
          if (this.popupTitle == "Add") {
            module_features_list = {
              "type": formData.module_type,
              "rule": parseInt(formData.module_type) === 2 ? element.feature_key : "0",//parseInt(formData.module_type) === 1 ? element.feature_rule : null,
              "feature_key": parseInt(formData.module_type) === 2 ? element.feature_rule : "",//parseInt(formData.module_type) === 1 ? element.feature_key : "0",
              "feature_value": parseInt(formData.module_type) === 2 && element.feature_key === "input_field" ? element.feature_value : (parseInt(formData.module_type) === 2 && element.feature_key !== "input_field" ? "Unlimited" : ""),
              "feature_label": element.title,
              "image": this.base64Image[index],
              "status": "1",
              "content": element.description
            }
          } else {
            module_features_list = {
              "id": this.feature_id,
              "type": formData.module_type,
              "rule": parseInt(formData.module_type) === 2 ? element.feature_key : "0",//parseInt(formData.module_type) === 1 ? element.feature_rule : null,
              "feature_key": parseInt(formData.module_type) === 2 ? element.feature_rule : "",//parseInt(formData.module_type) === 1 ? element.feature_key : "0",
              "feature_value": parseInt(formData.module_type) === 2 && element.feature_key === "input_field" ? element.feature_value : (parseInt(formData.module_type) === 2 && element.feature_key !== "input_field" ? "Unlimited" : ""),
              "feature_label": element.title,
              "image": this.base64Image[index],
              "status": "1",
              "content": element.description
            }
          }
        });
      }

      let body = {
        "parent_module_id": parentModule,
        "sub_module_id": subModule,
        "status": 1, //1=Active,0=Inactive
        "module_features_list": [module_features_list]
      }
      if (this.popupTitle == "Add") {
        let URL = this.baseURL + 'api/features';
        let method = 'POST'
        let headers = new HttpHeaders({
          "Access-Control-Allow-Headers": 'accept',
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Origin": '*',
          "Content-Type": "application/json",
        });

        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
          (response) => {
            this.toastMessages.showToast('', 'Feature successfully created', 'success');

            //reset form to its original form
            this.featuresForm.reset();
            //close model after created successfully
            this.closeModelBtn.nativeElement.click();
            //stopped spinner
            this.showSpinner = false;
            //hide child modules
            this.subModulesDisplay = false;
            this.subSubModulesDisplay = false;
            this.fourthModulesDisplay = false;
            // console.log(this.base64Image[0]);
            this.getFeatures();

          },
          (error) => {
            this.showSpinner = false;
          });

      } else {
        let URL = this.baseURL + 'api/features/' + this.feature_id;
        let method = 'PUT'
        let headers = new HttpHeaders({
          "Access-Control-Allow-Headers": 'accept',
          "Access-Control-Allow-Methods": "PUT",
          "Access-Control-Allow-Origin": '*',
          "Content-Type": "application/json",
        });

        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
          (response) => {
            this.toastMessages.showToast('', 'Feature successfully updated', 'success');

            //reset form to its original form
            this.featuresForm.reset();
            //close model after created successfully
            this.closeModelBtn.nativeElement.click();
            //stopped spinner
            this.showSpinner = false;
            //hide child modules
            this.subModulesDisplay = false;
            this.subSubModulesDisplay = false;
            this.fourthModulesDisplay = false;
            // console.log(this.base64Image[0]);
            this.getFeatures();

          },
          (error) => {

            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            this.toastMessages.showToast('', decrypted_data.message, 'error');

            console.log(decrypted_data);

            this.showSpinner = false;
            // if (error.status == 401 && error.statusText == "Unauthorized" && error.error.message == "Unauthenticated.") {
            //
            //   this.refreshToken.refreshExpiredToken(URL, body, headers, method).subscribe(
            //     (data) => {
            //       // Handle the data received from the refreshExpiredToken method
            //     },
            //     (error) => {
            //       // Handle errors here
            //       console.error('Request failed with error', error);
            //       this.showSpinner = false;
            //     }
            //   );
            // }

          });
      }

    } else {
      console.log(this.featuresForm.value)
      this.showErrors = true;
      this.showSpinner = false;
    }


  }

  findChildrenById(childrenArray: any[], idToFind: number): any[] | undefined {
    // Define a recursive function to search for children
    function findChildrenRecursive(children: any[]): any[] | undefined {
      for (const child of children) {

        if (child.id === idToFind) {
          // If the current child's ID matches the ID to find, return its children
          return child.children;
        } else {
          if (typeof child.children !== "undefined" && child.children !== undefined) {
            // Recursively search through the current child's children
            const foundChildren = findChildrenRecursive(child.children);
            if (foundChildren !== undefined && foundChildren.length > 0) {
              return foundChildren; // Return the found children
            }
          }

        }
      }
      return []; // Return an empty array if no matching children are found
    }

    // Start the search from the top-level children
    return findChildrenRecursive(childrenArray);
  }

  get formControl() {
    return this.featuresForm.controls;
  }

  fetchModules() {
    this.popupTitle = "Add";
    let URL = this.baseURL + 'api/modules';
    let headers = new HttpHeaders({
      "Access-Control-Allow-Headers": 'accept',
      "Access-Control-Allow-Origin": '*',
      "Content-Type": "application/json",
    });
    let body = {};
    let method = "GET";

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        let modules = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        if (modules.length > 0) {
          this.Modules = modules;
          this.featuresForm.patchValue({module: ''});//set initial value empty for
          console.log('result', this.Modules)
        }

      },
      (error) => {

        // let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
        // this.toastMessages.showToast('', decrypted_data.message, 'error');

      });
    return this.Modules;
  }

  controlModuleChange(event: any) {
    let module_id = parseInt(event.target.value);
    let modules = this.findChildrenById(this.Modules, module_id);
    this.rules = this.findRulesById(this.Modules, module_id);

    if (modules !== undefined && modules.length > 0) {
      this.subModulesDisplay = true;
      this.subSubModulesDisplay = false;
      this.fourthModulesDisplay = false;
      this.subModules = modules;
      this.cdr.detectChanges();
    } else {
      this.subModulesDisplay = false;
      this.subSubModulesDisplay = false;
      this.fourthModulesDisplay = false;
      this.subModules = [];
      this.cdr.detectChanges();
    }

    // //set default value selection option
    this.featuresForm?.patchValue({
      sub_module: '',
      third_module: null,
      fourth_module: null,
    });

    this.controlKeyOptionDisplay();
  }

  controlSubModuleChange(event: any) {
    let module_id = parseInt(event.target.value);


    let modules = this.findChildrenById(this.Modules, module_id);
    this.rules = this.findRulesById(this.Modules, module_id);
    if (modules !== undefined && modules.length > 0) {
      this.subSubModulesDisplay = true;
      this.subSubModules = modules;
      this.cdr.detectChanges();
    } else {
      this.subSubModulesDisplay = false;
      this.fourthModulesDisplay = false;
      this.subSubModules = [];

      this.cdr.detectChanges();
    }
    this.featuresForm.patchValue({third_module: ''});

    this.controlKeyOptionDisplay();
  }

  controlThirdModuleChange(event: any) {

    let module_id = parseInt(event.target.value);
    let modules = this.findChildrenById(this.Modules, module_id);
    this.rules = this.findRulesById(this.Modules, module_id);
    if (modules !== undefined && modules.length > 0) {
      this.fourthModulesDisplay = true;
      this.FourthLevelModules = modules;
      this.cdr.detectChanges();
    } else {
      this.fourthModulesDisplay = false;
      this.FourthLevelModules = [];
      this.cdr.detectChanges();
    }
    this.featuresForm.patchValue({fourth_module: ''});


    this.controlKeyOptionDisplay();
  }

  controlForthModuleChange(event: any) {

    let module_id = parseInt(event.target.value);
    if (module_id > 0) {
      this.rules = this.findRulesById(this.Modules, module_id);
    }

    this.controlKeyOptionDisplay();

  }

  controlFeatureKeyChange(event: any, index: number, editTrue: boolean = false) {

    let feature_key = '';
    if (editTrue === true) {
      feature_key = String(this.featureKeyDetails[0].rule);
    } else {
      feature_key = String(event.target.value);
    }
    console.log(editTrue, feature_key)
    const metaDataFormArray = this.featuresForm.get('module_features_list') as FormArray;

    const control = metaDataFormArray.at(index);

    if (feature_key == "input_field") {

      control.get('feature_value')?.setValidators(Validators.required);
      control.updateValueAndValidity(); // Trigger re-validation

      this.featureValueDisplay = true;
      this.cdr.detectChanges();

      if (editTrue === true) {
        let featureValue = this.featureKeyDetails[0].feature_value;
        control.patchValue({feature_value: featureValue});
      }
    } else {
      control.get('feature_value')?.removeValidators(Validators.required);
      control.get('feature_value')?.setErrors(null);
      control.updateValueAndValidity(); // Trigger re-validation
      this.featureValueDisplay = false;
      this.cdr.detectChanges();
    }

  }

  onTypeChange(event: any) {
    console.log(this.rules)
    const selectedValue: number = parseInt(event.target.value);
    console.log(selectedValue)
    this.typeRows = [''];
    this.base64Image = [];
    // Get the prices FormArray and push the new FormGroup
    const metaDataFormArray = this.featuresForm.get('module_features_list') as FormArray;
    metaDataFormArray.clear();

    let featureKey: any = null;


    // Perform your desired action based on the selected value
    //Key = 1, info = 2
    if (this.rules.info !== undefined && this.rules.info.length > 0 && this.rules.implementation !== undefined && this.rules.implementation.length > 0 && selectedValue == 2) {

      // if (this.rules.info !== undefined && this.rules.info.length > 0 && this.rules.implementation !== undefined && this.rules.implementation.length > 0 && selectedValue == 1) {

      const newKeyFeaturesGroup = this.formBuilder.group({
        feature_rule: ['', [Validators.required]],
        feature_key: ['', [Validators.required]],
        feature_value: [''],
        title: ['', [Validators.required]],
        image: [''],
        description: [''],
      });

      metaDataFormArray.push(newKeyFeaturesGroup);

      this.showInfoBlock = false;
      this.showKeyBlock = true;
      this.cdr.detectChanges();


      let rule_html = '<option selected disabled hidden="hidden">Select Rule</option>';
      this.rules.implementation.forEach((element: Rules) => {//
        rule_html += '<option value="' + element.key + '"      > ' + element.title + ' </option>';
        this.keyValues[element.key] = element.values;
      });

      this.RuleDropdown.nativeElement.innerHTML = rule_html;

      if (this.editTrue) {

        if (this.moduleEditType == 2) {

          // featureRule = this.featureKeyDetails[0].rule;
          featureKey = this.featureKeyDetails[0].feature_key;

          setTimeout(() => {
            const control = metaDataFormArray.at(0);
            control.patchValue({feature_rule: featureKey});
            this.controlRuleChange('', true);
            this.featureValueDisplay = true//input will be visible in this case
          }, 100);
        }
      }

    } else {
      const newInfoFeaturesGroup = this.formBuilder.group({
        title: ['', [Validators.required]],
        image: [''],
        description: [''],
      })

      // Get the prices FormArray and push the new FormGroup

      metaDataFormArray.push(newInfoFeaturesGroup);

      this.showInfoBlock = true;
      this.showKeyBlock = false;
      this.cdr.detectChanges();
    }
    if (selectedValue === 2) {
      this.showFeatureImage = false;
      console.log('value', selectedValue, this.showFeatureImage)
      this.cdr.detectChanges();
    } else {
      this.showFeatureImage = true;
      this.cdr.detectChanges();
    }


  }

  controlRuleChange(event: any, editTrue: boolean = false) {

    console.log('controlRuleChange')
    let value_id: string = '';
    let key: string = '';

    if (editTrue) {
      value_id = this.RuleDropdown.nativeElement.getAttribute("feature-value");
      key = String(this.featureEditID);
    } else {
      value_id = event.target.getAttribute("feature-value");
      key = event.target.value;
    }

    let value_html = '<option selected disabled hidden="hidden">Select Value</option>';
    console.log(this.keyValues)
    let valueDropdown = this.elementRef.nativeElement.querySelector('#' + value_id);
    if (this.keyValues[key] !== undefined) {
      let values = this.keyValues[key];
      if (values !== undefined && values.length > 0) {
        values.forEach((value: string) => {
          if (value !== 'none') {
            value_html += '<option value="' + value + '">' + value + '</option>';
          }
        });
        valueDropdown.innerHTML = this.sanitizer.bypassSecurityTrustHtml(value_html);


        if (editTrue === true) {


          if (this.moduleEditType == 2) {

            let featureRule = this.featureKeyDetails[0].rule;

            setTimeout(() => {

              const metaDataFormArray = this.featuresForm.get('module_features_list') as FormArray;
              const control = metaDataFormArray.at(0);
              control.patchValue({feature_key: featureRule});

              this.controlFeatureKeyChange('', 0, true)
            }, 100);
          }
        }

      }
    }

  }

  findRulesById(modules: any[], id: number): { info: any[]; implementation: any[] } | null {
    for (const module of modules) {
      if (module.id === id) {
        return module.rules;
      } else {
        const foundInChildren = this.findRulesById(module.children, id);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return null;
  }

  controlKeyOptionDisplay() {
    if ((this.rules.info !== undefined && this.rules.info.length == 0 && this.rules.implementation !== undefined && this.rules.implementation.length == 0) || (this.rules.implementation !== undefined && this.rules.implementation.length == 0)) {
      this.displayKeyOption = false;
      this.cdr.detectChanges();
    } else {
      this.displayKeyOption = true;
      this.cdr.detectChanges();
    }
    this.featuresForm.patchValue({module_type: ''})
    this.typeRows = [];
  }

  cloneHtmlBlock() {
    let index = this.typeRows.length;
    let id = 'feature_key_' + index;
    let moduleType = this.elementRef.nativeElement.querySelector('#module_type');
    let moduleTypeId = parseInt(moduleType.value);
    const metaDataFormArray = this.featuresForm.get('module_features_list') as FormArray;

    //add form control depend on which type is selected key or Info
    // if (moduleTypeId === 1) {
    if (moduleTypeId === 2) {
      const newKeyFeaturesGroup = this.formBuilder.group({
        feature_rule: ['', [Validators.required]],
        feature_key: ['', [Validators.required]],
        feature_value: [''],
        title: ['', [Validators.required]],
        // image: [''],
        description: [''],
      });

      metaDataFormArray.push(newKeyFeaturesGroup);
    } else {
      const newInfoFeaturesGroup = this.formBuilder.group({
        title: ['', [Validators.required]],
        image: [''],
        description: [''],
      });
      metaDataFormArray.push(newInfoFeaturesGroup);
    }

    this.typeRows.push('');
    //delay html append, so html cloned and become part of dom
    setTimeout(() => {
      // Use setTimeout to wait for the DOM to update

      let KeyDropdown = this.elementRef.nativeElement.querySelector('#' + id);

      if (KeyDropdown) {
        let rule_html = '<option selected disabled hidden="hidden">Select Rule</option>';
        this.rules.implementation.forEach((element: Rules) => {
          rule_html += '<option value="' + element.key + '"> ' + element.title + ' </option>';
        });
        KeyDropdown.innerHTML = this.sanitizer.bypassSecurityTrustHtml(rule_html);
      }
    }, 100);
    // KeyDropdown.innerHTML = rule_html
  }

  onFileChange(event: any, index: number) {
    console.log(index)
    this.index = index;
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  handleReaderLoaded(event: any) {
    let imageFile = 'data:image/png;base64,' + btoa(event.target.result)//this.handleReaderLoaded.bind(this);
    this.base64Image[this.index] = imageFile;
    this.imageUrl = imageFile;
  }


  findChildrenBymoduleId(childrenArray: any[], newArray: any[]): any[] | undefined {
    let maxDepth = 0;

    // Function to calculate the maximum depth
    function calculateMaxDepth(children: any[], currentDepth: number) {
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }
      for (const child of children) {
        if (child.children !== undefined && child.children.length > 0) {
          calculateMaxDepth(child.children, currentDepth + 1);
        }
      }
    }

    // Calculate the maximum depth
    calculateMaxDepth(childrenArray, 1);

    // Recursive function to search for children
    function findChildrenRecursive(children: any[], currentDepth: number): any[] | undefined {
      for (const child of children) {
        newArray[child.id] = child;
        if (currentDepth < maxDepth && child.children !== undefined && child.children.length > 0) {
          // Recursively search through the current child's children
          const foundChildren = findChildrenRecursive(child.children, currentDepth + 1);
          if (foundChildren !== undefined && foundChildren.length > 0) {
            foundChildren.forEach((element: any) => {
              newArray[element.id] = element;
            });
          }
        }
      }
      return newArray;
    }

    // Start the search from the top-level children
    return findChildrenRecursive(childrenArray, 1);
  }

  moduleFilteration(response: any) {

    let filteredModules: any[] | undefined = [];
    let modulelist: any[] = [];
    if (this.Modules.length > 0) {
      modulelist = this.Modules;
      filteredModules = this.findChildrenBymoduleId(modulelist, []);
    } else {
      let modules = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
      if (modules && modules.length > 0) {
        modulelist = modules;

        this.Modules = modulelist;
        filteredModules = this.findChildrenBymoduleId(modulelist, []);

      }
    }

    return filteredModules;
  }

  onInputChange() {
    this.searchQuery$.next(this.searchQuery); // Push the search query to the observable
  }

  featureFilteration(response: any, filteredModules: any, flag: boolean) {

    // console.log('feature response:', response);
    let features: any[] = [];
    if (flag) {
      features = response.items;
    } else {
      let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
      //assign feature plan
      if (decrypted_data.featuresPlans !== undefined) {
        this.featurePlans = decrypted_data.featuresPlans;
      }

      features = decrypted_data.features.data;
      console.log('zvsdv', decrypted_data);
      if (decrypted_data.featuresCount !== undefined && decrypted_data.featuresCount.length > 0) {
        decrypted_data.featuresCount.forEach((element: any, index: number) => {
          if (this.featuresCount[element.feature_id] === undefined) {
            this.featuresCount[element.feature_id] = element.feature_count;
          } else {
            this.featuresCount[element.feature_id] = element.feature_count;
          }
        });
      }
      console.log(this.featuresCount)
      this.total = decrypted_data.features.total;
    }

    this.cdr.detectChanges();
    if (features.length > 0) {
      this.DataFound = false;
      this.DataFoundPagination = true;
      features.forEach((feature: any) => {
        // Access properties and perform operations
        if (feature.parent_module_id != null && feature.parent_module_id != '') {
          // Access filteredModules and update properties
          if (filteredModules !== undefined && typeof filteredModules[feature.parent_module_id] !== "undefined" && filteredModules[feature.parent_module_id] != undefined) {
            feature.parent_module_title = filteredModules[feature.parent_module_id]['title'];
          } else {
            // console.log('Parent module id: ' + feature.parent_module_id);
            feature.parent_module_title = "---";
          }
        }

        if (feature.sub_module_id != null && feature.sub_module_id != '') {
          if (filteredModules !== undefined && typeof filteredModules[feature.sub_module_id] !== "undefined" && filteredModules[feature.sub_module_id] != undefined) {
            feature.sub_module_title = filteredModules[feature.sub_module_id]['title']
          } else {
            // console.log('sub module id: ' + feature.sub_module_id);
            feature.sub_module_title = '---';
          }
        }

        if (feature.type == 2) {
          feature.typeName = "Key";
        } else if (feature.type == 1) {
          feature.typeName = "Info";
        }
        // Similar operations for other properties
      });
      this.features$ = of(features);
    } else {
      this.DataFound = true;
      this.DataFoundPagination = false;
    }
  }

  fetchFeatures(filteredModules: any, search: string = '') {
    // Code for feature fetching
    let URL: string = '';
    if (search !== '') {
      URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1&search=' + search;
    } else {
      URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1';
    }


    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = '';

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {
        // console.log(response, 'final')

        this.featureFilteration(response, filteredModules, false)
      },
      (error) => {
        //error() callback
        // this.toastMessages.decryptAndDisplayErrorMessage(error,'getFeatures');

      });
  }

  getStripeIdsByFeatureId(featureId: number): string[] {
    const plans = this.featurePlans[featureId];
    if (!plans) {
      return []; // Return an empty array if no plans are found for the feature_id
    }
    return plans.map(plan => plan.stripe_id);
  }

  getFeatures() {
    if(!checkPermission(moduleIds.features, 'read')){
      this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
      return;
    }

    this.paginateSpinner = true;
    // Code for module fetching
    let filteredModules: any[] | undefined = [];
    let URL = this.baseURL + 'api/modules';
    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = {};
    let method = "GET";

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        this.paginateSpinner = false;
        this.p = 1;
        // @ts-ignore
        filteredModules = this.moduleFilteration(response);
        this.GlobalFilteredModules = filteredModules;

        this.fetchFeatures(filteredModules)
      },
      (error) => {
      });
  }

  getPage(page: number) {
    this.loading = true;
    this.serverCall(this.feature_data, page, this.total, this.perPage).subscribe({
      next: (res: any) => {
        let modules = this.Modules;

        let filteredModules = this.moduleFilteration(modules);
        this.featureFilteration(res, filteredModules, true);

        this.total = res.total;
        this.p = page;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching features:', error);
        this.loading = false;
      }
    });
  }

  serverCall(feature_data: string[], page: number, total: number, per_Page: number): Observable<IServerResponse> {
    this.paginateSpinner = true;
    const perPage = per_Page;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    let data: any;
    let decrypted_data: object = {};
    let company_id = this.company_id;
    let URL: string = "";
    URL = this.baseURL + "api/features?limit=" + this.perPage + "&page=" + page;

    let body = '';
    const headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('ddd', decryptedData)
        this.paginateSpinner = false;
        // console.log('decryptedData');
        // console.log(decryptedData);
        return {
          items: decryptedData.features.data,
          total: decryptedData.features.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );
  }

  assignFeatureID(id: number) {
    this.feature_id = id;
  }

  deleteFeature() {

    let URL = this.baseURL + "api/features/" + this.feature_id;
    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = "";
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe(
      (response) => {
        this.cdr.detectChanges();
        this.toastMessages.showToast('', 'Feature successfully deleted', 'success');
        this.closeDeletePopup.nativeElement.click();
        this.getFeatures();
      },
      (error) => {
        //error() callback
        console.log('Request failed with error', error);
      });

  }

  getAncestors(target: number, children: moduleNode[], ancestors: number[] = []): number[] | undefined {
    for (const moduleNode of children) {
      if (moduleNode.id === target) {
        return [...ancestors, moduleNode.id];
      }
      const found = this.getAncestors(target, moduleNode.children, [...ancestors, moduleNode.id]);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  async fetchData(featureID:number) {
    try {
      // Perform the first request and wait for it to complete
      const firstResponse:any = await this.checkPlansActivationStatus(featureID);
      console.log('First response:', firstResponse);
      if (firstResponse && firstResponse.app_data !== undefined) {
        let decryptedResponse = JSON.parse(this.encryptDecrypt.decrypt(firstResponse.app_data));
        console.log('First request decrypted data:', decryptedResponse);

        this.featureAttachedWithActivePlan = (decryptedResponse.company !== undefined && decryptedResponse.company.data !== undefined && decryptedResponse.company.data.length > 0) || (decryptedResponse.subscription !== undefined && decryptedResponse.subscription.data !== undefined && decryptedResponse.subscription.data.length > 0);

        //fetch feature Data for edit purpose
        setTimeout(() => {this.fetchFeatureData(featureID)}, 50)

      } else {
        console.warn('First response is undefined or does not contain app_data');
      }



    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  async checkPlansActivationStatus(featureID:number): Promise<any>{
    const featurePlans: string[] = this.getStripeIdsByFeatureId(featureID);
    console.log(featurePlans)

    let planSubscriptionStatusURL:string = this.baseURL + 'api/company/search/subscriptions';
    let planSubscriptionStatusHeaders: HttpHeaders = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let planSubscriptionStatusBody:{plan_id: string[] | string, check_double_plan_activation: number}  = {plan_id: featurePlans, check_double_plan_activation: 1};
    let methodSubscription = "POST";
    this.showSpinner = true;
    return await firstValueFrom(this.httpClientRequest.initiateHttpRequest(planSubscriptionStatusURL, planSubscriptionStatusBody, planSubscriptionStatusHeaders, methodSubscription));
  }

  async getSingleFeature(featureID: number) {
    await this.fetchData(featureID);
  }

  fetchFeatureData(featureID:number) {
    let URL = this.baseURL + "api/features/" + featureID;
    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = "";

    this.editTrue = true;

    this.fetchModules();
    let decrypted_data: any;
    this.popupTitle = 'Edit';

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {
        this.showSpinner = false;
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('resultData', decrypted_data)
        let hiearchyArray: any[] = [];
        if (decrypted_data.feature != undefined || decrypted_data.feature != null || decrypted_data.feature != "") {
          let feature = decrypted_data.feature;

          let modules = this.Modules;

          let lowestlevelmoduleID = feature.sub_module_id;

          const ancestors = this.getAncestors(lowestlevelmoduleID, modules);
          if (ancestors !== undefined) {
            hiearchyArray = ancestors;
          } else {
            hiearchyArray = []; // Assign an empty array if ancestors is undefined
          }


          // Set form values with data from featuresForm
          this.featuresForm.patchValue({
            module: hiearchyArray[0],
          });
          let moduleElement = this.moduleSelect.nativeElement as HTMLSelectElement;
          moduleElement.dispatchEvent(new Event('change'));


          if (hiearchyArray.length > 1) {
            this.featuresForm.patchValue({
              sub_module: hiearchyArray[1],
            });
            let submoduleElement = this.subModuleSelect.nativeElement as HTMLSelectElement;
            submoduleElement.dispatchEvent(new Event('change'));
          }
          if (hiearchyArray.length > 2) {
            this.featuresForm.patchValue({
              third_module: hiearchyArray[2],
            });
            let thirdModuleElement = this.thirdModuleSelect.nativeElement as HTMLSelectElement;
            thirdModuleElement.dispatchEvent(new Event('change'));
          }

          if (hiearchyArray.length > 2) {
            this.featuresForm.patchValue({
              fourth_module: hiearchyArray[3],
            });
            let fourModuleElement = this.fourModuleSelect.nativeElement as HTMLSelectElement;
            fourModuleElement.dispatchEvent(new Event('change'));
          }

          // console.log('feature.features_list[0].module_type')
          // console.log(feature.features_list);

          this.featuresForm.patchValue({
            module_type: feature.features_list[0].type,
          });


          let moduleType = feature.features_list[0].type;
          this.moduleEditType = moduleType;
          this.featureKeyDetails = feature.features_list;
          this.featureEditID = feature.features_list[0].feature_key;

          this.featuresForm.patchValue({
            module_type: moduleType,
          });

          let typeElement = this.typeSelect.nativeElement as HTMLSelectElement;
          typeElement.dispatchEvent(new Event('change'));

          const metaDataFormArray = this.featuresForm.get('module_features_list') as FormArray;
          const control = metaDataFormArray.at(0);

          //   if (featureKey == "input_field") {
          //     let featureValue = feature.features_list[0].feature_value;
          //     control.get('feature_value')?.patchValue(featureValue);
          //   }
          // }

          let featureTitle = feature.features_list[0].feature_label;
          control.get('title')?.patchValue(featureTitle);

          let featureDescription = feature.features_list[0].content;
          control.get('description')?.patchValue(featureDescription);

          let featureImage = feature.features_list[0].image;
          if (featureImage !== "" && featureImage) {
            this.imageUrl = featureImage;
          }
          this.assignFeatureID(featureID);

          if(this.featureAttachedWithActivePlan){
            this.featuresForm.disable();
          }
          else{
            this.featuresForm.enable();
          }
        }
      },
      (error) => {
        //error() callback
        console.log('Request failed with error', error);
        let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
        this.toastMessages.showToast('', 'getCategories: ' + decrypted_data.data.error, 'error');
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

  onStoppedTyping() {
    // Trigger your desired action here
    let URL: string = '';

    URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1&search=' + this.inputValue;
    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = '';
    this.paginateSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {
        this.featureFilteration(response, this.GlobalFilteredModules, false);
        this.paginateSpinner = false;
      },
      (error) => {
        this.paginateSpinner = false;
      });
  }

  clearUpdatePropertiesFromFeaturesList(feature: any, propertiesToRemove: any) {
    const updatedFeature = {...feature};


    if (updatedFeature.features_list) {

      updatedFeature["module_features_list"] = updatedFeature.features_list.map((item: any) => {
        // Create a new object excluding the specified properties
        const updatedItem = {...item};
        updatedItem["feature_label"] = updatedItem["feature_label"] + " Cloned";

        propertiesToRemove.forEach((prop: any) => {
          delete updatedItem[prop];

          if (updatedFeature[prop] !== undefined) {
            delete updatedFeature[prop];
          }
        });
        return updatedItem;
      });
      delete updatedFeature["features_list"];
    }
    return updatedFeature;
  }

  cloneFeature(featureID: number) {
    let URL = this.baseURL + "api/features/" + featureID;
    let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
    let body = "";
    this.paginateSpinner = true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe(
      (response) => {

        let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        console.log('resultData', decrypted_data)
        if (notEmpty(decrypted_data.feature)) {
          let clonedBody = this.clearUpdatePropertiesFromFeaturesList(decrypted_data.feature, ['id', 'deleted_at', 'created_at', 'updated_at']);

          let URL1 = this.baseURL + 'api/features';
          let method1 = 'POST'
          let headers1 = new HttpHeaders({
            "Access-Control-Allow-Headers": 'accept',
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
          });

          this.httpClientRequest.initiateHttpRequest(URL1, clonedBody, headers1, method1).subscribe(
            (response) => {
              this.toastMessages.showToast('', 'Feature cloned successfully', 'success');
              this.getFeatures();
            },
            (error) => {
              this.paginateSpinner = false;
            });
        }
      },
      (error) => {
        this.paginateSpinner = false;
        //error() callback
        console.log('Request failed with error', error);
      });
  }

    protected readonly moduleIds = moduleIds;
    protected readonly checkPermission = checkPermission;
}
