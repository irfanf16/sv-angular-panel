import {Component, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";

interface Module {
  "children"?: Module[],
  "id": number,
  "title": string,
  "description": string,
  "url": string,
  "icon": string,
  "parent_module_id": number,
  "module_order": number,
  "module_type": number,
  "deleted_at": string,
  "created_at": string,
  "updated_at": string,
  "rules": {
    "info": [
      {
        "key": string,
        "title": string,
        "values": string
      }
    ],
    "implementation": [
      {
        "key": string,
        "title": string,
        "values": string[]
      }
    ]
  }
}
@Component({
  selector: 'app-sub-modules-recursive',
  templateUrl: './sub-modules-recursive.component.html',
  styleUrls: ['./sub-modules-recursive.component.css']
})
export class SubModulesRecursiveComponent {
  @Input() subModules!: any;
  @Input() formGroup!: FormGroup;

  // @Input() onCheckboxChange!: (event: Event, topLevelParent: string , secondLevelParent: string ,thirdLevelModule: string , fourthLevelModule: string ) => void;

  capitalizeFirstLetterOfEveryWord(input: string): string {
    return input.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  onCheckboxChange(event: Event, topLevelParent: string = '', secondLevelParent: string = '', thirdLevelModule: string = '', fourthLevelModule: string = '') {
    //
    const modulesFormGroup = this.formGroup.get('modules') as FormGroup;

    if (topLevelParent !== '' && fourthLevelModule !== '') {
      const subThirdModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent + '.' + thirdLevelModule) as FormGroup;
      const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);

      const moduleGroup = modulesFormGroup.get(topLevelParent) as FormGroup;
      moduleGroup.patchValue({[topLevelParent]: subThirdModuleValue});

      const subModuleGroup = modulesFormGroup.get( topLevelParent + '.' + secondLevelParent) as FormGroup;
        subModuleGroup.patchValue({[secondLevelParent]: subThirdModuleValue});

      let subThirdModuleGroupValues = this.areAllValuesBoolean(subThirdModuleGroup.value);
      subThirdModuleGroup.patchValue({[thirdLevelModule]: subThirdModuleGroupValues});

    }
    //third level module selection control
    else if (topLevelParent !== '' && thirdLevelModule !== '' && fourthLevelModule === '') {
      const isChecked = (event.target as HTMLInputElement).checked;
      const subThirdModuleGroup = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent) as FormGroup;
      const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);

      const moduleGroup = modulesFormGroup.get(topLevelParent) as FormGroup;
      moduleGroup.patchValue({[topLevelParent]: subThirdModuleValue});

      const subModuleGroup = modulesFormGroup.get( topLevelParent + '.' + secondLevelParent) as FormGroup;
      subModuleGroup.patchValue({[secondLevelParent]: subThirdModuleValue});

      let subThirdModuleGroupValues = this.areAllValuesBoolean(subThirdModuleGroup.value);
      subThirdModuleGroup.patchValue({[thirdLevelModule]: subThirdModuleGroupValues});

      //mark checked all child modules true if third level parent selected
      const subThirdModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent+'.'+ thirdLevelModule) as FormGroup;
      Object.keys(subThirdModuleGroupModules.controls).forEach(controlName => {
        //skip third level module check because it already selected
        if(controlName !== thirdLevelModule)
        {
          //isChecked denoted value of parent module if it is selected then mark all modules selected
          const childModule = subThirdModuleGroupModules.get(controlName) as FormGroup;
          childModule.patchValue({[controlName]: isChecked});
        }
      });
    }
    else if (topLevelParent !== '' && secondLevelParent !== '' && thirdLevelModule === '' && fourthLevelModule === '') {

      const isChecked = (event.target as HTMLInputElement).checked;
      const subThirdModuleGroup = modulesFormGroup.get(topLevelParent) as FormGroup;
      const subThirdModuleValue = this.areAllValuesBoolean(subThirdModuleGroup.value);

      const moduleGroup = modulesFormGroup.get(topLevelParent) as FormGroup;
      moduleGroup.patchValue({[topLevelParent]: subThirdModuleValue});

      //mark checked all child modules true if third level parent selected
      const subThirdModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent) as FormGroup;

      Object.keys(subThirdModuleGroupModules.controls).forEach(controlName => {

        //skip third level module check because it already selected
        if(controlName !== secondLevelParent)
        {

          //isChecked denoted value of parent module if it is selected then mark all modules selected
          const childModule = subThirdModuleGroupModules.get(controlName) as FormGroup;
          childModule.patchValue({[controlName]: isChecked});
          childModule.updateValueAndValidity();

          const subModuleGroupModules = modulesFormGroup.get(topLevelParent + '.' + secondLevelParent +'.'+ controlName) as FormGroup;
          Object.keys(subModuleGroupModules.controls).forEach(subControlName => {

            if(subControlName !== controlName)
            {
              //isChecked denoted value of parent module if it is selected then mark all modules selected
              const childModule = subModuleGroupModules.get(subControlName) as FormGroup;
              childModule.patchValue({[subControlName]: isChecked});
            }

          });
        }

      });

    }

    else if(topLevelParent !== '' && secondLevelParent === '' && thirdLevelModule === '' && fourthLevelModule === '')
    {
      const isChecked = (event.target as HTMLInputElement).checked;
      const topModule = modulesFormGroup.get(topLevelParent) as FormGroup;

      Object.keys(topModule.controls).forEach(controlName => {

        //skip third level module check because it already selected
        if(controlName !== topLevelParent)
        {
          //isChecked denoted value of parent module if it is selected then mark all modules selected
          const childModule = topModule.get(controlName) as FormGroup;
          childModule.patchValue({[controlName]: isChecked});

          //third level module selection
          const subModuleGroupModules = modulesFormGroup.get(topLevelParent +'.'+ controlName) as FormGroup;
          Object.keys(subModuleGroupModules.controls).forEach(subControlName => {

            if(subControlName !== controlName)
            {
              //isChecked denoted value of parent module if it is selected then mark all modules selected
              const childThirdModule = subModuleGroupModules.get( subControlName) as FormGroup;
              childThirdModule.patchValue({[subControlName]: isChecked});


              Object.keys(childThirdModule.controls).forEach(lastControlName => {

                if(lastControlName !== subControlName)
                {
                  //isChecked denoted value of parent module if it is selected then mark all modules selected
                  const childFourthModule = childThirdModule.get(lastControlName) as FormGroup;
                  childFourthModule.patchValue({[lastControlName]: isChecked});
                }

              });

            }

          });
        }

      });

    }

  }

  areAllValuesBoolean(obj: any): boolean {
    let result: boolean = false;
    for (const key in obj) {

      if (typeof obj[key] === 'boolean') {
        continue; // If it's a boolean, continue to the next key
      } else if (typeof obj[key] === 'object') {
        if (obj[key][key] == true) {
          result = true; // If any nested object has non-boolean values, return false
        }
      }
      // If all nested values are boolean or nested objects with boolean values, return true
    }
    return result;
  }
}
