import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class JsonService {
  constructor(private http: HttpClient) {}

  getJSONProvinces() {
    const localUri = "./assets/json/Provinces.json";
    return this.http.get(localUri);
  }

  getJSONPlaces(): Observable<any> {
    const localUri = "./assets/json/Places.json";
    return this.http.get(localUri);
  }

  getJSONYears(): Observable<any> {
    const localUri = "./assets/json/Years.json";
    return this.http.get(localUri);
  }
}
