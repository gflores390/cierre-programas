import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
})
export class ReportesComponent {

  // Variables para controlar un estado de carga (opcional, para cuando conectes la API)
  isDownloading: boolean = false;

  constructor() {}

  descargarPorGenero() {
    console.log('Llamando a la API: Reporte por Género...');
    // Aquí harás el: this.reporteService.getPorGenero().subscribe(...)
    alert('Próximamente: Descargando PDF por Género desde la API');
  }

  descargarPorMes() {
    console.log('Llamando a la API: Reporte por Mes...');
    alert('Próximamente: Descargando PDF por Mes desde la API');
  }

  descargarGeneral() {
    console.log('Llamando a la API: Reporte General...');
    alert('Próximamente: Descargando PDF General desde la API');
  }
}