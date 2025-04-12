import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
let SidebarComponent = class SidebarComponent {
    constructor(sidebarservice, cdr, authService) {
        this.sidebarservice = sidebarservice;
        this.cdr = cdr;
        this.authService = authService;
        this.menus = [];
        this.changeToggleBehaviour = false;
        // @ts-ignore
        this.menus = sidebarservice.getMenuList();
    }
    ngOnInit() {
    }
    Logout() {
        this.authService.Logout();
    }
    toggleClass() {
        return this.sidebarservice.toggle();
    }
    stopBubbling(event) {
        console.log('entered');
        // event.stopPropagation(); // Prevent bubbling
        // Do something specific for this element
    }
    getSideBarState() {
        this.changeToggleBehaviour = this.sidebarservice.getSidebarState();
        // this.cdr.detectChanges();
        return this.sidebarservice.getSidebarState();
    }
    toggle(currentMenu) {
        if (currentMenu.type === 'dropdown') {
            this.menus.forEach(element => {
                if (element === currentMenu) {
                    currentMenu.active = !currentMenu.active;
                }
                else {
                    // @ts-ignore
                    element.active = false;
                }
            });
        }
    }
    getState(currentMenu) {
        if (currentMenu.active) {
            return 'down';
        }
        else {
            return 'up';
        }
    }
};
SidebarComponent = __decorate([
    Component({
        selector: 'app-sidebar',
        templateUrl: './sidebar.component.html',
        styleUrls: ['./sidebar.component.scss'],
        animations: [
            trigger('slide', [
                state('up', style({ height: 0 })),
                state('down', style({ height: '*' })),
                transition('up <=> down', animate(200))
            ])
        ]
    })
], SidebarComponent);
export { SidebarComponent };
//# sourceMappingURL=sidebar.component.js.map