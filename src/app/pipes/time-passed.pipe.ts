import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'getTimePassed'})
export class TimePassedPipe implements PipeTransform {
  transform(value: string): string {
    let result = moment(value, 'MMDDYYYY').fromNow();
    return result;
  }
}
