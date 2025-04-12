import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface IHttpClientRequest {
  initiateHttpRequest(url: string, body: any, headers: HttpHeaders, method: string): Observable<any>;
}

