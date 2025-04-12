import { __decorate } from "tslib";
import { Component, ViewChild, Input } from '@angular/core';
import { Validators } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environments";
import { map, Observable, of } from "rxjs";
import { CategoriesConfig } from "../../Components/constants/plan_&_packages/categories/categories";
import { catchError } from 'rxjs/operators';
let CategoriesComponent = class CategoriesComponent {
    constructor(formBuilder, appComponent, breadcrumbService, cdr, httpClientRequest, encryptDecrypt, refreshToken, toastMessages, el, datePipe) {
        this.formBuilder = formBuilder;
        this.appComponent = appComponent;
        this.breadcrumbService = breadcrumbService;
        this.cdr = cdr;
        this.httpClientRequest = httpClientRequest;
        this.encryptDecrypt = encryptDecrypt;
        this.refreshToken = refreshToken;
        this.toastMessages = toastMessages;
        this.el = el;
        this.datePipe = datePipe;
        // string
        this.baseURL = environment.apiBASEURL;
        this.popupTitle = "";
        // boolean
        this.showSpinner = false;
        this.showPercentageTypeOption = true;
        this.showKeyBlock = false;
        this.showErrors = false;
        this.paginateSpinner = false;
        this.DataFound = false;
        this.DataFoundPagination = false;
        this.editCategoryFeature = false;
        // number
        this.total = 0;
        this.perPage = 20;
        this.p = 1;
        this.company_id = 0;
        this.category_id = 0;
        // string[]
        this.packageNameRows = [''];
        this.category_data = [];
        // Observable<any>
        this.categories$ = new Observable();
        // object
        this.packageObject = {};
        // any[]
        this.categoryPlans = [];
        // number[]
        this.categoriesIdsAttachedWithPlans = [];
        // number[][]
        this.categoriesPlans = [];
        // FeatureTypeRows
        this.featureTypeRows = {
            '0': ['']
        };
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
            }, { validator: atLeastOneCheckedValidator })
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
    ngOnInit() {
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
    getCategories() {
        this.paginateSpinner = true;
        let decrypted_data;
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/categories?page=1";
        let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
        let body = {
            "limit": this.perPage,
            "fields": [
                "title",
                "description",
                "created_at",
            ]
        };
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            this.paginateSpinner = false;
            this.cdr.detectChanges();
            this.categoriesIdsAttachedWithPlans = decrypted_data.products;
            let rv = decrypted_data.products;
            if (rv !== undefined) {
                rv.forEach((element) => {
                    if (typeof this.categoriesPlans[element.category_id] === 'undefined') {
                        this.categoriesPlans[element.category_id] = [];
                    }
                    if (element.plan_id != null) {
                        this.categoriesPlans[element.category_id].push(element.plan_id);
                    }
                });
            }
            if (decrypted_data.categories.data.length > 0) {
                console.log(decrypted_data);
                //change incoming data array to observable
                this.categories$ = of(decrypted_data.categories.data);
                this.total = decrypted_data.categories.total;
                this.DataFound = false;
                this.DataFoundPagination = true;
            }
            else {
                this.DataFound = true;
                this.DataFoundPagination = false;
            }
            this.paginateSpinner = false;
        }, (error) => {
            console.log('Request failed with error', error);
            this.DataFound = true;
            this.DataFoundPagination = false;
            this.paginateSpinner = false;
        });
    }
    getPage(page) {
        this.loading = true;
        this.serverCall(page).subscribe({
            next: (res) => {
                this.categories$ = of(res.items);
                this.total = res.total;
                this.p = page;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching categories:', error);
                this.loading = false;
            }
        });
    }
    serverCall(page) {
        this.paginateSpinner = true;
        let URL = "";
        URL = this.baseURL + "api/categories?page=" + page;
        let body = {
            // Following variables are optional. You can change it according to your requirements.
            "limit": this.perPage,
            "fields": [
                "title",
                "description",
                "created_at",
            ]
        };
        const headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
        return this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").pipe(map((response) => {
            const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('server call decryptedData');
            console.log(decryptedData);
            this.paginateSpinner = false;
            return {
                items: decryptedData.categories.data,
                total: decryptedData.categories.total
            };
        }), catchError(error => {
            console.error('Request failed with error', error);
            return of({ items: [], total: 0 });
        }));
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
                let temp = [];
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
                this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                    this.showSpinner = false;
                    this.closeAddEditPopup.nativeElement.click();
                    this.categoryForm.reset();
                    this.toastMessages.showToast('', 'Category successfully created', 'success');
                    this.cdr.detectChanges();
                    this.getCategories();
                }, (error) => {
                    this.showSpinner = false;
                });
            }
            else {
                let URL = this.baseURL + 'api/category/' + this.category_id;
                let formData = this.categoryForm.value;
                let frequency = this.categoryForm.get('frequency')?.value;
                let temp = [];
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
                this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                    this.showSpinner = false;
                    this.closeAddEditPopup.nativeElement.click();
                    this.categoryForm.reset();
                    this.toastMessages.showToast('', CategoriesConfig.CATEGORY_EDIT, 'success');
                    this.cdr.detectChanges();
                    this.getCategories();
                }, (error) => {
                    let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
                    this.toastMessages.showToast('', decrypted_data.message, 'error');
                    this.showSpinner = false;
                });
            }
        }
        else {
            this.showErrors = true;
            console.log(this.categoryForm.controls);
        }
    }
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
        }
        else {
            console.error('Error: Could not find the parent element or add more button.');
        }
    }
    deleteBlock(event) {
        const target = event.target;
        console.log(target, target.classList);
        if (target.classList.contains('actions_icon')) {
            const blockToRemove = target.closest('.blockForRemove');
            if (blockToRemove) {
                blockToRemove.remove();
            }
        }
    }
    assignCategoryID(id) {
        this.category_id = id;
    }
    controlTypeChange(event) {
        let type = String(event.target.value);
        if (type !== "" && type === CategoriesConfig.CATEGORY_TYPE) {
            this.showPercentageTypeOption = false;
            this.categoryForm.patchValue({ discount_type: '' });
            this.categoryForm.get('frequency')?.disable();
            // this.categoryForm.removeControl('frequency');
            this.cdr.detectChanges();
        }
        else {
            this.showPercentageTypeOption = true;
            this.categoryForm.patchValue({ discount_type: '' });
            this.categoryForm.get('frequency')?.enable();
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
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, "DELETE").subscribe((response) => {
                this.cdr.detectChanges();
                console.log(response);
                this.toastMessages.showToast('', 'Category successfully deleted', 'success');
                this.closeDeletePopup.nativeElement.click();
                this.getCategories();
            }, (error) => {
                //error() callback
                console.log('Request failed with error', error);
            });
        }
        else {
            this.closeDeletePopup.nativeElement.click();
            this.toastMessages.showToast('', 'Category with active plans acn not be deleted', 'error');
        }
    }
    getSingleCategory(categoryID) {
        this.popupTitle = "Edit";
        let decrypted_data;
        // Show the spinner
        // this.showSpinner = true;
        let URL = this.baseURL + "api/category/" + categoryID;
        let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
        let body = "";
        this.showSpinner = true;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, "GET").subscribe((response) => {
            decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_data);
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
                    frequencyData.forEach((freq) => {
                        this.categoryForm.get('frequency')?.get(freq)?.patchValue(true);
                    });
                }
                this.assignCategoryID(this.singleCategory.id);
            }
            this.showSpinner = false;
            //disabled all fields if there is active plan attached with category else enable all fields
            if (this.categoriesPlans[categoryID] !== undefined && this.categoriesPlans[categoryID].length !== 0) {
                Object.keys(this.categoryForm.controls).forEach(key => {
                    this.categoryForm.get(key)?.disable();
                });
                // To hide the button
                this.saveCateBtn.nativeElement.style.display = 'none';
            }
            else {
                Object.keys(this.categoryForm.controls).forEach(key => {
                    this.categoryForm.get(key)?.enable();
                });
                // To hide the button
                this.saveCateBtn.nativeElement.style.display = 'block';
            }
            if (this.singleCategory.price_type === "one_time") {
                this.categoryForm.get('frequency')?.disable();
                console.log(this.categoryForm.controls);
            }
        }, (error) => {
            //error() callback
            console.log('Request failed with error', error);
            this.showSpinner = false;
        });
    }
    formatDate(dateString) {
        if (!dateString) {
            return ''; // or any other default value you want to return for null dates
        }
        const date = new Date(dateString);
        return this.datePipe.transform(date, CategoriesConfig.CATEGORY_DATE_FORMAT) || ''; // Adjust the format as per your requirement
    }
    //
    addFeatureTypeRow(parentIndex = 0) {
        const row = this.formBuilder.group(this.packageObject);
        //insert new row in reactive form controls
        this.packageName.get('features').at(parentIndex).get('featureList').push(row);
        this.featureTypeRows[parentIndex].push('');
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
        this.packageName.get('features').push(newFeature);
        this.packageNameRows.push('');
        // Check if the array at parentIndex exists, if not, initialize it as an empty array
        if (!this.featureTypeRows[parentIndex + 1]) {
            this.featureTypeRows[parentIndex + 1] = [];
        }
        this.featureTypeRows[parentIndex + 1].push('');
    }
    resetCategoryFeatureForm(category_id = 0) {
        this.category_id = category_id;
        this.packageNameRows = [''];
        this.featureTypeRows['0'] = [''];
        let packageRow = this.packageName.get('features');
        packageRow.clear();
        packageRow.push(this.formBuilder.group({
            packageName: [''],
            id: [null],
            featureList: this.formBuilder.array([])
        }));
        this.PromiseFunction(category_id).then(result => {
            console.log('result test', result);
            console.log('packageRow', packageRow);
            let URL = this.baseURL + 'api/category/' + category_id + '/features';
            let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
            let body = {};
            let method = "GET";
            let data = [];
            this.paginateSpinner = true;
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                if (response.app_data !== undefined) {
                    let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                    console.log(decrypted_response);
                    //check if product features already exists then initiate for edit data display request
                    if (decrypted_response.category_features !== undefined && decrypted_response.category_features.length > 0) {
                        packageRow.clear();
                        this.editCategoryFeature = true;
                        data = decrypted_response.category_features;
                        let index = 0;
                        for (let key in data) {
                            if (data.hasOwnProperty(key)) {
                                const currentData = data[key];
                                packageRow.push(this.formBuilder.group({
                                    packageName: [currentData.title],
                                    id: [currentData.id],
                                    featureList: this.formBuilder.array([])
                                }));
                                if (currentData.feature_list !== undefined) {
                                    let featureListIndex = 0;
                                    let packageFeaturesList = packageRow.at(index).get('featureList');
                                    packageFeaturesList.clear();
                                    for (let listKey in currentData.feature_list) {
                                        if (currentData.feature_list.hasOwnProperty(listKey)) {
                                            const currentFeatureList = currentData.feature_list[listKey];
                                            let object = {
                                                featureName: currentFeatureList.feature_title,
                                            };
                                            this.categoryPlans.forEach((plan) => {
                                                object['id'] = currentFeatureList.id;
                                                object['plan_' + plan.product.id] = currentFeatureList.plan !== undefined && currentFeatureList.plan.includes(plan.product.id) ? true : false;
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
                    }
                    else {
                        this.editCategoryFeature = false;
                        this.packageName.reset();
                    }
                    this.paginateSpinner = false;
                }
            }, (error) => {
                this.paginateSpinner = false;
            });
            // Output: Promise resolved
        }).catch(error => {
            console.error(error);
        });
    }
    async PromiseFunction(category_id = 0) {
        // Simulate a long-running operation
        const result = await this.performLongRunningOperation(category_id);
        return result; //resolve(result);
    }
    performLongRunningOperation(category_id = 0) {
        let URL = this.baseURL + 'api/local/products';
        let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
        let body = {
            "metadata": {
                "category": String(category_id)
            }
        };
        let method = "POST";
        this.paginateSpinner = true;
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            if (response.app_data !== undefined) {
                let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                console.log(decrypted_response);
                console.log(this.packageName.controls);
                this.categoryPlans = decrypted_response.data;
                let object = {
                    featureName: ['']
                };
                if (decrypted_response.data !== undefined) {
                    decrypted_response.data.forEach((element) => {
                        let data = element.product;
                        object['id'] = [null];
                        object['plan_' + data.id] = [false];
                    });
                }
                this.packageObject = object;
                const row = this.formBuilder.group(object);
                const featureForm = this.packageName.get('features');
                const featureListForm = featureForm.at(0).get('featureList');
                featureListForm.push(row);
                this.paginateSpinner = false;
            }
        }, (error) => {
            this.paginateSpinner = false;
        });
        return [];
    }
    deleteFeatureRow(event, parent_index = 0, current_row = 0, category_block_id = 0, category_block_feature_id = 0) {
        console.log(category_block_id, category_block_feature_id);
        const featureFormArray = this.packageName.get('features');
        const featuresList = featureFormArray.at(parent_index).get('featureList');
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
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                if (response.app_data !== undefined) {
                    let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                    console.log(decrypted_response);
                    this.paginateSpinner = false;
                }
            }, (error) => {
                this.paginateSpinner = false;
            });
        }
    }
    deleteParentFeatureRow(parent_index = 0, feature_id = 0) {
        const featureFormArray = this.packageName.get('features');
        featureFormArray.removeAt(parent_index);
        if (this.category_id && feature_id) {
            let URL = this.baseURL + 'api/category/' + (this.category_id) + '/features/' + feature_id;
            let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
            let body = {};
            let method = "DELETE";
            this.paginateSpinner = true;
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
                if (response.app_data !== undefined) {
                    let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                    this.paginateSpinner = false;
                }
            }, (error) => {
                this.paginateSpinner = false;
            });
        }
    }
    featureControls() {
        const features = this.packageName.get('features');
        if (features !== undefined) {
            return features.controls;
        }
        else {
            return [];
        }
    }
    featureListControls(index = 0) {
        const features = this.packageName.get('features');
        if (features !== undefined) {
            return features.at(index).get('featureList').controls;
        }
        else {
            return [];
        }
    }
    calculateTotal(parent_index) {
        const featureFormArray = this.packageName.get('features');
        const featuresList = featureFormArray.at(parent_index).get('featureList');
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
            let data = []; // Initialize an empty array to hold the category features
            let title = ''; // Initialize an empty string for the title
            let plans = []; // Initialize an empty array for the plans
            let category_features_list = []; // Initialize an empty array for the category features list
            console.log('form Data', formData); // Log the form data for debugging purposes
            // If the features property of the form data is defined
            if (formData.features !== undefined) {
                // Loop through each element in the features array
                formData.features.forEach((element) => {
                    // Set the title to the package name of the current element
                    title = element.packageName;
                    // If the featureList property of the current element is defined
                    if (element.featureList !== undefined) {
                        // Initialize an empty array for the category features list
                        category_features_list = [];
                        // Loop through each element in the featureList array
                        element.featureList.forEach((ele) => {
                            // Initialize an empty array for the plans
                            plans = [];
                            // Loop through each key-value pair in the current element
                            Object.entries(ele).forEach(([key, value]) => {
                                // Replace 'plan_' with an empty string in the key to get the updatedKey
                                let updatedKey = key.replace('plan_', '');
                                // If the updatedKey is not 'featureName' and the value is true
                                if (String(updatedKey) !== "featureName" && value === true) {
                                    // Add the updatedKey to the plans array
                                    plans.push(updatedKey);
                                }
                            });
                            // Add an object to the category_features_list array with the feature title and plans array
                            let editObj = {
                                feature_title: ele.featureName,
                                plan: plans
                            };
                            if (this.editCategoryFeature) {
                                editObj.id = ele.id;
                            }
                            category_features_list.push(editObj);
                        });
                    }
                    // Create a final object with the title, category_id, and category_features_list array
                    let finalObject = {
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
            this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe((response) => {
                let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                // console.log(decrypted_data)
                this.paginateSpinner = false;
                this.packageName.reset();
                this.closeProductFeatureClose.nativeElement.click();
                this.resetCategoryForm();
            }, (error) => {
                console.log('Request failed with error', error);
                this.paginateSpinner = false;
            });
        }
        else {
            // Handle the case where the packageName property is not valid
        }
    }
    resetCategoryForm() {
        let featureFormArray = this.packageName.get('features');
        featureFormArray.clear();
        let object = {};
        this.categoryPlans.forEach((plan) => {
            object['featureName'] = '';
            object['id'] = null;
            object['plan_' + plan.product.id] = false;
        });
        featureFormArray.push(this.formBuilder.group({
            packageName: [],
            id: [null],
            featureList: this.formBuilder.array([
                this.formBuilder.group(object)
            ])
        }));
    }
};
__decorate([
    Input('data')
], CategoriesComponent.prototype, "category_data", void 0);
__decorate([
    ViewChild('AddEditPopup')
], CategoriesComponent.prototype, "AddEditPopup", void 0);
__decorate([
    ViewChild('closeDeletePopup')
], CategoriesComponent.prototype, "closeDeletePopup", void 0);
__decorate([
    ViewChild('closeAddEditPopup')
], CategoriesComponent.prototype, "closeAddEditPopup", void 0);
__decorate([
    ViewChild('saveCateBtn')
], CategoriesComponent.prototype, "saveCateBtn", void 0);
__decorate([
    ViewChild('closeProductFeatureClose')
], CategoriesComponent.prototype, "closeProductFeatureClose", void 0);
__decorate([
    ViewChild('blockToClone')
], CategoriesComponent.prototype, "blockToClone", void 0);
CategoriesComponent = __decorate([
    Component({
        selector: 'app-categories',
        templateUrl: './categories.component.html',
        styleUrls: ['./categories.component.css']
    })
], CategoriesComponent);
export { CategoriesComponent };
export const atLeastOneCheckedValidator = (control) => {
    const formGroup = control;
    const controls = formGroup.controls;
    // Iterate through the checkboxes
    const isChecked = Object.keys(controls)
        .map(key => controls[key].value)
        .some(value => value === true);
    // Return validation result
    return isChecked ? null : { atLeastOneChecked: true };
};
//# sourceMappingURL=categories.component.js.map