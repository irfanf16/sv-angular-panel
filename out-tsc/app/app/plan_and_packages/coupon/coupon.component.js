import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { Validators } from "@angular/forms";
let CouponComponent = class CouponComponent {
    constructor(appComponent, formBuilder, el) {
        this.appComponent = appComponent;
        this.formBuilder = formBuilder;
        this.el = el;
        // UI control flags for various form field types
        this.controlFormFieldTypeUi = false; // Flag to control form field type UI
        this.showSpecificProductAddition = false; // Flag to show specific product addition section
        this.showLimitDateTimeRange = false; // Flag to show limit date-time range section
        this.showTimeLimitRange = false; // Flag to show time limit range section
        this.showCustomerDropdown = false; // Flag to show customer dropdown
        this.controlLimitRedemption = false; // Flag to control limit redemption
        this.controlExpirationDateFlag = false; // Flag to control expiration date
        this.minOrderValueFlag = false; // Flag to control minimum order value
        this.CustomerFacingCodesFlag = false; // Flag to control customer-facing codes
        // Array to store customer-facing codes
        this.customerFacingArray = [];
        // Symbols for code representation
        this.codeSymbol = '$'; // Symbol for code
        this.codeFixedSymbol = '$'; // Fixed symbol for code
        this.items = [
            {
                productId: 446,
                artName: "CASUAL",
                shoppifyFlag: false,
                productPrice: 32.0
            },
            {
                productId: 459,
                artName: "test",
                shoppifyFlag: false,
                productPrice: 37.0
            },
            {
                productId: 461,
                artName: "test",
                shoppifyFlag: false,
                productPrice: 54.0
            },
            {
                productId: 465,
                artName: "test2212",
                shoppifyFlag: false,
                productPrice: 88.0
            },
            {
                productId: 469,
                artName: "test444",
                shoppifyFlag: false,
                productPrice: 57.0
            }
        ];
        this.item = 'keyword';
        this.customConfig = {
            displayCurrencySymbol: true // display currency symbol
        };
        this.appComponent.isLoginScreen = false;
        this.appComponent.showMenu = true;
        this.addCouponForm = this.formBuilder.group({
            couponName: ['', Validators.required],
            couponID: [''],
            discountType: ['fixed', Validators.required],
            typePercentageOff: [''],
            typeCurrencyAmount: [''],
            applySpecificProducts: [false],
            applySpecificProductArray: this.formBuilder.array([
                this.formBuilder.group({
                    applySpecificProductValue: [''],
                })
            ]),
            duration: [''],
            limitDateRange: [false],
            limitDateRangeValue: [''],
            limitTotalRedemptions: [false],
            limitTotalRedemptionsValue: ['1'],
            customerFacingCodes: [false],
            customerFacingCodesArray: this.formBuilder.array([
                this.formBuilder.group({
                    customerFacingCode: [''],
                    customerFacingFirstTimeOrder: [false],
                    customerFacingSpecificCustomer: [false],
                    customerFacingLimitRedemptions: [false],
                    customerFacingLimitRedemptionsValue: [''],
                    customerFacingExpirationDate: [false],
                    customerFacingCodeExpirationDate: [''],
                    customerFacingMinOrderValue: [false],
                    customerFacingAmount: ['']
                })
            ]),
        });
    }
    OpenModel() {
        this.modelCoupon.nativeElement.style.zIndex = 0;
        const backdrop = this.el.nativeElement.querySelector(".offcanvas-backdrop");
        backdrop.style.zIndex = -1;
    }
    onCountryChange(country) {
        console.log(country.currency.code);
        this.codeFixedSymbol = country.currency.code;
        // this.selectedCountry = country;
        //
        // this.amountCtrl.setValue(`${country.currency.symbol} ${this.amountCtrl.value}`);
    }
    onCodeCountryChange(country) {
        console.log(country.currency.code);
        this.codeSymbol = country.currency.code;
        // this.selectedCountry = country;
        //
        // this.amountCtrl.setValue(`${country.currency.symbol} ${this.amountCtrl.value}`);
    }
    controlTypeChange(event) {
        let value = event.target.value;
        switch (value.trim()) {
            case "fixed":
                this.controlFormFieldTypeUi = false;
                break;
            case "percentage":
                this.controlFormFieldTypeUi = true;
                break;
        }
    }
    controlSpecificProductAddition(event) {
        const target = event.target;
        this.showSpecificProductAddition = target.checked;
    }
    onFocus() {
        // this.modelCoupon.nativeElement.style.zIndex = 0;
        // const backdrop = this.el.nativeElement.querySelector(".offcanvas-backdrop");
        // backdrop.style.zIndex = -1;
        console.log('Input received focus!');
        // Perform some action here
    }
    onBlur() {
        console.log('Input lost focus!');
    }
    controlLimitRange(event) {
        let target = event.target;
        this.showLimitDateTimeRange = target.checked;
    }
    controlTimeLimitRange(event) {
        let target = event.target;
        this.showTimeLimitRange = target.checked;
    }
    addApplySpecificProduct() {
        const specificProductGroup = this.formBuilder.group({
            applySpecificProductValue: [''],
        });
        this.addCouponForm.get('applySpecificProductArray').push(specificProductGroup);
    }
    deleteApplySpecificProduct(index = 0) {
        this.addCouponForm.get('applySpecificProductArray').removeAt(index);
    }
    onSelectionChanged(value) {
        this.afterChange = value;
        console.log(this.afterChange);
    }
    controlCustomDropdown(event, index) {
        console.log('test', index);
        let target = event.target;
        this.customerFacingArray[index].showCustomerDropdown = target.checked;
    }
    controlLimitRedemptions(event) {
        let target = event.target;
        this.controlLimitRedemption = target.checked;
    }
    controlExpirationDate(event) {
        let target = event.target;
        this.controlExpirationDateFlag = target.checked;
    }
    minOrderValue(event) {
        let target = event.target;
        this.minOrderValueFlag = target.checked;
    }
    controlCustomerFacingCodes(event) {
        let target = event.target;
        this.CustomerFacingCodesFlag = target.checked;
        if (this.customerFacingArray[0] === undefined) {
            this.customerFacingArray[0] = {};
        }
        this.customerFacingArray[0] = {
            showCustomerDropdown: false,
            controlLimitRedemption: false,
            controlExpirationDateFlag: false,
            minOrderValueFlag: false
        };
    }
    specificProductArrayControls() {
        const features = this.addCouponForm.get('applySpecificProductArray');
        if (features !== undefined) {
            return features.controls;
        }
        else {
            return [];
        }
    }
    customerFacingCodesArrayControls() {
        const features = this.addCouponForm.get('customerFacingCodesArray');
        if (features !== undefined) {
            return features.controls;
        }
        else {
            return [];
        }
    }
    addCustomerFacingBlock() {
        const block = this.formBuilder.group({
            customerFacingCode: [''],
            customerFacingFirstTimeOrder: [false],
            customerFacingSpecificCustomer: [false],
            customerFacingLimitRedemptions: [false],
            customerFacingLimitRedemptionsValue: [''],
            customerFacingExpirationDate: [false],
            customerFacingCodeExpirationDate: [''],
            customerFacingMinOrderValue: [false],
            customerFacingAmount: ['']
        });
        const customerFacingCodesArray = this.addCouponForm.get('customerFacingCodesArray');
        customerFacingCodesArray.push(block);
        this.customerFacingArray.push({
            showCustomerDropdown: false,
            controlLimitRedemption: false,
            controlExpirationDateFlag: false,
            minOrderValueFlag: false
        });
    }
    deleteCFBlock(index) {
        this.addCouponForm.get('customerFacingCodesArray').removeAt(index);
        this.customerFacingArray.splice(index, 1);
        console.log(index);
    }
};
__decorate([
    ViewChild('modelCoupon')
], CouponComponent.prototype, "modelCoupon", void 0);
CouponComponent = __decorate([
    Component({
        selector: 'app-coupon',
        templateUrl: './coupon.component.html',
        styleUrl: './coupon.component.css'
    })
], CouponComponent);
export { CouponComponent };
//# sourceMappingURL=coupon.component.js.map