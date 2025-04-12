import { __decorate } from "tslib";
import { booleanAttribute, Component, EventEmitter, Input, Output, } from '@angular/core';
let ToggleButtonComponent = class ToggleButtonComponent {
    constructor(cdr) {
        this.cdr = cdr;
        this.changed = new EventEmitter();
        this.designLocked = false;
    }
    // Generate a unique input ID based on the provided id
    get inputId() {
        return `toggle-button-checkbox-${this.id}`;
    }
    // Generate a unique input ID based on the provided id
    get labelId() {
        return `${this.id}`;
    }
    handleChange(event) {
        // if (!this.designLocked) {
        const target = event.target;
        const isChecked = target.checked;
        console.log(isChecked);
        this.checked = isChecked;
        this.changed.emit(isChecked);
        console.log('Emitting changed event:', this.checked);
        // }
    }
    // onChanged(checked: boolean) {
    //   console.log('Received changed event:', checked);
    //   // Handle the changed event here
    // }
    clickedEvent() {
        return this.checked;
    }
};
__decorate([
    Output()
], ToggleButtonComponent.prototype, "changed", void 0);
__decorate([
    Input({ transform: booleanAttribute })
], ToggleButtonComponent.prototype, "checked", void 0);
__decorate([
    Input()
], ToggleButtonComponent.prototype, "id", void 0);
__decorate([
    Input()
], ToggleButtonComponent.prototype, "designLocked", void 0);
ToggleButtonComponent = __decorate([
    Component({
        selector: 'toggle-button',
        template: `
    <input type="checkbox" [id]="inputId"  [checked]="checked"
           (change)="handleChange($event)" name="tt">
    <label class="toggle-button-switch"
           [for]="inputId" [class.locked]="designLocked" [id]="labelId"></label>
    <div class="toggle-button-text" >
      <div class="toggle-button-text-on opacity-0">e</div>
      <div class="toggle-button-text-off opacity-0">e</div>
    </div>
  `,
        styles: [`
    :host {
      display: block;
      position: relative;
      width: 28px;
      height: 17px;
    }

    input[type="checkbox"] {
      display: none;
    }
    .toggle-button-switch {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-radius: 100%;
      cursor: pointer;
      z-index: 100;
      transition: left 0.3s;
    }

    .toggle-button-text {
      overflow: hidden;
      background-color: #758581;;
      border-radius: 25px;
      box-shadow: 2px 2px 5px 0 rgba(50, 50, 50, 0.75);
      transition: background-color 0.3s;
    }


    .toggle-button-text-on,
    .toggle-button-text-off {
      float: left;
      width: 50%;
      height: 100%;
      line-height: 14px;
      font-family: Lato, sans-serif;
      font-weight: bold;
      color: #fff;
      text-align: center;
    }

    input[type="checkbox"]:checked ~ .toggle-button-switch {
      left: 16px;
    }

    input[type="checkbox"]:checked ~ .toggle-button-text {
      background-color: #3dbf87;
    }
    .locked {
      background-color: #ccc;
      pointer-events: none;
    }

  `]
    })
], ToggleButtonComponent);
export { ToggleButtonComponent };
//# sourceMappingURL=toggle-button.component.js.map