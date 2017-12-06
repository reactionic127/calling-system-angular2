import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {
  transform(str: string, find: any, replacement: any): any {
    if (!str) return str;
    return str.replace(find, replacement);
  }
}
