import { __decorate } from "tslib";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
// services/auth.guard
let AuthGuard = class AuthGuard {
    // bring in our Auth future State
    constructor(authState, _router) {
        this.authState = authState;
        this._router = _router;
    }
    canActivate(route, state) {
        return this.secure(route);
    }
    canActivateChild(route, state) {
        return this.secure(route);
    }
    secure(route) {
        // listen to auth state
        return this.authState.stateItem$.pipe(map(token => {
            // if user exists let them in, else redirect to log in
            if (typeof token == "undefined" || token == null) {
                this._router.navigateByUrl('');
                return false;
            }
            // user exists
            return true;
        }));
    }
};
AuthGuard = __decorate([
    Injectable({ providedIn: 'root' })
], AuthGuard);
export { AuthGuard };
//# sourceMappingURL=authorize.guard.js.map