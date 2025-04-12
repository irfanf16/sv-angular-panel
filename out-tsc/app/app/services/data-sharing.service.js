import { __decorate } from "tslib";
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
let DataSharingService = class DataSharingService {
    constructor() {
        this.sharedDataSubject = new BehaviorSubject(null);
        this.callFunctionEvent = new EventEmitter();
    }
    setSharedData(data) {
        this.sharedDataSubject.next(data);
    }
    getSharedData() {
        return this.sharedDataSubject.asObservable();
    }
};
DataSharingService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], DataSharingService);
export { DataSharingService };
//# sourceMappingURL=data-sharing.service.js.map