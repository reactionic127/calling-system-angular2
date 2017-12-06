import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { CampaignCall } from '../../../../../models';

@Component({
  selector: 'modal-call-note',
  templateUrl: './call-note.modal.html'
})
export class ModalCallNoteComponent {
  @ViewChild('callNoteModal') modal: ModalDirective;

  call: CampaignCall;
  userName: String = '';

  public show(call: CampaignCall, user: any): void {
    this.call = call;
    this.userName = user.fullName;
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }
}
