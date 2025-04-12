import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environments";
import { catchError, filter, finalize, forkJoin, of, Subject, switchMap, take, throwError } from "rxjs";
let RefreshTokenService = class RefreshTokenService {
    constructor(encryptDecrypt, httpClientRequest) {
        this.encryptDecrypt = encryptDecrypt;
        this.httpClientRequest = httpClientRequest;
        this.baseURL = environment.apiBASEURL;
        this.refreshTokenSubject = new Subject();
        this.isRefreshingToken = false;
        this.failedRequests = [];
    }
    refreshExpiredToken(recursiveURL = '', recursiveBody = '', recursiveHeaders = new HttpHeaders(), recursiveMethod = '') {
        if (this.isRefreshingToken) {
            // Queue the request if token is being refreshed
            return this.refreshTokenSubject.pipe(filter(() => !this.isRefreshingToken), // Wait until token refresh completes
            take(1), // Take only one emission
            switchMap(() => this.resendFailedRequests()));
        }
        else {
            // Trigger token refresh
            this.isRefreshingToken = true;
            this.refreshTokenSubject.next(null);
            return this.resendFailedRequests().pipe(switchMap(() => this.sendRequestAfterTokenRefresh(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod)));
        }
    }
    resendFailedRequests() {
        if (this.failedRequests.length === 0) {
            // If no failed requests, return empty observable
            return of(null);
        }
        else {
            // Resend all failed requests
            const requests = this.failedRequests.map(request => {
                return this.httpClientRequest.initiateHttpRequest(request.url, request.body, request.headers, request.method).pipe(catchError(error => {
                    // If any request fails again, add it to failed requests array
                    this.failedRequests.push(request);
                    return throwError(error);
                }));
            });
            // Clear the failed requests array
            this.failedRequests = [];
            // Combine all requests and execute them
            return forkJoin(requests).pipe(finalize(() => {
                // After all requests are processed, reset the token refresh flag
                this.isRefreshingToken = false;
            }));
        }
    }
    sendRequestAfterTokenRefresh(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod) {
        const localUserJson = localStorage.getItem('isUserToken');
        if (localUserJson) {
            const authToken = JSON.parse(this.encryptDecrypt.decrypt(localUserJson));
            let URL = this.baseURL + 'api/refresh?device=web';
            let headers = new HttpHeaders({
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authToken,
            });
            console.log('refresh initiate start');
            return this.httpClientRequest.initiateHttpRequest(URL, {}, headers, 'GET').pipe(catchError((error) => {
                console.error('Token refresh failed', error);
                return throwError(error);
            }), switchMap((response) => {
                const decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
                console.log('Token refresh response', decrypted_data);
                if (decrypted_data.success === true) {
                    let token = decrypted_data.data.token;
                    localStorage.setItem('isUserToken', this.encryptDecrypt.encrypt(token));
                    // this.authService.SetState(token);
                    if (recursiveURL !== '') {
                        console.log('Entering the conditional block for recursive call');
                        return this.httpClientRequest.initiateHttpRequest(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod).pipe(catchError((error) => {
                            console.error('Recursive call failed', error);
                            return throwError(error);
                        }));
                    }
                    else {
                        return of(null);
                    }
                }
                else {
                    return throwError('Token refresh failed');
                }
            }));
        }
        else {
            // this.authService.Logout();
            return of(null);
        }
    }
};
RefreshTokenService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], RefreshTokenService);
export { RefreshTokenService };
//# sourceMappingURL=refresh-token.service.js.map