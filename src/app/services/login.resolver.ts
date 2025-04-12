import {ResolveFn} from '@angular/router';
import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {map} from "rxjs";

export const loginResolver: ResolveFn<boolean> = (route, state, authService: AuthService = inject(AuthService)) => {
  authService.stateItem$.pipe(
    // if item exists redirect to default
    // later we will enhance this with a redirect url
    map(user => {
      return typeof user != "undefined" && user != null;
    })
  );

  return false;
};
