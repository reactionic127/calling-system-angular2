import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector   : 'confirmation-modal',
  templateUrl: './confirmation.modal.html'
})

export class ModalConfirmationComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;
  @Input() message: string;
  @Output() callback: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  public show(): void {
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }

  emitCallback(event: any = {}): void {
    this.callback.emit(event);
    this.hide();
  }
}
