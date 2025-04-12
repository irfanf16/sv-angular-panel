import {Inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {EncryptDecryptService} from "./encrypt-decrypt.service";
import {environment} from "../../environments/environments";
import {AuthService} from "./auth.service";
import {
  catchError,
  concatMap,
  filter, finalize, forkJoin,
  from,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
  throwError,
  toArray
} from "rxjs";
import {InitiateRefreshTokenHttpRequestService} from "./initiate-refresh-token-http-request.service";

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {
  baseURL: string = environment.apiBASEURL;
  private refreshTokenSubject: Subject<any> = new Subject<any>();
  private isRefreshingToken: boolean = false;
  private failedRequests: Array<{url: string, body: any, headers: HttpHeaders, method: string}> = [];
  constructor(   private encryptDecrypt: EncryptDecryptService, private httpClientRequest: InitiateRefreshTokenHttpRequestService
  ) { }


  refreshExpiredToken(
    recursiveURL: string = '',
    recursiveBody: any = '',
    recursiveHeaders: HttpHeaders = new HttpHeaders(),
    recursiveMethod: string = ''
  ): Observable<any> {
    if (this.isRefreshingToken) {
      // Queue the request if token is being refreshed
      return this.refreshTokenSubject.pipe(
        filter(() => !this.isRefreshingToken), // Wait until token refresh completes
        take(1), // Take only one emission
        switchMap(() => this.resendFailedRequests())
      );
    } else {
      // Trigger token refresh
      this.isRefreshingToken = true;
      this.refreshTokenSubject.next(null);
      return this.resendFailedRequests().pipe(
        switchMap(() => this.sendRequestAfterTokenRefresh(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod))
      );
    }
  }

  private resendFailedRequests(): Observable<any> {
    if (this.failedRequests.length === 0) {
      // If no failed requests, return empty observable
      return of(null);
    } else {
      // Resend all failed requests
      const requests = this.failedRequests.map(request => {
        return this.httpClientRequest.initiateHttpRequest(request.url, request.body, request.headers, request.method).pipe(
          catchError(error => {
            // If any request fails again, add it to failed requests array
            this.failedRequests.push(request);
            return throwError(error);
          })
        );
      });

      // Clear the failed requests array
      this.failedRequests = [];

      // Combine all requests and execute them
      return forkJoin(requests).pipe(
        finalize(() => {
          // After all requests are processed, reset the token refresh flag
          this.isRefreshingToken = false;
        })
      );
    }
  }

  private sendRequestAfterTokenRefresh(
    recursiveURL: string,
    recursiveBody: any,
    recursiveHeaders: HttpHeaders,
    recursiveMethod: string
  ): Observable<any> {
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
      return this.httpClientRequest.initiateHttpRequest(URL, {}, headers, 'GET').pipe(
        catchError((error) => {
          console.error('Token refresh failed', error);
          return throwError(error);
        }),
        switchMap((response) => {
          const decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log('Token refresh response', decrypted_data);
          if (decrypted_data.success === true) {
            let token = decrypted_data.data.token;
            localStorage.setItem('isUserToken', this.encryptDecrypt.encrypt(token));

            // this.authService.SetState(token);

            if (recursiveURL !== '') {
              console.log('Entering the conditional block for recursive call');
              return this.httpClientRequest.initiateHttpRequest(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod).pipe(
                catchError((error) => {
                  console.error('Recursive call failed', error);
                  return throwError(error);
                })
              );
            } else {
              return of(null);
            }
          } else {
            return throwError('Token refresh failed');
          }
        })
      );
    } else {
      // this.authService.Logout();
      return of(null);
    }
  }




//   refreshExpiredToken(
//     recursiveURL: string = '',
//     recursiveBody: any = '',
//     recursiveHeaders: HttpHeaders = new HttpHeaders(),
//     recursiveMethod: string = ''
//   ): Observable<any> {
//     return new Observable<any>((observer) => {
//       const localUserJson = localStorage.getItem('isUserToken');
//       if (localUserJson) {
//         const authToken = JSON.parse(this.encryptDecrypt.decrypt(localUserJson));
//         let URL = this.baseURL + 'api/refresh?device=web';
//         let headers = new HttpHeaders({
//           Accept: 'application/json',
//           'Access-Control-Allow-Origin': '*',
//           'Content-Type': 'application/json',
//           Authorization: 'Bearer ' + authToken,
//         });
// console.log('refresh initiate start')
//         // First, refresh the token
//         this.httpClientRequest.initiateHttpRequest(URL, {}, headers, 'GET').pipe(
//           catchError((error) => {
//             console.error('Token refresh failed', error);
//             return throwError(error);
//           }),
//           switchMap((response) => {
//             const decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
//             console.log('Token refresh response', decrypted_data);
//             if (decrypted_data.success === true) {
//               let token = decrypted_data.data.token;
//               // Save the refreshed token in localStorage & state
//               localStorage.setItem('isUserToken', this.encryptDecrypt.encrypt(token));
//               this.authService.SetState(token);
//
//               if (recursiveURL !== '') {
//                 console.log('Entering the conditional block for recursive call');
//                 // Send the recursive call and return its response
//                 return this.httpClientRequest.initiateHttpRequest(recursiveURL, recursiveBody, recursiveHeaders, recursiveMethod).pipe(
//                   catchError((error) => {
//                     console.error('Recursive call failed', error);
//                     return throwError(error);
//                   })
//                 );
//               } else {
//                 // If there's no recursive URL, return an empty observable
//                 return of(null);
//               }
//             } else {
//               // Handle token refresh failure
//               observer.error('Token refresh failed');
//               return throwError('Token refresh failed');
//             }
//           })
//         ).subscribe(
//           (response) => {
//             if (response !== null && response !== undefined && response.app_data !== undefined) {
//               console.log('Recursive call response', JSON.parse(this.encryptDecrypt.decrypt(response.app_data)));
//               observer.next(JSON.parse(this.encryptDecrypt.decrypt(response.app_data)));
//             }
//             observer.complete();
//           },
//           (error) => {
//             // Handle errors during the recursive call
//             console.error('Recursive call failed', error);
//             observer.error(error);
//           }
//         );
//       } else {
//         // Handle the case where there is no user token
//         this.authService.Logout();
//         observer.complete();
//       }
//     });
//   }
}
