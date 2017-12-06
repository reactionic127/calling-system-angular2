import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector   : 'errors-modal',
  templateUrl: './errors.modal.html'
})
export class ModalErrorsComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;
  @Input() errors: Array<any>;
  @Input() nrImported: number;
  @Input() nrFailed: number;
  @Output() callback: EventEmitter<any> = new EventEmitter();

  show(): void {
    this.modal.show();
  }

  hide(): void {
    this.modal.hide();
  }

  emitCallback(event: any = {}): void {
    this.callback.emit(event);
    this.hide();
  }

  isString(val: any): boolean {
    return typeof val === 'string';
  }
}
