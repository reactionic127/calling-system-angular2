import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'topFiveLeaders' })
export class TopFiveLeadersPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        if (!value) return value;

        // tslint:disable-next-line:typedef
        let sortedLeaders = value.sort(function (a, b) {
            return parseFloat(b.calls) - parseFloat(a.calls);
        });
        return sortedLeaders.slice(0, 5);
    }
}
