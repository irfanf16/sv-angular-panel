import {Component, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-spinner-component',
  templateUrl: './spinner-component.component.html',
  styleUrls: ['./spinner-component.component.css'],
  standalone: true,
  imports: [
  ],
})
export class SpinnerComponentComponent {

  @Injectable({
    providedIn: 'root',
  })
  private spinnerVisibility = new BehaviorSubject<boolean>(false);

  showSpinner() {
    this.spinnerVisibility.next(true);
  }

  hideSpinner() {
    this.spinnerVisibility.next(false);
  }

  getSpinnerVisibility() {
    return this.spinnerVisibility.asObservable();
  }
}
