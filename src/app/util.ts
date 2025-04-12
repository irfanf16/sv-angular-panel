import {DatePipe, formatDate} from "@angular/common";
import {EncryptDecryptService} from "./services/encrypt-decrypt.service";

export function notEmpty(value: any): boolean {
  if (value === undefined || value === null || String(value) === '') {
    return false;
  }

  if(typeof value === 'number'){
    return !isNaN(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return false;
}

export function formatUnixTimestampToDate(unixTimestamp: number | null | undefined, use12HourFormat: boolean = false): string{
  if(unixTimestamp === undefined || unixTimestamp === null)
    return '';

    // Convert the Unix timestamp (in seconds) to milliseconds
    const date = new Date(unixTimestamp * 1000);

    // Determine the time format based on the use12HourFormat flag
    const timeFormat = use12HourFormat ? 'hh:mm:ss a' : 'HH:mm:ss';

    // Format the date using the formatDate function from Angular
    // The format includes both date and time
    return formatDate(date, `yyyy-MM-dd ${timeFormat}`, 'en-US');

}

export function formatTimestampToMySQL(timestamp: string): string | null {
  const datePipe = new DatePipe('en-US');
  return datePipe.transform(timestamp, 'yyyy-MM-dd HH:mm:ss');
}
export function formatTimestampToYear(timestamp: string): string | null {
  const datePipe: DatePipe = new DatePipe('en-US');
  return datePipe.transform(timestamp, 'yyyy');
}

export function checkPermission(module_name: string, permission: string): boolean {
  const localUserJson = localStorage.getItem('userPermissions');
  let decryptedPermissions = null;

  if (localUserJson) {
    decryptedPermissions = JSON.parse(new EncryptDecryptService().decrypt(localUserJson));
  }
  // console.log('decryptedPermissions', decryptedPermissions)

  if (notEmpty(decryptedPermissions)) {
    // Check for wildcard permission
    if (decryptedPermissions.includes('*')) {
      return true;
    }

    // Check if the permission for the specific module exists
    if (notEmpty(module_name)) {
      return !!decryptedPermissions.includes(`${module_name}.${permission}`);
    }
  }

  return false;
}

