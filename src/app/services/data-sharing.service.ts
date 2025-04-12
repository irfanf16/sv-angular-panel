import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private sharedDataSubject = new BehaviorSubject<any>(null);

  setSharedData(data: any) {
    this.sharedDataSubject.next(data);
  }

  getSharedData(): Observable<any> {
    return this.sharedDataSubject.asObservable();
  }
  public callFunctionEvent: EventEmitter<void> = new EventEmitter<void>();


}
