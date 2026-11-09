import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnaTablaPosgrado {
  campo: string;
  etiqueta: string;
  ancho?: string;
  align?: 'left' | 'center' | 'right';
  headerBg?: string; // color de fondo especial en cabecera si aplica
  esNota?: boolean;   // si es nota para evaluar si es reprobada
}

@Component({
  selector: 'app-tabla-posgrado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-posgrado.component.html',
  styleUrls: ['./tabla-posgrado.component.css']
})
export class TablaPosgradoComponent {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() columnas: ColumnaTablaPosgrado[] = [];
  @Input() datos: any[] = [];
  @Input() destacarReprobados: boolean = false;

  esReprobado(valor: any, esNota?: boolean): boolean {
    if (!this.destacarReprobados || !esNota) return false;
    const num = Number(valor);
    return !isNaN(num) && num <= 11;
  }
}
