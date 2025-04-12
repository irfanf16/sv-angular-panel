import {Component, ElementRef} from '@angular/core';
import {AppComponent} from "../app.component";


@Component({
  selector: 'app-company-management',
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.css']
})


export class CompanyManagementComponent {


  // Show the spinner

  constructor(private appComponent: AppComponent, private elementRef: ElementRef)
  {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;
  }

  ngAfterViewInit() {



  }



}
