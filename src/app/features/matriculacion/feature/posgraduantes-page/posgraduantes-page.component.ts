import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalEdicionComponent, Posgraduante } from './Modals/modal-edicion/modal-edicion.component';

import {
  LucideAngularModule,
  Info,
  RefreshCw,
  Pencil
} from 'lucide-angular';

@Component({
  selector: 'app-posgraduantes-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalEdicionComponent],
  templateUrl: './posgraduantes-page.component.html'
})
export class PosgraduantesPageComponent {

  // Íconos para el HTML
  readonly Info = Info;
  readonly RefreshCw = RefreshCw;
  readonly Pencil = Pencil;

  // Estado del modal de edición
  modalVisible = false;
  posgraduanteSeleccionado: Posgraduante | null = null;

  posgraduantes: Posgraduante[] = [
    {
      ci: '5827351',
      nombre: 'NEIDA ROJAS JURADO',
      celular: '71341112',
      correo: 'neidarojas@gmail.com',
      fecha: '05 de sep, 1981'
    },
    {
      ci: '8399325 LP',
      nombre: 'HECTOR ALEJANDRO GOMEZ CARI',
      celular: '67150273',
      correo: 'alejandrogomezyjj@hotmail.com',
      fecha: '23 de jun, 1996'
    },
    {
      ci: '83663316 LP',
      nombre: 'DANIEL RODRIGO BALTAZAR CHAVEZ',
      celular: '71206820',
      correo: 'danielbaltazarch@hotmail.com',
      fecha: '31 de jul, 2003'
    }
  ];

  // Se llama al hacer clic en el botón "Editar" de una fila
  abrirModalEditar(p: Posgraduante): void {
    console.log('click editar', p);
    this.posgraduanteSeleccionado = p;
    this.modalVisible = true;
  }

  // Se llama al cerrar el modal (botón "Cerrar" o la "x")
  cerrarModal(): void {
    this.modalVisible = false;
    this.posgraduanteSeleccionado = null;
  }

  // Se llama cuando el modal emite el evento "actualizar"
  guardarCambios(datos: { celular: string; correo: string }): void {
    if (!this.posgraduanteSeleccionado) return;

    const index = this.posgraduantes.findIndex(
      p => p.ci === this.posgraduanteSeleccionado!.ci
    );
    if (index !== -1) {
      this.posgraduantes[index].celular = datos.celular;
      this.posgraduantes[index].correo = datos.correo;
    }

    this.cerrarModal();
  }
}