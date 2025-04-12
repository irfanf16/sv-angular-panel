import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, } from "@angular/common/http";
import { concatMap, filter, of, Subject, switchMap, take, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environments";
let HttpClientRequestService = class HttpClientRequestService {
    constructor(http, _EncryptDecryptService, httpClientRequest, authService, toastMessages) {
        this.http = http;
        this._EncryptDecryptService = _EncryptDecryptService;
        this.httpClientRequest = httpClientRequest;
        this.authService = authService;
        this.toastMessages = toastMessages;
        this.baseURL = environment.apiBASEURL;
        this.isRequestInProgress = false;
        this.refreshTokenSubject = new Subject();
        this.isRefreshingToken = false;
        this.requests$ = new Subject();
        this.queue = [];
        this.failedRequests = [];
        this.requests$.subscribe(request => this.execute(request));
    }
    /** Call this method to add your http request to queue */
    initiateHttpRequest(url, body, headers, method) {
        return this.addRequestToQueue(url, body, headers, method);
    }
    addRequestToQueue(url, body, headers, method) {
        const subscription = new Subject();
        const request = { url, body, headers, method, subscription };
        this.queue.push(request);
        if (this.queue.length === 1) {
            this.startNextRequest();
        }
        return subscription;
    }
    startNextRequest() {
        // get next request, if any.
        if (this.queue.length > 0) {
            this.execute(this.queue[0]);
        }
    }
    // execute(url: string = "", body: any = "", headers: HttpHeaders = new HttpHeaders(), method: string = 'POST'): Observable<any> {
    execute(requestData) {
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
        let options = { headers: headers };
        switch (method) {
            case 'GET':
                this.http.get(url, options).pipe(catchError(error => {
                    //display Error
                    if (error.error.app_data !== undefined) {
                        this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error');
                    }
                    if (error.status === 401) {
                        return this.handle401Error(requestData);
                    }
                    else {
                        return throwError(error);
                    }
                }))
                    .subscribe(res => {
                    if (res) {
                        const sub = requestData.subscription;
                        if (sub && sub.next) { // Check if subscription and next method are defined
                            sub.next(res);
                        }
                        else {
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
                this.http.delete(url, options).pipe(catchError(error => {
                    //display Error
                    if (error.error.app_data !== undefined) {
                        this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error');
                    }
                    if (error.status === 401) {
                        return this.handle401Error(requestData);
                    }
                    else {
                        return throwError(error);
                    }
                }))
                    .subscribe(res => {
                    if (res) {
                        const sub = requestData.subscription;
                        if (sub && sub.next) { // Check if subscription and next method are defined
                            sub.next(res);
                        }
                        else {
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
                this.http.put(url, this.encryptAES256CBC(body), options).pipe(catchError(error => {
                    //display Error
                    if (error.error.app_data !== undefined) {
                        this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error');
                    }
                    if (error.status === 401) {
                        return this.handle401Error(requestData);
                    }
                    else {
                        return throwError(error);
                    }
                }))
                    .subscribe(res => {
                    if (res) {
                        const sub = requestData.subscription;
                        if (sub && sub.next) { // Check if subscription and next method are defined
                            sub.next(res);
                        }
                        else {
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
                    .pipe(catchError(error => {
                    if (error.error !== undefined && error.error.app_data !== undefined) {
                        this.toastMessages.showToast(url, this._EncryptDecryptService.decrypt(error.error.app_data), 'error');
                    }
                    if (error.status === 401) {
                        return this.handle401Error(requestData);
                    }
                    else {
                        return throwError(error);
                    }
                }))
                    .subscribe(res => {
                    if (res) {
                        const sub = requestData.subscription;
                        if (sub && sub.next) { // Check if subscription and next method are defined
                            sub.next(res);
                        }
                        else {
                            console.error('Subscription or next method is undefined.');
                        }
                        this.queue.shift();
                        this.startNextRequest();
                    }
                }, (error) => {
                    const sub = requestData.subscription;
                    if (sub && sub.error) { // Check if subscription and error method are defined
                        sub.error(error);
                    }
                    else {
                        console.error('Subscription or error method is undefined.');
                    }
                    //clear request from queue array
                    this.queue.shift();
                    console.log('error occurred');
                });
        }
    }
    handle401Error(requestData) {
        // Ensure requestData is not undefined
        if (!requestData) {
            console.error('Error: requestData is undefined');
            return throwError('requestData is undefined');
        }
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;
            return this.refreshToken().pipe(switchMap(() => {
                this.isRefreshingToken = false;
                // Retry the failed request after token refresh
                return of(this.execute(requestData));
            }), catchError(error => {
                this.isRefreshingToken = false;
                // Handle refresh token error
                return throwError(error);
            }));
        }
        else {
            // If token is already being refreshed, wait and retry the request after token refresh
            return this.requests$.pipe(filter(data => data !== undefined), // Only process the request when there is data
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
    refreshToken() {
        // Implement your token refresh logic here
        // Implement your token refresh logic here
        return this.sendRequestAfterTokenRefresh().pipe(catchError(error => {
            // Handle token refresh error
            console.log('r3');
            return throwError(error);
        }));
    }
    sendRequestAfterTokenRefresh() {
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
            return this.httpClientRequest.initiateHttpRequest(URL, {}, headers, "GET").pipe(catchError(error => {
                console.error('Token refresh failed', error);
                console.log('r4');
                return throwError(error);
            }), concatMap((response) => {
                const decrypted_data = JSON.parse(this._EncryptDecryptService.decrypt(response.app_data));
                console.log('Token refresh response', decrypted_data);
                if (decrypted_data.success === true) {
                    let token = decrypted_data.data.token;
                    localStorage.setItem('isUserToken', this._EncryptDecryptService.encrypt(token));
                    this.authService.SetState(token);
                    return of(null); // Return null as no further action needed after token refresh
                }
                else {
                    return throwError('Token refresh failed');
                }
            }));
        }
        else {
            this.authService.Logout();
            return throwError('User token not found');
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
    decryptAES256CBC(dataForDecryption) {
        return this._EncryptDecryptService.decrypt(JSON.stringify(dataForDecryption));
    }
};
HttpClientRequestService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], HttpClientRequestService);
export { HttpClientRequestService };
//# sourceMappingURL=http-client-request.service.js.map