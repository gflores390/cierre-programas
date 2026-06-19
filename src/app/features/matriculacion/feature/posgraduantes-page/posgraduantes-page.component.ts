import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalEdicionComponent, Posgraduante } from './Modals/modal-edicion/modal-edicion.component';
import { ModalActualizarComponent } from './Modals/modal-actualizar/modal-actualizar.component';

import {
  LucideAngularModule,
  Info,
  RefreshCw,
  Pencil
} from 'lucide-angular';

@Component({
  selector: 'app-posgraduantes-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalEdicionComponent, ModalActualizarComponent],
  templateUrl: './posgraduantes-page.component.html'
})
export class PosgraduantesPageComponent implements OnInit {
  readonly Info = Info;
  readonly RefreshCw = RefreshCw;
  readonly Pencil = Pencil;

  // Estado de los modales
  modalVisible = false;
  modalActualizarVisible = false;

  // Posgraduante seleccionado para editar o actualizar
  posgraduanteSeleccionado: Posgraduante | null = null;

  // 🌟 LISTA DE DATOS ESTÁTICOS PARA PRUEBAS (Hardcoded)
  posgraduantes: Posgraduante[] = [];

  ngOnInit(): void {
    // Llenamos la lista con datos estáticos al iniciar el componente
    this.posgraduantes = [
      {
        ci: '1234567',
        nombre: 'Juan Carlos Mamani Quispe',
        celular: '71234567',
        correo: 'juan.mamani@posgradoupea.edu.bo',
        fecha: '2025-01-15'
      },
      {
        ci: '7654321',
        nombre: 'Ana María Flores Choque',
        celular: '69876543',
        correo: 'ana.flores@posgradoupea.edu.bo',
        fecha: '2025-02-20'
      },
      {
        ci: '8888888',
        nombre: 'Carlos Javier Condori Cruz',
        celular: '75554433',
        correo: 'carlos.condori@posgradoupea.edu.bo',
        fecha: '2025-03-10'
      }
    ];
  }

  // Se llama al hacer clic en el botón "Editar" de una fila
  abrirModalEditar(p: Posgraduante): void {
    console.log('click editar', p);
    this.posgraduanteSeleccionado = p;
    this.modalVisible = true;
  }

  // Se llama al hacer clic en el botón "Actualizar" de una fila
  abrirModalActualizar(p: Posgraduante): void {
    console.log('click actualizar', p);
    this.posgraduanteSeleccionado = p;
    this.modalActualizarVisible = true;
  }

  // Se llama al cerrar el modal (botón "Cerrar" o la "x")
  cerrarModal(): void {
    this.modalVisible = false;
    this.modalActualizarVisible = false;
    this.posgraduanteSeleccionado = null;
  }

  // Guarda los cambios desde el modal de edición estructural
  guardarCambios(datos: { celular: string; correo: string; ci: string; nombre: string; fecha: string }): void {
    if (!this.posgraduanteSeleccionado) return;
    
    const index = this.posgraduantes.findIndex(
      p => p.ci === this.posgraduanteSeleccionado!.ci
    );

    if (index !== -1) {
      this.posgraduantes[index] = {
        ci: datos.ci,
        nombre: datos.nombre,
        celular: datos.celular,
        correo: datos.correo,
        fecha: datos.fecha
      };
    }
    this.cerrarModal();
  }

  // Guarda los cambios rápidos del modal de actualización (celular y correo)
  guardarCambiosActualizar(datos: { celular: string; correo: string }): void {
    if (!this.posgraduanteSeleccionado) return;

    const index = this.posgraduantes.findIndex(
      p => p.ci === this.posgraduanteSeleccionado!.ci
    );

    if (index !== -1) {
      this.posgraduantes[index].correo = datos.correo;
      this.posgraduantes[index].celular = datos.celular;
    }
    this.cerrarModal();
  }
}