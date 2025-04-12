import { Injectable } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BehaviorSubject, distinctUntilChanged, filter, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  breadcrumbs$: Observable<any[]> = this.breadcrumbsSubject.asObservable();
  private componentNameSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  componentName$: Observable<string> = this.componentNameSubject.asObservable();
  private componentIconSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  componentIcon$: Observable<string> = this.componentIconSubject.asObservable();
  private userImageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  userImage$: Observable<string> = this.userImageSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged(),
      map(() => this.buildBreadCrumb(this.activatedRoute.root))
    ).subscribe(breadcrumbs => {
      this.breadcrumbsSubject.next(breadcrumbs);
    });
  }

  setBreadcrumbs(breadcrumbs: any[]) {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  setComponentName(componentName: string) {
    this.componentNameSubject.next(componentName);
  }

  setComponentIcon(componentIcon: string) {
    this.componentIconSubject.next(componentIcon);
  }

  setUserImage(image: string) {
    this.userImageSubject.next(image);
  }

  private buildBreadCrumb(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: any[] = []
  ): any[] {
    const label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data['breadcrumb'] : 'Home';
    const path = route.routeConfig ? route.routeConfig.path : '';

    const nextUrl = `${url}${path}/`;

    const newBreadcrumbs = [...breadcrumbs, { label: label, url: nextUrl }];

    if (route.firstChild) {
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }

    return newBreadcrumbs;
  }
}
