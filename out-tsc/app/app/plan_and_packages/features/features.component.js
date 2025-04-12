import { __decorate } from "tslib";
import { Component, ViewChild, Input } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environments";
import { Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged, map, Observable, of, Subject } from "rxjs";
import { catchError } from 'rxjs/operators';
import { FeaturesConfig } from "../../Components/constants/plan_&_packages/features/features";
let FeaturesComponent = class FeaturesComponent {
    constructor(appComponent, breadcrumbService, cdr, refreshToken, httpClientRequest, toastMessages, encryptDecrypt, elementRef, sanitizer, formBuilder) {
        this.appComponent = appComponent;
        this.breadcrumbService = breadcrumbService;
        this.cdr = cdr;
        this.refreshToken = refreshToken;
        this.httpClientRequest = httpClientRequest;
        this.toastMessages = toastMessages;
        this.encryptDecrypt = encryptDecrypt;
        this.elementRef = elementRef;
        this.sanitizer = sanitizer;
        this.formBuilder = formBuilder;
        // boolean variables to control UI elements and states
        this.showSpinner = false; // Indicates if the spinner should be shown
        this.showErrors = false; // Indicates if errors should be displayed
        this.showFeatureImage = false; // Indicates if the feature image should be shown
        this.subModulesDisplay = false; // Indicates if sub-modules should be displayed
        this.featureValueDisplay = false; // Indicates if feature values should be displayed
        this.subSubModulesDisplay = false; // Indicates if sub-sub-modules should be displayed
        this.fourthModulesDisplay = false; // Indicates if fourth-level modules should be displayed
        this.displayKeyOption = true; // Indicates if key options should be displayed
        this.showInfoBlock = false; // Indicates if the info block should be shown
        this.showKeyBlock = false; // Indicates if the key block should be shown
        this.offcanvasOpen = false; // Indicates if the off-canvas menu is open
        this.paginateSpinner = false; // Indicates if the pagination spinner should be shown
        this.DataFound = false; // Indicates if data was found
        this.DataFoundPagination = false; // Indicates if data was found during pagination
        this.editTrue = false; // Indicates if the edit mode is active
        // number variables for pagination and identification
        this.index = 0; // Current index
        this.perPage = 20; // Items per page
        this.total = 0; // Total number of items
        this.p = 1; // Current page number
        this.company_id = 0; // Company ID
        this.feature_id = 0; // Feature ID
        this.moduleEditType = 0; // Type of module being edited
        this.featureEditID = 0; // ID of the feature being edited
        this.doneTypingInterval = 1000; // Interval for typing debounce in milliseconds
        // string variables for URLs and user input
        this.baseURL = environment.apiBASEURL; // Base URL for API
        this.popupTitle = ""; // Title for popup dialogs
        this.imageUrl = ''; // URL for images
        this.searchQuery = ''; // Search query input by the user
        this.inputValue = ''; // General input value
        // string[] arrays for storing multiple string values
        this.featuresCount = []; // Array to store feature counts
        this.base64Image = []; // Array to store base64 encoded images
        this.typeRows = ['']; // Array to store type rows
        this.feature_data = []; // Input data for features
        // any type variables for dynamic data
        this.keyValues = []; // Array to store key values
        this.rules = {}; // Object to store rules
        this.Modules = []; // Array to store modules
        this.GlobalFilteredModules = []; // Array to store globally filtered modules
        this.featureKeyDetails = []; // Array to store feature key details
        // Module[] arrays for storing module data
        this.subModules = []; // Array to store sub-modules
        this.subSubModules = []; // Array to store sub-sub-modules
        this.FourthLevelModules = []; // Array to store fourth-level modules
        // Observable for reactive programming
        this.features$ = new Observable(); // Observable for features
        // Subject for managing streams of data
        this.searchQuery$ = new Subject(); // Subject for search queries
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
        this.searchQuery$.pipe(debounceTime(500), // Adjust the-debounce time as needed (milliseconds)
        distinctUntilChanged() // Ignore consecutive identical values
        )
            .subscribe((query) => {
            this.onSearch(query); // Call the search function when user stops typing
        });
    }
    onSearch(query) {
        console.log(query);
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
            let subModule = 0;
            let parentModule = 0;
            console.log(formData);
            if (formData.fourth_module !== undefined && formData.fourth_module !== null && formData.fourth_module !== "") {
                subModule = formData.fourth_module;
                parentModule = formData.third_module;
            }
            else if (formData.third_module !== undefined && formData.third_module !== null && formData.third_module !== "") {
                subModule = formData.third_module;
                parentModule = formData.sub_module;
            }
            else if (formData.sub_module !== undefined && formData.sub_module !== null && formData.sub_module !== "") {
                subModule = formData.sub_module;
                parentModule = formData.module;
            }
            else {
                parentModule = 0;
                subModule = formData.module;
            }
            let module_features_list = {};
            console.log('Path image: ' + this.base64Image);
            if (formData.module_features_list !== undefined && formData.module_features_list.length > 0) {
                formData.module_features_list.forEach((element, index) => {
                    if (this.popupTitle == "Add") {
                        module_features_list = {
                            "type": formData.module_type,
                            "rule": parseInt(formData.module_type) === 2 ? element.feature_key : "0", //parseInt(formData.module_type) === 1 ? element.feature_rule : null,
                            "feature_key": parseInt(formData.module_type) === 2 ? element.feature_rule : "", //parseInt(formData.module_type) === 1 ? element.feature_key : "0",
                            "feature_value": parseInt(formData.module_type) === 2 && element.feature_key === "input_field" ? element.feature_value : (parseInt(formData.module_type) === 2 && element.feature_key !== "input_field" ? "Unlimited" : ""),
                            "feature_label": element.title,
                            "image": this.base64Image[index],
                            "status": "1",
                            "content": element.description
                        };
                    }
                    else {
                        module_features_list = {
                            "id": this.feature_id,
                            "type": formData.module_type,
                            "rule": parseInt(formData.module_type) === 2 ? element.feature_key : "0", //parseInt(formData.module_type) === 1 ? element.feature_rule : null,
                            "feature_key": parseInt(formData.module_type) === 2 ? element.feature_rule : "", //parseInt(formData.module_type) === 1 ? element.feature_key : "0",
                            "feature_value": parseInt(formData.module_type) === 2 && element.feature_key === "input_field" ? element.feature_value : (parseInt(formData.module_type) === 2 && element.feature_key !== "input_field" ? "Unlimited" : ""),
                            "feature_label": element.title,
                            "image": this.base64Image[index],
                            "status": "1",
                            "content": element.description
                        };
                    }
                });
            }
            let body = {
                "parent_module_id": parentModule,
                "sub_module_id": subModule,
                "status": 1, //1=Active,0=Inactive
                "module_features_list": [module_features_list]
            };
            if (this.popupTitle == "Add") {
                let URL = this.baseURL + 'api/features';
                let method = 'POST';
                let headers = new HttpHeaders({
                    "Access-Control-Allow-Headers": 'accept',
                    "Access-Control-Allow-Methods": "POST",
                    "Access-Control-Allow-Origin": '*',
                    "Content-Type": "application/json",
                });
                this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
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
                }, (error) => {
                    this.showSpinner = false;
                });
            }
            else {
                let URL = this.baseURL + 'api/features/' + this.feature_id;
                let method = 'PUT';
                let headers = new HttpHeaders({
                    "Access-Control-Allow-Headers": 'accept',
                    "Access-Control-Allow-Methods": "PUT",
                    "Access-Control-Allow-Origin": '*',
                    "Content-Type": "application/json",
                });
                this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
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
                }, (error) => {
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
        }
        else {
            console.log(this.featuresForm.value);
            this.showErrors = true;
            this.showSpinner = false;
        }
    }
    findChildrenById(childrenArray, idToFind) {
        // Define a recursive function to search for children
        function findChildrenRecursive(children) {
            for (const child of children) {
                if (child.id === idToFind) {
                    // If the current child's ID matches the ID to find, return its children
                    return child.children;
                }
                else {
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
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            let modules = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            if (modules.length > 0) {
                this.Modules = modules;
                this.featuresForm.patchValue({ module: '' }); //set initial value empty for
                console.log('result', this.Modules);
            }
        }, (error) => {
            // let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            // this.toastMessages.showToast('', decrypted_data.message, 'error');
        });
        return this.Modules;
    }
    controlModuleChange(event) {
        let module_id = parseInt(event.target.value);
        let modules = this.findChildrenById(this.Modules, module_id);
        this.rules = this.findRulesById(this.Modules, module_id);
        if (modules !== undefined && modules.length > 0) {
            this.subModulesDisplay = true;
            this.subSubModulesDisplay = false;
            this.fourthModulesDisplay = false;
            this.subModules = modules;
            this.cdr.detectChanges();
        }
        else {
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
    controlSubModuleChange(event) {
        let module_id = parseInt(event.target.value);
        let modules = this.findChildrenById(this.Modules, module_id);
        this.rules = this.findRulesById(this.Modules, module_id);
        if (modules !== undefined && modules.length > 0) {
            this.subSubModulesDisplay = true;
            this.subSubModules = modules;
            this.cdr.detectChanges();
        }
        else {
            this.subSubModulesDisplay = false;
            this.fourthModulesDisplay = false;
            this.subSubModules = [];
            this.cdr.detectChanges();
        }
        this.featuresForm.patchValue({ third_module: '' });
        this.controlKeyOptionDisplay();
    }
    controlThirdModuleChange(event) {
        let module_id = parseInt(event.target.value);
        let modules = this.findChildrenById(this.Modules, module_id);
        this.rules = this.findRulesById(this.Modules, module_id);
        if (modules !== undefined && modules.length > 0) {
            this.fourthModulesDisplay = true;
            this.FourthLevelModules = modules;
            this.cdr.detectChanges();
        }
        else {
            this.fourthModulesDisplay = false;
            this.FourthLevelModules = [];
            this.cdr.detectChanges();
        }
        this.featuresForm.patchValue({ fourth_module: '' });
        this.controlKeyOptionDisplay();
    }
    controlForthModuleChange(event) {
        let module_id = parseInt(event.target.value);
        if (module_id > 0) {
            this.rules = this.findRulesById(this.Modules, module_id);
        }
        this.controlKeyOptionDisplay();
    }
    controlFeatureKeyChange(event, index, editTrue = false) {
        let feature_key = '';
        if (editTrue === true) {
            feature_key = String(this.featureKeyDetails[0].rule);
        }
        else {
            feature_key = String(event.target.value);
        }
        console.log(editTrue, feature_key);
        const metaDataFormArray = this.featuresForm.get('module_features_list');
        const control = metaDataFormArray.at(index);
        if (feature_key == "input_field") {
            control.get('feature_value')?.setValidators(Validators.required);
            control.updateValueAndValidity(); // Trigger re-validation
            this.featureValueDisplay = true;
            this.cdr.detectChanges();
            if (editTrue === true) {
                let featureValue = this.featureKeyDetails[0].feature_value;
                control.patchValue({ feature_value: featureValue });
            }
        }
        else {
            control.get('feature_value')?.removeValidators(Validators.required);
            control.get('feature_value')?.setErrors(null);
            control.updateValueAndValidity(); // Trigger re-validation
            this.featureValueDisplay = false;
            this.cdr.detectChanges();
        }
    }
    onTypeChange(event) {
        console.log(this.rules);
        const selectedValue = parseInt(event.target.value);
        console.log(selectedValue);
        this.typeRows = [''];
        this.base64Image = [];
        // Get the prices FormArray and push the new FormGroup
        const metaDataFormArray = this.featuresForm.get('module_features_list');
        metaDataFormArray.clear();
        let featureKey = null;
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
            this.rules.implementation.forEach((element) => {
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
                        control.patchValue({ feature_rule: featureKey });
                        this.controlRuleChange('', true);
                        this.featureValueDisplay = true; //input will be visible in this case
                    }, 100);
                }
            }
        }
        else {
            const newInfoFeaturesGroup = this.formBuilder.group({
                title: ['', [Validators.required]],
                image: [''],
                description: [''],
            });
            // Get the prices FormArray and push the new FormGroup
            metaDataFormArray.push(newInfoFeaturesGroup);
            this.showInfoBlock = true;
            this.showKeyBlock = false;
            this.cdr.detectChanges();
        }
        if (selectedValue === 2) {
            this.showFeatureImage = false;
            console.log('value', selectedValue, this.showFeatureImage);
            this.cdr.detectChanges();
        }
        else {
            this.showFeatureImage = true;
            this.cdr.detectChanges();
        }
    }
    controlRuleChange(event, editTrue = false) {
        console.log('controlRuleChange');
        let value_id = '';
        let key = '';
        if (editTrue) {
            value_id = this.RuleDropdown.nativeElement.getAttribute("feature-value");
            key = String(this.featureEditID);
        }
        else {
            value_id = event.target.getAttribute("feature-value");
            key = event.target.value;
        }
        let value_html = '<option selected disabled hidden="hidden">Select Value</option>';
        console.log(this.keyValues);
        let valueDropdown = this.elementRef.nativeElement.querySelector('#' + value_id);
        if (this.keyValues[key] !== undefined) {
            let values = this.keyValues[key];
            if (values !== undefined && values.length > 0) {
                values.forEach((value) => {
                    if (value !== 'none') {
                        value_html += '<option value="' + value + '">' + value + '</option>';
                    }
                });
                valueDropdown.innerHTML = this.sanitizer.bypassSecurityTrustHtml(value_html);
                if (editTrue === true) {
                    if (this.moduleEditType == 2) {
                        let featureRule = this.featureKeyDetails[0].rule;
                        setTimeout(() => {
                            const metaDataFormArray = this.featuresForm.get('module_features_list');
                            const control = metaDataFormArray.at(0);
                            control.patchValue({ feature_key: featureRule });
                            this.controlFeatureKeyChange('', 0, true);
                        }, 100);
                    }
                }
            }
        }
    }
    findRulesById(modules, id) {
        for (const module of modules) {
            if (module.id === id) {
                return module.rules;
            }
            else {
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
        }
        else {
            this.displayKeyOption = true;
            this.cdr.detectChanges();
        }
        this.featuresForm.patchValue({ module_type: '' });
        this.typeRows = [];
    }
    cloneHtmlBlock() {
        let index = this.typeRows.length;
        let id = 'feature_key_' + index;
        let moduleType = this.elementRef.nativeElement.querySelector('#module_type');
        let moduleTypeId = parseInt(moduleType.value);
        const metaDataFormArray = this.featuresForm.get('module_features_list');
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
        }
        else {
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
                this.rules.implementation.forEach((element) => {
                    rule_html += '<option value="' + element.key + '"> ' + element.title + ' </option>';
                });
                KeyDropdown.innerHTML = this.sanitizer.bypassSecurityTrustHtml(rule_html);
            }
        }, 100);
        // KeyDropdown.innerHTML = rule_html
    }
    onFileChange(event, index) {
        console.log(index);
        this.index = index;
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = this.handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file);
        }
    }
    handleReaderLoaded(event) {
        let imageFile = 'data:image/png;base64,' + btoa(event.target.result); //this.handleReaderLoaded.bind(this);
        this.base64Image[this.index] = imageFile;
        this.imageUrl = imageFile;
    }
    findChildrenBymoduleId(childrenArray, newArray) {
        let maxDepth = 0;
        // Function to calculate the maximum depth
        function calculateMaxDepth(children, currentDepth) {
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
        function findChildrenRecursive(children, currentDepth) {
            for (const child of children) {
                newArray[child.id] = child;
                if (currentDepth < maxDepth && child.children !== undefined && child.children.length > 0) {
                    // Recursively search through the current child's children
                    const foundChildren = findChildrenRecursive(child.children, currentDepth + 1);
                    if (foundChildren !== undefined && foundChildren.length > 0) {
                        foundChildren.forEach((element) => {
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
    moduleFilteration(response) {
        let filteredModules = [];
        let modulelist = [];
        if (this.Modules.length > 0) {
            modulelist = this.Modules;
            filteredModules = this.findChildrenBymoduleId(modulelist, []);
        }
        else {
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
    featureFilteration(response, filteredModules, flag) {
        // console.log('feature response:', response);
        let features = [];
        if (flag) {
            features = response.items;
        }
        else {
            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            features = decrypted_data.features.data;
            console.log(decrypted_data);
            if (decrypted_data.featuresCount !== undefined && decrypted_data.featuresCount.length > 0) {
                decrypted_data.featuresCount.forEach((element, index) => {
                    if (this.featuresCount[element.feature_id] === undefined) {
                        this.featuresCount[element.feature_id] = element.feature_count;
                    }
                    else {
                        this.featuresCount[element.feature_id] = element.feature_count;
                    }
                });
            }
            console.log(this.featuresCount);
            this.total = decrypted_data.features.total;
        }
        this.cdr.detectChanges();
        if (features.length > 0) {
            this.DataFound = false;
            this.DataFoundPagination = true;
            features.forEach((feature) => {
                // Access properties and perform operations
                if (feature.parent_module_id != null && feature.parent_module_id != '') {
                    // Access filteredModules and update properties
                    if (filteredModules !== undefined && typeof filteredModules[feature.parent_module_id] !== "undefined" && filteredModules[feature.parent_module_id] != undefined) {
                        feature.parent_module_title = filteredModules[feature.parent_module_id]['title'];
                    }
                    else {
                        // console.log('Parent module id: ' + feature.parent_module_id);
                        feature.parent_module_title = "---";
                    }
                }
                if (feature.sub_module_id != null && feature.sub_module_id != '') {
                    if (filteredModules !== undefined && typeof filteredModules[feature.sub_module_id] !== "undefined" && filteredModules[feature.sub_module_id] != undefined) {
                        feature.sub_module_title = filteredModules[feature.sub_module_id]['title'];
                    }
                    else {
                        // console.log('sub module id: ' + feature.sub_module_id);
                        feature.sub_module_title = '---';
                    }
                }
                if (feature.type == 2) {
                    feature.typeName = "Key";
                }
                else if (feature.type == 1) {
                    feature.typeName = "Info";
                }
                // Similar operations for other properties
            });
            this.features$ = of(features);
        }
        else {
            this.DataFound = true;
            this.DataFoundPagination = false;
        }
    }
    fetchFeatures(filteredModules, search = '') {
        // Code for feature fetching
        let URL = '';
        if (search !== '') {
            URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1&search=' + search;
        }
        else {
            URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1';
        }
        let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        let body = '';
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe((response) => {
            // console.log(response, 'final')
            this.featureFilteration(response, filteredModules, false);
        }, (error) => {
            //error() callback
            // this.toastMessages.decryptAndDisplayErrorMessage(error,'getFeatures');
        });
    }
    getFeatures() {
        this.paginateSpinner = true;
        // Code for module fetching
        let filteredModules = [];
        let URL = this.baseURL + 'api/modules';
        let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        let body = {};
        let method = "GET";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            this.paginateSpinner = false;
            this.p = 1;
            // @ts-ignore
            filteredModules = this.moduleFilteration(response);
            this.GlobalFilteredModules = filteredModules;
            this.fetchFeatures(filteredModules);
        }, (error) => {
        });
    }
    getPage(page) {
        this.loading = true;
        this.serverCall(this.feature_data, page, this.total, this.perPage).subscribe({
            next: (res) => {
                let modules = this.Modules;
                let filteredModules = this.moduleFilteration(modules);
                this.featureFilteration(res, filteredModules, true);
                this.total = res.total;
                this.p = page;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching features:', error);
                this.loading = false;
            }
        });
    }
    serverCall(feature_data, page, total, per_Page) {
        this.paginateSpinner = true;
        const perPage = per_Page;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        let data;
        let decrypted_data = {};
        let company_id = this.company_id;
        let URL = "";
        URL = this.baseURL + "api/features?limit=" + this.perPage + "&page=" + page;
        let body = '';
        const headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            this.paginateSpinner = false;
            // console.log('decryptedData');
            // console.log(decryptedData);
            return {
                items: decryptedData.features.data,
                total: decryptedData.features.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            return of({ items: [], total: 0 });
        }));
    }
    assignFeatureID(id) {
        this.feature_id = id;
    }
    deleteFeature() {
        let URL = this.baseURL + "api/features/" + this.feature_id;
        let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        let body = "";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe((response) => {
            this.cdr.detectChanges();
            this.toastMessages.showToast('', 'Feature successfully deleted', 'success');
            this.closeDeletePopup.nativeElement.click();
            this.getFeatures();
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
        });
    }
    getAncestors(target, children, ancestors = []) {
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
    getSingleFeature(featureID) {
        this.editTrue = true;
        this.showSpinner = true;
        this.fetchModules();
        let decrypted_data;
        this.popupTitle = 'Edit';
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/features/" + featureID;
        let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        let body = "";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe((response) => {
            this.showSpinner = false;
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('resultData', decrypted_data);
            let hiearchyArray = [];
            if (decrypted_data.feature != undefined || decrypted_data.feature != null || decrypted_data.feature != "") {
                let feature = decrypted_data.feature;
                let modules = this.Modules;
                let lowestlevelmoduleID = feature.sub_module_id;
                const ancestors = this.getAncestors(lowestlevelmoduleID, modules);
                if (ancestors !== undefined) {
                    hiearchyArray = ancestors;
                }
                else {
                    hiearchyArray = []; // Assign an empty array if ancestors is undefined
                }
                // Set form values with data from featuresForm
                this.featuresForm.patchValue({
                    module: hiearchyArray[0],
                });
                let moduleElement = this.moduleSelect.nativeElement;
                moduleElement.dispatchEvent(new Event('change'));
                if (hiearchyArray.length > 1) {
                    this.featuresForm.patchValue({
                        sub_module: hiearchyArray[1],
                    });
                    let submoduleElement = this.subModuleSelect.nativeElement;
                    submoduleElement.dispatchEvent(new Event('change'));
                }
                if (hiearchyArray.length > 2) {
                    this.featuresForm.patchValue({
                        third_module: hiearchyArray[2],
                    });
                    let thirdModuleElement = this.thirdModuleSelect.nativeElement;
                    thirdModuleElement.dispatchEvent(new Event('change'));
                }
                if (hiearchyArray.length > 2) {
                    this.featuresForm.patchValue({
                        fourth_module: hiearchyArray[3],
                    });
                    let fourModuleElement = this.fourModuleSelect.nativeElement;
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
                let typeElement = this.typeSelect.nativeElement;
                typeElement.dispatchEvent(new Event('change'));
                const metaDataFormArray = this.featuresForm.get('module_features_list');
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
            }
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            this.toastMessages.showToast('', 'getCategories: ' + decrypted_data.data.error, 'error');
        });
    }
    onKeyUp(event) {
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
        let URL = '';
        URL = this.baseURL + "api/features?limit=" + this.perPage + '&page=1&search=' + this.inputValue;
        let headers = new HttpHeaders(FeaturesConfig.FEATURE_HEADER);
        let body = '';
        this.paginateSpinner = true;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe((response) => {
            this.featureFilteration(response, this.GlobalFilteredModules, false);
            this.paginateSpinner = false;
        }, (error) => {
            this.paginateSpinner = false;
        });
    }
};
__decorate([
    Input('data')
], FeaturesComponent.prototype, "feature_data", void 0);
__decorate([
    ViewChild('closeDeletePopup')
], FeaturesComponent.prototype, "closeDeletePopup", void 0);
__decorate([
    ViewChild('moduleSelect')
], FeaturesComponent.prototype, "moduleSelect", void 0);
__decorate([
    ViewChild('subModuleSelect')
], FeaturesComponent.prototype, "subModuleSelect", void 0);
__decorate([
    ViewChild('thirdModuleSelect')
], FeaturesComponent.prototype, "thirdModuleSelect", void 0);
__decorate([
    ViewChild('fourModuleSelect')
], FeaturesComponent.prototype, "fourModuleSelect", void 0);
__decorate([
    ViewChild('typeSelect')
], FeaturesComponent.prototype, "typeSelect", void 0);
__decorate([
    ViewChild('RuleDropdown')
], FeaturesComponent.prototype, "RuleDropdown", void 0);
__decorate([
    ViewChild('valueDropdown')
], FeaturesComponent.prototype, "valueDropdown", void 0);
__decorate([
    ViewChild('AddEditPopup')
], FeaturesComponent.prototype, "AddEditPopup", void 0);
__decorate([
    ViewChild('closeModelBtn')
], FeaturesComponent.prototype, "closeModelBtn", void 0);
FeaturesComponent = __decorate([
    Component({
        selector: 'app-features',
        templateUrl: './features.component.html',
        styleUrls: ['./features.component.css']
    })
], FeaturesComponent);
export { FeaturesComponent };
//# sourceMappingURL=features.component.js.map