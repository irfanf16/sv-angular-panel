import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let SubModulesRecursiveComponent = class SubModulesRecursiveComponent {
    // @Input() onCheckboxChange!: (event: Event, topLevelParent: string , secondLevelParent: string ,thirdLevelModule: string , fourthLevelModule: string ) => void;
    capitalizeFirstLetterOfEveryWord(input) {
        return input.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    onCheckboxChange(event, topLevelParent = '', secondLevelParent = '', thirdLevelModule = '', fourthLevelModule = '') {
        //
        const modulesFormGroup = this.formGroup.get('modules');
        if (topLevelParent !== '' && fourthLevelModule !== '') {
            const subThirdModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent + '.' + thirdLevelModule);
            const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);
            const moduleGroup = modulesFormGroup.get(topLevelParent);
            moduleGroup.patchValue({ [topLevelParent]: subThirdModuleValue });
            const subModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent);
            subModuleGroup.patchValue({ [secondLevelParent]: subThirdModuleValue });
            let subThirdModuleGroupValues = this.areAllValuesBoolean(subThirdModuleGroup.value);
            subThirdModuleGroup.patchValue({ [thirdLevelModule]: subThirdModuleGroupValues });
        }
        //third level module selection control
        else if (topLevelParent !== '' && thirdLevelModule !== '' && fourthLevelModule === '') {
            const isChecked = event.target.checked;
            const subThirdModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent);
            const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);
            const moduleGroup = modulesFormGroup.get(topLevelParent);
            moduleGroup.patchValue({ [topLevelParent]: subThirdModuleValue });
            const subModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent);
            subModuleGroup.patchValue({ [secondLevelParent]: subThirdModuleValue });
            let subThirdModuleGroupValues = this.areAllValuesBoolean(subThirdModuleGroup.value);
            subThirdModuleGroup.patchValue({ [thirdLevelModule]: subThirdModuleGroupValues });
            //mark checked all child modules true if third level parent selected
            const subThirdModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent + '.' + thirdLevelModule);
            Object.keys(subThirdModuleGroupModules.controls).forEach(controlName => {
                //skip third level module check because it already selected
                if (controlName !== thirdLevelModule) {
                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                    const childModule = subThirdModuleGroupModules.get(controlName);
                    childModule.patchValue({ [controlName]: isChecked });
                }
            });
        }
        else if (topLevelParent !== '' && secondLevelParent !== '' && thirdLevelModule === '' && fourthLevelModule === '') {
            const isChecked = event.target.checked;
            const subThirdModuleGroup = modulesFormGroup.get(topLevelParent);
            const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);
            const moduleGroup = modulesFormGroup.get(topLevelParent);
            moduleGroup.patchValue({ [topLevelParent]: subThirdModuleValue });
            //mark checked all child modules true if third level parent selected
            const subThirdModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent);
            Object.keys(subThirdModuleGroupModules.controls).forEach(controlName => {
                //skip third level module check because it already selected
                if (controlName !== secondLevelParent) {
                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                    const childModule = subThirdModuleGroupModules.get(controlName);
                    childModule.patchValue({ [controlName]: isChecked });
                    childModule.updateValueAndValidity();
                    const subModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent + '.' + controlName);
                    Object.keys(subModuleGroupModules.controls).forEach(subControlName => {
                        if (subControlName !== controlName) {
                            //isChecked denoted value of parent module if it is selected then mark all modules selected
                            const childModule = subModuleGroupModules.get(subControlName);
                            childModule.patchValue({ [subControlName]: isChecked });
                        }
                    });
                }
            });
        }
        else if (topLevelParent !== '' && secondLevelParent === '' && thirdLevelModule === '' && fourthLevelModule === '') {
            const isChecked = event.target.checked;
            const topModule = modulesFormGroup.get(topLevelParent);
            Object.keys(topModule.controls).forEach(controlName => {
                //skip third level module check because it already selected
                if (controlName !== topLevelParent) {
                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                    const childModule = topModule.get(controlName);
                    childModule.patchValue({ [controlName]: isChecked });
                    //third level module selection
                    const subModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + controlName);
                    Object.keys(subModuleGroupModules.controls).forEach(subControlName => {
                        if (subControlName !== controlName) {
                            //isChecked denoted value of parent module if it is selected then mark all modules selected
                            const childThirdModule = subModuleGroupModules.get(subControlName);
                            childThirdModule.patchValue({ [subControlName]: isChecked });
                            Object.keys(childThirdModule.controls).forEach(lastControlName => {
                                if (lastControlName !== subControlName) {
                                    //isChecked denoted value of parent module if it is selected then mark all modules selected
                                    const childFourthModule = childThirdModule.get(lastControlName);
                                    childFourthModule.patchValue({ [lastControlName]: isChecked });
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    areAllValuesBoolean(obj) {
        let result = false;
        for (const key in obj) {
            if (typeof obj[key] === 'boolean') {
                continue; // If it's a boolean, continue to the next key
            }
            else if (typeof obj[key] === 'object') {
                if (obj[key][key] == true) {
                    result = true; // If any nested object has non-boolean values, return false
                }
            }
            // If all nested values are boolean or nested objects with boolean values, return true
        }
        return result;
    }
};
__decorate([
    Input()
], SubModulesRecursiveComponent.prototype, "subModules", void 0);
__decorate([
    Input()
], SubModulesRecursiveComponent.prototype, "formGroup", void 0);
SubModulesRecursiveComponent = __decorate([
    Component({
        selector: 'app-sub-modules-recursive',
        templateUrl: './sub-modules-recursive.component.html',
        styleUrls: ['./sub-modules-recursive.component.css']
    })
], SubModulesRecursiveComponent);
export { SubModulesRecursiveComponent };
//# sourceMappingURL=sub-modules-recursive.component.js.map