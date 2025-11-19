import { Injectable } from '@angular/core';
import {IRouteLine} from "@app/interfaces/i-route";

@Injectable({
  providedIn: 'root'
})
export class RouteCalculationService {

  constructor() { }

  async CalculateRoute(routeLines: IRouteLine[]): Promise<google.maps.DistanceMatrixResponse[]>
  {
    let matrixResults: google.maps.DistanceMatrixResponse[] = [];

    for(let i = 0; i < routeLines.length-1 && routeLines.length >= 2; i++)
    {
      let startPoint = { latitude: routeLines[i].Latitude, longitude: routeLines[i].Longitude };
      let endPoint = { latitude: routeLines[i+1].Latitude, longitude: routeLines[i+1].Longitude };

      let request: google.maps.DistanceMatrixResponse  = await this.CalculateTwoPoints(startPoint, endPoint);

      request['originLine' as keyof object] = { address: routeLines[i].Address, latitude: routeLines[i].Latitude, longitude: routeLines[i].Longitude } as never;
      request['destinationLine' as keyof object] = { address: routeLines[i+1].Address, latitude: routeLines[i+1].Latitude, longitude: routeLines[i+1].Longitude } as never;

      matrixResults.push(request);
    }

    return matrixResults;
  }

  CalculateTwoPoints(startPoint: any, endPoint: any): Promise<google.maps.DistanceMatrixResponse>
  {
    const service = new google.maps.DistanceMatrixService();
    const origin = { lat: +(startPoint.latitude), lng: +(startPoint.longitude) };
    const destination = { lat: +(endPoint.latitude), lng: +(endPoint.longitude) };

    const request: google.maps.DistanceMatrixRequest = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    return service.getDistanceMatrix(request);
  }
}
