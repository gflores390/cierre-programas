import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalOutletComponent } from './core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ModalOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Angular Ecommerce Dashboard | TailAdmin';
}
