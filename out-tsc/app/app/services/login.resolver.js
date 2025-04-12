import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { map } from "rxjs";
export const loginResolver = (route, state, authService = inject(AuthService)) => {
    authService.stateItem$.pipe(
    // if item exists redirect to default
    // later we will enhance this with a redirect url
    map(user => {
        console.log('user', user);
        if (typeof user != "undefined" && user != null) {
            console.log('userexistedinstate');
            return true;
        }
        else {
            console.log('not existed');
            return false;
        }
    }));
    return false;
};
//# sourceMappingURL=login.resolver.js.map