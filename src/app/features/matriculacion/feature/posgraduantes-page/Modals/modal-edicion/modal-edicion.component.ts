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

  @Input() visible: boolean = false;
  @Input() posgraduante: Posgraduante | null = null;

  @Output() cerrar = new EventEmitter<void>();
  
  // Modificado el Output para que también devuelva los apellidos por separado si el padre lo requiere
  @Output() actualizar = new EventEmitter<{ 
    celular: string; 
    correo: string; 
    ci: string; 
    nombre: string; 
    apPaterno: string;
    apMaterno: string;
    fecha: string; 
  }>();

  ci: string = '';
  nombre: string = '';
  apPaterno: string = '';
  apMaterno: string = '';
  celular: string = '';
  correo: string = '';
  fecha: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['posgraduante'] && this.posgraduante) {
      this.ci = this.posgraduante.ci;
      this.celular = this.posgraduante.celular;
      this.correo = this.posgraduante.correo;
      this.fecha = this.posgraduante.fecha; 

      // LÓGICA DE SEPARACIÓN: Si el backend te manda todo en "nombre" (ej: "MARIA ELENA CORI CORONADO")
      const palabras = this.posgraduante.nombre.trim().split(/\s+/);
      
      if (palabras.length >= 3) {
        // Asumimos que las dos últimas palabras son los apellidos
        this.apMaterno = palabras.pop() || '';
        this.apPaterno = palabras.pop() || '';
        this.nombre = palabras.join(' '); // Lo que queda son los nombres (ej: "MARIA ELENA")
      } else if (palabras.length === 2) {
        this.apPaterno = palabras[1];
        this.apMaterno = '';
        this.nombre = palabras[0];
      } else {
        this.nombre = this.posgraduante.nombre;
        this.apPaterno = '';
        this.apMaterno = '';
      }
    }
  }

  onActualizar(): void {
    this.actualizar.emit({ 
      celular: this.celular, 
      correo: this.correo, 
      ci: this.ci, 
      nombre: this.nombre, 
      apPaterno: this.apPaterno,
      apMaterno: this.apMaterno,
      fecha: this.fecha 
    });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}