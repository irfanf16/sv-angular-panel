import { __decorate } from "tslib";
import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
let SearchAbleDropdownComponent = class SearchAbleDropdownComponent {
    set items(value) {
        this.list = value;
        this.temp_list = value;
    }
    constructor(ele, formBuilder) {
        this.ele = ele;
        this.formBuilder = formBuilder;
        this.list = [];
        this.temp_list = [];
        this.keyword = "";
        this.afterChange = new EventEmitter();
        this.onChange = () => { };
        this.onTouch = () => { };
        this.value = "Select";
        this.shown = false;
        this.searchAbleDropdown = this.formBuilder.group({
            keyword: ['']
        });
    }
    ngOnChanges() {
        this._label = (typeof this.label !== 'undefined' && this.label !== '') ? this.label : 'name';
        this._img = (typeof this.img !== 'undefined' && this.img !== '') ? this.img : 'img';
        this._uid = (typeof this.uid !== 'undefined' && this.uid !== '') ? this.uid : 'id';
        this.value = 'Select';
    }
    writeValue(value) {
        if (value) {
            this.temp_list.map(x => {
                if (x[this._uid] == value) {
                    this.value = x[this._label];
                }
            });
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouch = fn;
    }
    search(e) {
        const val = e.toLowerCase();
        const temp = this.temp_list.filter(x => {
            // @ts-ignore
            if (x[this._label].toLowerCase().indexOf(val) !== -1 || !val) {
                return x;
            }
        });
        this.list = temp;
    }
    select(item) {
        this.onChange(item[this._label]);
        this.value = item[this._label];
        this.shown = false;
        this.afterChange.emit(item);
    }
    show() {
        this.shown = !this.shown;
        setTimeout(() => {
            this.input?.nativeElement.focus();
        }, 200);
    }
    onClick(e) {
        if (!this.ele.nativeElement.contains(e.target)) {
            this.shown = false;
        }
    }
};
__decorate([
    Output()
], SearchAbleDropdownComponent.prototype, "afterChange", void 0);
__decorate([
    ViewChild("input", { static: false })
], SearchAbleDropdownComponent.prototype, "input", void 0);
__decorate([
    Input("size")
], SearchAbleDropdownComponent.prototype, "size", void 0);
__decorate([
    Input("items")
], SearchAbleDropdownComponent.prototype, "items", null);
__decorate([
    Input("img")
], SearchAbleDropdownComponent.prototype, "img", void 0);
__decorate([
    Input("label")
], SearchAbleDropdownComponent.prototype, "label", void 0);
__decorate([
    Input("uid")
], SearchAbleDropdownComponent.prototype, "uid", void 0);
__decorate([
    HostListener("document:click", ["$event"])
], SearchAbleDropdownComponent.prototype, "onClick", null);
SearchAbleDropdownComponent = __decorate([
    Component({
        selector: 'app-search-able-dropdown',
        templateUrl: './search-able-dropdown.component.html',
        styleUrl: './search-able-dropdown.component.scss',
    })
], SearchAbleDropdownComponent);
export { SearchAbleDropdownComponent };
//# sourceMappingURL=search-able-dropdown.component.js.map