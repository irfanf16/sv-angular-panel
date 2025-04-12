import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { EncryptDecryptService } from "./services/encrypt-decrypt.service";
import { NavigationStart } from "@angular/router";
let AppComponent = class AppComponent {
    constructor(authService, router, sidebarservice, cdr, activatedRoute, ngZone) {
        this.authService = authService;
        this.router = router;
        this.sidebarservice = sidebarservice;
        this.cdr = cdr;
        this.activatedRoute = activatedRoute;
        this.ngZone = ngZone;
        this.title = 'staffviz_admin_portal';
        this.countryData = null;
        this.showMenu = false;
        this.isLoginScreen = false;
        this.isLoggedIn = true;
        const localUserJson = localStorage.getItem('isUserToken');
        let decryptedToken = "";
        if (typeof localUserJson != "undefined" && localUserJson != null && localUserJson != "") {
            decryptedToken = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
            if (this.authService.CheckAuth(decryptedToken)) {
                this.authService.SetState(decryptedToken);
            }
        }
        else {
            this.authService.RemoveState();
            localStorage.removeItem('isUserToken');
        }
    }
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
        // Trigger change detection again after the view has been initialized
        this.cdr.detectChanges();
    }
    get containerClass() {
        return this.isLoginScreen == true ? 'without-margin' : 'with-margin';
    }
    Logout() {
        this.isLoggedIn = false;
        this.authService.Logout();
    }
    toggleSidebar() {
        this.isLoginScreen = !this.isLoginScreen;
        console.log('sidebar state', this.sidebarservice.getSidebarState());
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
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map