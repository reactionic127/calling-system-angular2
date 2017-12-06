import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

import { CommunicationCenterService } from '../../../../../services';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';


@Component({
  selector: 'create-direct-message-channel-modal',
  // styleUrls: ['./create-direct-message-channel-modal.css'],
  templateUrl: './create-direct-message-channel-modal.template.html',
  providers: [],
})
export class CreateDirectMessageChannelModalComponent {

  @ViewChild(ModalDirective) modal: ModalDirective;

  @Output() channelCreatedEvent: EventEmitter<any> = new EventEmitter();

  currentCampaignChannel: any = null;
  allCampaignChannelUsers: Array<any> = null;

  selectedCampaignUsersForDirrectMessage: any = {};
  selectedCampaignUsersForDirrectMessageCount: number = 0;

  constructor(private communicationCenterService: CommunicationCenterService,
              private toastr: ToastsManager,
              private logger: Logger) {
  }

  ngOnInit(): void {
  }

  public show(): void {
    this.resetData();
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }

  public resetData(): void {
    this.selectedCampaignUsersForDirrectMessage = {};
    this.selectedCampaignUsersForDirrectMessageCount = 0;
  }

  public setCurrentCampaignChannel(campaignChannel: any): void {
    this.currentCampaignChannel = campaignChannel;
    this.allCampaignChannelUsers = this.currentCampaignChannel.members;
  }

  public selectUserOfCampaignChannel(campaignChannelUser: any): void {
    if (this.selectedCampaignUsersForDirrectMessage[campaignChannelUser.userId]) {
      delete this.selectedCampaignUsersForDirrectMessage[campaignChannelUser.userId];
      this.selectedCampaignUsersForDirrectMessageCount -= 1;
    } else {
      this.selectedCampaignUsersForDirrectMessage[campaignChannelUser.userId] = campaignChannelUser;
      this.selectedCampaignUsersForDirrectMessageCount += 1;
    }
    this.logger.info('this.selectedCampaignUsersForDirrectMessage: ', this.selectedCampaignUsersForDirrectMessage);
  }

  public createDirectMessageChannel(): void {
    if (!this.countSelectedCampaignUsersForDirrectMessage()) {
      this.toastr.error('No User Selected');
      return;
    }

    let selectedUsersIds: Array<string> = [];
    for (let userId in this.selectedCampaignUsersForDirrectMessage) {
      if (this.selectedCampaignUsersForDirrectMessage.hasOwnProperty(userId)) {
        selectedUsersIds.push(userId);
      }
    }

    this.communicationCenterService.createDirectMessageTextChannel(selectedUsersIds)
      .then((newChannelData) => {
        this.channelCreatedEvent.emit(newChannelData);
      })
      .catch((error) => {
        this.toastr.error(error);
      });
  }

  private countSelectedCampaignUsersForDirrectMessage(): number {
    let count = 0;
    for (let userId in this.selectedCampaignUsersForDirrectMessage) {
      if (this.selectedCampaignUsersForDirrectMessage.hasOwnProperty(userId)) {
        count += 1;
      }
    }
    return count;
  }
}
