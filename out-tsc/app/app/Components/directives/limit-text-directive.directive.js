import { __decorate } from "tslib";
import { Directive, Input } from '@angular/core';
let LimitTextDirective = class LimitTextDirective {
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.limit = 0;
    }
    ngOnInit() {
        const element = this.elementRef.nativeElement;
        const text = element.innerText;
        if (text.length > this.limit) {
            element.innerText = text.substring(0, this.limit) + '...';
        }
    }
};
__decorate([
    Input()
], LimitTextDirective.prototype, "limit", void 0);
LimitTextDirective = __decorate([
    Directive({
        selector: '[appLimitText]'
    })
], LimitTextDirective);
export { LimitTextDirective };
//# sourceMappingURL=limit-text-directive.directive.js.map