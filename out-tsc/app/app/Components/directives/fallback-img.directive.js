import { __decorate } from "tslib";
import { Directive, Input, HostBinding, HostListener } from '@angular/core';
let FallbackImgDirective = class FallbackImgDirective {
    onError() {
        this.src = this.fallback;
    }
};
__decorate([
    Input(),
    HostBinding('src')
], FallbackImgDirective.prototype, "src", void 0);
__decorate([
    Input()
], FallbackImgDirective.prototype, "fallback", void 0);
__decorate([
    HostListener('error')
], FallbackImgDirective.prototype, "onError", null);
FallbackImgDirective = __decorate([
    Directive({
        selector: 'img[fallback]'
    })
], FallbackImgDirective);
export { FallbackImgDirective };
//# sourceMappingURL=fallback-img.directive.js.map