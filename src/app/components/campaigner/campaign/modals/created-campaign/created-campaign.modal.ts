import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'modal-created-campaign',
  templateUrl: './created-campaign.modal.html'
})
export class ModalCreatedCampaignComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;

  show(): void {
    this.modal.show();
  }

  hide(): void {
    this.modal.hide();
  }
}
