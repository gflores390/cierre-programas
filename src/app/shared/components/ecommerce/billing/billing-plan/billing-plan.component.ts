import { Component } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';

@Component({
  selector: 'app-billing-plan',
  imports: [
    ButtonComponent,
  ],
  templateUrl: './billing-plan.component.html',
  host:{
    class:'card xl:w-4/6'
  }
})
export class BillingPlanComponent {

}
