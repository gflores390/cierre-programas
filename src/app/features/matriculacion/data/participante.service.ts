// src/app/features/matriculacion/data/participantes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { APIResponseParticipantes } from '../models/matricula.model';

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  private apiUrl = `${environment.urlparticipantes}/participantes`;

  constructor(private http: HttpClient) {}

  getParticipantes(
    idPrograma: number | string,
    pagina = 1,
    porPagina = 10,
  ): Observable<APIResponseParticipantes> {
    return this.http.get<APIResponseParticipantes>(`${this.apiUrl}/programa/${idPrograma}`, {
      params: { pagina, porPagina },
    });
  }
}
  
