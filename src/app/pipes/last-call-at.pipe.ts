import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastCallAt'
})
export class LastCallaAtPipe implements PipeTransform {

  transform(value: any, args: string[]): any {

    let keys = [];
    let last_call_at: any = '';

    for (let key in value) {
        if (last_call_at < value[key].calledAt || last_call_at === '') {
            last_call_at = value[key].calledAt;
        }
    }
    keys.push({calledAt: last_call_at});

    return keys;
  }
}
