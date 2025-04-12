import { __decorate } from "tslib";
import { ViewChildren, QueryList, Component, ViewChild, Input } from '@angular/core';
import { Validators } from "@angular/forms";
import { environment } from "../../../environments/environments";
import { HttpHeaders } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { catchError } from 'rxjs/operators';
let AddOnsComponent = class AddOnsComponent {
    constructor(formBuilder, sanitizer, elementRef, appComponent, breadcrumbService, httpClientRequest, toastMessages, encryptDecrypt, cdr) {
        this.formBuilder = formBuilder;
        this.sanitizer = sanitizer;
        this.elementRef = elementRef;
        this.appComponent = appComponent;
        this.breadcrumbService = breadcrumbService;
        this.httpClientRequest = httpClientRequest;
        this.toastMessages = toastMessages;
        this.encryptDecrypt = encryptDecrypt;
        this.cdr = cdr;
        // Strings
        this.imageUrl = '';
        this.base64Image = '';
        this.metaData = ''; // Variable to store the selected value from the first dropdown
        this.baseURL = environment.apiBASEURL;
        this.popupTitle = '';
        this.addonID = '';
        this.inputValue = '';
        this.capitalizedValue = 'Public';
        // Numbers
        this.index = 0;
        this.perPage = 20;
        this.p = 1;
        this.p2 = 1;
        this.company_id = 0;
        this.total = 0;
        this.doneTypingInterval = 500; // Adjust this according to your preference
        // Booleans
        this.showSpinner = false;
        this.showFrequency = true;
        this.showErrors = false;
        this.showInfoBlock = false;
        this.showKeyBlock = false;
        this.showDeleteIcon = false;
        this.activeFlag = true;
        this.paginateSpinner = false;
        this.DataFound = false;
        this.DataFoundPagination = false;
        this.DataFoundInActiveTab = false;
        this.DataFoundInActiveTabPagination = false;
        this.checked = false;
        // Arrays
        this.rows = [];
        this.perMonthRows = ['', '', '', ''];
        this.Modules = [];
        this.moduleFeatureRows = [];
        this.moduleFeatures = [];
        this.moduleFeatureValues = [];
        this.addon_data = [];
        // Objects
        this.valueOptions = {
            // type: [{ value: 'addons', label: 'Add-ons' }],
            public: [{ value: '1', label: '1' }, { value: '0', label: '0' }]
        };
        // Observables
        this.activeAddons$ = new Observable();
        this.inactiveAddons$ = new Observable();
        this.moduleSelects = new QueryList();
        this.deleteMetadata = new QueryList();
        this.appComponent.isLoginScreen = false;
        this.appComponent.showMenu = true;
        this.addOnsForm = this.formBuilder.group({
            title: ['', Validators.required],
            type: ['per_unit', Validators.required],
            images: [''],
            active: ['1', Validators.required],
            description: [''],
            public: ['public', Validators.required],
            public_value: ['1', Validators.required],
            metadata: this.formBuilder.array([]),
            prices: this.formBuilder.array([
                this.formBuilder.group({
                    unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
                    recurring: ['month']
                }),
                this.formBuilder.group({
                    unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
                    recurring: ['quarterly']
                }),
                this.formBuilder.group({
                    unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
                    recurring: ['bi-annually']
                }),
                this.formBuilder.group({
                    unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
                    recurring: ['year']
                })
            ]),
            module_features_list: this.formBuilder.array([
            // this.formBuilder.group({
            //   module: ['', [Validators.required]],
            //   feature: ['', [Validators.required]]
            // })
            ]),
            currency: ['usd'],
            billing_type: ['', Validators.required],
        });
    }
    get formControl() {
        return this.addOnsForm.controls;
    }
    ngOnInit() {
        this.breadcrumbService.setBreadcrumbs([{ label: 'Plan & Packages', url: '' }, { label: 'Add-ons', url: '/add-ons' }]);
        this.breadcrumbService.setComponentName('Add-ons');
        this.getAddons(true);
    }
    ngAfterViewInit() {
        this.AddEditPopup.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
            // Trigger click event on each delete icon
            // Reset form to its original state
            this.clearImage();
            // this.addOnsForm.reset();
            this.rows = [];
            this.moduleFeatureRows = [];
            this.perMonthRows = [];
            this.cdr.detectChanges();
        });
    }
    fetchModules() {
        // this.addOnsForm.reset();
        this.popupTitle = "Create";
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
                let newArray = [];
                let result = this.findChildrenById(modules);
                
                setTimeout(() => {
                    this.Modules = result;
                    if (this.perMonthRows.length == 0) {
                        for (let i = 1; i < 5; i++) {
                            this.perMonthRows.push('');
                        }
                    }
                    // this.perMonthRows = ['','','',''];
                    console.log('modules ', result, this.Modules, this.perMonthRows);
                }, 300);
            }
        }, (error) => {
            // let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            // this.toastMessages.showToast('', decrypted_data.message, 'error');
        });
    }
    fetchModuleFeatures(event, index, value = 0) {
        let module_id = event.target.value;
        let URL = this.baseURL + 'api/modules/features/' + module_id;
        let headers = new HttpHeaders({
            "Access-Control-Allow-Headers": 'accept',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = {};
        let method = "GET";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            let data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            if (data[0] != undefined && data[0]['features_list'] !== undefined) {
                let featureValue = '';
                this.moduleFeatures = data[0]['features_list'];
                let features_html = '<option value="" disabled hidden="hidden" selected>Select</option>';
                this.moduleFeatures.forEach((element, index) => {
                    features_html += '<option  feature_value="' + element.feature_value + '" value="' + element.id + '">' + element.feature_label + '</option>';
                    //in edit mode fetch only those module feature value which change event is triggered
                    if (index === value) {
                        featureValue = element.feature_value;
                    }
                });
                let featureDropdown = this.elementRef.nativeElement.querySelector('#feature_' + index);
                //inform angular trust html and append in features drop-down
                featureDropdown.innerHTML = this.sanitizer.bypassSecurityTrustHtml(features_html);
                //set required validation for feature drop-down
                const metaDataFormArray = this.addOnsForm.get('module_features_list');
                metaDataFormArray.at(index).get('feature')?.setValidators(Validators.required);
                if (this.popupTitle == "Edit") {
                    console.log('edit into', index, value);
                    if (this.singleAddon.module_features_list !== undefined) {
                        metaDataFormArray.at(index).patchValue({
                            'feature': this.singleAddon.module_features_list[value],
                        });
                        let featureValueInput = this.elementRef.nativeElement.querySelector('#feature_value_' + index);
                        featureValueInput.value = featureValue;
                    }
                }
            }
        }, (error) => {
        });
    }
    fetchFeatureValue(event, index) {
        // Get the selected option element
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (selectedOption) {
            // Get the value of the 'data-attribute' attribute
            const featureValue = selectedOption.getAttribute('feature_value');
            let featureValueInput = this.elementRef.nativeElement.querySelector('#feature_value_' + index);
            featureValueInput.value = featureValue;
            console.log('Selected option attribute value:', featureValue);
        }
    }
    findChildrenById(childrenArray) {
        // Initialize the array that will be modified in place
        const newArray = [];
        // Define a recursive function to search for children
        function findChildrenRecursive(children) {
            for (const child of children) {
                // Add the current child to the array if it doesn't already exist
                if (!newArray.some(module => module.id === child.id)) {
                    newArray.push(child);
                }
                // Check if the child has children
                if (child.children && Array.isArray(child.children) && child.children.length > 0) {
                    // Add each child of the current child to the array if it doesn't already exist
                    for (const element of child.children) {
                        if (!newArray.some(module => module.id === element.id)) {
                            newArray.push(element);
                        }
                    }
                    // Recursively search through the current child's children
                    findChildrenRecursive(child.children);
                }
            }
        }
        // Start the recursive search from the top-level children
        findChildrenRecursive(childrenArray);
        // Return the modified array
        return newArray.length > 0 ? newArray : undefined;
    }
    SubmitAddOns() {
        //check form is free of validations
        if (this.addOnsForm.valid) {
            console.log(this.addOnsForm.value);
            this.showSpinner = true;
            this.showErrors = false;
            let URL;
            let method;
            if (this.popupTitle == "Edit") {
                URL = this.baseURL + 'api/addons/' + this.addonID;
                method = 'PUT';
            }
            else {
                URL = this.baseURL + 'api/addons';
                method = 'POST';
            }
            let formData = this.addOnsForm.value;
            let active = parseInt(formData.active) === 1 ? true : false;
            let metadata = { type: 'addons', public: formData.public_value };
            let prices = formData.prices.filter((item) => item.unit_amount !== null && item.unit_amount !== undefined && item.unit_amount !== "");
            if (prices.length > 0) {
                prices.forEach(price => {
                    if (price.unit_amount !== "") {
                        price.active = true;
                        price.currency = formData.currency;
                        price.billing_scheme = "per_unit";
                        // let ind = "recurring";
                        let ind = "recurring";
                        if (String(formData.type) === "one_time") {
                            delete price[ind];
                        }
                    }
                });
            }
            if (formData.metadata.length > 0) {
                formData.metadata.forEach((data) => {
                    metadata[data.key] = data.value;
                });
            }
            metadata["proration"] = formData.billing_type;
            metadata["price_type"] = formData.type;
            console.log(formData);
            let modules = [];
            let module_features_list = [];
            if (formData.module_features_list !== undefined && formData.module_features_list.length > 0) {
                formData.module_features_list.forEach((element) => {
                    module_features_list.push(element.feature);
                    modules.push(element.module);
                });
            }
            let body;
            if (this.popupTitle == "Edit") {
                body = {
                    "stripe_id": this.addonID,
                    "name": formData.title,
                    "active": active, // boolean,
                    "module_features_list": module_features_list,
                    "modules": modules,
                    metadata,
                    prices
                };
            }
            else {
                body = {
                    "name": formData.title,
                    "active": active, // boolean,
                    "module_features_list": module_features_list,
                    "modules": modules,
                    metadata,
                    prices
                };
            }
            if (this.base64Image != undefined && this.base64Image != null && this.base64Image != '') {
                console.log('Image URL: ' + this.base64Image);
                body["image"] = this.base64Image;
            }
            console.log('body', body);
            let headers = new HttpHeaders({
                "Accept": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Content-Type": "application/json",
            });
            if (formData.description != null && formData.description != '') {
                body['description'] = formData.description;
            }
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                this.showSpinner = false;
                if (this.popupTitle == 'Create') {
                    this.toastMessages.showToast('', 'Add-Ons successfully created', 'success');
                }
                else {
                    this.toastMessages.showToast('', 'Add-Ons successfully updated', 'success');
                }
                this.addOnsForm.reset();
                this.addOnsForm.get('module_features_list').clear();
                this.addOnsForm.get('prices').clear();
                this.addOnsForm.get('metadata').clear();
                this.deleteBtn.nativeElement.click();
                this.addOnsDefaultValues();
                this.getAddons(this.activeFlag);
            }, (error) => {
                this.showSpinner = false;
                this.showErrors = false;
            });
        }
        else {
            console.log(this.addOnsForm.controls, this.addOnsForm.value);
            const form = this.addOnsForm;
            Object.keys(form.controls).forEach(key => {
                const controlErrors = form.get(key)?.errors;
                if (controlErrors) {
                    Object.keys(controlErrors).forEach(keyError => {
                        console.log({
                            'control': key,
                            'error': keyError,
                            'value': controlErrors[keyError]
                        });
                    });
                }
            });
            console.log(this.addOnsForm.errors);
            this.showErrors = true;
        }
    }
    addOnsDefaultValues() {
        this.addOnsForm.patchValue({
            type: 'per_unit',
            active: '1',
            public: 'public',
            public_value: '1',
            currency: 'usd',
            billing_type: ''
        });
        const formPricesArray = this.addOnsForm.get('prices');
        let control = formPricesArray.at(0);
        if (control !== undefined) {
            control.patchValue({ recurring: 'month' });
        }
    }
    clearImage() {
        this.imageUrl = '';
    }
    cloneHtmlBlock() {
        // let index = this.perMonthRows.length;
        let frequencies = ['month', 'bi-annually', "quarterly", "year"];
        const newPriceGroup = this.formBuilder.group({
            unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            recurring: ['month']
        });
        // Get the prices FormArray and push the new FormGroup
        const pricesFormArray = this.addOnsForm.get('prices');
        console.log(pricesFormArray, 'first time');
        pricesFormArray.push(newPriceGroup);
        this.perMonthRows.push('');
    }
    isErrorsObject(obj) {
        return obj != null && typeof obj === 'object' && 'required' in obj;
    }
    cloneHtmlBlock2() {
        const newMetaDataGroup = this.formBuilder.group({
            key: ['', Validators.required],
            value: ['', Validators.required]
        });
        // Get the prices FormArray and push the new FormGroup
        const metaDataFormArray = this.addOnsForm.get('metadata');
        metaDataFormArray.push(newMetaDataGroup);
        this.rows.push('');
    }
    cloneModuleFeatureBlock() {
        const newMetaDataGroup = this.formBuilder.group({
            module: ['', [Validators.required]],
            feature: ['', [Validators.required]]
        });
        // Get the prices FormArray and push the new FormGroup
        const metaDataFormArray = this.addOnsForm.get('module_features_list');
        metaDataFormArray.push(newMetaDataGroup);
        this.moduleFeatureRows.push('');
    }
    deleteBlock(event) {
        const target = event.target;
        let index = event.target.getAttribute("index");
        if (target.classList.contains('actions_icon')) {
            this.perMonthRows.pop();
            // const blockToRemove = this.elementRef.nativeElement.querySelector(`#blockForRemove_${index}`);//(id);//target.closest('.blockForRemove');
            // // blockToRemove.remove();
            const pricesFormArray = this.addOnsForm.get('prices');
            pricesFormArray.removeAt(index);
            const values = pricesFormArray.value;
            values.splice(index, 1);
            pricesFormArray.controls.splice(index, 1);
            pricesFormArray.updateValueAndValidity();
            console.log(pricesFormArray, index);
        }
    }
    deleteBlock2(event) {
        const target = event.target;
        if (target && target.classList && target.classList.contains('actions_icon2')) {
            const blockToRemove = target.closest('.blockForRemove2');
            if (blockToRemove) {
                const index = target.getAttribute('index');
                const metaDataFormArray = this.addOnsForm.get('metadata');
                metaDataFormArray.removeAt(index);
                blockToRemove.remove();
            }
        }
    }
    // Function to handle the change event of the first dropdown
    onChangeClonedMetaData(event) {
        const selectValue = event.target.value;
        const targetElement = event.target;
        // Find the closest element with a specific class
        const closestElement = targetElement.getAttribute("tag");
        let dynamicHtml = '<option selected disabled hidden="hidden" class="light_opacity">Select Value</option>';
        if (closestElement) {
            this.valueOptions[selectValue].forEach(option => {
                dynamicHtml += '<option value="' + option.value + '">' + option.label + '</option>';
            });
            const safeHtml = this.sanitizer.bypassSecurityTrustHtml(dynamicHtml);
            //append html in recently cloned clossest value dropdown
            const valueDropdown = this.elementRef.nativeElement.querySelector('#' + closestElement);
            valueDropdown.innerHTML = safeHtml;
            // Trigger change detection
            this.cdr.detectChanges();
        }
    }
    controlTypeChange(event) {
        let selected_type = event.target.value;
        if (selected_type === "one_time") {
            this.showFrequency = false;
            this.cdr.detectChanges();
        }
        else {
            this.showFrequency = true;
            this.cdr.detectChanges();
        }
        // const newPriceGroup = this.formBuilder.group({
        //   unit_amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        //   recurring: ['month']
        // });
        // console.log('new blocked pushed')
        // // Get the prices FormArray and push the new FormGroup
        // const pricesFormArray = this.addOnsForm.get('prices') as FormArray;
        // pricesFormArray.clear();
        // pricesFormArray.push(newPriceGroup);
    }
    deleteModuleFeatureBlock(event, index) {
        const target = event.target;
        const blockToRemove = target.closest('.blockModuleFeatureForRemoval');
        if (blockToRemove) {
            const metaDataFormArray = this.addOnsForm.get('module_features_list');
            metaDataFormArray.removeAt(index);
            this.moduleFeatureRows.splice(index, 1);
        }
    }
    onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = this.handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file); //readAsBinaryString(file);
        }
    }
    handleReaderLoaded(event) {
        let imageFile = 'data:image/png;base64,' + btoa(event.target.result); //this.handleReaderLoaded.bind(this);
        this.base64Image = imageFile;
        // this.base64Image.push(imageFile)
        this.imageUrl = imageFile;
        // console.log(event.target.result)
        // const img = new Image();
        // img = event.target.result;
        // this.imageUrl = img;//this.sanitizer.bypassSecurityTrustUrl(event.target.result) as string;
    }
    getAddons(flag, search = '') {
        this.paginateSpinner = true;
        this.activeFlag = flag;
        let decrypted_data;
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/local/products?page=1";
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = {
            "limit": this.perPage,
            "active": flag,
            "metadata": {
                "type": "addons"
            },
            "search": search
        };
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('decrypted_data');
            console.log(decrypted_data);
            this.paginateSpinner = false;
            if (decrypted_data.data.length > 0) {
                //change incoming data array to observable
                let addons = decrypted_data.data;
                if (flag) {
                    this.activeAddons$ = of(addons);
                    this.DataFound = false;
                    this.DataFoundPagination = true;
                }
                else {
                    this.inactiveAddons$ = of(addons);
                    this.DataFoundInActiveTab = false;
                    this.DataFoundInActiveTabPagination = true;
                }
                this.total = decrypted_data.total;
            }
            else {
                if (flag) {
                    this.DataFound = true;
                    this.DataFoundPagination = false;
                }
                else {
                    this.DataFoundInActiveTab = true;
                    this.DataFoundInActiveTabPagination = false;
                }
            }
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
        });
    }
    getPage(page) {
        this.serverCall(page, this.activeFlag).subscribe({
            next: (res) => {
                // console.log('active res',res);
                if (res.items.length > 0) {
                    this.total = res.total;
                    if (this.activeFlag) {
                        this.p = page;
                        this.activeAddons$ = of(res.items);
                    }
                    else {
                        this.inactiveAddons$ = of(res.items);
                        this.p2 = page;
                    }
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            },
            error: (error) => {
                console.error('Error fetching addons:', error);
                this.loading = false;
            }
        });
    }
    serverCall(page, type) {
        this.paginateSpinner = true;
        console.log('server call', type, 'page', page);
        let body = {
            limit: this.perPage,
            active: type,
            metadata: {
                type: "addons",
            }
        };
        let URL = this.baseURL + "api/local/products?page=" + page;
        const headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            this.paginateSpinner = false;
            return {
                items: decryptedData.data,
                total: decryptedData.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            return of({ items: [], total: 0 });
        }));
    }
    formatDate(dateString) {
        if (!dateString) {
            return ''; // or any other default value you want to return for null dates
        }
        const timestampInMillis = dateString * 1000;
        const date = new Date(timestampInMillis);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate; // Adjust the format as per your requirement
    }
    getAddonID(addonID) {
        this.addonID = addonID;
    }
    deleteAddon() {
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/addons/" + this.addonID;
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = "";
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe((response) => {
            // this.cdr.detectChanges();
            console.log(response);
            this.toastMessages.showToast('', 'Addon successfully deleted', 'success');
            this.closeDeletePopup.nativeElement.click();
            // this.cdr.detectChanges();
            this.getAddons(this.activeFlag);
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
        });
    }
    addonToggleButton(isChecked, userId) {
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
            };
            let decrypted_data = null;
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
            }, (error) => {
                console.error('Request failed with error', error);
            });
        }
    }
    getSingleAddon(addon_id) {
        this.showSpinner = true;
        let decrypted_data;
        this.fetchModules();
        this.popupTitle = "Edit";
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/local/product/" + addon_id;
        let headers = new HttpHeaders({
            "Accept": "application/json",
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json",
        });
        let body = "";
        //clear array for add rows according to edited addon data
        this.addOnsForm.get('module_features_list').clear();
        // (this.addOnsForm.get('prices') as FormArray).clear();
        this.addOnsForm.get('metadata').clear();
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe((response) => {
            console.log(response);
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_data);
            if (decrypted_data.product != undefined || decrypted_data.product != null || decrypted_data.product != "") {
                this.singleAddon = decrypted_data.product;
                console.log('Addon data:');
                console.log(this.singleAddon);
                let addonstatus;
                if (this.singleAddon.active) {
                    addonstatus = 1;
                }
                else {
                    addonstatus = 0;
                }
                // // Set form values with data from singleAddon
                this.addOnsForm.patchValue({
                    title: this.singleAddon.name,
                    active: addonstatus,
                    description: this.singleAddon.description,
                    public_value: this.singleAddon.metadata.public,
                    type: this.singleAddon.metadata.price_type,
                    billing_type: this.singleAddon.metadata.proration,
                });
                if (this.singleAddon.prices && this.singleAddon.prices.length > 0) {
                    this.addOnsForm.patchValue({
                        currency: this.singleAddon.prices[0].currency,
                    });
                }
                let addonImage = this.singleAddon.images["0"];
                if (addonImage !== "" && addonImage) {
                    this.imageUrl = addonImage;
                }
                // Meta data value
                let metadataCustom = JSON.parse(JSON.stringify(this.singleAddon.metadata));
                let propertiesToRemove = ['price_type', 'proration', 'public', 'type'];
                propertiesToRemove.forEach(prop => delete metadataCustom[prop]);
                let numberOfProperties = Object.keys(metadataCustom).length;
                for (let i = 0; i < numberOfProperties; i++) {
                    this.metadataAdd.nativeElement.click();
                }
                let updatedMetadata = [];
                Object.keys(metadataCustom).forEach((key, index) => {
                    let value = metadataCustom[key];
                    let transformedObject = {
                        index: index,
                        key: key,
                        value: value
                    };
                    updatedMetadata.push(transformedObject);
                });
                let metaDataFormArray = this.addOnsForm.get('metadata');
                for (let i = 0; i < numberOfProperties; i++) {
                    metaDataFormArray.at(i).patchValue({
                        'key': updatedMetadata[i].key,
                        'value': updatedMetadata[i].value,
                    });
                }
                const moduleFormArray = this.addOnsForm.get('module_features_list');
                if (this.singleAddon.modules !== undefined) {
                    let moduleslength = this.singleAddon.modules.length;
                    for (let i = 0; i < moduleslength; i++) {
                        this.addModule.nativeElement.click();
                    }
                    for (let i = 0; i < moduleslength; i++) {
                        moduleFormArray.at(i).patchValue({
                            'module': this.singleAddon.modules[i],
                        });
                    }
                    // console.log('moduleSelects:', this.moduleSelects);
                    setTimeout(() => {
                        this.moduleSelects.forEach((select, index) => {
                            const event = new Event('change');
                            select.nativeElement.dispatchEvent(event);
                        });
                    }, 20);
                }
                let priceslength = this.singleAddon.prices.length;
                // for (let i = 0; i < priceslength - 1; i++) {
                //   this.priceAdd.nativeElement.click();
                // }
                let priceType = this.singleAddon.metadata.price_type;
                const priceFormArray = this.addOnsForm.get('prices');
                this.perMonthRows.splice(0, this.perMonthRows.length);
                this.cdr.detectChanges();
                console.log(priceFormArray, this.perMonthRows);
                if (priceslength > 0) {
                    for (let i = 0; i < priceslength; i++) {
                        console.log('error occurred');
                        let updatedPrice = (this.singleAddon.prices[i].unit_amount) / 100;
                        if (priceType === 'per_unit') {
                            // priceFormArray.push(
                            //   this.formBuilder.group({
                            //     unit_amount: '',
                            //     recurring: ''
                            //   })
                            // );
                            let dbInterval = this.singleAddon.prices[i].recurring.interval;
                            let dbIntervalCount = this.singleAddon.prices[i].recurring.interval_count;
                            let frequency = dbInterval;
                            if (dbIntervalCount === 3 && dbInterval === 'month') {
                                frequency = 'quarterly';
                            }
                            else if (dbIntervalCount === 6 && dbInterval === 'month') {
                                frequency = 'bi-annually';
                            }
                            priceFormArray.at(i).patchValue({
                                unit_amount: updatedPrice,
                                recurring: frequency
                            });
                        }
                        else {
                            // priceFormArray.push(this.formBuilder.group({
                            //   unit_amount: '',
                            //   recurring: ''
                            // }));
                            priceFormArray.at(i).patchValue({
                                unit_amount: updatedPrice
                            });
                        }
                        this.perMonthRows.push('');
                    }
                    setTimeout(() => {
                        let billingTypeElement = this.billingTypeSelect.nativeElement;
                        billingTypeElement.dispatchEvent(new Event('change'));
                    }, 300);
                }
                this.getAddonID(addon_id);
                this.showSpinner = false;
            }
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
            ;
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
        console.log('User stopped typing:', this.inputValue);
        if (this.DataFoundPagination == true) {
            this.getAddons(true, this.inputValue);
        }
        else {
            this.getAddons(false, this.inputValue);
        }
    }
};
__decorate([
    Input('data')
], AddOnsComponent.prototype, "addon_data", void 0);
__decorate([
    ViewChild('closeDeletePopup')
], AddOnsComponent.prototype, "closeDeletePopup", void 0);
__decorate([
    ViewChild('metadataAdd')
], AddOnsComponent.prototype, "metadataAdd", void 0);
__decorate([
    ViewChild('billingTypeSelect')
], AddOnsComponent.prototype, "billingTypeSelect", void 0);
__decorate([
    ViewChild('addModule')
], AddOnsComponent.prototype, "addModule", void 0);
__decorate([
    ViewChildren('moduleSelect')
], AddOnsComponent.prototype, "moduleSelects", void 0);
__decorate([
    ViewChildren('deleteMetadata')
], AddOnsComponent.prototype, "deleteMetadata", void 0);
__decorate([
    ViewChild('priceAdd')
], AddOnsComponent.prototype, "priceAdd", void 0);
__decorate([
    ViewChild('AddEditPopup')
], AddOnsComponent.prototype, "AddEditPopup", void 0);
__decorate([
    ViewChild('deleteBtn')
], AddOnsComponent.prototype, "deleteBtn", void 0);
AddOnsComponent = __decorate([
    Component({
        selector: 'app-add-ons',
        templateUrl: './add-ons.component.html',
        styleUrls: ['./add-ons.component.css']
    })
], AddOnsComponent);
export { AddOnsComponent };
//# sourceMappingURL=add-ons.component.js.map
