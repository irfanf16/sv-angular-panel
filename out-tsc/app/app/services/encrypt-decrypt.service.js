import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from "../../environments/environments";
import { Base64 } from "js-base64";
let EncryptDecryptService = class EncryptDecryptService {
    // secretKey = CryptoJS.enc.Base64.parse(environment.secretKey.trim());
    // secretKey = CryptoJS.enc.Utf8.parse(environment.secretKey.trim())
    constructor() {
        this.secretKey = environment.secretKey.trim();
    }
    encrypt(value) {
        let iv = CryptoJS.lib.WordArray.random(16), key = CryptoJS.enc.Base64.parse(Base64.encode(this.secretKey));
        let options = {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        };
        // I'm using JSON.stringify(data) instead of just data
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), key, options);
        let t_empt = encrypted.toString();
        let tiv = CryptoJS.enc.Base64.stringify(iv);
        let result = {
            iv: tiv,
            value: t_empt,
            mac: CryptoJS.HmacSHA256(tiv + t_empt, key).toString(),
        };
        let result1 = JSON.stringify(result);
        let result2 = CryptoJS.enc.Utf8.parse(result1);
        return CryptoJS.enc.Base64.stringify(result2);
    }
    decrypt(textToDecrypt) {
        var encrypted_json = JSON.parse(Base64.decode(textToDecrypt));
        return CryptoJS.AES.decrypt(encrypted_json.value, CryptoJS.enc.Base64.parse(Base64.encode(this.secretKey)), {
            iv: CryptoJS.enc.Base64.parse(encrypted_json.iv),
            mode: CryptoJS.mode.CBC
        }).toString(CryptoJS.enc.Utf8);
    }
};
EncryptDecryptService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], EncryptDecryptService);
export { EncryptDecryptService };
//# sourceMappingURL=encrypt-decrypt.service.js.map