import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
let InitiateRefreshTokenHttpRequestService = class InitiateRefreshTokenHttpRequestService {
    constructor(http, _EncryptDecryptService) {
        this.http = http;
        this._EncryptDecryptService = _EncryptDecryptService;
    }
    initiateHttpRequest(url = "", body = "", headers = new HttpHeaders(), method = 'POST') {
        if (!url.includes("api/login")) {
            const authToken = JSON.parse(this._EncryptDecryptService.decrypt(localStorage.getItem('isUserToken')));
            headers = headers.set("Authorization", "Bearer " + authToken);
        }
        let options = { headers: headers };
        switch (method) {
            case 'GET':
                console.log('request initated', this.http.get(url, options));
                return this.http.get(url, options);
                break;
            case 'DELETE':
                return this.http.delete(url, options);
                break;
            case 'PUT':
                return this.http.put(url, this.encryptAES256CBC(body), options);
                break;
            default:
                return this.http.post(url, this.encryptAES256CBC(body), options);
                break;
        }
    }
    encryptAES256CBC(dataForEncryption) {
        console.log('before encryption', dataForEncryption);
        let encrypted_body = this._EncryptDecryptService.encrypt(dataForEncryption);
        let newDataForEncryption = {
            "app_data": encrypted_body
        };
        console.log('before', newDataForEncryption);
        return newDataForEncryption;
    }
};
InitiateRefreshTokenHttpRequestService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], InitiateRefreshTokenHttpRequestService);
export { InitiateRefreshTokenHttpRequestService };
//# sourceMappingURL=initiate-refresh-token-http-request.service.js.map