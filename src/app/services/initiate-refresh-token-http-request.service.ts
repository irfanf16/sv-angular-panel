import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {EncryptDecryptService} from "./encrypt-decrypt.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InitiateRefreshTokenHttpRequestService {

  constructor(private http: HttpClient, private _EncryptDecryptService: EncryptDecryptService) { }


  initiateHttpRequest(url: string = "", body: any = "", headers: HttpHeaders = new HttpHeaders() , method:string = 'POST' ): Observable<any> {

    if(!url.includes("api/login"))
    {

      const authToken = JSON.parse(this._EncryptDecryptService.decrypt(localStorage.getItem('isUserToken')));
      headers = headers.set("Authorization", "Bearer " + authToken);
    }

    let options = { headers: headers };
    switch (method) {
      case 'GET':
        console.log('request initated',this.http.get(url, options))
        return this.http.get(url, options);
        break;
      case 'DELETE':
        return this.http.delete(url, options);
        break;
      case 'PUT':
        return this.http.put<any>(url, this.encryptAES256CBC(body), options);
        break;
      default:
        return this.http.post(url, this.encryptAES256CBC(body), options);
        break;
    }
  }

  encryptAES256CBC(dataForEncryption: any) {
    console.log('before encryption', dataForEncryption)
    let encrypted_body = this._EncryptDecryptService.encrypt(dataForEncryption);
    let newDataForEncryption = {
      "app_data": encrypted_body
    }
    console.log('before', newDataForEncryption)
    return newDataForEncryption;
  }
}
