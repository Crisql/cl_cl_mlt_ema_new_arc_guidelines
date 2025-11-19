import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseList'
})
export class ReverseListPipe implements PipeTransform {

  transform(value) {
    return value.slice().reverse();
  }

}
