import {Component, NgModule} from '@angular/core';
import Swal, {SweetAlertIcon} from "sweetalert2";

// import Swal, {SweetAlertIcon} from 'sweetalert2';

@Component({
  selector: 'app-toast-messages',
  templateUrl: './toast-messages.component.html',
  styleUrls: ['./toast-messages.component.css']
})
export class ToastMessagesComponent {

   showToast(title:any='', text:any ='',icon: SweetAlertIcon = 'success', position:any = 'top-end'){
     let timer = (icon == 'error' ? undefined : 3000);
    Swal.fire({ toast: true, position: position, showConfirmButton: false, timerProgressBar: true, showCloseButton: true, title: title, text: text, icon: icon , timer: timer});
  }

  errorToast(title:any='', text:any ='',icon: SweetAlertIcon = 'error', position:any = 'center'){
     let timer = (icon == 'error' ? undefined : 3000);
    Swal.fire({  position: position, showConfirmButton: false, timerProgressBar: true, showCloseButton: true, title: title, text: text, icon: icon , timer: timer});
  }

  async showConfirmationDialog(confirmBtnText: string = ''): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      // Perform action when confirmed
      console.log('Confirmed!');
      return true;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Perform action when cancelled
      console.log('Cancelled!');
      return false;
    }
    return  false;
  }

}
