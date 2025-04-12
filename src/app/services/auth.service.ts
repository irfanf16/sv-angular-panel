import {ElementRef, Injectable} from '@angular/core';
import iAuthInfo from "../models/iauth-info/iAuthInfo";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {AngularDeviceInformationService} from "angular-device-information";
import {EncryptDecryptService} from "./encrypt-decrypt.service";
import {BehaviorSubject, Observable} from "rxjs";
import {Router} from "@angular/router";
import {DataSharingService} from "./data-sharing.service";
import {ToastMessagesComponent} from "../Components/messages/toast-messages/toast-messages.component";
import {InitiateRefreshTokenHttpRequestService} from "./initiate-refresh-token-http-request.service";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private stateItem: BehaviorSubject<iAuthInfo | null> = new BehaviorSubject<iAuthInfo | null>(null);
  stateItem$: Observable<iAuthInfo | null> = this.stateItem.asObservable();

  constructor(private httpClientRequest: InitiateRefreshTokenHttpRequestService, private http: HttpClient, private deviceInformationService: AngularDeviceInformationService,
              private encryptDecrypt: EncryptDecryptService,
              private router: Router, private dataSharingService: DataSharingService, private toastMessages:ToastMessagesComponent
  )
  {}

  shareData(data:any) {
    this.dataSharingService.setSharedData(data);
  }
  Login(URL: any, username: any, password: any, body: any, headers: HttpHeaders = new HttpHeaders(), method: string) {
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {                           //next() callback

        console.log('response from http request')
        let token = null;
        let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        const retUser: iAuthInfo = <iAuthInfo>decrypted_data;
        if (retUser.success !== false && retUser.message !== "Unauthorised") {
          console.log('retUser',retUser)
          if (retUser && retUser.data) {
            // Now you can safely access retUser.data without the TypeScript error

            token = retUser.data.token;
          }


          if (typeof token != "undefined" && token != null && token != "") {
            console.log('navigated to company management')
            // save in localStorage
            localStorage.setItem('isUserToken', this.encryptDecrypt.encrypt(token));
            localStorage.setItem('userImage', this.encryptDecrypt.encrypt({image: retUser.data?.image, name: retUser.data?.name}));
            localStorage.setItem('userPermissions', this.encryptDecrypt.encrypt(retUser.data?.permissions));
            this.stateItem.next(retUser);
            this.router.navigateByUrl('/company-management');
          } else {
            this.shareData({
              "showSpinner": false
            });
            this.Logout();
          }
        }
        else
        {
          console.log('entered in unauthorized')
          this.shareData({
            "showSpinner": false,
            "unAuthorized": true
          });
        }


      },
      (error) => {                             //error() callback

          let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(error.error.app_data));
          this.toastMessages.showToast('','Failed login: '+ decrypted_data.data.error,'error');
          if (decrypted_data.success === false && decrypted_data.message === "Unauthorised.") {
            this.shareData({
              "showSpinner": false,
              "unAuthorized": true

            });
          }

      });
  }

  SetState(item: any) {
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
    localStorage.removeItem("userImage");
    localStorage.removeItem("userPermissions");
    this.router.navigateByUrl('');
  }

  CheckAuth(token: string) {
    if (typeof token != "undefined" && token != null && token != "") {
      return token != null;
    } else {
      const localUserJson = localStorage.getItem('isUserToken');
      if (localUserJson != null) {
        let decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson))
        return decryptedToken != null;
      }
    }
    return false;
  };

}

const CheckAuth = (token: string): boolean => {
  const localUserJson = localStorage.getItem('isUserToken');
  if (localUserJson != null) {
    let decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
    return decryptedToken != null;
  }
  return false;
};
export const authFactory = (authService: AuthService) => () => {
  // initialize auth state
let token = localStorage.getItem('isUserToken');
  let localUserJson = null;

  if (typeof token != "undefined" && token != null && token != "") {
    localUserJson = JSON.parse((new EncryptDecryptService()).decrypt(token));

    if (localUserJson !== null) {
      const _localUser: string = localUserJson;

      if (CheckAuth(_localUser)) {
        authService.SetState(_localUser);

      } else {
        // remove leftover
        authService.RemoveState();
        // and clean localStorage
        localStorage.removeItem('isUserToken');
        localStorage.removeItem('userImage');
        localStorage.removeItem("userPermissions");
      }
    }
  } else {
    authService.Logout();
  }
};
