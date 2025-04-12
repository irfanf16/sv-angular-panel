import { __decorate } from "tslib";
import { Component } from '@angular/core';
import Swal from "sweetalert2";
// import Swal, {SweetAlertIcon} from 'sweetalert2';
let ToastMessagesComponent = class ToastMessagesComponent {
    showToast(title = '', text = '', icon = 'success', position = 'top-end') {
        let timer = (icon == 'error' ? undefined : 3000);
        Swal.fire({ toast: true, position: position, showConfirmButton: false, timerProgressBar: true, showCloseButton: true, title: title, text: text, icon: icon, timer: timer });
    }
    errorToast(title = '', text = '', icon = 'error', position = 'center') {
        let timer = (icon == 'error' ? undefined : 3000);
        Swal.fire({ position: position, showConfirmButton: false, timerProgressBar: true, showCloseButton: true, title: title, text: text, icon: icon, timer: timer });
    }
    async showConfirmationDialog(confirmBtnText = '') {
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
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
            // Perform action when cancelled
            console.log('Cancelled!');
            return false;
        }
        return false;
    }
};
ToastMessagesComponent = __decorate([
    Component({
        selector: 'app-toast-messages',
        templateUrl: './toast-messages.component.html',
        styleUrls: ['./toast-messages.component.css']
    })
], ToastMessagesComponent);
export { ToastMessagesComponent };
//# sourceMappingURL=toast-messages.component.js.map