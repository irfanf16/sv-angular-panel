import {ChangeDetectorRef, Component} from '@angular/core';
import {BreadcrumbService} from "../../services/breadcrumb.service";

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent {
  breadcrumbs: any[] = [];
  componentName: string = '';
  componentIcon: string = '';
  // userImage: string = '';
  componentIconFlag: boolean = true;

  constructor(private breadcrumbService: BreadcrumbService, private cdr: ChangeDetectorRef) {}
  ngOnInit(){
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
      this.cdr.detectChanges();
    });

    this.breadcrumbService.componentName$.subscribe(componentName => {
      this.componentName = componentName;
      this.cdr.detectChanges();
    });

    this.breadcrumbService.componentIcon$.subscribe(componentIcon => {
      this.componentIcon = componentIcon;
      this.cdr.detectChanges();
    });


  }

}
