import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'routeCalculations'
})
export class RouteCalculationsPipe implements PipeTransform {

  transform(value: number, calcType: 'time' | 'distance'): string {

    switch (calcType)
    {
      case "time":
        return this.FormatTime(value);
      case "distance":
        return this.FormatDistance(value);
    }

  }

  FormatTime(_timeInSeconds: number): string
  {
    if(_timeInSeconds === 0) return '-';

    let timeInMinutes = Math.floor(_timeInSeconds / 60);

    if(timeInMinutes < 60)
    {
      return `${timeInMinutes} min`;
    }
    else
    {
      let totalInHours = timeInMinutes/60;
      const hour = Math.floor(totalInHours);

      const minutes = Math.floor((totalInHours - hour)*60);

      let hourSuffix = hour === 1 ? 'hr' : 'hrs';

      return `${hour} ${hourSuffix} y ${minutes} min`;
    }
  }

  FormatDistance(_distanceInMeters: number): string
  {
    if(_distanceInMeters === 0) return '-';

    if(_distanceInMeters < 1000)
    {
      return `${_distanceInMeters} mts`;
    }
    else
    {
      let distanceInKm = _distanceInMeters / 1000;
      let kms = Math.floor(distanceInKm);
      let mts = (_distanceInMeters - (kms * 1000));

      return `${kms} km y ${mts} mts`;
    }
  }

}
