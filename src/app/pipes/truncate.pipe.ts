import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
    transform(value: string, args: number): any {
        if (!value) return value;
        return value.length > args ? value.substr(0, args - 1) + '…' : value;
    }
}
