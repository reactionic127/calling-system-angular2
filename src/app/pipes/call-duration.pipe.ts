import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatTime' })
export class CallDurationPipe implements PipeTransform {
    transform(value: number, args: string[]): any {
        if (!value) return '00:00';

        value = Number(value);
        let h = Math.floor(value / 3600);
        let m = Math.floor(value % 3600 / 60);
        let s = Math.floor(value % 3600 % 60);

        if (h > 0) {
            return ((h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
        } else {
            return ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);

        }
    }
}

