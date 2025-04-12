import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarService } from '../../../services/sidebar.service';
import {AuthService} from "../../../services/auth.service";
import {modules} from "../../project_resources/modules";
import {checkPermission, notEmpty} from "../../../util";

@Component({
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
export class SidebarComponent implements OnInit {
  menus = [];
  changeToggleBehaviour: boolean = false;
  constructor(public sidebarservice: SidebarService, private cdr: ChangeDetectorRef, private authService: AuthService) {
    // @ts-ignore
    this.menus = sidebarservice.getMenuList();
   }

  ngOnInit() {
  }

  Logout() {
    this.authService.Logout();

  }
  toggleClass(){
    return this.sidebarservice.toggle();
  }

  stopBubbling(event:any) {
    console.log('entered')
   // event.stopPropagation(); // Prevent bubbling
    // Do something specific for this element
  }
  getSideBarState() {
    this.changeToggleBehaviour = this.sidebarservice.getSidebarState();
    // this.cdr.detectChanges();
    return this.sidebarservice.getSidebarState();
  }

  toggle(currentMenu:any) {
    if (currentMenu.type === 'dropdown') {
      this.menus.forEach(element => {
        if (element === currentMenu) {
          currentMenu.active = !currentMenu.active;
        } else {
          // @ts-ignore
          element.active = false;
        }
      });
    }
  }

  getState(currentMenu:any) {

    if (currentMenu.active) {
      return 'down';
    } else {
      return 'up';
    }
  }


  protected readonly modules = modules;
  protected readonly notEmpty = notEmpty;
  protected readonly checkPermission = checkPermission;
}
