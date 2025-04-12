import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild, Route,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {Injectable} from "@angular/core";
import {map, Observable} from "rxjs";
import {AuthService} from "../services/auth.service";
import {EncryptDecryptService} from "../services/encrypt-decrypt.service";
import {notEmpty} from "../util";

// services/auth.guard
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  // bring in our Auth future State
  constructor(private authState: AuthService, private _router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.secure(route);
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.secure(route);
  }
  private secure(route: ActivatedRouteSnapshot | Route): Observable<boolean> {
    const localUserJson = localStorage.getItem('userPermissions');
    let decryptedPermissions = null;
    if (localUserJson != null) {
      decryptedPermissions = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
      console.log('auth guard',decryptedPermissions);
    }

    console.log(route)
    // listen to auth state
    return this.authState.stateItem$.pipe(
      map(token => {
        // if user exists let them in, else redirect to log in
        if (typeof token == "undefined" || token == null) {
          this._router.navigateByUrl('');
          return false;
        }

        // user exists
        return true;
      })
    );
  }
}
