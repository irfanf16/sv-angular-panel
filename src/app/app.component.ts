import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {EncryptDecryptService} from "./services/encrypt-decrypt.service";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {AuthService} from "./services/auth.service";
import {SidebarService} from "./services/sidebar.service";
import {BreadcrumbService} from "./services/breadcrumb.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'staffviz_admin_portal';
  userImageUrl = '';

  fallbackImageUrl:string = 'assets/css/sprite_images/images/no-image-found.png';
  countryData = null;
  showMenu: Boolean = false;
  isLoginScreen: boolean = false;
  isLoggedIn: boolean = true;


  constructor(private encryptDecrypt : EncryptDecryptService ,private authService: AuthService, private router: Router, public sidebarservice: SidebarService, private cdr: ChangeDetectorRef, public activatedRoute: ActivatedRoute, private ngZone: NgZone) {
    const localUserJson = localStorage.getItem('isUserToken');
    let decryptedToken: string = "";
    if (typeof localUserJson != "undefined" && localUserJson != null && localUserJson != "") {
      decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson))
      if (this.authService.CheckAuth(decryptedToken)) {
        this.authService.SetState(decryptedToken);
      }
    } else {
      this.authService.RemoveState();
      localStorage.removeItem('isUserToken');
    }
  }

  @ViewChild('userImg', { static: false }) userImg!: ElementRef;
  @ViewChild('userName', { static: false }) userName!: ElementRef;
  ngOnInit() {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url == "/") {
          this.showMenu = false;
          this.cdr.detectChanges();
          this.ngZone.runOutsideAngular(() => {
            // Manually trigger change detection inside runOutsideAngular
            this.cdr.detectChanges();
          });
        }
      }
    });

  }

  ngAfterViewInit() {
    this.updateUserImage();
    // Trigger change detection again after the view has been initialized
  }
  updateUserImage(){
    const userImage = JSON.parse(this.encryptDecrypt.decrypt(localStorage.getItem('userImage')));
    console.log('userImage',userImage)
    setTimeout(()=> {
      // const user_img = this.userImg.nativeElement.src = userImage.image;
      this.userImageUrl = userImage.image;
      this.userName.nativeElement.innerText = userImage.name;
      this.cdr.detectChanges();
      console.log('element',this.userImageUrl)

    },300)
  }

  get containerClass(): string {
    return this.isLoginScreen == true ? 'without-margin' : 'with-margin';
  }


  Logout() {
    this.isLoggedIn = false;
    this.authService.Logout();

  }

  toggleSidebar() {
    this.isLoginScreen = !this.isLoginScreen;
    console.log('sidebar state',this.sidebarservice.getSidebarState())
    this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
  }

  toggleBackgroundImage() {
    this.sidebarservice.hasBackgroundImage = !this.sidebarservice.hasBackgroundImage;
  }

  getSideBarState() {
    return this.sidebarservice.getSidebarState();
  }

  hideSidebar() {
    this.sidebarservice.setSidebarState(true);
  }

}
