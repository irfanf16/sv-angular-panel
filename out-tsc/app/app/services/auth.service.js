import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
import { EncryptDecryptService } from "./encrypt-decrypt.service";
import { BehaviorSubject } from "rxjs";
let AuthService = class AuthService {
    constructor(httpClientRequest, http, deviceInformationService, encryptDecrypt, router, dataSharingService, toastMessages) {
        this.httpClientRequest = httpClientRequest;
        this.http = http;
        this.deviceInformationService = deviceInformationService;
        this.encryptDecrypt = encryptDecrypt;
        this.router = router;
        this.dataSharingService = dataSharingService;
        this.toastMessages = toastMessages;
        this.stateItem = new BehaviorSubject(null);
        this.stateItem$ = this.stateItem.asObservable();
    }
    shareData(data) {
        this.dataSharingService.setSharedData(data);
    }
    Login(URL, username, password, body, headers = new HttpHeaders(), method) {
        this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe((response) => {
            console.log('response from http request');
            let token = null;
            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            const retUser = decrypted_data;
            if (retUser.success !== false && retUser.message !== "Unauthorised") {
                if (retUser && retUser.data) {
                    // Now you can safely access retUser.data without the TypeScript error
                    token = retUser.data.token;
                }
                if (typeof token != "undefined" && token != null && token != "") {
                    console.log('navigated to company management');
                    // save in localStorage
                    localStorage.setItem('isUserToken', this.encryptDecrypt.encrypt(token));
                    this.stateItem.next(retUser);
                    this.router.navigateByUrl('/company-management');
                }
                else {
                    this.shareData({
                        "showSpinner": false
                    });
                    this.Logout();
                }
            }
            else {
                console.log('entered in unauthorized');
                this.shareData({
                    "showSpinner": false,
                    "unAuthorized": true
                });
            }
        }, (error) => {
            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
            this.toastMessages.showToast('', 'Failed login: ' + decrypted_data.data.error, 'error');
            if (decrypted_data.success === false && decrypted_data.message === "Unauthorised.") {
                this.shareData({
                    "showSpinner": false,
                    "unAuthorized": true
                });
            }
        });
    }
    SetState(item) {
        this.stateItem.next(item);
    }
    RemoveState() {
        this.stateItem.next(null);
    }
    Logout() {
        // remove leftover
        this.RemoveState();
        // and clean localstorage, you can use static configuration at this point
        localStorage.removeItem("isUserToken");
        this.router.navigateByUrl('');
    }
    CheckAuth(token) {
        if (typeof token != "undefined" && token != null && token != "") {
            return token != null ? true : false;
        }
        else {
            const localUserJson = localStorage.getItem('isUserToken');
            if (localUserJson != null) {
                let decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
                return decryptedToken != null ? true : false;
            }
        }
        return false;
    }
    ;
};
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthService);
export { AuthService };
const CheckAuth = (token) => {
    const localUserJson = localStorage.getItem('isUserToken');
    if (localUserJson != null) {
        let decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
        return decryptedToken != null ? true : false;
    }
    return false;
};
export const authFactory = (authService) => () => {
    // initialize auth state
    let token = localStorage.getItem('isUserToken');
    let localUserJson = null;
    if (typeof token != "undefined" && token != null && token != "") {
        localUserJson = JSON.parse((new EncryptDecryptService()).decrypt(token));
        if (localUserJson !== null) {
            const _localUser = localUserJson;
            if (CheckAuth(_localUser)) {
                authService.SetState(_localUser);
            }
            else {
                // remove leftover
                authService.RemoveState();
                // and clean localStorage
                localStorage.removeItem('isUserToken');
            }
        }
    }
    else {
        authService.Logout();
    }
};
//# sourceMappingURL=auth.service.js.map