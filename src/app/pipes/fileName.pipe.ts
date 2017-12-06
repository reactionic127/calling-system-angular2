import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {
    transform(value: string): any {
        if (!value) return value;
        let n = value.lastIndexOf('/');
        return value.substring(n + 1);
    }
}
