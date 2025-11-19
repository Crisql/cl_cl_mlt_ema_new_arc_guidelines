import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourFormat'
})
export class HourFormatPipe implements PipeTransform {

  transform(_value: string, _splitChar: string = ':') {
    if (!_value) return "Todo el día";

    let hourAndMinutes: string[] = _value.split(_splitChar);

    if (hourAndMinutes.length !== 2) return _value;

    let hour_int: number = parseInt(hourAndMinutes[0]);

    let valueToReturn: string = _value + " AM";

    if (hour_int > 12) {
      valueToReturn = `${((hour_int - 12).toString())}:${hourAndMinutes[1]} PM`;
    }

    return valueToReturn;
  }

}
