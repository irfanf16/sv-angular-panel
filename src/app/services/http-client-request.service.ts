import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {concatMap, filter, Observable, of, Subject, Subscription, switchMap, take, throwError} from "rxjs";
import {EncryptDecryptService} from "./encrypt-decrypt.service";
import {catchError} from "rxjs/operators";
import {InitiateRefreshTokenHttpRequestService} from "./initiate-refresh-token-http-request.service";
import {environment} from "../../environments/environments";
import {AuthService} from "./auth.service";
import { ToastMessagesComponent } from "../Components/messages/toast-messages/toast-messages.component";

interface PendingRequest {
  url: string,
  body: any;
  headers: HttpHeaders,
  method: string,
  subscription: Subject<any>
}

@Injectable({
  providedIn: 'root'
})


export class HttpClientRequestService{

  baseURL: string = environment.apiBASEURL;
  private isRequestInProgress: boolean = false;
  private refreshTokenSubject: Subject<any> = new Subject<any>();
  private isRefreshingToken: boolean = false;

  private requests$ = new Subject<any>();
  private queue: PendingRequest[] = [];
  private failedRequests: Array<{ url: string, body: any, headers: HttpHeaders, method: string }> = [];

  constructor(private http: HttpClient, private _EncryptDecryptService: EncryptDecryptService,
              private httpClientRequest: InitiateRefreshTokenHttpRequestService, private authService: AuthService, private toastMessages: ToastMessagesComponent
  ) {

    this.requests$.subscribe(request => this.execute(request));
  }


  /** Call this method to add your http request to queue */
  initiateHttpRequest(url: string, body: any, headers: HttpHeaders, method: string) {
    return this.addRequestToQueue(url, body, headers, method);
  }

  private addRequestToQueue(url: string, body: any, headers: HttpHeaders, method: string) {

    const subscription = new Subject<any>();
    const request: PendingRequest = {url, body, headers, method, subscription};

    this.queue.push(request);
    if (this.queue.length === 1) {
      this.startNextRequest();
    }
    return subscription;
  }

  private startNextRequest() {
    // get next request, if any.
    if (this.queue.length > 0) {
      this.execute(this.queue[0]);
    }
  }

  // execute(url: string = "", body: any = "", headers: HttpHeaders = new HttpHeaders(), method: string = 'POST'): Observable<any> {
  execute(requestData: PendingRequest) {

    // Ensure requestData is not undefined
    if (!requestData) {
      console.error('Error: requestData is undefined');
      // return;
    }

    // Ensure requestData.subscription is defined
    if (!requestData.subscription) {
      console.error('Error: Subscription is undefined');
      // return;
    }

    let url = requestData.url;
    let headers = requestData.headers;
    let body = requestData.body;
    let method = requestData.method;

    // Ensure url, headers, body, and method are defined
    if (!url || !headers || !method) {
      console.error('Error: URL, headers, or method is undefined');
      // return;
    }

    if (!url.includes("api/login")) {
      const authToken = JSON.parse(this._EncryptDecryptService.decrypt(localStorage.getItem('isUserToken')));
      headers = headers.set("Authorization", "Bearer " + authToken);
    }

    let options = {headers: headers};
    switch (method) {
      case 'GET':
        this.http.get(url, options).pipe(
          catchError(error => {
            //display Error
            if (error.error.app_data !== undefined) {
              this.toastMessages.showToast('', this._EncryptDecryptService.decrypt(error.error.app_data), 'error')
            }

            if (error.status === 401) {
              return this.handle401Error(requestData);
            }
            else if (error.status === 403) {
              this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
              return throwError(error);
            } else {
              return throwError(error);
            }
          })
        )
          .subscribe(res => {
            if (res) {
              const sub = requestData.subscription;
              if (sub && sub.next) { // Check if subscription and next method are defined
                sub.next(res);
              } else {
                console.error('Subscription or next method is undefined.');
              }
              this.queue.shift();
              this.startNextRequest();
            }
          }, (error) => {
            requestData.subscription.error(error);
            //clear request from queue array
            this.queue.shift();
          });
        break;
      case 'DELETE':
        this.http.delete(url, options).pipe(
          catchError(error => {
            //display Error
            if (error.error.app_data !== undefined) {
              this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error')
            }
            if (error.status === 401) {
              return this.handle401Error(requestData);
            }
            else if (error.status === 403) {
              this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
              return throwError(error);
            }else {
              return throwError(error);
            }
          })
        )
          .subscribe(res => {
            if (res) {
              const sub = requestData.subscription;
              if (sub && sub.next) { // Check if subscription and next method are defined
                sub.next(res);
              } else {
                console.error('Subscription or next method is undefined.');
              }
              this.queue.shift();
              this.startNextRequest();
            }
          }, (error) => {
            requestData.subscription.error(error);
            //clear request from queue array
            this.queue.shift();
          });
        break;
      case 'PUT':
        this.http.put(url, this.encryptAES256CBC(body), options).pipe(
          catchError(error => {
            //display Error
            if (error.error.app_data !== undefined) {
              this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error')
            }

            if (error.status === 401) {
              return this.handle401Error(requestData);
            }
            else if (error.status === 403) {
              this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
              return throwError(error);
            } else {
              return throwError(error);
            }
          })
        )
          .subscribe(res => {
            if (res) {
              const sub = requestData.subscription;
              if (sub && sub.next) { // Check if subscription and next method are defined
                sub.next(res);
              } else {
                console.error('Subscription or next method is undefined.');
              }
              this.queue.shift();
              this.startNextRequest();
            }
          }, (error) => {
            requestData.subscription.error(error);
            //clear request from queue array
            this.queue.shift();
          });
        break;
      default:
        this.http.post(url, this.encryptAES256CBC(body), options)
          .pipe(
            catchError(error => {
              if (error.error !== undefined && error.error.app_data !== undefined) {
                this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error')
              }

              if (error.status === 401) {
                return this.handle401Error(requestData);
              }
              else if (error.status === 403) {
                this.toastMessages.showToast('', 'You do not have the required authorization.', 'error')
                return throwError(error);
              } else {
                return throwError(error);

              }
            })
          )
          .subscribe(res => {
              if (res) {
                const sub = requestData.subscription;
                if (sub && sub.next) { // Check if subscription and next method are defined
                  sub.next(res);
                } else {
                  console.error('Subscription or next method is undefined.');
                }
                this.queue.shift();
                this.startNextRequest();
              }
            },
            (error) => {
              const sub = requestData.subscription;
              if (sub && sub.error) { // Check if subscription and error method are defined
                sub.error(error);
              } else {
                console.error('Subscription or error method is undefined.');
              }
              //clear request from queue array
              this.queue.shift();
              console.log('error occurred')
            }
          );

    }

  }

  private handle401Error(requestData: PendingRequest): Observable<any> {

    // Ensure requestData is not undefined
    if (!requestData) {
      console.error('Error: requestData is undefined');
      return throwError('requestData is undefined');
    }

    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      return this.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshingToken = false;
          // Retry the failed request after token refresh
          return of(this.execute(requestData));
        }),
        catchError(error => {
          this.isRefreshingToken = false;
          // Handle refresh token error
          return throwError(error);
        })
      );
    } else {

      // If token is already being refreshed, wait and retry the request after token refresh


      return this.requests$.pipe(
        filter(data => data !== undefined), // Only process the request when there is data


        take(1), // Take only the next request


        switchMap(() => of(this.execute(requestData))) // Retry the failed request after token refresh

      );

    }
    // else {
    //   // If token is already being refreshed, wait and retry the request after token refresh
    //   return this.requests$.pipe(
    //     take(1), // Take only the next request
    //
    //     // @ts-ignore
    //     switchMap(() => this.execute(requestData))// Retry the failed request after token refresh
    //   );
    // }
  }

  private refreshToken(): Observable<any> {

    // Implement your token refresh logic here
    // Implement your token refresh logic here
    return this.sendRequestAfterTokenRefresh().pipe(
      catchError(error => {
        // Handle token refresh error
        console.log('r3')
        return throwError(error);
      })
    );
  }

  private sendRequestAfterTokenRefresh(): Observable<any> {
    // Ensure necessary variables are defined
    if (!this.httpClientRequest || !this._EncryptDecryptService || !this.baseURL) {
      console.error('Error: Required services or properties are undefined');
      return throwError('Required services or properties are undefined');
    }

    const localUserJson = localStorage.getItem('isUserToken');
    if (localUserJson) {
      const authToken = JSON.parse(this._EncryptDecryptService.decrypt(localUserJson));
      let URL = this.baseURL + 'api/refresh?device=web';
      let headers = new HttpHeaders({
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      });


      return this.httpClientRequest.initiateHttpRequest(URL, {}, headers, "GET").pipe(
        catchError(error => {
          console.error('Token refresh failed', error);
          console.log('r4')
          return throwError(error);
        }),
        concatMap((response: any) => {
          const decrypted_data = JSON.parse(this._EncryptDecryptService.decrypt(response.app_data));
          console.log('Token refresh response', decrypted_data);
          if (decrypted_data.success === true) {
            let token = decrypted_data.data.token;
            localStorage.setItem('isUserToken', this._EncryptDecryptService.encrypt(token));
            this.authService.SetState(token);
            return of(null); // Return null as no further action needed after token refresh
          } else {
            return throwError('Token refresh failed');
          }
        })
      );
    } else {
      this.authService.Logout();
      return throwError('User token not found');
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

  decryptAES256CBC(dataForDecryption: object) {
    return this._EncryptDecryptService.decrypt(JSON.stringify(dataForDecryption))
  }

}
