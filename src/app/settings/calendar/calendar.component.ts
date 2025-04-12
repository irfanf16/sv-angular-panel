import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppComponent} from "../../app.component";
import {checkPermission, formatTimestampToYear} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SpinnerComponentComponent} from "../../Components/UI/spinner-component/spinner-component.component";
import {HttpHeaders} from "@angular/common/http";
import {CategoriesConfig} from "../../Components/constants/plan_&_packages/categories/categories";
import {environment} from "../../../environments/environments";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {NgxPaginationModule} from "ngx-pagination";


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SpinnerComponentComponent,
    AsyncPipe,
    NgForOf,
    NgxPaginationModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {

  public addHolidayForm: FormGroup;

  protected spinner: boolean = false;
  protected edit: boolean = false;

  baseURL: string = environment.apiBASEURL;

  constructor(private appComponent: AppComponent, private formBuilder: FormBuilder, private httpClientRequest: HttpClientRequestService, private encryptDecrypt: EncryptDecryptService) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.addHolidayForm = this.formBuilder.group({
      title: [''],
      dates: [''],
      year: [''],
      description: ['']

    });
  }

  @ViewChild('closeBtn') closeBtn!: ElementRef;
  saveCreateHoliday(){
    if(this.addHolidayForm.valid){
      console.log(this.addHolidayForm.value);
      this.spinner = true;
      let URL = this.baseURL + 'api/settings/holiday/add_holiday';
      let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
      let formData: any = this.addHolidayForm.value;
      let body:any = {};
      body.name = formData.title;
      body.dates = formData.dates;
      body.year = formatTimestampToYear(formData.dates);
      body.description = formData.description;

      let method = "POST";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response);
          this.spinner = false;
          this.closeBtn.nativeElement.click();
          this.edit = false
        },
        (error) => {
          this.spinner = false;
          //error() callback
          console.log('Request failed with error', error);
        });
    }
  }


  protected readonly checkPermission = checkPermission;
  protected readonly moduleIds = moduleIds;
}
