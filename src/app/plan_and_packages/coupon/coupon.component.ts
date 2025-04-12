import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppComponent} from "../../app.component";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import { IConfig} from "ngx-countries-dropdown";

interface customerFacingCode{
  showCustomerDropdown?: boolean,
  controlLimitRedemption?: boolean,
  controlExpirationDateFlag?: boolean,
  minOrderValueFlag?: boolean
}

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css'
})
export class CouponComponent {

 // Variable to store any changes
afterChange: any;

// UI control flags for various form field types
controlFormFieldTypeUi: boolean = false; // Flag to control form field type UI
showSpecificProductAddition: boolean = false; // Flag to show specific product addition section
showLimitDateTimeRange: boolean = false; // Flag to show limit date-time range section
showTimeLimitRange: boolean = false; // Flag to show time limit range section
showCustomerDropdown: boolean = false; // Flag to show customer dropdown
controlLimitRedemption: boolean = false; // Flag to control limit redemption
controlExpirationDateFlag: boolean = false; // Flag to control expiration date
minOrderValueFlag: boolean = false; // Flag to control minimum order value
CustomerFacingCodesFlag: boolean = false; // Flag to control customer-facing codes

// Array to store customer-facing codes
customerFacingArray: customerFacingCode[] = [];

// Symbols for code representation
codeSymbol: string = '$'; // Symbol for code
codeFixedSymbol: string = '$'; // Fixed symbol for code

  items = [
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
  item =  'keyword';

  public addCouponForm: FormGroup;

  customConfig: IConfig = {
    displayCurrencySymbol: true // display currency symbol
  };

  constructor(private appComponent: AppComponent, private formBuilder: FormBuilder, private el: ElementRef)
  {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.addCouponForm = this.formBuilder.group({
      couponName: ['', Validators.required],
      couponID: [''],
      discountType: ['fixed',Validators.required],
      typePercentageOff:[''],
      typeCurrencyAmount: [''],
      applySpecificProducts:[false],
      applySpecificProductArray: this.formBuilder.array([
        this.formBuilder.group({
          applySpecificProductValue: [''],
        })
      ]),
      duration: [''],
      limitDateRange: [false],
      limitDateRangeValue:[''],
      limitTotalRedemptions: [false],
      limitTotalRedemptionsValue:['1'],
      customerFacingCodes:[false],
      customerFacingCodesArray:this.formBuilder.array([
        this.formBuilder.group({
          customerFacingCode: [''],
          customerFacingFirstTimeOrder:[false],
          customerFacingSpecificCustomer:[false],
          customerFacingLimitRedemptions:[false],
          customerFacingLimitRedemptionsValue:[''],
          customerFacingExpirationDate:[false],
          customerFacingCodeExpirationDate:[''],
          customerFacingMinOrderValue:[false],
          customerFacingAmount:['']
        })
      ]),

    });
  }

  OpenModel(){
    this.modelCoupon.nativeElement.style.zIndex = 0;
    const backdrop = this.el.nativeElement.querySelector(".offcanvas-backdrop");
    backdrop.style.zIndex = -1;
  }

  onCountryChange(country: any): void {
  console.log(country.currency.code)
    this.codeFixedSymbol = country.currency.code;
    // this.selectedCountry = country;
    //
    // this.amountCtrl.setValue(`${country.currency.symbol} ${this.amountCtrl.value}`);

  }
  onCodeCountryChange(country: any): void {
  console.log(country.currency.code)
  this.codeSymbol = country.currency.code;
    // this.selectedCountry = country;
    //
    // this.amountCtrl.setValue(`${country.currency.symbol} ${this.amountCtrl.value}`);

  }
  controlTypeChange(event:any){

    let value = event.target.value;
    switch (value.trim()){
      case "fixed":
        this.controlFormFieldTypeUi = false;
        break;
      case "percentage":
        this.controlFormFieldTypeUi = true;
        break;
    }
  }

  controlSpecificProductAddition(event: any){
    const target = event.target as HTMLInputElement;
    this.showSpecificProductAddition = target.checked;

  }
  @ViewChild('modelCoupon') modelCoupon!: ElementRef;
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
  controlLimitRange(event: any){
    let target = event.target as HTMLInputElement;
    this.showLimitDateTimeRange = target.checked;

  }
  controlTimeLimitRange(event: any){
    let target = event.target as HTMLInputElement;
    this.showTimeLimitRange = target.checked;

  }
  addApplySpecificProduct(){
    const specificProductGroup = this.formBuilder.group({
      applySpecificProductValue: [''],
    });

    (this.addCouponForm.get('applySpecificProductArray') as FormArray).push(specificProductGroup);
  }

  deleteApplySpecificProduct(index:number = 0){
    (this.addCouponForm.get('applySpecificProductArray') as FormArray).removeAt(index);
  }

  onSelectionChanged(value: string) {
    this.afterChange = value;
    console.log(this.afterChange)
  }
  controlCustomDropdown(event: any, index:number){
    console.log('test', index)
    let target = event.target as HTMLInputElement;
    this.customerFacingArray[index].showCustomerDropdown = target.checked;

  }

  controlLimitRedemptions(event: any){
    let target = event.target as HTMLInputElement;
    this.controlLimitRedemption = target.checked;

  }

  controlExpirationDate(event: any){
    let target = event.target as HTMLInputElement;
    this.controlExpirationDateFlag = target.checked;

  }
  minOrderValue(event: any){
    let target = event.target as HTMLInputElement;
    this.minOrderValueFlag = target.checked;
  }

  controlCustomerFacingCodes(event: any){
    let target = event.target as HTMLInputElement;
    this.CustomerFacingCodesFlag = target.checked;

    if(this.customerFacingArray[0] === undefined){
      this.customerFacingArray[0] = {};
    }
    this.customerFacingArray[0] = {
      showCustomerDropdown: false,
      controlLimitRedemption: false,
      controlExpirationDateFlag: false,
      minOrderValueFlag: false
    }
  }
  specificProductArrayControls(){
    const features = (this.addCouponForm.get('applySpecificProductArray') as FormArray);
    if(features !== undefined)
    {
      return features.controls;
    }
    else{
      return [];
    }
  }

  customerFacingCodesArrayControls(){
    const features = (this.addCouponForm.get('customerFacingCodesArray') as FormArray);
    if(features !== undefined)
    {
      return features.controls;
    }
    else{
      return [];
    }
  }
  addCustomerFacingBlock(){
    const block = this.formBuilder.group({
      customerFacingCode: [''],
      customerFacingFirstTimeOrder:[false],
      customerFacingSpecificCustomer:[false],
      customerFacingLimitRedemptions:[false],
      customerFacingLimitRedemptionsValue:[''],
      customerFacingExpirationDate:[false],
      customerFacingCodeExpirationDate:[''],
      customerFacingMinOrderValue:[false],
      customerFacingAmount:['']
    });
    const customerFacingCodesArray = (this.addCouponForm.get('customerFacingCodesArray') as FormArray);
    customerFacingCodesArray.push(block);

    this.customerFacingArray.push({
      showCustomerDropdown: false,
      controlLimitRedemption: false,
      controlExpirationDateFlag: false,
      minOrderValueFlag: false
    });
  }
  deleteCFBlock(index:number){

    (this.addCouponForm.get('customerFacingCodesArray') as FormArray).removeAt(index);
    this.customerFacingArray.splice(index, 1);
    console.log(index)
  }

}
