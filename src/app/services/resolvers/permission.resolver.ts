import {ResolveFn, Router} from '@angular/router';
import {map} from "rxjs";
import {AuthService} from "../auth.service";
import {inject} from "@angular/core";
import {notEmpty} from "../../util";
import {EncryptDecryptService} from "../encrypt-decrypt.service";

export const permissionResolver: ResolveFn<boolean> = (route, state, router: Router = inject(Router), authService: AuthService = inject(AuthService)) => {
  const localUserJson = localStorage.getItem('userPermissions');
  let decryptedPermissions = null;
  if (localUserJson != null) {
    decryptedPermissions = JSON.parse((new EncryptDecryptService()).decrypt(localUserJson));
    console.log('Decrypted Permissions:', decryptedPermissions);
  }

  // Return the observable from the stateItem$ and handle permission checks inside
  return authService.stateItem$.pipe(
    map(user => {
      if (notEmpty(decryptedPermissions)) {
        if (decryptedPermissions.includes('*')) {
          return true;
        } else {
          console.log('Entered first step');
          if (notEmpty(route.data)) {
            console.log('Entered second step');
            const componentName = route?.data?.['id'];
            console.log('Component Name:', componentName);
            // Check if user has read permission for the module
            if (decryptedPermissions.includes(`${componentName}.read`)) {
              return true;
            } else {
              router.navigate(['/not-allowed']);  // Use the router instance, not `this.router`
              return false;
            }
          } else {
            router.navigate(['/not-allowed']);  // Use the router instance
            console.log('Entered second step else');
            return false;
          }
        }
      } else {
        router.navigate(['/not-allowed']);  // Use the router instance
        return false;
      }
    })
  );
};
