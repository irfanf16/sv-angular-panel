import { __decorate } from "tslib";
import { Component, HostBinding, Input } from '@angular/core';
let SvgIconComponentComponent = class SvgIconComponentComponent {
    set path(filePath) {
        this._path = `url("${filePath}")`;
    }
};
__decorate([
    HostBinding('style.-webkit-mask-image')
], SvgIconComponentComponent.prototype, "_path", void 0);
__decorate([
    Input()
], SvgIconComponentComponent.prototype, "path", null);
SvgIconComponentComponent = __decorate([
    Component({
        selector: 'app-svg-icon-component',
        templateUrl: './svg-icon-component.component.html',
        styleUrls: ['./svg-icon-component.component.scss']
    })
], SvgIconComponentComponent);
export { SvgIconComponentComponent };
//# sourceMappingURL=svg-icon-component.component.js.map