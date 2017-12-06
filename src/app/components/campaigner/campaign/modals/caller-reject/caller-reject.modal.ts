import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector   : 'caller-reject-modal',
  styleUrls  : ['./caller-reject.modal.scss'],
  templateUrl: './caller-reject.modal.html'
})

export class ModalRejectCallerComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;

  @Input() action: string;
  @Output() doReject: EventEmitter<any> = new EventEmitter();

  @ViewChild('other') other: any;

  public show(): void {
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }

  reject(reason: string, other: string): void {
    this.doReject.emit({removalReason: reason, removalOtherReason: other});
    this.hide();
  }
}
