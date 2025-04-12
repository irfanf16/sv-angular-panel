import {ChangeDetectorRef, Component} from '@angular/core';
import {HttpClientRequestService} from "../../services/http-client-request.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {environment} from "../../../environments/environments";
import {AngularDeviceInformationService} from "angular-device-information";
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router, } from "@angular/router";
import {AppComponent} from "../../app.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataSharingService} from "../../services/data-sharing.service";
import { EncryptDecryptService } from 'src/app/services/encrypt-decrypt.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent {
  passwordShowHide:string = "";
  authorized:boolean = false;
  show:boolean = false;
  showSpinner:boolean = false;
  password:string = "";
  username:string = "";
  url:string = '';

  ipAddress: string = "";

  baseURL: string = environment.apiBASEURL;
  browserName:string = '';
  browserVersion:string = '';
  windowOS:any = '';
  // @ts-ignore
  public loginForm: FormGroup;
  showErrors: boolean = false;
  submitted: boolean = false;

  constructor(private httpClientRequest: HttpClientRequestService, private encryptDecrypt: EncryptDecryptService,private http: HttpClient, private deviceInformationService: AngularDeviceInformationService, private authService: AuthService, private activatedRoute: ActivatedRoute, private router: Router, private appComponent: AppComponent,private formBuilder: FormBuilder,private dataSharingService: DataSharingService,private cdr: ChangeDetectorRef)
  {
    this.appComponent.isLoginScreen = true;
    this.appComponent.showMenu = false;
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    console.log(this.encryptDecrypt.decrypt("eyJpdiI6ImtVdjhWTmFNdktSQUdCUFovc1ppTnc9PSIsInZhbHVlIjoiRVVjN2Fwc2kvd2ZPS3pHVlNoazRSQkFZYnBuRDMyQ0hUeUhrMm53cEdyaFh0NnhqclY1SjB2cDdoZ1BFYVZVaGFmWmM1ekFwRFByeHlTYlB0Nm55cHZiRlNWOHJ4NzF4dllxMHBsRms5aUN4eDFaR211d1ZsMjVSYVVFYkpJdTkxNSthWXNTWHpTbElEK3J6UFkxc1Y5ZzhWcEdldFNsOTJjUEFLUURFeHAxOUs0ejZxV0RyZW9mY1Bnb2tIaFhyRjlCTVJoRys1WWxXcW8zY0RJanNST281ZEhhdENYNUNLQ0NCMGhVRGl2QVRVT3pGeEQ1eExBSzRiVEFUcHV1NSIsIm1hYyI6ImI2N2FlZTJjNTNmYzFlZTQxNjdjNWU1ZjA1Yzg5ZDk0NDAyMjZmZGViNWZjYWEwZjg5ZGRiMjQxYzg3YzM1NGYifQ=="));
  }


  ngOnInit() {
    //set initial password type of log in form
    this.password = 'password';

    this.browserName = this.detectBrowserName();
    this.browserVersion = this.detectBrowserVersion();
    this.windowOS = this.deviceInformationService.getDeviceInfo().os;

     this.http.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
       this.ipAddress = res.ip;
     });

      this.activatedRoute.data.subscribe(data => {
        if (data) {

          if (!data['loginResolver']) {
            this.router.navigate(['/company-management']);
          }
          else {
            this.router.navigate(['']);
          }
        }
      });

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });



    //receive data from auth service to log in component using shared service
    this.dataSharingService.getSharedData().subscribe((value) => {
      if (value) {
        console.log(value)
        this.authorized = value.unAuthorized;
        this.showSpinner = value.showSpinner
        this.cdr.detectChanges();

      }
    if(this.authorized)
    {
      setTimeout(() => {
        this.authorized = false;
      }, 5000);
    }

      // Now you can work with the emitted value (e.g., set it to a component property)
    });




  }

  onShowPasswordClick() {

    if (this.password === 'password')
    {
      this.passwordShowHide = "login_text_as_password"
      this.password = 'text';
      this.show = true;
    }
    else
    {
      this.passwordShowHide = ""
      this.password = 'password';
      this.show = false;

    }
    this.cdr.detectChanges();
  }



// create an internal subject and an observable to keep track

  get formControl() {
    return this.loginForm.controls;
  }



  loginFormData( ) {
    this.showErrors = true;
    // Handle form submission logic
    this.submitted = true;
    let username: string = this.loginForm.get('username')?.value;
    let password: string = this.loginForm.get('password')?.value;

    if (this.loginForm.valid) {
      this.loginForm.valueChanges.subscribe((values) => {
      });

      let URL = this.baseURL + 'api/login';

      let body = {
        "email":username.trim(),
        "password": password.trim(),
        "device": "web",
        "ip": this.ipAddress,
        "system_info": {
          "os": this.windowOS
        },
        "device_info": {
          "browser":this.browserName,
          "version": this.browserVersion
        }
      };
      let headers =  new HttpHeaders({
        "Access-Control-Allow-Headers": 'accept',
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });
      let method = 'POST'
      this.showSpinner = true;

      this.authService.Login(URL, username, password, body, headers,method);
      }
  }


  detectBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

  detectBrowserVersion(){
    var userAgent = navigator.userAgent, tem,
      matchTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if(/trident/i.test(matchTest[1])){
      tem =  /\brv[ :]+(\d+)/g.exec(userAgent) || [];
      return 'IE '+(tem[1] || '');
    }
    if(matchTest[1]=== 'Chrome'){
      tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
      if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    matchTest= matchTest[2]? [matchTest[1], matchTest[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= userAgent.match(/version\/(\d+)/i))!= null) matchTest.splice(1, 1, tem[1]);
    return matchTest.join(' ');
  }






}

