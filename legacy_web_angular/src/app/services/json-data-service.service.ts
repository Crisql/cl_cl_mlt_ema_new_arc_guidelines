import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ICountry, IProvinces,} from "@app/interfaces/i-direction";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class JsonDataServiceService {

  constructor(private http: HttpClient) { }

  GetJsonProvinces(): Observable<IProvinces> {
    const apiUrl = 'assets/data/Provinces.Json';
    return this.http.get<IProvinces>(apiUrl, {headers: DefineDescriptionHeader({
        OnSuccess: 'Provincias obtenidas',
        OnError: 'No se pudo obtener las provincias'
      })});
  }

  GetJsonLocations(): Observable<ICountry> {
    const apiUrl = 'assets/data/Country.Json';
    return this.http.get<ICountry>(apiUrl, {headers: DefineDescriptionHeader({
        OnSuccess: 'Paises obtenidos',
        OnError: 'No se pudo obtener los paises'
      })});
  }
}
