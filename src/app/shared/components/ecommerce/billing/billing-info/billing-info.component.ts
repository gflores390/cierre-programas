import { Component } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { ButtonComponent } from '../../../ui/button/button.component';

@Component({
  selector: 'app-billing-info',
  imports: [
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './billing-info.component.html',
  host: {
    class: 'card xl:w-2/6',
  },
})
export class BillingInfoComponent {

  isOpen = false;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave ()  {
    // Handle save logic here
    console.log("Saving changes...");
    this.closeModal();
  };
}
