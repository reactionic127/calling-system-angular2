import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'create-twilio-audio-conference-modal',
  templateUrl: './create-twilio-audio-conference-modal.template.html',
})

export class CreateTwilioAudioConferenceModalComponent {

  @ViewChild(ModalDirective) modal: ModalDirective;
  @Output() onCallEnd: EventEmitter<boolean> = new EventEmitter<boolean>();

  private conferenceMembers: Array<any> = [];
  private chanelMemberCount: number;
  private chanelName: string;

  public show(chanel: any): void {
    this.chanelMemberCount = chanel.memberCount;
    this.chanelName = chanel.name;
    this.conferenceMembers = chanel.members.filter(member => {
      return member.connectionStatus === 'online';
    });
    this.modal.show();
  }

  public hide(hideModal: boolean): void {
    if (hideModal) {
      this.modal.hide();
    }
  }

  endCall(): void {
    this.onCallEnd.emit(true);
  }
}
