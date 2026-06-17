import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Posgraduante {
  ci: string;
  nombre: string;
  celular: string;
  correo: string;
  fecha: string;
}

@Component({
  selector: 'app-modal-edicion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-edicion.component.html'
})
export class ModalEdicionComponent implements OnChanges {

  // Controla si el modal se muestra u oculta
  @Input() visible: boolean = false;

  // Datos del posgraduante que se está editando
  @Input() posgraduante: Posgraduante | null = null;

  // Eventos hacia el componente padre
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<{ celular: string; correo: string }>();

  // Campos editables del formulario
  celular: string = '';
  correo: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que cambia el posgraduante recibido, refrescamos los campos
    if (changes['posgraduante'] && this.posgraduante) {
      this.celular = this.posgraduante.celular;
      this.correo = this.posgraduante.correo;
    }
  }

  onActualizar(): void {
    this.actualizar.emit({ celular: this.celular, correo: this.correo });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}