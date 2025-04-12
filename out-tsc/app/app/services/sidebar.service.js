import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let SidebarService = class SidebarService {
    constructor() {
        this.toggled = false;
        this._hasBackgroundImage = true;
        this.menus = [
            {
                title: 'general',
                type: 'header'
            },
            {
                title: 'Dashboard',
                icon: 'fa fa-tachometer-alt',
                active: false,
                type: 'dropdown',
                badge: {
                    text: 'New ',
                    class: 'badge-warning'
                },
                submenus: [
                    {
                        title: 'Dashboard 1',
                        badge: {
                            text: 'Pro ',
                            class: 'badge-success'
                        }
                    },
                    {
                        title: 'Dashboard 2'
                    },
                    {
                        title: 'Dashboard 3'
                    }
                ]
            },
            {
                title: 'E-commerce',
                icon: 'fa fa-shopping-cart',
                active: false,
                type: 'dropdown',
                badge: {
                    text: '3',
                    class: 'badge-danger'
                },
                submenus: [
                    {
                        title: 'Products',
                    },
                    {
                        title: 'Orders'
                    },
                    {
                        title: 'Credit cart'
                    }
                ]
            },
            {
                title: 'Components',
                icon: 'far fa-gem',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'General',
                    },
                    {
                        title: 'Panels'
                    },
                    {
                        title: 'Tables'
                    },
                    {
                        title: 'Icons'
                    },
                    {
                        title: 'Forms'
                    }
                ]
            },
            {
                title: 'Charts',
                icon: 'fa fa-chart-line',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Pie chart',
                    },
                    {
                        title: 'Line chart'
                    },
                    {
                        title: 'Bar chart'
                    },
                    {
                        title: 'Histogram'
                    }
                ]
            },
            {
                title: 'Maps',
                icon: 'fa fa-globe',
                active: false,
                type: 'dropdown',
                submenus: [
                    {
                        title: 'Google maps',
                    },
                    {
                        title: 'Open street map'
                    }
                ]
            },
            {
                title: 'Extra',
                type: 'header'
            },
            {
                title: 'Documentation',
                icon: 'fa fa-book',
                active: false,
                type: 'simple',
                badge: {
                    text: 'Beta',
                    class: 'badge-primary'
                },
            },
            {
                title: 'Calendar',
                icon: 'fa fa-calendar',
                active: false,
                type: 'simple'
            },
            {
                title: 'Examples',
                icon: 'fa fa-folder',
                active: false,
                type: 'simple'
            }
        ];
    }
    toggle() {
        this.toggled = !this.toggled;
    }
    getSidebarState() {
        console.log('service getSidebarState', this.toggled);
        return this.toggled;
    }
    setSidebarState(state) {
        console.log('set sidebar service', state);
        this.toggled = state;
    }
    getMenuList() {
        return this.menus;
    }
    get hasBackgroundImage() {
        return this._hasBackgroundImage;
    }
    set hasBackgroundImage(hasBackgroundImage) {
        this._hasBackgroundImage = hasBackgroundImage;
    }
};
SidebarService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], SidebarService);
export { SidebarService };
//# sourceMappingURL=sidebar.service.js.map