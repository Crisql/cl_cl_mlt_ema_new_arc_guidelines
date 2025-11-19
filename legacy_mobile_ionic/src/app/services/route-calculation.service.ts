import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import {IRouteHistory} from "../interfaces/i-route-history";

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class RouteCalculationService {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  /**
   * Calculate the route distance and duration
   * @param _checks The route points to calculate the distance
   * @constructor
   */
  async CalculateRoute(_checks: IRouteHistory[]): Promise<google.maps.DistanceMatrixResponse[]>
  {
    let matrixResults: google.maps.DistanceMatrixResponse[] = [];
    
    for(let i = 0; i < _checks.length-1 && _checks.length >= 2; i++)
    {
      let startPoint: google.maps.LatLngLiteral = { lat: _checks[i].Latitude, lng: _checks[i].Longitude };
      
      let endPoint: google.maps.LatLngLiteral = { lat: _checks[i+1].Latitude, lng: _checks[i+1].Longitude };
      
      matrixResults.push(await this.CalculateTwoPoints(startPoint, endPoint));
    }
    
    return matrixResults;
  }

  /**
   * Execute the route calculations process
   * @param _startPoint The start point of the route
   * @param _endPoint The end point of the route
   * @constructor
   */
  CalculateTwoPoints(_startPoint: google.maps.LatLngLiteral, _endPoint: google.maps.LatLngLiteral): Promise<google.maps.DistanceMatrixResponse>
  {
    const service = new google.maps.DistanceMatrixService();
    
    const request: google.maps.DistanceMatrixRequest = {
      origins: [_startPoint],
      destinations: [_endPoint],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    return service.getDistanceMatrix(request);
  }
}

