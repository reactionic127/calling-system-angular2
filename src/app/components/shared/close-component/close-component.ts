import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector   : 'close-component',
  templateUrl: './close-component.html'
})

/**
 * this component is responsible to display a confirmation modal if there are changes in parent component
 * then it will emit proper event according to user's choice
 *
 * accepts as Input:
 * - "parentChanges" - is a flag that tells the component if there are any changes in parent component
 *
 * emit events as Outputs:
 * - "save" - event emitted when there are changes in parent component and the user wants to save changes
 * - "discard" - event emitted when the user doesn't want to save changes or he wants simply to close
 */
export class CloseComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;

  @Input() parentChanges: boolean;

  @Output() save: EventEmitter<any>    = new EventEmitter();
  @Output() discard: EventEmitter<any> = new EventEmitter();

  possibleActions: any = {
    save   : 'save',
    discard: 'discard'
  };

  constructor() {
  }

  close(): void {
    if (this.parentChanges) {
      this.modal.show();
    } else {
      this.discard.emit(true);
    }
  }

  sendResponse(action: string): void {
    if (action === this.possibleActions.save) {
      this.save.emit(true);
    } else if (action === this.possibleActions.discard) {
      this.discard.emit(true);
    }

    this.modal.hide();
  }
}
