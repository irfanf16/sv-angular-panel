import { __decorate } from "tslib";
import { Component, Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
let SpinnerComponentComponent = class SpinnerComponentComponent {
    constructor() {
        this.spinnerVisibility = new BehaviorSubject(false);
    }
    showSpinner() {
        this.spinnerVisibility.next(true);
    }
    hideSpinner() {
        this.spinnerVisibility.next(false);
    }
    getSpinnerVisibility() {
        return this.spinnerVisibility.asObservable();
    }
};
__decorate([
    Injectable({
        providedIn: 'root',
    })
], SpinnerComponentComponent.prototype, "spinnerVisibility", void 0);
SpinnerComponentComponent = __decorate([
    Component({
        selector: 'app-spinner-component',
        templateUrl: './spinner-component.component.html',
        styleUrls: ['./spinner-component.component.css']
    })
], SpinnerComponentComponent);
export { SpinnerComponentComponent };
//# sourceMappingURL=spinner-component.component.js.map