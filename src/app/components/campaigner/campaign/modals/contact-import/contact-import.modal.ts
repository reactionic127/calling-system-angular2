import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector   : 'contact-import-modal',
  templateUrl: './contact-import.modal.html'
})
export class ModalContactImportComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;
  @Output() doImport: EventEmitter<any> = new EventEmitter();
  @Output() doReset: EventEmitter<any>  = new EventEmitter();

  contactAction: string = '';
  mergeType: string     = '';
  enabled: boolean      = false;

  show(): void {
    this.modal.show();
  }

  resetImport(): void {
    this.doReset.emit();
    this.hide();
  }

  resetModalChoises(): void {
    this.contactAction = '';
    this.mergeType     = '';
    this.enabled       = false;
  }

  hide(): void {
    this.modal.hide();
    this.resetModalChoises();
  }

  emitImport(values: Array<string>): void {
    this.doImport.emit(values);
    this.hide();

    this.resetModalChoises();
  }

  checkSubmit(): void {
    this.enabled = this.contactAction === 'replace'
      || this.contactAction === 'add' || this.contactAction === 'update' ;
  }
}
